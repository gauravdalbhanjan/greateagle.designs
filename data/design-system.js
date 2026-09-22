/* Project data: Simplified Enterprise Design System (Amazon) */
window.CASE_STUDY = {
  __file: "design-system.js",
  name: "Simplified Enterprise Design System",

  title: {
    headline: "Design Principle > UI Components",
    subtitle: "Simplified Design System",
    client: "Amazon",
    summary: "Across a 4+ product enterprise suite, each team had independently built its own version of the same feature &mdash; comment fields, feedback columns, annotation notes, comment threads &mdash; solving identical needs in inconsistent, costly ways. While migrating components, I traced these variants back to a single underlying intent: [[communication]]. Rather than rebuilding per product, I designed one principle-based, variable-driven comment panel that any product could adopt through configuration instead of custom development, embedding it into a component-first design-system approach. Directly resulting in [[~40% faster production]], [[280+ developer hours saved per project]] across [[4+ projects]], consistent UI, eliminated design-review delays, and a reusable framework for evaluating future feature requests through a component-first lens.",
    tags: ["Systems Thinking", "Research", "System Governance"]
  },

  hero: { img: "../assets/comment-panel/opening-thumbnail-design-system 1.gif", alt: "The unified comment panel in use" },

  metrics: [
    { num: "40%", label: "Faster production across future initiatives" },
    { num: "280+ hrs", label: "Developer hours saved across each of 4+ current projects" },
    { num: "Plug and play", label: "Design review delay eliminated while maintaining consistency" }
  ],

  snapshot: {
    "Role": "Creative Designer &mdash; identified patterns, researched across the product suite",
    "Team": "UX Designer, Senior Designer, Developer, Engineer",
    "Scope": "Presented org-wide; stakeholders spanned the entire enterprise product suite",
    "Status": "Shipped and adopted"
  },

  context: "Across 4+ products, teams needed to give feedback, annotate, request information, and check status. But each product solved it its own way — fragmented, disconnected channels rather than one in-product experience.",

  problem: {
    title: "What was breaking down",
    points: [
      { title: "Trapped commenting", body: "Commenting features were trapped within specific pages, with no cross-context access." },
      { title: "No centralized component", body: "Every product team rebuilt commenting from scratch." },
      { title: "Costly duplication", body: "Duplication caused inconsistent UI, bloated codebases, and wasted budget and hours." },
      { title: "Dozens of versions", body: "Dozens of disparate comment-panel versions were maintained instead of one scalable solution." },
      { title: "No shared principle", body: "Component logic was never traced back to \u201Cwhy are we designing this?\u201D &mdash; it was applied per use case instead of on shared principles." }
    ]
  },

  /* Problem, visualized: the SAME communication need showed up in every
     product wearing a different costume. Three recreated windows make the
     duplication legible, then the reveal collapses them to one intention. */
  problemViz: {
    title: "Why this problem existed",
    lead: "Across 4 products, each required feedback, annotation, information requests, and status checks — but these were handled through fragmented, disconnected channels (text fields, annotation, feedback, text, email) rather than a unified in-product experience.",
    windows: [
      { app: "Project A \u2014 Review page", kind: "field", label: "Comment", placeholder: "Add a comment\u2026" },
      { app: "Project B \u2014 Data workbook", kind: "sheet", column: "Feedback", rows: ["Needs owner", "Check exclusion", "Approved \u2014 see note"] },
      { app: "Project C \u2014 Item detail", kind: "thread", heading: "Comments", items: [ { who: "Priya", text: "Can you confirm the allocation?" }, { who: "Marcus", text: "Updated \u2014 take a look." } ] }
    ],
    revealLabel: "All of it is\u2026",
    revealWord: "Communication",
    revealBody: "Feedback, annotation, comment, remark \u2014 different labels, one purpose. Once the intention is named, it becomes one component, not four rebuilds."
  },

  /* Comment Panel was one of many design-system components I built with the
     team; naming them shows the systems-level contribution. */
  components: {
    title: "One of a system I built with the team",
    lead: "The comment panel is a single component in a broader design system I designed and contributed to across the suite.",
    lead2: "Comment Panel is highlighted; the rest shipped alongside it.",
    highlight: "Comment Panel",
    items: [
      "Comment Panel", "Upload Area", "Feedback & Support", "Menu", "Footnote",
      "Status Indicator", "Table", "Search", "Notification Panel",
      "Side Navigation Panel", "Excel Table", "Warning Pop-up", "Hierarchy Picker"
    ]
  },

  shift: {
    title: "Comments as shared infrastructure",
    insight: "Treat comments as [[shared infrastructure]], rather than a per-product feature. Design decisions need to be principle-based according to use case and application &mdash; not reproduced ad hoc per team.",
    before: "Every team rebuilds a custom comment panel per product instance",
    after: "One principle-based, variable-driven panel adopted across the suite"
  },

  process: {
    title: "How I got there?",
    steps: [
      { title: "Eagle-eye view", body: "Mapped how annotation, feedback, and comment components were implemented uniquely and repetitively across the product ecosystem." },
      { title: "Pattern identification", body: "Spotted the \u201Credundancy pattern\u201D of developers rebuilding custom comment panels for every new product instance." },
      { title: "Invent & simplify", body: "Identified the opportunity to unify the communication panel, along with gaps like missing tooltips and inconsistent modal handling." }
    ]
  },

  walkthrough: {
    title: "A tour of the panel",
    steps: [
      { title: "Access the comment panel", body: "Open the panel in context from any row, without leaving the view.", media: { img: "../assets/comment-panel/how-to-access-comment-panel.gif", alt: "How to access the comment panel" } },
      { title: "Annotate or comment", body: "Attach a comment directly where the conversation belongs.", media: { img: "../assets/comment-panel/how-to-annotate-or-comment.gif", alt: "How to annotate or comment" } },
      { title: "Upload the relevant information asked", body: "Attach files inline to keep the feedback loop fast.", media: { img: "../assets/comment-panel/upload-relevant-information-asked.gif", alt: "Uploading relevant information" } },
      { title: "Delete a comment in-thread", body: "Remove a comment cleanly within the thread.", media: { img: "../assets/comment-panel/how-to-delete-comment.gif", alt: "How to delete a comment" } }
    ]
  },

  decisions: [
    { title: "Developer-ready architecture", body: "Built with Design Tokens and Figma Variables &mdash; Boolean for states, Text for content, Color for themes.", whyNot: "A static graphic would have shipped faster but couldn't be handed to developers as logic. Logic-based components map directly to code." },
    { title: "Responsive adaptation", body: "Breakpoint logic tailored for laptop and tablet professional environments, reflowing without custom overrides.", whyNot: "Per-device custom layouts would reintroduce the exact duplication we were eliminating." },
    { title: "Variable-driven theming", body: "Plug-and-play application that reduces cost through ready-to-use, logic-driven components.", whyNot: "Hardcoded themes per product would keep teams rebuilding; variables make theming a config, not a rebuild." }
  ],

  gallery: [
    { img: "../assets/comment-panel/comment-panel-component-design-guidelines-deliverable.jpg", caption: "Component design guidelines — the comment panel spec handed to developers", wide: true },
    { img: "../assets/comment-panel/comment-panel-tokens-design-guidelines-deliverable.jpg", caption: "Design-token guidelines for variable-driven theming" },
    { img: "../assets/comment-panel/upload-area-component-design-guidelines-deliverable.jpg", caption: "Upload-area component guidelines" },
    { img: "../assets/comment-panel/support-component-design-guidelines-deliverable.jpg", caption: "Support component guidelines" }
  ],

  impact: [
    { segment: "User / Developer", stat: "280+ hrs", body: "Saved per project across 4+ projects; eliminated redundant workload and wait time." },
    { segment: "Business", stat: "40% faster", body: "Production accelerated and design-review delay eliminated." },
    { segment: "Org", stat: "Component-first", body: "Established a component-first, design-system-lens approach for all new feature requests going forward." }
  ],

  reflection: {
    principle: "Divide intention with the principle purpose. \"Feedback, annotation, comment, remark\"/purpose = Communication",
    futureTitle: "Key learnings",
    future: [
      "The designer&ndash;developer relationship in enterprise settings hinges on the design-to-production timeline.",
      "Learned to apply Figma variables and design tokens for efficient developer handoff."
    ]
  },

  next: { label: "BMW Workspace Redesign", href: "bmw-workspace.html" }
};
