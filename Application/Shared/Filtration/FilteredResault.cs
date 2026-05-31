namespace SystemLoaders.Filtration;

public abstract class FilteredResult<TItem>
{
    public virtual long Total { get; set; }
    public IReadOnlyCollection<TItem> Items { get; set; } = Array.Empty<TItem>();
}