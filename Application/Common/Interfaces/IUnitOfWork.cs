namespace Novologs.Application.Common.Interfaces;

public interface IUnitOfWork
{
    Task Begin();
    Task Commit();
    Task RollBack();
}
