export default function handler(req, res) {
  return res.status(200).json({
    testeExiste: !!process.env.TESTE_ENV,
    supabaseUrlExiste: !!process.env.SUPABASE_URL,
    supabaseKeyExiste: !!process.env.SUPABASE_SERVICE_KEY
  });
}   