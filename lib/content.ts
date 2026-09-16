/*
  Single source of truth for every visible string.

  The founder name, the email and the proof figures are INDICATIVE
  placeholders. Replace before launch. Search for "// PLACEHOLDER".

  Positioning, which everything below depends on:
    Big idea       - It isn’t a sales problem. It’s a process problem, and the
                     process breaks in exactly one place.
    Mechanism      - The Revenue Leak Audit. A diagnosis before a prescription.
    The enemy      - Guesswork. Buying solutions for an undiagnosed problem.
    One line       - Every agency sells you a cure. We find the disease first.
  The hero states it, the mechanism section proves it, the close repeats it.
  Consistency is what makes it stick, so do not paraphrase it in one place
  and not the others.
*/

export const brand = {
  name: "Sales Brain",
  /*
    The live domain. Everything absolute on this site is built from it -
    canonical tags, the sitemap, RSS links, OpenGraph URLs - so it has to be
    the address the site is actually served from and nothing else. See
    lib/site-url.ts, which prefers NEXT_PUBLIC_SITE_URL over this and falls
    back here.
  */
  domain: "salesbrain.in",
  /*
    Where every CTA on the page points.
    "#book" scrolls to the on-page booking form, which always works.
    To use an external scheduler instead, paste the real link here
    (e.g. "https://cal.com/your-handle/audit"). Do not leave a scheduler
    link that has not been created yet: it 404s on every button.
  */
  bookingUrl: "/#book",
  /* The on-page symptom checker. Not a separate route. */
  quizUrl: "/#diagnose",
  email: "contact@salesbrain.in",
  founder: "Aarav Menon", // PLACEHOLDER
  city: "Jaipur, India",
  tagline: "We diagnose before we prescribe.",
};

/*
  Three links, as specified in the copy. A fourth would dilute a nav whose
  only real job is holding the button in view.

  Root-relative fragments, not bare ones. A bare "#problem" is dead on the
  terms and privacy pages, where there is no such section; "/#problem"
  returns to the landing page and lands on it, and still scrolls in place
  at "/".
*/
export const nav = [
  { label: "The Problem", href: "/#problem" },
  { label: "How It Works", href: "/#how" },
  { label: "Results", href: "/#proof" },
  /*
    The fourth link, added when the blog was. The note above argues against a
    fourth on the grounds that it dilutes a nav whose job is holding the CTA
    in view, and that still holds for another section anchor - but this one is
    different in kind. It is the only item that leaves the landing page, and
    it is the only page on the site that search traffic can arrive on
    directly. A blog that nothing links to is a blog no crawler re-visits and
    no reader finds, and the site-wide nav is the strongest internal link
    there is to give it.
  */
  { label: "Blog", href: "/blog" },
];

/*
  ONE CTA LABEL, FOUR PLACEMENTS.

  The brief is explicit that the button says the same thing every time, and
  it is right: a reader who meets four differently-worded buttons has to
  re-decide what each one does. Repetition is what makes the fourth one feel
  like the obvious end of the page rather than a new proposition.

  It lives here as a constant so the hero, the steps section, the call
  section, the quiz result and the form submit cannot drift apart. The arrow
  is added by the button components, not typed into the string, so it never
  ends up doubled or missing.

  `navCta` is the one deliberate exception. The header pill is a persistent
  reminder rather than a fifth ask, and at 14px the full label crowds the
  wordmark off the line on a small laptop.
*/
export const CTA = "Book My Free Sales Audit";

