/* Project data: SousChef Lite — Case Study Copy (Draft v2)
   Layered format: summary always visible, details in expandable panels.
   Source of truth: SousChef project state SC_2026_11_V1 (commit a438f4b).
   Previous version kept at data/sous-chef.legacy.js. */
window.CASE_STUDY = {
  __file: "sous-chef.js",
  name: "SousChef Lite",

  sectionOrder: [
    "title", "hero", "glance", "problem", "principles",
    "features", "architecture", "guardrails", "privacy", "security",
    "decisionsTable", "tradeoffs", "tiers", "everyScreen", "gallery",
    "impact", "reflection"
  ],

  /* 01 · Title + hero */
  title: {
    headline: "SousChef Lite",
    subtitle: "A private, pantry-first cooking companion. You don't sign up, nothing is stored on a server, and it never guesses about food safety.",
    summary: "I took a 2023 countertop-device concept and rebuilt it in 2026 as a live web app. I removed the login system, the cloud database and the AI, and kept what made cooking easier and safer.",
    tags: ["Product Design", "UX/UI", "Front-end Engineering", "Trust & Safety", "Privacy by Design", "Industrial Design"]
  },

  hero: {
    backdrop: { img: "../assets/sous-chef/2026/device-2023-hero.webp", alt: "" },
    screens: [
      { kind: "tablet", img: "../assets/sous-chef/2026/tablet-browse.webp", w: 1536, h: 1152,
        alt: "SousChef Lite on a tablet: the Browse all screen with the left navigation rail, Time, Protein, Category, Cuisine and Allergies filters, and 3,090 recipes ranked by best pantry match" },
      { kind: "phone", img: "../assets/sous-chef/2026/menu-ask.webp", w: 780, h: 1688,
        alt: "SousChef Lite on a phone: the Menu tab with the Ask Sous Chef bar, the request “quick chicken” shown as a removable chip, and matching recipes" }
    ],
    caption: "2026 app in front · the 2023 countertop device behind",
    actions: [
      { label: "Try SousChef Lite", href: "https://souschef.greateagledesigns.com/", primary: true, external: true },
      { label: "Jump to guardrails", href: "#guardrails", icon: "down" }
    ]
  },

  /* 02 · At a glance */
  glance: {
    id: "at-a-glance",
    num: "02",
    title: "At a glance",
    metrics: [
      { num: "3,090", label: "recipes matched to your pantry, on your device" },
      { num: "0", label: "accounts, servers or databases holding your data" },
      { num: "92", label: "automated tests guarding every release" }
    ],
    snapshot: {
      "Role": "Solo designer and engineer in 2026: research, UX, UI, front-end, guardrails, privacy, security and deployment. Industrial designer and mechanical engineer on the 2023 device team.",
      "Timeline": "2023 device concept and pilot (25 participants) → 2026 full rebuild → live as SousChef Lite, SC_2026_11_V1.",
      "Platform": "A responsive web app you can add to your home screen, built for phone, tablet and desktop.",
      "Cost to run": "$0. It's a static site with nothing to host on a server."
    },
    // Stack: the copy leaves this list blank. These are only the technologies
    // the copy itself names elsewhere. Review before publishing.
    stack: ["IndexedDB", "Tesseract OCR", "Wikimedia Commons", "USDA FoodData Central", "GitHub", "Vercel", "AWS Amplify", "Bundled Montserrat"]
  },

  /* 03 · The problem */
  problem: {
    num: "03 · The problem",
    title: "Cooking at home breaks down in six places",
    lead: "**Who for:** Students, young professionals and people living away from home who are still learning to cook.",
    points: [
      { icon: "target", title: "Decision fatigue", body: "“What should I cook?”" },
      { icon: "book", title: "Guideline confusion", body: "Cookbooks, ads and endless search results." },
      { icon: "leaf", title: "Ingredient waste", body: "Forgotten items expire unused." },
      { icon: "cart", title: "Inefficient shopping", body: "Repeat trips and impulse buys." },
      { icon: "moon", title: "Cooking anxiety", body: "Instructions that don't adapt to the cook." },
      { icon: "shield", title: "Trust (new in 2026)", body: "AI and web recipes can be confidently wrong about cooking temperatures, allergens and unsafe methods, and a new cook can't tell." }
    ],
    quote: { text: "I would love to have this App. Can I get it, please?", cite: "2023 pilot user" }
  },

  /* 04 · Principles */
  principles: {
    num: "04 · Principles",
    title: "Three rules that decided everything",
    items: [
      { icon: "hand", title: "Suggest, don't decide.", body: "The app narrows the choices and you make the call. Every filter it reads from your request is shown as a chip you can remove." },
      { icon: "code", title: "Code owns every number.", body: "Temperatures, times, allergens and nutrition come from tested code and cited sources, never from free text." },
      { icon: "lock", title: "Private by default.", body: "No account and no database. Your kitchen stays on your device." }
    ]
  },

  /* 05 · The product */
  features: {
    id: "product",
    num: "05 · The product",
    title: "What SousChef Lite does",
    nav: {
      label: "Navigation",
      items: ["Menu", "Pantry", "Scan", "Routine", "Events"],
      note: "A floating tab bar on phones; a side rail from 900 px."
    },
    screens: [
      { img: "../assets/sous-chef/2026/menu-ask.webp", label: "Menu + Ask Sous Chef",
        alt: "Menu tab: “What are we cooking tonight?” with the request “quick chicken” as a removable chip, Time, Protein and Category filters, and recipe cards with pantry-match badges" },
      { img: "../assets/sous-chef/2026/scan.webp", label: "Scan",
        alt: "Scan screen: “Tell me what you got” with a Snap or Upload Receipt button and a text box to type groceries; email receipts shown as locked" },
      { img: "../assets/sous-chef/2026/pantry.webp", label: "Pantry",
        alt: "Pantry tab: 24 items with 3 running low, category tabs, and Add to cart buttons on low items such as bell pepper, cumin and tomato" },
      { img: "../assets/sous-chef/2026/recipe.webp", label: "Recipe page",
        alt: "Recipe page for Steak and Pepper Stir-Fry: each ingredient with a food icon, amount, in-pantry or staple badge and estimated kcal, protein, carbs and fat, with a Start cooking button" },
      { img: "../assets/sous-chef/2026/cook.webp", label: "Cook mode",
        alt: "Cook mode, step 1 of 7: a step timer, action icon tiles for season and rest, ingredient chips with amounts, and Back and Next step buttons" },
      { img: "../assets/sous-chef/2026/cart.webp", label: "Cart",
        alt: "Shopping cart listing missing items, pantry items to reorder, and a locked “Checkout — Locked” button labelled Available in SousChef Pro · Early signup" }
    ],
    items: [
      { icon: "camera", name: "Scan", summary: "Take a photo of your receipt and the pantry fills itself.",
        details: "The receipt reader runs on your device (about 7 MB, downloaded quietly on first scan). Only camera permission is needed. A rule-based parser cleans the lines, then you confirm each item. Email receipts are locked for Pro." },
      { icon: "box", name: "Pantry", summary: "Know what's running low before you run out.",
        details: "Low-stock warnings are based on quantity: out of stock, 25% or less left, or fewer than 2 meals left. Shelf life is shown for information only." },
      { icon: "sparkle", name: "Menu + Ask Sous Chef", summary: "Ask in plain words: “quick thai, no peanuts”.",
        details: "Rule-based, so it's instant and predictable. Refusals and medical notes are checked first, then filters are read from your text. “Ready to cook” and “Almost there” rows show recipes that use your main protein; scrolling to the end of a row offers “See all recipes”." },
      { icon: "filter", name: "Browse + filters", summary: "All 3,090 recipes, ranked by what you have.",
        details: "Filters: Time (under 10, 20 or 30 min, or 30+), Protein (chicken, meat, seafood, eggs, vegetarian, high protein), Category, Cuisine (90, with counts) and Allergies. Shown 60 at a time." },
      { icon: "recipe", name: "Recipe page", summary: "Know what you have, what you need, and the right temperature.",
        details: "Each ingredient has a food icon, a have/missing badge, the amount, and estimated kcal, protein, carbs and fat. Also: an outline of steps with action icons, a nutrition block, safe temperatures, and text credits." },
      { icon: "flame", name: "Cook mode", summary: "Hands busy, phone away.",
        details: "A prep checklist. Each step shows icon tiles at a glance for actions, tools, heat, timer and doneness. Ingredient chips show amounts. A red note gives the temperature. Step timers and “Meanwhile” cues." },
      { icon: "calendar", name: "Routine & Events", summary: "Plan your day, and the party.",
        details: "Meals are planned across the day and around occasions. Event plans can send missing items to the cart." },
      { icon: "cart", name: "Cart", summary: "A shopping list of what's missing.",
        details: "The cart badge shows “+N” when you add items. Checkout is visibly locked: “Available in SousChef Pro · Early signup”." },
      { icon: "gear", name: "Settings & your data", summary: "Export, import, erase.",
        details: "Export to Excel with readable sheets plus a hidden backup sheet that Import uses; the button shows the file size. Imports are validated all-or-nothing. “Erase everything” asks for confirmation. On wider screens Settings opens as a drawer." },
      { icon: "chat", name: "Feedback", summary: "One tap away on every page.",
        details: "A built-in form with up to 2,000 characters and a 1–5 star rating. It sends no cookies and no referrer." }
    ]
  },

  /* 06 · How it works — interactive architecture diagram.
     Facts only from the case-study copy and the diagram spec. A node's
     `test` line is omitted where no test or source fact exists. */
  architecture: {
    id: "how-it-works",
    num: "06 · How it works",
    title: "No server. The browser does everything.",
    figLabel: "SousChef Lite architecture. Everything runs inside your browser: screens, a local API, guardrails, four engines and on-device storage. Only four small, labelled pieces of data leave the device, to Wikimedia Commons, Open-Meteo, Google Forms and Vercel Analytics. The app ships from GitHub through CI to Vercel and AWS Amplify; the recipe library is built offline. On-device AI and Pro are parked.",
    viewsLabel: "Diagram view",
    views: [
      { id: "flow", label: "Data flow" },
      { id: "leaves", label: "What leaves your device" },
      { id: "ship", label: "How it ships" }
    ],
    legend: [
      { kind: "solid", label: "Solid: runs today" },
      { kind: "dashed", label: "Dashed: parked or future" },
      { kind: "leave", label: "Amber arrow: data leaving the device" },
      { kind: "band", label: "Amber band: guardrails" }
    ],

    device: {
      title: "Your device · browser",
      note: "Nothing inside this line leaves your device unless shown",
      you: { id: "you", icon: "user", name: "You", sub: "guest access",
        what: "Uses SousChef Lite with no account.",
        rule: "“SousChef Lite — Guest access” is the main button; sign-in is locked for Pro.",
        test: "The app asks once a day, not on every reload." },
      youLink: "",
      screens: { id: "screens", icon: "device", name: "Screens",
        chips: ["Menu", "Pantry", "Scan", "Routine", "Events", "Cart", "Settings"],
        what: "Menu · Pantry · Scan · Routine · Events · Cart · Settings. A floating tab bar on phones; a side rail from 900 px.",
        rule: "Suggest, don't decide: every filter read from your request is shown as a chip you can remove." },
      guardrails: { id: "guardrails", icon: "shield", name: "Guardrails", sub: "every result passes through",
        returnLabel: "every result passes through guardrails",
        what: "A layer every result passes through before it reaches a screen.",
        rule: "The app never says “safe.” It gives the official temperature and its source, and leaves the judgement to you.",
        test: "Guardrails, images, steps, filters, exports and deployment are tested before every release (92 tests).",
        items: [
          { id: "g-scope", name: "Scope",
            what: "It only talks about cooking.",
            rule: "Fixed refusal: “I can only help with cooking and recipes. Try different keywords.”",
            test: "Health questions get a fixed medical note. English only." },
          { id: "g-blocked", name: "Blocked methods",
            what: "Some things it won't teach.",
            rule: "Home canning, curing, raw fish, fermented meat or fish, and raw eggs, meat or dough get fixed text.",
            test: "Each comes with an official source." },
          { id: "g-temps", name: "USDA/FDA temps",
            what: "Temperatures come from USDA/FDA, never a guess.",
            rule: "Poultry 165°F · ground meat 160°F · whole cuts 145°F + rest · fish 145°F.",
            test: "Kidney beans, cassava and raw flour are on a must-cook list." },
          { id: "g-allergy", name: "Allergies",
            what: "When in doubt, hide it.",
            rule: "If a recipe's ingredients can't be fully checked, it's hidden.",
            test: "Note shown: “Some recipes are hidden because their ingredients couldn't be fully checked.”" },
          { id: "g-nutrition", name: "Nutrition",
            what: "Estimates, labelled as estimates.",
            rule: "Clear fallbacks: “~0 kcal”, “no USDA data”, “can't be weighed”.",
            test: "Source: a 64-item USDA FoodData Central table." },
          { id: "g-credits", name: "Credits",
            what: "Sources get credit without stealing your attention.",
            rule: "Recipe and photo sources are credited as text only.",
            test: "Only FDA and USDA references link out, labelled “↗ external”." },
          { id: "g-images", name: "Image checks",
            what: "Every photo is checked before it shows.",
            rule: "HTTPS and approved hosts only; no credentials, ports, SVG, data: or javascript: URLs.",
            test: "Commons results showing people, portraits, scans or drawings are rejected; cached results are re-checked." },
          { id: "g-import", name: "Import validation",
            what: "A bad file can't break your data.",
            rule: "Imports are size-limited, accept only known keys and validate every value.",
            test: "Applied all-or-nothing." }
        ] },
      resultsLabel: "results",
      api: { id: "api", icon: "cpu", name: "Local API", sub: "api.js, runs in the browser, no server",
        what: "The app's “API” is a module inside the browser.",
        rule: "No server: there's nothing to breach, scale or pay for.",
        test: "Cost to run: $0. It's a static site." },
      engines: [
        { id: "e-match", icon: "target", name: "Match", sub: "pantry scoring, main protein must be present, ≥60% match",
          what: "Ranks recipes by what's in your pantry.",
          rule: "A suggestion needs at least a 60% match, the main protein and 3 or more main ingredients.",
          test: "Names are reduced the same way on both sides, so “green onions” matches onion but “potato starch” stays its own thing." },
        { id: "e-steps", icon: "stack", name: "Steps", sub: "one action per step, safe temperatures added",
          what: "Turns recipe text into one action per step, without AI.",
          rule: "At build time, multi-action blocks are split and abbreviations expanded; broken recipes are dropped.",
          test: "When a recipe opens, the app adds “You'll need”, “Done when” and the safe temperature." },
        { id: "e-images", icon: "image", name: "Images", sub: "own photo → Commons → illustration",
          what: "Finds a picture for each recipe in three tiers.",
          rule: "The recipe's own photo → a keyless Wikimedia Commons search → a local illustration.",
          test: "Only about 22% of recipes have their own photo." },
        { id: "e-ocr", icon: "camera", name: "Receipt reader", sub: "Tesseract, hosted on this site, ~7 MB on first scan",
          what: "Reads a photo of your receipt on your device.",
          rule: "Only camera permission is needed; a rule-based parser cleans the lines, then you confirm each item.",
          test: "Email receipts are locked for Pro." }
      ],
      pantryLabel: "pantry → Match",
      confirmedLabel: "Receipt reader → confirmed items",
      storage: { id: "storage", icon: "db", name: "IndexedDB “souschef”", sub: "pantry, cart, routines, events, allergies",
        what: "Stores your kitchen in this browser, on this device.",
        rule: "No account and no database server.",
        test: "“Erase everything” asks for confirmation." },
      excel: { id: "excel", icon: "filecheck", name: "Excel export / import",
        what: "Readable sheets plus a hidden backup sheet that Import uses.",
        rule: "Imports are validated all-or-nothing.",
        test: "The export button shows the file size." }
    },

    outside: {
      title: "Outside services",
      tag: "↗ leaves device",
      items: [
        { label: "up to 4 words of a dish name",
          node: { id: "o-commons", icon: "image", name: "Wikimedia Commons",
            what: "Image search for recipes without their own photo.",
            rule: "Receives up to 4 words of a dish name. No API key is needed.",
            test: "Every result is checked before it shows." } },
        { label: "location rounded to ~1 km, only if allowed",
          node: { id: "o-meteo", icon: "map", name: "Open-Meteo",
            what: "Weather.",
            rule: "Location is rounded to about 1 km, and sent only if you allow location." } },
        { label: "feedback or email, only when you submit (no cookies or referrer)",
          node: { id: "o-forms", icon: "doc", name: "Google Forms",
            what: "Receives feedback or an early-signup email.",
            rule: "Sent only when you submit, with no cookies and no referrer.",
            test: "The forms are built into the app, not embedded Google iframes." } },
        { label: "page counts only",
          node: { id: "o-vercel", icon: "gauge", name: "Vercel Analytics",
            what: "Page counts.",
            rule: "Page counts only.",
            test: "Listed on the in-app Privacy page." } }
      ]
    },

    ship: {
      title: "How it ships",
      links: ["", "", "app files (0.93 MB shell)"],
      chain: [
        { id: "s-github", icon: "code", name: "GitHub main",
          what: "Where the app's code lives.",
          rule: "GitHub main deploys automatically to Vercel and AWS Amplify." },
        { id: "s-ci", icon: "check", name: "CI", sub: "lint, 92 tests, header-match test",
          what: "Runs on every push.",
          rule: "One test fails if the two hosts' security headers drift apart.",
          test: "Another fails if the running app can reach the AI code." },
        { id: "s-hosts", icon: "layers", name: "Vercel + AWS Amplify", sub: "same CSP and security headers",
          what: "Two hosts serve the same static files.",
          rule: "Only the app's own scripts can run; no inline scripts and no frames.",
          test: "Plus nosniff, X-Frame-Options DENY, Referrer-Policy and Permissions-Policy." },
        { id: "s-browser", icon: "device", name: "Browser", sub: "your device",
          what: "Receives the app files and runs everything.",
          rule: "Nothing to host on a server." }
      ]
    },

    build: {
      title: "Build time (offline)",
      into: "loaded lazily into Match",
      chain: [
        { id: "b-wikibooks", icon: "book", name: "Wikibooks cache",
          what: "The source of 3,074 of the 3,090 recipes (16 are hand-written).",
          rule: "Recipe1M+, Yummly-28K and RecipeQA were not imported: their licences limit them to research use." },
        { id: "b-build", icon: "code", name: "build-dataset.mjs", sub: "filters, step parser, cuisine tags",
          what: "Builds the recipe library offline.",
          rule: "Drops drinks, alcohol, canning and curing recipes; strips URLs and “safe” claims.",
          test: "Runs the step parser and adds cuisine tags." },
        [
          { id: "b-recipes", icon: "doc", name: "recipes-wikibooks.json", sub: "3,074 recipes, ~1 MB compressed",
            what: "The recipe file.",
            rule: "Loaded lazily: only when you first add groceries or open Browse all." },
          { id: "b-meta", icon: "tag", name: "datasetMeta.json", sub: "count 3,090",
            what: "A tiny metadata file.",
            rule: "Gives the home page the total count without the recipe download." }
        ]
      ]
    },

    parked: {
      title: "Parked / future",
      items: [
        { id: "p-ai", icon: "cpu", name: "On-device AI", sub: "WebLLM, Gemma 3 1B / Qwen2.5 1.5B pinned, never loaded",
          what: "Built, measured, switched off.",
          rule: "About 3 tokens/s meant 2–4 minutes per recipe on a laptop GPU, plus a 600–900 MB download.",
          test: "A test fails if the running app can reach the AI code." },
        { id: "p-pro", icon: "lock", name: "Pro on AWS", sub: "accounts, sync, delivery checkout, email receipts",
          what: "SousChef Pro, early signup.",
          rule: "Locked features show a lock and an early-signup link, never a half-working version.",
          test: "Signups measure demand before anything is built." }
      ]
    },

    flows: [
      "You use the Screens inside the trust boundary.",
      "Requests go from the Screens through Guardrails to the Local API, then to the engines.",
      "Results go back up through the Local API and Guardrails to the Screens: every result passes through guardrails.",
      "IndexedDB gives Match your pantry. The Receipt reader sends confirmed items to IndexedDB.",
      "IndexedDB connects both ways with Excel export and import.",
      "Leaves the device: up to 4 words of a dish name to Wikimedia Commons.",
      "Leaves the device: location rounded to about 1 km to Open-Meteo, only if you allow it.",
      "Leaves the device: feedback or email to Google Forms, only when you submit, with no cookies or referrer.",
      "Leaves the device: page counts to Vercel Analytics.",
      "Shipping: GitHub main, then CI (lint, 92 tests, header-match test), then Vercel and AWS Amplify, then app files (0.93 MB shell) to your browser.",
      "Build time, offline: the Wikibooks cache goes through build-dataset.mjs to recipes-wikibooks.json (3,074 recipes) and datasetMeta.json (count 3,090), loaded lazily into Match.",
      "Parked: on-device AI is never loaded; Pro on AWS is future."
    ],

    summary: "SousChef is a static site. Its “API” is a module inside the browser, and data goes to IndexedDB, so there's nothing to breach, scale or pay for.",
    detailsTitle: "Details",
    details: [
      { title: "Matching", body: "Ingredient names are reduced the same way on both sides, so “green onions” matches onion but “potato starch” stays its own thing. A suggestion needs at least a 60% match, the main protein and 3 or more main ingredients." },
      { title: "Recipes", body: "16 hand-written plus 3,074 from Wikibooks. The recipe file (about 1 MB compressed) loads only when you first add groceries or open Browse all. A tiny metadata file gives the home page the total count without that download." },
      { title: "Steps without AI", body: "At build time, multi-action blocks are split into one action per step, abbreviations are expanded, and broken recipes are dropped. When a recipe is opened, the app adds “You'll need”, “Done when” and the safe temperature." },
      { title: "Images, three tiers", body: "The recipe's own photo → a keyless Wikimedia Commons search → a local illustration." },
      { title: "Hosting", body: "GitHub main deploys automatically to Vercel and AWS Amplify. A test fails if the two hosts' security headers ever differ." }
    ]
  },

  /* 07 · Guardrails */
  guardrails: {
    id: "guardrails",
    num: "07 · Guardrails",
    title: "A cooking assistant that knows its limits",
    items: [
      { icon: "target", title: "Scope", summary: "It only talks about cooking.",
        details: "Fixed refusal: “I can only help with cooking and recipes. Try different keywords.” Health questions get a fixed medical note. Harmful requests, pet food and attempts to slip instructions into a request are refused. English only." },
      { icon: "ban", title: "Blocked methods", summary: "Some things it won't teach.",
        details: "Home canning, curing (including jerky, biltong and dried meat), raw fish, fermented meat or fish, and raw eggs, meat or dough get fixed text plus an official source." },
      { icon: "thermo", title: "Food safety", summary: "Temperatures come from USDA/FDA, never a guess.",
        details: "Poultry 165°F · ground meat 160°F · whole cuts 145°F + rest · fish 145°F, added to the step that finishes each protein. Kidney beans, cassava and raw flour are on a must-cook list. The app never says something is “safe”." },
      { icon: "alert", title: "Allergies", summary: "When in doubt, hide it.",
        details: "If a recipe's ingredients can't be fully checked, it's hidden, with the note: “Some recipes are hidden because their ingredients couldn't be fully checked.”" },
      { icon: "leaf", title: "Nutrition", summary: "Estimates, labelled as estimates.",
        details: "Figures come from a 64-item USDA FoodData Central table. Clear fallbacks: “~0 kcal”, “no USDA data”, “can't be weighed”." },
      { icon: "broom", title: "Clean data", summary: "The recipe library is filtered at build time.",
        details: "Drinks, alcohol, canning and curing recipes are dropped. URLs are stripped, sentences claiming something is “safe” are removed, and recipes whose title protein isn't in the ingredients are cut." },
      { icon: "tag", title: "Credits, not redirects", summary: "Sources get credit without stealing your attention.",
        details: "Recipe and photo sources are credited as text only. Only FDA and USDA references link out, labelled “↗ external”." }
    ],
    callout: { icon: "thermo", text: "The app never says “safe.” It gives the official temperature and its source, and [[leaves the judgement to you]]." }
  },

  /* 08 · Privacy */
  privacy: {
    id: "privacy",
    num: "08 · Privacy",
    title: "Your kitchen never leaves your device",
    cols: 2,
    figure: { img: "../assets/sous-chef/2026/privacy.webp", caption: "The in-app Privacy page",
      alt: "SousChef Privacy page explaining there are no accounts, data is saved in the browser on the device, and a “What leaves your device” list covering app files, page analytics, on-device AI (off in this version), recipe photos and weather" },
    items: [
      { icon: "user", title: "No account", summary: "Guest access is the main button.",
        details: "Sign-in is locked for Pro. The app asks once a day, and “SousChef Lite — Guest access” is the main button. The old Supabase login and database were removed." },
      { icon: "device", title: "Stays on device", summary: "Pantry, receipts, allergies, plans.",
        details: "Everything is stored in IndexedDB on your device. Receipts are read on the device too." },
      { icon: "send", title: "What leaves, exactly", summary: "The Privacy page lists every item.",
        details: "App files · page counts from Vercel · up to 4 words of a dish name sent to Wikimedia Commons · weather, only if you allow location (rounded to about 1 km) · feedback or signup, only when you submit · links you choose to open." },
      { icon: "eyeoff", title: "No trackers sneaking in", summary: "Even the fonts are hosted by the app.",
        details: "Montserrat is bundled, so the app makes no Google Fonts calls. The forms are built into the app, not embedded Google iframes." },
      { icon: "sliders", title: "You're in control", summary: "Export, import, erase.",
        details: "Excel export and import, and “Erase everything” with a confirmation step." }
    ]
  },

  /* 09 · Security */
  security: {
    id: "security",
    num: "09 · Security",
    title: "Secure by construction, not by policy",
    items: [
      { icon: "shield", title: "Locked-down page", summary: "The app can only talk to approved sites.",
        details: "Security policy: only the app's own scripts can run, with no inline scripts. Images and network calls are limited to approved hosts (including docs.google.com for the forms). No frames, plus nosniff, X-Frame-Options DENY, Referrer-Policy and Permissions-Policy." },
      { icon: "image", title: "Safe images", summary: "Every photo is checked before it shows.",
        details: "HTTPS and approved hosts only; no credentials, ports, SVG, data: or javascript: URLs. Each image is decoded, size-checked and timed out. Commons results showing people, portraits, scans or drawings are rejected, and event photos must mention food. Cached results are re-checked." },
      { icon: "filecheck", title: "Safe imports", summary: "A bad file can't break your data.",
        details: "Imports are size-limited, accept only known keys, validate every value, and apply all-or-nothing." },
      { icon: "key", title: "No secrets", summary: "There's nothing to leak.",
        details: "There are no API keys in the app. Image search needs none, and the old server function is no longer used." },
      { icon: "check", title: "Tested every push", summary: "It can't ship broken.",
        details: "92 tests. One fails if the running app can reach the AI code; another fails if the two hosts' security headers drift apart. CI runs on every push." }
    ]
  },

  /* 10 · Decisions */
  decisionsTable: {
    id: "decisions",
    num: "10 · Decisions",
    title: "What I built, then took out",
    lead: "The strongest decisions in this project were the things I removed.",
    callout: {
      label: "Featured decision",
      head: "I built the AI, then turned it off.",
      text: "The model was pinned and guarded, but too slow on real devices. Turning it off made the core job, “what can I cook now?”, instant. The code is kept for Pro."
    },
    cols: ["Was", "Now", "Why"],
    visible: 6,
    rows: [
      ["Supabase login and per-user cloud data", "Data stored only on your device", "Privacy and zero storage cost"],
      ["On-device AI (WebLLM) writing recipes", "Built, measured, switched off", "About 3 tokens/s meant 2–4 minutes per recipe on a laptop GPU, plus a 600–900 MB download"],
      ["AI-generated steps", "Rule-based step parser + temperatures from code", "Instant and predictable, and it can be tested"],
      ["Stock-photo APIs through a server function", "Keyless Commons search, then an illustration", "No keys and no server"],
      ["Links to recipe and photo sites", "Text credits only", "Credit, don't redirect"],
      ["Embedded Google Form iframes", "Forms built into the app", "Consistent design, and the security policy allows no frames"],
      ["Google Fonts", "Bundled Montserrat", "More private, and allowed by the security policy"],
      ["Expiry-based pantry warnings", "Quantity-based warnings", "Matches how people actually run out"],
      ["Login on every reload", "Once per day, with Guest access first", "Less friction"],
      ["JSON export", "Excel (.xlsx)", "Readable by people, not only machines"],
      ["Fixed 648 px column", "Fluid layout: side rail from 900 px, drawer from 768 px", "Works on tablet and desktop"],
      ["Recipe1M+, Yummly-28K, RecipeQA", "Not imported", "Licences limit them to research use"]
    ]
  },

  /* 11 · Trade-offs */
  tradeoffs: {
    id: "trade-offs",
    num: "11 · Trade-offs",
    title: "What this design costs, honestly",
    items: [
      { icon: "device", title: "Device-only", body: "Device-only means strong privacy and $0 cost, but no sync between devices beyond the Excel export." },
      { icon: "sparkle", title: "Rule-based Ask Chef", body: "Rule-based Ask Chef is fast and predictable, but less flexible than AI." },
      { icon: "image", title: "Photos", body: "Only about 22% of recipes have their own photo. The rest use an approximate Commons match or the illustration." },
      { icon: "tag", title: "Cuisine tags", body: "1,353 recipes have none on Wikibooks." },
      { icon: "doc", title: "Forms", body: "The app can't confirm that a submission reached Google." },
      { icon: "wifi", title: "Offline", body: "There's no service worker yet, so offline use depends on the browser cache." }
    ]
  },

  /* 12 · Lite → Pro */
  // The copy's "Business details" block is empty, so it is not rendered yet.
  tiers: {
    id: "lite-pro",
    num: "12 · Lite → Pro",
    title: "Free to cook. Pro when it earns it.",
    lite: {
      name: "SousChef Lite", badge: "Free, non-profit, live",
      items: ["Scan", "Pantry", "Ask Sous Chef", "3,090 recipes", "Recipe pages", "Cook mode", "Routines", "Events", "Cart", "Excel export", "Feedback"]
    },
    pro: {
      name: "SousChef Pro", badge: "Early signup",
      items: ["A personal AI agent", "One-click grocery delivery checkout", "Email receipt scanning", "Accounts and sync across devices"]
    },
    summary: "Locked features show a lock and an early-signup link, never a half-working version. Signups measure demand before anything is built."
  },

  /* 13 · Built for every screen */
  everyScreen: {
    id: "every-screen",
    num: "13 · Built for every screen",
    title: "One app: phone, tablet, desktop",
    figures: [
      { kind: "tablet", img: "../assets/sous-chef/2026/tablet-settings.webp", w: 1536, h: 1152, caption: "Tablet (1024 px): Settings opens as a drawer",
        alt: "SousChef on a 1024 px tablet: the left navigation rail and Menu tab dimmed behind a Settings drawer with Downloads, Your data (Export, Import, Erase everything) and version SC_2026_11_V1 Lite" },
      { kind: "phone", img: "../assets/sous-chef/2026/pantry.webp", w: 780, h: 1688, caption: "Phone: floating tab bar",
        alt: "SousChef Pantry tab on a phone with the floating tab bar at the bottom: Menu, Pantry, Scan, Routine and Events" }
    ],
    points: [
      { icon: "responsive", text: "A floating tab bar below 900 px and a side rail above it. Tab changes slide in from the tab's direction." },
      { icon: "layers", text: "Recipe grids show 3, 4, 5 or 6 columns depending on width." },
      { icon: "touch", text: "Touch targets are at least 48 px. Hover effects appear only with a mouse. Slide animations turn off when “reduce motion” is on." },
      { icon: "home", text: "Home-screen install: a status bar tinted by theme, safe-area spacing, and a fix for the iOS short-screen bug." }
    ]
  },

  /* 14 · Origin (2023) — the existing device gallery */
  galleryId: "origin",
  galleryNum: "14 · Origin (2023)",
  galleryTitle: "Where it started: a countertop device",
  galleryLead: "A team of four designed a countertop cooking companion with an interactive projector, a magnetic charging base and a pop-out stand that tilts up to 125°, built for wet, cluttered counters. It reached a working prototype and was piloted with 25 participants. Its core idea, [[select instead of search]], became the heart of the 2026 app.",
  gallery: [
    { img: "../assets/sous-chef/sous-chef-sketches-and-mood-board.jpg", caption: "Sketches & mood board", wide: true,
      alt: "Hand sketches of the countertop device alongside a kitchen mood board" },
    { img: "../assets/sous-chef/sous-chef-storyboard.jpg", caption: "Storyboard",
      alt: "Storyboard of a cook using the countertop device while preparing a meal" },
    { img: "../assets/sous-chef/sous-chef-orthographic-projection-view.jpg", caption: "Orthographic views",
      alt: "Orthographic projection views of the device: front, side and top" },
    { img: "../assets/sous-chef/sous-chef-3D-model_and-technical-drawing.jpg", caption: "3D model & technical drawing",
      alt: "3D model render of the device with a dimensioned technical drawing" },
    { img: "../assets/sous-chef/physical-product-prototype-making.jpg", caption: "Prototype build",
      alt: "Building the physical prototype of the device by hand" },
    { img: "../assets/sous-chef/sous-chef-physical-product-prototype-heroshot.jpg", caption: "Prototype hero shot", wide: true,
      alt: "Finished physical prototype of the Sous Chef countertop device" },
    { img: "../assets/sous-chef/physical-product-ui.jpg", caption: "Device UI (1 of 3)",
      alt: "The 2023 device's on-screen interface" },
    { img: "../assets/sous-chef/physical-product-ui-1.jpg", caption: "Device UI (2 of 3)",
      alt: "The 2023 device's on-screen interface, second view" },
    { img: "../assets/sous-chef/physical-product-ui-2.jpg", caption: "Device UI (3 of 3)",
      alt: "The 2023 device's on-screen interface in use on a counter" }
  ],

  /* 15 · Impact */
  impactNum: "15",
  impactTitle: "Impact",
  impactCols: 2,
  impact: [
    { icon: "gauge", segment: "Users (2023 pilot, 25 participants)", stat: "85% · 82% · 62%",
      body: "85% managed their pantry successfully, 82% completed tasks, and 62% felt a higher sense of achievement. 70% felt more organized and 30% reported less decision fatigue." },
    { icon: "check", segment: "Trust (2026)", stat: "92 tests",
      body: "Guardrails, images, steps, filters, exports and deployment are tested before every release." },
    { icon: "device", segment: "Product (2026)", stat: "3,090 · $0",
      body: "Live on two hosts with no account, no backend and nothing to run on a server." },
    { icon: "rocket", segment: "Business", stat: "Lite → Pro",
      body: "A free tier is live, and early signups measure demand for Pro." }
  ],

  /* 16 · Reflection */
  reflection: {
    num: "16",
    title: "Reflection",
    principleLabel: "Principle",
    principle: "Cooking is nourishment, connection and comfort. Removing friction from search, distraction and waste brings back the joy, and [[trust is part of that friction]].",
    learnedTitle: "What I learned",
    learned: [
      "My best AI decision was knowing when not to ship it.",
      "Guardrails are UX: a clear refusal with a source earns more trust than a confident guess.",
      "Privacy got easier when I removed things (accounts, a database, server keys) instead of writing policies."
    ],
    futureTitle: "What's next",
    future: [
      "Pro: a personal AI agent, Foundational model, delivery checkout, email receipts, sync.",
      "Offline mode and cuisine tags for the remaining 1,353 recipes.",
      "Better photo coverage.",
      "Gesture control on the countertop device."
    ]
  },

  next: { label: "BMW Workspace Redesign", href: "bmw-workspace.html" }
};
