using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SystemLoaders.Filtration;

[JsonConverter(typeof(SortFilterConverter))]
public class SortFilter
{
    [Description("Field to sort by (e.g. \"LastName\").")]
    public string FieldName { get; set; } = null!;

    [Description("Direction: asc = 0, desc = 1.")]
    public SortDirection SortDirection { get; set; } = SortDirection.asc;

    [Description("Optional nested sorts.")]
    public List<SortFilter> SubSort { get; set; } = new();
}

/// <summary>
/// Custom converter for <see cref="SortFilter"/> that safely skips null or non-object
/// elements inside <see cref="SortFilter.SubSort"/> instead of throwing.
/// </summary>
public class SortFilterConverter : JsonConverter<SortFilter>
{
    public override SortFilter? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var doc = JsonDocument.ParseValue(ref reader);
        var root = doc.RootElement;

        if (root.ValueKind == JsonValueKind.Null || root.ValueKind != JsonValueKind.Object)
            return null;

        var filter = new SortFilter();

        if (TryGetProperty(root, "fieldName", out var fieldName))
            filter.FieldName = fieldName.GetString()!;

        if (TryGetProperty(root, "sortDirection", out var dir))
        {
            if (dir.ValueKind == JsonValueKind.Number)
                filter.SortDirection = (SortDirection)dir.GetInt32();
            else if (dir.ValueKind == JsonValueKind.String &&
                     Enum.TryParse<SortDirection>(dir.GetString(), ignoreCase: true, out var parsed))
                filter.SortDirection = parsed;
        }

        if (TryGetProperty(root, "subSort", out var subSort) && subSort.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in subSort.EnumerateArray())
            {
                var child = JsonSerializer.Deserialize<SortFilter>(item.GetRawText(), options);
                if (child != null)
                    filter.SubSort.Add(child);
            }
        }

        return filter;
    }

    public override void Write(Utf8JsonWriter writer, SortFilter value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString("fieldName", value.FieldName);
        writer.WriteNumber("sortDirection", (int)value.SortDirection);

        writer.WritePropertyName("subSort");
        writer.WriteStartArray();
        foreach (var sub in value.SubSort)
            JsonSerializer.Serialize(writer, sub, options);
        writer.WriteEndArray();

        writer.WriteEndObject();
    }

    private static bool TryGetProperty(JsonElement element, string camelCaseName, out JsonElement value)
    {
        if (element.TryGetProperty(camelCaseName, out value))
            return true;
        var pascal = char.ToUpperInvariant(camelCaseName[0]) + camelCaseName[1..];
        return element.TryGetProperty(pascal, out value);
    }
}

public enum SortDirection
{
    asc = 0,
    desc = 1
}