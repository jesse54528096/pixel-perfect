import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
        <Play className="h-4 w-4 fill-current" />
      </span>
      Video Speed Reader
    </Link>
  );
}
