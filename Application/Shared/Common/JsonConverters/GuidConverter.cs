using System.Text.Json;
using System.Text.Json.Serialization;

namespace SystemLoaders.Common.JsonConverters;

/// <summary>
/// Converts an empty or whitespace JSON string to <see cref="Guid.Empty"/> instead of throwing.
/// This handles UI scenarios where a Guid field may be submitted as an empty string.
/// </summary>
public class GuidConverter : JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var s = reader.GetString();
            if (string.IsNullOrWhiteSpace(s))
                return Guid.Empty;
            if (Guid.TryParse(s, out var g))
                return g;
            return Guid.Empty;
        }

        // Fall back for non-string tokens (e.g. null literal from older clients).
        if (reader.TokenType == JsonTokenType.Null)
            return Guid.Empty;

        return reader.GetGuid();
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
        => writer.WriteStringValue(value);
}
