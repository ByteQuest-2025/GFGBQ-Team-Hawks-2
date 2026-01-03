# Tax Compliance Copilot - Team Task Division

> **Team Size**: 3 members  
> **Total Time**: 24 hours  
> **Status**: ✅ FOUNDATION COMPLETE - Ready for parallel development

---

## 🚀 Getting Started (All Members)

```bash
cd GFGVB
npm install
npm run dev
# Open http://localhost:5173
```

**Optional**: To add Tailwind CSS:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## ✅ Foundation Complete (DO NOT MODIFY)

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces |
| `src/lib/rules.ts` | 11 Indian tax compliance rules |
| `src/lib/deadlines.ts` | Deadline date generator |
| `src/lib/alerts.ts` | Risk alert generator |
| `src/lib/store.tsx` | React context + localStorage |
| `src/index.css` | Global CSS theme |
| `src/App.tsx` | Router + providers |
| `src/components/*` | Navbar, OnboardWizard |
| `src/pages/*` | Dashboard, Calendar, Copilot |

---

## 👤 Member 1: Dashboard Enhancements

### Your Task
Enhance the Dashboard with visual analytics and better UX.

### Files to Modify
- `src/pages/Dashboard.tsx`
- `src/pages/Dashboard.css`

### Enhancements
1. Add pie/donut chart for obligation breakdown
2. Add timeline progress bar for current month
3. Improve stat cards with micro-animations
4. Add "What to do next" action cards

### AI Prompt for Continuation

```
Continue developing the Tax Compliance Copilot dashboard.

CONTEXT:
- Vite + React + TypeScript project
- Store is in src/lib/store.tsx (use `useStore()` hook)
- CSS uses variables in src/index.css (e.g., --color-primary, --color-surface)
- Dashboard.tsx already has basic stats and obligations list

YOUR TASK:
1. Add a donut chart showing obligation breakdown by type (GST/IT/TDS)
   - Use a simple CSS-based chart or install recharts/chart.js
2. Add a "Next Action" card that highlights the most urgent item
3. Add smooth hover animations to stat cards
4. Ensure mobile responsiveness

DESIGN REQUIREMENTS:
- Dark theme (bg: #0f172a, surfaces: #1e293b)
- Primary color: #6366f1 (indigo)
- Use glassmorphism for cards (subtle transparency)
- Micro-animations on interactions

AVAILABLE DATA from useStore():
- profile: BusinessProfile
- obligations: ComplianceObligation[]
- deadlines: Deadline[]
- alerts: RiskAlert[]
```

---

## 👤 Member 2: Calendar View Enhancements

### Your Task
Build a proper month-grid calendar view with visual deadline markers.

### Files to Modify
- `src/pages/Calendar.tsx`
- `src/pages/Calendar.css`

### Enhancements
1. Add month grid view (7x5 grid)
2. Show deadline dots/badges on dates
3. Click date to see deadline details
4. Add month navigation (prev/next)

### AI Prompt for Continuation

```
Continue developing the Tax Compliance Copilot calendar page.

CONTEXT:
- Vite + React + TypeScript project
- Store is in src/lib/store.tsx (use `useStore()` hook)
- Calendar.tsx has a list view with filters, needs grid view

YOUR TASK:
1. Add a month grid calendar component:
   - 7 columns (Sun-Sat), 5-6 rows
   - Current month displayed by default
   - Prev/Next month navigation buttons
2. Show deadline indicators:
   - Green dot: upcoming (>7 days)
   - Yellow dot: due soon (≤7 days)
   - Red dot: overdue
3. Click on a date to show deadline details in a modal/sidebar
4. Keep the existing list view as a toggle option

DESIGN REQUIREMENTS:
- Dark theme matching the app
- Today's date highlighted
- Smooth transitions between months
- Mobile: stack or scroll horizontally

AVAILABLE DATA from useStore():
- deadlines: Deadline[] (has dueDate, status, obligationName, etc.)
- markDeadlineComplete(id): function to mark complete
```

---

## 👤 Member 3: AI Copilot Integration

### Your Task
Replace mock AI responses with real Gemini API integration.

### Files to Modify
- `src/lib/gemini.ts` (create this)
- `src/pages/Copilot.tsx`

### Enhancements
1. Integrate Gemini API for real responses
2. Add context-aware system prompt
3. Improve response rendering (markdown support)
4. Add conversation memory

### AI Prompt for Continuation

```
Continue developing the Tax Compliance Copilot AI assistant.

CONTEXT:
- Vite + React + TypeScript project
- Copilot.tsx has mock responses in getMockResponse()
- @google/generative-ai package is already installed
- Store provides profile, obligations, deadlines, alerts

YOUR TASK:
1. Create src/lib/gemini.ts with Gemini API integration:
   - Initialize with API key from env (VITE_GEMINI_API_KEY)
   - Create chat function with system prompt
   - Handle streaming responses if possible

2. System prompt should include:
   - User's business profile (name, type, turnover)
   - Current obligations list
   - Upcoming deadlines
   - Instructions to be friendly, use simple language, reduce fear

3. Update Copilot.tsx to use real API:
   - Replace getMockResponse with Gemini call
   - Add error handling for API failures
   - Fallback to mock if no API key

4. Add markdown rendering for AI responses:
   - Bold, lists, headers
   - Code blocks for dates/amounts

SYSTEM PROMPT TEMPLATE:
"""
You are a friendly tax compliance assistant for Indian micro-businesses.

USER PROFILE:
- Business: {name} ({type})
- Turnover: {turnover}
- State: {state}
- GST Registered: {hasGST}

THEIR OBLIGATIONS:
{obligationsList}

UPCOMING DEADLINES:
{deadlinesList}

RULES:
1. Explain in simple language, avoid jargon
2. Use Hindi-English (Hinglish) terms when helpful
3. Always mention specific dates
4. Reduce fear - emphasize compliance is manageable
5. If unsure, recommend consulting a CA
"""

ENV SETUP:
Create .env file with VITE_GEMINI_API_KEY=your_key
```

---

## 🔗 Integration Sync Point

After individual work (2-3 hours), sync up and:

1. Pull all changes
2. Resolve any CSS conflicts
3. Test complete flow:
   - Onboarding → Dashboard → Calendar → Copilot
4. Polish animations and transitions

---

## 🎬 Demo Script

1. **Intro**: "Meet Priya, a freelance designer earning ₹8L/year"
2. **Onboard**: Fill wizard in 30 seconds
3. **Dashboard**: Show auto-detected obligations
4. **Calendar**: Highlight next deadline with countdown
5. **Copilot**: Ask "What should I file this month?"
6. **Alert**: Show risk warning for upcoming deadline

---

## � Communication

- Merge to main after each major feature
- Test locally before pushing
- Use descriptive commit messages
- Don't modify shared `lib/` files without team sync
