import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
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
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (month) {
      const start = `${month}-01`;
      const endDate = new Date(`${month}-01`);
      endDate.setMonth(endDate.getMonth() + 1);
      const end = endDate.toISOString().slice(0, 10);

      query = query.gte("date", start).lt("date", end);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, value, category, date } = req.body;

    if (!name || !value || !category || !date) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([{ name, value, category, date }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID obrigatório." });
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Método não permitido." });
}