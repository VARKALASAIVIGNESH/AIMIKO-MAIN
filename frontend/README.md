# AIMIKO — Adaptive AI Ecosystem

AIMIKO is a personalized AI platform that adapts to a user’s age, profession, goals, and interests.

## What it includes today

- Personalized AI chat assistant with age and role-based prompts
- Role-aware dashboard for learners, creators, developers, analysts, job seekers, founders, and teachers
- Age-adapted workflows for kids, teens, college, adults, and seniors
- Basic productivity and planning placeholders
- Notes, achievements, and network scaffolding for the AIMIKO ecosystem

## Run the app

```bash
npm install
npm run dev
```

## Local Ollama setup

If you want to run AIMIKO with Ollama on your local machine, set these env variables in `.env`:

```env
VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama2
```

Then start your local Ollama instance before running the app.

## Notes

This repository is currently an MVP for the full AIMIKO vision. The codebase now includes additional pages and context to support planner, notes, achievements, network, profile, and school portal experiences.
