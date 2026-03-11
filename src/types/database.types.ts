export type SectionType =
  | "verse"
  | "chorus"
  | "bridge"
  | "pre_chorus"
  | "intro"
  | "outro"
  | "interlude"
  | "tag"
  | "custom";

export type SharePermission = "read" | "comment" | "edit";
export type NotationPreference = "anglo_saxon" | "latin";
export type ThemePreference = "dark" | "light" | "system";
export type UserPlan = "free" | "pro" | "team";

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  preferred_notation: NotationPreference;
  preferred_theme: ThemePreference;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface ChordSheet {
  id: string;
  title: string;
  artist: string | null;
  song_key: string | null;
  tempo: string | null;
  bpm: number | null;
  time_signature: string;
  youtube_url: string | null;
  owner_id: string;
  is_public: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  sheet_id: string;
  type: SectionType;
  label: string | null;
  sort_order: number;
  content: Record<string, unknown>;
  reference_section_id: string | null;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  sheet_id: string;
  token: string;
  permission: SharePermission;
  created_by: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  owner_id: string;
}

export interface SetList {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface SetListItem {
  id: string;
  set_list_id: string;
  sheet_id: string;
  sort_order: number;
  custom_key: string | null;
  notes: string | null;
}

export interface SheetTag {
  sheet_id: string;
  tag_id: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  sheet_id: string;
  owner_id: string;
  created_at: string;
}

export interface SheetVersion {
  id: string;
  sheet_id: string;
  version_number: number;
  content_snapshot: Record<string, unknown>;
  metadata_snapshot: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  sheet_id: string;
  section_id: string | null;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type InstrumentType = "guitar" | "ukulele" | "piano";
