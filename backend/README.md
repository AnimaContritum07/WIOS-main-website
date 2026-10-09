# Events App

Next.js (App Router) + Firebase (Firestore + Auth) + UploadThing, deployed on Vercel. No separate server.

- **Part 1:** backend-driven events, departments, team members, photos (UploadThing)
- **Part 2:** common registration portal: dynamic forms, college Google login, admin list, CSV/Excel export

## Run locally
```
npm install
cp .env.example .env.local     # fill in values (see below)
npm run dev                    # http://localhost:3000/api/health
npm run typecheck
```

## One-time setup
1. **Firebase project:** create it, enable **Firestore** (production mode; `firestore.rules` denies all client access).
2. **Firebase Auth:** Authentication > Sign-in method > enable **Google**. Under Settings > Authorized domains add your Vercel domain.
3. **Service account:** Project settings > Service accounts > Generate new private key. Put the three values in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
4. **Web app keys:** Project settings > Your apps > add a web app. Fill the `NEXT_PUBLIC_FIREBASE_*` values.
5. **UploadThing:** create an app, copy the token into `UPLOADTHING_TOKEN`.
6. **First admin:** in the Firestore console create a document `admins/<your college email in lowercase>` with the field `eventSlugs` = `"all"` (string), or an array of event slugs for limited access.
7. **Vercel:** import the repo and add the same env vars in Project Settings.

`ADMIN_API_KEY` is a dev-only shortcut (header `x-admin-key`) for curl/Postman. Leave it empty in production.

## Folder guide
```
src/app/            pages + API routes (thin: parse request, call a service, return JSON)
src/modules/        one folder per feature: *.schema.ts (types + validation), *.service.ts (logic)
src/components/     DynamicForm, FieldRenderer, GoogleSignInButton, tables, uploaders
src/themes/         per-event look (add one entry per event slug)
src/config/         env checks, college domain + registration number pattern
src/db/ src/lib/    Firestore/Auth connection, error handling, helpers
```
Search the code for `TODO(` to find unfinished work. Unfinished endpoints return 501.

## Firestore layout
```
events/{eventId}                         slug, name, description, theme?, registration{ enabled, opensAt, closesAt, allowDuplicates, fields[] }
  years/{yearId}                         year, bannerUrl, bannerKey
    departments/{deptId}                 slug, name
      members/{memberId}                 name, slug, role, imageUrl, imageKey
    photos/{photoId}                     fileKey, url, type, departmentSlug, memberSlug, caption, uploadedAt
  registrations/{regNo}                  regNo, name, email, status, referenceNo, answers{}, createdAt, updatedAt
admins/{email}                           eventSlugs: "all" | ["slug", ...]
auditLogs/{id}                           actorEmail, action, eventSlug, details, timestamp
```
The registration number is the document id, so one student cannot register twice (unless `allowDuplicates` is on).

## Registration form fields
Each entry in `registration.fields`: `id`, `label`, `type`, `required`, `options[]`, `validation`, `order`.
Types: `shortText`, `longText`, `dropdown`, `radio`, `checkboxes`, `number`, `date`, `consent`.

## API
| Method | Route | Who |
|---|---|---|
| GET | /api/health | public |
| GET | /api/me | signed-in college user |
| GET / POST | /api/events | public list / admin create |
| GET | /api/events/:slug | public detail |
| POST | /api/events/:slug/years | admin |
| POST | /api/departments, /api/members | admin |
| DELETE | /api/admin/photos/:id | admin |
| * | /api/uploadthing | admin (uploads) |
| GET / PUT | /api/events/:slug/registration | public config / admin save |
| GET / POST | /api/events/:slug/register | student: am I registered / submit |
| GET | /api/events/:slug/registrations | admin list (q, status, sortBy, order, answer.<fieldId>) |
| PATCH | /api/events/:slug/registrations/:id | admin status change |
| POST | /api/events/:slug/registrations/export | admin CSV/Excel |

Auth: the frontend signs in with Google (Firebase), then sends `Authorization: Bearer <idToken>`.
The backend verifies the token, requires a verified email on the college domain, reads the registration number from the email, and (for admin routes) checks `admins/<email>` and event access.

## Things to check early
- **Registration number pattern** is one regex in `src/config/college.ts`. Test it with real student emails.
- **Per-event theme:** add the event slug to `src/themes/index.ts`.
- Registrations are filtered/sorted in memory (Firestore has no text search). Fine for college-sized events.

## Branches
`main` <- `dev` <- `feature/<module>-<thing>`
