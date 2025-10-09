"use client";
import { useEffect, useMemo, useState } from "react";
import { standards as allStandards } from "@/data/standards";

type Template = {
  id: string;
  title: string;
  subject: "ELA" | "Math" | "";
  grade: string; // K,1-12 or ""
  objectives: string;
  activities: { title: string; description?: string }[];
  materials: string;
  concepts?: string;
  discussion?: string;
  standardIds: string[];
};

const grades = ["","K","1","2","3","4","5","6","7","8","9","10","11","12"];
const subjects: Array<Template["subject"]> = ["","ELA","Math"];

const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
};
const save = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filterSubject, setFilterSubject] = useState<Template["subject"]>("");
  const [filterGrade, setFilterGrade] = useState<string>("");

  // form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Template["subject"]>("");
  const [grade, setGrade] = useState<string>("");
  const [objectives, setObjectives] = useState("");
  const [activities, setActivities] = useState<{ title: string; description?: string }[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [materials, setMaterials] = useState("");
  const [concepts, setConcepts] = useState("");
  const [discussion, setDiscussion] = useState("");
  const [stdQuery, setStdQuery] = useState("");
  const [standardIds, setStandardIds] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => { setItems(load<Template[]>("templates", [])); }, []);
  useEffect(() => { save("templates", items); }, [items]);

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setSubject(""); setGrade("");
    setObjectives(""); setActivities([]); setNewActivityTitle(""); setNewActivityDesc(""); setMaterials(""); setConcepts(""); setDiscussion("");
    setStdQuery(""); setStandardIds([]);
  };

  const beginEdit = (t: Template) => {
    setEditingId(t.id);
    setTitle(t.title); setSubject(t.subject); setGrade(t.grade);
    setObjectives(t.objectives);
    setActivities(Array.isArray(t.activities)
      ? (typeof t.activities[0] === "string" ? (t.activities as unknown as string[]).map(s=>({ title: s })) : t.activities as {title:string;description?:string}[])
      : (t.activities ? [{ title: String(t.activities as unknown as string) }] : [])
    );
    setMaterials(t.materials);
    setConcepts(t.concepts || ""); setDiscussion(t.discussion || "");
    setStandardIds(t.standardIds ?? []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upsert = () => {
    if (!title.trim()) return;
    if (editingId) {
      setItems(prev => prev.map(it => it.id === editingId ? { ...it,
        title: title.trim(), subject, grade, objectives, activities, materials, concepts, discussion, standardIds } : it));
    } else {
      const id = crypto.randomUUID();
      setItems(prev => [...prev, { id, title: title.trim(), subject, grade, objectives, activities, materials, concepts, discussion, standardIds }]);
    }
    resetForm();
  };

  const remove = (id: string) => setItems(prev => prev.filter(it => it.id !== id));

  const toggleStd = (id: string) => setStandardIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const standardsFiltered = useMemo(() => {
    const ql = stdQuery.toLowerCase();
    const list = allStandards.filter(s =>
      (filterSubject ? s.subject === filterSubject : true) &&
      (filterGrade ? s.grade === filterGrade : true) &&
      (ql ? (s.text.toLowerCase().includes(ql) || s.id.toLowerCase().includes(ql)) : true)
    );
    return list.slice(0, 12);
  }, [stdQuery, filterSubject, filterGrade]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return items.filter(t =>
      (filterSubject ? t.subject === filterSubject : true) &&
      (filterGrade ? t.grade === filterGrade : true) &&
      (ql ? (
        t.title.toLowerCase().includes(ql) ||
        t.objectives.toLowerCase().includes(ql) ||
        (Array.isArray(t.activities)
          ? t.activities.map(a => typeof a === "string" ? a : `${a.title} ${a.description||""}`).join("\n").toLowerCase().includes(ql)
          : String(t.activities||"").toLowerCase().includes(ql)
        ) ||
        t.materials.toLowerCase().includes(ql)
      ) : true)
    );
  }, [items, q, filterSubject, filterGrade]);

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Lesson Plans</h1>

      <section className="space-y-4">
        <h2 className="font-semibold">{editingId ? "Edit lesson plan" : "New lesson plan"}</h2>
        <div className="grid gap-2 md:grid-cols-12 items-start">
          <div className="md:col-span-7">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border rounded px-3 py-2 w-full"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select value={subject} onChange={e=>setSubject(e.target.value as Template["subject"])} className="border rounded px-3 py-2 h-10 w-full">
              {subjects.map(s => <option key={s} value={s}>{s || "Subject"}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Grade</label>
            <select value={grade} onChange={e=>setGrade(e.target.value)} className="border rounded px-3 py-2 h-10 w-full">
              {grades.map(g => <option key={g} value={g}>{g || "Grade"}</option>)}
            </select>
          </div>
          <div className="self-end md:col-span-1 flex">
            <button onClick={upsert} className="border rounded px-3 py-2 bg-emerald-600 text-white grow">{editingId ? "Update" : "Add"}</button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Objectives</label>
          <textarea value={objectives} onChange={e=>setObjectives(e.target.value)} placeholder="Objectives" className="border rounded px-3 py-2 w-full min-h-20 resize-none"/>
          <div className="flex gap-2">
            <button type="button" disabled={aiLoading} onClick={async ()=>{
              try {
                setAiLoading(true);
                const res = await fetch("/api/objectives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: objectives, subject, grade, standards: standardIds }) });
                const data = await res.json();
                if (data?.text) {
                  const sep = objectives.trim() ? "\n\n" : "";
                  setObjectives(prev => prev + sep + data.text);
                }
              } catch (e) {
                console.error(e);
              } finally {
                setAiLoading(false);
              }
            }} className="border rounded px-3 py-2 bg-emerald-600 text-white">{aiLoading?"Generating…":"AI Elaborate"}</button>
            <span className="text-xs text-gray-600">Uses OpenAI; set OPENAI_API_KEY in deployment.</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-6" />
          <label className="block text-sm font-medium">Activities</label>
          <div className="grid md:grid-cols-8 gap-2 items-start">
            <input value={newActivityTitle} onChange={e=>setNewActivityTitle(e.target.value)} placeholder="Activity title" className="border rounded px-3 py-2 h-10 md:col-span-3"/>
            <input value={newActivityDesc} onChange={e=>setNewActivityDesc(e.target.value)} placeholder="Description (optional)" className="border rounded px-3 py-2 h-10 md:col-span-3"/>
            <div className="flex gap-2 md:col-span-2">
              <button type="button" onClick={()=>{ const t=newActivityTitle.trim(); const d=newActivityDesc.trim(); if(!t) return; setActivities(prev=>[...prev,{ title:t, description:d||undefined }]); setNewActivityTitle(""); setNewActivityDesc(""); }} className="border rounded px-3 py-2 grow">Add</button>
              <button type="button" disabled={aiLoading} onClick={async()=>{
                try {
                  setAiLoading(true);
                  const res = await fetch("/api/activities/describe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newActivityTitle, description: newActivityDesc, materials }) });
                  const data = await res.json();
                  if (data?.text) setNewActivityDesc(prev => (prev?.trim()? prev+"\n" : "") + data.text);
                } finally { setAiLoading(false); }
              }} className="border rounded px-3 py-2 bg-emerald-600 text-white grow">{aiLoading?"AI…":"AI Describe"}</button>
            </div>
          </div>
          {activities.length>0 && (
            <ul className="space-y-1">
              {activities.map((a,i)=> (
                <li key={i} className="flex items-start justify-between border rounded px-3 py-2">
                  <div className="flex items-start gap-3">
                    <span className="w-6 text-xs font-mono text-gray-500">{i+1}.</span>
                    <div>
                      <div className="text-sm font-medium">{a.title}</div>
                      {a.description ? <div className="text-xs text-gray-600">{a.description}</div> : null}
                    </div>
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <button type="button" onClick={()=>{
                      const nt=prompt("Edit title", a.title);
                      if(nt===null) return; const t=nt.trim(); if(!t) return;
                      const nd=prompt("Edit description (optional)", a.description||"");
                      const d=(nd===null? (a.description||"") : nd).trim();
                      setActivities(prev=> prev.map((x,idx)=> idx===i? { title:t, description:d||undefined } : x));
                    }} className="text-sm underline">Edit</button>
                    <button type="button" onClick={()=> setActivities(prev=> prev.filter((_,idx)=> idx!==i))} className="text-sm text-red-600 underline">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Materials</label>
          <textarea value={materials} onChange={e=>setMaterials(e.target.value)} placeholder="Materials" className="border rounded px-3 py-2 w-full min-h-20 resize-none"/>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Concepts</label>
          <textarea value={concepts} onChange={e=>setConcepts(e.target.value)} placeholder="Concepts" className="border rounded px-3 py-2 w-full min-h-20 resize-none"/>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Discussion</label>
          <textarea value={discussion} onChange={e=>setDiscussion(e.target.value)} placeholder="Discussion" className="border rounded px-3 py-2 w-full min-h-20 resize-none"/>
        </div>

        <div>
          <div className="h-6" />
          <label className="block text-sm font-medium">Attach standards (optional)</label>
          <div className="grid gap-2 md:grid-cols-4 items-start">
            <input value={stdQuery} onChange={e=>setStdQuery(e.target.value)} placeholder="Search standards" className="border rounded px-3 py-2 md:col-span-2"/>
            <select value={filterSubject} onChange={e=>setFilterSubject(e.target.value as Template["subject"])} className="border rounded px-3 py-2 h-10">
              {subjects.map(s => <option key={s} value={s}>{s || "All subjects"}</option>)}
            </select>
            <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} className="border rounded px-3 py-2 h-10">
              {grades.map(g => <option key={g} value={g}>{g || "All grades"}</option>)}
            </select>
          </div>
          <ul className="mt-2 space-y-1 max-h-44 overflow-auto border rounded p-2">
            {standardsFiltered.map(s => (
              <li key={s.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={standardIds.includes(s.id)} onChange={()=>toggleStd(s.id)} />
                  <span className={`text-gray-600 ${suggestedIds.includes(s.id)?'bg-yellow-100':''}`}>{s.subject} • Grade {s.grade} • {s.id}</span> {s.text}
                </label>
              </li>
            ))}
          </ul>
          <button type="button" disabled={suggestLoading} onClick={async()=>{
              try {
                setSuggestLoading(true);
                const lesson = { title, subject, grade, objectives, activities, materials, concepts, discussion };
                const candidates = allStandards.map(s=>({ id: s.id, text: s.text, subject: s.subject, grade: s.grade }));
                const res = await fetch("/api/standards/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lesson, candidates }) });
                const data = await res.json();
                if (Array.isArray(data?.ids)) setSuggestedIds(data.ids);
              } finally { setSuggestLoading(false); }
            }} className="border rounded px-3 py-2 mt-2 bg-emerald-600 text-white">{suggestLoading?"AI…":"AI Suggest Standards"}</button>
          {standardIds.length > 0 && (
            <div className="text-sm text-gray-700 mt-2">Selected: {standardIds.join(", ")}</div>
          )}
        </div>
        {editingId && (
          <div className="flex gap-2">
            <button onClick={resetForm} className="border rounded px-3 py-2">Cancel</button>
            <button onClick={()=>{ remove(editingId); resetForm(); }} className="border rounded px-3 py-2 text-red-600">Delete</button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Your lesson plans ({filtered.length})</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border rounded px-3 py-2 md:col-span-2"/>
          <select value={filterSubject} onChange={e=>setFilterSubject(e.target.value as Template["subject"])} className="border rounded px-3 py-2 h-10">
            {subjects.map(s => <option key={s} value={s}>{s || "All subjects"}</option>)}
          </select>
          <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} className="border rounded px-3 py-2 h-10">
            {grades.map(g => <option key={g} value={g}>{g || "All grades"}</option>)}
          </select>
        </div>
        <ul className="space-y-3">
          {filtered.map(t => (
            <li key={t.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-600">{t.subject || ""} {t.grade ? `• Grade ${t.grade}`: ""}</div>
              </div>
              <div className="grid md:grid-cols-3 gap-2 text-sm mt-2">
                <div><div className="text-gray-600">Objectives</div><div>{t.objectives || <span className="text-gray-400">—</span>}</div></div>
                <div><div className="text-gray-600">Activities</div><div>{(t.activities && t.activities.length>0) ? (
                  <ul className="space-y-1">{t.activities.map((a,i)=>(
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-6 text-xs font-mono text-gray-500">{i+1}.</span>
                      {typeof a === "string" ? (
                        <span>{a}</span>
                      ) : (
                        <div>
                          <div className="font-medium">{a.title}</div>
                          {a.description ? <div className="text-gray-600">{a.description}</div> : null}
                        </div>
                      )}
                    </li>
                  ))}</ul>
                ) : <span className="text-gray-400">—</span>}</div></div>
                <div><div className="text-gray-600">Materials</div><div>{t.materials || <span className="text-gray-400">—</span>}</div></div>
              </div>
              <div className="grid md:grid-cols-3 gap-2 text-sm mt-2">
                <div><div className="text-gray-600">Concepts</div><div>{t.concepts || <span className="text-gray-400">—</span>}</div></div>
                <div><div className="text-gray-600">Discussion</div><div>{t.discussion || <span className="text-gray-400">—</span>}</div></div>
              </div>
              {t.standardIds?.length ? (
                <ul className="mt-2 text-sm space-y-1">
                  {t.standardIds.map(id => {
                    const s = allStandards.find(x => x.id === id);
                    if (!s) return null;
                    return <li key={id} className="flex items-start gap-2"><span className="text-gray-600">{s.id}</span><span>{s.text}</span></li>
                  })}
                </ul>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button onClick={()=>beginEdit(t)} className="border rounded px-3 py-1 text-sm">Edit</button>
                <button onClick={()=>remove(t.id)} className="border rounded px-3 py-1 text-sm text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
