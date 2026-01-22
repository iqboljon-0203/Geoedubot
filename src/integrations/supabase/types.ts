export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar: string | null
          role: 'teacher' | 'student'
          telegram_user_id: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name?: string | null
          avatar?: string | null
          role: 'teacher' | 'student'
          telegram_user_id?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar?: string | null
          role?: 'teacher' | 'student'
          telegram_user_id?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          lat: number | null
          lng: number | null
          address: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          lat?: number | null
          lng?: number | null
          address?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          lat?: number | null
          lng?: number | null
          address?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'homework' | 'internship'
          group_id: string
          created_by: string
          file_url: string | null
          deadline: string | null
          date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'homework' | 'internship'
          group_id: string
          created_by: string
          file_url?: string | null
          deadline?: string | null
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'homework' | 'internship'
          group_id?: string
          created_by?: string
          file_url?: string | null
          deadline?: string | null
          date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      answers: {
        Row: {
          id: string
          task_id: string
          user_id: string
          description: string | null
          file_url: string | null
          location_lat: number | null
          location_lng: number | null
          score: number | null
          teacher_comment: string | null
          created_at: string
          graded_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          description?: string | null
          file_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          score?: number | null
          teacher_comment?: string | null
          created_at?: string
          graded_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          description?: string | null
          file_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          score?: number | null
          teacher_comment?: string | null
          created_at?: string
          graded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'teacher' | 'student'
      task_type: 'homework' | 'internship'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
