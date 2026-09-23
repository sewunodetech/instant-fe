# Instant.fun — Product Requirements Document

**Version:** 2.0
**Date:** September 23, 2026
**Status:** MVP
**Platform:** Mobile Web / Responsive Web
**Product Type:** Web3 Social Discovery & Creator Support Platform

---

# 1. Product Overview

**Instant.fun** adalah platform social discovery berbasis Web3 yang memungkinkan pengguna mengikuti social campaign, mengunggah foto secara instan, memberikan vote, dan memberikan dukungan finansial kepada creator yang mereka sukai.

Campaign dapat dibuat berdasarkan tren yang sedang berkembang dengan bantuan AI.

Pengguna dapat melihat berbagai post dalam sebuah campaign dan melakukan dua jenis interaksi:

1. **Vote** — memberikan dukungan sosial secara gratis.
2. **Support** — memberikan sejumlah dana dengan nominal bebas kepada creator/poster.

Dana yang diberikan melalui Support menjadi **milik creator/poster**. Sistem tidak menggunakan mekanisme taruhan, prediction market, betting, atau hadiah berdasarkan hasil voting.

### Core Concept

> **Post instantly. Get discovered. Support creators.**

---

# 2. Concept Change

Instant.fun **bukan platform judi, betting, atau prediction market**.

Pada konsep sebelumnya, pengguna dapat melakukan backing terhadap creator dengan ekspektasi mendapatkan reward berdasarkan performa creator.

Konsep tersebut dihapus.

### New Model

```text
Creator
   │
   │ uploads post
   ▼
Campaign Feed
   │
   ├───────────────┐
   │               │
   ▼               ▼
  Vote           Support
 Free            Any Amount
   │               │
   │               ▼
   │          Creator receives
   │             support
   │
   ▼
Social ranking /
engagement
```

### Support bukan:

* taruhan
* investasi
* prediction
* purchase of shares
* entry fee
* betting terhadap siapa yang menang
* kontribusi ke reward pool

### Support adalah:

**Direct creator support / tipping.**

Contoh:

> User melihat foto OOTD yang disukai → klik Support → memilih $1, $5, atau nominal lain → transaksi dikirim ke creator.

---

# 3. Problem Statement

Social media saat ini membuat creator harus membangun audience terlebih dahulu sebelum mendapatkan exposure dan dukungan.

Di sisi lain, pengguna sering menemukan creator atau konten menarik yang belum memiliki banyak followers, tetapi tidak memiliki cara sederhana untuk menunjukkan dukungan secara langsung.

Instant.fun mencoba membuat discovery menjadi lebih terbuka melalui campaign.

Pengguna tidak harus memiliki followers besar untuk mendapatkan exposure.

---

# 4. Product Goals

## Primary Goals

1. Membuat platform social discovery yang sederhana dan cepat digunakan melalui mobile web.
2. Memungkinkan pengguna membuat dan mengikuti campaign.
3. Memungkinkan pengguna mengunggah foto secara instan.
4. Memungkinkan community memberikan vote secara gratis.
5. Memungkinkan community memberikan dukungan finansial dengan nominal bebas kepada creator.
6. Menggunakan blockchain untuk transaksi support secara transparan.
7. Menggunakan AI untuk membantu menghasilkan campaign berdasarkan tren.
8. Membuat pengalaman Web3 sesederhana mungkin sehingga pengguna tidak perlu memahami blockchain secara mendalam.

## Secondary Goals

* Membantu creator baru mendapatkan exposure.
* Mendorong authentic content.
* Membuat discovery berdasarkan campaign lebih menarik dibanding feed sosial generik.
* Menggabungkan social interaction dengan on-chain creator support.

---

# 5. Non-Goals

Fitur berikut tidak termasuk dalam MVP:

* Gambling.
* Betting.
* Prediction market.
* Investment.
* Staking.
* Token speculation.
* Reward berdasarkan kemenangan creator.
* Reward untuk supporter berdasarkan performa creator.
* NFT marketplace.
* Follower/following system kompleks.
* Direct messaging.
* Live streaming.
* Video upload.
* Native iOS application.
* Native Android application.
* AI image generation.
* AI image editing.

---

# 6. Target Users

## 6.1 Creator

Pengguna yang membuat dan mengunggah konten.

Needs:

* Upload foto dengan cepat.
* Mendapatkan exposure.
* Mendapatkan vote.
* Mendapatkan direct financial support.
* Melihat performa konten.
* Melihat total support yang diterima.

---

## 6.2 Viewer

