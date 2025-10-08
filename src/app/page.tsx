import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Lesson Planner</h1>
      <p className="text-gray-600">K–12 lesson planning tools: templates, standards, scheduling, and exports.</p>

      <nav className="grid md:grid-cols-2 gap-4">
        <Link href="/templates" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Lesson Plans</div>
          <div className="text-sm text-gray-600">Create and manage lesson templates with objectives, activities, materials, and standards.</div>
        </Link>
        <Link href="/schedule" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-semibold">Schedule</div>
          <div className="text-sm text-gray-600">Plan your week; attach standards to lessons.</div>
        </Link>
      </nav>
    </main>
  );
}
