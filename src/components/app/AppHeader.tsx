import { UserRound } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMed, useNow } from "@/lib/med-store";
import { STAFF } from "@/lib/med-seed";

export function AppHeader() {
  const { state, setCaregiver, ready } = useMed();
  const now = useNow();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-3 backdrop-blur md:px-6">
      <SidebarTrigger className="size-10" aria-label="Toggle menu" />
      <div className="hidden text-sm text-muted-foreground sm:block" suppressHydrationWarning>
        {ready &&
          now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground md:inline">On duty:</span>
        <Select value={state.caregiver} onValueChange={setCaregiver} disabled={!ready}>
          <SelectTrigger className="h-10 w-[200px] bg-card" aria-label="Caregiver on duty">
            <UserRound className="size-4 text-primary" />
            <SelectValue placeholder="Select caregiver" />
          </SelectTrigger>
          <SelectContent>
            {STAFF.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
