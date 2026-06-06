import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Informe email e senha." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from("app_users")
    .select("id, name, email, password_hash")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!user) {
    return res.status(401).json({ error: "Email ou senha inválidos." });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);

  if (!passwordOk) {
    return res.status(401).json({ error: "Email ou senha inválidos." });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email
  };

  const token = createToken(safeUser);

  return res.status(200).json({
    token,
    user: safeUser
  });
}