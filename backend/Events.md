# Events & Registration

A common registration portal for all WIOS events. Every event is like its own
Google Form: it defines its own questions (fields) and its own look, all stored in
Firestore. People sign in with Google once and register for any event.

There are three ways to control how an event's registration page looks, from
zero effort to full code control:

1. **Theme only** (no code): pick an accent colour, layout, and banner in the admin UI.
2. **Custom component** (some code): write your own page, reuse the `useRegister` hook.
3. **Raw API** (full control): call the register endpoint yourself however you like.

More on these below.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/` | public | Landing page |
| `/events` | public | List of all events |
| `/events/[event]` | public | Event details + Register button |
| `/events/[event]/register` | signed-in | The registration form |
| `/events/[event]/register/users` | admin | Registrations table + Excel export |
| `/admin/events` | admin | Manage events (list, edit, delete, status) |
| `/admin/events/new` | admin | Create a new event |
| `/admin/events/[event]/edit` | admin | Edit an existing event |

`[event]` is the slug, auto-made from the title (e.g. "Open Source Day" becomes
`open-source-day`). Admins are set with the `ADMIN_EMAILS` env var.

## How to create an event

1. Go to `/login` and sign in with an admin Google account. You are redirected to
   `/admin/events`.
2. Click **+ New event**.
3. Fill in the basics:
   - **Title** - becomes the name and the URL slug.
   - **Description** - shown on the event page.
   - **Status** - `draft` (hidden), `open` (accepting registrations), or
     `closed` (visible but no new signups).
   - **Theme** - accent colour, layout (`centered` or `split`), and an optional
     banner image URL.
4. Add your questions with **+ Add field**. For each field you set:
   - **Label** - the question text, e.g. "Registration number".
   - **Type** - see the list below.
   - **Field id** - a short code used in exports and custom code, e.g. `reg_number`.
     It is auto-filled but you can rename it to something readable.
   - **Required** - whether the field must be filled.
   - **Options** - only for Dropdown / Single choice / Multiple choice. Enter them
     comma separated, e.g. `Web, App, AI/ML`.
5. Click **Create event**. You land on the public event page `/[event]`.
6. Set the status to **open** when you want to accept registrations.
7. Share `/[event]`. People register at `/[event]/register`.
8. See and export signups at `/[event]/register/users`.

To change anything later, go to `/admin/events`, use the status dropdown for quick
open/close, **Edit** to change fields or theme, or **Delete** to remove the event
and all its registrations.

### Field types

| Type | Use for |
| --- | --- |
| Short text | names, roll numbers, one-line answers |
| Paragraph | long answers |
| Email | email addresses |
| Number | ages, counts |
| Dropdown | pick one from a menu |
| Single choice | pick one (radio buttons) |
| Multiple choice | pick many (checkboxes) |
| Date | a date |
| Time | a time |
| Phone | phone numbers |
| URL | links |

## Data model (Firestore)

```
events/{slug}
  title, description, status, theme, fields[], createdBy, createdAt, updatedAt

events/{slug}/registrations/{uid}
  uid, email, name, photoURL, answers, createdAt
```

- One registration document per user (the doc id is their uid), so a person can
  only register once per event.
- `answers` is keyed by **field id**: `{ reg_number: "22BCE1234", track: "Web" }`.
  Multiple-choice answers are arrays: `{ interests: ["Web", "AI/ML"] }`.

## Customising the registration UI

### 1. Theme only (no code)

The default form (`DynamicForm`) reads the event's `theme` and renders every field
automatically. Just set the accent, layout, and banner in the admin UI. This is
enough for most events.

### 2. Custom component (your own page, shared plumbing)

When you want a fully hand-built page (custom sections, images, steps, animations),
write a React component for that one event. The sign-in and submit logic is handled
for you by the `useRegister` hook, so you only write markup.

**Step 1.** Copy the starter and rename it to the event's slug:

```
src/components/events/_example.tsx  ->  src/components/events/hackathon.tsx
```

**Step 2.** Build whatever UI you want. The hook gives you everything:

```tsx
"use client";
import type { EventDoc } from "@/lib/event-types";
import { useRegister } from "@/lib/useRegister";

export default function HackathonForm({ event }: { event: EventDoc }) {
  const { user, ready, submitting, error, signIn, submit } = useRegister(event.slug);

  if (!ready) return <p>Loading...</p>;
  if (!user) return <button onClick={signIn}>Sign in to register</button>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        // keys here must match the event's field ids
        submit({
          reg_number: String(data.get("reg_number")),
          track: String(data.get("track")),
        });
      }}
    >
      {/* your own markup, styled however you like */}
      <input name="reg_number" placeholder="Registration number" />
      <select name="track">
        <option>Web</option>
        <option>AI/ML</option>
      </select>
      {error && <p>{error}</p>}
      <button disabled={submitting}>{submitting ? "Joining..." : "Join"}</button>
    </form>
  );
}
```

What the hook returns:

| Value | Meaning |
| --- | --- |
| `user` | the signed-in Firebase user, or `null` |
| `ready` | `false` until we know the sign-in state (show a skeleton) |
| `signIn()` | opens the Google sign-in popup |
| `submit(answers)` | posts the answers, then redirects to success or already-registered |
| `submitting` | `true` while the submit is in flight |
| `error` | an error message string, or `null` |

**Step 3.** Register the component against the slug:

```ts
// src/components/events/registry.ts
import HackathonForm from "./hackathon";

export const EVENT_OVERRIDES = {
  hackathon: HackathonForm,
};
```

Now `/events/hackathon/register` renders your component. Every other event keeps using the
default form. The event page, admin table, and export are unchanged.

### 3. Raw API (full control)

Skip the hook and call the endpoint yourself. Get a Firebase ID token on the client
(`currentIdToken()` from `src/lib/firebase-client.ts`) and post:

```ts
await fetch(`/api/events/${slug}/register`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ answers: { reg_number: "22BCE1234" } }),
});
// 201 = registered, 409 = already registered, 403 = not open
```

## One rule to remember: answer ids must match fields

No matter which option you use, the server checks submitted answers against the
event's declared **fields** (by field id) and ignores anything it does not recognise.
Those same field ids are the column headers in the Excel export.

So the flow is always:

1. Add the fields in the admin UI and give them readable ids (`reg_number`, `track`).
2. In your UI (default or custom), submit answers using those exact ids.

This keeps the schema and the export in one place while letting the look be anything.

## API reference

| Method + path | Who | What |
| --- | --- | --- |
| `GET /api/events` | public | List open/closed events |
| `POST /api/events` | admin | Create an event |
| `GET /api/events/[slug]` | public | Get one event |
| `PATCH /api/events/[slug]` | admin | Update an event |
| `DELETE /api/events/[slug]` | admin | Delete an event + its registrations |
| `POST /api/events/[slug]/register` | signed-in | Submit a registration |
| `GET /api/events/[slug]/registration` | signed-in | Get your own registration |
| `GET /api/events/[slug]/registrations` | admin | List all registrations |
| `GET /api/events/[slug]/registrations/[id]` | admin | Get one registration |
| `DELETE /api/events/[slug]/registrations/[id]` | admin | Delete one registration |
| `GET /api/events/[slug]/registrations/export` | admin | Download registrations as .xlsx |
| `GET /api/admin/events` | admin | List all events including drafts |
