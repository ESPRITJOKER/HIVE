/**
 * Hand-authored typed contract for the HIVE schema.
 * Keep in sync with supabase/migrations/0001_initial_schema.sql.
 * Once a live Supabase project exists, regenerate with `supabase gen types typescript`
 * and diff against this file before replacing it.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Role = "student" | "representative" | "administrator";
export type MembershipStatus = "pending" | "active" | "rejected";
export type DocumentProcessingStatus =
  | "uploaded"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexed"
  | "failed";
export type TimetableSlotType = "lecture_cm" | "tutorial_td" | "practical_tp" | "examination";
export type TaskEventCategory =
  | "assignment"
  | "exam"
  | "hackathon"
  | "internship"
  | "scholarship"
  | "event";
export type ChannelType = "general" | "subject";
export type GeneratedContentType = "summary" | "revision_sheet" | "quiz" | "explanation";
export type AiMessageRole = "user" | "assistant";

/** Empty relationship tuple: satisfies Supabase's GenericRelationship[] constraint. */
type Relationships = [];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Role;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: Role;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: Role;
        };
        Relationships: Relationships;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          created_at?: string;
        };
        Update: { name?: string; code?: string; description?: string | null };
        Relationships: Relationships;
      };
      class_members: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          membership_status: MembershipStatus;
          joined_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id: string;
          membership_status?: MembershipStatus;
          joined_at?: string;
        };
        Update: { membership_status?: MembershipStatus };
        Relationships: Relationships;
      };
      representative_assignments: {
        Row: { id: string; user_id: string; class_id: string; created_at: string };
        Insert: { id?: string; user_id: string; class_id: string; created_at?: string };
        Update: { class_id?: string };
        Relationships: Relationships;
      };
      courses: {
        Row: {
          id: string;
          class_id: string;
          code: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          code: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: { code?: string; title?: string; description?: string | null };
        Relationships: Relationships;
      };
      documents: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          file_path: string | null;
          drive_url: string | null;
          uploader_id: string;
          version: number;
          processing_status: DocumentProcessingStatus;
          content_hash: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          file_path?: string | null;
          drive_url?: string | null;
          uploader_id: string;
          version?: number;
          processing_status?: DocumentProcessingStatus;
          content_hash?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          processing_status?: DocumentProcessingStatus;
          content_hash?: string | null;
          error_message?: string | null;
          version?: number;
        };
        Relationships: Relationships;
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          embedding: string | number[] | null;
          page_number: number | null;
          section_title: string | null;
          chunk_index: number;
          token_count: number | null;
          content_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          embedding?: string | number[] | null;
          page_number?: number | null;
          section_title?: string | null;
          chunk_index: number;
          token_count?: number | null;
          content_hash: string;
          created_at?: string;
        };
        Update: { content?: string; embedding?: string | number[] | null };
        Relationships: Relationships;
      };
      generated_content: {
        Row: {
          id: string;
          course_id: string;
          document_id: string | null;
          type: GeneratedContentType;
          content: Json;
          content_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          document_id?: string | null;
          type: GeneratedContentType;
          content: Json;
          content_hash: string;
          created_at?: string;
        };
        Update: { content?: Json };
        Relationships: Relationships;
      };
      timetable_slots: {
        Row: {
          id: string;
          course_id: string;
          subject: string;
          room: string | null;
          teacher: string | null;
          day: string;
          start_time: string;
          end_time: string;
          type: TimetableSlotType;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          subject: string;
          room?: string | null;
          teacher?: string | null;
          day: string;
          start_time: string;
          end_time: string;
          type: TimetableSlotType;
          created_at?: string;
        };
        Update: {
          subject?: string;
          room?: string | null;
          teacher?: string | null;
          day?: string;
          start_time?: string;
          end_time?: string;
          type?: TimetableSlotType;
        };
        Relationships: Relationships;
      };
      tasks_events: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          category: TaskEventCategory;
          attachment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          category: TaskEventCategory;
          attachment?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string | null;
          category?: TaskEventCategory;
          attachment?: string | null;
        };
        Relationships: Relationships;
      };
      user_task_state: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          is_completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          is_completed?: boolean;
          updated_at?: string;
        };
        Update: { is_completed?: boolean; updated_at?: string };
        Relationships: Relationships;
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          channel_id: string | null;
          content: string;
          moderation_status: string;
          is_indexed: boolean;
          created_at: string;
          edited_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          channel_id?: string | null;
          content: string;
          moderation_status?: string;
          is_indexed?: boolean;
          created_at?: string;
          edited_at?: string | null;
        };
        Update: { content?: string; moderation_status?: string; is_indexed?: boolean; edited_at?: string | null };
        Relationships: Relationships;
      };
      channels: {
        Row: {
          id: string;
          class_id: string;
          course_id: string | null;
          name: string;
          channel_type: ChannelType;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          course_id?: string | null;
          name: string;
          channel_type: ChannelType;
          created_at?: string;
        };
        Update: { name?: string; channel_type?: ChannelType };
        Relationships: Relationships;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: { endpoint?: string; p256dh?: string; auth?: string };
        Relationships: Relationships;
      };
      ai_usage: {
        Row: { id: string; user_id: string; day: string; request_count: number };
        Insert: { id?: string; user_id: string; day: string; request_count?: number };
        Update: { request_count?: number };
        Relationships: Relationships;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          title: string;
          created_at?: string;
        };
        Update: { title?: string };
        Relationships: Relationships;
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: AiMessageRole;
          content: string;
          citations: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: AiMessageRole;
          content: string;
          citations?: Json;
          created_at?: string;
        };
        Update: { content?: string; citations?: Json };
        Relationships: Relationships;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: Relationships;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: { read_at?: string | null };
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: { Args: Record<string, never>; Returns: Role };
      current_user_class_ids: { Args: Record<string, never>; Returns: string[] };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_representative_of: { Args: { target_class_id: string }; Returns: boolean };
      can_access_class: { Args: { target_class_id: string }; Returns: boolean };
      join_class: { Args: { p_code: string }; Returns: string };
      increment_ai_usage: { Args: { p_limit?: number }; Returns: boolean };
      archive_expired_opportunities: { Args: Record<string, never>; Returns: number };
    };
    Enums: {
      user_role: Role;
      membership_status: MembershipStatus;
      document_processing_status: DocumentProcessingStatus;
      timetable_slot_type: TimetableSlotType;
      task_event_category: TaskEventCategory;
      channel_type: ChannelType;
      generated_content_type: GeneratedContentType;
      ai_message_role: AiMessageRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
