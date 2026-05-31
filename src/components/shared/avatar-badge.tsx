import { getInitials } from "@/lib/utils";

export function AvatarBadge({ name }: { name: string }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-200 via-amber-50 to-white text-lg font-semibold text-rose-900 shadow-sm">
      {getInitials(name)}
    </div>
  );
}
