/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Search dataset + AI-ish query engine
   Honest, real portfolio content only. No invented stats.

   Pattern inspired by archisgore/WineTone: instead of a heavy LLM,
   we tokenize the query, expand it with a small synonym/intent map,
   score every record by weighted token overlap against its tagged
   fields, and surface the best matches as result cards. This gives
   a "understands the question" feel while staying fully offline.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ---- The corpus: every searchable record on the site ---------- */
  /* category drives which overlay column a card renders under.       */
  const RECORDS = [
    /* ---- WORK / PROJECTS ---- */
    {
      id: 'opex', category: 'work', href: 'home/opex-allocation.html',
      img: 'images/budget-planner2.gif',
      title: 'OPEX Allocation Tool Redesign',
      desc: 'No more tab-hopping — every decision on one calm screen.',
      cats: ['SaaS', 'Product', 'FinTech'],
      metric: '94% faster — 9.7 hrs to 33 min',
      chips: ['94% faster — 9.7 hrs to 33 min', 'Amazon', 'Enterprise'],
      tags: ['opex', 'allocation', 'dashboard', 'finance', 'enterprise', 'amazon', 'verification', 'systems thinking', 'ux', 'product', 'research', 'efficiency', '300b', 'reporting']
    },
    {
      id: 'sous-chef', category: 'work', href: 'home/sous-chef-device.html',
      img: 'images/chef1.gif',
      title: 'Sous Chef — Countertop Cooking Companion',
      desc: 'A countertop friend that turns cooking into confidence.',
      cats: ['UI & UX', 'Product', 'Industrial Design'],
      metric: '72% higher user confidence',
      chips: ['72% higher user confidence', 'Eliminated 5x frictions', 'Industrial Design'],
      tags: ['sous chef', 'cooking', 'countertop', 'device', 'industrial design', 'product', 'hardware', 'consumer', 'health', 'ux', 'iot', 'appliance']
    },
    {
      id: 'metrics', category: 'work', href: 'home/executive-metrics.html',
      img: 'assets/thumbnails/opening-thumbnail-dashboard.gif',
      title: 'Executive Product Metrics Dashboard',
      desc: 'Gave leaders a live pulse on the business, not a month-old snapshot.',
      cats: ['UI', 'Dashboard', 'Enterprise'],
      metric: '1 month reporting → 2s live view',
      chips: ['1 month reporting → 2 second live view', 'Amazon', 'Dashboard'],
      tags: ['metrics', 'dashboard', 'executive', 'analytics', 'reporting', 'amazon', 'data', 'visualization', 'kpi', 'product']
    },
    {
      id: 'comment-panel', category: 'work', href: 'home/design-system-comment-panel.html',
      img: 'assets/comment-panel/opening-thumbnail-design-system%201.gif',
      title: 'Unified Comment Panel',
      desc: 'One comment system, shared like infrastructure across the suite.',
      cats: ['UI', 'Design System', 'Enterprise'],
      metric: '40% faster production',
      chips: ['40% faster production', '72+ hrs saved', 'Design System'],
      tags: ['comment', 'panel', 'design system', 'component', 'infrastructure', 'amazon', 'consistency', 'tokens', 'reuse', 'systems thinking', 'ux']
    },
    {
      id: 'bmw', category: 'work', href: 'home/bmw-workspace.html',
      img: 'assets/thumbnails/opening-thumbnail-bmw.gif',
      title: 'BMW Workspace Redesign',
      desc: 'Reimagining how people and vehicles share one living space.',
      cats: ['Spatial', 'Industrial Design'],
      metric: 'Scaled spatial prototype',
      chips: ['Spatial Design', 'BMW', 'Concept'],
      tags: ['bmw', 'workspace', 'spatial', 'automotive', 'concept', 'industrial design', 'environment', 'mobility']
    },
    {
      id: 'origami', category: 'work', href: 'home/origami-chair.html',
      img: 'assets/thumbnails/origami-chair-opening.gif',
      title: 'Sustainable Origami Chair',
      desc: 'A chair that folds flat, treads lighter, and still invites you to sit.',
      cats: ['Industrial Design', 'Sustainability'],
      metric: '65% less carbon footprint',
      chips: ['65% less carbon footprint', 'Industrial Design', 'Sustainability'],
      tags: ['origami', 'chair', 'furniture', 'sustainable', 'sustainability', 'carbon', 'industrial design', 'manufacturing', 'material', 'flat pack']
    },

    /* ---- ABOUT ---- */
    {
      id: 'about-background', category: 'about', title: 'Background',
      desc: "Grew up fascinated with sketching and redesigning everyday objects. Bachelor's in Mechanical Engineering (Savitribai Phule Pune University) and a Master's in Industrial Design (Savannah College of Art and Design).",
      chips: ['Curiosity', 'Adaptable', 'SCAD', 'Design', 'Engineer'],
      tags: ['background', 'education', 'mechanical engineering', 'industrial design', 'scad', 'pune', 'masters', 'bachelors', 'about', 'who', 'history', 'story']
    },
    {
      id: 'about-inhiswords', category: 'about', title: 'In his own words',
      desc: "I've spent years figuring out how to make complicated things feel simple \u2014 physical products, software, and the new space where AI and humans work together. I take something messy and unclear and turn it into something people can use and rely on without thinking twice. I just want the things I build to get out of people's way \u2014 an engineer's brain and a designer's eye.",
      chips: ['Creative @ Amazon', 'Make complexity simple', "Engineer's brain, designer's eye", 'Design Services'],
      tags: ['linkedin', 'summary', 'philosophy', 'approach', 'creative', 'amazon', 'designer', 'simple', 'simplify', 'complexity', 'human', 'ai', 'engineer', 'systems thinking', 'about', 'who', 'values', 'care', 'headline', 'story', 'voice']
    },
    {
      id: 'about-intent', category: 'about', title: 'Intent',
      desc: 'Bridges rigid business logic and human-centered craft to design and engineer products that positively impact human life, shape a sustainable future, and resonate emotionally with users.',
      chips: ['Critical thinking', 'Simplify', 'Vision'],
      tags: ['intent', 'purpose', 'why', 'philosophy', 'human centered', 'sustainable', 'impact', 'vision', 'about', 'values', 'mission']
    },
    {
      id: 'about-twist', category: 'about', title: 'Twist in the tale',
      desc: 'Transitioned from heavy engineering fundamentals — machining, welding, stress-strain — into the emotional, philosophical realm of industrial design, keeping an analytical foundation and a "never give up" mindset.',
      chips: ['Analytical foundation', 'Problem Solving', 'Philosophical'],
      tags: ['twist', 'transition', 'engineering', 'machining', 'welding', 'analytical', 'problem solving', 'about', 'journey', 'philosophy']
    },
    {
      id: 'about-how', category: 'about', title: 'How Gaurav works?',
      desc: 'Operates as a multidisciplinary product designer championing good, ethical, creative, and sustainable design that balances efficiency, safety, and minimalism.',
      chips: ['Multidisciplinary', 'Minimalism', 'Design Principles'],
      tags: ['how', 'works', 'process', 'multidisciplinary', 'minimalism', 'ethical', 'principles', 'method', 'approach', 'about']
    },
    {
      id: 'about-tools', category: 'about', title: 'Tools',
      desc: 'Research to shipping — moving fluidly between design, systems, and code.',
      chips: ['Figma', 'Illustrator', 'Cursor', 'Claude Code', 'Kiro', 'Arduino IDE'],
      tags: ['tools', 'figma', 'illustrator', 'cursor', 'claude', 'kiro', 'codex', 'arduino', 'software', 'stack', 'skills', 'about']
    },
    {
      id: 'about-certs', category: 'about', title: 'Certificates & credentials',
      desc: "Credentials tied to real practice across process, research, design, and engineering: Six Sigma (Green & White Belt), Lextant human-centered research, Amazon Design Inspector & Cognos onboarding, AWS (Cloud Essentials, Cloud First Steps, Intro to AWS, Cloud Computing) and Getting Started with GenAI, plus UX Research (Journey Mapping), Information Architecture, Design Patterns & Principles, Designing Product Interaction, Objectified, Typography & Layout, Project Management (Foundations & Quality), Managing Logistics, Practical GitHub Actions, Excel 365, and Financial Sharing Awareness.",
      chips: ['Six Sigma Green Belt', 'Lextant HCD', 'AWS + GenAI', 'UX Research', 'Design Patterns', 'Project Management', 'GitHub Actions'],
      tags: ['certificates', 'certifications', 'six sigma', 'green belt', 'white belt', 'lextant', 'hcd', 'human centered', 'aws', 'cloud', 'genai', 'generative ai', 'ux research', 'journey mapping', 'information architecture', 'design patterns', 'design principles', 'product interaction', 'objectified', 'typography', 'layout', 'project management', 'quality', 'logistics', 'github actions', 'excel', 'financial', 'credentials', 'qualifications', 'courses', 'learning', 'about', 'skills', 'training']
    },

    /* ---- BLOG ---- */
    {
      id: 'blog-errant-truth', category: 'blog', href: 'home/blog-errant-truth.html',
      title: 'Errant truth is a life-threatening deception',
      desc: 'Search engines increasingly mediate factual inquiry by placing AI-generated summaries above traditional results, presenting them with absolute confidence regardless of underlying accuracy.',
      chips: ['AI-reliability', 'Multidisciplinary Content Synthesis', 'Cross-Disciplinary Translation', 'Structural Adaptation'],
      tags: ['blog', 'errant truth', 'ai', 'reliability', 'search', 'deception', 'accuracy', 'writing', 'thoughts', 'essay', 'perspective', 'trust']
    },

    /* ---- CONTACT ---- */
    {
      id: 'contact-email', category: 'contact', kind: 'line',
      title: 'gaurav.dalbhanjan@gmail.com', href: "https://mail.google.com/mail/?view=cm&fs=1&to=gaurav.dalbhanjan@gmail.com&su=Let's%20talk",
      icon: 'mail',
      tags: ['contact', 'email', 'reach', 'message', 'hire', 'talk', 'connect']
    },
    {
      id: 'contact-phone', category: 'contact', kind: 'line',
      title: '+1 737-328-9917', href: 'tel:+17373289917', icon: 'phone',
      tags: ['contact', 'phone', 'call', 'number', 'reach', 'talk']
    },
    {
      id: 'contact-linkedin', category: 'contact', kind: 'line',
      title: 'LinkedIn', href: 'https://www.linkedin.com/in/gaurav-dalbhanjan/', icon: 'linkedin',
      tags: ['contact', 'linkedin', 'social', 'profile', 'connect', 'network']
    },
    {
      id: 'contact-github', category: 'contact', kind: 'line',
      title: 'GitHub', href: 'https://github.com/gauravdalbhanjan', icon: 'github',
      tags: ['contact', 'github', 'code', 'repo', 'social', 'projects']
    },
    {
      id: 'contact-address', category: 'contact', kind: 'info',
      title: 'Address', desc: '905 Dexter Ave N, Seattle, WA 98109',
      tags: ['contact', 'address', 'location', 'seattle', 'where', 'based']
    },
    {
      id: 'contact-hours', category: 'contact', kind: 'info',
      title: 'Hours', desc: 'Monday–Friday · 8am–6pm',
      tags: ['contact', 'hours', 'availability', 'time', 'when', 'schedule']
    }
  ];

  /* ---- Intent / synonym expansion (the "understanding" layer) ---- */
  const SYNONYMS = {
    project: ['work', 'case study', 'portfolio'],
    projects: ['work', 'case study', 'portfolio'],
    ai: ['ai', 'genai', 'llm', 'artificial intelligence', 'machine learning'],
    hire: ['contact', 'email', 'available', 'work with'],
    resume: ['about', 'background', 'experience', 'cv'],
    cv: ['about', 'background', 'experience', 'resume'],
    experience: ['about', 'background', 'work'],
    contact: ['email', 'phone', 'reach', 'linkedin'],
    reach: ['contact', 'email', 'phone'],
    dashboard: ['dashboard', 'metrics', 'analytics', 'opex'],
    sustainable: ['sustainable', 'sustainability', 'carbon', 'green'],
    tool: ['tools', 'software', 'stack'],
    skill: ['tools', 'skills', 'about'],
    write: ['blog', 'writing', 'essay'],
    blog: ['blog', 'writing', 'thoughts', 'essay'],
    where: ['address', 'location', 'seattle'],
    when: ['hours', 'availability']
  };

  const STOP = new Set(['the','a','an','of','for','to','in','on','and','or','is','are','do','does','how','what','who','your','you','me','with','can','i','about','show','tell','give','find','list']);

  function tokenize(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (t) { return t && !STOP.has(t); });
  }

  function expand(tokens) {
    const out = new Set(tokens);
    tokens.forEach(function (t) {
      (SYNONYMS[t] || []).forEach(function (s) { tokenize(s).forEach(function (x) { out.add(x); }); });
    });
    return Array.from(out);
  }

  /* Score a record against expanded query tokens. */
  function score(record, qtokens) {
    if (!qtokens.length) return 0;
    const hay = (record.title + ' ' + (record.desc || '') + ' ' + record.tags.join(' ') + ' ' + (record.chips || []).join(' ')).toLowerCase();
    const tagset = new Set(record.tags);
    let s = 0;
    qtokens.forEach(function (t) {
      if (tagset.has(t)) s += 3;              // exact tag hit = strong
      else if (hay.indexOf(t) !== -1) s += 1; // substring hit = weak
      if (record.category === t) s += 2;      // category name match
    });
    return s;
  }

  /* Public: run a query. Returns { grouped, best, isEmpty }. */
  function query(q) {
    const qtokens = expand(tokenize(q));
    const scored = RECORDS
      .map(function (r) { return { r: r, s: score(r, qtokens) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });

    const grouped = { work: [], about: [], blog: [], contact: [] };
    scored.forEach(function (x) { grouped[x.r.category].push(x.r); });

    // Which overlay view best answers the question?
    const catScore = { work: 0, about: 0, blog: 0, contact: 0 };
    scored.forEach(function (x) { catScore[x.r.category] += x.s; });
    let best = 'work', bestVal = -1;
    Object.keys(catScore).forEach(function (c) { if (catScore[c] > bestVal) { bestVal = catScore[c]; best = c; } });

    return { grouped: grouped, best: best, isEmpty: scored.length === 0, tokens: qtokens };
  }

  function all(category) {
    return RECORDS.filter(function (r) { return r.category === category; });
  }

  /* ---- AI-ish answer synthesis ---------------------------------- */
  /* A compact "knowledge" layer: intents matched by keywords, each with a
     written answer in Gaurav's voice + chips. This makes the zap search feel
     like it understood the question, using only real, honest info. */
  var PROFILE = {
    name: 'Gaurav Dalbhanjan',
    role: 'Multidisciplinary product designer & engineer',
    location: 'Seattle, WA',
    email: 'gaurav.dalbhanjan@gmail.com',
    years: '5+',
    /* From LinkedIn (assets/LinkedIn-data.csv) — his own words. */
    headline: 'PHIL.IV:XIII | Creative @ Amazon',
    industry: 'Design Services',
    summary: "As a designer I've spent years figuring out how to make complicated things feel simple \u2014 whether that's a physical product, a piece of software, or the strange new space where AI and humans have to work together. What I care about most is taking something messy, serious and unclear and turning it into something someone can actually use and rely on without thinking twice. At the core, I just want the things I build to get out of people's way. I come at this with an engineer's brain and a designer's eye, so I'm as comfortable in the research and the systems thinking as I am delivering the product."
  };

  var INTENTS = [
    {
      id: 'who',
      keys: ['who', 'about', 'yourself', 'gaurav', 'bio', 'introduce', 'introduction', 'background', 'creative', 'designer', 'amazon'],
      title: 'Who is Gaurav?',
      answer: "Gaurav Dalbhanjan is a multidisciplinary product designer and engineer in Seattle, WA \u2014 currently a Creative at Amazon. In his own words: he's spent years figuring out how to make complicated things feel simple, whether that's a physical product, software, or the new space where AI and humans work together. He comes at it with an engineer's brain and a designer's eye, equally at home in research and systems thinking as in shipping the product. Foundation: Mechanical Engineering (Pune) + Master's in Industrial Design (SCAD).",
      chips: ['Creative @ Amazon', 'Product Design', 'Industrial Design', "Engineer's brain, designer's eye", 'Seattle, WA']
    },
    {
      id: 'philosophy',
      keys: ['philosophy', 'approach', 'believe', 'belief', 'care about', 'value', 'values', 'mindset', 'how do you think', 'why design', 'ethos', 'principle', 'principles', 'simple', 'simplify', 'complexity'],
      title: "Gaurav's design philosophy",
      answer: "In his own words: \u201CI just want the things I build to get out of people's way.\u201D He takes something messy, serious and unclear and turns it into something people can actually use and rely on without thinking twice \u2014 making complicated things feel simple across physical products, software, and the emerging space where AI and humans collaborate. An engineer's brain and a designer's eye, so the rigor of research and systems thinking and the craft of delivery come from the same place.",
      chips: ['Make complexity simple', "Get out of people's way", 'Engineer + designer', 'Human-centered']
    },
    {
      id: 'style',
      keys: ['ambiguity', 'ambiguous', 'messy', 'unclear', 'chaos', 'work style', 'how does he work', 'how do you work', 'collaborate', 'collaboration', 'team', 'cross-functional', 'facilitate', 'facilitation', 'decisions', 'decision', 'critical', 'direct'],
      title: 'How Gaurav works through ambiguity',
      answer: "Gaurav is at his best where things are messy and unclear. He resolves ambiguity fast \u2014 running research to find where a workflow actually breaks, then reframing the problem into clear, buildable direction. His decisions are logical and direct, and they trace back to a real user painpoint rather than taste: every choice has a \u201Cwhy this, not the obvious thing\u201D behind it.",
      chips: ['Resolves ambiguity', 'Research-led', 'Painpoint-driven', 'Direct & critical']
    },
    {
      id: 'hire',
      keys: ['hire', 'available', 'freelance', 'work with', 'open', 'job', 'opportunity', 'recruit', 'why you', 'why hire', 'why should'],
      title: 'Is Gaurav available to work?',
      answer: "Yes — Gaurav is open to work. The fastest way to reach him is email; he's based in Seattle, WA and works Monday–Friday, 8am–6pm PT.",
      chips: ['Open to work', 'gaurav.dalbhanjan@gmail.com', 'Seattle, WA']
    },
    {
      id: 'skills',
      keys: ['skill', 'skills', 'tools', 'stack', 'software', 'expertise', 'good at', 'do you know', 'can you'],
      title: "What Gaurav works with",
      answer: "Research to shipping, across mediums: UX research & systems thinking, product & UI design, industrial/mechanical design, and AI-native front-end. Tools: Figma, Illustrator, Cursor, Claude Code, Kiro, Arduino IDE.",
      chips: ['Figma', 'Illustrator', 'Cursor', 'Claude Code', 'Kiro', 'Arduino']
    },
    {
      id: 'impact',
      keys: ['impact', 'results', 'outcome', 'metrics', 'numbers', 'achievements', 'best work', 'proud'],
      title: 'What kind of impact has Gaurav driven?',
      answer: "Measurable outcomes on real products: 94% faster OPEX reviews (9.7 hrs → 33 min), a monthly report cycle collapsed to a 2-second live view, 40% faster production via a unified design system, and 72% higher user confidence on Sous Chef.",
      chips: ['94% faster', '2-sec live view', '40% faster prod', '72% confidence']
    },
    {
      id: 'experience',
      keys: ['experience', 'years', 'worked', 'companies', 'clients', 'where', 'amazon', 'bmw'],
      title: "Gaurav's experience",
      answer: "5+ years across Amazon, BMW, AtmoSpark Technologies, Parkinson Consulting, UNC Charlotte and independent work — spanning enterprise SaaS, consumer hardware, spatial/automotive concepts, and design systems.",
      chips: ['Amazon', 'BMW', 'AtmoSpark', 'Parkinson', 'UNC Charlotte']
    },
    {
      id: 'contact',
      keys: ['contact', 'reach', 'email', 'phone', 'call', 'message', 'linkedin', 'connect', 'talk'],
      title: 'How to reach Gaurav',
      answer: "Email gaurav.dalbhanjan@gmail.com or call +1 737-328-9917. Also on LinkedIn and GitHub. Based in Seattle, WA · Mon–Fri, 8am–6pm PT.",
      chips: ['gaurav.dalbhanjan@gmail.com', '+1 737-328-9917', 'LinkedIn', 'GitHub']
    },
    {
      id: 'education',
      keys: ['education', 'study', 'studied', 'degree', 'college', 'university', 'school', 'scad', 'masters', "master's", 'bachelor', 'academic'],
      title: "Gaurav's education",
      answer: "Bachelor's in Mechanical Engineering (Savitribai Phule Pune University) and a Master's in Industrial Design (Savannah College of Art and Design, SCAD). That mix — hard engineering fundamentals plus design craft — is the backbone of how he works.",
      chips: ['Mechanical Engineering', "Master's — Industrial Design", 'SCAD']
    },
    {
      id: 'certificates',
      keys: ['certificate', 'certificates', 'certification', 'certified', 'course', 'courses', 'credential', 'credentials', 'training', 'qualified', 'qualification', 'learned'],
      title: 'Certificates & credentials',
      answer: "Gaurav's certifications span process, research, design, cloud/AI, and delivery — each backing real work: Six Sigma (Green & White Belt), Lextant human-centered research, Amazon Design Inspector & Cognos, AWS (Cloud Essentials, First Steps, Intro to AWS, Cloud Computing) + Getting Started with GenAI, UX Research (Journey Mapping), Information Architecture, Design Patterns & Principles, Designing Product Interaction, Objectified, Typography & Layout, Project Management (Foundations & Quality), Managing Logistics, Practical GitHub Actions, and Excel 365.",
      chips: ['Six Sigma', 'Lextant HCD', 'AWS + GenAI', 'UX Research', 'Design Patterns', 'Project Mgmt', 'GitHub Actions']
    },
    {
      id: 'sixsigma',
      keys: ['six sigma', 'sigma', 'green belt', 'white belt', 'process', 'quality', 'lean', 'efficiency', 'optimize', 'reengineering', 're-engineering'],
      title: 'Process & quality — Six Sigma',
      answer: "Six Sigma Green Belt (and White Belt) — Gaurav applies DMAIC-style process re-engineering to cut waste and variation. This is the thinking behind measurable wins like a 94% reduction in OPEX review time and a 42% productivity gain from process redesign.",
      chips: ['Six Sigma Green Belt', 'DMAIC', 'Process re-engineering', '42% productivity']
    },
    {
      id: 'research',
      keys: ['research', 'ux research', 'user research', 'journey', 'journey mapping', 'lextant', 'usability', 'interviews', 'human centered', 'hcd', 'discovery'],
      title: 'UX research & human-centered design',
      answer: "Grounded in human-centered research: Lextant methodology and UX Research (Journey Mapping) certifications. Gaurav runs interviews, contextual inquiry, journey mapping, and usability testing to find where a workflow actually breaks — not where people say it does.",
      chips: ['Lextant HCD', 'Journey Mapping', 'Contextual inquiry', 'Usability testing']
    },
    {
      id: 'cloudai',
      keys: ['aws', 'cloud', 'genai', 'generative ai', 'ai native', 'llm', 'machine learning', 'artificial intelligence', 'gpt', 'prototype with ai'],
      title: 'AI-native & cloud foundations',
      answer: "AWS foundations (Cloud Essentials, Cloud First Steps, Introduction to AWS, Cloud Computing Essentials) plus Getting Started with GenAI. Gaurav ships real front-end with AI tooling — Cursor, Claude Code, Kiro — rather than handing off static mockups.",
      chips: ['AWS foundations', 'GenAI', 'Cursor', 'Claude Code', 'Kiro']
    },
    {
      id: 'designcraft',
      keys: ['design patterns', 'design principles', 'interaction', 'product interaction', 'objectified', 'typography', 'layout', 'information architecture', 'ia', 'visual design', 'ui'],
      title: 'Design craft & systems',
      answer: "Formal grounding in design craft: Advanced Design Patterns & Principles, Designing Product Interaction, Streamlining Information Architecture, Typography & Layout, and Objectified — the industrial-design lens on how objects earn their form. It shows up in his design-system and interaction work.",
      chips: ['Design Patterns', 'Product Interaction', 'Information Architecture', 'Typography & Layout']
    },
    {
      id: 'delivery',
      keys: ['project management', 'management', 'delivery', 'logistics', 'github actions', 'ci', 'ci/cd', 'devops', 'excel', 'ship', 'shipping'],
      title: 'Delivery & engineering ops',
      answer: "Beyond design: Project Management (Foundations & Quality), Managing Logistics, Practical GitHub Actions (CI/CD), and Excel 365 — the operational muscle to actually ship and maintain what he designs.",
      chips: ['Project Management', 'Logistics', 'GitHub Actions', 'Excel 365']
    }
  ];

  /* ---- Per-project reasoning (distilled from the case studies) ----
     Each project carries the thought process, not just the outcome: the
     painpoint Gaurav was solving, the reframe/insight, a signature decision
     WITH the "why not the obvious?" reasoning, and the measured impact. This
     is what lets the assistant answer project questions with real context. */
  var PROJECTS = {
    opex: {
      name: 'OPEX Allocation Tool (Amazon)', href: 'home/opex-allocation.html',
      one: 'a verification-first finance dashboard that put every decision-critical number on one screen',
      pain: 'analysts were losing ~9.7 hours per review chasing context across tabs and reconciling numeric IDs by hand',
      insight: 'the real barrier was opaque data, not the layout \u2014 so surface the context instead of asking people to go find it',
      decision: 'he replaced raw numeric IDs with natural-language names right in the table',
      whyNot: 'tooltips on hover were the obvious fix, but that still leaves a lookup step on every single row',
      impact: '94% faster reviews \u2014 9.7 hours down to 33 minutes',
      keys: ['opex', 'allocation', 'finance', 'fintech', 'dashboard', 'amazon', 'verification', 'reporting', 'tabs', 'budget']
    },
    'sous-chef': {
      name: 'Sous Chef', href: 'home/sous-chef-device.html',
      one: 'a countertop cooking companion \u2014 a physical device plus app \u2014 that turns cooking into confidence',
      pain: 'people abandon home cooking because searching recipes then checking the pantry is backwards and full of friction',
      insight: 'flip search into select \u2014 show people the meals they can already make with what they have on hand',
      decision: 'he ranked meals by how much of the recipe the pantry already covers, and moved guidance onto a device so the phone can be put away',
      whyNot: 'a conventional recipe search hides the one thing users actually need: what they can cook right now',
      impact: '72% higher user confidence and 5x fewer frictions in the flow',
      keys: ['sous', 'chef', 'cooking', 'countertop', 'device', 'kitchen', 'pantry', 'recipe', 'hardware', 'consumer', 'health', 'iot']
    },
    'comment-panel': {
      name: 'Unified Comment Panel (Amazon)', href: 'home/design-system-comment-panel.html',
      one: 'a single comment system treated as shared infrastructure across a product suite',
      pain: 'every team was rebuilding comments slightly differently, so behaviour drifted and effort was duplicated',
      insight: 'treat comments as infrastructure, not a feature \u2014 one governed component the whole suite composes',
      decision: 'he designed one tokenized, reusable panel with governed patterns rather than per-team variants',
      whyNot: 'letting each team keep its own version felt faster short-term, but it compounds inconsistency and maintenance cost',
      impact: '40% faster production and 72+ hours saved',
      keys: ['comment', 'panel', 'design system', 'component', 'infrastructure', 'tokens', 'consistency', 'governance', 'reuse', 'enterprise']
    },
    bmw: {
      name: 'BMW Workspace Redesign', href: 'home/bmw-workspace.html',
      one: 'a spatial redesign of BMW\u2019s ITRC office built to pull people back to a place they were avoiding',
      pain: 'the office felt dark and shop-like, so post-COVID employees simply preferred to stay remote',
      insight: 'reframe the office as a machine for collaboration \u2014 space that generates spontaneous interaction, not just holds desks',
      decision: 'he engineered circulation and shared zones around where people would naturally bump into each other, tuned loud-to-quiet',
      whyNot: 'just refreshing furniture and finishes would look nicer but wouldn\u2019t change why nobody wanted to be there',
      impact: 'positive employee response to the redesigned space (in delivery)',
      keys: ['bmw', 'workspace', 'office', 'spatial', 'automotive', 'environment', 'itrc', 'collaboration', 'remote']
    }
  };

  /* ---- Distilled traits (what the people who worked with Gaurav consistently
     observe). We DON'T quote anyone verbatim — instead we hold the *meaning*
     of the recommendation as a trait the assistant can weave into prose, and a
     neutral attribution of who tends to notice it. Honest, candid, no blob. */
  var TRAITS = [
    { meaning: "he pulls signal out of ambiguity fast \u2014 turning a messy, unclear problem into direction a team can actually build against", by: 'the engineering leads he\u2019s worked with at Amazon', tags: ['ambiguity', 'ambiguous', 'messy', 'unclear', 'systems', 'clarity', 'lead', 'manager', 'work with', 'chaos'] },
    { meaning: "he moves comfortably between design intent and how a thing actually gets manufactured, so his ideas survive contact with production", by: 'engineers he\u2019s partnered with', tags: ['engineering', 'engineer', 'dfm', 'manufacturing', 'manufacturability', 'prototype', 'hardware', 'physical', 'product'] },
    { meaning: "he keeps the customer at the centre and balances a clear vision with getting it shipped, rather than choosing one over the other", by: 'the product managers he\u2019s built with', tags: ['strategy', 'strategic', 'product', 'customer', 'vision', 'execution', 'impact', 'business'] },
    { meaning: "he scales design thinking across teams and governs shared patterns so quality holds as more people touch the work", by: 'senior designers on his teams', tags: ['design system', 'systems', 'ux', 'scale', 'governance', 'patterns', 'consistency', 'component', 'reuse'] },
    { meaning: "he\u2019s genuinely curious and adaptable, onboards fast, and leans into a hard challenge instead of away from it", by: 'founders and leads who\u2019ve brought him in', tags: ['curiosity', 'curious', 'adaptable', 'adaptability', 'onboard', 'onboarding', 'initiative', 'versatile', 'learn', 'fast'] }
  ];

  function hit(text, keys) {
    var s = 0;
    keys.forEach(function (k) { if (text.indexOf(k) !== -1) s += (k.indexOf(' ') !== -1 ? 2 : 1); });
    return s;
  }
  /* Distinctive names that should route straight to a project when mentioned. */
  var PROJECT_NAMES = {
    opex: ['opex', 'allocation'],
    'sous-chef': ['sous chef', 'sous-chef', 'countertop', 'cooking companion'],
    'comment-panel': ['comment panel', 'comment-panel', 'unified comment'],
    bmw: ['bmw', 'workspace redesign', 'itrc']
  };
  function namedProject(text) {
    var found = null, sc = 0;
    Object.keys(PROJECT_NAMES).forEach(function (k) {
      var s = hit(text, PROJECT_NAMES[k]);
      if (s > sc) { sc = s; found = k; }
    });
    return sc > 0 ? found : null;
  }
  /* Pick the trait most relevant to the query (meaning, not a quote). */
  function bestTrait(text) {
    var best = null, bestS = 0;
    TRAITS.forEach(function (p) { var s = hit(text, p.tags); if (s > bestS) { bestS = s; best = p; } });
    return best;
  }
  /* Weave a trait's MEANING into a candid sentence (no verbatim quote). */
  function traitSentence(tr) {
    return 'People who\u2019ve worked with him keep noticing the same thing: ' + tr.meaning + '.';
  }
  /* Compose a project-specific answer (thought process → decision → impact). */
  function projectAnswer(pj, key, text) {
    var lead = 'On ' + pj.name + ', ' + pj.one + '.';
    var body = 'The painpoint: ' + pj.pain + '. Gaurav\u2019s read was that ' + pj.insight +
      '. So ' + pj.decision + ' \u2014 not the obvious route, because ' + pj.whyNot +
      '. The result: ' + pj.impact + '.';
    return {
      title: pj.name,
      answer: lead + ' ' + body,
      chips: [pj.impact],
      href: pj.href,
      cards: key ? [key] : []          // project id(s) to render as image cards
    };
  }

  /* Return a synthesized, COMPOSED answer for a free-text query, or null.
     Rather than echoing one fixed paragraph, it understands the query, picks
     the most relevant knowledge (a project, an intent, and — when it fits — a
     real recommendation) and assembles a contextual reply in Gaurav's voice. */
  function answer(q) {
    var text = ' ' + (q || '').toLowerCase() + ' ';
    if (!text.trim()) return null;

    // 0. A distinctive project name (e.g. "opex", "sous chef", "bmw") routes
    //    straight to that project — those questions are unambiguous.
    var named = namedProject(text);

    // 1. Best keyword-scored project (broader, topical match).
    var pjKey = null, pjScore = 0;
    Object.keys(PROJECTS).forEach(function (k) {
      var s = hit(text, PROJECTS[k].keys);
      if (s > pjScore) { pjScore = s; pjKey = k; }
    });

    // 2. Best-matching intent.
    var intent = null, intentScore = 0;
    INTENTS.forEach(function (it) {
      var s = hit(text, it.keys);
      if (s > intentScore) { intentScore = s; intent = it; }
    });

    // Named project always wins; otherwise a topical project wins when it ties
    // or beats the generic intent.
    var routeProject = named || ((pjKey && pjScore >= 2 && pjScore >= intentScore) ? pjKey : null);
    if (routeProject) {
      var pa = projectAnswer(PROJECTS[routeProject], routeProject, text);
      var tr = bestTrait(text);
      if (tr) { pa.answer += ' ' + traitSentence(tr); }
      return pa;
    }

    if (!intent) {
      // Nothing matched an intent or project — but if a project loosely matched,
      // still answer from it so the reply stays specific rather than empty.
      if (pjKey && pjScore > 0) return projectAnswer(PROJECTS[pjKey], pjKey, text);
      return null;
    }

    // 3. Compose around the intent. Start from its written answer, then, when
    //    relevant, ground it in a concrete decision and weave in the MEANING of
    //    what colleagues observe (never a verbatim quote), and attach the most
    //    relevant project as an image card.
    var out = { title: intent.title, answer: intent.answer, chips: intent.chips.slice(), cards: [] };

    // "who / philosophy / how he thinks / works" → ground in a signature
    // decision, then weave in the distilled trait meaning.
    if (intent.id === 'who' || intent.id === 'philosophy' || intent.id === 'research' || intent.id === 'style') {
      var exKey = pjKey && pjScore > 0 ? pjKey : 'opex';
      var ex = PROJECTS[exKey];
      out.answer += ' You can see it in the work: on ' + ex.name + ', ' + ex.decision +
        ' \u2014 because ' + ex.whyNot + '.';
      var tr2 = bestTrait(text) || TRAITS[0];
      out.answer += ' ' + traitSentence(tr2);
      out.cards = [exKey];
    }
    // Impact / experience → point at the specific project + show its card.
    else if ((intent.id === 'impact' || intent.id === 'experience') && pjKey && pjScore > 0) {
      var ex2 = PROJECTS[pjKey];
      out.answer += ' Take ' + ex2.name + ': ' + ex2.pain + ', and the result was ' + ex2.impact + '.';
      out.href = ex2.href;
      out.cards = [pjKey];
    }
    // Impact with no specific project → show the top outcome projects as cards.
    else if (intent.id === 'impact') {
      out.cards = ['opex', 'comment-panel', 'sous-chef'];
    }
    // Skills / hire → weave in the distilled meaning of what people observe.
    else if (intent.id === 'skills' || intent.id === 'hire') {
      var tr3 = bestTrait(text) || TRAITS[2];
      out.answer += ' ' + traitSentence(tr3);
    }

    return out;
  }

  global.GEDSearch = { query: query, all: all, answer: answer, RECORDS: RECORDS, PROFILE: PROFILE, PROJECTS: PROJECTS, TRAITS: TRAITS };
})(window);
