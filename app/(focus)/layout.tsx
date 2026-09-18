/** Full-screen flows without the bottom tab bar (detail pages, voting, payouts). */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface">{children}</div>
  );
}
