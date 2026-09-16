#!/usr/bin/env node
/*
  Seed three starter articles.   npm run blog:seed

  They are inserted as DRAFTS, never published. Nothing should put words on a
  live site under someone's byline without them reading it first - these are a
  starting point and a worked example of the structure the editor's checklist
  is asking for, not finished copy.

  On what is in them: every claim is reasoning from the positioning in
  lib/content.ts. There are no invented client results, no made-up percentages
  and no fabricated case studies, because a single checkable false number
  discredits every true sentence next to it - and on a site whose entire offer
  is "we will tell you the truth about your business", that is the most
  expensive thing it is possible to get wrong. Where a real figure would
  strengthen a piece, the text says what to measure instead.

  Re-runs skip any slug that already exists, so this cannot overwrite edits.
*/

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

import { loadEnv, style } from "./lib/env.mjs";

const { bold, dim, green, red, yellow } = style;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(root);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    `\n${red("Supabase is not configured.")} Fill in .env - see SUPABASE.md.\n`,
  );
  process.exit(1);
}

/* Same 238 wpm rule as lib/posts.ts. Duplicated rather than imported because
   this is plain Node and that file is TypeScript. */
function readingMinutes(markdown) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 238));
}

const posts = [
  {
    slug: "seven-places-b2b-revenue-leaks",
    title: "The seven places B2B revenue leaks",
    excerpt:
      "Revenue rarely breaks everywhere at once. It breaks at one of seven links in the chain — and the fix for each one is different.",
    seo_title: "The 7 places B2B revenue leaks (and how to find yours)",
    seo_description:
      "Revenue problems feel general and are almost always specific. Here are the seven links revenue runs through, what each looks like when it breaks, and how to tell them apart.",
    tags: ["diagnostics", "sales process"],
    content: `Ask a founder what is wrong with their sales and you will usually get a general answer. Sales is slow. Marketing is not working. The team needs to be hungrier.

General answers lead to general spending. You hire an agency, buy a tool, run a campaign, and six months later the number has not moved — because the thing you bought was a cure for a disease nobody diagnosed.

Revenue is a chain. Money moves through seven links to get from a stranger's attention to your bank account, and a chain does not get generally weaker. It breaks at its weakest link, and it breaks at one.

## The seven links

**Offer.** What you actually sell, and what it is worth to the buyer. A broken offer is one people understand and do not want, or want and cannot justify.

**Message.** How the offer is described. A broken message describes something people do want, in words that do not make them believe you can deliver it.

**Leads.** The volume and fit of people arriving. This link breaks in two directions — too few, or enough but wrong.

**Funnel.** What happens between arriving and speaking to you. Broken funnels leak between steps: people who wanted to book and did not.

**Conversion.** What happens in the conversation. This link breaks quietly, because the calls feel fine.

**Pricing.** What you charge and how you frame it. Broken pricing shows up as won deals that are not worth having.

**Ecosystem.** Everything after the sale — onboarding, delivery, referrals, renewals. The most expensive link to break, and the last one anyone looks at.

## What each one looks like from inside

The hard part is that several of these produce the same symptom. "Deals are slow" is consistent with at least four of them. What separates them is where the drop happens, not how it feels.

| Link | What you notice |
| --- | --- |
| Offer | Polite interest, no urgency. "Send me something." |
| Message | Good conversations that start with you explaining what you do |
| Leads | A pipeline full of people who were never going to buy |
| Funnel | Traffic that does not become calls |
| Conversion | Good calls, then silence |
| Pricing | You win deals and resent them |
| Ecosystem | No referrals, and churn you explain away one client at a time |

Read that table honestly and one row usually stands out more than the others. That row is where to look first.

## Why teams fix the wrong one

Three reasons, and they compound.

**The loudest link is rarely the broken one.** Leads are the most visible number in the business, so a revenue problem gets read as a lead problem. More leads through a broken funnel produces more waste, faster.

**The broken link is usually the least fun to fix.** Pricing and offer are the two links most likely to be wrong and the two nobody wants to reopen, because changing them means admitting the last year was built on the wrong thing.

**Everyone selling you something has a favourite link.** An ads agency finds a leads problem. A CRM vendor finds a funnel problem. None of them are lying — they are answering the only question they know how to answer.

## How to find yours

You do not need a consultant to start. You need one number per link, tracked for one month:

- **Offer** — of the people who fully understood what you sell, what share asked about price?
- **Message** — how many first calls do you spend explaining what you do?
- **Leads** — what share of new leads match the profile of your best three clients?
- **Funnel** — of the people who reached your booking page, how many booked?
- **Conversion** — of the calls you took, how many reached a proposal? Of proposals, how many closed?
- **Pricing** — what is your average deal against the one you would need to be comfortable?
- **Ecosystem** — how many clients have referred someone?

One of those numbers will be visibly worse than the rest. That is not a coincidence and it is not everything being a bit broken. It is the link.

## Then fix that one

The discipline is to fix the weakest link and then re-measure, rather than fixing the three easiest and hoping. A chain repaired at its weakest point gets stronger. A chain repaired everywhere except its weakest point is exactly as strong as it was.

If the honest answer is that you cannot tell which number is worst — either because you are not tracking them or because two look equally bad — that is worth 45 minutes with someone who looks at these for a living. [The audit is free and there is no pitch](/#book); you leave with the name of the link and what to do about it, whether you hire anyone or not.`,
  },
  {
    slug: "more-leads-is-usually-the-wrong-diagnosis",
    title: "“We need more leads” is usually the wrong diagnosis",
    excerpt:
      "It is the most common thing founders say about revenue, and the least often true. Here is how to check before you spend on it.",
    seo_title: "Why “we need more leads” is usually the wrong diagnosis",
    seo_description:
      "More leads is the default explanation for flat revenue and rarely the real one. A short test to find out whether your problem is volume — before you pay for more of it.",
    tags: ["lead generation", "diagnostics"],
    content: `It is the most common sentence in B2B: *we need more leads.*

Sometimes it is true. More often it is the first explanation that comes to mind for a number that is not moving, and it survives because it is the only explanation that can be solved by writing a cheque.

Before you write one, it is worth ten minutes to check.

## The test

Take your last twenty leads. Not the last twenty months of reporting — twenty actual people, in a spreadsheet, one per row. For each one, mark the furthest point they reached:

1. Arrived and left without a conversation
2. Booked a call
3. Took the call
4. Received a proposal
5. Bought

Now look at where the biggest drop is.

**If most never got past step 1**, you may well have a volume problem — or a funnel problem, because arriving and not booking is what a broken funnel looks like. The next question is what share of arrivals booked. If it is very low, buying more arrivals buys you more of the same drop.

**If they booked but did not show or did not progress**, that is not a volume problem. You already had their attention and their time, and lost it afterwards. More leads makes the loss bigger.

**If they reached a proposal and went quiet**, that is a conversion or pricing problem wearing a lead problem's clothes. This is the most expensive misdiagnosis of the set, because the leads were good, the work of generating them was already paid for, and the failure happened at the last possible moment.

**If they bought and you did not enjoy it** — small deals, hard delivery, no referral — the problem is upstream of everything, in the offer or in who you are attracting.

## Why volume is the default answer

Because leads are the only part of the chain that is easy to count.

Every business knows roughly how many enquiries it got last month. Almost none can say what share of calls reached a proposal, or what share of proposals closed, without going and working it out. So when revenue is flat, the explanation gravitates to the number that is already visible — and the invisible numbers keep their secret.

There is a second reason, less comfortable. A lead problem is nobody's fault. A conversion problem is a conversation you are having badly. A pricing problem means the thing you built is not worth what you hoped. Volume is the diagnosis that requires the least from you, so it is the one that gets reached for.

## What "more leads" actually costs when it is wrong

Buying volume into a broken chain does three things, all bad.

It **multiplies the existing waste** — the same leak, more water. It **hides the leak further**, because more raw activity makes the top-line look busier while the conversion rate quietly falls. And it **raises your cost per client** without anyone noticing, because the spend is attributed to marketing while the loss happens in sales.

That last one is why a company can double its lead spend, see revenue rise slightly, and become less profitable in the same quarter.

## When it really is volume

It happens, and it looks like this: your conversion rates through the middle of the chain are healthy, your clients are the right ones, they refer, and you simply do not have enough conversations to hit the number. If a fair share of calls become proposals, and a fair share of proposals close, and the work is good — then yes, the constraint is at the top and you should go and get more.

The point is not that volume is never the answer. It is that volume is the answer you should have to *earn* by ruling out the cheaper ones first, and almost nobody does, because ruling them out takes a spreadsheet and an hour and buying leads takes a phone call.

## Start with the twenty rows

You do not need a system for this. Twenty rows, five columns, one afternoon. Whatever you find, you will know more about your own business than the last three vendors who pitched you.

If the drop is somewhere you did not expect — and it usually is — [that is what the free audit is for](/#book). Forty-five minutes, no pitch, and you leave knowing which link to fix. See also: [the seven places B2B revenue leaks](/blog/seven-places-b2b-revenue-leaks).`,
  },
  {
    slug: "run-your-own-revenue-leak-audit",
    title: "How to run a revenue leak audit on your own business",
    excerpt:
      "The same diagnostic we run, written out so you can do it yourself in an afternoon. No tools, no spend, one spreadsheet.",
    seo_title: "How to run a revenue leak audit on your own business",
    seo_description:
      "A step-by-step diagnostic for finding which part of your sales process is actually losing you money. One afternoon, one spreadsheet, no software.",
    tags: ["diagnostics", "sales process", "how to"],
    content: `Most sales advice assumes you already know what is broken. This does the opposite — it is a procedure for finding out, and it works before you have decided anything.

It takes an afternoon. You need your CRM or your inbox, a spreadsheet, and a willingness to write down numbers you may not like.

## Before you start: pick a window

Choose the last 90 days, or the last 30 deals, whichever is bigger. Shorter than that and one unusual month distorts everything; longer and you are auditing a business that no longer exists.

Write the window at the top of the sheet. Every number below has to come from the same one, or the ratios mean nothing.

## Step 1 — Count the stages

Six columns. For your chosen window, count how many people reached each:

1. **Arrived** — visited your site, or entered a conversation
2. **Enquired** — filled in something, replied, asked
3. **Booked** — a call in the calendar
4. **Attended** — actually turned up
5. **Proposed** — received a number
6. **Closed** — paid

Absolute counts, not percentages, and if you cannot get a number exactly, estimate it and mark it as an estimate. An honest estimate is more useful than a blank.

## Step 2 — Calculate the step-down rates

Between each pair of stages, work out what share survived:

\`\`\`
enquired / arrived      = capture rate
booked   / enquired     = booking rate
attended / booked       = show rate
proposed / attended     = qualification rate
closed   / proposed     = close rate
\`\`\`

Do not compare these to industry benchmarks. Benchmarks are averages of businesses that are not yours, and chasing one is how people fix things that were never broken. Compare them **to each other**.

## Step 3 — Find the cliff

Read the five rates in order. You are looking for the one that is dramatically worse than its neighbours — not slightly worse, dramatically. That discontinuity is your leak.

A chain that degrades gently at every step is a business with no single problem and a general quality issue. That is rarer than it sounds. Most sheets have a cliff.

## Step 4 — Ask what the cliff means

The stage where the drop happens tells you which link is broken:

- **Capture** — message or offer. They understood and did not care.
- **Booking** — funnel. They cared and the path was too hard.
- **Show** — funnel or message. The booking was not real to them.
- **Qualification** — leads. Wrong people, arriving efficiently.
- **Close** — conversion or pricing. This is the expensive one.

Note that two very different problems can produce the same cliff, which is why the next step is not optional.

## Step 5 — Read the losses in their own words

Take the ten most recent deals that died and find what the person actually said. The email, the call note, the last message before silence.

Do not summarise them into categories yet. Read them as sentences. Patterns in real language are far more diagnostic than patterns in a dropdown field, because a CRM stage called "Lost — no budget" hides three different failures and the email that preceded it usually names the real one.

## Step 6 — Check the end of the chain

Two questions that take five minutes and that almost every audit skips:

**How many clients in the window referred someone?** If the answer is none, the ecosystem link is broken, and everything upstream is working harder than it should to replace people who should have brought others.

**What share of revenue came from existing clients?** A business winning only new logos is a business paying full acquisition cost for every pound it earns.

## Step 7 — Write one sentence

At the bottom of the sheet, finish this:

> Our revenue is constrained at the **\_\_\_** link, because **\_\_\_**, and the evidence is **\_\_\_**.

If you cannot fill in the third blank from the numbers above, you have a hypothesis, not a diagnosis. Go back to step 5 and read more losses.

## What to do with it

Fix the named link. Only that one. Then re-run this in 90 days with the same window length and see whether the cliff moved.

The discipline is in the "only that one". The temptation after an audit is to fix everything you noticed on the way, and that is how you end up unable to tell what worked.

## If the sheet does not give you a clean answer

Sometimes it does not. Two stages look equally bad, or the volumes are too small for the ratios to mean anything, or the losses do not read as a pattern.

That is worth an outside pair of eyes — someone who has read a few hundred of these knows which ambiguities matter. [The audit is free, takes 45 minutes, and there is no pitch at the end](/#book): you get the name of the link and the fix whether you hire us or not.

Related reading: [the seven places B2B revenue leaks](/blog/seven-places-b2b-revenue-leaks) and [why "we need more leads" is usually the wrong diagnosis](/blog/more-leads-is-usually-the-wrong-diagnosis).`,
  },
];

