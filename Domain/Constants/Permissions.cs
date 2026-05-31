namespace Novologs.Domain.Constants;

public static class Permissions
{
    public static class General
    {
        public const string Settings = "General.Settings";
        public const string ReadSettings = "General.ReadSettings";

        public const string ReadAuditLog = "General.ReadAuditLog";

        public const string AssignAllowViewAdminDashboard = "General.AssignAllowViewAdminDashboard";
        public const string ViewAll = "General.ViewAll";

        public const string CompanyLogo = "General.CompanyLogo";
        public const string TeamNotice = "General.TeamNotice";
        public const string Currency = "General.Currency";
        public const string ReadCurrency = "General.ReadCurrency";
        public const string Province = "General.Province";

        public const string UserSettings = "General.UserSettings";
        public const string TaskSettings = "General.TaskSettings";

        public const string ProjectSettings = "General.ProjectSettings";
        public const string MissionSettings = "General.MissionSettings";
        public const string MilestoneSettings = "General.MilestoneSettings";

        public const string ClientSettings = "General.ClientSettings";

        public const string VendorSettings = "General.VendorSettings";

        public const string CommentSettings = "General.CommentSettings";

        public const string ChatSettings = "General.ChatSettings";

        public const string Accounting = "General.GeneralAccounting";
    }

    public static class Users
    {
        public const string AddEmployee = "Users.AddEmployee";
        public const string ReadEmployee = "Users.ReadEmployee";
        public const string UpdateEmployee = "Users.UpdateEmployee";
        public const string DeleteEmployee = "Users.DeleteEmployee";
        public const string ActivateDeactivateUser = "Users.ActivateDeactivateUser";
        public const string ResendActivationEmail = "Users.ResendActivationEmail";


        public const string AddDepartment = "Users.AddDepartment";
        public const string ReadDepartment = "Users.ReadDepartment";
        public const string UpdateDepartment = "Users.UpdateDepartment";
        public const string DeleteDepartment = "Users.DeleteDepartment";

        public const string AddDesignation = "Users.AddDesignation";
        public const string ReadDesignation = "Users.ReadDesignation";
        public const string UpdateDesignation = "Users.UpdateDesignation";
        public const string DeleteDesignation = "Users.DeleteDesignation";

        public const string AddEmployeeStatus = "Users.AddEmployeeStatus";
        public const string ReadEmployeeStatus = "Users.ReadEmployeeStatus";
        public const string UpdateEmployeeStatus = "Users.UpdateEmployeeStatus";
        public const string DeleteEmployeeStatus = "Users.DeleteEmployeeStatus";

        public const string UpdateOwnEmployeeStatus = "Users.UpdateOwnEmployeeStatus";

        public const string AddNoticeBoard = "Users.AddNoticeBoard";

        public const string ReadUserStatistic = "Users.ReadUserStatistic";
    }

    public static class UserSalesGroup
    {
        public const string AssignAllowToAddUserGroup = "UserGroups.AssignAllowToAddUserGroup";
        public const string AddUserGroup = "UserGroups.AddUserGroup";
        public const string ReadUserGroup = "UserGroups.ReadUserGroup";
        public const string UpdateUserGroup = "UserGroups.UpdateUserGroup";
        public const string DeleteUserGroup = "UserGroups.DeleteUserGroup";
    }

    public static class Tasks
    {
        public const string AddTaskStatus = "Task.AddTaskStatus";
        public const string ReadTaskStatus = "Task.ReadTaskStatus";
        public const string UpdateTaskStatus = "Task.UpdateTaskStatus";
        public const string DeleteTaskStatus = "Task.DeleteTaskStatus";

        public const string AddTask = "Task.AddTask";
        public const string ReadTask = "Task.ReadTask";
        public const string UpdateTask = "Task.UpdateTask";
        public const string DeleteTask = "Task.DeleteTask";
        public const string TranscribeTask = "Task.TranscribeTask";
        public const string ViewAll = "Task.ViewAll";
        public const string AssignAllowCreateAiTask = "Task.AssignAllowCreateAiTask";
        public const string CreateAiTask = "Task.CreateAITask";
        public const string AssignDontAssignTasks = "Task.AssignDontAssignTasks";
        public const string DontAssignTasks = "Task.DontAssigneTasks";
        public const string HasTaskLevelElevator = "Task.HasTaskLevelElevator";

