namespace SystemLoaders.Common.Security;

/// <summary>
/// Specifies the permission required to execute the decorated command/query.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public class AuthorizePermissionAttribute : Attribute
{
    public string Permission { get; }

    public AuthorizePermissionAttribute(string permission)
    {
        Permission = permission;
    }
}
