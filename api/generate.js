module.exports = async (req, res) => {
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
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: `Return JSON rabbit hole for: ${topic}`
            }
          ]
        })
      }
    );

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content || "{}";

    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};