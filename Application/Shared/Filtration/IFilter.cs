namespace SystemLoaders.Filtration;

public interface IFilter
{
    SearchFilter? Search { get; set; }
    SortFilter? Sort { get; set; }
    PaginationFilter? Pagination { get; set; }
}