import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // First, check if the user exists in the auth.users table
        const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (authError || !authUser.user) {
          console.error("Supabase auth error:", authError)
          return null
        }

        // Fetch additional user data from your users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          return null
        }

        return {
          id: authUser.user.id,
          email: authUser.user.email,
          role: userData.role,
          name: userData.full_name,
          supabaseUserId: authUser.user.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.supabaseUserId = user.supabaseUserId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.supabaseUserId = token.supabaseUserId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

