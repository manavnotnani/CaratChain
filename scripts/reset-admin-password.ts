import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { randomBytes } from "crypto"

// Load environment variables
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function resetAdminPassword(adminEmail: string) {
  try {
    // Generate a new random password
    const newPassword = randomBytes(16).toString("hex")

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      "admin-user-id", // Replace with the actual admin user ID
      { password: newPassword },
    )

    if (error) {
      throw error
    }

    console.log(`Password reset successfully for ${adminEmail}`)
    console.log(`New password: ${newPassword}`)
    console.log("Please login with this new password and change it immediately.")
  } catch (error) {
    console.error("Error resetting admin password:", error)
  }
}

// Usage
const adminEmail = "admin@example.com" // Replace with your admin email

resetAdminPassword(adminEmail)
  .then(() => console.log("Password reset process completed"))
  .catch((error) => {
    console.error("Failed to reset admin password:", error)
    process.exit(1)
  })