        public const string AddTaskCategory = "Task.AddTaskCategory";
        public const string ReadTaskCategory = "Task.ReadTaskCategory";
        public const string UpdateTaskCategory = "Task.UpdateTaskCategory";
        public const string DeleteTaskCategory = "Task.DeleteTaskCategory";

        public const string AddTaskPriority = "Task.AddTaskPriority";
        public const string ReadTaskPriority = "Task.ReadTaskPriority";
        public const string UpdateTaskPriority = "Task.UpdateTaskPriority";
        public const string DeleteTaskPriority = "Task.DeleteTaskPriority";
    }

    public static class Projects
    {
        public const string AssignAllowCreate = "Project.AssignAllowCreate";
        public const string Create = "Project.Create";
        public const string Update = "Project.Update";
        public const string Read = "Project.Read";
        public const string Delete = "Project.Delete";
        public const string AssignAllowViewAll = "Project.AssignAllowViewAll";
        public const string ViewAll = "Project.ViewAll";
        public const string ViewCost = "Project.ViewCost";

        public const string AddProjectInitiative = "Project.AddProjectInitiative";
        public const string ReadProjectInitiative = "Project.ReadProjectInitiative";
        public const string UpdateProjectInitiative = "Project.UpdateProjectInitiative";
        public const string DeleteProjectInitiative = "Project.DeleteProjectInitiative";

        public const string AddProjectGoal = "Project.AddProjectGoal";
        public const string ReadProjectGoal = "Project.ReadProjectGoal";
        public const string UpdateProjectGoal = "Project.UpdateProjectGoal";
        public const string DeleteProjectGoal = "Project.DeleteProjectGoal";
    }

    public static class Clients
    {
        public const string AssignAllowViewAllClients = "Client.AssignAllowViewAll";
        public const string ViewAllClients = "Client.ViewAll";
        public const string ViewAllLeads = "Lead.ViewAll";

        public const string AddClient = "Client.Add";
        public const string ReadClient = "Client.Read";
        public const string UpdateClient = "Client.Update";
        public const string DeleteClient = "Client.Delete";

        public const string AddLead = "Lead.Add";
        public const string ReadLead = "Lead.Read";
        public const string UpdateLead = "Lead.Update";
        public const string DeleteLead = "Lead.Delete";
        public const string ChangeLeadStatus = "Lead.ChangeLeadStatus";
        public const string ShareLead = "Lead.Share";
        public const string ManageLeadMembers = "Lead.ManageMembers";

        public const string AddLeadUpdate = "LeadUpdate.Add";
        public const string ReadLeadUpdate = "LeadUpdate.Read";
        public const string UpdateLeadUpdate = "LeadUpdate.Update";
        public const string DeleteLeadUpdate = "LeadUpdate.Delete";

        public const string AddLeadSource = "LeadSource.Add";
        public const string ReadLeadSource = "LeadSource.Read";
        public const string UpdateLeadSource = "LeadSource.Update";
        public const string DeleteLeadSource = "LeadSource.Delete";

        public const string AddLeadSaleStatus = "LeadSaleStatus.Add";
        public const string ReadLeadSaleStatus = "LeadSaleStatus.Read";
        public const string UpdateLeadSaleStatus = "LeadSaleStatus.Update";
        public const string DeleteLeadSaleStatus = "LeadSaleStatus.Delete";

        public const string AddLeadRejectionReason = "LeadRejectionReason.Add";
        public const string ReadLeadRejectionReason = "LeadRejectionReason.Read";
        public const string UpdateLeadRejectionReason = "LeadRejectionReason.Update";
        public const string DeleteLeadRejectionReason = "LeadRejectionReason.Delete";