async function main() {
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(bold("\nSeeding starter posts\n"));

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle();

    if (existing) {
      console.log(`${dim("·")} ${dim(`${post.slug} — already there, left alone`)}`);
      skipped += 1;
      continue;
    }

    const { error } = await supabase.from("posts").insert({
      ...post,
      /* Drafts. Nobody's site publishes words they have not read. */
      status: "draft",
      published_at: null,
      author_name: null,
      reading_minutes: readingMinutes(post.content),
    });

    if (error) {
      console.log(`${red("✗")} ${post.slug}`);
      console.error(`  ${error.message}`);
      if (/schema cache|does not exist/i.test(error.message)) {
        console.error(
          `\n  ${yellow("The posts table does not exist yet.")} Run ${bold("npm run db:migrate")} first.\n`,
        );
        process.exit(1);
      }
      continue;
    }

    console.log(`${green("✓")} ${post.slug}`);
    created += 1;
  }

  console.log(
    `\n${green("✓")} ${created} created, ${skipped} skipped.\n\n  Review and publish them at ${bold("/admin/posts")}.\n  ${dim("They are drafts — nothing is live until you say so.")}\n`,
  );
}

main().catch((error) => {
  console.error(`\n${red("Seeding failed.")}\n\n  ${error.message}\n`);
  process.exitCode = 1;
});
