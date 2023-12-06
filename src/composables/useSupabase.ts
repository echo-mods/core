import { createClient } from "@supabase/supabase-js"
const Client = createClient("https://krojuctucyvnuxkfzjoy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb2p1Y3R1Y3l2bnV4a2Z6am95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg0NDI4OTYsImV4cCI6MjAxNDAxODg5Nn0.PbxTU2h5wq9lS_jQzhZoefLefEQgdHkUsdsbMM2aRA0")

export const useSupabase = () => {
	return Client
}