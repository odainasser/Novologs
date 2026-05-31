using System.Text.Json;
using System.Text.Json.Serialization;

namespace SystemLoaders.Common.JsonConverters;

public class NullableGuidConverter : JsonConverter<Guid?>
{
    public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType == JsonTokenType.String)
        {
            var stringValue = reader.GetString();
            
            // Handle empty string as null
            if (string.IsNullOrWhiteSpace(stringValue))
                return null;

            // Try parse the GUID
            if (Guid.TryParse(stringValue, out var guid))
            {
                // Convert Guid.Empty to null
                return guid == Guid.Empty ? null : guid;
            }
        }

        throw new JsonException($"Unable to convert to Guid?");
    }

    public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value);
        else
            writer.WriteNullValue();
    }
}
