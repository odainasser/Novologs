using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json; // Added for JsonElement handling

namespace SystemLoaders.Filtration;

public static class IQueryableSearchExtensions
{
    public static Expression<Func<T, bool>> BuildSearchExpression<T>(SearchFilter filter, ParameterExpression parameter)
    {
        Expression memberAccess = parameter;
        Type currentType = typeof(T);

        if (string.IsNullOrWhiteSpace(filter.FieldName))
        {
            throw new InvalidOperationException(
                $"SearchFilter.FieldName must not be null or empty for type '{typeof(T).Name}'.");
        }

        // Handle nested properties
        var propertyNames = filter.FieldName.Split('.');
        foreach (var propName in propertyNames)
        {
            var propInfo = currentType
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .FirstOrDefault(p => string.Equals(p.Name, propName, StringComparison.OrdinalIgnoreCase));

            if (propInfo == null)
            {
                throw new InvalidOperationException(
                    $"No property or path named '{filter.FieldName}' found on type '{typeof(T).Name}'. Failed at '{propName}'.");
            }

            memberAccess = Expression.Property(memberAccess, propInfo);
            currentType = propInfo.PropertyType;
        }

        object? processedValue;
        Type targetType = memberAccess.Type;

        // Handle JsonElement specifically by deserializing it
        if (filter.FieldValue is JsonElement jsonElement)
        {
            try
            {
                var options = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                };
                // Add the NullableGuidConverter to handle empty strings
                options.Converters.Add(new SystemLoaders.Common.JsonConverters.NullableGuidConverter());
                processedValue = JsonSerializer.Deserialize(jsonElement.GetRawText(), targetType, options);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException(
                    $"Failed to convert JSON value '{jsonElement.GetRawText()}' to type '{targetType.FullName}' for field '{filter.FieldName}'.",
                    ex);
            }
            catch (NotSupportedException
                   ex)
            {
                throw new InvalidOperationException(
                    $"Failed to deserialize JSON value '{jsonElement.GetRawText()}' to type '{targetType.FullName}' for field '{filter.FieldName}'. Ensure the JSON value is compatible.",
                    ex);
            }
        }
        else if (filter.FieldValue != null)
        {
            try
            {
                processedValue = Convert.ChangeType(filter.FieldValue, targetType);
            }
            catch (Exception ex) when (ex is InvalidCastException || ex is FormatException || ex is OverflowException)
            {
                throw new InvalidOperationException(
                    $"Failed to convert value '{filter.FieldValue}' (Type: {filter.FieldValue.GetType().Name}) to type '{targetType.FullName}' for field '{filter.FieldName}'.",
                    ex);
            }
        }
        else
        {
            processedValue = null;
            if (filter.Operator == Operator.Contains && targetType != typeof(string))
            {
                throw new NotSupportedException(
                    $"Operator {filter.Operator} is not supported for null value on non-string type '{targetType.FullName}'.");
            }
        }

        // If processedValue is null and targetType is a non-nullable value type,
        // use the nullable version to create the constant expression
        var constantType = processedValue == null && targetType.IsValueType && Nullable.GetUnderlyingType(targetType) == null
            ? typeof(Nullable<>).MakeGenericType(targetType)
            : targetType;
        
        var constant = Expression.Constant(processedValue, constantType);

        // Ensure type compatibility for comparisons
        // If one side is nullable and the other isn't, convert the non-nullable to nullable
        Expression memberAccessForComparison = memberAccess;
        Expression constantForComparison = constant;
        
        var memberUnderlyingType = Nullable.GetUnderlyingType(memberAccess.Type);
        var constantUnderlyingType = Nullable.GetUnderlyingType(constant.Type);
        
        if (memberUnderlyingType != null && constantUnderlyingType == null)
        {
            // memberAccess is nullable (e.g., Guid?), constant is not (e.g., Guid)
            // Convert constant to nullable
            constantForComparison = Expression.Convert(constant, memberAccess.Type);
        }
        else if (memberUnderlyingType == null && constantUnderlyingType != null)
        {
            // constant is nullable, memberAccess is not
            // Convert memberAccess to nullable
            memberAccessForComparison = Expression.Convert(memberAccess, constant.Type);
        }

        Expression comparison;

        if (filter.Operator == Operator.Contains && targetType == typeof(string))
        {
            if (processedValue == null)
            {
                comparison = Expression.Constant(false);
            }
            else
            {
                var toLowerMethod = typeof(string).GetMethod("ToLower", Type.EmptyTypes);
                var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });

                if (toLowerMethod == null || containsMethod == null)
                    throw new MissingMethodException("Required string methods not found.");

                var propertyToLower = Expression.Call(memberAccess, toLowerMethod);
                var searchValueLower = processedValue.ToString()?.ToLower();
                var constantLower = Expression.Constant(searchValueLower, typeof(string));

