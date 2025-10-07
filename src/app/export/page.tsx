"use client";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import { standards as allStandards } from "@/data/standards"; // not needed here

type Event = {
  id: string; title: string; day: number; start: string; end: string; standardIds?: string[];
};

type Template = {
  id: string; title: string; subject: "ELA"|"Math"|""; grade: string; objectives: string; activities: string; materials: string; standardIds: string[];
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const load = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
};

export default function ExportPage() {
  const events = load<Event[]>("schedule_events", []);
  const templates = load<Template[]>("templates", []);
  const [title, setTitle] = useState("Lesson Plan Export");

  const eventsRows = useMemo(() => events.map(e => {
    const stds = (e.standardIds||[]).map(id => id).join(", ");
    return [DAYS[e.day], `${e.start}-${e.end}`, e.title, stds];
  }), [events]);

  const templatesRows = useMemo(() => templates.map(t => {
    const stds = (t.standardIds||[]).join(", ");
    return [t.title, t.subject, t.grade, t.objectives, t.activities, t.materials, stds];
  }), [templates]);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFontSize(16);
    doc.text(title || "Lesson Plan Export", 40, 40);

    // Schedule
    doc.setFontSize(12);
    doc.text("Schedule", 40, 70);
    autoTable(doc, {
      startY: 80,
      head: [["Day","Time","Title","Standards"]],
      body: eventsRows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Lesson Plans
    const last = (doc as unknown as { lastAutoTable?: { finalY?: number }}).lastAutoTable; const y = (last?.finalY ?? 100);
    doc.text("Lesson Plans", 40, y + 30);
    autoTable(doc, {
      startY: y + 40,
      head: [["Title","Subject","Grade","Objectives","Activities","Materials","Standards"]],
      body: templatesRows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        3: { cellWidth: 140 },
        4: { cellWidth: 140 },
        5: { cellWidth: 120 },
      }
    });

    doc.save((title || "lesson-plan") + ".pdf");
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Export</h1>
      <div className="grid md:grid-cols-3 gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title" className="border rounded px-3 py-2 md:col-span-2"/>
        <button onClick={exportPdf} className="border rounded px-3 py-2 bg-blue-600 text-white">Export PDF</button>
      </div>
      <p className="text-sm text-gray-600">Exports your current week schedule and lesson plans stored in this browser.</p>
    </main>
  );
}
