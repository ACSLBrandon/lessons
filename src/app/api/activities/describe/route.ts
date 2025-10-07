import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, description, materials } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const sys = `You write concise lesson plan activity descriptions.
- Use 1-3 sentences, student-centered and actionable
- Incorporate provided materials and refine any draft text
- Avoid fluff and restating the title; add specificity (how, criteria)
Return plain text only, no bullets.`;

    const user = [
      title ? `Activity Title: ${title}` : null,
      description ? `Draft Description: ${description}` : null,
      materials ? `Available Materials: ${materials}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user || "Write a concise, specific activity description." },
        ],
        temperature: 0.6,
        max_tokens: 220,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text().catch(() => "");
      return NextResponse.json({ error: `OpenAI error: ${resp.status} ${err}` }, { status: 500 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? "";
    return NextResponse.json({ text: content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