        public const string AddSalesTarget = "SalesTarget.Add";
        public const string ReadSalesTarget = "SalesTarget.Read";
        public const string UpdateSalesTarget = "SalesTarget.Update";
        public const string DeleteSalesTarget = "SalesTarget.Delete";

        public const string AddContact = "Client.AddContact";
        public const string ReadContact = "Client.ReadContact";
        public const string UpdateContact = "Client.UpdateContact";
        public const string DeleteContact = "Client.DeleteContact";
    }

    public static class Vendors
    {
        public const string VendorViewAll = "Vendor.ViewAll";

        public const string AssignAllowViewAllContracts = "Contract.AssignAllowViewAll";
        public const string ContractViewAll = "Contract.ViewAll";

        public const string AddVendor = "Vendor.Add";
        public const string ReadVendor = "Vendor.Read";
        public const string UpdateVendor = "Vendor.Update";
        public const string DeleteVendor = "Vendor.Delete";

        public const string AddContract = "Contract.Add";
        public const string ReadContract = "Contract.Read";
        public const string UpdateContract = "Contract.Update";
        public const string DeleteContract = "Contract.Delete";

        public const string AddVendorSource = "VendorSource.Add";
        public const string ReadVendorSource = "VendorSource.Read";
        public const string UpdateVendorSource = "VendorSource.Update";
        public const string DeleteVendorSource = "VendorSource.Delete";

        public const string AddVendorContractType = "VendorContractType.Add";
        public const string ReadVendorContractType = "VendorContractType.Read";
        public const string UpdateVendorContractType = "VendorContractType.Update";
        public const string DeleteVendorContractType = "VendorContractType.Delete";

        public const string AddVendorContractStatus = "VendorContractStatus.Add";
        public const string ReadVendorContractStatus = "VendorContractStatus.Read";
        public const string UpdateVendorContractStatus = "VendorContractStatus.Update";
        public const string DeleteVendorContractStatus = "VendorContractStatus.Delete";

        public const string AddVendorContact = "Vendor.AddVendorContact";
        public const string ReadVendorContact = "Vendor.ReadVendorContact";
        public const string UpdateVendorContact = "Vendor.UpdateVendorContact";
        public const string DeleteVendorContact = "Vendor.DeleteVendorContact";
    }

    public static class Missions
    {
        public const string ViewAll = "Mission.ViewAll";
        public const string Create = "Mission.Create";
        public const string Update = "Mission.Update";
        public const string Read = "Mission.Read";
        public const string Delete = "Mission.Delete";
    }

    public static class Ticketing
    {
        public const string ViewAll = "TicketingProject.ViewAll";
        public const string Create = "TicketingProject.Create";
        public const string Update = "TicketingProject.Update";
        public const string Read = "TicketingProject.Read";
        public const string Delete = "TicketingProject.Delete";  
        public const string AddTicket = "TicketingProject.AddTicket";

    }

    public static class Milestones
    {
        public const string ViewAll = "Milestone.ViewAll";
        public const string Create = "Milestone.Create";
        public const string Update = "Milestone.Update";
        public const string Read = "Milestone.Read";
        public const string Delete = "Milestone.Delete";
    }

    public static class Comments
    {
        public const string ViewAll = "Comment.ViewAll";
        public const string Create = "Comment.Create";
        public const string Update = "Comment.Update";
        public const string Read = "Comment.Read";
        public const string Delete = "Comment.Delete";
    }

    public static class Chats
    {
        public const string ViewAll = "Chat.ViewAll";
        public const string Create = "Chat.Create";
        public const string Update = "Chat.Update";
        public const string Read = "Chat.Read";
        public const string Delete = "Chat.Delete";
        public const string AddReaction = "Chat.AddReaction";
        public const string RemoveReaction = "Chat.RemoveReaction";
    }

    public static class Documents
    {
        public const string ViewAll = "Documents.ViewAll";
        public const string Create = "Documents.Create";
        public const string Update = "Documents.Update";
        public const string Read = "Documents.Read";
        public const string Delete = "Documents.Delete";
    }

