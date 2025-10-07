import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, subject, grade, standards } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const sys = `You are an instructional design assistant. Given draft lesson context, produce 3-6 clear, measurable learning objectives:
- Use student-centered phrasing ("Students will be able to …")
- Prefer specific Bloom's Taxonomy verbs (analyze, evaluate, create, explain, compare, solve, justify, etc.)
- Where helpful, add brief criteria (accuracy, level of detail, constraints)
- Keep objectives concise (1-2 lines each)
Return objectives as a bulleted list.`;

    const user = [
      subject ? `Subject: ${subject}` : null,
      grade ? `Grade: ${grade}` : null,
      Array.isArray(standards) && standards.length ? `Standards: ${standards.join(", ")}` : null,
      text ? `Draft/Notes: ${text}` : null,
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
          { role: "user", content: user || "Generate appropriate learning objectives." },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
