export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, overall, catPcts, strongestCategory, growthCategory } = req.body;

  const prompt = `Write a personalized results reflection for a college student who just completed an emotional intelligence assessment focused on relationships, rejection, and social connection. Their name is ${name || "the respondent"}. Here are their five area scores as percentages (for your reference only, never state numbers): Self Awareness ${catPcts["Self Awareness"]}%, Self Regulation ${catPcts["Self Regulation"]}%, Motivation ${catPcts.Motivation}%, Empathy ${catPcts.Empathy}%, Social Skills ${catPcts["Social Skills"]}%.

Do NOT mention any numbers, percentages, or the words "score," "evaluation," or "level." Do NOT present the five areas as a list or with labels/ratings attached to each one.

Instead write ONE flowing reflection, 5-6 sentences total, that:
- Weaves in a genuine specific observation about each of the five areas naturally within the prose, not as a list
- Spends the most attention on their one or two weakest areas — name the actual pattern (not a label) and connect it directly to how rejection, disconnection, or being misread probably shows up for them in real relationships
- For every area mentioned, especially the weaker ones, includes what growing in that specific area would actually look or feel like for them — a concrete forward-looking pull, not just a diagnosis. Someone reading this should feel curious and motivated to improve, not judged.
- Ends on one grounded sentence of real hope that this is buildable, not fixed

Tone: warm, direct, perceptive — like a smart friend telling you something true about yourself, not clinical, not jokey. Keep it tight — this should read fast, not like a report.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || null;
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate reflection' });
  }
}
