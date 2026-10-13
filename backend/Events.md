# Events & Registration

Dynamic, Google-Forms-style registration. Each event defines its own fields and its
own look, stored in Firestore. Registration requires Google sign-in.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | public | Landing page |
| `/[eventName]` | public | Event details + Register button |
| `/[eventName]/register` | signed-in | Dynamic registration form |
| `/[eventName]/register/users` | admin | Registrations table + xlsx export |
| `/admin/events` | admin | Create an event (form builder) |

Admins are set via the `ADMIN_EMAILS` env var.

## Make a new event

1. Sign in at `/login` with an admin Google account.
2. Go to `/admin/events`.
3. Fill in **title**, **description**, **status**, and theme (**accent color**,
   **layout**, optional **banner URL**).
   - `draft` = hidden, `open` = accepting registrations, `closed` = visible, no signups.
4. Add fields with **+ Add field**. Pick a type, set the label, mark required.
   - For **Dropdown / Single choice / Multiple choice**, enter comma-separated options.
5. Click **Create event**. You land on `/[eventName]`.
6. Share `/[eventName]` — people register at `/[eventName]/register`.
7. View/export signups at `/[eventName]/register/users`.

Field types: short text, paragraph, email, number, dropdown, single choice,
multiple choice, date, time, phone, url.

## Data model

- `events/{slug}` — title, description, status, theme, `fields[]`, meta.
- `events/{slug}/registrations/{uid}` — one doc per user (`answers` keyed by field id).

## Custom UI per event (full freedom, by code)

The theme covers the common case. To hand-write a whole registration page in code:

1. Copy `src/components/events/_example.tsx` → `src/components/events/<slug>.tsx`.
2. Build any UI you want. Use the `useRegister(slug)` hook for the plumbing —
   it gives you `{ user, ready, submitting, error, signIn, submit }` so you only
   write markup. Call `submit(answers)` with your answers object.
3. Register it in `src/components/events/registry.ts`:
   ```ts
   import HackathonForm from "./hackathon";
   export const EVENT_OVERRIDES = { hackathon: HackathonForm };
   ```

`/[eventName]/register` renders the override if the slug is registered, else the
default themed `DynamicForm`. Everything else (details page, admin table, export)
stays the same.

**Important — answer ids:** the server validates `submit({...})` answers against the
event's declared **fields**, and those field ids are your export columns. So still
add the fields in the builder and set a readable **field id** (e.g. `reg_number`),
then submit with the same ids. Fields you don't declare are ignored. You control
only the *look*; the *schema* stays in one place.

You can skip the hook entirely and just `fetch("POST /api/events/<slug>/register")`
with a Firebase `Authorization: Bearer` token — the hook is only a convenience.