Pengguna yang melihat campaign dan konten.

Needs:

* Menemukan konten menarik.
* Memberikan vote secara gratis.
* Mendukung creator yang disukai.
* Memberikan nominal support sesuai keinginan.
* Melihat creator profile.

---

## 6.3 Campaign Creator

Pengguna/admin yang membuat campaign.

Needs:

* Membuat campaign.
* Mendapatkan bantuan AI untuk membuat konsep campaign.
* Menentukan aturan campaign.
* Menentukan durasi campaign.
* Melihat aktivitas campaign.

---

# 7. Core User Journey

## 7.1 New User

```text
Open Instant.fun
       ↓
Connect Wallet / Login
       ↓
Privy Authentication
       ↓
Explore Campaigns
       ↓
Open Campaign
       ↓
View Posts
       ↓
Vote / Support
```

---

## 7.2 Creator Journey

```text
Connect Wallet
       ↓
Open Campaign
       ↓
Join Campaign
       ↓
Upload Photo
       ↓
Submit Post
       ↓
Post Appears in Feed
       ↓
Receive Votes
       ↓
Receive Support
       ↓
View Earnings
```

---

## 7.3 Support Journey

```text
User sees post
       ↓
Tap "Support"
       ↓
Enter amount
       ↓
Review transaction
       ↓
Confirm wallet transaction
       ↓
Blockchain transaction
       ↓
Transaction confirmed
       ↓
Creator balance updated
```

---

# 8. Authentication

Instant.fun menggunakan **Privy** sebagai authentication dan wallet infrastructure.

Backend tidak perlu membuat sistem wallet authentication custom.

## Requirements

Privy menangani:

* Wallet connection.
* Wallet creation.
* Authentication.
* User session.
* Wallet identity.
* Signing transaction.

Backend menerima identity dari Privy dan melakukan authorization berdasarkan user identity/wallet address.

### Authentication Flow

```text
User
 ↓
Privy
 ↓
Login / Wallet
 ↓
Privy Session
 ↓
Frontend
 ↓
Backend
 ↓
Verify authenticated user
```

### Requirements

* Support EVM wallet.
* Support embedded wallet melalui Privy jika diperlukan.
* Support external wallet.
* Backend tidak menyimpan private key.
* User dapat menggunakan platform tanpa memahami detail wallet.
* Wallet address tetap digunakan sebagai blockchain identity.

---

# 9. Campaign

Campaign adalah tema atau challenge yang menjadi konteks bagi kumpulan post.

Contoh:

### Campaign

**Rainy Day OOTD**

> Show us what you're wearing on a rainy day.

Rules:

* Upload authentic photo.
* Maximum 3 posts per user.
* No excessive editing.

---

## Campaign Data

```text
id
title
description
category
coverImage
rules
status
startsAt
endsAt
maxPostsPerUser
createdBy
createdAt
updatedAt
```

## Campaign Status

```text
DRAFT
ACTIVE
ENDED
CANCELLED
```

Campaign tidak memiliki konsep:

```text
winner
loser
bet
pool
jackpot
prediction
```

---

# 10. AI Campaign Generation

AI digunakan untuk membantu platform menghasilkan campaign yang menarik berdasarkan tren.

AI bukan penentu pemenang.

AI hanya berfungsi sebagai **campaign ideation engine**.

## Example

Input:

```text
Current trend:
Rainy season
Fashion
Streetwear
Yogyakarta
```

AI menghasilkan:

```json
{
  "title": "Rainy Day OOTD",
  "description": "Show us your best rainy day outfit.",
  "category": "fashion",
  "rules": [
    "Post an authentic photo",
    "Maximum 3 posts per user"
  ],
  "durationHours": 48
}
```

## AI Requirements

* OpenRouter.
* Structured JSON output.
* Schema validation.
* Prompt versioning.
* Store generation history.
* AI failure must not break manual campaign creation.
* AI output must be validated by backend.

---

# 11. Post

Post adalah foto yang dibuat user dalam sebuah campaign.

## Requirements

* User dapat membuat maksimal 3 post per campaign.
* Post hanya dapat dibuat ketika campaign aktif.
* User hanya dapat menghapus post miliknya sendiri.
* Foto harus disimpan di object storage.
* Database hanya menyimpan metadata dan storage reference.
* Post harus memiliki creator/user.
* Post harus terhubung dengan campaign.

## Post Data

```text
id
campaignId
userId
imageKey
imageUrl
thumbnailKey
thumbnailUrl
caption
voteCount
supporterCount
supportAmount
createdAt
updatedAt
```

