module.exports = async (req, res) => {
  // ✅ CORS (required for Hostinger frontend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic } = req.body || {};

    if (!topic) {
      return res.status(400).json({ error: "Topic required" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [
            {
              role: "system",
              content: `
You are a curiosity engine.

Return ONLY valid JSON in this exact schema:

{
  "summary": "",
  "weirdFacts": [],
  "people": [],
  "events": [],
  "books": [],
  "documentaries": [],
  "deepLinks": []
}

Focus on obscure, surprising, interconnected knowledge. No markdown. No explanation.
`
            },
            {
              role: "user",
              content: `Topic: ${topic}`
            }
          ]
        })
      }
    );

    const data = await response.json();

return res.status(200).json({
  debug: true,
  openrouter_response: data
});

    // ✅ Safe JSON parsing (prevents crashes if model returns bad format)
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsed = {
        summary: content,
        weirdFacts: [],
        people: [],
        events: [],
        books: [],
        documentaries: [],
        deepLinks: []
      };
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      error: "Server error"
    });
  }
};
