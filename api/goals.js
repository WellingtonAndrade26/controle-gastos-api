import { createClient } from "@supabase/supabase-js";
import { setCors, getUserFromRequest } from "./_auth.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: "Não autorizado." });
  }


  if (req.method === "GET") {

    const { month } = req.query;

    let query = supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
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
      .from("goals")
      .upsert(
        {
          user_id: user.id,
          month,
          value: Number(value)
        },
        {
          onConflict: "user_id,month"
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
