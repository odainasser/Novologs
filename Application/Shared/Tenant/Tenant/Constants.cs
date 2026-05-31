namespace Novologs.Application.Tenant;

public static class Constants
{
    //add folders names a nd an array of them
    public static class FolderNames
    { 
        public const string Projects = "Projects";
        public const string Clients = "Clients";
        public const string Vendors = "Vendors";
        public const string Tasks = "Tasks";
        public const string Documents = "Documents";
        //public const string Personal = "Personal";
        public const string Chat = "Chat";
        public const string Users = "Users";
        public const string Missions = "Missions";
    }
    
    public const string System = "Application";
    public const string General = "Files & Folders";
    public const string Shared = "Shared Files";
    public const string Deleted = "Deleted Files";

    public static class SettingKeys
    {
        public const string DefaultCurrency = "DefaultCurrency";
    }

    /// <summary>
    /// Maps each seeded sub-folder name to its root parent ("System" or "General").
    /// To move a folder or add a new one, change its value here â€” no other code needs updating.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, string> FolderRootMapping =
        new Dictionary<string, string>
        {
            { FolderNames.Projects,  System },
            { FolderNames.Clients,   System },
            { FolderNames.Vendors,   System },
            { FolderNames.Tasks,     System  },
            { FolderNames.Documents, System  },
            { FolderNames.Chat,      System  },
            { FolderNames.Users,     System  },
            { FolderNames.Missions,     System  },

        };
}
