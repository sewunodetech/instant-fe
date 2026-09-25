import { SnapDetail } from "@/components/snap/snap-vote-view";
import { prisma } from "@/lib/prisma";
import { handleOf } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/snaps/[id]">) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: (await params).id },
      select: { user: { select: { username: true, walletAddress: true } } },
    });
    if (post) return { title: `Vote for @${handleOf(post.user)}` };
  } catch {
    // metadata is best-effort
  }
  return { title: "Snap" };
}

export default async function SnapPage({ params }: PageProps<"/snaps/[id]">) {
  return <SnapDetail id={(await params).id} />;
}
