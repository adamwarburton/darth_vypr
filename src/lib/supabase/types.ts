// ============================================================================
// Supabase Database Type Definitions
// These types can be replaced with auto-generated types from Supabase CLI
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          title: string;
          description: string | null;
          options: Json | null;
          media_url: string | null;
          required: boolean;
          order_index: number;
          settings: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: string;
          title: string;
          description?: string | null;
          options?: Json | null;
          media_url?: string | null;
          required?: boolean;
          order_index: number;
          settings?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          options?: Json | null;
          media_url?: string | null;
          required?: boolean;
          order_index?: number;
          settings?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      responses: {
        Row: {
          id: string;
          project_id: string;
          respondent_id: string;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          respondent_id: string;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          respondent_id?: string;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "responses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      answers: {
        Row: {
          id: string;
          response_id: string;
          question_id: string;
          value: Json;
          answered_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          question_id: string;
          value: Json;
          answered_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          question_id?: string;
          value?: Json;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_response_id_fkey";
            columns: ["response_id"];
            isOneToOne: false;
            referencedRelation: "responses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_analyses: {
        Row: {
          id: string;
          project_id: string;
          question_id: string | null;
          analysis_type: string;
          content: Json;
          response_count_at_generation: number;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          question_id?: string | null;
          analysis_type: string;
          content: Json;
          response_count_at_generation: number;
          model: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          question_id?: string | null;
          analysis_type?: string;
          content?: Json;
          response_count_at_generation?: number;
          model?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_analyses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_analyses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_chat_messages: {
        Row: {
          id: string;
          project_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
