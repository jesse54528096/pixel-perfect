"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadForm() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("zh");
  const [error, setError] = useState<string | null>(null);
  const [noCredits, setNoCredits] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNoCredits(false);
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_source_url: videoUrl, topic: topic || null, language }),
      });
      if (res.status === 402) {
        setNoCredits(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Request failed (${res.status})`);
        return;
      }
      setVideoUrl("");
      setTopic("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border bg-card p-7">
      <div className="space-y-2">
        <Label htmlFor="video_source_url">Video URL</Label>
        <Input
          id="video_source_url"
          type="text"
          required
          placeholder="Direct mp4 / mp3 URL (e.g. CloudFront, Vimeo, Internet Archive)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">YouTube links are not supported yet.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          type="text"
          placeholder="e.g. Tech podcast — useful context for the model"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="zh">zh</option>
          <option value="en">en</option>
          <option value="ja">ja</option>
        </select>
      </div>
      {noCredits && (
        <p className="text-sm text-destructive">
          You don&apos;t have enough credits.{" "}
          <Link href="/credits" className="underline">
            Buy credits
          </Link>
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Transcribe"}
      </Button>
    </form>
  );
}
