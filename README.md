# FieldTracker2x

A lightweight **Next.js** field-operations portal for OmegaERP. Site engineers
submit **daily work progress** from the field (phone/tablet). Each submission is
proxied server-side to the OmegaERP backend and lands in the project's
**Work Structure → Daily Progress** tab.

> Early scaffold — intentionally minimal. It will be structured out (auth,
> project/site pickers pulled from the ERP, photo upload, offline queue) as the
> field workflow firms up.

## How it connects

```
Field phone ──(form)──► Next.js /api/submit (server, holds token)
                               │  POST  X-Field-Token
                               ▼
                 OmegaERP  /api/solar/field/ingest/
                               ▼
         SiteProgressEntry → project's Daily Progress tab
```

The field-ingest token lives **only on the server** (`FIELD_INGEST_TOKEN`), so
it never ships to the browser. It must match OmegaERP's `FIELD_INGEST_TOKEN`
setting.

## Setup

```bash
cp .env.example .env.local      # set ERP_API_BASE and FIELD_INGEST_TOKEN
npm install
npm run dev                     # http://localhost:3000
```

On the OmegaERP side, set the same token (e.g. in its `.env`):

```
FIELD_INGEST_TOKEN=replace-with-a-long-random-token
```

and make sure the target project has a Work Structure generated (so progress
can attach to it). Submit from the portal using that project's **code**
(e.g. `PRJ001`) and a site name.

## Environment

| Var | Where | Purpose |
|-----|-------|---------|
| `ERP_API_BASE` | server | OmegaERP base URL, e.g. `https://erp.example.com` |
| `FIELD_INGEST_TOKEN` | server | Shared bearer token; equals ERP's `FIELD_INGEST_TOKEN` |

## Roadmap (next structuring pass)

- Field login + per-user identity (replace free-text reporter name).
- Pull project → sites → work packages/vendors from the ERP instead of typing codes.
- Photo capture upload (the ERP `SiteProgressEntry.photo` field already exists).
- Offline capture + sync queue for low-connectivity sites.