---

# 12. Image Upload

Image storage menggunakan **Google Cloud Storage (GCS)**.

Binary image tidak disimpan di PostgreSQL.

## Upload Architecture

```text
Mobile Web
     │
     │ Request signed URL
     ▼
NestJS API
     │
     │ Generate signed URL
     ▼
Google Cloud Storage
     │
     │ Signed Upload URL
     ▼
Mobile Web
     │
     │ Direct upload
     ▼
GCS Bucket
```

## Recommended Structure

```text
instant-fun/
├── posts/
│   └── {postId}/
│       ├── original.webp
│       └── thumbnail.webp
│
├── avatars/
│   └── {userId}/
│
└── campaigns/
    └── {campaignId}/
```

## Upload API

```http
POST /uploads/presign
```

Example response:

```json
{
  "key": "posts/temp/abc123.webp",
  "uploadUrl": "https://storage.googleapis.com/...",
  "publicUrl": "https://..."
}
```

Frontend kemudian melakukan direct upload ke GCS.

---

# 13. Vote System

Vote adalah interaksi sosial gratis.

Tidak ada biaya untuk vote.

## Rules

* Satu user hanya dapat memberikan satu vote untuk satu post.
* User dapat melakukan unvote.
* Creator dapat melakukan vote pada post sendiri hanya jika product rule mengizinkan.
* Vote tidak menghasilkan financial reward.
* Vote tidak menghasilkan financial liability.

## API

```http
POST   /posts/:id/vote
DELETE /posts/:id/vote
GET    /posts/:id/votes
```

## Example

```text
❤️ 1,248 votes
```

Vote count dapat digunakan sebagai social popularity metric.

---

# 14. Support System

Support adalah mekanisme direct financial support kepada creator.

## Core Rule

**User bebas menentukan nominal support.**

Contoh:

```text
$1
$2
$5
$10
$25
Custom amount
```

Tidak ada fixed $1 requirement.

---

## Support Flow

```text
Post
 │
 └── Support
       │
       ▼
Enter Amount
       │
       ▼
Review
       │
       ▼
Wallet Confirmation
       │
       ▼
Blockchain
       │
       ▼
Creator Receives Funds
```

---

## Important Business Rule

Dana support:

```text
Supporter
    ↓
Creator
```

Bukan:

```text
Supporter
    ↓
Reward Pool
    ↓
Winner
```

Tidak ada redistribution berdasarkan hasil campaign.

---

# 15. Support Transaction

Setiap support harus memiliki blockchain transaction.

Transaction menyimpan:

```text
txHash
chainId
from
to
amount
token
postId
creatorId
supporterId
status
blockNumber
createdAt
confirmedAt
```

## Transaction Status

```text
PENDING
CONFIRMED
FAILED
```

---

# 16. Blockchain

Blockchain digunakan untuk financial transactions.

## On-chain

* Creator support.
* Transaction verification.
* Creator receiving funds.

## Off-chain

* User profile.
* Campaign metadata.
* Post metadata.
* Votes.
* Feed ranking.
* AI generation.
* Social statistics.

---

# 17. Smart Contract

MVP dapat menggunakan smart contract sederhana untuk memfasilitasi support.

Concept:

```solidity
support(
    creator,
    postId,
    amount
)
```

Contract mencatat event:

```solidity
SupportSent(
    supporter,
    creator,
    postId,
    amount
)
```

Backend/indexer membaca event tersebut dan mengupdate database.

### Important

Backend tidak boleh:

* menyimpan private key user;
* melakukan transaksi menggunakan wallet user;
* memindahkan dana user tanpa signature.

User wallet harus melakukan authorization/signature.

---

# 18. Feed

Feed merupakan bagian utama Instant.fun.

## Campaign Feed

Menampilkan:

* Foto.
* Creator.
* Vote count.
* Support amount.
* Supporter count.
* Timestamp.
* Support button.
* Vote button.

Example:

```text
┌─────────────────────────┐
│       Creator            │
│                          │
│       [ PHOTO ]          │
│                          │
│  @username               │
│                          │
│  ❤️ 342     💰 $128      │
│                          │
│  [ Vote ] [ Support ]    │
└─────────────────────────┘
```

---

# 19. Feed Sorting

MVP dapat menyediakan beberapa sorting modes.

### Latest

```text
createdAt DESC
```

### Popular

Berdasarkan vote count.

### Supported

Berdasarkan total support.

