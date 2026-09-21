import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const user1 = await prisma.user.create({
    data: {
      privyId: "privy-user-alice-001",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      username: "alice",
      displayName: "Alice",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      privyId: "privy-user-bob-002",
      walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      username: "bob",
      displayName: "Bob",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      privyId: "privy-user-charlie-003",
      walletAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      username: "charlie",
      displayName: "Charlie",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    },
  });

  console.log("Created users:", user1.username, user2.username, user3.username);

  const campaign1 = await prisma.campaign.create({
    data: {
      title: "Show Your OOTD",
      description: "Show your outfit today. No filters allowed. Be authentic!",
      category: "fashion",
      rules: ["No filters", "Maximum 3 photos", "Original photo only"],
      maxPostsPerUser: 3,
      status: "ACTIVE",
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: "Street Eats Challenge",
      description: "Capture the best street food near you. Be authentic!",
      category: "food",
      rules: ["Must be street food", "No restaurant photos", "Maximum 3 photos"],
      maxPostsPerUser: 3,
      status: "DRAFT",
    },
  });

  console.log("Created campaigns:", campaign1.title, campaign2.title);

  const post1 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user1.id,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
      caption: "Casual Friday vibes",
      voteCount: 15,
      donationCount: 3,
      donationAmount: 45,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user2.id,
      imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400",
      caption: "Street style look",
      voteCount: 25,
      donationCount: 5,
      donationAmount: 120,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user3.id,
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
      caption: "Minimal fit",
      voteCount: 30,
      donationCount: 8,
      donationAmount: 200,
    },
  });

  console.log("Created posts for active campaign");

  await prisma.vote.createMany({
    data: [
      { userId: user2.id, postId: post1.id },
      { userId: user3.id, postId: post1.id },
      { userId: user1.id, postId: post2.id },
      { userId: user3.id, postId: post2.id },
      { userId: user1.id, postId: post3.id },
      { userId: user2.id, postId: post3.id },
    ],
  });

  console.log("Created votes");

  await prisma.donation.createMany({
    data: [
      { campaignId: campaign1.id, postId: post1.id, userId: user2.id, amount: 15, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post1.id, userId: user3.id, amount: 30, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post2.id, userId: user1.id, amount: 50, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post3.id, userId: user1.id, amount: 100, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post3.id, userId: user2.id, amount: 100, token: "USDC", status: "CONFIRMED" },
    ],
  });

  console.log("Created donations");

  await prisma.transaction.createMany({
    data: [
      { txHash: "0xabc123001", chainId: 97, userId: user2.id, campaignId: campaign1.id, type: "DONATION", status: "CONFIRMED", amount: 15, token: "USDC", blockNumber: BigInt(123456) },
      { txHash: "0xabc123002", chainId: 97, userId: user1.id, campaignId: campaign1.id, type: "DONATION", status: "CONFIRMED", amount: 50, token: "USDC", blockNumber: BigInt(123457) },
    ],
  });

  console.log("Created transactions");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
