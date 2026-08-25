import { useState, useMemo } from "react";

const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

const submitData = async (data: Record<string, string>) => {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
      } catch (err) { console.error("ERROR:", err); }
};

const rawQuestions = [
  { id: 1, category: "Self Awareness", text: "Someone you were interested in stops responding the way they used to. Before you do anything else, you:", options: [{ text: "Notice you're hurt, and try to understand what part of that is about you versus them", score: 4 }, { text: "Immediately assume something is wrong with you and spiral a bit", score: 2 }, { text: "Decide they're just not worth your time and move on without much thought", score: 1 }, { text: "Tell yourself it doesn't bother you, while checking your phone constantly", score: 2 }] },
  { id: 2, category: "Self Awareness", text: "You've been irritable and distant with people for a few days. Thinking back on it honestly, you:", options: [{ text: "Can trace it to something specific that's been weighing on you", score: 4 }, { text: "Genuinely have no idea what's been going on with you", score: 2 }, { text: "Chalk it up to everyone else being annoying lately", score: 1 }, { text: "Noticed it but didn't think much about why", score: 2 }] },
  { id: 3, category: "Self Awareness", text: "A friend mentions you've seemed off lately. Your honest internal reaction:", options: [{ text: "Recognition — you know exactly what's been going on and why it's showing", score: 4 }, { text: "Genuine surprise — you had no idea it was noticeable", score: 2 }, { text: "A flash of defensiveness — you feel like you've been fine", score: 1 }, { text: "Vague guilt without being able to name what's actually different", score: 2 }] },
  { id: 4, category: "Self Awareness", text: "You're about to walk into a social situation where you don't know many people and you notice your chest tighten a little. You:", options: [{ text: "Recognize it as nerves, name it internally, and let it settle before going in", score: 4 }, { text: "Spend the whole walk in overthinking how you're coming across", score: 2 }, { text: "Tell yourself to just relax, which rarely actually works", score: 2 }, { text: "Find the one person you know and stay close to them the entire time", score: 1 }] },
  { id: 5, category: "Self Awareness", text: "After a disagreement with someone you care about, sitting alone afterward, you're most likely to:", options: [{ text: "Genuinely look at your own part in it, not just theirs", score: 4 }, { text: "Replay the moments that prove you were right, feeling more justified each time", score: 1 }, { text: "Feel guilty by default even if you're not sure you did anything wrong", score: 2 }, { text: "Feel too caught up in it to think clearly about what happened", score: 2 }] },
  { id: 6, category: "Self Regulation", text: "You put yourself out there with someone and get turned down. In the hours after, you:", options: [{ text: "Let yourself feel the disappointment, then go about your day without dwelling on it for long", score: 4 }, { text: "Replay it over and over, picking apart everything you said", score: 2 }, { text: "Convince yourself you didn't really care that much anyway", score: 1 }, { text: "Feel it hard for a while and find it difficult to focus on anything else", score: 2 }] },
  { id: 7, category: "Self Regulation", text: "A friend shares something you told them in confidence. Your first move once you find out:", options: [{ text: "Feel genuinely hurt, sit with it, then bring it up with them directly once you're calm", score: 4 }, { text: "Say something to them immediately, before you've really processed it", score: 2 }, { text: "Say nothing outwardly but start quietly pulling away from the friendship", score: 2 }, { text: "Vent to other people about it before you've figured out how you actually feel", score: 1 }] },
  { id: 8, category: "Self Regulation", text: "Someone you're talking to takes a while to respond, and you notice yourself getting anxious about what it means. You:", options: [{ text: "Notice the anxiety, acknowledge it, and try not to let it drive your next move", score: 4 }, { text: "Double or triple text to fill the silence", score: 2 }, { text: "Start mentally drafting reasons to be upset with them", score: 1 }, { text: "Go quiet and distant the next time they do reach out", score: 2 }] },
  { id: 9, category: "Self Regulation", text: "In a group conversation, someone says something you strongly disagree with. You:", options: [{ text: "Let them finish, take a beat, then respond without matching their energy", score: 4 }, { text: "Jump in right away because waiting feels harder than saying something", score: 2 }, { text: "Stay quiet in the moment but bring it up with someone else afterward", score: 2 }, { text: "Respond immediately in a way that shifts the mood of the room", score: 1 }] },
  { id: 10, category: "Self Regulation", text: "Something you were counting on falls through at the last minute, through no fault of your own. Honestly, you:", options: [{ text: "Let yourself be frustrated for a bit, then shift toward what's next", score: 4 }, { text: "Push straight into problem-solving mode and deal with the feelings later, badly", score: 2 }, { text: "Feel derailed by it for longer than you'd like to admit", score: 2 }, { text: "Focus entirely on what went wrong externally — taking it personally feels pointless", score: 1 }] },
  { id: 11, category: "Motivation", text: "A relationship or friendship you were investing in ends up going nowhere. In the weeks after, you:", options: [{ text: "Reflect honestly on what you want next time, without shutting down completely", score: 4 }, { text: "Decide relationships like that aren't really worth the effort for a while", score: 2 }, { text: "Keep putting yourself out there anyway, but with visibly less energy each time", score: 2 }, { text: "Throw yourself hard into something else to avoid thinking about it", score: 1 }] },
  { id: 12, category: "Motivation", text: "You've had a string of situations that didn't go the way you hoped socially. Your honest pattern is:", options: [{ text: "You stay open to trying again, even though it's uncomfortable", score: 4 }, { text: "You start assuming the next one will go the same way before it even happens", score: 2 }, { text: "You pull back and put in noticeably less effort with new people", score: 1 }, { text: "You push forward, but it's more forced than genuine at this point", score: 2 }] },
  { id: 13, category: "Empathy", text: "A friend calls you upset because things didn't work out with someone they liked. Your first instinct:", options: [{ text: "Sit with them in the disappointment before offering any perspective", score: 4 }, { text: "Point out reasons it's probably for the best", score: 2 }, { text: "Bring up a similar situation of yours so they feel less alone", score: 2 }, { text: "Ask a lot of questions to understand exactly what happened", score: 1 }] },
  { id: 14, category: "Empathy", text: "You're talking to someone and notice they seem a little distant or distracted. You:", options: [{ text: "Gently name it — 'you seem a little off, everything okay?' — and mean it", score: 4 }, { text: "Continue on and figure they'll bring it up if it matters", score: 3 }, { text: "Feel mildly put off that they're not fully engaged with you", score: 1 }, { text: "Notice it but only mention it if it becomes relevant later", score: 2 }] },
  { id: 15, category: "Empathy", text: "Someone reacts strongly to something that genuinely wouldn't bother you. You:", options: [{ text: "Try to actually understand why it lands so differently for them", score: 4 }, { text: "Go along with it without really connecting to why it matters to them", score: 2 }, { text: "Say something supportive while privately thinking they're overreacting", score: 2 }, { text: "Focus on the practical side of the situation instead of the emotional one", score: 1 }] },
  { id: 16, category: "Empathy", text: "Someone you're close with is clearly not okay but insists they're fine. You:", options: [{ text: "Leave space without pressure — 'no rush, I'm here when you're ready'", score: 4 }, { text: "Take them at their word, pushing further feels like overstepping", score: 2 }, { text: "Keep gently checking because you can tell something's wrong", score: 2 }, { text: "Pull back too — if they won't let you in, you tend to step away", score: 1 }] },
  { id: 17, category: "Social Skills", text: "You need to tell someone something honest that might hurt to hear. You:", options: [{ text: "Say it directly but with real care, leading with why you're saying it at all", score: 4 }, { text: "Soften it so much the actual message barely comes through", score: 2 }, { text: "Wait until they ask, it doesn't feel like your place otherwise", score: 2 }, { text: "Text it instead of saying it in person to avoid the discomfort", score: 1 }] },
  { id: 18, category: "Social Skills", text: "Things have felt off between you and someone you're interested in, and you're not sure why. You:", options: [{ text: "Ask them directly, even though it's uncomfortable, rather than guessing", score: 4 }, { text: "Wait to see if they bring it up first", score: 2 }, { text: "Assume the worst and start pulling back before you even know what happened", score: 1 }, { text: "Act completely normal and hope it resolves on its own", score: 2 }] },
  { id: 19, category: "Social Skills", text: "You walk into a social setting where you know almost nobody. Honestly:", options: [{ text: "You're genuinely curious who you'll end up talking to", score: 4 }, { text: "You find the one person you know and stay near them most of the time", score: 2 }, { text: "You circulate but keep it light until you feel more comfortable", score: 3 }, { text: "You push through the discomfort, but it's pretty visible", score: 2 }] },
  { id: 20, category: "Social Skills", text: "After a real disagreement with someone who matters to you, the relationship feels strained. You:", options: [{ text: "Reach out to clear the air, even though it's uncomfortable, because the relationship matters more", score: 4 }, { text: "Wait for them to make the first move since you already said your piece", score: 2 }, { text: "Act normal and hope enough time passes that it stops feeling weird", score: 1 }, { text: "Bring it up only if they seem like they want to talk about it", score: 2 }] }
];

