import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: "0x1234567890abcdef1234567890abcdef12345678" },
    update: {},
    create: {
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      username: "alice",
      displayName: "Alice",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12" },
    update: {},
    create: {
      walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      username: "bob",
      displayName: "Bob",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { walletAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" },
    update: {},
    create: {
      walletAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      username: "charlie",
      displayName: "Charlie",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    },
  });

  console.log("Created users:", user1.username, user2.username, user3.username);

  // Create an active campaign
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

  // Create a draft campaign
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

  // Create a completed campaign
  const campaign3 = await prisma.campaign.create({
    data: {
      title: "Rainy Day Vibes",
      description: "Show us your best rainy day photos.",
      category: "lifestyle",
      rules: ["Original photo only", "Must feature rain", "Maximum 3 photos"],
      maxPostsPerUser: 3,
      status: "ENDED",
      startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Created campaigns:", campaign1.title, campaign2.title, campaign3.title);

  // Create posts for active campaign
  const post1 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user1.id,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
      caption: "Casual Friday vibes",
      voteCount: 15,
      backerCount: 5,
      backingAmount: 5,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user2.id,
      imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400",
      caption: "Street style look",
      voteCount: 25,
      backerCount: 8,
      backingAmount: 8,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      campaignId: campaign1.id,
      userId: user3.id,
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
      caption: "Minimal fit",
      voteCount: 30,
      backerCount: 12,
      backingAmount: 12,
    },
  });

  console.log("Created posts for active campaign");

  // Create posts for completed campaign
  const post4 = await prisma.post.create({
    data: {
      campaignId: campaign3.id,
      userId: user1.id,
      imageUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400",
      caption: "Rainy mood",
      voteCount: 45,
      backerCount: 20,
      backingAmount: 20,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      campaignId: campaign3.id,
      userId: user2.id,
      imageUrl: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=400",
      caption: "Wet streets",
      voteCount: 35,
      backerCount: 15,
      backingAmount: 15,
    },
  });

  console.log("Created posts for completed campaign");

  // Create votes
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

  // Create backings
  await prisma.backing.createMany({
    data: [
      { campaignId: campaign1.id, postId: post1.id, userId: user2.id, amount: 1, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post2.id, userId: user1.id, amount: 1, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post3.id, userId: user1.id, amount: 1, token: "USDC", status: "CONFIRMED" },
      { campaignId: campaign1.id, postId: post3.id, userId: user2.id, amount: 1, token: "USDC", status: "CONFIRMED" },
    ],
  });

  console.log("Created backings");

  // Create campaign results for completed campaign
  await prisma.campaignResult.createMany({
    data: [
      { campaignId: campaign3.id, postId: post4.id, rank: 1, voteCount: 45, backerCount: 20, backingAmount: 20, viralityScore: 92.5 },
      { campaignId: campaign3.id, postId: post5.id, rank: 2, voteCount: 35, backerCount: 15, backingAmount: 15, viralityScore: 75.3 },
    ],
  });

  console.log("Created campaign results");

  // Create rewards
  await prisma.reward.createMany({
    data: [
      { campaignId: campaign3.id, userId: user1.id, postId: post4.id, type: "CREATOR_REWARD", amount: 100, token: "USDC", status: "DISTRIBUTED" },
      { campaignId: campaign3.id, userId: user2.id, postId: post5.id, type: "CREATOR_REWARD", amount: 50, token: "USDC", status: "DISTRIBUTED" },
      { campaignId: campaign3.id, userId: user2.id, postId: post4.id, type: "BACKER_REWARD", amount: 5, token: "USDC", multiplier: 5.0, status: "DISTRIBUTED" },
    ],
  });

  console.log("Created rewards");

  // Create transactions
  await prisma.transaction.createMany({
    data: [
      { txHash: "0xabc123001", chainId: 97, userId: user2.id, campaignId: campaign1.id, type: "BACKING", status: "CONFIRMED", amount: 1, token: "USDC", blockNumber: BigInt(123456) },
      { txHash: "0xabc123002", chainId: 97, userId: user1.id, campaignId: campaign1.id, type: "BACKING", status: "CONFIRMED", amount: 1, token: "USDC", blockNumber: BigInt(123457) },
      { txHash: "0xabc123003", chainId: 97, userId: user1.id, campaignId: campaign3.id, type: "REWARD", status: "CONFIRMED", amount: 100, token: "USDC", blockNumber: BigInt(124000) },
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
