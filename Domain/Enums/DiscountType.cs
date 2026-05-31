using System.Text.Json.Serialization;

namespace Novologs.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DiscountType
{
    FixedAmount = 1,
    Percentage = 0
}
