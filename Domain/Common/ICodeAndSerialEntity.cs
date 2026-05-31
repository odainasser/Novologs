using System.ComponentModel.DataAnnotations;

namespace Novologs.Domain.Common;

public interface ICodeAndSerialEntity
{
    [MaxLength(200)] public string? Code { get; set; }

    public long Serial { get; set; }
}