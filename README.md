# Omni Forge — AI Agent Studio

Multimodal AI creation studio powered by Open Design architecture patterns. Create text, images, video, audio, and 3D models through intelligent agent workflows.

## Architecture

Omni Forge deeply borrows the proven architecture patterns from [Open Design](https://github.com/nexu-io/open-design) and maps them to a multimodal creative platform:

| Open Design Pattern | Omni Forge Mapping |
|---|---|
| Agent-agnostic Adapter (21 CLI adapters) | Multimodal Agent adapters (text / image / video / audio / 3D) |
| 3-Layer Architecture (Frontend / Daemon / CLI) | Frontend (Next.js 16) / API Routes / Agent Execution |
| 14-Layer Prompt Composition | Multimodal prompt orchestration pipeline |
| Plugin-as-Filesystem (SKILL.md + JSON) | Creative skill plugins, zero build steps |
| Design System as Markdown (150+ DESIGN.md) | Creative style & brand systems (BRAND.md) |
| SSE Streaming Protocol (start/agent/stdout/stderr/end) | Unified multimodal streaming events |
| Artifact Streaming Rendering (srcdoc iframe) | Multimodal artifact preview (HTML / image / video / audio / 3D) |
| Critique Theater (5-role AI review) | 6-role creative quality review with rolling ratchet |
| Contracts as Architecture Seams (pure TS + Zod) | Platform contracts package, zero runtime deps |
| Local-first + BYOK API Mode | Local CLI + API proxy creative tool modes |

## Features

- **5 Modalities** — Text, Image, Video, Audio, 3D Model creation in one unified interface
- **Streaming Artifacts** — Real-time preview of generated content with SSE streaming
- **Critique Theater** — 6-role AI review system (Designer, Critic, Brand, A11y, Copy, Modalist) with ship/degrade/fail verdicts
- **Plugin System** — Skill, brand, adapter, and tool plugins with capability-gated activation
- **Brand System** — Markdown-based brand guidelines (BRAND.md) injected into all generation
- **Prompt Orchestration** — 14-layer prompt composition with strict priority ordering
- **Dark / Light Mode** — Warm neutral design system inspired by Claude's minimal aesthetic

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4, shadcn/ui (new-york style)
- **State**: Zustand 5
- **Animation**: Framer Motion 12
- **Database**: Prisma 6 + SQLite
- **AI SDK**: z-ai-web-dev-sdk
- **Validation**: Zod 4
- **Forms**: React Hook Form 7

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm

### Install

```bash
git clone https://github.com/dav-niu474/Omni-Forge-AI-Agent-Studio.git
cd Omni-Forge-AI-Agent-Studio
bun install
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
bun run build
bun start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main studio page
│   └── api/                # API routes (chat, agents, plugins, etc.)
├── components/
│   ├── studio/             # Studio-specific components
│   │   ├── StudioLayout.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── ArtifactPreview.tsx
│   │   ├── ModalitySelector.tsx
│   │   ├── CritiqueTheater.tsx
│   │   ├── PluginContext.tsx
│   │   ├── BrandSystemPanel.tsx
│   │   ├── SSEEventLog.tsx
│   │   └── StatusBar.tsx
│   └── ui/                 # shadcn/ui components (41 primitives)
├── hooks/                  # Custom React hooks
│   ├── useChatStream.ts    # Chat SSE streaming
│   ├── useSSEStream.ts     # Generic SSE utility
│   ├── usePluginContext.ts  # Plugin state management
│   └── useCritique.ts      # Critique computation
├── lib/
│   ├── store.ts            # Zustand global store
│   ├── types.ts            # TypeScript type definitions
│   ├── contracts/          # Platform contracts (SSE, plugins, critique, prompts)
│   └── plugin-runtime/     # Plugin validation, parsing, resolution
└── prisma/
    └── schema.prisma       # Database schema
```

## Design System

The UI follows a minimal, typography-driven design language inspired by Claude:

- **Warm neutral palette** — No bright accent colors; information hierarchy through opacity and weight
- **AI messages without bubbles** — Clean flat text, user messages in subtle rounded pills
- **Generous whitespace** — Content breathes; no visual clutter
- **Barely-there borders** — Ultra-subtle separators, `border-border/60`
- **Monochrome status indicators** — Minimal chrome, content is the focus

## License

MIT
