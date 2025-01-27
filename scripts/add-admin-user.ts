import { createClient } from "@supabase/supabase-js";
import { hash } from "bcrypt";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function addAdminUser(email: string, password: string, fullName: string) {
  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Insert the user into the auth.users table
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: hashedPassword,
    email_confirm: true,
  });

  if (authError) {
    throw authError;
  }

  if (!authUser.user) {
    throw new Error("Failed to create auth user");
  }

  // Insert the user into your custom users table
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    email: email,
    role: "admin",
    full_name: fullName,
    is_approved: true,
  });

  if (insertError) {
    throw insertError;
  }

  console.log("Admin user created successfully");
}

// Usage
const email = "admin@example.com";
const password = "";
const fullName = "Admin User";

addAdminUser(email, password, fullName).catch(console.error);