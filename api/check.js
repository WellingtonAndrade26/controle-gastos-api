export default function handler(req, res) {
  return res.status(200).json({
    supabaseUrlExiste: !!process.env.SUPABASE_URL,
    supabaseKeyExiste: !!process.env.SUPABASE_SERVICE_KEY
  });
}