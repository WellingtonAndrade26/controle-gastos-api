import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-app-token");
}

function checkAuth(req) {
  const token = req.headers["x-app-token"];
  return token && token === process.env.APP_PASSWORD;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("wallet")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { action, value } = req.body;

    const valor = Number(value);

    if (!action || isNaN(valor)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const { data: walletAtual, error: erroBusca } = await supabase
      .from("wallet")
      .select("*")
      .eq("id", 1)
      .single();

    if (erroBusca) {
      return res.status(500).json({ error: erroBusca.message });
    }

    let novoTotal = Number(walletAtual.total_guardado || 0);

    if (action === "add") {
      novoTotal += valor;
    }

    if (action === "remove") {
      novoTotal -= valor;
      if (novoTotal < 0) novoTotal = 0;
    }

    if (action === "set") {
      novoTotal = valor;
    }

    const { data, error } = await supabase
      .from("wallet")
      .update({
        total_guardado: novoTotal,
        updated_at: new Date().toISOString()
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método não permitido." });
}