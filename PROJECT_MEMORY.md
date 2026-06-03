# Payment Tracker — Project Memory

## Overview
Web app for tracking who owes money (originally named coffee-tracker)

## URLs
- **Live app**: https://my-payment-tracker.vercel.app
- **GitHub**: https://github.com/tenalxp/coffee-tracker
- **Supabase project ID**: srkbzlhbdlxxjbigemom
- **Supabase URL**: https://srkbzlhbdlxxjbigemom.supabase.co
- **Supabase publishable key**: sb_publishable_8aqkeaKmQC22luKD7HfiAA_cfIVbjSC

## Local project path
`/Users/tenalxp/Tena's Claude/payment-tracker`

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel (auto-deploy on push to main)

## Design Theme
- **Style**: Claymorphism / Soft UI
- **Background**: gradient `linear-gradient(160deg, #E8EEF5 0%, #EDF3F0 100%)` — used globally across all tabs and modals
- **Cards**: white, `border-radius: 24px`, soft shadow + highlight
- **Font colors**: `#2D3A48` (dark), `#8A9BAA` (muted)
- **Accent**: `#8ABCD0` (soft blue)
- **Bottom nav**: frosted glass, active = `#6A9BAA`

## Database Tables (Supabase)

### `people`
| column | type | note |
|--------|------|------|
| id | uuid | PK |
| name | text | unique |
| icon | text | pixel avatar ID (e.g. 'ghost', 'cat') |
| created_at | timestamptz | |

### `coffee_entries`
| column | type | note |
|--------|------|------|
| id | uuid | PK |
| date | date | |
| name | text | member name |
| menu | text | item type |
| price | numeric(10,2) | |
| currency | text | '฿', '₭', '$' |
| description | text | optional |
| status | text | 'pending', 'paid_qr', 'paid_cash' |
| created_at | timestamptz | |

### `items`
| column | type | note |
|--------|------|------|
| id | uuid | PK |
| name | text | unique |
| created_at | timestamptz | |

## File Structure
```
src/
├── App.jsx                    # Bottom nav, tab routing (Home/Monthly/History/Members/Items)
├── index.css                  # Tailwind import
├── assets/
│   └── mascot.png             # Pixel art character in header
├── components/
│   ├── HomeView.jsx            # Header+mascot, member row, unpaid cards
│   ├── HistoryView.jsx         # All transactions with filters + summary bar + delete
│   ├── MonthlyView.jsx         # Monthly summary grouped by person
│   ├── MembersView.jsx         # Members grid + Avatar component (exported)
│   ├── ItemsView.jsx           # Item types management
│   ├── PersonHistoryModal.jsx  # Full-screen history for one person (with filters + delete)
│   ├── AddDebtModal.jsx        # Add debt entry (item, date, amount+currency, note)
│   ├── AddMemberModal.jsx      # Add member with pixel avatar picker
│   ├── EditMemberModal.jsx     # Edit member name and avatar
│   ├── AddEntryForm.jsx        # Old form (unused in main flow)
│   ├── EntryCard.jsx           # Entry card (used only in DailyView, unused in main flow)
│   ├── DailyView.jsx           # Old daily view (unused in main flow)
│   ├── StatusBadge.jsx         # Status badge + selector dropdown
│   └── PixelAvatar.jsx         # 10 pixel art SVG avatars + picker component
├── hooks/
│   ├── useCoffeeEntries.js     # Fetch entries by date / monthly / pending-by-person
│   ├── usePeople.js            # CRUD for people (includes icon field + updatePerson)
│   └── useItems.js             # CRUD for items
└── lib/
    └── supabase.js             # Supabase client init
```

## Key Components

### Avatar (exported from MembersView.jsx)
- Shows pixel art icon if `icon` prop provided, else initials
- Sizes: `sm` (40px), `md` (56px), `lg` (64px)
- Usage: `<Avatar name={p.name} icon={p.icon} size="sm" />`
- IMPORTANT: always pass `icon` prop — look up from `people` array when entry only has `name`

### PixelAvatar.jsx
- 10 pixel art SVGs: ghost, cat, invader, mushroom, robot, frog, skull, bear, star, penguin
- `<PixelAvatarIcon avatarId="ghost" size={48} />`
- `getRandomAvatarId()` — returns random avatar id

### usePendingByPerson (in useCoffeeEntries.js)
- Returns all pending entries grouped by person
- Each item: `{ name, latestDate, totals: { '฿': 100, '₭': 200 } }`
- Does NOT include `icon` — must look up from `people` array

### usePeople hook
- Exports: `people`, `loading`, `addPerson`, `deletePerson`, `updatePerson`
- Do NOT call `usePeople()` inside child modals — pass `updatePerson` as prop from parent to avoid separate state instances

## Features Implemented
- Add debt entry per member (item type, date, amount, currency, note)
- View unpaid by person (home screen cards with pixel avatar)
- Click unpaid card → PersonHistoryModal with filters + delete
- Change status: pending → paid_qr / paid_cash
- **Edit member** name and avatar (click avatar in Members tab)
- **History button** on member card (hover → clock icon bottom-right)
- Delete entry with confirmation popup (in PersonHistoryModal and HistoryView)
- History page filters: member search, date range + item on same row, status pills, currency pills (separate row)
- **Auto summary bar** in HistoryView showing total / pending / paid per currency, updates with filters
- PersonHistoryModal filters: date range, item, status (client-side filtering)
- Monthly summary grouped by person
- Add/delete members with pixel avatar picker (10 designs)
- Add/delete item types
- Mascot in header (date only, no pending count)
- Consistent gradient background across all tabs and modals
- Deployed on Vercel, Supabase cloud DB

## Deploy Process
```bash
cd "/Users/tenalxp/Tena's Claude/payment-tracker"
git add -A
git commit -m "message"
git push
# Vercel auto-deploys in ~1-2 min
```

## .env (local only)
```
VITE_SUPABASE_URL=https://srkbzlhbdlxxjbigemom.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8aqkeaKmQC22luKD7HfiAA_cfIVbjSC
```

## Known Issues / TODO
- Members added before `icon` column existed will show initials instead of pixel avatar — must edit them manually to assign an avatar
