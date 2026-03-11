import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileMusic, Star, Share2, Clock, Upload, Youtube } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  // Fetch real data
  const { data: sheets } = await supabase
    .from("chord_sheets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  const { data: shares } = await supabase
    .from("shares")
    .select("id")
    .eq("created_by", user.id)
    .eq("is_active", true);

  const { data: favorites } = await supabase.from("favorites").select("id").eq("owner_id", user.id);

  const totalSheets = sheets?.length ?? 0;
  const totalShares = shares?.length ?? 0;
  const totalFavorites = favorites?.length ?? 0;
  const recentSheets = sheets?.slice(0, 6) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {displayName}</h2>
        <p className="mt-1 text-muted-foreground">Here is an overview of your chord sheets.</p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Link
          href="/sheets/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          Create New Sheet
        </Link>
        <Link
          href="/sheets/import"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Upload className="h-4 w-4" />
          Import Sheet
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={FileMusic} label="Total Sheets" value={String(totalSheets)} />
        <StatCard icon={Star} label="Favorites" value={String(totalFavorites)} />
        <StatCard icon={Share2} label="Shared" value={String(totalShares)} />
        <StatCard icon={FileMusic} label="Recent" value={String(recentSheets.length)} />
      </div>

      {/* Recent sheets */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Sheets</h3>
        {recentSheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
            <FileMusic className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No sheets yet</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Create your first chord sheet to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentSheets.map((sheet) => (
              <Link
                key={sheet.id}
                href={`/sheets/${sheet.id}`}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-card-foreground group-hover:text-primary">
                      {sheet.title || "Untitled"}
                    </h4>
                    {sheet.artist && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {sheet.artist}
                      </p>
                    )}
                  </div>
                  {sheet.song_key && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {sheet.song_key}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(sheet.updated_at)}
                  </span>
                  {sheet.youtube_url && <Youtube className="h-3 w-3 text-red-500" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
