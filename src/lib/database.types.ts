export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          created_at: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          points: number | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string | null
          criteria: Json
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      center_capacity: {
        Row: {
          available_slots: number
          center_id: string
          current_load: number
          date: string
          id: string
          max_capacity: number
          next_available: string
        }
        Insert: {
          available_slots: number
          center_id: string
          current_load: number
          date: string
          id?: string
          max_capacity: number
          next_available: string
        }
        Update: {
          available_slots?: number
          center_id?: string
          current_load?: number
          date?: string
          id?: string
          max_capacity?: number
          next_available?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_capacity_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "recycling_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      center_reviews: {
        Row: {
          center_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          center_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          center_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_reviews_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "recycling_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      center_stats: {
        Row: {
          center_id: string
          co2_reduced: number
          created_at: string | null
          energy_saved: number
          id: string
          items_processed: number
          materials_breakdown: Json
          month: string
          recycling_rate: number
          total_processed: number
        }
        Insert: {
          center_id: string
          co2_reduced: number
          created_at?: string | null
          energy_saved: number
          id?: string
          items_processed: number
          materials_breakdown: Json
          month: string
          recycling_rate: number
          total_processed: number
        }
        Update: {
          center_id?: string
          co2_reduced?: number
          created_at?: string | null
          energy_saved?: number
          id?: string
          items_processed?: number
          materials_breakdown?: Json
          month?: string
          recycling_rate?: number
          total_processed?: number
        }
        Relationships: [
          {
            foreignKeyName: "center_stats_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "recycling_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_requests: {
        Row: {
          actual_weight: string | null
          address: string
          collector_id: string | null
          collector_notes: string | null
          completed_at: string | null
          contact_phone: string
          created_at: string | null
          delivery_id: string | null
          estimated_weight: string | null
          id: string
          item_types: string[]
          preferred_date: string
          preferred_time: string
          priority: string | null
          processing_status: string | null
          quantities: string
          recycling_center_id: string | null
          recycling_notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          special_instructions: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_weight?: string | null
          address: string
          collector_id?: string | null
          collector_notes?: string | null
          completed_at?: string | null
          contact_phone: string
          created_at?: string | null
          delivery_id?: string | null
          estimated_weight?: string | null
          id?: string
          item_types: string[]
          preferred_date: string
          preferred_time: string
          priority?: string | null
          processing_status?: string | null
          quantities: string
          recycling_center_id?: string | null
          recycling_notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_weight?: string | null
          address?: string
          collector_id?: string | null
          collector_notes?: string | null
          completed_at?: string | null
          contact_phone?: string
          created_at?: string | null
          delivery_id?: string | null
          estimated_weight?: string | null
          id?: string
          item_types?: string[]
          preferred_date?: string
          preferred_time?: string
          priority?: string | null
          processing_status?: string | null
          quantities?: string
          recycling_center_id?: string | null
          recycling_notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          special_instructions?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_requests_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_requests_recycling_center_id_fkey"
            columns: ["recycling_center_id"]
            isOneToOne: false
            referencedRelation: "recycling_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_collection_requests_collector_id"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_collection_requests_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          actual_weight: string | null
          collection_request_id: string
          collector_id: string
          collector_notes: string | null
          contamination_level: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_notes: string | null
          delivery_photos: string[] | null
          estimated_weight: string | null
          id: string
          item_condition: string | null
          processed_at: string | null
          processing_notes: string | null
          quality_assessment: Json | null
          received_at: string | null
          recycling_center_id: string
          status: string
          updated_at: string | null
          weight_discrepancy: boolean | null
        }
        Insert: {
          actual_weight?: string | null
          collection_request_id: string
          collector_id: string
          collector_notes?: string | null
          contamination_level?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_notes?: string | null
          delivery_photos?: string[] | null
          estimated_weight?: string | null
          id?: string
          item_condition?: string | null
          processed_at?: string | null
          processing_notes?: string | null
          quality_assessment?: Json | null
          received_at?: string | null
          recycling_center_id: string
          status?: string
          updated_at?: string | null
          weight_discrepancy?: boolean | null
        }
        Update: {
          actual_weight?: string | null
          collection_request_id?: string
          collector_id?: string
          collector_notes?: string | null
          contamination_level?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_notes?: string | null
          delivery_photos?: string[] | null
          estimated_weight?: string | null
          id?: string
          item_condition?: string | null
          processed_at?: string | null
          processing_notes?: string | null
          quality_assessment?: Json | null
          received_at?: string | null
          recycling_center_id?: string
          status?: string
          updated_at?: string | null
          weight_discrepancy?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_collection_request_id_fkey"
            columns: ["collection_request_id"]
            isOneToOne: false
            referencedRelation: "collection_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_recycling_center_id_fkey"
            columns: ["recycling_center_id"]
            isOneToOne: false
            referencedRelation: "recycling_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deliveries_collector_id"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          collection_request_id: string | null
          created_at: string | null
          feedback_type: string
          id: string
          message: string
          rating: number | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          collection_request_id?: string | null
          created_at?: string | null
          feedback_type: string
          id?: string
          message: string
          rating?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          collection_request_id?: string | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_collection_request_id_fkey"
            columns: ["collection_request_id"]
            isOneToOne: false
            referencedRelation: "collection_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_types: {
        Row: {
          description: string
          examples: string[]
          id: string
          name: string
          processing_fee: number
          recycling_rate: number
        }
        Insert: {
          description: string
          examples: string[]
          id?: string
          name: string
          processing_fee?: number
          recycling_rate: number
        }
        Update: {
          description?: string
          examples?: string[]
          id?: string
          name?: string
          processing_fee?: number
          recycling_rate?: number
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_materials: string[] | null
          account_status: string | null
          additional_info: string | null
          address: string | null
          area: string | null
          availability: string | null
          bio: string | null
          capacity: string | null
          center_name: string | null
          collector_status: string | null
          coverage_area: string | null
          created_at: string | null
          date_of_birth: string | null
          default_pickup_address: string | null
          district: string | null
          email: string
          experience: string | null
          id: string
          license_number: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          preferred_schedule: string | null
          profile_picture_url: string | null
          rejection_reason: string | null
          role: string
          status: string | null
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          accepted_materials?: string[] | null
          account_status?: string | null
          additional_info?: string | null
          address?: string | null
          area?: string | null
          availability?: string | null
          bio?: string | null
          capacity?: string | null
          center_name?: string | null
          collector_status?: string | null
          coverage_area?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          default_pickup_address?: string | null
          district?: string | null
          email: string
          experience?: string | null
          id: string
          license_number?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          preferred_schedule?: string | null
          profile_picture_url?: string | null
          rejection_reason?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          accepted_materials?: string[] | null
          account_status?: string | null
          additional_info?: string | null
          address?: string | null
          area?: string | null
          availability?: string | null
          bio?: string | null
          capacity?: string | null
          center_name?: string | null
          collector_status?: string | null
          coverage_area?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          default_pickup_address?: string | null
          district?: string | null
          email?: string
          experience?: string | null
          id?: string
          license_number?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          preferred_schedule?: string | null
          profile_picture_url?: string | null
          rejection_reason?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      recycling_centers: {
        Row: {
          address: string
          coordinates: unknown | null
          created_at: string | null
          email: string
          hours: string
          id: string
          materials: string[]
          name: string
          phone: string
          rating: number | null
          reviews: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          coordinates?: unknown | null
          created_at?: string | null
          email: string
          hours: string
          id?: string
          materials: string[]
          name: string
          phone: string
          rating?: number | null
          reviews?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          coordinates?: unknown | null
          created_at?: string | null
          email?: string
          hours?: string
          id?: string
          materials?: string[]
          name?: string
          phone?: string
          rating?: number | null
          reviews?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          priority: string | null
          responded_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          priority?: string | null
          responded_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string | null
          responded_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_profile: {
        Args: {
          admin_user_id: string
          admin_email: string
          admin_name?: string
        }
        Returns: boolean
      }
      create_user_profile: {
        Args: {
          user_id: string
          user_name: string
          user_email: string
          user_role: string
          user_phone?: string
          user_status?: string
          address?: string
          district?: string
          area?: string
          default_pickup_address?: string
          experience?: string
          vehicle_type?: string
          license_number?: string
          coverage_area?: string
          availability?: string
          preferred_schedule?: string
          additional_info?: string
          center_name?: string
          operating_hours?: string
          accepted_materials?: string[]
          capacity?: string
        }
        Returns: string
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Additional type aliases for common use cases
export type Profile = Tables<'profiles'>
export type CollectionRequest = Tables<'collection_requests'>
export type Delivery = Tables<'deliveries'>
export type RecyclingCenter = Tables<'recycling_centers'>
export type Achievement = Tables<'achievements'>
export type UserAchievement = Tables<'user_achievements'>
export type Feedback = Tables<'feedback'>
export type SupportTicket = Tables<'support_tickets'>
export type MaterialType = Tables<'material_types'>

// Insert types
export type ProfileInsert = TablesInsert<'profiles'>
export type CollectionRequestInsert = TablesInsert<'collection_requests'>
export type DeliveryInsert = TablesInsert<'deliveries'>

// Update types
export type ProfileUpdate = TablesUpdate<'profiles'>
export type CollectionRequestUpdate = TablesUpdate<'collection_requests'>
export type DeliveryUpdate = TablesUpdate<'deliveries'>

// Common status enums (based on database constraints)
export type CollectionRequestStatus = 
  | 'pending' 
  | 'assigned' 
  | 'collected' 
  | 'delivered' 
  | 'processed' 
  | 'completed' 
  | 'cancelled'

export type DeliveryStatus = 
  | 'pending_delivery' 
  | 'delivered' 
  | 'received' 
  | 'quality_checked' 
  | 'processing' 
  | 'processed'

export type UserRole = 'user' | 'collector' | 'recycling_center' | 'admin'

export type AccountStatus = 'active' | 'deactivated' | 'deleted'

export type CollectorStatus = 'active' | 'inactive'

export type Priority = 'high' | 'medium' | 'low'

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor'

export type ContaminationLevel = 'none' | 'low' | 'medium' | 'high'

export type FeedbackType = 
  | 'general' 
  | 'service' 
  | 'feature_request' 
  | 'bug_report' 
  | 'collection_experience'

export type SupportTicketCategory = 
  | 'account_reactivation'
  | 'technical_issue'
  | 'billing_question'
  | 'collection_issue'
  | 'general_inquiry'
  | 'bug_report'
  | 'feature_request'
  | 'other'

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent' 