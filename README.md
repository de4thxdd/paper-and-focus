# Paper & Focus

Premium diary + study workspace built with React/Vite, Express, SQLite and Socket.IO.

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000

## Included fixes

- Daily schedule, tasks and goals can be edited and deleted.
- Daily goals are fully writable.
- Weekly day cards are editable with per-day plans.
- Weekly Chapters section for chapter names planned for the week.
- Monthly calendar dates open a planning panel for tasks, schedules and goals.
- Study history is stored in seconds and displayed with correct time units.
- Self Study has Timer and Stopwatch modes.
- Self Study timer automatically saves when countdown reaches zero.
- Self Study manual Finish & Save records the actual elapsed duration.
- Group Study room persists while navigating between Daily, Weekly, Monthly and Dashboard.
- Dashboard updates live while a group room is active.
- End Room and Leave Room controls remain visible and functional.
- Dashboard visually separates Self Study in red and Group Study in blue.

## Important

The SQLite database is created automatically in `server/data/diary.sqlite`.
Existing study-session durations are interpreted as seconds by this build, matching the timer API.
