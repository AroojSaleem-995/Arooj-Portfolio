"use client";
import emailjs from "@emailjs/browser";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type PanInfo,
} from "motion/react";

/* =====================================================================
   Small components (kept in this file so only page.tsx needs editing)
   ===================================================================== */

type Internship = {
  role: string;
  company: string;
  dates: string;
  location: string;
  status: string;
  summary: string;
  domain: string;
  points?: string[];
};

const AUTOPLAY_MS = 3000;

/* ---------- Internship cards: a fanned deck ---------- */

function InternshipStack({ items }: { items: Internship[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const count = items.length;
  const paused = hovering || userPaused || !!reduceMotion;

  // Restarts whenever the active card changes, so the timer and the
  // progress line always stay in sync.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(
      () => setActive((c) => (c + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, count]);

  const next = () => setActive((c) => (c + 1) % count);
  const prev = () => setActive((c) => (c - 1 + count) % count);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80 || info.velocity.x < -500) next();
    else if (info.offset.x > 80 || info.velocity.x > 500) prev();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }

  // The cards behind the front one fan out left and right,
  // and open a little wider while the mouse is over the deck.
  const fanAngle = hovering ? 10 : 6;
  const fanShift = hovering ? 30 : 14;

  return (
    <div
      className="internship-deck"
      role="region"
      aria-roledescription="carousel"
      aria-label="Internship experience"
      onKeyDown={handleKeyDown}
    >
      <div
        className="internship-stack"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={() => setHovering(false)}
      >
        {items.map((item, i) => {
          const offset = (i - active + count) % count;
          const isFront = offset === 0;
          // 1st card behind leans right, 2nd leans left
          const side = offset % 2 === 1 ? 1 : -1;

          return (
            <motion.article
              key={item.company}
              className={`internship-slide stack-card ${
                isFront ? "stack-card-front" : "stack-card-behind"
              } ${offset === 1 ? "stack-card-b1" : ""} ${
                offset === 2 ? "stack-card-b2" : ""
              }`}
              style={{ zIndex: count - offset }}
              animate={{
                rotate: isFront ? 0 : side * fanAngle,
                x: isFront ? 0 : side * fanShift,
                y: isFront ? 0 : 8,
                opacity: offset > 2 ? 0 : 1,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 240, damping: 24 }
              }
              drag={isFront ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={isFront ? handleDragEnd : undefined}
              aria-hidden={!isFront}
            >
              <div className="internship-slide-top">
                <span className="internship-count">
                  0{i + 1} / 0{count}
                </span>
                <span
                  className={`status-pill ${
                    item.status === "Current" ? "status-current" : ""
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="card-kicker internship-domain">{item.domain}</p>
              <h3>{item.role}</h3>
              <p className="internship-company">{item.company}</p>
              <p className="internship-summary">{item.summary}</p>

              {item.points && (
                <ul className="experience-list-items">
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}

              <div className="internship-meta">
                <span>◷ {item.dates}</span>
                <span>⌖ {item.location}</span>
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="stack-controls">
        <button
          type="button"
          className="carousel-arrow"
          onClick={prev}
          aria-label="Previous internship"
        >
          ←
        </button>

        <div className="carousel-dots">
          {items.map((item, i) => (
            <button
              key={item.company}
              type="button"
              className={`carousel-dot ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Show ${item.company} internship`}
              aria-current={active === i ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="carousel-arrow"
          onClick={next}
          aria-label="Next internship"
        >
          →
        </button>

        {!reduceMotion && (
          <button
            type="button"
            className="stack-playpause"
            onClick={() => setUserPaused((p) => !p)}
            aria-pressed={userPaused}
          >
            {userPaused ? "Play" : "Pause"}
          </button>
        )}
      </div>

      <div className="stack-progress-track" aria-hidden="true">
        {!paused && (
          <span
            key={active}
            className="stack-progress"
            style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Thin progress bar at the top while scrolling ---------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

/* ---------- Number that counts up when it scrolls into view ---------- */

function CountUp({ to, decimals = 2 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current || reduce) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = v.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, reduce]);

  return <strong ref={ref}>{to.toFixed(decimals)}</strong>;
}

/* ---------- Which section is on screen? (highlights the navbar link) ---------- */

const SECTION_IDS = [
  "home",
  "about",
  "education",
  "experience",
  "projects",
  "skills",
  "interests",
  "contact",
];

function useActiveSection() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const elements = SECTION_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    // A section counts as "current" while it crosses the middle of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

/* =====================================================================
   Content  (edit your text here)
   ===================================================================== */

const email = "aroojsaleem995@gmail.com";
const linkedin = "https://www.linkedin.com/in/arooj-saleem/";
const github = "https://github.com/AroojSaleem-995";

const navItems = [
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const projects = [
  {
    number: "01",
    category: "AI / MACHINE LEARNING",
    title: "Smart Product Tracker",
    description:
      "A product recommendation and price-tracking project combining semantic similarity with product attributes to help users compare relevant products.",
    tags: [
      "Sentence-BERT",
      "FastAPI",
      "Cosine Similarity",
      "Hybrid Scoring",
      "WebSockets",
    ],
    link: "https://github.com/AroojSaleem-995/smart-product-tracker",
  },
  {
    number: "02",
    category: "PREDICTIVE ANALYTICS",
    title: "Employee Job Change Prediction",
    description:
      "A machine learning project exploring employee job-change prediction with data preprocessing, class balancing, dimensionality reduction, and model comparison.",
    tags: ["Python", "Pandas", "SMOTE", "PCA", "Scikit-learn"],
    link: "https://github.com/AroojSaleem-995/data-preprocessing-using-python",
  },
  {
    number: "03",
    category: "GENERATIVE AI",
    title: "RAG AI Project",
    description:
      "A retrieval-augmented generation project exploring how retrieved context can support more relevant AI-generated responses.",
    tags: ["RAG", "Qdrant", "Ollama", "LLM Integration", "Streamlit"],
    link: "https://github.com/AroojSaleem-995/RAG_AI",
  },
  {
    number: "04",
    category: "SOFTWARE ENGINEERING",
    title: "Travel Planner Service",
    description:
      "A software engineering project focused on organizing travel-planning functionality into a service-based application.",
    tags: ["Python", "Backend Development", "Service-Based Architecture"],
    link: "https://github.com/AroojSaleem-995/travel-planner-service",
  },
];

// Same skills as before, regrouped into tabs so the section stays short.
// Remove any skill you cannot back up with a project or internship.
const skillGroups = [
  {
    id: "ml",
    title: "AI & Machine Learning",
    items: [
      "Scikit-learn",
      "Machine Learning",
      "Deep Learning",
      "Predictive Modeling",
      "Model Evaluation",
      "Hyperparameter Tuning",
      "Semantic Similarity",
      "TF-IDF",
    ],
  },
  {
    id: "genai",
    title: "Generative AI & RAG",
    items: [
      "RAG Systems",
      "LangChain",
      "OpenAI API",
      "Sentence Transformers",
      "Text Embeddings",
      "Vector Databases",
    ],
  },
  {
    id: "data",
    title: "Languages & Data",
    items: [
      "Python",
      "C++",
      "Java",
      "JavaScript",
      "SQL",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Data Preprocessing",
      "Feature Engineering",
    ],
  },
  {
    id: "backend",
    title: "Backend & Databases",
    items: [
      "FastAPI",
      "Flask",
      "Node.js",
      "Express.js",
      "REST APIs",
      "MySQL",
      "SQL Server",
      "DuckDB",
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    items: ["React Native", "HTML", "CSS", "Tailwind CSS", "Streamlit"],
  },
  {
    id: "cloud",
    title: "Cloud, Tools & Embedded",
    items: ["Git", "GitHub", "AWS EC2", "AWS S3", "MQTT", "ESP32 Firmware"],
  },
];

const certificates = [
  {
    name: "Google AI Essentials",
    provider: "Google · Coursera",
    detail: "Foundational AI concepts and practical AI use.",
    link: "https://coursera.org/share/22ff6c1d60ed64329a12bc829c965e46",
  },
  {
    name: "Google Prompting Essentials",
    provider: "Google · Coursera",
    detail: "Writing and improving prompts for useful AI outputs.",
    link: "https://coursera.org/share/806f42a5307efca9bbc19feb45bdb453",
  },
];

// Add a `points` array to any internship to show bullet points on its card, e.g.
// points: ["What you built", "What changed because of it"],
const internships: Internship[] = [
  {
    role: "Artificial Intelligence Intern",
    company: "Neuron Technologies",
    dates: "Aug 2026 – Present",
    location: "Remote",
    status: "Current",
    domain: "Robotics & Applied AI",
    summary: "AI-powered food delivery robot development.",
  },
  {
    role: "Machine Learning Engineering Intern",
    company: "FlyRank AI",
    dates: "Jul 2026 – Sep 2026",
    location: "Remote",
    status: "Completed",
    domain: "Machine Learning & Search Analytics",
    summary: "Machine learning, data analysis, and search discoverability.",
  },
  {
    role: "C++ Programming Intern",
    company: "CodeAlpha",
    dates: "1 May – 30 May 2025",
    location: "Remote",
    status: "Completed",
    domain: "Software Development",
    summary: "C++ programming, algorithms, and object-oriented development.",
  },
];

const interests = [
  {
    title: "Community Work",
    text: "Community involvement at Al-Mustafa Trust Hospital, Rawalpindi.",
  },
  {
    title: "Baking",
    text: "Enjoying creativity and experimenting with baking.",
  },
  {
    title: "Photography",
    text: "Capturing moments and noticing details through photography.",
  },
  {
    title: "Creative Design",
    text: "Exploring visual ideas and thoughtful design.",
  },
];

/* =====================================================================
   Motion variants
   MotionConfig (in Home) switches off movement for visitors who prefer
   reduced motion, so no manual checks are needed here.
   ===================================================================== */

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const tagList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const tagPop = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

// Makes the soft glow on a project card follow the cursor
function trackGlow(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

/* ---------- Skills: category tabs + chips ---------- */

function SkillsTabs() {
  const [activeId, setActiveId] = useState(skillGroups[0].id);
  const group = skillGroups.find((g) => g.id === activeId) ?? skillGroups[0];

  // Left / right arrow keys move between tabs
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % skillGroups.length;
    else if (e.key === "ArrowLeft")
      nextIndex = (index - 1 + skillGroups.length) % skillGroups.length;
    else return;

    e.preventDefault();
    const nextId = skillGroups[nextIndex].id;
    setActiveId(nextId);
    document.getElementById(`skill-tab-${nextId}`)?.focus();
  }

  return (
    <div className="skills-tabs">
      <div className="skills-tablist" role="tablist" aria-label="Skill groups">
        {skillGroups.map((g, index) => (
          <button
            key={g.id}
            id={`skill-tab-${g.id}`}
            type="button"
            role="tab"
            aria-selected={g.id === activeId}
            aria-controls="skill-panel"
            tabIndex={g.id === activeId ? 0 : -1}
            className={`skill-tab ${g.id === activeId ? "active" : ""}`}
            onClick={() => setActiveId(g.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div
        className="skill-panel"
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${activeId}`}
      >
        <motion.div
          key={activeId}
          className="skill-chips"
          variants={tagList}
          initial="hidden"
          animate="visible"
        >
          {group.items.map((item) => (
            <motion.span className="skill-chip" key={item} variants={tagPop}>
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => {
      setStatus("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [status]);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSending) return;
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus("Email settings are missing. Please try again later.");
      return;
    }

    setIsSending(true);
    setStatus("");

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          user_name: name.trim(),
          user_email: senderEmail.trim(),
          message: message.trim(),
        },
        { publicKey },
      );

      setStatus("Message sent successfully! Thank you for reaching out.");
      setName("");
      setSenderEmail("");
      setMessage("");
    } catch (error) {
      console.error("EmailJS send error:", error);
      setStatus("Sorry, your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field">
        <label htmlFor="contact-name">Your name *</label>
        <input
          id="contact-name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSending}
        />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-email">Your email</label>
        <input
          id="contact-email"
          type="email"
          placeholder="you@example.com"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          disabled={isSending}
        />
      </div>

      <div className="contact-field">
        <label htmlFor="contact-message">Your message *</label>
        <textarea
          id="contact-message"
          placeholder="Write your message here..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={isSending}
        />
      </div>

      <div className="contact-form-actions">
        <button
          type="submit"
          className="button button-primary"
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Send message ↗"}
        </button>
      </div>

      {status && (
        <p
          className="contact-form-note"
          role="status"
          aria-live="polite"
          data-status={
            status.startsWith("Message sent successfully") ? "success" : "error"
          }
        >
          {status}
        </p>
      )}

      <p className="contact-form-note">I usually reply within 1–2 days.</p>
    </form>
  );
}

const edu: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: 20,
    alignItems: "stretch",
  },
  card: {
    padding: 28,
    border: "1px solid #c9d4c0",
    borderRadius: 24,
    background: "#e5ebdf",
    boxShadow: "0 16px 38px rgba(45, 64, 47, 0.12)",
  },
  title: {
    margin: "0 0 0",
    fontFamily: '"Manrope", sans-serif',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.035em",
    lineHeight: 1.35,
  },
  school: {
    margin: "6px 0 0",
    color: "var(--deep-green)",
    fontSize: 14,
    fontWeight: 600,
  },
  meta: { margin: "2px 0 0", color: "var(--muted)", fontSize: 13 },
  text: {
    margin: "14px 0 0",
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.75,
  },
  cgpa: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 18,
    padding: "10px 16px",
    border: "1px solid #d6dcd0",
    borderRadius: 12,
    background: "var(--white)",
    color: "var(--deep-green)",
  },
  cgpaLabel: { fontSize: 11, fontWeight: 800, letterSpacing: "0.13em" },
  cgpaNumber: {
    fontFamily: '"Manrope", sans-serif',
    fontSize: 26,
    lineHeight: 1,
  },
  list: {
    display: "grid",
    gap: 12,
    margin: "14px 0 0",
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    border: "1px solid #d6dcd0",
    borderRadius: 14,
    background: "var(--white)",
  },
  rowTitle: {
    margin: 0,
    fontFamily: '"Manrope", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.4,
  },
  rowText: {
    margin: "2px 0 0",
    color: "var(--muted)",
    fontSize: 12,
    lineHeight: 1.5,
  },
  link: { color: "var(--forest)", fontSize: 12, fontWeight: 800 },
};
/* =====================================================================
   Page
   ===================================================================== */

export default function Home() {
  const activeSection = useActiveSection();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />

      <header className="navbar">
        <a className="brand" href="#home" aria-label="Arooj Saleem home">
          <span className="brand-mark">AS</span>
          <span className="brand-name">Arooj Saleem</span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "is-active" : undefined}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero section-shell" id="home">
          <div className="hero-layout">
            <motion.div
              className="hero-avatar"
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 0.7 },
                x: { duration: 0.7 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div className="avatar-frame">
                <Image
                  src="/avatar.png"
                  alt="Arooj Saleem"
                  width={420}
                  height={560}
                  priority
                  className="avatar-image"
                />
              </div>
              <span className="avatar-decoration" aria-hidden="true" />
            </motion.div>

            <motion.div
              className="hero-content"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <p className="hero-availability">
                Open to AI/ML internships · Remote or hybrid
              </p>

              <p className="eyebrow">
                SOFTWARE ENGINEERING STUDENT · AI INTERN AT NEURON TECHNOLOGIES
              </p>
              <h1>
                Hi, I’m <span>Arooj Saleem.</span>
              </h1>

              <p className="hero-description">
                I build practical, data-driven AI and machine learning
                solutions, from recommendation systems to RAG pipelines, and I
                enjoy turning real problems into working software.
              </p>

              <div className="hero-actions">
                <a href="#projects" className="button button-primary">
                  Explore My Projects <span aria-hidden="true">↗</span>
                </a>

                <a
                  href="/resume.pdf"
                  className="button button-outline"
                  download
                >
                  Download CV <span aria-hidden="true">↓</span>
                </a>
              </div>

              <div className="hero-links">
                <a href={github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href={linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About */}
        <motion.section
          className="section section-tinted"
          id="about"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-shell about-grid">
            <div>
              <p className="eyebrow">A LITTLE ABOUT ME</p>
              <h2>Curious about how intelligence can solve real problems.</h2>

              <ul className="about-facts">
                <li>
                  <strong>3.60</strong>
                  <span>CGPA</span>
                </li>
                <li>
                  <strong>{internships.length}</strong>
                  <span>Internships</span>
                </li>
                <li>
                  <strong>{projects.length}</strong>
                  <span>Projects</span>
                </li>
              </ul>
            </div>

            <div className="about-copy">
              <p>
                I’m pursuing a BS in Software Engineering at Fatima Jinnah Women
                University with a growing focus on Artificial Intelligence and
                Deep Learning. Through academic projects and internships, I’ve
                worked on predictive modeling, recommendation systems, and
                practical ML workflows.
              </p>
              <p>
                I’m actively seeking AI/ML internships and entry-level roles,
                remote, hybrid, or suitable on-site, where I can contribute to
                real projects and learn from experienced teams.
              </p>

              <a
                className="text-link"
                href={linkedin}
                target="_blank"
                rel="noreferrer"
              >
                Connect on LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </motion.section>

        {/* Education & Certifications */}
        <motion.section
          className="section"
          id="education"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-shell">
            <div className="section-heading">
              <p className="eyebrow">MY BACKGROUND</p>
              <h2>Education & Certifications</h2>
              <p className="section-intro">
                My academic foundation and continued learning in AI and Machine
                Learning.
              </p>
            </div>

            <div style={edu.grid}>
              <article style={edu.card}>
                <p className="card-kicker">EDUCATION</p>
                <h3 style={edu.title}>BS Software Engineering</h3>
                <p style={edu.school}>
                  Fatima Jinnah Women University, Rawalpindi
                </p>
                <p style={edu.meta}>Expected graduation: 2027</p>
                <p style={edu.text}>
                  Building a foundation in software engineering and computer
                  science, with a focus on AI and Machine Learning.
                </p>

                <div style={edu.cgpa}>
                  <span style={edu.cgpaLabel}>CGPA</span>
                  <span style={edu.cgpaNumber}>
                    <CountUp to={3.6} />
                  </span>
                  <small style={{ fontSize: 12 }}>/ 4.00</small>
                </div>
              </article>

              <article style={edu.card}>
                <p className="card-kicker">CERTIFICATIONS</p>

                <ul style={edu.list}>
                  {certificates.map((c) => (
                    <li style={edu.row} key={c.name}>
                      <div>
                        <h3 style={edu.rowTitle}>{c.name}</h3>
                        <p style={edu.rowText}>{c.provider}</p>
                        <p style={edu.rowText}>{c.detail}</p>
                      </div>
                      <a
                        style={edu.link}
                        href={c.link}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${c.name} certificate`}
                      >
                        View ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section
          className="section section-tinted"
          id="experience"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="section-shell experience-layout">
            <div className="section-heading">
              <p className="eyebrow">EXPERIENCE</p>
              <h2>My internship journey.</h2>
              <p className="section-intro">
                Learning, building, and growing through practical experience.
              </p>
            </div>

            <InternshipStack items={internships} />
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section
          className="section"
          id="projects"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="section-shell">
            <div className="section-heading">
              <p className="eyebrow">SELECTED PROJECTS</p>
              <h2>Learning by building.</h2>
              <p className="section-intro">
                A selection of projects exploring AI, machine learning, and
                software engineering.
              </p>
            </div>

            <motion.div className="project-grid" variants={stagger}>
              {projects.map((project) => (
                <motion.article
                  className="project-card"
                  key={project.number}
                  variants={reveal}
                  whileHover={{ y: -7 }}
                  transition={{ duration: 0.25 }}
                  onMouseMove={trackGlow}
                >
                  <div className="project-card-top">
                    <span className="project-number">{project.number}</span>
                    <span className="project-category">{project.category}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>

                  <div className="tag-list">
                    {project.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    className="project-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    View repository <span aria-hidden="true">↗</span>
                  </a>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section
          className="section section-tinted"
          id="skills"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-shell">
            <div className="section-heading">
              <p className="eyebrow">SKILLS</p>
              <h2>Tools I work with.</h2>
            </div>

            <SkillsTabs />
          </div>
        </motion.section>

        {/* Outside the Code */}
        <motion.section
          className="section"
          id="interests"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-shell">
            <div className="section-heading">
              <p className="eyebrow">A LITTLE MORE ABOUT ME</p>
              <h2>Outside the Code.</h2>
              <p className="section-intro">
                Technology is one part of who I am. I also value community
                involvement, creativity, and making time for the things I enjoy.
              </p>
            </div>

            <div className="interest-grid">
              {interests.map((item, index) => (
                <div className="interest-card" key={item.title}>
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          className="section contact-section"
          id="contact"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="section-shell contact-layout">
            <div className="contact-intro">
              <p className="eyebrow">LET’S CONNECT</p>
              <h2>Hiring for an AI/ML or software internship? Let’s talk.</h2>
              <p className="contact-description">
                I’m always interested in learning, collaborating, and exploring
                opportunities in AI and machine learning.
              </p>

              <div className="contact-socials">
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <a href={`mailto:${email}`} aria-label="Email">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </a>
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.12 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.24-5.1 5.52.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>

              <a className="contact-cv-button" href="/resume.pdf" download>
                Download my CV <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="contact-form-column">
              <ContactForm />
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="footer">
        <div className="section-shell footer-inner">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">AS</span>
            <span className="brand-name">Arooj Saleem</span>
          </a>
          <p>Built with Next.js, TypeScript &amp; Motion.</p>
          <span>© 2026 Arooj Saleem</span>
        </div>
      </footer>
    </MotionConfig>
  );
}
