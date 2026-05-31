namespace Novologs.Application.Common.Strings;

public static class ErrorCodes
{
    public static class General
    {
        public const string Unhandled = "ERR_UNHANDLED";
        public const string NotFound = "ERR_NOT_FOUND";  
    }

    public static class Validation
    {
        public const string General = "ERR_VALIDATION";  
        public const string CompanyNameUnique = "ERR_COMPANY_NAME_UNIQUE";
        public const string UsernameUnique = "ERR_USERNAME_UNIQUE";

        public const string PasswordMismatch = "ERR_PASSWORD_MISMATCH";

        public const string CodeUnique = "ERR_CODE_NOT_UNIQUE"; 
    }

    public static class BusinessLogic
    {
        public const string Conflict = "ERR_CONFLICT";   
    }

    public static class Tenant
    {
        public const string InitFails = "ERR_TENANT_INIT";
    }
}