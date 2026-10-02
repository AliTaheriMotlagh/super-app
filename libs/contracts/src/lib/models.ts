export interface ApiEnvelope<T> { data: T; requestId: string; }
export interface UserRef { id: string; displayName: string; }
export interface LocationPoint { lat: number; lng: number; }
export interface DomainEvent<T = unknown> { id: string; type: string; occurredAt: string; payload: T; }
