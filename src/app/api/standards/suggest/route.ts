import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lesson, candidates } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });

    const sys = `You rank K–12 standards for relevance to a lesson plan.
- Consider subject, grade, title, objectives, activities, materials
- Return the top 10 standard IDs (from provided candidates) in JSON array order by relevance
- Be conservative: prefer exact-grade and subject matches when tied`;

    const user = {
      lesson,
      candidates, // [{id, text, subject, grade}]
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(user) },
        ],
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const err = await resp.text().catch(() => "");
      return NextResponse.json({ error: `OpenAI error: ${resp.status} ${err}` }, { status: 500 });
    }

    const data = await resp.json();
    let ids: string[] = [];
    try {
      const obj = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
      ids = Array.isArray(obj.ids) ? obj.ids.slice(0, 10) : [];
    } catch {
      ids = [];
    }
    return NextResponse.json({ ids });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