Tidak perlu membuat algoritma recommendation kompleks untuk MVP.

---

# 20. Creator Profile

Creator profile menampilkan:

* Avatar.
* Username.
* Bio.
* Total posts.
* Total votes.
* Total support received.
* Campaign participation.
* Posts.

Example:

```text
@daffa

42 Posts
12.4K Votes
$842 Supported

[ Posts ]
```

---

# 21. Supporter History

User dapat melihat histori support yang pernah diberikan.

Data:

```text
Post
Creator
Amount
Token
Transaction
Date
Status
```

Example:

```text
You supported @creator

$5 USDC

Rainy Day OOTD

Confirmed ✓
```

---

# 22. Creator Earnings

Creator dapat melihat total support yang diterima.

Example:

```text
Total Support

$842.00

This Month
$214.00
```

Creator dapat melihat:

* Total support.
* Support per campaign.
* Support per post.
* Transaction history.

---

# 23. Campaign Results

Campaign results **bukan menentukan pemenang secara finansial**.

Setelah campaign selesai, platform dapat menampilkan:

* Most voted posts.
* Most supported posts.
* Trending posts.
* Most recent posts.
* Creator statistics.

Contoh:

```text
Campaign Finished

Most Voted
#1 @alice — 2,341 votes

Most Supported
@bob — $1,240

Trending
@charlie — +420 votes in 2h
```

Label tersebut adalah **statistical/social metrics**, bukan mekanisme payout.

---

# 24. Mobile-First Design

Instant.fun primarily ditujukan untuk **mobile web**.

Design harus dimulai dari mobile viewport terlebih dahulu.

### Primary Target

```text
360px
375px
390px
414px
```

Kemudian responsive ke:

```text
768px
1024px
1280px+
```

---

# 25. Mobile UX Principles

## One-Hand Usage

Primary actions harus mudah dijangkau dengan thumb.

Contoh:

```text
┌─────────────────────┐
│ Instant.fun          │
│                     │
│   Campaign           │
│                     │
│    [ PHOTO ]         │
│                     │
│  @creator            │
│                     │
│  ❤️ 342              │
│  💰 $124             │
│                     │
│ [Vote] [Support]     │
│                     │
└─────────────────────┘
```

## Bottom Navigation

Mobile dapat menggunakan:

```text
Home
Explore
Create
Activity
Profile
```

---

# 26. Desktop Responsive Design

Desktop bukan secondary implementation yang berbeda.

UI harus menggunakan responsive layout yang sama.

### Mobile

```text
Single-column feed
```

### Tablet

```text
2-column layout
```

### Desktop

```text
┌──────────┬──────────────────────────┬──────────┐
│ Sidebar  │       Main Feed          │ Trending │
│          │                          │          │
│ Home     │      Posts               │ Campaign │
│ Explore  │                          │          │
│ Create   │                          │          │
│ Profile  │                          │          │
└──────────┴──────────────────────────┴──────────┘
```

Desktop dapat menggunakan:

* Sidebar navigation.
* Center feed.
* Optional right-side trending/campaign panel.

---

# 27. Core Pages

## `/`

Home / campaign discovery.

## `/explore`

Explore campaign dan post.

## `/campaign/:id`

Campaign detail dan feed.

## `/campaign/:id/create`

Create post.

## `/post/:id`

Post detail.

## `/profile/:username`

Creator profile.

## `/activity`

Vote dan support activity.

## `/wallet`

Wallet / transaction information.

## `/create`

Create campaign.

---

# 28. Create Post UX

Target:

**Post dalam beberapa detik.**

Flow:

```text
Campaign
   ↓
Tap "Post"
   ↓
Camera / Gallery
   ↓
Preview
   ↓
Optional Caption
   ↓
Post
```

Jangan membuat editing flow kompleks.

MVP tidak membutuhkan:

* filters;
* crop editor kompleks;
* stickers;
* music;
* effects;
* AI enhancement.

---

# 29. Support UX

Support harus terasa seperti social interaction, bukan financial trading interface.

Example:

```text
Support @creator

Choose amount

$1     $5     $10

Custom
[ $  ______ ]

       [ Support ]
```

Setelah transaksi:

```text
Support sent ✓

You supported @creator
with $5 USDC.
```

---

# 30. Notification / Activity

Activity dapat menampilkan:

```text
@alice voted on your post

@bob supported you with $5

Your post received 10 new votes

Your campaign is ending soon
```

MVP dapat menggunakan polling atau basic notification mechanism.

Real-time notification bukan requirement wajib.

---

