import { prisma } from "@/lib/prisma";

export class ViralityService {
  static calculateViralityScore(params: {
    voteCount: number;
    backerCount: number;
    backingAmount: number;
    momentum: number;
  }): number {
    const maxVotes = 1000;
    const maxBackers = 100;
    const maxBackingAmount = 1000;
    const maxMomentum = 100;

    const normalizedVotes = Math.min(params.voteCount / maxVotes, 1);
    const normalizedBackers = Math.min(params.backerCount / maxBackers, 1);
    const normalizedAmount = Math.min(
      params.backingAmount / maxBackingAmount,
      1
    );
    const normalizedMomentum = Math.min(params.momentum / maxMomentum, 1);

    const score =
      normalizedVotes * 0.40 +
      normalizedBackers * 0.30 +
      normalizedAmount * 0.20 +
      normalizedMomentum * 0.10;

    return Math.round(score * 10000) / 100;
  }

  static async getLeaderboard(campaignId: string) {
    const posts = await prisma.post.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    const items = posts.map((post: (typeof posts)[0]) => {
      const voteCount = post.voteCount;
      const backerCount = post.backerCount;
      const backingAmount = Number(post.backingAmount);
      const momentum = voteCount + backerCount;

      const viralityScore = this.calculateViralityScore({
        voteCount,
        backerCount,
        backingAmount,
        momentum,
      });

      return {
        postId: post.id,
        creator: {
          walletAddress: post.user.walletAddress,
          username: post.user.username,
          displayName: post.user.displayName,
        },
        voteCount,
        backerCount,
        backingAmount: backingAmount.toString(),
        viralityScore,
      };
    });

    items.sort((a: (typeof items)[0], b: (typeof items)[0]) => b.viralityScore - a.viralityScore);

    return items.map((item: (typeof items)[0], index: number) => ({
      rank: index + 1,
      ...item,
    }));
  }
}
