import Link from "next/link";
import { Coins } from "lucide-react";

export function CreditsBadge({ balance }: { balance: number }) {
  return (
    <Link
      href="/credits"
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
      title="1 credit = 1 minute of video"
    >
      <Coins className="h-4 w-4 text-primary" />
      Credits: {balance}
      <span className="text-primary">Buy more</span>
    </Link>
  );
}
