using System.Text.Json;
using FFMpegCore;
using GenerativeAI;
using GenerativeAI.Types;
using Microsoft.Extensions.Configuration;
using SystemLoaders.Services;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Services;

public class GeminiStt
{
    private readonly string _projectId;
    private readonly string _location;
    private readonly string _modelId;
    private readonly string _apiKey;
    private readonly string _openAiApiKey;
    private readonly string _openAiModelId;
    private readonly string _claudeApiKey;
    private readonly string _claudeModelId;


    public GeminiStt(IConfiguration configuration)
    {
        var geminiConfig = configuration.GetSection("Gemini");
        _projectId = geminiConfig["ProjectId"]!;
        _location = geminiConfig["Location"]!;
        _modelId = geminiConfig["ModelId"]!;
        _apiKey = geminiConfig["ApiKey"]!;
        var openAiConfig = configuration.GetSection("OpenAi");
        _openAiApiKey = openAiConfig["ApiKey"]!;
        _openAiModelId = openAiConfig["ModelId"]!;
        var claudeConfig = configuration.GetSection("Claude");
        _claudeApiKey = claudeConfig["ApiKey"]!;
        _claudeModelId = claudeConfig["ModelId"]!;
    }

    public async Task<TaskVoiceFileData?> TranscribeAudioGeminiAsync(string audioPath)
    {
        var transcript = new TaskVoiceFileData();
        var model = new GenerativeModel(_apiKey, _modelId);
        model.UseGoogleSearch = false;
        model.UseGrounding = false;
        model.UseCodeExecutionTool = false;

        var request = new GenerateContentRequest();
        var Prompt =
            $"You are a task analyzer. this audio is about a task, Give me accurate transcript of the audio." +
            $" Extract the original language of the transcript, the English translation, and the Arabic translation." +
            $" If a translation is not present, indicate that. Format the output as a JSON object with keys '" +
            $"TranscriptLanguageStr', 'TranscriptEnglishStr', 'TranscriptArabicStr' " +
            $"and 'TranscriptStr' as the original transcript.";

        request.AddText(Prompt);
        request.AddInlineFile(audioPath);
        var response = await model.GenerateContentAsync(request);

        if (!string.IsNullOrEmpty(response.Text()))
        {
            try
            {
                var rawResponse = response.Text();
                if (string.IsNullOrWhiteSpace(rawResponse) == false)
                {
                    var extractedText = ExtractAndCleanJson(rawResponse);
                    var extractedData = JsonSerializer.Deserialize<TaskVoiceFileData>(extractedText);
                    if (extractedData != null)
                    {
                        transcript.TranscriptStr = extractedData.TranscriptStr;
                        transcript.TranscriptLanguageStr = extractedData.TranscriptLanguageStr;
                        transcript.TranscriptEnglishStr = extractedData.TranscriptEnglishStr;
                        transcript.TranscriptArabicStr = extractedData.TranscriptArabicStr;
                    }
                }
            }
            catch (JsonException ex)
            {
                //TODO logging
                Console.WriteLine($"JSON deserialization error: {ex.Message}");
                Console.WriteLine($"Raw response text: {response.Text()}");
            }
            catch (Exception ex)
            {
                //TODO logging
                Console.WriteLine($"JSON deserialization error: {ex.Message}");
                Console.WriteLine($"Raw response text: {response.Text()}");
            }
        }

        return transcript;
    }

    private string ExtractAndCleanJson(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
            return string.Empty;

        try
        {
            response = response.Trim();

            if (response.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                response = response.Substring(7);
            }
            else if (response.StartsWith("```"))
            {
                response = response.Substring(3);
            }

            if (response.EndsWith("```"))
            {
                response = response.Substring(0, response.Length - 3);
            }

            response = response.Trim();

            var startIndex = response.IndexOf('{');
            var endIndex = response.LastIndexOf('}');

            if (startIndex >= 0 && endIndex > startIndex)
            {
                var jsonPart = response.Substring(startIndex, endIndex - startIndex + 1);
                return jsonPart.Trim();
            }

            if (response.StartsWith("{") && response.EndsWith("}"))
            {
                return response;
            }

            return string.Empty;
        }
        catch (Exception ex)
        {
            //TODO logging 
            Console.WriteLine($"Error extracting JSON: {ex.Message}");
            return string.Empty;
        }
    }

    public async Task<TaskVoiceFileData> GetTextTranscript(string description)
    {
        var transcript = new TaskVoiceFileData() { TranscriptStr = description };
        var model = new GenerativeModel(_apiKey, _modelId);
        model.UseGoogleSearch = false;
        model.UseGrounding = false;
        model.UseCodeExecutionTool = false;

        var request = new GenerateContentRequest();
        var Prompt =
            $"You are a task analyzer. this text is about a task, Give me accurate transcript of the text." +
            $" Extract the original language of the transcript, the English translation, and the Arabic translation." +
            $" If a translation is not present, indicate that. Format the output as a JSON object with keys '" +
            $"TranscriptLanguageStr', 'TranscriptEnglishStr', 'TranscriptArabicStr' " +
            $"and 'TranscriptStr' as the original transcript.";

        request.AddText(Prompt);
        request.AddText(description);
        var response = await model.GenerateContentAsync(request);

        if (!string.IsNullOrEmpty(response.Text()))
        {
            try
            {
                var rawResponse = response.Text();
                if (string.IsNullOrWhiteSpace(rawResponse) == false)
                {
                    var extractedText = ExtractAndCleanJson(rawResponse);
                    var extractedData = JsonSerializer.Deserialize<TaskVoiceFileData>(extractedText);
                    if (extractedData != null)
                    {
                        transcript.TranscriptLanguageStr = extractedData.TranscriptLanguageStr;
                        transcript.TranscriptEnglishStr = extractedData.TranscriptEnglishStr;
                        transcript.TranscriptArabicStr = extractedData.TranscriptArabicStr;
                    }
                }
            }
            catch (JsonException ex)
            {
                //TODO Logging
                Console.WriteLine($"JSON deserialization error: {ex.Message}");
                Console.WriteLine($"Raw response text: {response.Text()}");
            }
            catch (Exception ex)
            {
                //TODO Logging
                Console.WriteLine($"JSON deserialization error: {ex.Message}");
                Console.WriteLine($"Raw response text: {response.Text()}");
            }
        }

        return transcript;
    }
}
