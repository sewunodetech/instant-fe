/** Full-screen flows without the bottom tab bar (detail pages, voting, payouts). */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh w-full bg-surface">
      <div className="app-shell app-shell-pad mx-auto flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
