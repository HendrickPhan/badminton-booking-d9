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
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          password_hash: string
          avatar_url: string | null
          gender: 'male' | 'female' | 'other' | null
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          password_hash: string
          avatar_url?: string | null
          gender?: 'male' | 'female' | 'other' | null
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          password_hash?: string
          avatar_url?: string | null
          gender?: 'male' | 'female' | 'other' | null
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          female_discount_percent: number
          female_discount_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          female_discount_percent?: number
          female_discount_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          female_discount_percent?: number
          female_discount_enabled?: boolean
          updated_at?: string
        }
      }
      centers: {
        Row: {
          id: string
          name: string
          address: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          center_id: string | null
          match_date: string
          start_time: string
          end_time: string
          courts_count: number
          court_price: number
          status: 'pending_registration' | 'confirmed' | 'pending_payment' | 'completed' | 'cancelled'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          center_id?: string | null
          match_date: string
          start_time: string
          end_time: string
          courts_count?: number
          court_price?: number
          status?: 'pending_registration' | 'confirmed' | 'pending_payment' | 'completed' | 'cancelled'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          center_id?: string | null
          match_date?: string
          start_time?: string
          end_time?: string
          courts_count?: number
          court_price?: number
          status?: 'pending_registration' | 'confirmed' | 'pending_payment' | 'completed' | 'cancelled'
          created_by?: string | null
          created_at?: string
        }
      }
      booking_participants: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          status: 'pending' | 'joined' | 'declined'
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          status?: 'pending' | 'joined' | 'declined'
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          status?: 'pending' | 'joined' | 'declined'
        }
      }
      booking_consumables: {
        Row: {
          id: string
          booking_id: string
          item_type: 'shuttlecock' | 'drink'
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          booking_id: string
          item_type: 'shuttlecock' | 'drink'
          quantity?: number
          unit_price?: number
        }
        Update: {
          id?: string
          booking_id?: string
          item_type?: 'shuttlecock' | 'drink'
          quantity?: number
          unit_price?: number
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          amount: number
          paid: boolean
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          amount: number
          paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          amount?: number
          paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          booking_id: string | null
          match_type: '1v1' | '2v2'
          team1_player1: string | null
          team1_player2: string | null
          team2_player1: string | null
          team2_player2: string | null
          team1_score: number | null
          team2_score: number | null
          winner_team: number | null
          played_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          match_type?: '1v1' | '2v2'
          team1_player1?: string | null
          team1_player2?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          team1_score?: number | null
          team2_score?: number | null
          winner_team?: number | null
          played_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          match_type?: '1v1' | '2v2'
          team1_player1?: string | null
          team1_player2?: string | null
          team2_player1?: string | null
          team2_player2?: string | null
          team1_score?: number | null
          team2_score?: number | null
          winner_team?: number | null
          played_at?: string
        }
      }
      rankings: {
        Row: {
          id: string
          user_id: string
          singles_rating: number
          doubles_rating: number
          singles_wins: number
          singles_losses: number
          doubles_wins: number
          doubles_losses: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          singles_rating?: number
          doubles_rating?: number
          singles_wins?: number
          singles_losses?: number
          doubles_wins?: number
          doubles_losses?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          singles_rating?: number
          doubles_rating?: number
          singles_wins?: number
          singles_losses?: number
          doubles_wins?: number
          doubles_losses?: number
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

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Center = Database['public']['Tables']['centers']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingParticipant = Database['public']['Tables']['booking_participants']['Row']
export type BookingConsumable = Database['public']['Tables']['booking_consumables']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Ranking = Database['public']['Tables']['rankings']['Row']
export type Settings = Database['public']['Tables']['settings']['Row']

// Backward compatibility
export type Profile = User
