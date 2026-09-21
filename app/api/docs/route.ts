import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Instant.fun API",
      version: "1.0.0",
      description: "Backend API for Instant.fun - an on-chain social hackathon platform.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local dev" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [],
    paths: {
      "/api/auth/nonce": {
        post: {
          tags: ["Auth"],
          summary: "Get authentication nonce",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["walletAddress"],
                  properties: { walletAddress: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Nonce and message" } },
        },
      },
      "/api/auth/verify": {
        post: {
          tags: ["Auth"],
          summary: "Verify wallet signature and get JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["walletAddress", "signature"],
                  properties: {
                    walletAddress: { type: "string" },
                    signature: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Access token and user" } },
        },
      },
      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "User profile with stats" } },
        },
        patch: {
          tags: ["Users"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string", maxLength: 30 },
                    displayName: { type: "string", maxLength: 100 },
                    avatarUrl: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Updated user" } },
        },
      },
      "/api/users/{walletAddress}": {
        get: {
          tags: ["Users"],
          summary: "Get user by wallet address",
          parameters: [
            { name: "walletAddress", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: { "200": { description: "User profile" }, "404": { description: "Not found" } },
        },
      },
      "/api/users/{walletAddress}/posts": {
        get: {
          tags: ["Users"],
          summary: "Get user posts",
          parameters: [
            { name: "walletAddress", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated posts" } },
        },
      },
      "/api/users/{walletAddress}/backings": {
        get: {
          tags: ["Users"],
          summary: "Get user backings",
          parameters: [
            { name: "walletAddress", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated backings" } },
        },
      },
      "/api/users/{walletAddress}/rewards": {
        get: {
          tags: ["Users"],
          summary: "Get user rewards",
          parameters: [
            { name: "walletAddress", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated rewards" } },
        },
      },
      "/api/users/{walletAddress}/campaigns": {
        get: {
          tags: ["Users"],
          summary: "Get user campaigns",
          parameters: [
            { name: "walletAddress", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated campaigns" } },
        },
      },
      "/api/users/me/backings": {
        get: {
          tags: ["Users"],
          summary: "Get current user backings",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Paginated backings" } },
        },
      },
      "/api/users/me/rewards": {
        get: {
          tags: ["Users"],
          summary: "Get current user rewards",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Paginated rewards" } },
        },
      },
      "/api/users/me/transactions": {
        get: {
          tags: ["Users"],
          summary: "Get current user transactions",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Paginated transactions" } },
        },
      },
      "/api/users/me/campaigns": {
        get: {
          tags: ["Users"],
          summary: "Get current user campaigns",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Paginated campaigns" } },
        },
      },
      "/api/campaigns": {
        get: {
          tags: ["Campaigns"],
          summary: "List all campaigns",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "ACTIVE", "ENDED"] } },
            { name: "category", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Paginated campaigns" } },
        },
        post: {
          tags: ["Campaigns"],
          summary: "Create a campaign",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string", minLength: 3, maxLength: 200 },
                    description: { type: "string", maxLength: 2000 },
                    category: { type: "string" },
                    rules: { type: "array", items: { type: "string" } },
                    maxPostsPerUser: { type: "integer", default: 3 },
                    startsAt: { type: "string", format: "date-time" },
                    endsAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Created campaign" } },
        },
      },
      "/api/campaigns/{id}": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Campaign details" } },
        },
        patch: {
          tags: ["Campaigns"],
          summary: "Update campaign",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Updated campaign" } },
        },
      },
      "/api/campaigns/{id}/start": {
        post: {
          tags: ["Campaigns"],
          summary: "Start a DRAFT campaign",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Campaign started" } },
        },
      },
      "/api/campaigns/{id}/finish": {
        post: {
          tags: ["Campaigns"],
          summary: "Finish an ACTIVE campaign and calculate results",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Campaign finished with leaderboard and rewards" } },
        },
      },
      "/api/campaigns/{id}/posts": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign posts",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated posts" } },
        },
      },
      "/api/campaigns/{id}/leaderboard": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign leaderboard",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Leaderboard with virality scores" } },
        },
      },
      "/api/campaigns/{id}/results": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign results (after finishing)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Campaign results" } },
        },
      },
      "/api/campaigns/{id}/backings": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign backings",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated backings" } },
        },
      },
      "/api/campaigns/{id}/rewards": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign rewards",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated rewards" } },
        },
      },
      "/api/campaigns/{id}/transactions": {
        get: {
          tags: ["Campaigns"],
          summary: "Get campaign transactions",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated transactions" } },
        },
      },
      "/api/campaigns/{campaignId}/posts": {
        post: {
          tags: ["Posts"],
          summary: "Submit a post to a campaign",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "campaignId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["imageUrl"],
                  properties: {
                    imageUrl: { type: "string", format: "uri" },
                    caption: { type: "string", maxLength: 500 },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Post created" } },
        },
      },
      "/api/posts/{id}": {
        get: {
          tags: ["Posts"],
          summary: "Get post by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Post details" } },
        },
      },
      "/api/posts/{id}/vote": {
        post: {
          tags: ["Votes"],
          summary: "Vote on a post",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Vote recorded" }, "409": { description: "Already voted" } },
        },
        delete: {
          tags: ["Votes"],
          summary: "Remove vote from a post",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Vote removed" } },
        },
      },
      "/api/posts/{id}/votes": {
        get: {
          tags: ["Votes"],
          summary: "Get votes for a post",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated votes" } },
        },
      },
      "/api/posts/{id}/back": {
        post: {
          tags: ["Backings"],
          summary: "Back a post with $1 USDC (returns transaction intent)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Backing + transaction intent" } },
        },
      },
      "/api/posts/{id}/backers": {
        get: {
          tags: ["Backings"],
          summary: "Get backers of a post",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: { "200": { description: "Paginated backings" } },
        },
      },
      "/api/ai/campaign/generate": {
        post: {
          tags: ["AI"],
          summary: "Generate a campaign using AI (OpenRouter)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { prompt: { type: "string" } },
                },
              },
            },
          },
          responses: { "200": { description: "Generated campaign data + persisted campaign" } },
        },
      },
      "/api/ai/campaign/generate-from-trends": {
        post: {
          tags: ["AI"],
          summary: "Generate a campaign from trending topics",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["topics"],
                  properties: { topics: { type: "array", items: { type: "string" } } },
                },
              },
            },
          },
          responses: { "200": { description: "Generated campaign from trends" } },
        },
      },
      "/api/transactions/{hash}": {
        get: {
          tags: ["Transactions"],
          summary: "Get transaction by hash",
          parameters: [{ name: "hash", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Transaction details" } },
        },
      },
      "/api/blockchain/campaigns/{id}": {
        get: {
          tags: ["Blockchain"],
          summary: "Get campaign blockchain info",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { "200": { description: "Campaign data" } },
        },
      },
      "/api/blockchain/index/sync": {
        post: {
          tags: ["Blockchain"],
          summary: "Sync/index a blockchain event (backing confirmed)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["txHash", "blockNumber"],
                  properties: {
                    txHash: { type: "string" },
                    blockNumber: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Backing synced" } },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