    public static class Finance
    {
        public const string AddTimesheet = "Finance.AddTimesheet";
        public const string ReadTimesheet = "Finance.ReadTimesheet";
        public const string UpdateTimesheet = "Finance.UpdateTimesheet";
        public const string DeleteTimesheet = "Finance.DeleteTimesheet";
        public const string ViewAllTimesheets = "Finance.ViewAllTimesheets";
    }

    public static class Folders
    {
        public const string CreateFolder = "Folders.CreateFolder";
        public const string ReadFolder = "Folders.ReadFolder";
        public const string UpdateFolder = "Folders.UpdateFolder";
        public const string DeleteFolder = "Folders.DeleteFolder";
        public const string ViewAllFolders = "Folders.ViewAllFolders";
        public const string ShareFolder = "Folders.ShareFolder";
        public const string CopyFolder = "Folders.CopyFolder";
    }

    public static class CompanyBranch
    {
        public const string Create = "CompanyBranch.Create";
        public const string Update = "CompanyBranch.Update";
        public const string Read = "CompanyBranch.Read";
        public const string Delete = "CompanyBranch.Delete";
    }

    public static class Roles
    {
        public const string AddRole = "Roles.AddRole";
        public const string ReadRole = "Roles.ReadRole";
        public const string UpdateRole = "Roles.UpdateRole";
        public const string DeleteRole = "Roles.DeleteRole";
        public const string AddDescriptionToPermission = "Roles.AddDescriptionToPermission";
    }

    public static class Accounting
    {
        public const string AddAccount = "Accounting.AddAccount";
        public const string ReadAccount = "Accounting.ReadAccount";
        public const string UpdateAccount = "Accounting.UpdateAccount";
        public const string DeleteAccount = "Accounting.DeleteAccount";

        public const string AddTransaction = "Accounting.AddTransaction";
        public const string ReadTransaction = "Accounting.ReadTransaction";
        public const string UpdateTransaction = "Accounting.UpdateTransaction";
        public const string DeleteTransaction = "Accounting.DeleteTransaction";

        public const string AddInvoice = "Accounting.AddInvoice";
        public const string ReadInvoice = "Accounting.ReadInvoice";
        public const string UpdateInvoice = "Accounting.UpdateInvoice";
        public const string DeleteInvoice = "Accounting.DeleteInvoice";

        public const string AddBill = "Accounting.AddBill";
        public const string ReadBill = "Accounting.ReadBill";
        public const string UpdateBill = "Accounting.UpdateBill";
        public const string DeleteBill = "Accounting.DeleteBill";

        public const string AddTax = "Accounting.AddTax";
        public const string ReadTax = "Accounting.ReadTax";
        public const string UpdateTax = "Accounting.UpdateTax";
        public const string DeleteTax = "Accounting.DeleteTax";

        public const string AddPayment = "Accounting.AddPayment";
        public const string ReadPayment = "Accounting.ReadPayment";
        public const string UpdatePayment = "Accounting.UpdatePayment";
        public const string DeletePayment = "Accounting.DeletePayment";

        public const string AddBudget = "Accounting.AddBudget";
        public const string ReadBudget = "Accounting.ReadBudget";
        public const string UpdateBudget = "Accounting.UpdateBudget";
        public const string DeleteBudget = "Accounting.DeleteBudget";

        public const string AddExpense = "Accounting.AddExpense";
        public const string ReadExpense = "Accounting.ReadExpense";
        public const string UpdateExpense = "Accounting.UpdateExpense";
        public const string DeleteExpense = "Accounting.DeleteExpense";

        public const string AddSalesInvoice = "Accounting.AddSalesInvoice";
        public const string ReadSalesInvoice = "Accounting.ReadSalesInvoice";
        public const string UpdateSalesInvoice = "Accounting.UpdateSalesInvoice";
        public const string DeleteSalesInvoice = "Accounting.DeleteSalesInvoice";

