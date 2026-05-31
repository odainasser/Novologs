namespace SystemLoaders.Filtration;

public static partial class IQueryablePaginationExtensions
{
    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, PaginationFilter? filter)
    {
        if (filter is null)
        {
            return query;
        }

        int skip = (filter.PageNumber - 1) * filter.PageSize;
        return query.Skip(skip).Take(filter.PageSize);
    }
}