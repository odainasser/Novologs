using System.Net.Mime;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;

namespace Novologs.Api.Utiles;

public class InlineOrAttachmentFileResult : IResult
{
    private readonly Stream _stream;
    private readonly string _contentType;
    private readonly string _fileName;
    private readonly bool _enableRange;

    public InlineOrAttachmentFileResult(Stream stream, string contentType, string fileName, bool enableRange)
    {
        _stream = stream;
        _contentType = contentType;
        _fileName = fileName;
        _enableRange = enableRange;
    }

    public async Task ExecuteAsync(HttpContext httpContext)
    {
        var response = httpContext.Response;

        response.ContentType = _contentType;

        // pick inline or attachment
        var disposition = new ContentDispositionHeaderValue(IsInlineType(_contentType) ? "inline" : "attachment");
        disposition.SetHttpFileName(_fileName);  // nice encoding support
        response.Headers[HeaderNames.ContentDisposition] = disposition.ToString(); 
        
        if (_enableRange)
        {
            var fileLength = _stream.Length;
            response.Headers[HeaderNames.AcceptRanges] =  "bytes";
            response.Headers[HeaderNames.ContentLength] =fileLength.ToString();

            if (httpContext.Request.Headers.ContainsKey(HeaderNames.Range))
            {
                var rangeHeader = RangeHeaderValue.Parse(httpContext.Request.Headers[HeaderNames.Range].ToString());
                if (rangeHeader.Ranges.Any())
                {
                    var range = rangeHeader.Ranges.First();
                    var start = range.From ?? 0;
                    var end = range.To ?? (fileLength - 1);
                    if (end >= fileLength)
                    {
                        end = fileLength - 1;
                    }
                    var length = end - start + 1;

                    response.StatusCode = StatusCodes.Status206PartialContent;
                    response.Headers[HeaderNames.ContentRange] = new ContentRangeHeaderValue(start, end, fileLength).ToString();
                    response.Headers[HeaderNames.ContentLength] = length.ToString();

                    _stream.Seek(start, SeekOrigin.Begin);
                    await _stream.CopyToAsync(response.Body, (int)length, httpContext.RequestAborted);
                    return;
                }
            }
        }

        await _stream.CopyToAsync(response.Body, httpContext.RequestAborted);

    }

    private static bool IsInlineType(string contentType)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) return true;
        if (contentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase)) return true;
        if (contentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)) return true;
        if (contentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase)) return true;
        if (contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }
    
    

    public static string GetContentType(string path)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(path, out var contentType))
        {
            contentType = MediaTypeNames.Application.Octet; 
        }

        return contentType;
    }
}
