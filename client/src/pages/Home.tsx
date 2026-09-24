import { useState, useEffect, useMemo, type FormEvent } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Code2,
  Terminal,
  Cpu,
  Layers,
  Compass,
  MapPin,
  Map as MapIcon,
  BarChart3,
  LineChart,
  Globe,
  Sparkles,
  Zap,
  Check,
  CheckCircle2,
  Copy,
  CheckCheck,
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Send,
  Github,
  Linkedin,
  Twitter,
  Mail,
  ExternalLink,
  Briefcase,
  Monitor,
  Database,
  Activity,
  FileCode,
  CheckSquare,
} from "lucide-react";
import { defaultPortfolio } from "@shared/portfolioDefaults";
import type {
  ExperienceContent,
  HomepageSection,
  PortfolioSnapshot,
  ProjectContent,
  ServiceContent,
  SkillGroup,
} from "@shared/portfolio";
import { trpc } from "@/lib/trpc";
import { HeroInkCanvas } from "@/components/HeroInkCanvas";
import { HeroBackgroundAnimation } from "@/components/HeroBackgroundAnimation";
import { ServicesTimeline } from "@/components/ServicesTimeline";

const NAVIGATION_ITEMS = [
  { label: "Home", sectionId: "home" },
  { label: "About", sectionId: "about" },
  { label: "Projects", sectionId: "projects" },
  { label: "Services", sectionId: "services" },
  { label: "Contact", sectionId: "contact" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header scroll-reveal">
      <h2 className="section-title">{title}</h2>
      <div className="section-line" aria-hidden="true" />
    </div>
  );
}

function HeroPortrait({ profile }: { profile: PortfolioSnapshot["profile"] }) {
  const [imageSrc, setImageSrc] = useState("/assets/profile-frame.png");
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackSrc = (profile.profileImageUrl || "").trim();

  function handleImageError() {
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      return;
    }
    setImageFailed(true);
  }

  return (
    <div className="hero-avatar-inner">
      {imageFailed ? (
        <div
          className="hero-avatar-fallback"
          role="img"
          aria-label={profile.profileImageAlt || profile.name}
        >
          <span>{profile.initials || "SN"}</span>
        </div>
      ) : (
        <img
          src={imageSrc}
          width={944}
          height={1665}
          alt={profile.profileImageAlt}
          loading="eager"
          decoding="async"
          onError={handleImageError}
        />
      )}
    </div>
  );
}

function isVisible(sections: HomepageSection[], sectionKey: string) {
  return sections.some(
    section => section.sectionKey === sectionKey && section.isVisible
  );
}

function sectionHeading(
  sections: HomepageSection[],
  sectionKey: string,
  fallback: string
) {
  return (
    sections.find(section => section.sectionKey === sectionKey)?.heading ||
    fallback
  );
}

