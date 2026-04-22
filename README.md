# Save Your Money

**Tagline:** *"Your loans are costing you more than you think. Let's fix that."*

**Subtitle:** *"Track every loan. Reveal hidden costs. Save real money."*

Save Your Money is an AI-powered loan portfolio tracker that helps users understand the true cost of their loans and discover how much they can save through smarter repayment decisions.

## Why This App Exists

Most borrowers have limited visibility into:

- how much interest they have already paid,
- how much interest is still pending,
- what foreclosure or early prepayment could save.

This project brings all loan accounts into a single view and uses AI-powered document extraction plus financial calculations to highlight actionable savings.

## Core Features

- Multi-loan portfolio tracking (home, personal, car, credit-card loans, etc.)
- PDF upload for sanction letters, statements, and amortization schedules
- AI extraction pipeline (Gemini + LangGraph) for structured loan data
- Loan health analytics (principal, interest paid, remaining interest, outstanding)
- Foreclosure and prepayment savings calculator
- Unified dashboard focused on "money you are losing vs money you can save"

## Tech Stack

### Frontend (`/frontend`)

- React + TypeScript
- Vite + React Compiler
- TanStack Query
- Tailwind CSS
- shadcn/ui

### Backend (`/backend`)

- FastAPI (Python 3.12)
- Pydantic v2 + pydantic-settings
- LangGraph
- Google Gemini

## Repository Structure

```text
save-your-money/
├── frontend/   # React app
├── backend/    # FastAPI app
└── README.md   # You are here
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or equivalent package manager)
- Python 3.12
- pip

## Environment Variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ENVIRONMENT=development
```

## Local Development Setup

### 1) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on:

- `http://localhost:5173`

Available frontend scripts:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

### 2) Backend setup

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

## Product Direction

### Primary user outcome

Help users reduce total interest outflow across all active loans.

### Decision-support insights we plan to surface

- Interest paid till date
- Interest remaining
- Effective cost of loan over time
- Foreclosure amount today
- Savings from foreclosure vs continue EMI
- Savings from partial prepayments across timelines

## Development Notes

- Keep all analytics reproducible and explainable; avoid black-box outputs for money decisions.
- Keep AI output reviewable and editable by users before finalizing any calculations.
- Prioritize clear UX copy for financial terms and savings implications.

## License

MIT (intended; adjust if needed).