# 31. Backend Architecture

Backend menggunakan NestJS modular monolith.

```text
src/
├── auth/
├── users/
├── campaigns/
├── posts/
├── votes/
├── supports/
├── transactions/
├── ai/
├── blockchain/
├── storage/
├── activity/
├── prisma/
└── common/
```

---

# 32. Backend Stack

```text
NestJS
TypeScript
PostgreSQL
Prisma
OpenRouter
Google Cloud Storage
Privy
EVM-compatible blockchain
REST API
Swagger
```

---

# 33. Authentication Architecture

Privy menjadi authentication layer.

```text
Frontend
   ↓
Privy
   ↓
Authenticated session
   ↓
NestJS API
   ↓
User
```

Backend tetap melakukan authorization terhadap resource.

Contoh:

```text
User A

PATCH /users/me
```

Backend harus menentukan user berdasarkan authenticated Privy identity, bukan berdasarkan `userId` yang dikirim client.

---

# 34. Storage Architecture

```text
Frontend
   │
   │ POST /uploads/presign
   ▼
NestJS
   │
   │ Signed URL
   ▼
GCS
   ▲
   │
   │ Direct Upload
   │
Frontend
```

PostgreSQL hanya menyimpan:

```text
imageKey
imageUrl
thumbnailKey
thumbnailUrl
```

---

# 35. Database Models

Core entities:

```text
User
Campaign
Post
Vote
Support
Transaction
AICampaignGeneration
```

Tidak diperlukan lagi entity:

```text
CampaignResult
Reward
Backing
```

dalam bentuk konsep lama.

`Backing` dapat diganti menjadi `Support`.

---

# 36. Simplified Data Relationships

```text
User
 │
 ├── Posts
 │
 ├── Votes
 │
 ├── Supports
 │
 └── Transactions
       │
       ▼
     Post
       │
       └── Campaign
```

---

# 37. API Requirements

## Auth

Privy menangani authentication.

Backend:

```http
GET /users/me
```

---

## Campaign

```http
GET    /campaigns
GET    /campaigns/:id
POST   /campaigns
PATCH  /campaigns/:id
POST   /campaigns/:id/start
POST   /campaigns/:id/finish
GET    /campaigns/:id/posts
GET    /campaigns/:id/leaderboard
```

---

## Posts

```http
GET    /posts/:id
POST   /campaigns/:campaignId/posts
DELETE /posts/:id
```

---

## Votes

```http
POST   /posts/:id/vote
DELETE /posts/:id/vote
GET    /posts/:id/votes
```

---

## Supports

```http
POST /posts/:id/support
GET  /posts/:id/supporters
GET  /users/me/supports
GET  /users/:walletAddress/supports
```

---

## Upload

```http
POST /uploads/presign
```

---

## AI

```http
POST /ai/campaign/generate
POST /ai/campaign/generate-from-trends
```

---

## Transactions

```http
GET /transactions/:hash
GET /users/me/transactions
```

---

# 38. Security Requirements

## Authentication

* Privy session validation.
* Server-side authorization.
* No client-provided user ID trust.

## Upload

* Validate MIME type.
* Validate file size.
* Only allow image formats.
* Generate random storage keys.
* Prevent arbitrary storage path injection.
* Verify uploaded object belongs to authenticated user where applicable.

## API

* Request validation.
* Rate limiting.
* CORS configuration.
* Security headers.
* Input sanitization.
* Pagination limits.

## Blockchain

* Never store private keys.
* Verify transaction hash.
* Verify sender.
* Verify recipient.
* Verify amount.
* Verify chain ID.
* Prevent duplicate transaction processing.
* Use idempotent event indexing.

---

# 39. Moderation

MVP harus memiliki minimal moderation mechanism.

Potential moderation:

* Report post.
* Hide/delete inappropriate content.
* Admin campaign moderation.
* Admin post moderation.

Future:

* AI image moderation.
* AI text moderation.
* Automated abuse detection.

---

# 40. Anti-Abuse

Karena vote gratis dan support menggunakan uang, platform harus mempertimbangkan abuse.

MVP:

* One vote per user/post.
* Rate limiting.
* Transaction verification.
* Duplicate transaction protection.
* Spam prevention.
* Upload limits.
* Maximum post limit per campaign.

Future:

* Sybil detection.
* Wallet reputation.
* Bot detection.
* Device fingerprinting.

---

# 41. Analytics

Track basic product metrics.

### User

* New users.
* Active users.
* Returning users.

### Campaign

