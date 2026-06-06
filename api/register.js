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

  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas não conferem." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingUser, error: findError } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (findError) {
    return res.status(500).json({ error: findError.message });
  }

  if (existingUser) {
    return res.status(409).json({ error: "Esse email já está cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("app_users")
    .insert([
      {
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash
      }
    ])
    .select("id, name, email")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const token = createToken(user);

  return res.status(201).json({
    token,
    user
  });
}