# instant.fun

**Snap. Join. Get Voted.** Post instantly, get discovered, support creators.

instant.fun is a mobile-first Web3 social app. Users join trending photo campaigns, shoot a live snap,
vote for their favorites for free, and tip creators directly on **BNB Chain**.

| | |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion |
| **Auth & wallet** | Privy (embedded wallets) |
| **Database** | PostgreSQL · Prisma 7 |
| **Storage** | S3 (snap uploads, served through `/api/media`) |
| **AI** | OpenRouter (campaign generation from trends) |
| **Chain** | BNB Chain · `InstantFun.sol` (Foundry), via ethers v6 |
| **Demo video** | Remotion ([`video/`](video)) |

---

## How it works

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'14px', 'lineColor':'#8b8b8b', 'edgeLabelBackground':'#ffffff'}}}%%
flowchart LR
    A["⚡ <b>Join</b><br/>pick a live campaign"]
    B["📸 <b>Snap</b><br/>live camera,<br/>2-minute window"]
    C["❤️ <b>Vote</b><br/>free, gas sponsored"]
    D["💸 <b>Support</b><br/>tip the creator<br/>any amount"]
    E["🏆 <b>Leaderboard</b><br/>most-loved snaps rise"]

    A --> B --> C --> E
    B --> D

    classDef yellow fill:#ffe000,stroke:#1c1b1b,stroke-width:3px,color:#1c1b1b
    classDef blue fill:#106df4,stroke:#1c1b1b,stroke-width:3px,color:#ffffff
    classDef pink fill:#ff3d68,stroke:#1c1b1b,stroke-width:3px,color:#ffffff
    classDef gold fill:#f0b90b,stroke:#1c1b1b,stroke-width:3px,color:#1c1b1b
    classDef green fill:#71fb96,stroke:#1c1b1b,stroke-width:3px,color:#1c1b1b

    class A yellow
    class B blue
    class C pink
    class D gold
    class E green
```

Support is a **direct tip**: money goes from the supporter to the creator. It is not a bet, an
investment, or an entry fee. See [`PRD.md`](PRD.md) for the full product spec.

---

## Architecture

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'14px', 'lineColor':'#8b8b8b', 'edgeLabelBackground':'#ffffff'}}}%%
flowchart LR
    subgraph CLIENT["📱 Client (PWA)"]
        direction TB
        UI["Next.js pages<br/>app/(app) · app/(marketing)"]
        PRIVY["Privy<br/>login + embedded wallet"]
    end

    subgraph SERVER["⚙️ Next.js API · app/api"]
        direction TB
        ROUTES["Route handlers<br/>campaigns · posts · users<br/>donations · wallet · uploads"]
        SVC["lib/services<br/>campaign · post · vote · donation<br/>escrow · chain-sync · ai"]
    end

    subgraph DATA["🗄️ Data"]
        direction TB
        PG[("PostgreSQL<br/>Prisma")]
        S3[("S3<br/>snap images")]
    end

    subgraph EXT["🌐 External"]
        direction TB
        OR["OpenRouter<br/>AI campaigns"]
        BNB["BNB Chain<br/>InstantFun.sol"]
    end

    UI --> ROUTES
    PRIVY -. "JWT" .-> ROUTES
    PRIVY -- "sign tx" --> BNB
    ROUTES --> SVC
    SVC --> PG
    SVC --> S3
    SVC --> OR
    SVC -- "index events" --> BNB

    classDef client fill:#ffe000,stroke:#1c1b1b,stroke-width:2px,color:#1c1b1b
    classDef server fill:#106df4,stroke:#1c1b1b,stroke-width:2px,color:#ffffff
    classDef data fill:#71fb96,stroke:#1c1b1b,stroke-width:2px,color:#1c1b1b
    classDef ext fill:#f0b90b,stroke:#1c1b1b,stroke-width:2px,color:#1c1b1b

    class UI,PRIVY client
    class ROUTES,SVC server
    class PG,S3 data
    class OR,BNB ext

    style CLIENT fill:#fff9cc,stroke:#e2c600,stroke-width:2px
    style SERVER fill:#e8f0ff,stroke:#106df4,stroke-width:2px
    style DATA fill:#eafff0,stroke:#54e07f,stroke-width:2px
    style EXT fill:#fff4d6,stroke:#d4a309,stroke-width:2px
```

