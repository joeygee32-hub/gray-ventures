import { useState, useMemo } from "react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVjWMbutg0AIqV7WvAvHUidnfOQgNgCdLpFFX_3XxpwNb9L5e2r8cjUCWTr8_siYhOPQ/exec";

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
  { id: 1, category: "Self Awareness", text: "Someone you were interested in stops responding the way they used to. Before you do anything else, you:", options: [{ text: "Notice you're hurt, and talk it through with someone you trust to understand what's actually going on for you", score: 4 }, { text: "Immediately assume something is wrong with you and spiral a bit", score: 2 }, { text: "Decide they're just not worth your time and move on without much thought", score: 1 }, { text: "Tell yourself it doesn't bother you, while checking your phone constantly", score: 2 }] },
  { id: 2, category: "Self Awareness", text: "You've been irritable and distant with people for a few days. Thinking back on it honestly, you:", options: [{ text: "Can trace it to something specific, and mention it to someone close to you instead of just carrying it alone", score: 4 }, { text: "Genuinely have no idea what's been going on with you", score: 2 }, { text: "Chalk it up to everyone else being annoying lately", score: 1 }, { text: "Noticed it but didn't think much about why", score: 2 }] },
  { id: 3, category: "Self Awareness", text: "A friend mentions you've seemed off lately. Your honest internal reaction:", options: [{ text: "Recognition — and you're actually glad they said something, since it gives you a chance to talk it through", score: 4 }, { text: "Genuine surprise — you had no idea it was noticeable", score: 2 }, { text: "A flash of defensiveness — you feel like you've been fine", score: 1 }, { text: "Vague guilt without being able to name what's actually different", score: 2 }] },
  { id: 4, category: "Self Awareness", text: "You're about to walk into a social situation where you don't know many people and you notice your chest tighten a little. You:", options: [{ text: "Notice the nerves and text a friend something like 'kind of nervous about this' before going in — saying it out loud helps it settle", score: 4 }, { text: "Spend the whole walk in overthinking how you're coming across", score: 2 }, { text: "Tell yourself to just relax, which rarely actually works", score: 2 }, { text: "Find the one person you know and stay close to them the entire time", score: 3 }] },
  { id: 5, category: "Self Awareness", text: "After a disagreement with someone you care about, sitting alone afterward, you're most likely to:", options: [{ text: "Genuinely look at your own part in it, and talk it through with the person once you've both cooled off", score: 4 }, { text: "Replay the moments that prove you were right, feeling more justified each time", score: 1 }, { text: "Feel guilty by default even if you're not sure you did anything wrong", score: 2 }, { text: "Feel too caught up in it to think clearly about what happened", score: 2 }] },
  { id: 6, category: "Self Regulation", text: "You put yourself out there with someone and get turned down. In the hours after, you:", options: [{ text: "Let yourself feel the disappointment and reach out to a friend to talk it through rather than carrying it alone", score: 4 }, { text: "Replay it over and over, picking apart everything you said, by yourself", score: 2 }, { text: "Convince yourself you didn't really care that much anyway", score: 1 }, { text: "Feel it hard for a while and find it difficult to focus on anything else", score: 2 }] },
  { id: 7, category: "Self Regulation", text: "A friend shares something you told them in confidence. Your first move once you find out:", options: [{ text: "Feel genuinely hurt, and once you've calmed down enough, tell them directly how it affected you", score: 4 }, { text: "Say something to them immediately, before you've really processed it", score: 2 }, { text: "Say nothing outwardly but start quietly pulling away from the friendship", score: 1 }, { text: "Vent to other people about it before you've figured out how you actually feel", score: 1 }] },
  { id: 8, category: "Self Regulation", text: "Someone you're talking to takes a while to respond, and you notice yourself getting anxious about what it means. You:", options: [{ text: "Notice the anxiety and mention it to a friend or say something honest to the person instead of just sitting with it alone", score: 4 }, { text: "Double or triple text to fill the silence", score: 2 }, { text: "Start mentally drafting reasons to be upset with them", score: 1 }, { text: "Go quiet and distant the next time they do reach out", score: 1 }] },
  { id: 9, category: "Self Regulation", text: "In a group conversation, someone says something you strongly disagree with. You:", options: [{ text: "Let them finish, take a beat, then respond honestly without matching their energy", score: 4 }, { text: "Jump in right away because waiting feels harder than saying something", score: 2 }, { text: "Stay quiet in the moment but bring it up with someone else afterward", score: 2 }, { text: "Respond immediately in a way that shifts the mood of the room", score: 1 }] },
  { id: 10, category: "Self Regulation", text: "Something you were counting on falls through at the last minute, through no fault of your own. Honestly, you:", options: [{ text: "Let yourself be frustrated for a bit and talk it out with someone before shifting toward what's next", score: 4 }, { text: "Push straight into problem-solving mode and deal with the feelings later, badly", score: 2 }, { text: "Feel derailed by it for longer than you'd like to admit, mostly on your own", score: 2 }, { text: "Focus entirely on what went wrong externally — taking it personally feels pointless", score: 1 }] },
  { id: 11, category: "Motivation", text: "A relationship or friendship you were investing in ends up going nowhere. In the weeks after, you:", options: [{ text: "Talk it through with someone you trust and reflect honestly on what you want next time", score: 4 }, { text: "Decide relationships like that aren't really worth the effort for a while", score: 2 }, { text: "Keep putting yourself out there anyway, but with visibly less energy each time, and don't really talk about it", score: 2 }, { text: "Throw yourself hard into something else to avoid thinking about it", score: 1 }] },
  { id: 12, category: "Motivation", text: "You've had a string of situations that didn't go the way you hoped socially. Your honest pattern is:", options: [{ text: "You talk about it with someone close to you and stay open to trying again, even though it's uncomfortable", score: 4 }, { text: "You start assuming the next one will go the same way before it even happens", score: 2 }, { text: "You pull back and put in noticeably less effort with new people", score: 1 }, { text: "You push forward, but it's more forced than genuine at this point", score: 2 }] },
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

