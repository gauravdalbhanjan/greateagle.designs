/* Project data: OPEX Allocation Tool Redesign (Amazon) */
window.CASE_STUDY = {
  __file: "opex.js",
  name: "OPEX Allocation Tool Redesign",

  hook: {
    label: "Before / After",
    headline: "Old multi-tab legacy lookup versus a single-screen dashboard.",
    interactive: true,
    before: { img: "../assets/opex-allocation/before.gif", alt: "Old Cognos multi-tab lookup flow with manual ID lookup and tab-switching" },
    after:  { img: "../assets/opex-allocation/after.gif", alt: "New single-screen allocation dashboard" },
    beforeLabel: "Old design",
    afterLabel: "New dashboard"
  },

  title: {
    headline: "Allocation Tool Redesign",
    tags: ["Systems Thinking", "UX Research", "UI Design", "Product Lead"],
    client: "Amazon",
    result: "94% reduction in review time &mdash; from 9.7 hours to 33 minutes"
  },

  hero: { img: "../images/budget-planner2.gif", alt: "The redesigned allocation review dashboard" },

  metrics: [
    { num: "9.7 hrs &rarr; 33 min", label: "Review time (94% reduction)" },
    { num: "9+ hrs", label: "Time reclaimed/cycle" },
    { num: "1,000", label: "Data retrievals per review cycle, ~30 sec saved per retrieval" }
  ],

  snapshot: {
    "Role": "UX Researcher, Designer, Product Lead",
    "Team": "PM, Senior PM, Senior UX Designer, UX Designer, Engineer, Senior Engineer, SDE, Developer, Finance Manager, Senior Finance Manager (cross-functional)",
    "Timeline": "Nov 2025 &ndash; Mar 2026",
    "Tools": "Figma, Amazon Analytics, Amazon Pulse, Kiro"
  },

  context: "Financial managers processed thousands of allocation change requests per quarter using Cognos &mdash; a data-storage tool repurposed for decision-making, not built for it.",

  problem: {
    title: "What was breaking down",
    points: [
      { title: "Manual ID lookup", body: "Every CostPool item required a manual ID lookup, with high latency." },
      { title: "Context scattered across tabs", body: "Multiple tabs and spreadsheets were required to assemble context for one approval." },
      { title: "Cryptic codes", body: "Codes had no natural-language translation making cognitively heavy." },
      { title: "Hidden exclusions", body: "Exclusions were buried or invisible until manually cross-checked." },
      { title: "Experts treated as investigators", body: "The system treated expert users as investigators, not decision-makers causing delay in action." }
    ],
    quote: { text: "You will make our life a lot easier if this puzzle could be solved.", cite: "Finance Manager - Stakeholder" }
  },

  /* Scroll-driven reenactment of the legacy lookup workflow. Each cost-pool
     change came as a dense list of 4-digit IDs; managers copied one ID at a
     time into a Cognos-style query studio where every search took ~30s, so
     they kept several tabs running in parallel just to keep pace — then had to
     drill down and eyeball results by hand. Recreated UI (not screenshots). */
  legacyFlow: {
    title: "One number at a time, thirty seconds each",
    ids: "1234;4567;42664;6246;24;246246;2462;246246;34757;46764;657;35634;3462;24624;2353;24362347;347;457;457;347;347;46745;747;574577;5578;576456;35652;2424242;42423;46335;4657;35;6346;3555321;5421;51245;5412;54124;5412;1524;542;524;1254;1245;5421;5421;541;1524;5124;1542;12;512;1245;46;2462462;624624;24624;246246;",
    targetId: "42664",
    latencySeconds: 30,
    retrievalsPerCycle: 1000,
    tabs: 4,
    beats: [
      { key: "list",    caption: "It starts as a wall of 4-digit CostPool IDs. Each one has to be looked up individually." },
      { key: "copy",    caption: "Copy one ID\u2026 then paste it into the legacy query studio." },
      { key: "search",  caption: "Run the search \u2014 and wait. Each retrieval takes about 30 seconds of latency." },
      { key: "tabs",    caption: "To keep pace, managers run several tabs at once, each mid-search." },
      { key: "load",    caption: "Then drill down and eyeball the result by hand \u2014 \u00d71,000 retrievals a cycle. That\u2019s the cognitive load." }
    ]
  },

  shift: {
    title: "Stop making managers search",
    insight: "Managers weren't struggling from lack of skill &mdash; the system was hiding the context they needed. The bet: stop making managers search and assemble context; [[surface everything needed to confirm or reject a request in one view]].",
    before: "9.7 hrs of tab-switching and manual lookup",
    after: "33 min in a single dashboard view"
  },

  process: {
    title: "How we got there?",
    steps: [
      { title: "Contextual inquiry", body: "Shadowed managers during peak quarterly review, observing where the workflow actually broke down versus where they said it broke down." },
      { title: "Friction mapping", body: "Logged every pause, tab-switch, and spreadsheet detour." },
      { title: "Decision-trigger interviews", body: "Asked stakeholders what specific data points are required to approve or deny a request, defining the minimum viable information surface." }
    ]
  },

  walkthrough: {
    title: "A tour of the solution",
    steps: [
      { title: "All metadata pre-computed and surfaced", body: "No manual lookup — everything needed appears up front.", media: { img: "../assets/opex-allocation/Metadata pre-computed and surfaced.jpg", alt: "Metadata surfaced without lookup" } },
      { title: "Natural-language labels", body: "Cryptic numeric IDs replaced with natural-language labels aiding accuracy and consistency.", media: { img: "../assets/opex-allocation/Natural-language labels.png", alt: "Natural language labels replacing IDs" } },
      { title: "Exclusions surfaced proactively", body: "Exclusions appears color-coded, inline, during review, not after.", media: { img: "../assets/opex-allocation/Exclusions surfaced proactively.png", alt: "Exclusions surfaced inline" } },
      { title: "Owner & client per line item", body: "A built-in audit trail on every line.", media: { img: "../assets/opex-allocation/Owner client audit trail per line.png", alt: "Owner and client shown per line with audit trail" } }
    ]
  },

  decisions: [
    { title: "Information architecture", body: "Reorganized the data hierarchy so Channel, Exclusions, Ownership, and Product type appear together.", whyNot: "Keeping separate views felt cleaner per-screen, but it forced toggling between views for a single decision &mdash; the exact friction we were removing." },
    { title: "Natural-language normalization", body: "Replaced numeric IDs to reduce mental-translation load per row.", whyNot: "Tooltips on hover were considered, but that still leaves a lookup step on every row." },
    { title: "Proactive exclusion surfacing", body: "Turned a reactive error-catch into a built-in quality check.", whyNot: "A validation warning at submit-time catches errors late; surfacing exclusions during review prevents them." },
    { title: "Audit trail by design", body: "Owner and client on every line as a structural feature, not an add-on &mdash; built-in compliance readiness.", whyNot: "A separate audit export would satisfy compliance but not help the reviewer in the moment." }
  ],

  gallery: [
    { img: "../assets/opex-allocation/after.gif", caption: "Redesigned dashboard &mdash; single-screen review", wide: true },
    { img: "../assets/opex-allocation/Metadata pre-computed and surfaced.jpg", caption: "Metadata pre-computed and surfaced" },
    { img: "../assets/opex-allocation/Natural-language labels.png", caption: "Natural-language labels" },
    { img: "../assets/opex-allocation/Exclusions surfaced proactively.png", caption: "Exclusions surfaced proactively" },
    { img: "../assets/opex-allocation/Owner client audit trail per line.png", caption: "Owner / client audit trail per line" },
    { img: "../assets/opex-allocation/allocation-deliverable.jpg", caption: "The allocation prototype in making", wide: true }
  ],

  impact: [
    { segment: "User", stat: "94% faster", body: "Time reduction per cycle; lower decision fatigue." },
    { segment: "Business", stat: "Higher volume", body: "The same headcount handled higher request volume, with fewer misallocation errors." },
    { segment: "Org", stat: "Audit-ready", body: "Built-in compliance guardrail via exclusion visibility; audit-ready by default." }
  ],

  impactQuote: { text: "We really needed this. This will help us a lot. This is more than what we could have asked for.", cite: "Finance Manager - Stakeholder" },

  reflection: {
    principle: "Opaque data is the real barrier — surfacing context transforms the experience without changing the underlying data. Cognitive load is a mechanical constraint that can be engineered out, same as physical friction. It's a human behind the screen, not AI.",
    futureTitle: "Future work",
    future: [
      "Move toward predictive / anomaly-flagging insights.",
      "More formal usability A/B testing during the design phase.",
      "Change-management and onboarding documentation for the legacy-tool transition."
    ]
  },

  next: { label: "Sous Chef &mdash; Countertop Cooking Companion", href: "sous-chef-device.html" }
};
