export interface UserContext { userId: string; }
export interface RecordListRequest extends UserContext { appSlug: string; publicOnly?: boolean; }
export interface RecordCreateRequest extends UserContext { appSlug: string; data: Record<string, unknown>; isPublic?: boolean; }
export interface RecordUpdateRequest extends UserContext { appSlug: string; id: string; data: Record<string, unknown>; isPublic?: boolean; }
export interface RecordDeleteRequest extends UserContext { appSlug: string; id: string; }
export interface AppActionRequest extends UserContext { appSlug: string; action: string; input?: Record<string, unknown>; }
