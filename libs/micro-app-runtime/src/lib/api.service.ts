import { Injectable, signal } from '@angular/core';

export interface AppRecord<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  data: T;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly tokenKey = 'ali-super-app:token';
  readonly token = signal(localStorage.getItem(this.tokenKey) || '');
  readonly user = signal<{ id: string; email: string; displayName: string } | null>(this.readUser());
  readonly baseUrl = (localStorage.getItem('ali-super-app:api') || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : '/api')).replace(/\/$/, '');

  get authenticated() { return !!this.token(); }

  async register(email: string, password: string, displayName: string) {
    const out = await this.request<any>('/auth/register', { method: 'POST', body: { email, password, displayName }, auth: false });
    this.acceptAuth(out);
    return out;
  }

  async login(email: string, password: string) {
    const out = await this.request<any>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    this.acceptAuth(out);
    return out;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('ali-super-app:user');
    this.token.set('');
    this.user.set(null);
  }

  records(slug: string) { return this.request<AppRecord[]>(`/apps/${encodeURIComponent(slug)}/records`); }
  publicRecords(slug: string) { return this.request<AppRecord[]>(`/public/${encodeURIComponent(slug)}/records`, { auth: false }); }
  create(slug: string, data: Record<string, unknown>, isPublic = false) { return this.request<AppRecord>(`/apps/${encodeURIComponent(slug)}/records`, { method: 'POST', body: { data, isPublic } }); }
  update(slug: string, id: string, data: Record<string, unknown>, isPublic?: boolean) { return this.request<AppRecord>(`/apps/${encodeURIComponent(slug)}/records/${id}`, { method: 'PATCH', body: { data, isPublic } }); }
  remove(slug: string, id: string) { return this.request<{ deleted: boolean }>(`/apps/${encodeURIComponent(slug)}/records/${id}`, { method: 'DELETE' }); }
  action<T = any>(slug: string, action: string, input: Record<string, unknown> = {}) { return this.request<T>(`/apps/${encodeURIComponent(slug)}/actions/${encodeURIComponent(action)}`, { method: 'POST', body: input }); }

  async uploadTimedFile(file: File, unlockAt: string) {
    const form = new FormData(); form.append('file', file); form.append('unlockAt', unlockAt);
    return this.request<any>('/apps/timed-file/upload', { method: 'POST', body: form });
  }

  timedFileInfo(id: string) { return this.request<any>(`/public/timed-file/${encodeURIComponent(id)}`, { auth: false }); }

  private acceptAuth(out: any) {
    localStorage.setItem(this.tokenKey, out.token);
    localStorage.setItem('ali-super-app:user', JSON.stringify(out.user));
    this.token.set(out.token);
    this.user.set(out.user);
  }

  private readUser() {
    try { return JSON.parse(localStorage.getItem('ali-super-app:user') || 'null'); } catch { return null; }
  }

  private async request<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
    const headers: Record<string, string> = {};
    const isForm = opts.body instanceof FormData;
    if (!isForm && opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (opts.auth !== false && this.token()) headers['Authorization'] = `Bearer ${this.token()}`;
    const response = await fetch(this.baseUrl + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body === undefined ? undefined : isForm ? opts.body as FormData : JSON.stringify(opts.body),
    });
    if (response.status === 401 && opts.auth !== false) this.logout();
    const text = await response.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
    return data as T;
  }
}
