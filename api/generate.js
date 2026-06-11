module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
          model: "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
          messages: [
            {
              role: "system",
              content: `
Return ONLY valid JSON in this format:
{
  "summary": "",
  "weirdFacts": [],
  "people": [],
  "events": [],
  "books": [],
  "documentaries": [],
  "deepLinks": []
}
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

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        error: "No content from model",
        debug: data
      });
    }

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
      error: "Server error",
      message: err.message
    });
  }
};
