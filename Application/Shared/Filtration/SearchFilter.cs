using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SystemLoaders.Filtration;

[JsonConverter(typeof(SearchFilterConverter))]
public class SearchFilter
{
    [Description("Field to filter on (e.g. \"FirstName\", \"Email\").")]
    public string FieldName { get; set; } = null!;

    [Description("Value to compare against the field.")]
    public JsonElement? FieldValue { get; set; }

    [Description("Comparison operator (Equals, Contains, etc.).")]
    public Operator Operator { get; set; } = Operator.Equals;

    [Description("Logic to combine with sibling filters (And / Or).")]
    public LogicOperator LogicOperator { get; set; } = LogicOperator.And;

    [Description("Optional nested filters for grouping multiple conditions.")]
    public List<SearchFilter> SubFilters { get; set; } = new();
}

/// <summary>
/// Custom converter for <see cref="SearchFilter"/> that clones <see cref="JsonElement"/> values
/// so nested instances inside <see cref="SearchFilter.SubFilters"/> deserialize correctly.
/// </summary>
public class SearchFilterConverter : JsonConverter<SearchFilter>
{
    public override SearchFilter? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Parse the entire object into a JsonDocument first so every JsonElement is
        // backed by its own memory and survives beyond the original reader position.
        using var doc = JsonDocument.ParseValue(ref reader);
        var root = doc.RootElement;

        // Guard: return null for null or non-object JSON values (e.g. Swagger UI placeholder "string").
        if (root.ValueKind == JsonValueKind.Null || root.ValueKind != JsonValueKind.Object)
            return null;

        var filter = new SearchFilter();

        if (TryGetProperty(root, "fieldName", out var fieldName))
            filter.FieldName = fieldName.GetString()!;

        if (TryGetProperty(root, "fieldValue", out var fieldValue) && fieldValue.ValueKind != JsonValueKind.Null)
            filter.FieldValue = fieldValue.Clone();

        if (TryGetProperty(root, "operator", out var op))
            filter.Operator = JsonSerializer.Deserialize<Operator>(op.GetRawText(), options);

        if (TryGetProperty(root, "logicOperator", out var logicOp))
            filter.LogicOperator = JsonSerializer.Deserialize<LogicOperator>(logicOp.GetRawText(), options);

        if (TryGetProperty(root, "subFilters", out var subFilters) && subFilters.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in subFilters.EnumerateArray())
            {
                var child = JsonSerializer.Deserialize<SearchFilter>(item.GetRawText(), options);
                if (child != null)
                    filter.SubFilters.Add(child);
            }
        }

        return filter;
    }

    public override void Write(Utf8JsonWriter writer, SearchFilter value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString("fieldName", value.FieldName);

        if (value.FieldValue.HasValue)
        {
            writer.WritePropertyName("fieldValue");
            value.FieldValue.Value.WriteTo(writer);
        }
        else
        {
            writer.WriteNull("fieldValue");
        }

        writer.WriteNumber("operator", (int)value.Operator);
        writer.WriteNumber("logicOperator", (int)value.LogicOperator);

        writer.WritePropertyName("subFilters");
        writer.WriteStartArray();
        foreach (var sub in value.SubFilters)
            JsonSerializer.Serialize(writer, sub, options);
        writer.WriteEndArray();

        writer.WriteEndObject();
    }

    private static bool TryGetProperty(JsonElement element, string camelCaseName, out JsonElement value)
    {
        // Try camelCase first, then PascalCase
        if (element.TryGetProperty(camelCaseName, out value))
            return true;
        var pascal = char.ToUpperInvariant(camelCaseName[0]) + camelCaseName[1..];
        return element.TryGetProperty(pascal, out value);
    }
}

public enum LogicOperator
{
    And = 0,
    Or = 1
}

public enum Operator
{
    Equals = 0,
    NotEquals = 1,
    Contains = 2,
    GreaterThan = 3,
    LessThan = 4,
    GreaterThanOrEqual = 5,
    LessThanOrEqual = 6
}