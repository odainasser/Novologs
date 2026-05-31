using System.ComponentModel;

namespace SystemLoaders.Filtration;

public class PaginationFilter
{
    [Description("Page number (1-based).")]
    public int PageNumber { get; set; } = 1;

    [Description("Number of items per page.")]
    public int PageSize { get; set; }
}