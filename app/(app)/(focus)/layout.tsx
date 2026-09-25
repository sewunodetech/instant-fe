import { AuthGuard } from "@/components/auth/auth-guard";

/** Full-screen flows without the dock (campaign detail, creation). */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <div className="min-h-dvh w-full bg-surface-dim">
        <div className="app-shell flex min-h-dvh flex-col bg-surface sm:shadow-elevated">{children}</div>
      </div>
    </AuthGuard>
  );
}
