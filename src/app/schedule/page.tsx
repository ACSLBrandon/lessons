"use client";
import { useEffect, useMemo, useState } from "react";
import { standards as allStandards } from "@/data/standards";

type Event = {
  id: string;
  title: string;
  day: number; // 0-6 (Sun-Sat)
  start: string; // HH:MM
  end: string; // HH:MM
  standardIds?: string[];
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
};
const save = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [standardQuery, setStandardQuery] = useState("");
  const [selectedStandardIds, setSelectedStandardIds] = useState<string[]>([]);

  useEffect(() => { setEvents(load<Event[]>("schedule_events", [])); }, []);
  useEffect(() => { save("schedule_events", events); }, [events]);

  const add = () => {
    if (!title.trim()) return;
    const id = crypto.randomUUID();
    setEvents(prev => [...prev, { id, title: title.trim(), day, start, end, standardIds: selectedStandardIds }]);
    setTitle(""); setSelectedStandardIds([]);
  };
  const remove = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const weekly = useMemo(() => {
    const map = new Map<number, Event[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const e of events) map.get(e.day)!.push(e);
    for (const list of map.values()) list.sort((a,b)=>a.start.localeCompare(b.start));
    return map;
  }, [events]);

  const standardsFiltered = useMemo(() => {
    const q = standardQuery.toLowerCase();
    if (!q) return allStandards.slice(0, 10);
    return allStandards.filter(s => s.text.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)).slice(0, 10);
  }, [standardQuery]);

  const toggleStd = (id: string) => {
    setSelectedStandardIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>

      <section className="space-y-3">
        <div className="grid md:grid-cols-6 gap-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border rounded px-3 py-2 md:col-span-2"/>
          <select value={day} onChange={e=>setDay(parseInt(e.target.value))} className="border rounded px-3 py-2">
            {DAYS.map((d,i)=>(<option key={d} value={i}>{d}</option>))}
          </select>
          <input type="time" value={start} onChange={e=>setStart(e.target.value)} className="border rounded px-3 py-2"/>
          <input type="time" value={end} onChange={e=>setEnd(e.target.value)} className="border rounded px-3 py-2"/>
          <button onClick={add} className="border rounded px-3 py-2 bg-blue-600 text-white">Add</button>
        </div>

      </section>

      <section className="grid md:grid-cols-7 gap-4">
        {Array.from({length:7}).map((_,i)=> (
          <div key={i} className="border rounded p-2">
            <h2 className="font-semibold mb-2">{DAYS[i]}</h2>
            <ul className="space-y-2">
              {weekly.get(i)!.map(e => (
                <li key={e.id} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{e.start}–{e.end} {e.title}</div>
                    <button onClick={()=>remove(e.id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                  {e.standardIds && e.standardIds.length > 0 && (
                    <ul className="mt-1 text-sm space-y-1">
                      {e.standardIds.map(id => {
                        const s = allStandards.find(x => x.id === id);
                        if (!s) return null;
                        return <li key={id} className="flex items-start gap-2"><span className="text-gray-600">{s.id}</span><span>{s.text}</span></li>
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

    </main>
  );
}
