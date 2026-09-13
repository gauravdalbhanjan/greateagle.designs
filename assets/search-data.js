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
      title: 'OPEX Allocation Tool Redesign',
      desc: 'A verification-first dashboard that surfaces all decision-critical context on a single screen.',
      chips: ['94% faster — 9.7 hrs to 33 min', 'Amazon', 'Enterprise'],
      tags: ['opex', 'allocation', 'dashboard', 'finance', 'enterprise', 'amazon', 'verification', 'systems thinking', 'ux', 'product', 'research', 'efficiency', '300b', 'reporting']
    },
    {
      id: 'sous-chef', category: 'work', href: 'home/sous-chef-device.html',
      title: 'Sous Chef — Countertop Cooking Companion',
      desc: 'Track, plan, learn and manage your cooking and health goals step by step.',
      chips: ['72% higher user confidence', 'Eliminated 5x frictions', 'Industrial Design'],
      tags: ['sous chef', 'cooking', 'countertop', 'device', 'industrial design', 'product', 'hardware', 'consumer', 'health', 'ux', 'iot', 'appliance']
    },
    {
      id: 'metrics', category: 'work', href: 'home/executive-metrics.html',
      title: 'Executive Product Metrics Dashboard',
      desc: 'A live executive view that collapses a month of manual reporting into a two-second glance.',
      chips: ['1 month reporting → 2 second live view', 'Amazon', 'Dashboard'],
      tags: ['metrics', 'dashboard', 'executive', 'analytics', 'reporting', 'amazon', 'data', 'visualization', 'kpi', 'product']
    },
    {
      id: 'comment-panel', category: 'work', href: 'home/design-system-comment-panel.html',
      title: 'Unified Comment Panel',
      desc: 'Treating comments as shared infrastructure across the product suite.',
      chips: ['40% faster production', '72+ hrs saved', 'Design System'],
      tags: ['comment', 'panel', 'design system', 'component', 'infrastructure', 'amazon', 'consistency', 'tokens', 'reuse', 'systems thinking', 'ux']
    },
    {
      id: 'bmw', category: 'work', href: 'home/bmw-workspace.html',
      title: 'BMW Workspace Redesign',
      desc: 'A spatial workspace concept exploring how people and vehicles share an environment.',
      chips: ['Spatial Design', 'BMW', 'Concept'],
      tags: ['bmw', 'workspace', 'spatial', 'automotive', 'concept', 'industrial design', 'environment', 'mobility']
    },
    {
      id: 'origami', category: 'work', href: 'home/origami-chair.html',
      title: 'Sustainable Origami Chair',
      desc: 'A flat-pack chair folded from a single sheet to cut material and shipping waste.',
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
    years: '5+'
  };

  var INTENTS = [
    {
      id: 'who',
      keys: ['who', 'about', 'yourself', 'gaurav', 'bio', 'introduce', 'introduction', 'background'],
      title: 'Who is Gaurav?',
      answer: "Gaurav Dalbhanjan is a multidisciplinary product designer and engineer in Seattle, WA. He bridges rigid business logic and human-centered craft — moving from UX research through industrial design to shipping real code. Mechanical Engineering (Pune) + Master's in Industrial Design (SCAD).",
      chips: ['Product Design', 'Industrial Design', 'Engineering', 'Seattle, WA']
    },
    {
      id: 'hire',
      keys: ['hire', 'available', 'freelance', 'work with', 'open', 'job', 'opportunity', 'role', 'recruit'],
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

  /* Return a synthesized answer for a free-text query, or null. */
  function answer(q) {
    var text = ' ' + (q || '').toLowerCase() + ' ';
    if (!text.trim()) return null;
    var best = null, bestScore = 0;
    INTENTS.forEach(function (it) {
      var s = 0;
      it.keys.forEach(function (k) { if (text.indexOf(k) !== -1) s += (k.indexOf(' ') !== -1 ? 2 : 1); });
      if (s > bestScore) { bestScore = s; best = it; }
    });
    return bestScore > 0 ? best : null;
  }

  global.GEDSearch = { query: query, all: all, answer: answer, RECORDS: RECORDS, PROFILE: PROFILE };
})(window);
