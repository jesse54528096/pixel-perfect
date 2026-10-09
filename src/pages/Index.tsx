import { Link } from "react-router";
import { AudioLines, Timer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { PageMeta } from "@/components/PageMeta";


const features = [
  { icon: AudioLines, title: "高準確度逐字稿", en: "High-accuracy transcripts", body: "Powered by OpenAI Whisper. Supports Chinese and English." },
  { icon: Timer, title: "三分鐘交付", en: "Three-minute turnaround", body: "Processed in the background — you get an email when it's ready." },
  { icon: ShieldCheck, title: "可商用授權", en: "Commercial-use ready", body: "You own the output. Use it however you like." },
];

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageMeta
        title="Video Speed Reader — Transcripts in three minutes"
        description="Upload your video, get a clean, accurate transcript in three minutes. Chinese and English supported."
        ogDescription="Upload your video, get a clean, accurate transcript in three minutes."
        twitterCard="summary_large_image"
      />
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button asChild>
            <Link to="/auth">Sign in / 登入</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-36">
            <Reveal>
              <p className="mb-6 inline-block rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                For creators, educators & engineers
              </p>
              <h1 className="text-gradient text-5xl font-bold tracking-tight sm:text-7xl">Video Speed Reader</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-xl font-medium sm:text-2xl">上傳影片，三分鐘內拿到逐字稿。</p>
              <p className="mt-2 text-muted-foreground">Upload your video, get a clean transcript in three minutes.</p>
            </Reveal>
            <Reveal delay={240}>
              <Button asChild size="lg" className="mt-10 shadow-glow">
                <Link to="/signup">Get started free</Link>
              </Button>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.en} delay={i * 100}>
                <div className="h-full rounded-2xl border bg-card p-7 transition-colors hover:border-primary/40">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.en}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 Video Speed Reader</footer>
    </div>
  );
}
