# AI Usage Report

## Project: SmartCoach
## Course: MDS (Master in Data Science / Software Engineering)
## Date: June 2026

---

## Overview

This project made extensive use of AI tools during all phases of development:
planning, implementation, documentation, testing, and evaluation design.
All AI-generated code and content was reviewed, validated, and manually corrected by the team.

---

## Tools Used

### 1. Antigravity (Claude / Google DeepMind)

**Primary tool for implementation and documentation.**

Used for:
- Generating the Node.js + Express + TypeScript backend from scratch
- Rewriting `AuthContext.tsx` and `AppContext.tsx` to replace Firebase with a local REST API
- Creating the frontend API service layer (`src/services/api.ts`)
- Designing and implementing the two AI agent services:
  - `workout-agent.service.ts` — Workout Coach Agent
  - `nutrition-agent.service.ts` — Nutrition/Progress Agent
- Writing all backend unit tests (Vitest + Supertest)
- Designing the PostgreSQL schema and seed data
- Creating the CI/CD pipeline (GitHub Actions)
- Writing Docker and Docker Compose configuration
- Writing all MDS documentation files (user stories, backlog, bug reports, diagrams, README)
- Writing the eval JSON cases and eval runner

**Prompt strategy used:**
- Provided full project context (existing code files, data model, pages) before asking for changes
- Requested smallest safe changes rather than full rewrites where possible
- Specified technical constraints (no JWT, demo-friendly, fallback to deterministic agents)

**Human oversight:**
- Reviewed all generated code before accepting
- Manually verified the TypeScript types matched between frontend and backend
- Tested the demo login flow manually
- Corrected the `AppContext` to handle the `AgentAnalysis` shape conversion correctly

---

### 2. ChatGPT (OpenAI)

**Used for planning, ideation, and presentation preparation.**

Used for:
- Initial project planning and scope definition
- Brainstorming the two AI agent concepts
- Reviewing MDS project requirements and making sure the deliverables checklist was complete
- Drafting early versions of the user stories
- Preparing presentation slide structure
- Explaining PostgreSQL schema design decisions

**Human oversight:**
- All suggestions were filtered through team judgment
- The agent concepts were validated against the requirements before implementation

---

### 3. Groq API (Meta's LLaMA 3.3 70B)

**Integrated as an optional runtime backend for the AI agents.**

Used for:
- Agent 1 (Workout Coach): generates dynamic, personalised training plans when `GROQ_API_KEY` is set
- Agent 2 (Nutrition/Progress): generates dynamic nutrition feedback when `GROQ_API_KEY` is set
- The app is fully functional without Groq — deterministic fallbacks are always available

**Prompt design decisions:**
- Both agents use structured JSON output (`response_format: json_object`)
- Temperature set to 0.5-0.7 to balance creativity and consistency
- System prompts include explicit guardrails (no medical claims, reasonable caloric ranges)

---

## Limitations and Hallucinations

### Known limitations of AI-generated code:
1. **TypeScript type mismatches** — the initial `AppContext.tsx` rewrite had a minor type mismatch between `ApiUser` and the Firebase `User` type. Required manual correction.
2. **Groq fallback logic** — the first version of the nutrition agent didn't apply the 1200 kcal guardrail before the Groq call. Identified and fixed during review.
3. **Docker Compose networking** — the initial `docker-compose.yml` used `localhost` for the backend URL from the frontend container, which doesn't work in Docker. Corrected to use service names.

### Hallucinations observed:
- ChatGPT initially suggested using Firebase Emulator for local development instead of replacing Firebase. This was rejected in favor of a cleaner Node.js backend.
- Antigravity initially generated a JWT auth system which was out of scope. Explicitly redirected to the simpler demo auth approach.

---

## Estimated AI Assistance vs Human Work

| Phase | AI contribution | Human contribution |
|---|---|---|
| Architecture design | 60% | 40% |
| Backend implementation | 70% | 30% |
| Frontend context rewrite | 65% | 35% |
| AI agent logic | 50% | 50% |
| Testing | 75% | 25% |
| Documentation | 80% | 20% |
| Code review & debugging | 10% | 90% |
| Demo preparation | 30% | 70% |

---

## Conclusion

AI tools significantly accelerated development, particularly for boilerplate code (Express routes, PostgreSQL queries, Docker configuration) and documentation. However, human judgment was essential for:
- Making the right architectural decisions
- Reviewing generated code for correctness
- Ensuring the app behaves correctly end-to-end
- Identifying and fixing edge cases the AI missed

This project demonstrates that AI tools are most effective as collaborative pair programmers, not autonomous developers.
