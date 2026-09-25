import { AuthGuard } from "@/components/auth/auth-guard";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <div className="min-h-dvh w-full bg-surface-dim">
        <TopBar />
        <main className="app-shell app-shell-pad mx-auto flex min-h-dvh flex-col bg-surface pt-16 pb-28 shadow-elevated">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