The backend never trusts amounts sent by the client: it reads them from on-chain events
(`lib/services/chain-sync.service.ts`).

---

## Money flow on-chain

`contracts/src/InstantFun.sol` handles all money. Details are in [`contracts/README.md`](contracts/README.md).

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'14px', 'actorBkg':'#ffe000', 'actorBorder':'#1c1b1b', 'actorTextColor':'#1c1b1b', 'actorLineColor':'#8b8b8b', 'signalColor':'#8b8b8b', 'sequenceNumberColor':'#ffffff', 'signalTextColor':'#1c1b1b', 'noteBkgColor':'#d9e2ff', 'noteBorderColor':'#106df4', 'noteTextColor':'#001945', 'activationBkgColor':'#71fb96', 'activationBorderColor':'#006d32'}}}%%
sequenceDiagram
    autonumber
    participant S as 🙋 Supporter
    participant B as 🏢 Brand
    participant C as InstantFun.sol
    participant K as 📸 Creator
    participant API as Backend

    rect rgb(255, 228, 234)
        Note over S,K: Support = direct tip
        S->>C: support(creator, postId, amount)
        C->>K: transfer (contract never holds it)
        C-->>API: SupportSent → indexed
    end

    rect rgb(232, 240, 255)
        Note over B,K: Brand campaign escrow
        B->>C: fundEscrow(campaignId, amount, endsAt)
        activate C
        B->>C: payout / payoutMany(creators)
        C->>K: pay picked creators
        B->>C: refund() after endsAt
        C->>B: return what is left
        deactivate C
        C-->>API: EscrowFunded / EscrowPaid / EscrowRefunded → indexed
    end
```

---

## Data model

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'14px', 'primaryColor':'#ffe000', 'primaryBorderColor':'#1c1b1b', 'primaryTextColor':'#1c1b1b', 'lineColor':'#8b8b8b', 'tertiaryColor':'#fcf9f8', 'relationLabelBackground':'#ffffff', 'relationLabelColor':'#1c1b1b'}}}%%
erDiagram
    User ||--o{ Campaign : creates
    User ||--o{ Post : snaps
    User ||--o{ Vote : casts
    User ||--o{ Donation : sends
    Campaign ||--o{ Post : contains
    Campaign ||--o{ EscrowPayout : "pays out"
    Post ||--o{ Vote : receives
    Post ||--o{ Donation : receives
    Campaign ||--o{ Donation : collects
    Post ||--o{ EscrowPayout : "paid for"
    User ||--o{ EscrowPayout : earns
    User |o--o{ Transaction : signs
    Campaign |o--o{ Transaction : logs
```

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Getting started

**1. Install dependencies** (also runs `prisma generate`)

```bash
npm install
```

**2. Configure `.env`** with the variables below.

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_POOLED` | PostgreSQL connection |
| `NEXT_PUBLIC_PRIVY_APP_ID`, `PRIVY_APP_SECRET` | Privy auth |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | AI campaign generation |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | S3 uploads |
| `BLOCKCHAIN_RPC_URL`, `CHAIN_ID` | Server-side chain access |
| `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_INSTANT_FUN_ADDRESS` | Deployed `InstantFun` contract |
| `NEXT_PUBLIC_USDC_ADDRESS`, `NEXT_PUBLIC_USDC_DECIMALS` | Support token |

Testnet contract addresses are listed in [`contracts/README.md`](contracts/README.md#deployments).

**3. Set up the database**

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

**4. Run the dev server** and open [http://localhost:3000](http://localhost:3000)

```bash
npm run dev
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed mock data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset the database and re-seed |

---

## Project structure

```text
instant-fe/
├── app/
│   ├── (marketing)/   # landing page
│   ├── (app)/         # the mobile app: (tabs) home, campaigns, snap, wallet… · (focus) create, onboarding
│   ├── api/           # route handlers
│   └── docs/          # API docs
├── components/        # UI by feature (campaign, snap, leaderboard, landing, ui…)
├── lib/
│   ├── services/      # business logic
│   ├── contracts/     # contract ABI + helpers
│   └── …              # auth, api client, formatting
├── prisma/            # schema, migrations, seed
├── contracts/         # Foundry project: InstantFun.sol
├── public/            # brand, marketing and mock images
└── video/             # Remotion demo video
```
