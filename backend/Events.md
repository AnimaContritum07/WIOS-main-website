# Events & Registration

A common registration portal for all WIOS events. Every event is like its own
Google Form: it defines its own questions (fields) and its own look, all stored in
Firestore. People sign in with Google once and register for any event.

There are three ways to control how an event's registration page looks, from
zero effort to full code control:

1. **Theme only** (no code): pick an accent colour, layout, and poster link in the admin UI.
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
     poster link (image URL shown on the event and register pages).
4. Add your questions with **+ Add field**, or reuse one from an earlier event with
   **Reuse earlier field** (see "Reusable fields and autofill" below). For each field:
   - **Label** - the question text, e.g. "Registration number".
   - **Type** - see the list below.
   - **Field id** (local id) - a short code used in exports and custom code, e.g.
     `reg_number`. Auto-filled, but you can rename it to something readable. Unique
     within this event.
   - **global id** - shown muted under the field id. Auto-generated and shared when you
     reuse a field across events. This is the key that powers autofill. You never type it.
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

## Reusable fields and autofill

The club asks the same questions across events (Name, Registration number, Department).
Two ids make this reuse-friendly:

- **local id** - the answer key inside one event (what you set as "Field id").
- **global id** - a hidden, auto-generated id that is shared only when you reuse a field.

### Reusing a field

In the builder, click **Reuse earlier field**. You get a list of every field used in
past events, with its label, type, and how many events use it. Picking one adds a field
that carries the same **global id**. You can still rename its local id for this event.

### Autofill

When someone registers, their answers are saved per global id on their user profile.
The next time they open any event whose form reuses one of those fields (same global id),
that field is **pre-filled** with their last answer. They can edit it before submitting.

Autofill only happens through reuse. A field you type from scratch, even if you label it
"Name", gets a fresh global id and will not autofill. Reuse from the library is what
links them.

### Managing field keys

On `/admin/events`, scroll to the **Field keys** panel. It lists every reusable field
(its label, type, usage count, and global id). Renaming a key's label changes the default
label shown when you reuse it later. It does not rewrite labels in events that already
use the field.

## Data model (Firestore)

```
events/{slug}
  title, description, status, theme, fields[], createdBy, createdAt, updatedAt

events/{slug}/registrations/{uid}
  uid, email, name, photoURL, answers, createdAt

users/{uid}
  ...profile, savedFields: { [globalId]: value }   // remembered for autofill

fieldKeys/{globalId}
  globalId, label, type, suggestedId, options, updatedAt   // the reusable-field catalog
```

- Each field in `fields[]` has both `id` (local) and `globalId`.
- One registration document per user (the doc id is their uid), so a person can
  only register once per event.
- `answers` is keyed by **local field id**: `{ reg_number: "22BCE1234", track: "Web" }`.
  Multiple-choice answers are arrays: `{ interests: ["Web", "AI/ML"] }`.
- `savedFields` is keyed by **global id**, so the same answer can prefill across events.

## Customising the registration UI

You can override any of four pages per event with your own React component: the event
**details** page, the **register** page, the **success** page, and the
**already-registered** page. Each override receives `{ event }`. Pages you do not
override keep the default themed version.

### 1. Theme only (no code)

The default form (`DynamicForm`) reads the event's `theme` and renders every field
automatically. Just set the accent, layout, and poster link in the admin UI. This is
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
| `prefill` | remembered answers keyed by local field id; seed your inputs from this for autofill |

**Step 3.** Register the component against the slug and the page (surface) you want to
override:

```ts
// src/components/events/registry.ts
import HackathonForm from "./hackathon";
import HackathonLanding from "./hackathon-landing";

export const EVENT_OVERRIDES = {
  hackathon: {
    register: HackathonForm,
    details: HackathonLanding,
    // success: HackathonDone,
    // alreadyRegistered: HackathonAlready,
  },
};
```

Surfaces you can override: `details` (`/events/[slug]`), `register`
(`/events/[slug]/register`), `success`, and `alreadyRegistered`. Any surface you leave
out uses the default themed page. The admin table and export are unaffected.

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
| `GET /api/events/[slug]/prefill` | signed-in | Your remembered answers for this event's fields |
| `GET /api/admin/events` | admin | List all events including drafts |
| `GET /api/admin/fields` | admin | List reusable fields (the key catalog) |
| `PATCH /api/admin/fields/[globalId]` | admin | Rename a field key's label |
| `GET /api/admin/admins` | admin | List admin emails (env + added) |
| `POST /api/admin/admins` | admin | Add an admin email |
| `DELETE /api/admin/admins/[email]` | admin | Remove an added admin email |
