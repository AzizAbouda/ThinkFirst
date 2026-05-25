# ThinkFirst — Socratic AI Tutor

An AI tutoring platform that never gives you the answer — it guides you to find it.

## Architecture

```
thinkfirst/
├── client/          React + Vite + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── SessionSetup.tsx    Subject/level selector screen
│       │   ├── ChatWindow.tsx      Main chat interface
│       │   ├── MessageBubble.tsx   Individual message renderer
│       │   ├── GiveUpButton.tsx    Two-step give-up confirmation
│       │   └── SessionSummary.tsx  Post-session recap panel
│       ├── hooks/
│       │   └── useChat.ts          Chat state + SSE streaming
│       ├── lib/
│       │   └── systemPrompt.ts     Socratic system prompt builder
│       └── types.ts                Shared TypeScript types
└── server/
    ├── index.js                    Express entry point
    └── routes/chat.js              POST /api/chat → Claude (streaming)
```

## Setup

### 1. Get an Anthropic API key

Sign up at https://console.anthropic.com and copy your key.

### 2. Configure the backend

```bash
cd server
cp ../.env.example .env
# Edit .env and paste your ANTHROPIC_API_KEY
npm install
```

### 3. Configure the frontend

```bash
cd client
npm install
```

### 4. Run both in dev mode

In two separate terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open http://localhost:5173.

Vite proxies `/api/*` to the backend at `localhost:3001`, so no CORS configuration needed in development.

## How the Socratic engine works

The system prompt (see `client/src/lib/systemPrompt.ts`) enforces a strict 5-stage escalation:

| Stage | Behaviour |
|-------|-----------|
| 1 — Understand | Ask what the student has already tried. No hints yet. |
| 2 — Diagnose | Pinpoint the exact gap. One targeted question. |
| 3 — Hint | Smallest possible nudge. One per message. |
| 4 — Probe | Ask student to explain their reasoning aloud. |
| 5 — Escalate | Guiding question → similar worked example → full solution. |

Hard rules baked into the prompt:
- One question or one hint per message — never both
- Never solve the problem unless the student clicks "I give up"
- Tone adapts to grade level (primary / secondary / university)
- After any final answer: reflection prompt is mandatory

## The "I give up" flow

The button uses two-step confirmation (intentional friction). When confirmed:
- The client sends `giveUp: true` in the API payload
- The server appends an `[OVERRIDE]` instruction to the system prompt
- Claude drops Socratic constraints for that one response only
- After the solution, Claude still asks for a reflection

## Extending for future features

**Teacher dashboard**: Add a `POST /api/sessions` route to persist session stats. The `SessionStats` type in `types.ts` is already the right shape for a DB row.

**Gamification**: The `hintsUsed` and `gaveUp` fields in `SessionStats` are the natural inputs for a streak/badge system.

**Multi-language**: The system prompt in `systemPrompt.ts` accepts the full session config — add a `language` field to `SessionConfig` and include it in the prompt template.

**Auth**: Add a `userId` to `SessionConfig` and thread it through the API. The server is already stateless enough to accept it without architectural changes.

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Your Anthropic API key |
| `PORT` | No | 3001 | Backend port |
| `CLIENT_ORIGIN` | No | http://localhost:5173 | CORS allowed origin for prod |