const categories = ["Self Awareness", "Self Regulation", "Motivation", "Empathy", "Social Skills"];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getLevel = (pct: number) => {
  if (pct >= 85) return { label: "You've basically got this figured out", color: "#1D9E75", bg: "#E1F5EE" };
  if (pct >= 70) return { label: "Solid, with a few gaps", color: "#185FA5", bg: "#E6F1FB" };
  if (pct >= 55) return { label: "A work in progress (aren't we all)", color: "#BA7517", bg: "#FAEEDA" };
  return { label: "Room to grow, no shame in it", color: "#993C1D", bg: "#FAECE7" };
};

const insights: Record<string, Record<string, string>> = {
  "Self Awareness": {
    "You've basically got this figured out": "You know what you're feeling while you're feeling it, which is honestly rarer than it should be. You catch your own patterns before they catch you.",
    "Solid, with a few gaps": "Most of the time you're tuned in to your own emotional weather. Every once in a while something sneaks up on you, but you recover fast.",
    "A work in progress (aren't we all)": "You're getting better at naming what you feel, but sometimes you're three days deep into a mood before you realize what started it.",
    "Room to grow, no shame in it": "You're often reacting before you've clocked why. The good news — this is the easiest thing to build with a little practice."
  },
  "Self Regulation": {
    "You've basically got this figured out": "You feel things fully without letting them drive the car. That's a genuinely underrated skill.",
    "Solid, with a few gaps": "You keep it together in most situations. High-pressure moments occasionally test you, but you find your footing.",
    "A work in progress (aren't we all)": "Your feelings sometimes get a head start on your actions. A little more pause between the two would go a long way.",
    "Room to grow, no shame in it": "Your reactions often move faster than your thinking does. Building in even a five second pause could change a lot."
  },
  Motivation: {
    "You've basically got this figured out": "Your drive comes from inside, not from someone checking up on you. That's going to take you far.",
    "Solid, with a few gaps": "You're generally self-motivated, though the occasional dead week happens to the best of us.",
    "A work in progress (aren't we all)": "You do great with structure and deadlines, less great without them. Building your own structure is the next unlock.",
    "Room to grow, no shame in it": "Motivation without a deadline attached is tough for you right now. Connecting your goals to something that actually matters to you personally will help more than any productivity hack."
  },
  Empathy: {
    "You've basically got this figured out": "You actually sit with people in what they're feeling instead of rushing to fix it. People notice that about you.",
    "Solid, with a few gaps": "You genuinely care and it shows, though sometimes your instinct to help outruns your instinct to just listen first.",
    "A work in progress (aren't we all)": "You care, but you jump to advice a little quick sometimes. Try just listening for an extra thirty seconds before you respond next time.",
    "Room to grow, no shame in it": "Other people's emotional stuff doesn't always land for you right away. Getting curious about the 'why' behind their reaction is a good place to start."
  },
  "Social Skills": {
    "You've basically got this figured out": "You navigate people and awkward moments with more ease than you probably give yourself credit for.",
    "Solid, with a few gaps": "You're generally comfortable in most social situations. The hard conversations still take a little extra nerve, understandably.",
    "A work in progress (aren't we all)": "You've got decent instincts but you tend to dodge the harder conversations. That avoidance costs more than the conversation would.",
    "Room to grow, no shame in it": "Conflict and unfamiliar social settings feel genuinely uncomfortable for you. That's extremely fixable with some low-stakes reps."
  }
};

