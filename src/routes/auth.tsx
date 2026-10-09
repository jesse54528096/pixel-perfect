import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Video Speed Reader" },
      { name: "description", content: "Sign in to Video Speed Reader to manage your transcripts." },
      { property: "og:title", content: "Sign in — Video Speed Reader" },
      { property: "og:description", content: "Sign in to Video Speed Reader to manage your transcripts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="signin" />,
});
