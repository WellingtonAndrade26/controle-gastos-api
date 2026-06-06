function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-app-token");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { password } = req.body;

  if (!process.env.APP_PASSWORD) {
    return res.status(500).json({ error: "APP_PASSWORD não configurada." });
  }

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Senha incorreta." });
  }

  return res.status(200).json({
    token: process.env.APP_PASSWORD
  });
}