const introLines = [
  "Ever feel like other people just get relationships in a way you don't? Like everyone else got a manual you missed?",
  "Ever put yourself out there, get turned down, and can't quite figure out why it keeps happening the same way?",
  "Ever leave a conversation replaying it, wondering if you came across the way you meant to?"
];

function ShareButton({ label }: { label: string }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const message = `Ok this emotional intelligence thing is actually kind of scary accurate, you have to try it: ${shareUrl}`;
  const smsLink = `sms:?&body=${encodeURIComponent(message)}`;
  return (
    <a href={smsLink} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "12px", fontSize: 14, textAlign: "center" as const, cursor: "pointer", background: "white", color: "#185FA5", border: "2px solid #185FA5", borderRadius: 8, textDecoration: "none", fontWeight: 600, marginBottom: "1rem" }}>
      {label}
    </a>
  );
}

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
    const breakdown = categories.map(c => ({ category: c, pct: catPcts[c], level: getLevel(catPcts[c]) }));
    const strongest = breakdown.reduce((a, b) => a.pct > b.pct ? a : b);
    const growth = breakdown.reduce((a, b) => a.pct < b.pct ? a : b);
    let summary = "Your results are a genuinely interesting mix — some real strengths and some honest work-in-progress spots. Relatable, honestly.";
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, overall, catPcts, strongestCategory: strongest.category, growthCategory: growth.category })
      });
      const data = await res.json();
      if (data.text) summary = data.text;
    } catch (err) { console.error("ERROR:", err); }
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
        <div style={{ ...s.card, background: "#E6F1FB", border: "1px solid #185FA530", marginBottom: "1rem" }}>
          <p style={{ fontSize: 14, color: "#1a1a1a", margin: 0, lineHeight: 1.75 }}>{summary}</p>
        </div>
        <ShareButton label="Send this to a friend" />
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", margin: "0 0 10px" }}>Here's a place to actually start</p>
        <LinksSection scores={{ ...catPcts, overall }} />
        <FeedbackForm name={name} scores={{ ...catPcts, overall }} />
        <ShareButton label="Send this to a friend" />
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
