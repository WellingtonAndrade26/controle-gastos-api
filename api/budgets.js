import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { month } = req.query;

    let query = supabase
      .from("budgets")
      .select("*")
      .order("month", { ascending: true });

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { month, value } = req.body;

    if (!month || value === undefined || value === null) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    const { data, error } = await supabase
      .from("budgets")
      .upsert(
        {
          month,
          value: Number(value),
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "month"
        }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método não permitido." });
}