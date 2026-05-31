namespace Novologs.Domain.Enums;

/// <summary>
/// Defines all types of messages (emails and notifications) that can be sent in the system.
/// Each message type maps to specific templates and localized content.
/// </summary>
public enum MessageType : short
{
    // ==================== TASK MESSAGES (100-199) ====================
    
    /// <summary>
    /// Sent when a new task is created and members are assigned
    /// </summary>
    TaskCreated = 100,
    
    /// <summary>
    /// Sent when a task is updated (general changes)
    /// </summary>
    TaskUpdated = 101,
    
    /// <summary>
    /// Sent when a task is deleted
    /// </summary>
    TaskDeleted = 102,
    
    /// <summary>
    /// Sent when a task status is changed
    /// </summary>
    TaskStatusChanged = 103,
    
    /// <summary>
    /// Sent when a member is added/assigned to a task
    /// </summary>
    TaskMemberAdded = 104,
    
    /// <summary>
    /// Sent when a member is removed from a task
    /// </summary>
    TaskMemberRemoved = 105,
    
    // ==================== TICKET MESSAGES (110-119) ====================
    
    /// <summary>
    /// Sent when a new ticket is created
    /// </summary>
    TicketCreated = 110,
    
    /// <summary>
    /// Sent when a ticket is updated
    /// </summary>
    TicketUpdated = 111,
    
    /// <summary>
    /// Sent when a member is assigned to a ticket
    /// </summary>
    TicketAssigned = 112,
    
    // ==================== PROJECT MESSAGES (120-139) ====================
    
    /// <summary>
    /// Sent when a new project is created
    /// </summary>
    ProjectCreated = 120,
    
    /// <summary>
    /// Sent when a project is updated (general changes)
    /// </summary>
    ProjectUpdated = 121,
    
    /// <summary>
    /// Sent when a project is deleted
    /// </summary>
    ProjectDeleted = 122,
    
    /// <summary>
    /// Sent when a member is added to a project
    /// </summary>
    ProjectMemberAdded = 123,
    
    /// <summary>
    /// Sent when a member is removed from a project
    /// </summary>
    ProjectMemberRemoved = 124,
    
    // ==================== USER MANAGEMENT MESSAGES (200-219) ====================
    
    /// <summary>
    /// Sent when a user profile is updated by administrator
    /// </summary>
    UserProfileUpdated = 200,
    
    /// <summary>
    /// Sent when a new user is created (email confirmation)
    /// </summary>
    UserCreated = 201,
    
    /// <summary>
    /// Sent when user requests password reset
    /// </summary>
    UserPasswordReset = 202,
    
    /// <summary>
    /// Sent when a new company user is created
    /// </summary>
    CompanyUserCreated = 203,
    
    /// <summary>
    /// Sent when company user requests password reset
    /// </summary>
    CompanyUserPasswordReset = 204,
    
    /// <summary>
    /// Sent when a user group/team is updated
    /// </summary>
    TeamUpdated = 210,
    
    /// <summary>
    /// Sent when a member is added to a team
    /// </summary>
    TeamMemberAdded = 211,
    
    /// <summary>
    /// Sent when a member is removed from a team
    /// </summary>
    TeamMemberRemoved = 212,
    
    // ==================== DOCUMENT MESSAGES (300-319) ====================
    
    /// <summary>
    /// Sent when a new document is created
    /// </summary>
    DocumentCreated = 300,
    
    /// <summary>
    /// Sent when a document is updated
    /// </summary>
    DocumentUpdated = 301,
    
    /// <summary>
    /// Sent when a user is mentioned in a document
    /// </summary>
    DocumentMentioned = 302,
    
    /// <summary>
    /// Sent when a member is added to a document
    /// </summary>
    DocumentMemberAdded = 303,
    
    /// <summary>
    /// Sent when a member is removed from a document
    /// </summary>
    DocumentMemberRemoved = 304,
    
    // ==================== TODO ITEM MESSAGES (400-419) ====================
    
    /// <summary>
    /// Sent when a new todo item is created
    /// </summary>
    TodoItemCreated = 400,
    
    /// <summary>
    /// Sent when a todo item is deleted
    /// </summary>
    TodoItemDeleted = 401,
    
    /// <summary>
    /// Sent when a todo item status is changed
    /// </summary>
    TodoItemStatusChanged = 402,
    
    /// <summary>
    /// Sent when a member is assigned to a todo item
    /// </summary>
    TodoItemAssigned = 403,
    
    /// <summary>
    /// Sent when a member is removed from a todo item
    /// </summary>
    TodoItemMemberRemoved = 404,
    
    /// <summary>
    /// Sent as a reminder for a todo item
    /// </summary>
    TodoItemReminder = 405,
    
    // ==================== FOLDER MESSAGES (500-519) ====================
    
    /// <summary>
    /// Sent when a folder is shared with users
    /// </summary>
    FolderShared = 500,
    
    /// <summary>
    /// Sent when folder access is removed from users
    /// </summary>
    FolderAccessRemoved = 501,
    
    /// <summary>
    /// Sent when a folder is updated
    /// </summary>
    FolderUpdated = 502,
    
    // ==================== COMMENT MESSAGES (600-619) ====================
    
    /// <summary>
    /// Sent when a user is mentioned in a comment
    /// </summary>
    CommentMentioned = 600,
    
    /// <summary>
    /// Sent when someone replies to a comment
    /// </summary>
    CommentReply = 601,
    
    // ==================== CHAT MESSAGES (700-719) ====================
    
    /// <summary>
    /// Sent when a new chat message is received
    /// </summary>
    ChatMessage = 700,
    
    // ==================== CLIENT/LEAD MESSAGES (800-819) ====================
    
    /// <summary>
    /// Sent when a member is added to a lead
    /// </summary>
    LeadMemberAdded = 800,
    
    /// <summary>
    /// Sent when a member is removed from a lead
    /// </summary>
    LeadMemberRemoved = 801,
    
    /// <summary>
    /// Sent when a lead member's permission level is updated
    /// </summary>
    LeadMemberPermissionUpdated = 802,
    
    /// <summary>
    /// Sent when lead ownership is transferred to a new owner
    /// </summary>
    LeadOwnershipTransferred = 803,
    
    // ==================== SYSTEM MESSAGES (900-999) ====================
    
    /// <summary>
    /// Sent when a tenant policy is violated
    /// </summary>
    PolicyViolation = 900,
    
    /// <summary>
    /// Sent when storage usage threshold is reached
    /// </summary>
    StorageAlert = 901,
    
    /// <summary>
    /// Sent when tenant is initialized/created
    /// </summary>
    TenantInitialized = 902,
    
    /// <summary>
    /// General notification (fallback)
    /// </summary>
    General = 1000
}
