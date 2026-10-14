import type { Metadata } from "next";
import Landing from "@/views/Landing";

export const metadata: Metadata = {
  title: "Video Speed Reader — Transcripts in three minutes",
  description:
    "Upload your video, get a clean, accurate transcript in three minutes. Chinese and English supported.",
  openGraph: {
    title: "Video Speed Reader — Transcripts in three minutes",
    description: "Upload your video, get a clean, accurate transcript in three minutes.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <Landing />;
}
