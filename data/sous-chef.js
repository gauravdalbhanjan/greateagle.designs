/* Project data: Sous Chef — Countertop Cooking Companion */
window.CASE_STUDY = {
  __file: "sous-chef.js",
  name: "Sous Chef",

  hook: {
    label: "The moment we designed against",
    headline: "\u201CWish I had that ingredient\u201D mid-cook &mdash; versus knowing [[what's cookable before you start]]."
  },

  title: {
    headline: "Sous Chef — Countertop Cooking Companion",
    tags: ["UX Research", "UI", "Product Design", "Industrial Design", "Mechanical Engineering"],
    client: "Personal / team product &mdash; originated 2023, UI/UX fully redesigned 2026, live in production",
    result: "From recipe search to pantry-based selection &mdash; a distraction-free cooking experience, physical device shipped"
  },

  hero: { img: "../assets/sous-chef/hero-shot-product.jpg", alt: "Sous Chef countertop device — hero shot", demo: "https://souschef-hvj5-j04xtbdi3-gauravdalbhanjans-projects.vercel.app" },

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
    portrait: true,
    steps: [
      { title: "Inventory that keeps itself current", body: "The pantry auto-populates from scanned receipts, so you always know what you actually have.", media: { img: "../assets/sous-chef/inventory-tab.jpg", alt: "Inventory tab showing the current pantry" } },
      { title: "A menu ranked by what you can cook now", body: "Meal choices are ranked by % of ingredients on hand, kcal, and time — the decision is made visible.", media: { img: "../assets/sous-chef/menu-tab.jpg", alt: "Menu tab ranking meals by ingredients on hand" } },
      { title: "How the algorithm prioritizes suggestions", body: "Suggestions weigh pantry match, nutrition, and timing so the best next meal surfaces first.", media: { img: "../assets/sous-chef/how-algorithm-prioritizes-suggestions.jpg", alt: "How the suggestion algorithm prioritizes meals" } },
      { title: "Plan the day around a routine", body: "Breakfast, noon, evening — the routine tab plans meals ahead so cooking fits your day.", media: { img: "../assets/sous-chef/routine-tab.jpg", alt: "Routine tab planning meals across the day" } },
      { title: "Cook around your events", body: "The events tab ties meals to what's coming up — parties, guests, or a busy week — so planning matches real life.", media: { img: "../assets/sous-chef/events-tab.jpg", alt: "Events tab tying meals to upcoming events" } }
    ]
  },

  decisions: [
    { title: "Ranked meal choices", body: "Meals ranked by % of available pantry ingredients, cook time, and nutrition &mdash; the decision is made visible, not hidden in a recipe database.", whyNot: "A conventional search box hides the one thing users need most: what they can actually cook right now." },
    { title: "Phone-away step view", body: "Step-by-step task view with tips and voice assist, designed so the phone can be put away &mdash; the physical device replaces the screen.", whyNot: "Keeping everything on the phone reintroduces the exact distraction that spoils dishes." },
    { title: "Physical device housing", body: "Interactive projector, magnetic charging base, and a pop-out stand inclining up to 125\u00B0 &mdash; engineered for counter use, not just screen use.", whyNot: "An app-only product can't survive a wet, cluttered countertop or hands-free cooking." }
  ],

  gallery: [
    { img: "../assets/sous-chef/sous-chef-sketches-and-mood-board.jpg", caption: "Sketches & mood board", wide: true },
    { img: "../assets/sous-chef/sous-chef-storyboard.jpg", caption: "Storyboard" },
    { img: "../assets/sous-chef/sous-chef-orthographic-projection-view.jpg", caption: "Orthographic projection view" },
    { img: "../assets/sous-chef/sous-chef-3D-model_and-technical-drawing.jpg", caption: "3D model & technical drawing" },
    { img: "../assets/sous-chef/physical-product-prototype-making.jpg", caption: "Prototyping the physical device" },
    { img: "../assets/sous-chef/sous-chef-physical-product-prototype-heroshot.jpg", caption: "Physical prototype — hero shot", wide: true },
    { img: "../assets/sous-chef/physical-product-ui.jpg", caption: "Physical product UI" },
    { img: "../assets/sous-chef/physical-product-ui-1.jpg", caption: "On-device interface" },
    { img: "../assets/sous-chef/physical-product-ui-2.jpg", caption: "On-device interface, in use" }
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
