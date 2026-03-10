import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileMusic, Download, Share2 } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {displayName}</h2>
        <p className="mt-1 text-muted-foreground">Here is an overview of your chord sheets.</p>
      </div>

      {/* CTA */}
      <Link
        href="/sheets/new"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
        Create New Sheet
      </Link>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileMusic} label="Total Sheets" value="0" />
        <StatCard icon={Download} label="Recent Exports" value="0" />
        <StatCard icon={Share2} label="Shared" value="0" />
      </div>

      {/* Recent sheets */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Sheets</h3>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <FileMusic className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No sheets yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Create your first chord sheet to get started.
          </p>
        </div>
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