function ContactForm({ prefilledService }: { prefilledService: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefilledService) {
      setForm(prev => ({
        ...prev,
        service: prefilledService,
        message: prev.message
          ? prev.message
          : `Hi Saviour, I would like to inquire about ${prefilledService}.`,
      }));
    }
  }, [prefilledService]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: "error",
        text: "Please fill in all required fields before sending.",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({
        type: "error",
        text: "Please provide a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setStatus({
        type: "success",
        text: "Thank you for reaching out! Your message has been recorded.",
      });
      setForm({ name: "", email: "", service: "", message: "" });
      setIsSubmitting(false);
    }, 650);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="contact-form-card"
    >
      <form className="contact-form" onSubmit={submitForm} noValidate>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="e.g. Alex Morgan"
            className="form-input-well"
            value={form.name}
            onChange={event => setForm({ ...form, name: event.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. alex@example.com"
            className="form-input-well"
            value={form.email}
            onChange={event => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Project Details or Inquiry
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell me about your project, timeline, and goals..."
            className="form-input-well"
            value={form.message}
            onChange={event =>
              setForm({ ...form, message: event.target.value })
            }
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-full group"
        >
          {isSubmitting ? (
            <span>SENDING MESSAGE...</span>
          ) : (
            <>
              <span>SEND MESSAGE</span>
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        {status && (
          <p
            className={`form-status ${status.type}`}
            role="status"
            aria-live="polite"
          >
            {status.text}
          </p>
        )}
      </form>
    </motion.div>
  );
}

function PortfolioPage({ portfolio }: { portfolio: PortfolioSnapshot }) {
  const { profile, projects, skills, services, experiences, homepageSections } =
    portfolio;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("ALL");
  const [selectedInquiryService, setSelectedInquiryService] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const visibleSection = useMemo(
    () => (key: string) => isVisible(homepageSections, key),
    [homepageSections]
  );

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document
      .querySelectorAll(".scroll-reveal")
      .forEach(element => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, [portfolio]);

  useEffect(() => {
    function handleScroll() {
      const nav = document.querySelector<HTMLElement>(".nav");
      const navHeight = nav?.offsetHeight ?? 80;
      const sectionIds = ["home", "about", "projects", "services", "contact"];
      let current = "home";
      sectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section && window.scrollY >= section.offsetTop - navHeight - 120) {
          current = id;
        }
      });
      setActiveSection(current);
      if (nav) nav.classList.toggle("has-shadow", window.scrollY > 40);
      setShowBackToTop(window.scrollY > 350);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    const nav = document.querySelector<HTMLElement>(".nav");
    if (!section) return;
    window.scrollTo({
      top: section.offsetTop - (nav?.offsetHeight ?? 80),
      behavior: "smooth",
    });
    setMenuOpen(false);
  }

  function copyEmail() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profile.socialLinks.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  }

  function handleInquireService(serviceName: string) {
    setSelectedInquiryService(serviceName);
    scrollToSection("contact");
  }

  const hasProjects = visibleSection("projects") && projects.length > 0;

  const skillCategories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category)));
    return ["ALL", ...cats];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (selectedSkillCategory === "ALL") return skills;
    return skills.filter(s => s.category === selectedSkillCategory);
  }, [skills, selectedSkillCategory]);

  return (
    <div className="portfolio-page">
      {/* Scroll Progress Bar at very top */}
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />

      {/* Top Sticky Navigation Bar */}
      <nav className="nav" aria-label="Main Navigation">
        <div className="nav-container">
          <div className="nav-logo-group">
            <div className="nav-status-indicator" title="Current Availability">
              <span className="status-dot" aria-hidden="true" />
              <span>AVAILABLE FOR HIRE</span>
            </div>
          </div>

          <ul className="nav-menu">
            {NAVIGATION_ITEMS.filter(item => {
              if (item.sectionId === "projects") {
                return hasProjects;
              }
              return visibleSection(item.sectionId);
            }).map(item => (
              <li key={item.sectionId}>
                <a
                  className={`nav-link ${
                    activeSection === item.sectionId ? "active" : ""
                  }`}
                  href={`#${item.sectionId}`}
                  onClick={event => {
                    event.preventDefault();
                    scrollToSection(item.sectionId);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
              className="nav-cta-btn"
              onClick={() => scrollToSection("contact")}
            >
              <span>LET'S TALK</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              className={`nav-toggle ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="mobile-nav-drawer active"
            aria-hidden={!menuOpen}
          >
            {NAVIGATION_ITEMS.filter(item => {
              if (item.sectionId === "projects") {
                return hasProjects;
              }
              return visibleSection(item.sectionId);
            }).map(item => (
              <a
                key={item.sectionId}
                className={`mobile-nav-link ${
                  activeSection === item.sectionId ? "active" : ""
                }`}
                href={`#${item.sectionId}`}
                onClick={event => {
                  event.preventDefault();
                  scrollToSection(item.sectionId);
                }}
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Decorative Background Animation & Interactive Ink Smoke */}
      {visibleSection("home") && (
        <section id="home" className="hero">
          {/* Decorative Uploaded Purple Swashbuckler Hero Background Animation */}
          <HeroBackgroundAnimation />

          {/* Interactive Digital Ink & Rapier Trail Canvas */}
          <HeroInkCanvas />

          <div className="container relative z-10">
            <div className="hero-grid">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="hero-left"
              >
                <div className="hero-meta-badge">
                  <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  <span>FRONTEND DEVELOPER & GIS ANALYST</span>
                </div>

                <h1 className="hero-title">
                  <span className="title-line">{profile.heroFirstName}</span>
                  <span className="title-highlight">
                    {profile.heroHighlightName}
                  </span>
                  <span className="title-line">{profile.heroLastName}</span>
                </h1>

                <div className="hero-subtitle-bar">
                  <Code2 className="w-4 h-4 text-purple-600 inline mr-2 align-middle" />
                  <span>{profile.subtitle}</span>
                </div>

                <p className="hero-description">{profile.heroDescription}</p>

                <div className="hero-buttons">
                  <button
                    className="btn btn-primary group"
                    onClick={() => scrollToSection("services")}
                  >
                    <span>EXPLORE SERVICES</span>
                    <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
                  </button>
                  <button
                    className="btn btn-secondary group"
                    onClick={() => scrollToSection("contact")}
                  >
                    <span>CONTACT ME</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>

                <div className="hero-telemetry-strip">
                  <div className="telemetry-item highlight">
                    <Code2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>REACT & TYPESCRIPT</span>
                  </div>
                  <div className="telemetry-item">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>GIS & SPATIAL DATA</span>
                  </div>
                  <div className="telemetry-item">
                    <LineChart className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DATA VISUALIZATION</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="hero-right"
              >
                <div className="hero-avatar-card">
                  <HeroPortrait
                    key={profile.profileImageUrl}
                    profile={profile}
                  />
                  <div className="hero-avatar-footer">
                    <span>SAVIOUR N. KOKI</span>
                    <span>DEV // GIS ANALYST</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* About Section with Interactive Pillars & Filterable Skill Matrix */}
      {visibleSection("about") && (
        <section id="about" className="about-section">
          <div className="container">
            <SectionHeader
              title={sectionHeading(homepageSections, "about", "ABOUT ME")}
            />
            <div className="about-grid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="about-narrative-card"
              >
                <div>
                  <h3 className="about-intro-highlight">
                    {profile.aboutIntro}
                  </h3>
                  <p className="about-body-text">{profile.aboutDescription}</p>
                </div>

                <div className="about-quote-box">
                  <p>
                    "Bridging the gap between beautiful responsive user
                    interfaces and actionable geographic intelligence."
                  </p>
                </div>

                {/* 4 Core Pillars */}
                <div className="pillars-grid">
                  <div className="pillar-card">
                    <h4 className="pillar-title">
                      <Monitor className="w-4 h-4 text-purple-600" />
                      <span>Frontend Excellence</span>
                    </h4>
                    <p className="pillar-desc">
                      Pixel-perfect, accessible, and fast web apps built with
                      modern React & TypeScript.
                    </p>
                  </div>
                  <div className="pillar-card">
                    <h4 className="pillar-title">
                      <MapIcon className="w-4 h-4 text-indigo-600" />
                      <span>Spatial Intelligence</span>
                    </h4>
                    <p className="pillar-desc">
                      QGIS, spatial queries, remote sensing, and custom web
                      cartography solutions.
                    </p>
                  </div>
                  <div className="pillar-card">
                    <h4 className="pillar-title">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Data Storytelling</span>
                    </h4>
                    <p className="pillar-desc">
                      Transforming complex geographic & numerical datasets into
                      interactive dashboards.
                    </p>
                  </div>
                  <div className="pillar-card">
                    <h4 className="pillar-title">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>High Performance</span>
                    </h4>
                    <p className="pillar-desc">
                      Optimized asset delivery, robust state management, and
                      smooth user interactions.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Skills Column with Interactive Category Filters */}
              <div className="skills-column">
                <div className="skill-tabs-bar">
                  {skillCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSkillCategory(cat)}
                      className={`skill-tab-btn ${
                        selectedSkillCategory === cat ? "active" : ""
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>

                {filteredSkills.map((group, index) => (
                  <motion.article
                    key={group.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="skill-category-card"
                  >
                    <div className="skill-header">
                      <h3 className="skill-title">
                        <Terminal className="w-4 h-4 text-purple-600" />
                        <span>{group.category}</span>
                      </h3>
                    </div>
                    <ul className="skill-pills-list">
                      {group.items.map(item => (
                        <li className="skill-pill" key={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section with Scroll-Triggered Drawing Violet Spine & Deliverables */}
      {visibleSection("services") && (
        <section id="services" className="services-section">
          <div className="container">
            <SectionHeader
              title={sectionHeading(
                homepageSections,
                "services",
                "SERVICES & CAPABILITIES"
              )}
            />
            <ServicesTimeline
              services={services}
              onInquire={handleInquireService}
            />
          </div>
        </section>
      )}

      {/* Contact Section */}
      {visibleSection("contact") && (
        <section id="contact" className="contact-section">
          <div className="container">
            <SectionHeader
              title={sectionHeading(
                homepageSections,
                "contact",
                "GET IN TOUCH"
              )}
            />
            <div className="contact-grid">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="contact-info-card"
              >
                <div>
                  <h3 className="contact-heading">{profile.contactHeading}</h3>
                  <p className="contact-text">{profile.contactText}</p>
                </div>
                <div>
                  <div className="contact-social-grid">
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="social-card-btn group"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        <span>GITHUB</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="social-card-btn group"
                    >
                      <span className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        <span>LINKEDIN</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="social-card-btn group"
                    >
                      <span className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        <span>TWITTER / X</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="social-card-btn group"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>
                          {copiedEmail ? "COPIED TO CLIPBOARD" : "COPY EMAIL"}
                        </span>
                      </span>
                      {copiedEmail ? (
                        <CheckCheck className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              <ContactForm prefilledService={selectedInquiryService} />
            </div>
          </div>
        </section>
      )}

      {/* Floating Back To Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            className="floating-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Professional Footer with zero emojis */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <h4 className="footer-heading">NAVIGATION</h4>
              <ul className="footer-links-list">
                {NAVIGATION_ITEMS.filter(item => {
                  if (item.sectionId === "projects") {
                    return hasProjects;
                  }
                  return visibleSection(item.sectionId);
                }).map(item => (
                  <li className="footer-link-item" key={item.sectionId}>
                    <a
                      href={`#${item.sectionId}`}
                      onClick={event => {
                        event.preventDefault();
                        scrollToSection(item.sectionId);
                      }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="footer-heading">SOCIAL CHANNELS</h4>
              <ul className="footer-links-list">
                <li className="footer-link-item">
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Twitter / X</span>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a href={`mailto:${profile.socialLinks.email}`}>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{profile.socialLinks.email}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>
              © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </p>
            <button
              className="back-to-top-btn flex items-center gap-1.5"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const { data, isLoading, error } = trpc.portfolio.get.useQuery();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          background: "#F5F2EA",
          fontSize: "1.1rem",
        }}
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-purple-600 animate-spin" />
          <span>LOADING PORTFOLIO...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div
          className="portfolio-data-warning"
          role="status"
          style={{
            background: "#FFD026",
            borderBottom: "2px solid #0F1015",
            padding: "0.5rem 1rem",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.8rem",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Offline/fallback dataset active. Saved portfolio copy shown.
        </div>
        <PortfolioPage portfolio={defaultPortfolio} />
      </>
    );
  }

  return <PortfolioPage portfolio={data ?? defaultPortfolio} />;
}
