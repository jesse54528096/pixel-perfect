import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CreditsBadge } from "@/components/CreditsBadge";
import { UploadForm } from "@/components/UploadForm";
import type { Tables } from "@/integrations/supabase/types";

type JobRow = Pick<Tables<"jobs">, "id" | "created_at" | "video_source_url" | "status">;

const statusStyles: Record<JobRow["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  downloading: "bg-muted text-muted-foreground",
  transcribe: "bg-blue-500/15 text-blue-400",
  done: "bg-green-500/15 text-green-400",
  insufficient_credits: "bg-amber-500/15 text-amber-400",
};

function truncate(url: string, max = 50) {
  return url.length > max ? `${url.slice(0, max)}…` : url;
}

export default function UploadView({ jobs, balance }: { jobs: JobRow[]; balance: number }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <CreditsBadge balance={balance} />
            <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
          <section>
            <h1 className="text-3xl font-bold tracking-tight">Your transcriptions</h1>
            {jobs.length === 0 ? (
              <p className="mt-6 rounded-2xl border bg-card p-7 text-muted-foreground">
                No transcriptions yet. Submit your first video below.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">URL</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Transcript</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3" title={job.video_source_url}>
                          {truncate(job.video_source_url)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[job.status]}`}>
                            {job.status === "insufficient_credits" ? "not enough credits" : job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {job.status === "done" ? (
                            <a
                              href={`/api/jobs/${job.id}/transcript`}
                              download={`transcript-${job.id.slice(0, 8)}.txt`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <Download className="h-4 w-4" />
                              .txt
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold">Submit a video</h2>
            <UploadForm />
          </section>
        </div>
      </main>
    </div>
  );
}
