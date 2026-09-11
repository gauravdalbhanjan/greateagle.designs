/* Project data: Sous Chef — Countertop Cooking Companion */
window.CASE_STUDY = {
  __file: "sous-chef.js",
  name: "Sous Chef",

  hook: {
    label: "The moment we designed against",
    headline: "\u201CWish I had that ingredient\u201D mid-cook &mdash; versus knowing [[what's cookable before you start]].",
    interactive: true,
    before: { img: "../images/chef2.gif", alt: "User realizes a missing ingredient midway through cooking" },
    after:  { img: "../images/chef1.gif", alt: "App shows exactly what is cookable from the pantry before starting" },
    beforeLabel: "Missing it midway",
    afterLabel: "Known beforehand"
  },

  title: {
    headline: "Sous Chef — Countertop Cooking Companion",
    tags: ["UX Research", "UI", "Product Design", "Industrial Design", "Mechanical Engineering"],
    client: "Personal / team product &mdash; originated 2023, UI/UX fully redesigned 2026, live in production",
    result: "From recipe search to pantry-based selection &mdash; a distraction-free cooking experience, physical device shipped"
  },

  hero: { img: "../images/chef3.gif", alt: "Sous Chef countertop device", demo: "https://souschef-hvj5-j04xtbdi3-gauravdalbhanjans-projects.vercel.app" },

  metrics: [
    { num: "85%", label: "Successful pantry management" },
    { num: "82%", label: "Success rate using the app" },
    { num: "62%", label: "Higher sense of achievement while cooking" }
  ],

  snapshot: {
    "Role": "Industrial Designer, Mechanical Engineer &mdash; also contributed to product design and UI design",
    "Team": "Industrial Designer, Mechanical Engineer, UX Designer, Graphic Designer",
    "Timeline": "Originated 2023; UI/UX fully redesigned 2026, now live in production",
    "Scope / Tools": "Physical prototyping under real manufacturing constraints, Figma, industrial design tools"
  },

  context: "Target users are millennials, students, and migrants living away from home who don't know how to cook or are still learning &mdash; they get distracted mid-search on their phone and end up spoiling dishes or ordering out instead.",

  problem: {
    title: "What was breaking down?",
    points: [
      { title: "Decision fatigue", body: "The \u201Cwhat should I cook?\u201D dilemma." },
      { title: "Guideline confusion", body: "Complex instructions, cook-books and distracting internet search results." },
      { title: "Ingredient wastage", body: "Forgotten items expiring unused." },
      { title: "Inefficient shopping", body: "Repeat store trips and impulse purchases." },
      { title: "Cooking anxiety", body: "Lack of flexible, adaptive instruction." }
    ],
    quote: { text: "I would love to have this App. Can I get it, please?", cite: "Pilot user" }
  },

  shift: {
    title: "Flip search to select",
    insight: "Instead of searching for a recipe then checking what's on hand, users [[select directly from meals they can already make]] with their current pantry &mdash; removing the \u201Cwish I had that ingredient\u201D moment entirely.",
    before: "Search a recipe, then check the pantry",
    after: "Select from meals the pantry already supports"
  },

  process: {
    title: "Three research directions",
    steps: [
      { title: "Select options over new search", body: "Variety, dietary preference, and one-tap access to recipes." },
      { title: "Distraction-free experience", body: "Tutorials, hands-free guidance, and time-saving." },
      { title: "Pantry support", body: "Reduced impulse buying, a clear \u201Casks\u201D list, and ecosystem monitoring." }
    ]
  },

  walkthrough: {
    title: "How it works?",
    steps: [
      { title: "Scan receipts with the app", body: "The pantry auto-populates from scanned receipts.", media: { img: "../images/budget-planner2.gif", alt: "Scan receipts to populate pantry" } },
      { title: "Select, schedule & plan ahead", body: "Meal choices are ranked by % of ingredients, kcal and time on hand.", media: { img: "../images/chef22.gif", alt: "Select and schedule meals ranked by ingredients on hand" } },
      { title: "Select, follow instructions, enjoy", body: "Step-by-step guidance with voice assist — the phone and notification distraction stays away.", media: { img: "../images/che43.gif", alt: "Follow step-by-step guidance with voice assist" } }
    ]
  },

  decisions: [
    { title: "Ranked meal choices", body: "Meals ranked by % of available pantry ingredients, cook time, and nutrition &mdash; the decision is made visible, not hidden in a recipe database.", whyNot: "A conventional search box hides the one thing users need most: what they can actually cook right now." },
    { title: "Phone-away step view", body: "Step-by-step task view with tips and voice assist, designed so the phone can be put away &mdash; the physical device replaces the screen.", whyNot: "Keeping everything on the phone reintroduces the exact distraction that spoils dishes." },
    { title: "Physical device housing", body: "Interactive projector, magnetic charging base, and a pop-out stand inclining up to 125\u00B0 &mdash; engineered for counter use, not just screen use.", whyNot: "An app-only product can't survive a wet, cluttered countertop or hands-free cooking." }
  ],

  gallery: [
    { img: "../images/chef3.gif", caption: "Countertop device in use", wide: true },
    { img: "../images/chef1.gif", caption: "Pantry-based meal selection" },
    { img: "../images/chef22.gif", caption: "Schedule & plan ahead" },
    { img: "../images/che43.gif", caption: "Step-by-step cooking guidance" }
  ],

  impact: [
    { segment: "User", stat: "62% / 70% / 30%", body: "62% higher sense of achievement, 70% felt more organized and in control, 30% reduction in decision fatigue. Positive pilot reception (25 candidates) with intuitive onboarding." },
    { segment: "Business", stat: "New revenue", body: "Potential new revenue via Alexa / Google Home ecosystem integration + energy, security, home-accessory tracking and monitoring expansion opportunities, and sustainable, ethical packaging." },
    { segment: "Org / Process", stat: "Repeatable framework", body: "Created a repeatable framework and component set for future complex product development &mdash; spanning storyboarding, user journey, engineering, packaging, and graphics." }
  ],

  reflection: {
    principle: "Cooking is nourishment, connection, and comfort &mdash; removing friction (search, distraction, waste) restores the joy of the ritual rather than just optimizing a task.",
    futureTitle: "Future improvements",
    future: [
      "Gesture interaction.",
      "Family and friends collaborative access.",
      "Special tracking access for selected individuals."
    ]
  },

  next: { label: "Unified Comment Panel", href: "design-system-comment-panel.html" }
};
