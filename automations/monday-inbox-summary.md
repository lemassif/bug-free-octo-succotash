# Monday Inbox Summary — Scheduled Workflow

A recurring automation that triages **Richard's Outlook inbox** every Monday morning
and produces a **one-page focus summary**, categorized into Must-Reply / Opportunity
Alerts / Newsletters / Junk.

- **Runs:** every **Monday at 08:20** (timezone **America/New_York** — Eastern)
- **Source:** Microsoft 365 / Outlook **Inbox**, unread mail from the last **24 hours**
- **Output:** one-page summary in the session **and** a **Gmail draft** addressed to
  `richard.sebastian@thekennedycollective.org` (ready by ~08:30; review and forward)

---

## How it is scheduled

This is a **Claude Code on the web scheduled session** (not a GitHub Actions cron — a
GitHub runner has no access to the personal Outlook/Gmail MCP connections). Create it in
the Claude Code web UI:

1. Open this repository's environment in Claude Code on the web.
2. **New scheduled session / automation** → set the schedule to **Weekly · Monday ·
   08:20 · America/New_York** (cron equivalent: `20 8 * * 1`).
3. Paste **the prompt below** as the session instructions.
4. Ensure the environment has the **Microsoft 365** (read) and **Gmail** (draft)
   integrations connected.

> See https://code.claude.com/docs/en/claude-code-on-the-web for scheduling, triggers,
> and environment setup.

---

## The scheduled prompt

> You are my Monday inbox-triage assistant. Today is Monday. Do the following and keep it tight:
>
> 1. Compute the cutoff = now − 24 hours.
> 2. Search my Outlook **Inbox** with `mcp__Microsoft_365__outlook_email_search`
>    (`folderName: "Inbox"`, `afterDateTime:` the cutoff, `order: "newest"`, `limit: 25`).
>    Paginate via the returned `nextOffset` until the whole 24h window is covered.
> 3. Keep only **unread** messages — `isRead == false` from the search metadata. Do **not**
>    open bodies with `read_resource` unless a subject/sender is genuinely ambiguous
>    (reading a message can mark it read).
> 4. Sort each unread message into **exactly one** bucket:
>    - 🔴 **Must Reply / Action Needed** — a real person (especially internal
>      `@thekennedycollective.org` colleagues or known external contacts) asking a question,
>      requesting something, or expecting a response; anything time-sensitive.
>    - 🟡 **Business / Opportunity Alerts** — automated but business-relevant: federal
>      contracting (SAM.gov, GSA RFIs, SAMradar awards/opportunities), vendor/partner notices.
>    - 🟢 **News & Newsletters** — news digests, subscriptions, FYI reading.
>    - ⚪ **Promotions / Junk** — marketing, deals, deceptive subjects, anything tagged
>      Spam/Graymail with no business value.
> 5. Write a **one-page** summary: a "Bottom line" focus sentence at the top, then the four
>    sections. Each item: **Sender** — *Subject* (one short reason it matters). Surface
>    anything urgent. If a bucket is empty, say so in one line.
> 6. Create a **Gmail draft** of the summary to `richard.sebastian@thekennedycollective.org`
>    with `mcp__Gmail__create_draft` (subject `📋 Monday Focus — Inbox Summary (<date>)`,
>    formatted `htmlBody`). **Do not send it.**
> 7. Post the same summary as your session reply.
>
> Privacy: never write email contents to a file or commit them to the repo — the summary
> lives only in the Gmail draft and the session output.

---

## Categorization taxonomy

| Bucket | What lands here | Action |
|---|---|---|
| 🔴 Must Reply / Action Needed | People asking for a response; time-sensitive items | Reply / act today |
| 🟡 Business / Opportunity Alerts | SAM.gov, GSA RFIs, SAMradar, vendor/partner notices | Scan for fit |
| 🟢 News & Newsletters | Digests, subscriptions, FYI | Read when time allows |
| ⚪ Promotions / Junk | Marketing, deals, deceptive/Graymail/Spam | Clear |

## Notes & constraints

- **Outlook is read-only here.** The Microsoft 365 MCP can search/read mail but has **no
  send or draft tool**, so the summary is delivered as a **Gmail draft** (Gmail's
  `create_draft`) rather than an Outlook email. If a send-capable Outlook/Graph MCP is
  later connected, switch step 6 to send via that instead.
- The search has no native "unread" filter — unread is determined from the `isRead` field
  in the result metadata, so no message is opened (and thus none is accidentally marked
  read) during triage.
- `America/New_York` observes DST; scheduling by timezone (not a fixed UTC cron) keeps the
  run at 08:20 local year-round.
