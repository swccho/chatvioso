export interface UserSettings {
  email_on_mention: boolean;
  in_app_notifications: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar_url: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  user_id: number;
  logo_url?: string | null;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  role: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInvitation {
  id: number;
  workspace_id: number;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  invited_by?: User;
}

export interface ConversationMember {
  id: number;
  conversation_id: number;
  user_id: number;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  workspace_id: number;
  type: "direct" | "group" | "channel";
  name: string | null;
  created_by: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  members?: ConversationMember[];
  /** Optional: when API includes latest message preview for list UI */
  last_message_preview?: string | null;
  last_message_at?: string | null;
}

export interface Attachment {
  id: number;
  message_id: number;
  original_name: string;
  mime_type: string;
  size: number;
  download_url: string;
  created_at: string;
}

export interface MessageReactionItem {
  emoji: string;
  count: number;
  user_ids: number[];
}

export interface Message {
  id: number;
  conversation_id: number;
  user_id: number;
  body: string;
  parent_id: number | null;
  type: string;
  pinned_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  parent?: Message | null;
  attachments?: Attachment[];
  reactions?: MessageReactionItem[];
  current_user_reacted?: string[];
}
