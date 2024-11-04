import { DatabaseDocument, DatabaseQuery, DatabaseResponse } from './types';

export class LocalStorageDB {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  private parseDocument<T>(data: string | null): T {
    if (!data) throw new Error('Document not found');
    return JSON.parse(data);
  }

  async get<T>(id: string): Promise<T> {
    const item = localStorage.getItem(this.getKey(id));
    return this.parseDocument<T>(item);
  }

  async put(doc: DatabaseDocument): Promise<DatabaseResponse> {
    const id = doc._id || `${Date.now()}`;
    const key = this.getKey(id);
    localStorage.setItem(key, JSON.stringify({ ...doc, _id: id }));
    return { id, ok: true };
  }

  async allDocs<T>({ include_docs, startkey, endkey, limit, skip = 0 }: DatabaseQuery): Promise<{
    rows: Array<{ id: string; doc?: T }>;
  }> {
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.prefix}:`))
      .sort();

    const filteredKeys = keys.filter(key => {
      if (startkey && key < this.getKey(startkey)) return false;
      if (endkey && key > this.getKey(endkey)) return false;
      return true;
    });

    const paginatedKeys = filteredKeys.slice(skip, limit ? skip + limit : undefined);

    return {
      rows: paginatedKeys.map(key => ({
        id: key,
        doc: include_docs ? this.parseDocument(localStorage.getItem(key)) : undefined,
      })),
    };
  }

  async remove(doc: DatabaseDocument): Promise<DatabaseResponse> {
    localStorage.removeItem(this.getKey(doc._id));
    return { ok: true };
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(`${this.prefix}:`));
    keys.forEach(key => localStorage.removeItem(key));
  }
}