export const hero = {
  eyebrow: "We diagnose before we prescribe",
  /*
    Set in sentence case with typographic apostrophes, like every other
    heading on this page. The turn is the second sentence, and the hero
    renders "process problem." in the accent so the turn is visible before
    it is read.
  */
  headline: "You don’t have a sales problem. You have a process problem.",
  /*
    "Seven stages" is the phrase the tooltip hangs on, and the tooltip names
    them from `links` rather than from a second copy of the list - so a
    renamed link cannot leave a stale enumeration in the first viewport.

    The reader's word is "stages"; ours is "links in a chain". The hero uses
    theirs and the mechanism section earns ours.
  */
  sub: "We analyse all seven stages of your pipeline, find the one where deals die, and rebuild it.",
  primaryCta: CTA,
  navCta: "Book My Sales Audit",
  secondaryCta: "Show me what’s broken",
  /* Sits directly under the button. Reverses the risk before it is felt. */
  risk: "45 minutes. No pitch. You leave with the diagnosis whether we work together or not.",
  /*
    Three claims, none of them a number. The brief asks for "[X] businesses
    audited · [X]% average lift", and those stay out until they are true and
    measured - an invented figure here discredits the real ones further down
    the page. All three are written as benefits to the reader rather than
    facts about us, and in parallel form, so the strip scans as one row.
  */
  trust: [
    "Free 45-minute diagnosis",
    "No pitch, no obligation",
    "You keep the findings either way",
  ],
};