                var propertyIsNotNull = Expression.NotEqual(memberAccess, Expression.Constant(null, targetType));
                var containsCall = Expression.Call(propertyToLower, containsMethod!, constantLower);
                comparison = Expression.AndAlso(propertyIsNotNull, containsCall);
            }
        }
        else if (processedValue == null && (filter.Operator == Operator.GreaterThan ||
                                            filter.Operator == Operator.LessThan ||
                                            filter.Operator == Operator.GreaterThanOrEqual ||
                                            filter.Operator == Operator.LessThanOrEqual ||
                                            filter.Operator == Operator.Contains))
        {
            throw new NotSupportedException(
                $"Operator {filter.Operator} is not supported for null value comparison on field '{filter.FieldName}'. Use Equals.");
        }
        else
        {
            switch (filter.Operator)
            {
                case Operator.Equals:
                    comparison = Expression.Equal(memberAccessForComparison, constantForComparison);
                    break;
                case Operator.NotEquals:
                    comparison = Expression.NotEqual(memberAccessForComparison, constantForComparison);
                    break;
                case Operator.Contains:
                    throw new NotSupportedException($"Operator {filter.Operator} is only supported for string types.");
                case Operator.GreaterThan:
                    comparison = Expression.GreaterThan(memberAccessForComparison, constantForComparison);
                    break;
                case Operator.LessThan:
                    comparison = Expression.LessThan(memberAccessForComparison, constantForComparison);
                    break;
                case Operator.GreaterThanOrEqual:
                    comparison = Expression.GreaterThanOrEqual(memberAccessForComparison, constantForComparison);
                    break;
                case Operator.LessThanOrEqual:
                    comparison = Expression.LessThanOrEqual(memberAccessForComparison, constantForComparison);
                    break;
                default:
                    throw new NotSupportedException($"Operator {filter.Operator} is not supported");
            }
        }

        if (filter.SubFilters?.Count > 0)
        {
            Expression? subExpression = null;

            foreach (var subFilter in filter.SubFilters)
            {
                var currentSubExpression = BuildSearchExpression<T>(subFilter, parameter).Body;

                if (subExpression == null)
                {
                    subExpression = currentSubExpression;
                }
                else
                {
                    subExpression = subFilter.LogicOperator == LogicOperator.Or
                        ? Expression.OrElse(subExpression, currentSubExpression)
                        : Expression.AndAlso(subExpression, currentSubExpression);
                }
            }

            if (subExpression != null)
            {
                comparison = filter.LogicOperator == LogicOperator.Or
                    ? Expression.OrElse(comparison, subExpression)
                    : Expression.AndAlso(comparison, subExpression);
            }
        }

        return Expression.Lambda<Func<T, bool>>(comparison, parameter);
    }

    private static bool IsValidFieldPath<T>(string fieldName)
    {
        Type currentType = typeof(T);
        foreach (var propName in fieldName.Split('.'))
        {
            var propInfo = currentType
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .FirstOrDefault(p => string.Equals(p.Name, propName, StringComparison.OrdinalIgnoreCase));
            if (propInfo == null)
                return false;
            currentType = propInfo.PropertyType;
        }
        return true;
    }

    private static int GetInheritanceDepth(Type t)
    {
        int depth = 0;
        while (t.BaseType != null)
        {
            depth++;
            t = t.BaseType;
        }

        return depth;
    }

    public static IQueryable<T> ApplySearch<T>(this IQueryable<T> query, List<SearchFilter>? searchFilters)
    {
        if (searchFilters == null || searchFilters.Count == 0)
        {
            return query;
        }

        // Skip filters that have no meaningful FieldName and no SubFilters (e.g. Swagger UI placeholder "string")
        searchFilters = searchFilters
            .Where(f => (!string.IsNullOrWhiteSpace(f.FieldName) && IsValidFieldPath<T>(f.FieldName)) || f.SubFilters?.Count > 0)
            .ToList();

        if (searchFilters.Count == 0)
        {
            return query;
        }

        var parameter = Expression.Parameter(typeof(T), "x");
        Expression? combinedExpression = null;

        foreach (var filter in searchFilters)
        {
            // Use the first filter's LogicOperator for combining subsequent filters if needed,
            // although typically the operator on the filter itself dictates how *it* combines with the *previous* expression.
            var logicOperator = filter.LogicOperator; // Use the logic operator from the current filter

            Expression searchExpression;
            try
            {
                searchExpression = BuildSearchExpression<T>(filter, parameter).Body;
            }
            catch (InvalidOperationException ex) when (ex.InnerException is System.Text.Json.JsonException)
            {
                // The filter value cannot be converted to the target field type (e.g. a non-GUID string
                // for a Guid? field). Skip this individual filter rather than crashing.
                continue;
            }

            if (combinedExpression == null)
            {
                combinedExpression = searchExpression;
            }
            else
            {
                combinedExpression = logicOperator == LogicOperator.Or
                    ? Expression.OrElse(combinedExpression, searchExpression)
                    : Expression.AndAlso(combinedExpression, searchExpression);
            }
        }

        if (combinedExpression != null)
        {
            var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
            return query.Where(lambda);
        }
        else
        {
            return query; // Should not happen if searchFilters is not empty, but safe fallback.
        }
    }

    // Overload for single filter remains the same conceptually
    public static IQueryable<T> ApplySearch<T>(this IQueryable<T> query, SearchFilter? searchFilter)
    {
        if (searchFilter is null)
        {
            return query;
        }

        // Skip filters with no meaningful FieldName and no SubFilters (e.g. Swagger UI placeholder "string")
        if (string.IsNullOrWhiteSpace(searchFilter.FieldName) && (searchFilter.SubFilters == null || searchFilter.SubFilters.Count == 0))
        {
            return query;
        }

        // Skip filters whose FieldName does not correspond to a real property on T (e.g. Swagger placeholder "string")
        if (!string.IsNullOrWhiteSpace(searchFilter.FieldName) && !IsValidFieldPath<T>(searchFilter.FieldName))
        {
            return query;
        }

        var parameter = Expression.Parameter(typeof(T), "x");

        Expression searchExpression;
        try
        {
            searchExpression = BuildSearchExpression<T>(searchFilter, parameter).Body;
        }
        catch (InvalidOperationException ex) when (ex.InnerException is System.Text.Json.JsonException)
        {
            // The filter value cannot be converted to the target field type (e.g. a non-GUID string
            // for a Guid? field). Skip the filter rather than returning a 500.
            return query;
        }

        var lambda = Expression.Lambda<Func<T, bool>>(searchExpression, parameter);
        return query.Where(lambda);
    }
}