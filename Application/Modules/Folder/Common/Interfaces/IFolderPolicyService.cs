using System.Threading.Tasks;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;

public interface IFolderPolicyService
{
    Task<Result> ValidateStoragePolicy(long fileSize);
}
