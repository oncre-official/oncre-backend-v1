import "dotenv/config";

export const config = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_KEY ?? ""
};

if (!config.supabaseUrl) {
  throw new Error("Missing SUPABASE_URL in .env");
}
if (!config.supabaseKey) {
  throw new Error("Missing SUPABASE_KEY in .env");
}
