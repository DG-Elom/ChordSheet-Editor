import Link from "next/link";
import { Music, FileDown, Share2, Wifi } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Visual Editor",
    description: "Intuitive drag-and-drop chord placement over lyrics.",
  },
  {
    icon: FileDown,
    title: "PDF & DOCX Export",
    description: "Export your sheets in print-ready formats.",
  },
  {
    icon: Share2,
    title: "Share & Collaborate",
    description: "Share sheets with your band or worship team.",
  },
  {
    icon: Wifi,
    title: "Works Offline",
    description: "Edit and view your sheets without an internet connection.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            CS
          </span>
          <span className="text-lg font-semibold text-foreground">ChordSheet</span>
        </div>
        <Link
          href="/login"
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          ChordSheet Editor
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Create beautiful chord sheets in seconds
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Get Started
        </Link>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-3xl gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        ChordSheet Editor
      </footer>
    </div>
  );
}
