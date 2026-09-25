/** Full-screen flows without the bottom tab bar (detail pages, voting, payouts). */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-surface-dim sm:py-0">
      <div className="app-shell app-shell-pad flex min-h-dvh flex-col bg-surface shadow-elevated">
        {children}
      </div>
    </div>
  );
}