        public const string AddPurchaseInvoice = "Accounting.AddPurchaseInvoice";
        public const string ReadPurchaseInvoice = "Accounting.ReadPurchaseInvoice";
        public const string UpdatePurchaseInvoice = "Accounting.UpdatePurchaseInvoice";
        public const string DeletePurchaseInvoice = "Accounting.DeletePurchaseInvoice";

        public const string AddPurchaseOrder = "Accounting.AddPurchaseOrder";
        public const string ReadPurchaseOrder = "Accounting.ReadPurchaseOrder";
        public const string UpdatePurchaseOrder = "Accounting.UpdatePurchaseOrder";
        public const string DeletePurchaseOrder = "Accounting.DeletePurchaseOrder";

        public const string AddProduct = "Accounting.AddProduct";
        public const string ReadProduct = "Accounting.ReadProduct";
        public const string UpdateProduct = "Accounting.UpdateProduct";
        public const string DeleteProduct = "Accounting.DeleteProduct";

        public const string AddProductUnit = "Accounting.AddProductUnit";
        public const string ReadProductUnit = "Accounting.ReadProductUnit";
        public const string UpdateProductUnit = "Accounting.UpdateProductUnit";
        public const string DeleteProductUnit = "Accounting.DeleteProductUnit";

        public const string AddProductTerm = "Accounting.AddProductTerm";
        public const string ReadProductTerm = "Accounting.ReadProductTerm";
        public const string UpdateProductTerm = "Accounting.UpdateProductTerm";
        public const string DeleteProductTerm = "Accounting.DeleteProductTerm";

        public const string AddProductOrderType = "Accounting.AddProductOrderType";
        public const string ReadProductOrderType = "Accounting.ReadProductOrderType";
        public const string UpdateProductOrderType = "Accounting.UpdateProductOrderType";
        public const string DeleteProductOrderType = "Accounting.DeleteProductOrderType";

        public const string AddInvoiceDefaultAccount = "Accounting.AddInvoiceDefaultAccount";
        public const string ReadInvoiceDefaultAccount = "Accounting.ReadInvoiceDefaultAccount";
        public const string UpdateInvoiceDefaultAccount = "Accounting.UpdateInvoiceDefaultAccount";
        public const string DeleteInvoiceDefaultAccount = "Accounting.DeleteInvoiceDefaultAccount";

        public const string SetOpeningBalance = "Accounting.SetOpeningBalance";

        public const string PostPurchaseInvoice = "Accounting.PostPurchaseInvoice";
        public const string AddPurchaseInvoiceAttachment = "Accounting.AddPurchaseInvoiceAttachment";
        public const string AddPurchaseOrderAttachment = "Accounting.AddPurchaseOrderAttachment";
        public const string AddSalesInvoiceAttachment = "Accounting.AddSalesInvoiceAttachment";
        public const string PostSalesInvoice = "Accounting.PostSalesInvoice";

        public const string AddDebitNote = "Accounting.AddDebitNote";
        public const string ReadDebitNote = "Accounting.ReadDebitNote";
        public const string UpdateDebitNote = "Accounting.UpdateDebitNote";
        public const string DeleteDebitNote = "Accounting.DeleteDebitNote";
        public const string PostDebitNote = "Accounting.PostDebitNote";
        public const string AddDebitNoteAttachment = "Accounting.AddDebitNoteAttachment";

        public const string AddCreditNote = "Accounting.AddCreditNote";
        public const string ReadCreditNote = "Accounting.ReadCreditNote";
        public const string UpdateCreditNote = "Accounting.UpdateCreditNote";
        public const string DeleteCreditNote = "Accounting.DeleteCreditNote";
        public const string PostCreditNote = "Accounting.PostCreditNote";
        public const string AddCreditNoteAttachment = "Accounting.AddCreditNoteAttachment";

        public const string AddTransactionAttachment = "Accounting.AddTransactionAttachment";
        public const string PostTransaction = "Accounting.PostTransaction";
        public const string ReadLedger = "Accounting.ReadLedger";
        public const string ReadTrialBalance = "Accounting.ReadTrialBalance";
    }
}
