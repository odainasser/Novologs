using System.Linq.Expressions;

namespace SystemLoaders.Filtration;

public static partial class IQueryableSortExtensions
{
    public static IQueryable<T> ApplySorting<T>(this IQueryable<T> query, SortFilter? sortFilter)
    {
        if (sortFilter is null || string.IsNullOrWhiteSpace(sortFilter.FieldName))
        {
            return query; // No sorting if the filter is null or field name is not provided
        }

        // Apply the main sort
        query = ApplySortingInternal(query, sortFilter);

        // Apply sub-sorting if any

        return query;
    }

    private static IQueryable<T> ApplySortingInternal<T>(IQueryable<T> query, SortFilter sortFilter)
    {
        var parameter = Expression.Parameter(typeof(T), "x");

        var propertyInfo = typeof(T).GetProperty(sortFilter.FieldName,
            System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        if (propertyInfo is null)
            return query; // Skip sorting if the property doesn't exist

        var property = Expression.Property(parameter, propertyInfo);
        var lambda = Expression.Lambda(property, parameter);

        string methodName = sortFilter.SortDirection == SortDirection.asc
            ? "OrderBy"
            : "OrderByDescending";

        var method = typeof(Queryable).GetMethods()
            .Where(m => m.Name == methodName && m.GetParameters().Length == 2)
            .Single()
            .MakeGenericMethod(typeof(T), property.Type);

        var filteredQuery =
            (IQueryable<T>)(method.Invoke(null, new object[] { query, lambda }) ?? new List<T>().AsQueryable());

        if (sortFilter.SubSort is not null && sortFilter.SubSort.Any())
        {
            foreach (var subSort in sortFilter.SubSort)
            {
                filteredQuery = ApplySortingInternal(filteredQuery, subSort);
            }
        }

        return filteredQuery;
    }
}