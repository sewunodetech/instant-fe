import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface">
      <TopBar />
      <main className="flex flex-1 flex-col pt-16 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
