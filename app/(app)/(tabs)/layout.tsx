import { AuthGuard } from "@/components/auth/auth-guard";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <div className="min-h-dvh w-full bg-surface-dim">
        <main className="app-shell flex min-h-dvh flex-col bg-surface pt-safe pb-[calc(env(safe-area-inset-bottom,0px)+7rem)] sm:shadow-elevated">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