export type Link = {
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

/*
  The seven links of the revenue chain.

  `question` is the one line the copy brief specifies for each link, and is
  what the reader sees first. `definition`, `symptoms` and `fix` are the
  supporting detail the selector panel and the symptom checker need; they
  are written in the same clipped voice rather than borrowed from elsewhere.

  `conversion` keeps its id because the hero pipeline singles that bar out
  as the leak by id.
*/
export const links: Link[] = [
  {
    id: "offer",
    n: 1,
    name: "Offer",
    question: "Is what you sell worth more than what you charge?",
    definition:
      "The thing itself. What gets delivered, at what price, with what scope and what guarantee — measured against every alternative the buyer has, including doing nothing.",
    symptoms: [
      "Prospects go quiet after real interest",
      "Every deal turns into a negotiation",
      "You win mainly when you discount",
      "Long deliberation on a small purchase",
    ],
    fix: "Scope definition, price architecture, productisation, guarantee and risk reversal.",
    flow: 100,
  },
  {
    id: "message",
    n: 2,
    name: "Message",
    question: "Does the market instantly understand why you?",
    definition:
      "How the offer is said. Positioning, the buyer’s own words for their problem, the proof that answers the objection they haven’t voiced yet.",
    symptoms: [
      "Low response on outreach",
      "Ads get clicks and no conversions",
      "Nobody can describe what you do after a call",
      "You sound like your three closest competitors",
    ],
    fix: "ICP definition, a pain library in the buyer’s verbatim language, proof mapped to objections, counter-positioning.",
    flow: 88,
  },
  {
    id: "leads",
    n: 3,
    name: "Leads",
    question: "Are the right people showing up?",
    definition:
      "Where conversations come from, in what volume, at what quality, and at what cost against what a deal is actually worth.",
    symptoms: [
      "Growth depends entirely on referrals",
      "Lead volume swings without explanation",
      "Plenty of leads, almost none qualified",
      "You can’t say which source produced revenue",
    ],
    fix: "A channel plan built on your real economics, targeting and list criteria, and reporting that shows revenue by source, not leads by source.",
    flow: 74,
  },
  {
    id: "funnel",
    n: 4,
    name: "Funnel",
    question: "Does your website and journey carry them forward or lose them?",
    definition:
      "Everything between first click and booked call. The page, the path, the form, the follow-up nobody sent.",
    symptoms: [
      "Traffic arrives and nothing books",
      "People read three pages and leave",
      "Enquiries sit unanswered for a day",
      "No idea where the drop-off happens",
    ],
    fix: "Page structure and copy, one path instead of five, a booking flow with fewer fields, and instrumentation on every step.",
    flow: 58,
  },
  {
    id: "conversion",
    n: 5,
    name: "Conversion",
    question: "Do your calls close — or educate for free?",
    definition:
      "Discovery, pitch, objection, proposal, follow-up. The part of the system that runs live, in a room, under pressure.",
    symptoms: [
      "Good calls that end in silence",
      "Proposals stall at the same point",
      "Everyone on the team pitches differently",
      "Follow-up stops after the second try",
    ],
    fix: "A discovery question set, pitch structure, objection branches, proposal format, follow-up cadence and a call scorecard.",
    flow: 31,
  },
  {
    id: "pricing",
    n: 6,
    name: "Pricing",
    question: "Are you leaving money on the table every single deal?",
    definition:
      "What you charge and how you charge it. Hourly against fixed, one tier against three, and the discount you reach for when the call goes quiet.",
    symptoms: [
      "You price by hours, not by outcome",
      "One tier, take it or leave it",
      "Margin thins every time you win",
      "You haven’t raised prices in two years",
    ],
    fix: "Pricing model, tier design, anchoring, and a discount policy that isn’t decided live on the call.",
    flow: 26,
  },
  {
    id: "ecosystem",
    n: 7,
    name: "Ecosystem",
    question: "Does one client turn into three?",
    definition:
      "What happens after the signature. Repeat, expansion, referral and win-back — where the cheapest revenue in the business lives.",
    symptoms: [
      "Almost no revenue from existing clients",
      "Referrals happen by accident",
      "Churn reasons are guessed, not recorded",
      "No structured expansion conversation",
    ],
    fix: "A post-sale sequence, expansion offer design, structured referral asks, and a win-back for the deals that said no once.",
    flow: 19,
  },
];

/*
  SECTION 3 - SYMPTOM CHECK.

  The brief specifies four lines and a closing line. The four are the first
  four below; the rest keep the marquee from looping visibly and are written
  in the same voice. `closer` is not rendered here - it lands as the opening
  line of the reframe, which is the sentence it sets up.
*/
export const voices = [
  "Leads come in. They don’t close.",
  "Ads spend. Nothing converts.",
  "You drop your price to win the deal.",
  "Three agencies. Three opinions. Same revenue.",
  "Good call, then silence.",
  "The pipeline looks full and nothing lands.",
  "Best month, worst month, no idea why.",
  "Nobody remembers what we do.",
];

/*
  SECTION 3b - THE SYMPTOM CHECK, as a scored chart.

  This was 28 chips in a wrap - every symptom of every link, laid out at
  once. It filled most of a screen, and it asked a founder to read 28 lines
  in order to give the four or five answers the copy itself predicts. Showing
  28 options to collect five answers is the wrong instrument.

  Seven statements on a frequency scale does the same job better:
    - seven decisions instead of twenty-eight lines of reading
    - a weighted answer (0/1/2) rather than ticked-or-not, so "constantly"
      outranks "sometimes" instead of counting the same
    - it fits in seven rows, beside the readout rather than above it

  It does make the mapping legible - one statement per link, in the order the
  chain runs. That is the right trade. The reader has just been walked
  through all seven links in the section above, so there is nothing left to
  conceal, and a page whose whole argument is "we show you the working" is
  not the place for a black box. The payoff was never which link is named;
  it is seeing the instrument weigh and rank them.

  `probes` are written in plain founder language on purpose. The link names
  are our vocabulary, not the reader's, and a statement they recognise from
  their own last quarter is what makes the score feel earned.
*/
export const symptomCheck = {
  heading: "If you’re reading this, one of these is true.",
  lead: "Seven statements, one for each link in the chain. Answer three and the instrument reads. It is rough, and it is not the audit.",
  /* Index is the weight: Rarely 0, Sometimes 1, Constantly 2. */
  scale: ["Rarely", "Sometimes", "Constantly"],
  probes: [
    { linkId: "offer", text: "Deals turn into a negotiation about price or scope" },
    { linkId: "message", text: "People look at your outreach, then ignore it" },
    { linkId: "leads", text: "Not enough of the right people are arriving" },
    { linkId: "funnel", text: "Traffic lands on the site and nothing books" },
    { linkId: "conversion", text: "Good calls end in silence" },
    { linkId: "pricing", text: "You discount to close, and the margin goes with it" },
    { linkId: "ecosystem", text: "Clients don’t come back, and referrals are luck" },
  ],
  /* Rendered at the top of the reframe, which is the sentence it sets up. */
  closer: "None of that is a marketing problem. It’s a diagnosis problem.",
  nearly: "Answer one more and this can point somewhere.",
  result: "Your answers point at",
  /* The live panel beside the chart. */
  panel: "Live reading",
  panelHint: "Seven links. The bars move as you answer.",
  tie: "scored the same. When two links tie, the earlier one usually causes the later one, so start there.",
  /* Deliberately the same words as every other button on the page. The
     result card above it already supplies the context a bespoke label
     would have carried. */
  cta: CTA,
  reset: "Start over",
};

/* SECTION 4 - THE REFRAME. */
export const problem = {
  heading: "You keep buying fixes for a problem nobody diagnosed.",
  /*
    Three vendors, three self-serving answers. The repetition is the joke,
    so the two halves are stored separately and set in aligned columns -
    run together as prose the pattern is something you work out, and in a
    column it is something you see.

    "Ask an ads agency what's wrong" lost its tail so all three openers are
    parallel; the heading above has already established that we are asking
    what is wrong. The answers became direct speech because a vendor saying
    "It's the ads" indicts them more than being reported in the third person.
  */
  asks: [
    { who: "Ask an ads agency", answer: "“It’s the ads.”" },
    { who: "Ask a web designer", answer: "“It’s the website.”" },
    { who: "Ask a sales coach", answer: "“It’s the script.”" },
  ],
  body: [
    "Everyone sells you their hammer. Nobody opens the machine.",
    "So you spend twelve months and six figures fixing links that were never broken — while the one that is broken keeps quietly costing you clients.",
  ],
};

/* SECTION 5 - THE MECHANISM. */
export const mechanism = {
  heading: "Revenue is a chain. It breaks at the weakest link.",
  lead: "Effort on a strong link does nothing. Effort on the broken one changes everything.",
  /* "Which one is bleeding" put a leak inside a chain in the same breath.
     The page can carry both images as long as each stays in its own
     section; inside one sentence it just reads as a slip. */
  closer:
    "The audit tells you which link is costing you. Usually it’s not the one you think.",
};

/* SECTION 6 - HOW IT WORKS. */
export const steps = {
  heading: "Diagnose. Fix. Scale.",
  items: [
    {
      n: "01",
      name: "Diagnose",
      body: "We pull apart your offer, funnel, numbers and sales calls, and pinpoint the single biggest constraint on your revenue. You get the map.",
    },
    {
      n: "02",
      name: "Fix",
      body: "We rebuild only what’s broken — the offer, the ads, the site, the content, the funnel, the lead magnet, the sales process. Done with you or done for you.",
    },
    {
      n: "03",
      name: "Scale",
      body: "Once the leak is sealed, we turn up volume. Now more traffic actually means more revenue.",
    },
  ],
  cta: CTA,
};

/* SECTION 7 - WHAT WE FIX. */
export const fixes = {
  heading: "Whatever’s broken, we build it.",
  lead: "You don’t hire seven specialists and hope they agree. One team. One diagnosis. One plan.",
  items: [
    "Offer design",
    "Pricing architecture",
    "Sales scripts & closing",
    "Ad creative & campaigns",
    "Website & landing pages",
    "Funnel design",
    "Lead magnets",
    "Content systems",
    "Product ecosystem",
  ],
  closer:
    "We won’t build any of it until we know it’s the thing costing you money.",
};

/*
  SECTION 8 - PROOF.

  Plain reviews, not case studies. The earlier version of this section was a
  Was → Now grid with the leak and the repair broken out into labelled rows,
  and it read as something we had written about the client rather than
  something the client had said. Six people talking in their own sentences is
  the more believable instrument, so the structure is gone and only the
  speech is left.

  Two rules the copy holds to:

  1. Every review names a number the founder can check, because a review
     without one is indistinguishable from a review we made up.
  2. The ratings are mixed, and the four-star ones say why. A wall of six
     identical five-star cards is the single clearest signal of a fabricated
     testimonial page; the one review that admits revenue has not caught up
     yet is what makes the other five readable.

  PLACEHOLDER - every review below is written to the shape a real one should
  take, and none of them is a real client yet. Replace them with recorded,
  permissioned quotes before this page goes live, or set `hasReviews: false`
  and ship `fallback` alone. Being new is not a weakness you have to hide; it
  is the reason the audit is free, and one invented number here discredits
  every true claim on the page.
*/
export const proof = {
  heading: "What they said after the audit.",
  /*
    Earns the mixed ratings below before the reader gets to them, and quietly
    licenses the fourth card, which is the least flattering thing on the page
    and the reason the rest is worth reading.
  */
  lead: "Posted as given, including the one that is still waiting on its numbers.",
  /* Set to false to ship `fallback` alone, with no reviews. */
  hasReviews: true,
  /* `rating` is out of 5 and may end in .5 - the row renders a half star. */
  reviews: [
    {
      rating: 5, // PLACEHOLDER
      body: "I was sure the pitch was the problem. Turns out the pitch was fine and the follow-up was the problem — nobody had actually read my emails before telling me that. Two proposals in ten used to close. It’s four now, same deal sizes.",
      name: "Rahul Mehta", // PLACEHOLDER
      role: "Founder, IT staffing firm",
      meta: "Pune · 11 people",
    },
    {
      rating: 5, // PLACEHOLDER
      body: "The uncomfortable part was being told I was the one training clients to negotiate. I was. Three fixed scopes and a script for saying no, and our average project went from ₹1.4L to ₹2.6L on roughly the same number of projects.",
      name: "Sneha Iyer", // PLACEHOLDER
      role: "Co-founder, brand design studio",
      meta: "Bengaluru · 6 people",
    },
    {
      rating: 4.5, // PLACEHOLDER
      body: "Good delivery, happy clients, and every January still started at zero. The fix was almost insultingly simple — offer the review retainer at handover, when people are happiest, not six months later over email. Repeat and referral went from 8% of our year to 24%.",
      name: "Arvind Nair", // PLACEHOLDER
      role: "Director, ERP consultancy",
      meta: "Kochi · 14 people",
    },
    {
      rating: 4, // PLACEHOLDER
      body: "Our outbound read exactly like the other forty agencies in the inbox. They rewrote it around one problem instead of our service list and replies went from under 2% to about 6% in ten weeks. Revenue hasn’t moved much yet — the pipeline is fuller, the deals are still working through. They said upfront it would take a cycle or two. I’d rather that than a made-up number.",
      name: "Farhan Qureshi", // PLACEHOLDER
      role: "Founder, performance marketing agency",
      meta: "Ahmedabad · 9 people",
    },
    {
      rating: 5, // PLACEHOLDER
      body: "I knew I was dependent on one person for referrals. I didn’t know it was 80% until somebody wrote it down in front of me. We built a second channel before touching anything else, and referrals are down to 45% of leads — not because referrals fell, but because the base grew.",
      name: "Priya Deshmukh", // PLACEHOLDER
      role: "Partner, HR & compliance consultancy",
      meta: "Nagpur · 5 people",
    },
    {
      rating: 4.5, // PLACEHOLDER
      body: "Every sales call had turned into a free scoping session. They handed us disqualifiers to use in the first fifteen minutes and we walked away from six deals we’d have chased before. Felt insane at the time. Our cycle went from 71 days to 44, and it was the most profitable thing we did all year.",
      name: "Karthik Reddy", // PLACEHOLDER
      role: "Co-founder, custom software studio",
      meta: "Hyderabad · 16 people",
    },
  ],
  fallback: {
    heading: "We’re new. That’s why the audit is free.",
    body: "There is no wall of percentages here because we haven’t earned one yet. What we will do is run the diagnosis on your business at our cost, show you the working, and let you decide whether the thinking is worth paying for. Ask to see our own leak map on the call — including the link we’re currently bad at.",
  },
};

/* SECTION 9 - WHO THIS IS FOR. */
export const fit = {
  heading: "This works for some people. Not everyone.",
  yes: {
    label: "Book the audit if you",
    items: [
      "Already have customers and revenue — you’re not starting from zero",
      "Can deliver brilliantly when you win the client",
      "Want the truth more than you want reassurance",
      "Can act on what we find within 30 days",
    ],
  },
  no: {
    label: "Don’t book if you",
    items: [
      "Want someone to “just run ads” and not ask questions",
      "Have no offer, no customers, no proof yet",
      "Are shopping for the cheapest option",
      "Won’t change the offer or the price, no matter what the data says",
    ],
  },
  closer:
    "We turn down more audits than we take. Being honest about fit is faster for both of us.",
};

/* SECTION 10 - WHAT HAPPENS ON THE CALL. */
export const call = {
  heading: "45 minutes. Here’s exactly what happens.",
  lead: "No slide deck. No “let me tell you about our agency.”",
  steps: [
    {
      title: "We ask.",
      body: "Your numbers, your offer, your last 10 deals — won and lost.",
    },
    {
      title: "We map.",
      body: "All seven links, scored live on the call. You watch it happen.",
    },
    {
      title: "We name it.",
      body: "The single biggest constraint on your revenue right now.",
    },
    {
      title: "We tell you the fix.",
      body: "Whether you hire us or do it yourself.",
    },
  ],
  closer:
    "If we’re not the right people to fix it, we’ll say so and point you to someone who is. The audit is free because the diagnosis sells the work. If the diagnosis isn’t good, we don’t deserve the work.",
};

/* SECTION 11 - OBJECTIONS. */
export const faqs = [
  {
    q: "Is this actually free, or is it a sales call in disguise?",
    a: "It’s free, and yes — at the end we’ll tell you what working together looks like. Once. If it’s a no, it’s a no, and you keep the diagnosis.",
  },
  {
    q: "What do I need to bring?",
    a: "Your rough numbers: leads per month, close rate, average deal size. If you don’t know them, that’s often the finding.",
  },
  {
    q: "We already have an agency.",
    a: "Then the audit tells you if they’re working on the right link. Most aren’t — not because they’re bad, but because they only sell one thing.",
  },
  {
    q: "How much does the fix cost?",
    a: "Depends entirely on what’s broken. Some fixes are a pricing change and cost you nothing. We’ll give you the number on the call, not before.",
  },
  {
    q: "How fast do we see results?",
    a: "Offer and pricing fixes move within weeks. Funnel and content compound over 60 to 90 days. We’ll tell you which one you’re in.",
  },
  {
    q: "Why should I trust the diagnosis?",
    a: "Don’t. Test it. Everything we find, you can verify against your own numbers.",
  },
];

/*
  SECTION 12 - FINAL CTA.

  The closing argument sits beside the form rather than above it, so the
  reader reaches the end of the page once instead of twice.

  Four fields, as specified. Every extra field costs bookings, and the last
  one is doing two jobs: it qualifies the enquiry and it warms up the call.
*/
export const book = {
  heading: "Find the leak. Then decide.",
  /* "45 minutes will confirm it" opened on a numeral, which reads as a typo
     at the size this is set. Naming the call instead keeps the figure and
     gives the sentence something to start on. */
  lead: "You already sense which part of your business is holding the rest back. One 45-minute call will confirm it or surprise you.",
  support: "Both are worth more than another quarter of guessing.",
  /* PLACEHOLDER: set the real monthly cap, or delete this line. A cap you do
     not actually enforce is the one lie on this page a buyer can catch. */
  scarcity: "Limited to six audits a month. No pitch, no obligation.",
  ps: "Every month you don’t fix the broken link, it costs you the same amount it cost you last month. That number is the real price of waiting.",
  /*
    This line used to say nothing was stored on the site, which was true when
    the form only opened a mailto. It now writes to a database, so the promise
    had to change rather than quietly become false - the one claim on this page
    a reader could catch us on is the one about their own data.

    What replaces it says the two things a person hesitating over the button
    actually wants to know: when they will hear back, and who else sees it.
  */
  note: "We read every one and reply within one business day. Your details stay with us - no list, no sharing.",
  fields: {
    name: "Name",
    email: "Email",
    website: "Website",
    context:
      "In one line: what’s the biggest thing holding your revenue back right now?",
  },
  submit: "Book My Free Sales Audit",
  invalid: "Add your name and a valid email first.",
  sending: "Sending…",
  sent: "Got it. We’ll read it today and reply within one business day.",
  /*
    The failure line. It does not apologise and it does not say "error" - it
    gives the reader the next action, because a person who has just written
    four fields about their revenue problem wants those words to arrive
    somewhere, not a status code. The form opens their email client with the
    same answers already filled in, so the enquiry survives our outage.
  */
  failed: "That didn’t save - we’ve opened your email client with the same answers instead. Or write to us directly at",
};

export const legal = {
  terms: {
    title: "Terms of service",
    updated: "Last updated 12 September 2026", // PLACEHOLDER
    sections: [
      {
        h: "What we sell",
        p: "We sell a free diagnostic audit, and fixed-scope, fixed-price build engagements that follow it. The scope of any paid engagement is whatever is written in the proposal you signed. Nothing on this website is itself an offer, a quote or a guarantee of a particular commercial result.",
      },
      {
        h: "The audit",
        p: "The audit is free and carries no obligation. It runs about 45 minutes. At the end we will tell you once what working together would look like; if you are not interested, the diagnosis is still yours to keep and act on however you like.",
      },
      {
        h: "Fees and payment",
        p: "Build and retainer fees are invoiced according to the schedule in the signed proposal. We do not publish prices, because the price depends entirely on which link is broken and how far.",
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
        p: "An audit can be rescheduled or cancelled at any time at no cost, because it is free. Retainers can be ended with 30 days’ written notice by either side.",
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
      /*
        This section used to end "and is never stored on this website", which
        was true while the booking form only opened a mailto. It writes to a
        database now, and a privacy policy that describes the version of the
        site we used to run is the single worst thing on a page whose whole
        argument is that we tell people the truth about what we find.

        What replaces it names the processor, says where the data physically
        sits, and admits to the one thing people never think to ask about -
        that the server keeps a fingerprint of their IP address.
      */
      {
        h: "What we collect",
        p: "Only what you type into the booking form or the newsletter field, and only when you submit it: your name, your email address, your website if you give one, and the line you write about what is holding your revenue back.",
      },
      {
        h: "Where it is stored",
        p: "Booking form submissions are saved to our own database, hosted by Supabase, and are readable only by us through a password-protected admin page. We also store a one-way fingerprint of the internet address you submitted from, so we can spot automated abuse. It cannot be turned back into your address, and we never see the address itself.",
      },
      {
        h: "Why we hold it",
        p: "To reply to you, to run an audit you have asked for, and to send the newsletter if you asked for it. We do not sell or rent contact details, ever.",
      },
      {
        h: "How long we keep it",
        p: "Booking form entries and enquiry emails are kept for two years, then deleted. Client engagement material is kept for seven years, because tax law requires it. Newsletter addresses are kept until you unsubscribe, which every issue links to.",
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
