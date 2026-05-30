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
          username: string | null
          full_name: string | null
          avatar_url: string | null
          video_url: string | null
          audio_url: string | null
          image_url: string | null
          role: 'admin' | 'content_creator' | 'event_organizer' | 'member'
          is_approved?: boolean | null
          newsletter_subscribed?: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          image_url?: string | null
          role?: 'admin' | 'content_creator' | 'event_organizer' | 'member'
          is_approved?: boolean | null
          newsletter_subscribed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          image_url?: string | null
          role?: 'admin' | 'content_creator' | 'event_organizer' | 'member'
          is_approved?: boolean | null
          newsletter_subscribed?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}