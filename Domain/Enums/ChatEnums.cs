namespace Novologs.Domain.Enums;

public enum ChatMessageDeleteStatus : short
{
    NotDeleted = 0,
    DeletedForMe = 1,
    DeletedForAll = 2
}

public enum ChatReciverMessageSeenStatus : short
{
    NotDelevered = 0,
    Delevered = 1,
    Seen = 2
}

public enum ChatRoomMemberRole : short
{
    Owner = 0,
    Member = 1
}


