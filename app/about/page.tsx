import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">About 9TEEN</h1>
        <p className="text-gray-700 leading-relaxed mb-6">9TEEN is a modern fashion destination for the next generation. We curate bold, comfortable, and confident styles designed for everyday wear.</p>
        <Link href="/" className="text-sm font-semibold text-[#f97316] hover:underline">Back to home</Link>
      </div>
    </div>
  );
}
