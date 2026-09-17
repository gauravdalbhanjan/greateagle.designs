/* Project data: BMW Workspace Redesign (Spatial Design) */
window.CASE_STUDY = {
  __file: "bmw.js",
  name: "BMW Workspace Redesign",

  /* 1. Interactive Hook — the old ITRC interior (before) vs the redesign (after). */
  hook: {
    label: "Case Study > Spatial Design",
    headline: "A dark, \u201Cshop-like,\u201D distracting office employees avoided \u2014 versus a workspace built to pull them back in.",
    interactive: true,
    before: { img: "../assets/BMW/previous-interior-seating-area.png", alt: "The old ITRC office interior \u2014 seating area" },
    after:  { img: "../assets/BMW/bmw-opening-image.jpg", alt: "The redesigned BMW workspace" },
    beforeLabel: "Old interior",
    afterLabel: "Redesigned"
  },

  /* 2. Title Block */
  title: {
    headline: "Transforming BMW's Workspace",
    tags: ["Spatial Design", "Human-Centered Design", "Wayfinding", "Industrial Design", "User Research"],
    client: "BMW"
  },

  /* 3. Hero Media — opens with the animated thumbnail. */
  hero: { img: "../assets/BMW/opening-thumbnail-bmw.gif", alt: "BMW workspace redesign" },

  /* 4. Key Metrics Band.
     NEED FROM USER: quantifiable results (return-to-office rate, satisfaction
     score, budget, square footage, headcount). Omitted rather than invented —
     the qualitative Impact section carries the outcome for now. */

  /* 5. Case Snapshot */
  snapshot: {
    "Role": "UX Designer / Spatial Design Lead",
    "Team": "~20-person cross-disciplinary studio cohort spanning Interactive Design / Game Development, Graphic Design, UX Design, Writing, Themed Entertainment Design, Service Design, Design for Sustainability, Illustration, Interior Design, and Industrial Design",
    "Timeline": "January 2024 &ndash; April 2024",
    "Status": "Currently in active build / delivery &mdash; a real, shipping outcome"
  },

  /* 6. Context */
  context: "The existing BMW workspace failed to foster a productive, engaging environment, leading employees to prefer remote work. Post-COVID, BMW needed to draw people back by making the office genuinely more desirable.",

  /* 7. Problem — real research board, shown as-is (sticky-note artifacts). */
  problem: {
    title: "After visiting the ITRC \u2014 what we found on the ground",
    lead: "Direct notes captured on-site, kept in the team's own words rather than paraphrased.",
    notes: [
      { text: "The windows provide natural light and adjustable blinds for light control.", tone: "keep" },
      { text: "The spaces throughout the office feel dark." },
      { text: "Desks should be adaptable yet personalized." },
      { text: "The space lacks BMW and departmental branding." },
      { text: "Employees lack communal eating spaces." },
      { text: "Uninviting, unsupported coffee area." },
      { text: "Loud AC enables noise isolation but hinders proximate conversation." },
      { text: "There is an overall lack of color in the office space." }
    ],
    gallery: [
      {
        group: "Before &mdash; the old ITRC office",
        items: [
          { img: "../assets/BMW/previous-interior-meeting-area.png", caption: "Old meeting area" },
          { img: "../assets/BMW/previous-interior-seating-area.png", caption: "Old seating area" },
          { img: "../assets/BMW/previous-interior-pathway.png", caption: "Old pathway / circulation" },
          { img: "../assets/BMW/previous-interior-call-room.png", caption: "Old call room" }
        ]
      }
    ]
  },

  /* 8. The Shift (Insight) */
  shift: {
    title: "The office as a machine for collaboration",
    insight: "Grounded in BMW's own brand identity \u2014 [[\u201CThe Ultimate Driving Machine\u201D]] \u2014 reinterpreted spatially: instead of treating the office as a container for desks, treat it as a machine for driving [[collaboration, inspiration, and innovation]]. The physical space itself should actively generate spontaneous interaction, not just house employees.",
    before: "An office that merely contains desks",
    after: "A space engineered to spark spontaneous collaboration"
  },

  /* 9. Process — 3 steps on the left; a scroll-driven photo deck of the
     research / ideation / sketch artifacts stacks on the right. */
  process: {
    title: "How we got there",
    steps: [
      { title: "Journey mapping", body: "Mapped how employees moved through and experienced the existing space \u2014 where energy gathered, where it died." },
      { title: "Research affinitizing", body: "Synthesized stakeholder and customer voices into insight clusters, so patterns rose out of the noise." },
      { title: "Mission definition", body: "Distilled the research into a mission statement that framed every subsequent design decision." }
    ],
    deck: [
      { img: "../assets/BMW/bmw-journey-mapping.jpg", caption: "Journey mapping \u2014 how employees move through the space" },
      { img: "../assets/BMW/bmw-ideation-affinitization-research-to-insights.jpg", caption: "Affinitizing research into insight clusters" },
      { img: "../assets/BMW/bmw-customer-stakeholder-thoughts.jpg", caption: "Customer & stakeholder thoughts, captured verbatim" },
      { img: "../assets/BMW/bmw-brainstorming-with-team.jpg", caption: "Brainstorming with the team" },
      { img: "../assets/BMW/bmw-sketches-and-ideation-innovation-lab.jpg", caption: "Sketching in the innovation lab" },
      { img: "../assets/BMW/bmw-ideation-sketches.jpg", caption: "Concept ideation" },
      { img: "../assets/BMW/bmw-mission-statement.jpg", caption: "The mission statement that framed every decision" }
    ]
  },

  /* 9.5 The Focus Gradient — full-bleed, icon-based, scroll-driven zoning.
     One framing line only; icons + colour shift carry the rest. Each space
     is keyed to a minimal line icon (rendered site-style, accent outline). */
  gradient: {
    framing: "Loud to quiet, by design.",
    beats: [
      {
        spaces: [
          { label: "Innovation lab", icon: "bulb" },
          { label: "Cafeteria", icon: "coffee" },
          { label: "Modular arena", icon: "group" }
        ]
      },
      {
        spaces: [
          { label: "Meeting rooms", icon: "presentation" },
          { label: "Training rooms", icon: "book" }
        ]
      },
      {
        spaces: [
          { label: "Call rooms", icon: "headphones" },
          { label: "Rest spaces", icon: "moon" },
          { label: "Focus desks", icon: "desk" }
        ]
      }
    ]
  },

  /* 10. Solution Walkthrough */
  walkthrough: {
    title: "A tour of the solution",
    steps: [
      { title: "Modular meeting areas and pods", body: "Flexible collaboration zones that reconfigure to the moment.", media: { img: "../assets/BMW/bmw-scaled-model-spatial-prototype2.jpg", alt: "Modular meeting areas and collaboration pods" } },
      { title: "Swing-style window seating", body: "Biophilic, ergonomic seating that pulls people toward natural light.", media: { img: "../assets/BMW/bmw-scaled-model-spatial-prototype3.jpg", alt: "Swing-style window seating with natural light" } },
      { title: "BMW-iconic cafeteria elements", body: "A brand-integrated social and casual space.", media: { img: "../assets/BMW/bmw-scaled-model-spatial-prototype4.jpg", alt: "BMW-iconic cafeteria elements" } },
      { title: "Custom modular furniture", body: "Adaptable to varied work modes across the day.", media: { img: "../assets/BMW/bmw-scaled-model-spatial-prototype1.jpg", alt: "Custom modular furniture" } },
      { title: "Strategic wayfinding & spatial design", body: "Encourages spontaneous conversation and idea-sharing by design, not by accident.", media: { img: "../assets/BMW/strategic-way-finding-spatial-design.jpg", alt: "Strategic wayfinding and spatial design" } }
    ]
  },

  /* 11. Design Decisions — each traceable to a research finding. */
  decisions: [
    {
      title: "Window-adjacent swing seating with natural light",
      body: "Directly addresses \u201Cspaces feel dark\u201D while building on \u201Cwindows provide natural light\u201D \u2014 the layout pulls workspaces toward existing light sources, and takes advantage of the lush greenery just outside that employees already gravitated to at lunch.",
      whyNot: "Fighting the darkness with more artificial lighting would have added cost and ignored the daylight and outdoor view the building already had."
    },
    {
      title: "BMW-iconic cafeteria + communal eating space",
      body: "Resolves both \u201Clacks BMW and departmental branding\u201D and \u201Cemployees lack communal eating spaces\u201D in a single design move.",
      whyNot: "Treating branding and social space as separate problems would have doubled the footprint and diluted both."
    },
    {
      title: "Modular arena space \u2014 cross-team collision by design",
      body: "Built specifically to invite other teams and organizations in, creating a venue for spontaneous cross-team brainstorming instead of confining collaboration to each team's own zone.",
      whyNot: "The obvious move is a self-contained space per team. Instead, a shared modular arena forces different teams to physically overlap, increasing the odds of unplanned idea collisions."
    }
  ],

  /* 12. Gallery — grouped sub-categories (asset-heavy). */
  galleryTitle: "Ideation, floorplans &amp; scaled models",
  gallery: [
    {
      group: "Ideation &amp; Sketches",
      items: [
        { img: "../assets/BMW/bmw-brainstorming-sketches.jpg", caption: "Early brainstorming sketches" },
        { img: "../assets/BMW/bmw-ideation-sketches1.jpg", caption: "Spatial concepts" },
        { img: "../assets/BMW/bmw-ideation-sketches2.jpg", caption: "Layout refinement" },
        { img: "../assets/BMW/bmw-ideation-sketches4.jpg", caption: "Detail exploration" },
        { img: "../assets/BMW/bmw-ideation-floorplan.jpg", caption: "Early floorplan ideation" }
      ]
    },
    {
      group: "Floorplans",
      items: [
        { img: "../assets/BMW/bmw-floorplan.jpg", caption: "Overall workspace floorplan", wide: true },
        { img: "../assets/BMW/bmw-floorplan-cafeteria-space.jpg", caption: "Cafeteria space" },
        { img: "../assets/BMW/bmw-floorplan-guest-visitor-interaction-space.jpg", caption: "Guest / visitor interaction space" }
      ]
    },
    {
      group: "Scaled Spatial Prototypes",
      items: [
        { img: "../assets/BMW/bmw-scaled-model-spatial-prototyping-process.jpg", caption: "The prototyping process \u2014 validating flow and sightlines at human scale" }
      ]
    },
    {
      group: "The Team",
      items: [
        { img: "../assets/BMW/bmw-team-picture.jpg", caption: "The cross-disciplinary team behind the redesign", wide: true }
      ]
    }
  ],

  /* 13. Impact, segmented — status: in delivery. */
  impact: [
    { segment: "User / Employee", stat: "Positive", body: "Positive response from BMW employees to the redesigned space." },
    { segment: "Business", stat: "3 concepts", body: "Three concepts tested, approved, and developed; currently in active build / delivery." },
    { segment: "Org", stat: "In delivery", body: "Increased innovation, productivity, and workplace appeal \u2014 a direct resolution of documented research pain points: branding, communal space, acoustic balance, and color / light." }
  ],

  /* 14. Reflection & Handoff */
  reflection: {
    principle: "The real work wasn't arranging furniture \u2014 it was engineering where people would naturally bump into each other, and where they'd be left alone to think. Noise, light, and distance became design materials as much as any physical object in the room.",
    futureTitle: "Key learnings",
    future: [
      "Matching individual needs and style increases productivity of a company.",
      "Turning documented research pain points directly into a buildable spatial program kept the concept honest all the way into delivery."
    ]
  },

  next: { label: "Origami Chair", href: "origami-chair.html" }
};
