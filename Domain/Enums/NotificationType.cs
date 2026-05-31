namespace Novologs.Domain.Enums;

public enum NotificationType
{
    General = 0,
    AssignedTask = 1,
    RemovedFromTask = 2,
    EditedTask = 3,
    TaskStatusChanged = 4,
    AddedToProject = 5,
    RemovedFromProject = 6,
    EditedProject = 7,
    AddedToTodoItem = 8,
    RemovedFromTodoItem = 9,
    EditedTodoItem = 10,
    TodoItemReminder = 11,
    AddedToComment = 12,
    AddedToCommentReply = 13,
    AddedToDocument = 14,
    MentionedInDocument = 15,
    RemovedFromDocument = 16,
    EditedDocument = 17,
    AddedToFolder = 18,
    RemovedFromFolder = 19,
    EditedFolder = 20,
    ChatMessage = 21,
    AssignedTodoItem = 22,
    DeletedTask = 23,
    MentionedInChat = 24,
    AddedToLead = 25,
    RemovedFromLead = 26,
    LeadMemberPermissionUpdated = 27,
    LeadOwnershipTransferred = 28
}

public enum DeviceType
{
    Unknown = 0,
    Android = 1,
    IOS = 2,
    Web = 3
}
