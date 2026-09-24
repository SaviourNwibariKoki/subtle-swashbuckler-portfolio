import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Monitor,
  Map as MapIcon,
  Compass,
  BarChart3,
  Code2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { ServiceContent } from "@shared/portfolio";

interface ServicesTimelineProps {
  services: ServiceContent[];
  onInquire: (serviceName: string) => void;
}

const SERVICE_DELIVERABLES: Record<number, string[]> = {
  1: [
    "Responsive React & Next.js architectures",
    "Tailwind CSS & design systems",
    "Accessible & high-performance SPAs",
    "API integration & state management",
  ],
  2: [
    "Custom Leaflet & Mapbox GL applications",
    "Spatial layer overlay & heatmaps",
    "Location search & geocoding workflows",
    "Dynamic GeoJSON parsing & filtering",
  ],
  3: [
    "Spatial analysis & cartographic styling",
    "Remote sensing & raster data processing",
    "PostGIS spatial query optimization",
    "GRID3 & geospatial schema design",
  ],
  4: [
    "Interactive charts & custom dashboards",
    "Complex spatial metric visualization",
    "Real-time analytics data streaming",
    "Exportable reporting & visual insights",
  ],
};

const DEFAULT_SERVICES: ServiceContent[] = [
  {
    id: 1,
    title: "FRONTEND DEVELOPMENT",
    description:
      "Building responsive, performant, and accessible web applications using modern frameworks and best practices. From landing pages to complex SPAs.",
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: 2,
    title: "WEB MAP DEVELOPMENT",
    description:
      "Creating interactive web maps and location-based applications with custom styling, spatial queries, and seamless user experiences.",
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: 3,
    title: "GIS ANALYSIS & MAPPING",
    description:
      "Professional spatial analysis, cartographic design, and geospatial data processing using industry-standard GIS tools and methodologies.",
    isVisible: true,
    displayOrder: 3,
  },
  {
    id: 4,
    title: "DATA VISUALIZATION",
    description:
      "Transforming complex datasets into clear, insightful visual stories through interactive charts, dashboards, and custom visualizations.",
    isVisible: true,
    displayOrder: 4,
  },
];

export function ServicesTimeline({ services, onInquire }: ServicesTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsToRender =
    services && services.length > 0 ? services : DEFAULT_SERVICES;

  const [activeNode, setActiveNode] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setPrefersReducedMotion(e.matches);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Track scroll progress along the timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 60%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Calculate height of the drawn violet line
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const ServiceIcons = [Monitor, MapIcon, Compass, BarChart3];

  return (
    <div
      ref={containerRef}
      className="scroll-timeline-wrapper"
      role="region"
      aria-label="Services Roadmap and Offerings"
    >
      <div className="timeline-spine-track" aria-hidden="true">
        {/* Background track */}
        <div className="timeline-spine-bg" />

        {/* Dynamic scroll-drawn violet line */}
        <motion.div
          className="timeline-spine-draw"
          style={{
            height: prefersReducedMotion ? "100%" : lineHeight,
          }}
        />

        {/* Luminous blade energy tip */}
        {!prefersReducedMotion && (
          <motion.div
            className="timeline-spine-tip"
            style={{
              top: lineHeight,
            }}
          />
        )}
      </div>

      <ol className="timeline-items-list">
        {itemsToRender.map((service, index) => {
          const isEven = index % 2 === 0;
          const IconComponent = ServiceIcons[index % ServiceIcons.length] ?? Code2;
          const deliverables =
            SERVICE_DELIVERABLES[service.id] ?? [
              "Custom architecture & implementation",
              "Production-ready clean code",
              "Responsive & performant design",
            ];

          return (
            <motion.li
              key={service.id || index}
              className={`timeline-milestone-item ${
                isEven ? "align-left" : "align-right"
              }`}
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 32 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              onFocus={() => setActiveNode(index)}
              onMouseEnter={() => setActiveNode(index)}
            >
              {/* Timeline Center Node */}
              <div className="timeline-node-anchor" aria-hidden="true">
                <div
                  className={`timeline-node-disc ${
                    activeNode === index ? "active" : ""
                  }`}
                >
                  <span className="timeline-node-core" />
                </div>
              </div>

              {/* Service Card in Timeline Form */}
              <article className="timeline-card service-timeline-card">
                <div className="timeline-card-header">
                  <div className="timeline-meta-group">
                    <span className="timeline-date-badge">
                      SERVICE {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="timeline-company-tag">
                      AVAILABLE FOR HIRE
                    </span>
                  </div>
                  <div className="service-timeline-icon-box" aria-hidden="true">
                    <IconComponent className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                <h3 className="timeline-role-title">{service.title}</h3>
                <p className="timeline-role-desc">{service.description}</p>

                {/* Deliverables checklist */}
                <div className="service-timeline-deliverables">
                  <span className="service-timeline-deliverables-title">
                    WHAT I DELIVER:
                  </span>
                  <ul className="service-timeline-deliverables-list">
                    {deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="service-timeline-deliverable-item">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="timeline-card-footer">
                  <button
                    type="button"
                    onClick={() => onInquire(service.title)}
                    className="service-timeline-inquire-btn group"
                    aria-label={`Inquire about ${service.title}`}
                  >
                    <span>INQUIRE ABOUT THIS SERVICE</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