* Campaign views.
* Campaign participants.
* Posts per campaign.
* Campaign completion.

### Social

* Votes.
* Votes per post.
* Support transactions.
* Support volume.

### Financial

* Total support volume.
* Average support amount.
* Number of supporters.
* Number of supported creators.

---

# 42. Key Product Metrics

Primary metrics:

### Creator Activation

Percentage of users who create their first post.

### Campaign Participation

Number of unique users participating in campaigns.

### Support Conversion

```text
Users who support
-----------------
Users who view posts
```

### Creator Support

Total amount sent to creators.

### Engagement

```text
Votes + Supports
----------------
Post Views
```

---

# 43. MVP Acceptance Criteria

MVP dianggap berhasil apabila user dapat melakukan seluruh flow:

```text
1. Open website
2. Login using Privy
3. Browse campaign
4. Open campaign
5. Upload photo
6. Create post
7. See post in feed
8. Vote another post
9. Support creator with custom amount
10. Confirm wallet transaction
11. Transaction becomes confirmed
12. Creator sees received support
13. User sees transaction history
```

---

# 44. Technical MVP Architecture

```text
                    ┌─────────────────┐
                    │   Mobile Web    │
                    │ Next.js / React │
                    └────────┬────────┘
                             │
                   ┌─────────▼─────────┐
                   │      Privy        │
                   │ Auth + Wallet     │
                   └─────────┬─────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   NestJS API    │
                    └───────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       PostgreSQL          GCS         OpenRouter
       Application         Images          AI
          Data
             │
             │
             ▼
       Blockchain
             │
             ▼
       Support Tx
```

---

# 45. Recommended Infrastructure

Since existing GCP resources are available:

```text
GCP
├── Cloud Run
│   └── NestJS API
│
├── Cloud Storage
│   └── Images
│
└── Cloud SQL
    └── PostgreSQL
```

Frontend can be deployed separately depending on the chosen hosting platform.

Blockchain interaction remains external to GCP.

---

# 46. MVP Development Priority

## P0 — Required

* Privy authentication.
* User profile.
* Campaign.
* Post creation.
* GCS image upload.
* Campaign feed.
* Vote.
* Support.
* Wallet transaction.
* Blockchain transaction verification.
* Creator support balance/history.
* Mobile-first UI.
* Responsive desktop UI.

## P1 — Important

* AI campaign generation.
* Explore.
* Activity.
* Creator statistics.
* Campaign leaderboard.
* Moderation/reporting.

## P2 — Future

* Trending algorithm.
* Personalized feed.
* AI moderation.
* Notifications.
* Social graph.
* Creator analytics.
* Advanced recommendation system.

---

# 47. Design Direction

Instant.fun should feel like a **modern social product**, not a traditional DeFi dashboard.

Avoid:

* excessive wallet terminology;
* complicated transaction screens;
* dense financial tables;
* overly technical blockchain UI;
* casino/betting visual language;
* complicated charts.

Prioritize:

* large visual content;
* fast interactions;
* minimal navigation;
* clear creator identity;
* prominent Vote and Support actions;
* mobile gestures;
* fast image loading;
* clean typography;
* strong campaign identity.

---

# 48. Product Principles

### 1. Instant

Posting should be fast.

### 2. Social First

The primary experience is discovering and interacting with people/content.

### 3. Web3 When It Matters

Blockchain should be used for ownership and financial transactions, not unnecessarily for every interaction.

### 4. Creator First

Support goes directly toward creators.

### 5. Transparent

Users should be able to verify financial transactions on-chain.

### 6. Mobile First

The primary experience should work exceptionally well on a phone.

### 7. Simple Web3

Users should not need blockchain knowledge to use the product.

---

# 49. Final Product Loop

```text
             AI
             │
             ▼
        TREND / IDEA
             │
             ▼
         CAMPAIGN
             │
             ▼
      ┌───────────────┐
      │     USERS     │
      └───────┬───────┘
              │
              ▼
          POST PHOTO
              │
              ▼
         SOCIAL FEED
              │
       ┌──────┴──────┐
       ▼             ▼
      VOTE         SUPPORT
       │             │
       │          ANY AMOUNT
       │             │
       │             ▼
       │          CREATOR
       │          RECEIVES
       │           FUNDS
       │
       └──────┬──────┘
              ▼
       CREATOR DISCOVERY
```

---

# 50. One-Line Product Definition

**Instant.fun is a mobile-first Web3 social platform where people join trend-driven campaigns, post instantly, vote on content, and directly support creators with on-chain payments.**
