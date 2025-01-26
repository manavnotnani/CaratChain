import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type User = {
  id: string
  email: string
  role: "admin" | "issuer" | "investor" | "agent"
  full_name?: string
  company_name?: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type Diamond = {
  id: string
  user_id: string
  name: string
  carat: number
  color: string
  clarity: string
  cut?: string
  certificate_number?: string
  is_tokenized: boolean
  created_at: string
  updated_at: string
}

export type Token = {
  id: string
  diamond_id: string
  total_supply: number
  price_per_token: number
  contract_address?: string
  created_at: string
  updated_at: string
}

export type KycKybStatus = {
  id: string
  user_id: string
  status: "pending" | "submitted" | "approved" | "rejected"
  type: "kyc" | "kyb"
  submitted_at: string
  approved_at?: string
  rejected_at?: string
  notes?: string
  full_name?: string
  date_of_birth?: string
  address?: string
  id_number?: string
}

