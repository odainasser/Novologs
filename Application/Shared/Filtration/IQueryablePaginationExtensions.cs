using System.Linq.Expressions;
using System.Reflection;

namespace SystemLoaders.Filtration;

public static partial class IQueryablePaginationExtensions
{
    private static readonly HashSet<string> OrderingMethods =
        new() { "OrderBy", "OrderByDescending", "ThenBy", "ThenByDescending" };

    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, PaginationFilter? filter)
    {
        if (filter is null)
        {
            return query;
        }

        // EF Core requires a deterministic ordering before Skip/Take. Without one, split queries
        // throw ("'Skip' without specifying ordering ... in split query mode") and single queries
        // return rows in an arbitrary order. If the caller didn't sort, fall back to ordering by
        // the entity key so pagination is stable and never throws.
        query = EnsureOrdered(query);

        int skip = (filter.PageNumber - 1) * filter.PageSize;
        return query.Skip(skip).Take(filter.PageSize);
    }

    private static IQueryable<T> EnsureOrdered<T>(IQueryable<T> query)
    {
        if (IsOrdered(query.Expression))
            return query;

        var keyProperty = FindKeyProperty(typeof(T));
        if (keyProperty is null)
            return query; // No conventional key to order by — leave the query untouched.

        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.Property(parameter, keyProperty);
        var lambda = Expression.Lambda(property, parameter);

        var method = typeof(Queryable).GetMethods()
            .Single(m => m.Name == "OrderBy" && m.GetParameters().Length == 2)
            .MakeGenericMethod(typeof(T), property.Type);

        return (IQueryable<T>)method.Invoke(null, new object[] { query, lambda })!;
    }

    // Entities shadow the base 'long Id' with a 'new TId Id' key, so GetProperty("Id") is ambiguous.
    // Walk from the most-derived type upward and take the first declared 'Id' (the real key).
    private static PropertyInfo? FindKeyProperty(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
        {
            var prop = t.GetProperty("Id",
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            if (prop is not null)
                return prop;
        }

        return null;
    }

    // Walks only the top-level operator chain (following each call's source argument) so that an
    // OrderBy nested inside a projection/subquery is not mistaken for a top-level ordering.
    private static bool IsOrdered(Expression expression)
    {
        var current = expression;
        while (current is MethodCallExpression call && call.Method.DeclaringType == typeof(Queryable))
        {
            if (OrderingMethods.Contains(call.Method.Name))
                return true;
            if (call.Arguments.Count == 0)
                break;
            current = call.Arguments[0];
        }

        return false;
    }
}
