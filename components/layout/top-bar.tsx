import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/auth/user-avatar";
import { currentUser } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto max-w-[430px] bg-surface/80 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-margin">
        <Link href="/home" aria-label="instant.fun home">
          <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-space-xs">
          <button
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface-container-high"
          >
            <Icon name="notifications" className="text-[24px]" />
            {currentUser.hasUnread && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface" />
            )}
          </button>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
