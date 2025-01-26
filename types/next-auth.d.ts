import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    supabaseUserId?: string
    role?: string
  }

  interface Session {
    user?: User
  }
} 