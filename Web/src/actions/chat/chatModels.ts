export interface Filter {
  fieldName: string;
  fieldValue: string;
  operator?: number;
  logicOperator?: number;
  subFilters?: string[];
}

export interface Sort {
  fieldName: string;
  sortDirection: number;
  subSort: string[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
}
export interface GetChatPayload {
  search?: Filter;
  sort?: Sort;
  pagination?: Pagination;
}

export interface GetChatResponse {
  successStatus: {
    total: number;
    items: Chat[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Chat {
  id: string;
  name: string;
  code: string | null;
  serial: number;
  creator: {
    id: string;
    userName: string;
    fullName: string;
    profileImageUrl: string;
  };
  members: {
    id: string;
    role: number;
    member: {
      id: string;
      userName: string;
      fullName: string;
      profileImageUrl: string;
    };
  }[];
  totalMessages: number;
  lastMessage: {
    id: string;
    payLoad: string;
    sender: {
      id: string;
      userName: string;
      fullName: string;
      profileImageUrl: string;
    };
    deletedStatus: number;
    chatRoomId: string;
    recievers: {
      status: number;
      reciever: {
        id: string;
        userName: string;
        fullName: string;
        profileImageUrl: string;
      };
    }[];
    created: string;
    lastModified: string;
  };
  created: string;
  lastModified: string;
}

export interface CreateChatRoom {
  name: string;
  memberIds: string[];
  code?: string;
}

export interface UpdateChatRoom {
  id: string;
  name: string;
  memberIds: string[];
}

export interface UpdateChat {
  id: string;
  payLoad: string;
}


export interface MentionSender {
  id: string;
  userName: string;
  fullName: string;
  profileImageUrl?: string;
}

export interface MentionItem {
  mentionId: string;
  mentionedAt: string;
  messageId: string;
  payLoad: string;
  chatRoomId: string;
  sender: MentionSender;
  messageCreated: string;
}

export interface GetMentionsSuccessStatus {
  total: number;
  items: MentionItem[];
}

export interface GetMentionsResponse {
  successStatus: GetMentionsSuccessStatus;
  succeeded?: boolean;
  errors?: string[];
}