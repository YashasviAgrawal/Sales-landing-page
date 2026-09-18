# Sales Brain — project handover

Everything you need to own, run and hand on this website.

Written for the Sales Brain team — the person who will answer the leads and
write the blog posts — with a final section for whichever developer you work
with next. You do not need to be technical to read sections 1 to 8.

| | |
|---|---|
| **Project** | Sales Brain — Revenue Leak Audit landing page, blog and admin panel |
| **Live domain** | `salesbrain.in` |
| **Source code** | Sales-landing-page-main.zip|
| **Handover date** |18th september 2026|
| **Handed over by** |Yashasvi Agrawal|

---

## 1. What you are receiving

Three things that work together as one website.

### The marketing site — `salesbrain.in`

A single page that makes one argument and asks for one thing: book the free
45-minute Revenue Leak Audit. It runs from the hero claim ("you don't have a
sales problem, you have a process problem") through the seven links of the
revenue chain, a free self-diagnosis the visitor can run on themselves, what
happens on the call, who it is *not* for, the objections, and the booking
form.

Plus a Terms of Service page, a Privacy Policy page, and a branded 404.

### The blog — `salesbrain.in/blog`

A full publishing system. You write articles in a browser, press Publish, and
they are live within seconds — correctly formatted, with the social-sharing
card, the search-engine tags, the sitemap entry and the RSS feed all updated
automatically. **Three articles are already written and live.**

### The admin panel — `salesbrain.in/admin`

Password-protected. Two screens:

- **Leads** — every booking-form enquiry, newest first, with a search box, a
  status filter, notes you can type against each one, and a "Download CSV"
  button for your spreadsheet.
- **Blog** — write, edit, schedule, publish, unpublish and duplicate articles,
  with a live SEO checklist that tells you what will hurt the article's ranking
  before you publish it.

### What is *not* included

- Email sending. Nothing on this site sends email on your behalf. You reply to
  enquiries from your own inbox.
- A CRM. The Leads screen is a lightweight record of enquiries, not Salesforce.
- Analytics. There is no Google Analytics, no Facebook pixel and no tracker of
  any kind — and the Privacy Policy says so. **If you add one, the Privacy
  Policy has to change on the same day.**
- A calendar booking system. The form is a form; you reply and agree a time.
  (An external scheduler can be plugged in — see §9.)

---

## 2. Accounts you must take ownership of

**Do this first.** Until these are in your name, you do not own your website.
Tick each one off and record who holds it.

| # | Thing | What to do | Owner after handover |
|---|---|---|---|
| 1 | **Domain** `salesbrain.in` | Transfer the registrar account, or add yourself as owner | _____________ |
| 2 | **Supabase project** (your database) | Add your email as an Owner at supabase.com → Organisation → Members, then remove the developer's access | _____________ |
| 3 | **Hosting account** (Vercel or equivalent) | Transfer the project to your own team, or invite yourself as Owner | _____________ |
| 4 | **GitHub repository** | Transfer ownership, or fork it to your own account | _____________ |
| 5 | **Admin login** for `/admin` | Currently `contact@salesbrain.in`. Change the password, and add or remove people via the `ADMIN_EMAILS` setting | _____________ |
| 6 | **Google Search Console** | Create a property for `salesbrain.in` and verify it. See §7 | _____________ |
| 7 | **Email list provider** (Mailchimp, ConvertKit, etc.) | **Not yet chosen.** Needed for the footer sign-up — see §4 | _____________ |

### The four secret keys

Your site is configured with seven settings, three of which are secrets. They
are stored in the hosting account's environment settings, **not** in the source
code, and they are not in the GitHub repository.

| Setting | Secret? | If it leaks |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Nothing — it is in the page source by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Nothing — it can read nothing private |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | **Full read/write/delete on your entire database.** Rotate it in the Supabase dashboard immediately |
| `SUPABASE_DB_URL` | **Yes** | Direct database access. Only needed on a developer's laptop, never on the live site |
| `ADMIN_EMAILS` | No | Nothing on its own |
| `NEXT_PUBLIC_SITE_URL` | No | — |
| `LEAD_IP_SALT` | **Yes** | Low impact, but rotate it |

**Never paste the service role key into an email, a chat, a support ticket or a
screenshot.** If you ever suspect it has been seen, rotate it in Supabase →
Project Settings → API Keys, then update it in the hosting settings. The site
picks up the new key on the next deploy.

---

## 3. Running the site day to day

### Answering an enquiry

1. Go to `salesbrain.in/admin` and sign in.
2. New enquiries are at the top, marked **New** in green — that is the only
   status that means work today.
3. Click a row to expand it. You will see what they wrote about their revenue
   problem, their website, and when it arrived.
4. Reply from your own email. Then set the status: **Contacted** → **Qualified**
   → **Won** or **Lost**. Junk goes to **Spam**.
5. Type notes into the row as you go. They save automatically.

The four tiles at the top of the screen are: total enquiries, how many are
still New, how many arrived in the last 7 days, and how many you have Won.

**Download CSV** exports exactly the rows currently on screen — if you have
filtered to "Won", you get the Won ones. It opens cleanly in Excel.

### Writing a blog post

1. Go to `salesbrain.in/admin/posts` and click **New post**.
2. Write the title. The URL fills itself in — leave it alone unless you have a
   reason.
3. Write the article in Markdown. You only need three things:
   - `## A section heading`
   - `**bold**` and `*italic*`
   - `[link text](https://example.com)`
4. Fill in the **excerpt** — one or two sentences. It is the summary on the
   blog index *and* the description Google shows under your link in search
   results. If you leave it blank, Google will invent one, and it will pick
   worse sentences than you would.
5. Watch the **SEO checklist** down the side. It is advice, not a gate — you
   can publish with warnings. Green on all seven is the goal, not the rule.
6. Save as **Draft** until you are happy, then switch to **Published**.

It is live within a few seconds. The blog index, the sitemap and the RSS feed
all update themselves.

### Two rules that cost real money if broken

> **Never change the URL of a post that is already published.** Every link
> anyone has shared, and every bit of ranking that address has earned, is
> attached to that URL. Change it and both are gone. The editor shows a red
> warning; believe it. If you must, publish it as a new post and leave the old
> one in place.

> **Never backdate or forward-date a published article.** The system already
> protects you — editing a live post keeps its original date — so this only
> comes up if you change it by hand. A two-year-old article that claims to be
> new is one Google learns not to trust.

### Scheduling

Set the status to **Published** and put a future date in the publish field. The
article stays invisible — to readers *and* to Google — until that moment
arrives, with nothing needing to run in between.

### Taking a post down

Set it to **Archived**. It disappears from the blog, the sitemap and the feed,
and Google is told to stop indexing it. Nothing is deleted, so you can bring it
back. **Delete** is permanent.

---

## 4. Before you go live — the honest list

The site is built, tested and deploys cleanly. These are the things that are
still *your* decisions or *your* facts, and a few of them matter a lot.

### 🔴 Must be fixed — these break a promise to the visitor

**1. The footer email sign-up does not work.**
The box at the bottom of the page offers "the 7-point checklist we use in every
audit", takes an address, says "check your inbox" — and does nothing. The
address is discarded. No email is ever sent.

On a site whose entire argument is that you tell people the truth even when it
costs you the deal, this is the worst thing that could be left in it. You have
two choices, and both are fine:

- **Wire it up.** Choose a list provider (Mailchimp, ConvertKit, Beehiiv,
  Buttondown), write the 7-point checklist as a PDF or an email, and have a
  developer connect the form. It is under an hour of work.
- **Remove the box.** If the checklist does not exist yet, deleting the form is
  more honest than a form that lies, and costs you nothing you currently have.

*Do not launch with it as it is.*

**2. Every testimonial on the page is invented.**
The six reviews in the "What they said after the audit" section — Rahul Mehta,
Sneha Iyer, Arvind Nair, Farhan Qureshi, Priya Deshmukh, Karthik Reddy — are
**not real clients**. They were written as examples of the shape a real review
should take: a specific number, a specific admission, mixed four- and five-star
ratings rather than a suspicious wall of fives.

Replace them with real, recorded, permissioned quotes from real clients — or
turn the section off with a single setting, and the page shows this instead:

> **We're new. That's why the audit is free.**
> There is no wall of percentages here because we haven't earned one yet. What
> we will do is run the diagnosis on your business at our cost, show you the
> working, and let you decide whether the thinking is worth paying for.

That block is already written and ready. Being new is not a weakness you have
to hide — it is the reason the audit is free. **One invented number discredits
every true claim on the page.**

### 🟠 Facts only you can supply

| # | What | Where it shows | Currently |
|---|---|---|---|
| 3 | **Founder's real name** | Blog bylines, search-engine business listing, page metadata | "Aarav Menon" — a placeholder |
| 4 | **"Limited to six audits a month"** | Under the booking form | A number nobody has committed to. Set the real cap, or delete the line. A limit you do not enforce is the one claim on this page a buyer can catch you on |
| 5 | **Legal page dates** | Top of Terms and Privacy | "Last updated 12 September 2026" — set the real date you approve them |
| 6 | **Governing law** | Terms of Service | "the courts of Jaipur, Rajasthan" — confirm with whoever signs your contracts |
| 7 | **Have a lawyer read the legal pages** | `/terms`, `/privacy` | They are carefully written and describe what the site actually does — including that the form now stores data in a database — but they were not written by a lawyer |

### 🟢 Worth doing in the first week

| # | What | Why |
|---|---|---|
| 8 | Verify the site in **Google Search Console** and submit `salesbrain.in/sitemap.xml` | The one launch step with no automation. See §7 |
| 9 | Add your **LinkedIn / company profile links** | Google uses them to confirm your business is the same entity across the web. They were deliberately left blank rather than guessed |
| 10 | Send yourself a **test enquiry** | Confirms the form → database → admin panel path end to end on the live site |
| 11 | Decide whether to keep the **on-page form** or plug in a scheduler | See §9 |

---

## 5. What it costs to run

| Service | Plan | Typical cost |
|---|---|---|
| Domain `salesbrain.in` | Annual renewal | ~₹800–1,500 / year |
| Hosting (Vercel Hobby) | Free tier | ₹0 — ample for a marketing site |
| Hosting (Vercel Pro) | If you need a team or commercial terms | ~$20 / user / month |
| Supabase | Free tier | ₹0 up to 500MB database + 50,000 monthly active users |
| Email list provider | Not yet chosen | Free to ~$20/month at small list sizes |

**Realistically: the domain renewal, and nothing else, for a long time.** This
site stores text. You would need tens of thousands of enquiries to leave
Supabase's free tier.

> ⚠ **One thing to know about the Supabase free tier:** a project with no
> activity for **7 days** is paused automatically. A live site with visitors
> never goes quiet enough for this, but if you sit on the finished site for a
> fortnight before launching, check the Supabase dashboard and press Restore.
> No data is lost.

_Costs are indicative as at the handover date and are set by those providers,
not by this project. Confirm current pricing before budgeting._

---

## 6. If something goes wrong

| Symptom | What it means | What to do |
|---|---|---|
| Form says *"That didn't save — we've opened your email client"* | The database is unreachable. **The enquiry is not lost** — the visitor's email app opens with everything they typed already in it | Check the Supabase dashboard. If the project is paused, restore it |
| `/admin` says the credentials don't match, and they do | Either the email is not on the admin allowlist, or the account was never confirmed | Have your developer run `npm run admin:create` with that address. It fixes both and tells you which it was |
| A published post is not on `/blog` | Its publish date is in the future, or the page cache is stale | Check the date. Otherwise it clears within the hour, or immediately on the next save |
| A post is on `/blog` but not in Google | Normal. New articles take days to weeks to be indexed | Check it is not flagged "Hide from search engines". Beyond that, wait |
| The site looks completely unstyled | A failed deployment | Roll back to the previous deployment in the hosting dashboard. It is one click |
| Enquiries stop arriving entirely | Could be the database, could be genuinely quiet | Submit a test enquiry yourself. That tells you which |

**The site is built to fail softly.** If the database keys are wrong or missing
entirely, the marketing page still renders perfectly, the booking form falls
back to opening the visitor's email app, and `/admin` explains what is
unconfigured. A half-wired database never takes the marketing site down.

---

## 7. Getting found on Google

The technical side is done — comprehensively. Every page declares its canonical
address, every article carries structured data so it can appear as a rich
result with a date and a thumbnail, the sitemap reports real modification
dates, the RSS feed works, and the heading structure, image handling and page
speed are all in order. There is a live SEO checklist beside the editor so
every new article gets the same treatment.

**Two things are left, and they are both yours:**

1. **Verify the site in Google Search Console** (`search.google.com/search-console`),
   add `salesbrain.in` as a property, and submit `salesbrain.in/sitemap.xml`.
   Ten minutes, once. It is the only step in this whole project that has no
   script behind it.

2. **Publish consistently.** The three existing articles are a foundation, not
   a campaign. One genuinely useful post a month, each one linking to the audit
   page and to your other posts, will do more than any technical change
   available from here.

---

## 8. Maintenance

**Monthly** — check the Leads screen for anything you missed. Publish a post.

**Quarterly** — have a developer run dependency updates (`npm outdated`,
then update and redeploy). Skip a quarter and nothing breaks; skip two years
and the eventual update becomes a project.

**When you change anything about data** — if you add analytics, an email list,
a chat widget or a booking tool, **the Privacy Policy must change on the same
day.** It currently states, truthfully, that there are no analytics, no
advertising pixels and no third-party trackers, and that the symptom checker
runs entirely in the visitor's browser and sends nothing anywhere. Do not let
that become false.

**Annually** — renew the domain. Re-read the legal pages and update the date.

---

## 9. Optional changes you may want

| You want | What is involved |
|---|---|
| **An external scheduler** (Cal.com, Calendly) instead of the form | One line of configuration. Every button on the site — all four — switches at once |
| **The testimonials section off** | One setting. The honest "we're new" block replaces it |
| **A different accent colour** | One value in one file. It is used consistently everywhere |
| **More people in the admin panel** | Add their email to the allowlist setting and create their account. Two commands |
| **Analytics** | Straightforward — but update the Privacy Policy the same day |
| **A contact phone number** | Text change, plus a small addition to the structured data |

---

## 10. For your next developer

Full technical documentation is in **[DOCUMENTATION.md](DOCUMENTATION.md)** —
architecture, the design system, the database schema, the security model,
every environment variable, and a section called *Things not to break* listing
the decisions that look arbitrary and are not. Database and CMS operations are
in **[SUPABASE.md](SUPABASE.md)**.

### Orientation in one minute

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 ·
Motion · Supabase (Postgres + Auth) · deployed to Vercel.

```bash
npm install
npm run setup     # creates .env, checks keys, runs migrations, offers an admin user
npm run dev       # localhost:3000
```

`npm run setup` is idempotent and stops at the first thing it cannot do for
you, naming exactly what to paste where.

### The five things to know before touching anything

1. **[lib/content.ts](lib/content.ts) holds every visible string** on the
   marketing site. Copy changes happen there, not in components. Search it for
   `PLACEHOLDER`.

2. **`requireAdmin()` is the first line of every Server Action, without
   exception.** A `"use server"` export is a public HTTP endpoint with a
   generated name; the middleware matcher does not protect it. A missing
   `requireAdmin()` is a hole straight into the leads table.

3. **The `leads` table has Row Level Security on with no policies, and the
   grants revoked.** That is deliberate. If the contact form ever breaks, the
   bug is in `/api/leads` — **do not fix it by adding a public insert policy.**
   The browser-facing key is printed in the page source.

4. **Never edit an applied migration.** Add a new numbered file in
   `supabase/migrations/`. And keep `lib/supabase/database.types.ts` in step
   with the SQL — they are one contract written twice.

5. **Never change a published post's slug, and never move its `published_at`.**
   The code protects the second one already.

### One thing worth knowing

**The codebase is heavily commented, and the comments explain *why*.** They are
not noise — most of them record a problem that was hit and solved, and several
describe a fix that looks wrong until you know what it prevents. Read the
comment before changing the line under it.

There is some dead code left over from removed features — a `flow` field on
the `Link` type, a `.hatch` CSS utility, two unused components. All four are
named in DOCUMENTATION.md §20.4 so nobody has to work out whether they matter.

---

## 11. Sign-off checklist

Work through this with the developer before you consider the handover done.

**Access**
- [ ] Domain registrar account in your name
- [ ] Supabase project — you are an Owner
- [ ] Hosting account — you are an Owner
- [ ] GitHub repository transferred or forked
- [ ] Developer's access removed where it should be
- [ ] Every environment variable recorded in your password manager
- [ ] Admin password changed, and you can sign in to `/admin`

**Before launch**
- [ ] Footer email sign-up wired up **or removed** (§4.1)
- [ ] Testimonials replaced with real ones **or** the section switched off (§4.2)
- [ ] Real founder name set
- [ ] "Six audits a month" confirmed or the line deleted
- [ ] Legal page dates set, governing law confirmed
- [ ] Legal pages reviewed by a lawyer
- [ ] Test enquiry submitted on the live site and received in `/admin`
- [ ] Social profile links added

**First week**
- [ ] Google Search Console verified, sitemap submitted
- [ ] Every page opened on a phone and on a laptop
- [ ] Someone outside the team asked to book the audit, and it worked

---

**Questions during the handover period go to:** _______________

_This document describes the project as delivered on the handover date above.
It is yours to edit — keep it with the code and update it when things change._
