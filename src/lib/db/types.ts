export interface DatabaseDocument {
  _id: string;
  [key: string]: any;
}

export interface DatabaseQuery {
  include_docs?: boolean;
  startkey?: string;
  endkey?: string;
  limit?: number;
  skip?: number;
}

export interface DatabaseResponse {
  id: string;
  ok: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}