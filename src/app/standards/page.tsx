"use client";
import { useMemo, useState, useEffect } from "react";
import { standards, type Standard } from "@/data/standards";

const grades = ["K","1","2","3","4","5","6","7","8","9","10","11","12"];
const subjects: Array<Standard["subject"]> = ["ELA","Math"];

type Tag = { id: string; addedAt: number };

export default function StandardsPage() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [subject, setSubject] = useState<Standard["subject"] | "">("");
  const [tags, setTags] = useState<Record<string, Tag>>({});

  useEffect(() => {
    const raw = localStorage.getItem("standards_tags");
    if (raw) setTags(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("standards_tags", JSON.stringify(tags));
  }, [tags]);

  const filtered = useMemo(() => {
    return standards.filter((s) =>
      (subject ? s.subject === subject : true) &&
      (grade ? s.grade === grade : true) &&
      (q ? (s.text.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase())) : true)
    );
  }, [q, grade, subject]);

  const toggleTag = (id: string) => {
    setTags((prev) => {
      const copy = { ...prev };
      if (copy[id]) delete copy[id];
      else copy[id] = { id, addedAt: Date.now() };
      return copy;
    });
  };

  const taggedList = useMemo(() => Object.keys(tags)
    .map(id => standards.find(s => s.id === id))
    .filter(Boolean) as Standard[], [tags]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Standards</h1>

      <section className="grid gap-3 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search standards"
          className="border rounded px-3 py-2 md:col-span-2"
        />
        <select value={subject} onChange={(e)=>setSubject(e.target.value as Standard["subject"] | "")} className="border rounded px-3 py-2">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Grades</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Results ({filtered.length})</h2>
          <ul className="space-y-2">
            {filtered.map(s => (
              <li key={s.id} className="border rounded p-3 flex items-start gap-3">
                <button
                  onClick={() => toggleTag(s.id)}
                  className={`text-sm px-2 py-1 rounded border ${tags[s.id] ? 'bg-blue-600 text-white' : 'bg-white'}`}
                >{tags[s.id] ? 'Tagged' : 'Tag'}</button>
                <div>
                  <div className="text-sm text-gray-600">{s.subject} • Grade {s.grade} • {s.id}</div>
                  <div>{s.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Tagged ({taggedList.length})</h2>
          <ul className="space-y-2">
            {taggedList.map(s => (
              <li key={s.id} className="border rounded p-3 flex items-start gap-3">
                <button
                  onClick={() => toggleTag(s.id)}
                  className="text-sm px-2 py-1 rounded border"
                >Remove</button>
                <div>
                  <div className="text-sm text-gray-600">{s.subject} • Grade {s.grade} • {s.id}</div>
                  <div>{s.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