const introLines = [
  "Ever feel like other people just get relationships in a way you don't? Like everyone else got a manual you missed?",
  "Ever put yourself out there, get turned down, and can't quite figure out why it keeps happening the same way?",
  "Ever leave a conversation replaying it, wondering if you came across the way you meant to?"
];

function LinksSection({ scores }: { scores: Record<string, number> }) {
  return (
    <div style={{ border: "2px dashed #ccc", borderRadius: 12, padding: "1.5rem", marginBottom: "1rem", background: "#fafafa" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#888", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>[ Resource links go here — placeholder ]</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ padding: "12px", background: "white", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>📚 Cheap option — book links (Amazon affiliate) go here</p>
        </div>
        <div style={{ padding: "12px", background: "white", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>🎓 Mid option — course link goes here</p>
        </div>
        <div style={{ padding: "12px", background: "white", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>💬 High ticket — MyCounselor referral link + discount code goes here</p>
        </div>
      </div>
    </div>
  );
}

function FeedbackForm({ name, scores }: { name: string; scores: Record<string, number> }) {
  const [relevant, setRelevant] = useState("");
  const [accurate, setAccurate] = useState("");
  const [wouldShare, setWouldShare] = useState("");
  const [improve, setImprove] = useState("");
  const [oneWord, setOneWord] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await submitData({
      name: name || "Anonymous",
      email: email || "not provided",
      overall: String(scores.overall),
      selfAwareness: String(scores["Self Awareness"]),
      selfRegulation: String(scores["Self Regulation"]),
      motivation: String(scores.Motivation),
      empathy: String(scores.Empathy),
      socialSkills: String(scores["Social Skills"]),
      feltRelevant: relevant,
      mostAccurate: accurate,
      wouldShare: wouldShare,
      improvement: improve,
      oneWord: oneWord
    });
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ background: "#E1F5EE", borderRadius: 12, padding: "1.25rem", border: "1px solid #1D9E7530" }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#1D9E75", margin: 0 }}>Appreciate you taking the time — genuinely helps.</p>
    </div>
  );

  return (
    <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "1.25rem", border: "1px solid #e0e0e0" }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px" }}>Before you go — one more thing</p>
      <p style={{ fontSize: 13, color: "#555", margin: "0 0 1.25rem", lineHeight: 1.6 }}>Takes about a minute. Your honest feedback actually shapes what this becomes.</p>

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Did this feel relevant to your actual life?</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["Yeah, more than I expected", "Somewhat", "Not really"].map(opt => (
          <button key={opt} onClick={() => setRelevant(opt)} style={{ flex: 1, padding: "8px 6px", fontSize: 12, borderRadius: 8, border: relevant === opt ? "2px solid #185FA5" : "1px solid #ccc", background: relevant === opt ? "#E6F1FB" : "white", cursor: "pointer" }}>{opt}</button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Was anything especially accurate — or off?</label>
      <textarea value={accurate} onChange={e => setAccurate(e.target.value)} rows={2} placeholder="Optional" style={{ width: "100%", boxSizing: "border-box", padding: "10px", fontSize: 13, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontFamily: "inherit" }} />

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Would you send this to a friend?</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["Already know who", "Maybe", "No"].map(opt => (
          <button key={opt} onClick={() => setWouldShare(opt)} style={{ flex: 1, padding: "8px 6px", fontSize: 12, borderRadius: 8, border: wouldShare === opt ? "2px solid #185FA5" : "1px solid #ccc", background: wouldShare === opt ? "#E6F1FB" : "white", cursor: "pointer" }}>{opt}</button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>What would make this better?</label>
      <textarea value={improve} onChange={e => setImprove(e.target.value)} rows={2} placeholder="Be honest" style={{ width: "100%", boxSizing: "border-box", padding: "10px", fontSize: 13, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, fontFamily: "inherit" }} />

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>One word for how you feel right now</label>
      <input value={oneWord} onChange={e => setOneWord(e.target.value)} placeholder="Type one word" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 16 }} />

      <label style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Email (optional — want updates as this develops?)</label>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 16 }} />

      <button onClick={handleSubmit} style={{ width: "100%", padding: "12px", fontSize: 14, cursor: "pointer", background: "#185FA5", color: "white", border: "none", borderRadius: 8 }}>Submit feedback</button>
    </div>
  );
}

export default function GrayEQ() {
  const [screen, setScreen] = useState("intro");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { category: string; score: number }>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);

  const shuffledQuestions = useMemo(() => rawQuestions.map(q => ({ ...q, shuffledOptions: shuffle(q.options) })), []);
  const q = shuffledQuestions[current];
  const progress = Math.round(((current + 1) / shuffledQuestions.length) * 100);
  const introLine = useMemo(() => introLines[Math.floor(Math.random() * introLines.length)], []);

  const handleNext = () => {
    if (selected === null) return;
    const opt = q.shuffledOptions[selected];
    const updated = { ...answers, [q.id]: { category: q.category, score: opt.score } };
    setAnswers(updated);
    setSelected(null);
    if (current + 1 < shuffledQuestions.length) { setCurrent(current + 1); }
    else { computeResults(updated); }
  };

  const computeResults = async (ans: Record<number, { category: string; score: number }>) => {
    setScreen("loading");
    const catScores: Record<string, number> = {};
    const catMax: Record<string, number> = {};
    categories.forEach(c => { catScores[c] = 0; catMax[c] = 0; });
    Object.values(ans).forEach(({ category, score }) => { catScores[category] += score; catMax[category] += 4; });
    const catPcts: Record<string, number> = {};
    categories.forEach(c => { catPcts[c] = Math.round((catScores[c] / catMax[c]) * 100); });
    const overall = Math.round(Object.values(catPcts).reduce((a, b) => a + b, 0) / 5);
    const breakdown = categories.map(c => ({ category: c, pct: catPcts[c], level: getLevel(catPcts[c]), insight: insights[c][getLevel(catPcts[c]).label] }));
    const strongest = breakdown.reduce((a, b) => a.pct > b.pct ? a : b);
    const growth = breakdown.reduce((a, b) => a.pct < b.pct ? a : b);
    let summary = "Your results are a genuinely interesting mix — some real strengths and some honest work-in-progress spots. Relatable, honestly.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 700, messages: [{ role: "user", content: `Write a personalized results reflection for a college student who just completed an emotional intelligence assessment focused on relationships, rejection, and social connection. Their name is ${name || "the respondent"}. Here are their five area scores as percentages (for your reference only, never state numbers): Self Awareness ${catPcts["Self Awareness"]}%, Self Regulation ${catPcts["Self Regulation"]}%, Motivation ${catPcts.Motivation}%, Empathy ${catPcts.Empathy}%, Social Skills ${catPcts["Social Skills"]}%.

Do NOT mention any numbers, percentages, or the words "score," "evaluation," or "level." Do NOT present the five areas as a list or with labels/ratings attached to each one.

Instead write ONE flowing reflection, 5-6 sentences total, that:
- Weaves in a genuine specific observation about each of the five areas naturally within the prose, not as a list
- Spends the most attention on their one or two weakest areas — name the actual pattern (not a label) and connect it directly to how rejection, disconnection, or being misread probably shows up for them in real relationships
- For every area mentioned, especially the weaker ones, includes what growing in that specific area would actually look or feel like for them — a concrete forward-looking pull, not just a diagnosis. Someone reading this should feel curious and motivated to improve, not judged.
- Ends on one grounded sentence of real hope that this is buildable, not fixed

Tone: warm, direct, perceptive — like a smart friend telling you something true about yourself, not clinical, not jokey. Keep it tight — this should read fast, not like a report.` }] })
      });
      const data = await res.json();
      if (data.content?.[0]?.text) summary = data.content[0].text;
    } catch {}
    setResults({ overall, catPcts, breakdown, strongest, growth, summary });
    setScreen("results");
  };

  const s = { container: { maxWidth: 620, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }, label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" as const, margin: "0 0 8px", display: "block" }, h1: { fontSize: 26, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px", lineHeight: 1.2 }, card: { background: "#f8f8f8", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem", border: "1px solid #e0e0e0" }, btn: { width: "100%", padding: "12px", fontSize: 15, cursor: "pointer", background: "#185FA5", color: "white", border: "none", borderRadius: 8, marginTop: 8 } };

  if (screen === "intro") return (
    <div style={s.container}>
      <span style={s.label}>Gray Ventures</span>
      <h1 style={s.h1}>{introLine}</h1>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: "1.5rem" }}>Real scenarios, not the usual "rate yourself 1 to 5" format every other test uses. Takes about 5 minutes. There's no way to get this wrong — just answer how you'd actually react, not how you think you should.</p>
      <div style={s.card}>
        <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.7 }}>No one sees your results but you. This isn't a test you pass or fail — it's more of a mirror. The more honest you are, the more useful it'll actually be.</p>
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6 }}>Name (optional)</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }} />
      </div>
      <button onClick={() => setScreen("test")} style={s.btn}>Let's go</button>
    </div>
  );

  if (screen === "loading") return (
    <div style={{ ...s.container, textAlign: "center", padding: "4rem 1rem" }}>
      <span style={s.label}>Gray Ventures</span>
      <p style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: "8px 0" }}>Putting your results together</p>
      <p style={{ fontSize: 14, color: "#555" }}>One sec...</p>
    </div>
  );

  if (screen === "results" && results) {
    const { summary, catPcts, overall } = results;
    return (
      <div style={s.container}>
        <span style={s.label}>Gray Ventures</span>
        <h1 style={{ ...s.h1, marginBottom: 16 }}>Alright{name ? `, ${name}` : ""}, here's what came up</h1>
        <div style={{ ...s.card, background: "#E6F1FB", border: "1px solid #185FA530", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 14, color: "#1a1a1a", margin: 0, lineHeight: 1.75 }}>{summary}</p>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", margin: "0 0 10px" }}>Here's a place to actually start</p>
        <LinksSection scores={{ ...catPcts, overall }} />
        <FeedbackForm name={name} scores={{ ...catPcts, overall }} />
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <span style={{ ...s.label, margin: 0 }}>Gray Ventures</span>
      </div>
      <div style={{ height: 6, background: "#e0e0e0", borderRadius: 6, marginBottom: "1.5rem", overflow: "hidden" }}>
        <div style={{ height: 6, width: `${progress}%`, background: "#185FA5", borderRadius: 6, transition: "width 0.3s ease" }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.5, margin: "0 0 1.25rem" }}>{q.text}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
        {q.shuffledOptions.map((opt: any, i: number) => (
          <div key={i} onClick={() => setSelected(i)} style={{ padding: "1rem 1.25rem", borderRadius: 12, border: selected === i ? "2px solid #185FA5" : "1px solid #e0e0e0", background: selected === i ? "#E6F1FB" : "#f8f8f8", cursor: "pointer", transition: "all 0.12s ease" }}>
            <p style={{ fontSize: 14, color: "#1a1a1a", margin: 0, lineHeight: 1.6 }}>{opt.text}</p>
          </div>
        ))}
      </div>
      <button onClick={handleNext} disabled={selected === null} style={{ ...s.btn, opacity: selected === null ? 0.4 : 1, cursor: selected === null ? "not-allowed" : "pointer" }}>
        {current + 1 === shuffledQuestions.length ? "See my results" : "Next"}
      </button>
    </div>
  );
}
