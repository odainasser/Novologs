using System.Text.Json.Serialization;
using FluentValidation.Results;

namespace Novologs.Application.Common.Models;

public class ErrorItem
{
    public ErrorItem(string argCode, string argDescription)
    {
        Code = argCode;
        Description = argDescription;
    }

    public ErrorItem()
    {
    }

    public string Code { get; set; } = default!;
    public string Description { get; set; } = default!;
}

public class Result
{
    protected Result(bool succeeded, IEnumerable<ErrorItem> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToList();
    }

    public Result()
    {
        Errors = new List<ErrorItem>();
    }

    public bool Succeeded { get; init; }
    public object? SuccessStatus { get; set; }
    public List<ErrorItem> Errors { get; init; } = new();

    public static Result Success() => new(true, Array.Empty<ErrorItem>());

    public static Result Failure(IEnumerable<ErrorItem> errors) => new(false, errors);

    public static Result Failure(string argCode, string argDescription) =>
        new(false, new[] { new ErrorItem(argCode, argDescription) });

    public static Result Success(object status) =>
        new(true, Array.Empty<ErrorItem>()) { SuccessStatus = status };
}

public class Result<T> : Result
{
    internal Result(bool succeeded, IEnumerable<ErrorItem> errors) : base(succeeded, errors)
    {
    }

    [JsonConstructor]
    public Result(bool succeeded, List<ErrorItem> errors, T? successStatus) : base(succeeded, errors)
    {
        SuccessStatus = successStatus;
    }

    public new T? SuccessStatus { get; set; }

    public static Result<T> Success(T status) =>
        new(true, Array.Empty<ErrorItem>()) { SuccessStatus = status };

    public static new Result<T> Failure(IEnumerable<ErrorItem> errors) => new(false, errors);

    public static new Result<T> Failure(string argCode, string argDescription) =>
        new(false, new[] { new ErrorItem(argCode, argDescription) });

    public static Result<T> Failure(IEnumerable<ValidationFailure> veErrors)
    {
        var errors = veErrors.Select(ve => new ErrorItem(ve.ErrorCode, ve.ErrorMessage));
        return new Result<T>(false, errors);
    }

    public static Result<T> Failure(IDictionary<string, string[]> veErrors)
    {
        var errors = veErrors.SelectMany(kvp => kvp.Value.Select(e => new ErrorItem(kvp.Key, e)));
        return new Result<T>(false, errors);
    }
}
