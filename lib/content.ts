/*
  Single source of truth for every visible string.
  Pricing figures, the founder name and all URLs are INDICATIVE placeholders.
  Replace before launch. Search for "// PLACEHOLDER".
*/

export const brand = {
  name: "Sales Brain",
  domain: "salesbrain.io", // PLACEHOLDER
  /*
    Where every CTA on the page points.
    "#book" scrolls to the on-page booking form, which always works.
    To use an external scheduler instead, paste the real link here
    (e.g. "https://cal.com/your-handle/audit). Do not leave a scheduler
    link that has not been created yet: it 404s on every button.
  */
  bookingUrl: "/#book",
  /* The on-page symptom checker. Not a separate route. */
  quizUrl: "/#diagnose",
  email: "hello@salesbrain.io", // PLACEHOLDER
  founder: "Aarav Menon", // PLACEHOLDER
  city: "Jaipur, India",
};

/*
  Root-relative fragments, not bare ones. A bare "#stages" is dead on the
  terms and privacy pages, where there is no such section; "/#stages" returns
  to the landing page and lands on it, and still scrolls in place at "/".
*/
export const nav = [
  { label: "The five stages", href: "/#stages" },
  { label: "The audit", href: "/#audit" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export const hero = {
  eyebrow: "Sales systems for founder-led businesses",
  headline: "Your sales problem has a location.",
  sub: "Some months close, some don't, and you can't say why. Sales leaks at one stage. We find it.",
  primaryCta: "Find your sales leak",
  secondaryCta: "Take the 5-minute leak quiz",
  audience:
    "For B2B service businesses, agencies and consultancies where the founder is still selling.",
};

export type Stage = {
  id: string;
  n: number;
  name: string;
  question: string;
  definition: string;
  symptoms: string[];
  fix: string;
  /* Relative pipeline width, 0-100. The narrowing is the whole visual argument. */
  flow: number;
};

export const stages: Stage[] = [
  {
    id: "offer",
    n: 1,
    name: "Offer",
    question: "Is what you sell worth buying?",
    definition:
      "The commercial proposition itself. What gets delivered, at what price, with what scope, guarantee and risk reversal.",
    symptoms: [
      "Prospects go quiet after showing real interest",
      "Every deal turns into a price negotiation",
      "You win mainly when you discount",
      "Long deliberation on a small purchase",
    ],
    fix: "Scope definition, price architecture, productisation, guarantee and risk reversal, and a comparison against the buyer's real alternatives including doing nothing.",
    flow: 100,
  },
  {
    id: "message",
    n: 2,
    name: "Message",
    question: "Is what you say worth believing?",
    definition:
      "How the offer is articulated. Positioning, the buyer's own language for their problem, proof, objection handling, differentiation.",
    symptoms: [
      "Low response on outreach",
      "Ads get clicks and no conversions",
      "People can't describe what you do after a call",
      "You sound like your three closest competitors",
    ],
    fix: "ICP definitions, a pain library in the buyer's verbatim language, proof mapped to objections, competitor counter-positioning, and a six-angle message set across every channel.",
    flow: 82,
  },
  {
    id: "demand",
    n: 3,
    name: "Demand",
    question: "Are enough of the right people arriving?",
    definition:
      "Where conversations come from, in what volume, at what quality, and at what cost relative to what a deal is worth.",
    symptoms: [
      "Growth depends entirely on referrals",
      "Lead volume swings without explanation",
      "Plenty of leads, almost none qualified",
      "You cannot say which source produced revenue",
    ],
    fix: "A channel plan built on your actual economics, targeting and list criteria, outbound system design, and instrumentation that reports revenue by source rather than leads by source.",
    flow: 64,
  },
  {
    id: "conversion",
    n: 4,
    name: "Conversion",
    question: "Do the conversations turn into deals?",
    definition:
      "Discovery, pitch, objection handling, proposal and follow-up. The part of the system that runs live, in a room, under pressure.",
    symptoms: [
      "Good calls that end in silence",
      "Proposals that stall at the same point",
      "Everyone on the team pitches differently",
      "Follow-up stops after the second attempt",
    ],
    fix: "A discovery question set, pitch structure, demo talk track, objection branches, proposal format, follow-up cadence, and a call scorecard so quality becomes visible.",
    flow: 34,
  },
  {
    id: "retention",
    n: 5,
    name: "Retention",
    question: "Does one deal produce the next?",
    definition:
      "What happens after the signature. Repeat purchase, expansion, referral and win-back, which is where the cheapest revenue in the business lives.",
    symptoms: [
      "Almost no revenue from existing clients",
      "Referrals happen by accident",
      "Churn reasons are guessed, not recorded",
      "No structured expansion conversation",
    ],
    fix: "A post-sale sequence, expansion offer design, structured referral asks, and a win-back sequence for the deals that already said no once.",
    flow: 28,
  },
];

export const problem = {
  heading: "\u201cWe just need more leads\u201d is usually wrong",
  body: [
    "It is the first conclusion almost every founder reaches, and it is right maybe a third of the time. The rest of the time more leads make things worse: more conversations with the same broken pitch, more proposals stalling in the same place, more money widening the top of something that leaks in the middle.",
    "You cannot fix a leak you have not located, and almost nobody stops to locate it, because every vendor who turns up already has something to sell you.",
  ],
};

/*
  Six deliverables, one line each. The bodies were paragraphs; a client
  scanning this section needs to know what lands on the table, not to read
  the methodology twice. "Why it is paid" used to live here too and now sits
  only in the FAQ, where it was already answered in almost the same words.
*/
export const audit = {
  heading: "We diagnose before we sell you a fix",
  lead: "One week. Paid. Fixed scope. At the end you know which stage is costing you the most money, what it is worth, and what to fix in what order.",
  deliverables: [
    {
      title: "A leak map",
      body: "All five stages on one diagram, revenue loss quantified at each.",
    },
    {
      title: "The primary leak, named",
      body: "The stage costing you most, with the evidence that found it.",
    },
    {
      title: "The number attached to it",
      body: "What closing that stage at a realistic rate is worth per quarter.",
    },
    {
      title: "A prioritised repair plan",
      body: "What to fix first, second and third, and why in that order.",
    },
    {
      title: "An honest scope statement",
      body: "What we do, what you do internally, what needs someone else.",
    },
    {
      title: "A 60-minute walkthrough",
      body: "Findings presented live, where you can argue with them.",
    },
  ],
};

export const honesty = {
  heading: "We are new, and we are not going to pretend otherwise",
  points: [
    {
      title: "No invented case studies",
      body: "No wall of unverifiable percentages. When we have measured a result with permission, it goes here with the timeframe attached.",
    },
    {
      title: "Founding clients get published, good and bad",
      body: "Our first eight get a reduced rate for permission to publish the real numbers, including the sprints that underdelivered.", // PLACEHOLDER: count and terms
    },
    {
      title: "Ask to see our own leak map",
      body: "We run the same diagnostic on ourselves, and will walk you through it, including the stage we are currently bad at.",
    },
  ],
};

export const pricing = {
  heading: "What it costs",
  lead: "Fixed price and fixed scope, always. Hourly billing creates a conflict of interest.",
  entry: {
    name: "Sales Leak Audit",
    price: "\u20b945,000", // PLACEHOLDER
    duration: "One week",
    summary:
      "The paid diagnostic. Everything above, delivered on a call you can argue with. The full fee is credited against any engagement that starts within 30 days.",
    cta: "Book the audit",
  },
  ladder: [
    {
      name: "Stage Sprint",
      price: "\u20b91,80,000 to \u20b93,50,000", // PLACEHOLDER
      duration: "3 to 6 weeks",
      note: "Fix the primary leak the audit identified. You buy one, not five.",
    },
    {
      name: "Sales System Build",
      price: "\u20b96,50,000", // PLACEHOLDER
      duration: "8 to 12 weeks",
      note: "A multi-stage rebuild, for businesses leaking in several places at once.",
    },
    {
      name: "Sales Growth Partner",
      price: "\u20b91,25,000 per month", // PLACEHOLDER
      duration: "Monthly",
      note: "We run the system, report the weekly numbers, and keep improving the weakest stage.",
    },
    {
      name: "Outcome-linked engagement",
      price: "Reduced base plus \u20b915,000 per closed deal", // PLACEHOLDER
      duration: "Monthly",
      note: "Offered after an audit, once a measured baseline exists to price against.",
    },
  ],
  rule: "We never quote a sprint before an audit. Quoting blind either underprices the work or prescribes the wrong stage.",
};

export const fit = {
  heading: "This is not for everyone",
  yes: {
    label: "Worth your time if",
    items: [
      "You run a B2B service business, agency or consultancy, 2 to 20 people",
      "You are still personally involved in selling",
      "Deals are worth \u20b950,000 or more and involve a real conversation",
      "You have sold this offer at least ten times already",
      "Sales feels unpredictable and you cannot explain why",
    ],
  },
  no: {
    label: "Not worth your money if",
    items: [
      "You have never sold this offer. That is a product problem",
      "Low-ticket, high-volume, no sales call. You need conversion rate optimisation",
      "Ecommerce or D2C. Your leak is paid media and site conversion",
      "You want one agency for ads, site, CRM and content. We deliberately are not",
    ],
  },
  closer:
    "If you are in the second list, say so and we will point you to someone better. That costs us a deal and saves you three months.",
};

export const voices = [
  "Sales feels random",
  "We get calls but we don't close",
  "Growth depends entirely on referrals",
  "Good call, then silence",
  "Every deal becomes a discount",
  "Nobody remembers what we do",
  "The pipeline looks full and nothing lands",
  "Best month, worst month, no idea why",
];

export const faqs = [
  {
    q: "Why is the audit paid?",
    a: "Because a free one would be a sales call with a diagnostic costume on. Paying for it means we work for you, and it means we can honestly conclude that your leak is not something we should be paid to fix.",
  },
  {
    q: "How fast will I see results?",
    a: "System changes show up in the numbers over one to two full sales cycles, not in two weeks. If your cycle is six weeks, expect to read the first honest signal around week twelve. Anyone promising faster is selling you something.",
  },
  {
    q: "What if the audit says my problem is not something you fix?",
    a: "Then that is what the report says, and we will name who does fix it. That happens, and it is the reason the audit is priced the way it is.",
  },
  {
    q: "Do you run our ads or send our email?",
    a: "No. We design what the ads need to say and how to measure them, and we tell your media buyer exactly what to test. People who run ad accounts all day are better at it than we would be. If you do not have one, we will introduce you.",
  },
  {
    q: "What do you need from me during the audit week?",
    a: "Your last 90 days of proposals, roughly a hundred outbound messages, three to five recorded sales calls, your pipeline data and your referral and churn history. Around two hours of your own time in total.",
  },
];

/*
  The closing section. This used to be two: a full-height "final CTA" wall
  and then the form directly under it, which asked the reader to arrive at
  the end of the page twice. The closing headline now sits beside the form,
  so the argument and the action occupy one screen.
*/
export const book = {
  heading: "Find out where the money is leaving",
  lead: "One week, one number, one prioritised plan. Four questions here and we reply within a working day with times, or with the name of someone better suited.",
  support: "Fee credited against any engagement that starts within 30 days.",
  note: "Sending this opens your email client with the answers filled in, so nothing is stored on this site.",
  fields: {
    name: "Your name",
    email: "Work email",
    company: "Company",
    context: "What does sales feel like right now?",
  },
  submit: "Send and request times",
  invalid: "Add your name and a valid work email first.",
  sent: "Your email client should be open. If it did not open, write to us directly at",
};

export const legal = {
  terms: {
    title: "Terms of service",
    updated: "Last updated 12 September 2026", // PLACEHOLDER
    sections: [
      {
        h: "What we sell",
        p: "We sell fixed-scope, fixed-price diagnostic and build engagements for sales systems. The scope of any engagement is whatever is written in the proposal you signed. Nothing on this website is itself an offer, a quote or a guarantee of a particular commercial result.",
      },
      {
        h: "Fees and payment",
        p: "The audit fee is payable in full before the engagement week begins. Sprint and retainer fees are invoiced according to the schedule in the signed proposal. Prices shown on this site are indicative and may change; the price in your proposal is the one that applies.",
      },
      {
        h: "What we do not promise",
        p: "We do not promise a revenue figure, a conversion rate or a timeframe for results. Sales systems change over one to two full sales cycles, and the outcome depends on work you do as well as work we do. If you need a guaranteed number, we are the wrong supplier.",
      },
      {
        h: "Your material",
        p: "You keep ownership of everything you give us. We keep ownership of our frameworks and templates, and you get an unlimited licence to use every deliverable we produce for you, inside your business, for as long as you like.",
      },
      {
        h: "Confidentiality",
        p: "Client numbers, recordings and documents are confidential. We publish results only with written permission, and only in the form that permission covers.",
      },
      {
        h: "Cancellation",
        p: "An audit can be rescheduled once at no cost with at least three working days' notice. Cancelled after work has begun, the fee is not refundable, because the week has been reserved for you. Retainers can be ended with 30 days' written notice by either side.",
      },
      {
        h: "Liability",
        p: "Our total liability for any engagement is limited to the fees you paid for that engagement. We are not liable for lost profit or indirect loss.",
      },
      {
        h: "Governing law",
        p: "These terms are governed by the laws of India, and the courts of Jaipur, Rajasthan have exclusive jurisdiction.", // PLACEHOLDER
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "Last updated 12 September 2026", // PLACEHOLDER
    sections: [
      {
        h: "The short version",
        p: "This site has no analytics, no advertising pixels and no third-party trackers. The symptom checker runs entirely in your browser and your selections are never sent anywhere.",
      },
      {
        h: "What we collect",
        p: "Only what you type into the booking form or the newsletter field, and only when you submit it. The booking form opens your own email client, which means the message travels to us as an ordinary email and is never stored on this website.",
      },
      {
        h: "Why we hold it",
        p: "To reply to you, to run an engagement you have asked for, and to send the newsletter if you asked for it. We do not sell or rent contact details, ever.",
      },
      {
        h: "How long we keep it",
        p: "Enquiry emails are kept for two years. Client engagement material is kept for seven years, because tax law requires it. Newsletter addresses are kept until you unsubscribe, which every issue links to.",
      },
      {
        h: "Client data during an engagement",
        p: "During an audit we handle proposals, call recordings and pipeline exports. These live in an access-controlled folder for that client alone, are shared only with the people working on the engagement, and are deleted 90 days after delivery unless you ask us to keep them.",
      },
      {
        h: "Your rights",
        p: "Write to us and you can ask for a copy of what we hold about you, ask us to correct it, or ask us to delete it. We answer within 30 days.",
      },
    ],
  },
};
