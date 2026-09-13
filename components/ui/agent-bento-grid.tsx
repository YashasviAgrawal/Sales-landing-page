"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ChatCircle,
  Brain,
  Database,
  TerminalWindow,
  FileText,
  Check,
  CircleNotch,
  Clock,
  Minus,
  Globe,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────
   From the VengeanceUI registry (agent-bento-grid).

   The registry ships this as an AI agent console - token meters, retrieval
   logs, tool latency. The mechanics of the five visuals were kept and the
   subject was rewritten, because the shapes happen to fit this page exactly:
   five animated panels, and five sprints in lib/content.ts. So each card is
   now one sprint, and the numbers inside it describe what that sprint
   produces.

   Also rethemed onto the palette in globals.css. The registry version used
   zinc surfaces with amber/violet/cyan accents; this file uses the ink scale
   with mint, and keeps `fall` for decline only, per the palette notes.

   Grid: 3 cards top row · 2 cards bottom row
   Each FeatCard takes: title, description, children (visual)
────────────────────────────────────────────────────── */

interface FeatCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional extra classes for sizing/spanning */
  className?: string;
}

export function FeatCard({ title, description, children, className = "" }: FeatCardProps) {
  return (
    <motion.div
      /* whileInView, not animate: the registry version plays this on mount,
         which on a long page means the cards have finished animating long
         before anyone scrolls to them. */
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-[12px] p-4",
        "bg-ink-900",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]",
        "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <div className="z-10 flex flex-col gap-1.5">
        <h3 className="font-semibold text-paper text-sm tracking-tight">{title}</h3>
        <p className="text-body text-xs leading-relaxed max-w-[90%]">{description}</p>
      </div>
      <div className="relative mt-2 flex-1 w-full rounded-[12px] overflow-hidden border border-white/8 bg-ink-950/50 dark:bg-ink-950/50">
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Card1 – Agent Pipeline
   Minimalist precise node graph with real-time task flows
   ───────────────────────────────────────────── */

type ActiveStep = 'request' | 'router' | 'agent' | 'memory' | 'tools' | 'response';

const VW = 320;
const VH = 240;

interface NodeConfig {
  id: string;
  x: number;
  y: number;
  icon?: any;
  label?: string;
  type: 'box' | 'circle';
}

/*
  The graph's topology - one entry point, a qualifying junction, a central
  node that branches two ways and returns - is the shape of a live deal, so
  the nodes are labelled as one: a lead arrives, gets qualified, goes into a
  conversation, which sends a proposal and a follow-up and eventually flows
  back as a closed deal.
*/
const NODES: NodeConfig[] = [
  { id: 'A', x: 50, y: 120, icon: ChatCircle, label: "LEAD", type: 'box' },
  { id: 'Router', x: 125, y: 120, type: 'circle' },
  { id: 'C', x: 200, y: 120, icon: Brain, label: "CALL", type: 'box' },
  { id: 'B', x: 280, y: 50, icon: FileText, label: "PROPOSAL", type: 'box' },
  { id: 'D', x: 280, y: 190, icon: Clock, label: "FOLLOW-UP", type: 'box' },
];

interface FlowPath {
  id: string;
  d: string;
  activeSteps: ActiveStep[];
  flowDirection: 'forward' | 'backward' | 'both';
  colorClass: string;
}

const PATHS: FlowPath[] = [
  {
    id: "a-to-router",
    d: "M 78 120 L 113 120",
    activeSteps: ["request"],
    flowDirection: "forward",
    colorClass: "text-signal-lift dark:text-signal-lift",
  },
  {
    id: "router-to-agent",
    d: "M 137 120 L 172 120",
    activeSteps: ["agent"],
    flowDirection: "forward",
    colorClass: "text-body dark:text-body",
  },
  {
    id: "agent-to-memory",
    d: "M 200 92 L 200 50 L 252 50",
    activeSteps: ["memory"],
    flowDirection: "both",
    /* Not `fall`: the palette reserves the magenta for decline, and a
       proposal going out is not a loss. */
    colorClass: "text-muted dark:text-muted",
  },
  {
    id: "agent-to-tools",
    d: "M 200 148 L 200 190 L 252 190",
    activeSteps: ["tools"],
    flowDirection: "both",
    colorClass: "text-signal dark:text-signal",
  },
  {
    id: "response-flow-1",
    d: "M 172 120 L 137 120",
    activeSteps: ["response"],
    flowDirection: "forward",
    colorClass: "text-signal-lift dark:text-signal-lift",
  },
  {
    id: "response-flow-2",
    d: "M 113 120 L 78 120",
    activeSteps: ["response"],
    flowDirection: "forward",
    colorClass: "text-signal-lift dark:text-signal-lift",
  },
];

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; buttonBg: string; buttonBorder: string }> = {
  A: {
    bg: "bg-signal-lift/10 dark:bg-signal-lift/5",
    border: "border-signal-lift/60 dark:border-signal-lift/50",
    text: "text-signal-lift dark:text-signal-lift",
    buttonBg: "bg-signal-lift",
    buttonBorder: "border-signal-lift",
  },
  Router: {
    bg: "bg-paper/10 dark:bg-paper/5",
    border: "border-paper/60 dark:border-paper/50",
    text: "text-paper dark:text-paper",
    buttonBg: "bg-paper",
    buttonBorder: "border-paper",
  },
  C: {
    bg: "bg-body/10 dark:bg-body/5",
    border: "border-body/60 dark:border-body/50",
    text: "text-body dark:text-body",
    buttonBg: "bg-body",
    buttonBorder: "border-body",
  },
  B: {
    bg: "bg-muted/10 dark:bg-muted/5",
    border: "border-muted/60 dark:border-muted/50",
    text: "text-muted dark:text-muted",
    buttonBg: "bg-muted",
    buttonBorder: "border-muted",
  },
  D: {
    bg: "bg-signal/10 dark:bg-signal/5",
    border: "border-signal/60 dark:border-signal/50",
    text: "text-signal dark:text-signal",
    buttonBg: "bg-signal",
    buttonBorder: "border-signal",
  },
};

export function Card1() {
  const [step, setStep] = useState<ActiveStep>("request");

  useEffect(() => {
    const steps: ActiveStep[] = ["request", "router", "agent", "memory", "tools", "response"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setStep(steps[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isNodeActive = (nodeId: string) => {
    switch (step) {
      case 'request':
        return nodeId === 'A';
      case 'router':
        return nodeId === 'Router';
      case 'agent':
        return nodeId === 'C';
      case 'memory':
        return nodeId === 'C' || nodeId === 'B';
      case 'tools':
        return nodeId === 'C' || nodeId === 'D';
      case 'response':
        return nodeId === 'C' || nodeId === 'Router' || nodeId === 'A';
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-paper dark:bg-ink-950/80 rounded-xl flex items-center justify-center p-2">
      {/* ── Layer 1: Clean dotted grid ── */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <pattern id="clean-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="currentColor" className="text-paper dark:text-ink-800/60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#clean-grid)" />
      </svg>

      {/* ── Layer 2: Connector SVG & Nodes ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* Base Static Connection Paths */}
        <path d="M 78 120 L 113 120" fill="none" stroke="currentColor" className="text-paper dark:text-ink-800/80" strokeWidth="1" />
        <path d="M 137 120 L 172 120" fill="none" stroke="currentColor" className="text-paper dark:text-ink-800/80" strokeWidth="1" />
        <path d="M 200 92 L 200 50 L 252 50" fill="none" stroke="currentColor" className="text-paper dark:text-ink-800/80" strokeWidth="1" />
        <path d="M 200 148 L 200 190 L 252 190" fill="none" stroke="currentColor" className="text-paper dark:text-ink-800/80" strokeWidth="1" />

        {/* Animated Flow Overlays */}
        {PATHS.map((p) => {
          const isActive = p.activeSteps.includes(step);
          if (!isActive) return null;

          return (
            <g key={p.id}>
              {/* Outer soft glow stroke - travels once */}
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="3.5"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {/* Sharp solid flowing stroke - travels once */}
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </g>
          );
        })}

        {/* ForeignObjects for Nodes */}
        {NODES.map((node) => {
          const isBox = node.type === 'box';
          const w = isBox ? 56 : 24;
          const h = isBox ? 56 : 24;
          const isActive = isNodeActive(node.id);
          const colorStyles = NODE_COLORS[node.id];

          return (
            <foreignObject
              key={node.id}
              x={node.x - w / 2}
              y={node.y - h / 2}
              width={w}
              height={h}
              className="overflow-visible"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isBox && node.icon ? (
                  <div
                    className={`w-full h-full rounded-[12px] border flex flex-col items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_4px_4px_0_0_rgba(255,255,255,0.06),inset_6px_6px_0_0_rgba(255,255,255,0.04),inset_8px_8px_0_0_rgba(255,255,255,0.02),0_1px_2px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06),0_4px_6px_0_rgba(0,0,0,0.04),0_6px_8px_0_rgba(0,0,0,0.02)] text-white ${colorStyles.buttonBg} ${colorStyles.buttonBorder}`}
                  >
                    {/* Centered Static Icon */}
                    <div className="mb-0.5 flex items-center justify-center">
                      <node.icon className="w-5 h-5" weight="fill" />
                    </div>
                    <span className="text-[8.5px] font-mono font-bold tracking-wider select-none">
                      {node.label}
                    </span>
                  </div>
                ) : (
                  /* Central Router Node Upgrade */
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all duration-300 ${isActive
                      ? "bg-paper/20 border-paper/70"
                      : "bg-ink-950/80 border-body dark:border-ink-800"
                      }`}
                  >
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full border border-dashed ${isActive ? "border-paper" : "border-body dark:border-muted"
                        }`}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card2 – Live Token / Cost Monitor
───────────────────────────────────────────── */
export function Card2() {
  const bars = [45, 75, 35, 85, 60, 95, 50];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3.5 justify-between">
      {/* Stats row with a 0.5rem slide offset margin to prevent slide-up overflow clipping */}
      <div className="flex gap-4 pt-[0.625rem] pr-[0.625rem] pb-0.5 pl-0.5">
        {[
          { label: "Avg. deal", value: "₹2.4L", trend: "+8%" },
          { label: "Discount", value: "11.4%", trend: "-3%" },
        ].map((s, i) => {
          const isActive = i === activeIdx || hoveredIdx === i;

          return (
            <div key={i} className="flex-1 h-[76px] relative select-none">
              {/* Background Hatched Scale Card */}
              <div
                className="absolute inset-0 rounded-xl border border-white/8 dark:border-white/8 bg-ink-850/5 text-white/15 dark:text-white/15"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
                }}
              />

              {/* Foreground Card sliding up and right on hover or cycle activation (0.5rem offset) */}
              <motion.div
                className="absolute inset-0 w-full h-full rounded-xl bg-ink-850/20 dark:bg-ink-950/80 border border-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.01)] p-3 hover:bg-ink-850/30 transition-colors duration-300 backdrop-blur-[2px] flex items-center justify-between gap-3 cursor-pointer"
                animate={{
                  x: isActive ? "0.5rem" : "0rem",
                  y: isActive ? "-0.5rem" : "0rem",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Left Column: Metric Details */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-body/80 font-mono uppercase tracking-widest leading-none">{s.label}</span>
                  <span className="text-base font-bold font-mono text-paper leading-none mt-1.5 tracking-tight">{s.value}</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[8px] font-mono font-bold ${s.trend.startsWith("+") ? "text-signal" : "text-fall"
                      }`}>
                      {s.trend}
                    </span>
                    <span className="text-[8px] text-body/50 font-mono">prev</span>
                  </div>
                </div>

                {/* Right Column: High-Precision Sparkline with Micro Vertices */}
                <div className="w-12 h-6 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 48 24">
                    {/* Connecting Line */}
                    <motion.path
                      d={i === 0
                        ? "M 0 18 L 16 11 L 32 14 L 48 4"
                        : "M 0 4 L 16 12 L 32 8 L 48 18"
                      }
                      fill="none"
                      stroke="currentColor"
                      className="text-body/30 dark:text-body/20"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                    />

                    {/* Vertex Dots */}
                    {(i === 0
                      ? [{ x: 0, y: 18 }, { x: 16, y: 11 }, { x: 32, y: 14 }, { x: 48, y: 4 }]
                      : [{ x: 0, y: 4 }, { x: 16, y: 12 }, { x: 32, y: 8 }, { x: 48, y: 18 }]
                    ).map((pt, idx) => (
                      <motion.circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="1.5"
                        className="fill-background stroke-muted-foreground/40 dark:stroke-muted-foreground/30"
                        strokeWidth="1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.08, duration: 0.25 }}
                      />
                    ))}
                  </svg>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex items-end gap-2.5 px-0.5 min-h-[90px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 h-full rounded-xl dark:bg-ink-950/80 border border-white/8 dark:border-white/8 relative overflow-hidden bg-ink-850/5 text-white/15 dark:text-white/15"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
            }}
          >
            {/* Animated Solid Filled Bar at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-signal border-t border-x border-signal/80 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.6),inset_0_8px_12px_0_rgba(255,255,255,0.03),inset_0.5px_0_0_0_rgba(255,255,255,0.2),inset_0_2px_6px_0_rgba(255,255,255,0.3),inset_0_-0.5px_0_0_rgba(0,0,0,0.2),inset_-0.5px_0_0_0_rgba(0,0,0,0.1),inset_0_-2px_6px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06),0_4px_6px_0_rgba(0,0,0,0.04),inset_0_-4px_8px_0_rgba(0,0,0,0.05)] rounded-t-[10px]"
              initial={{ height: "0%" }}
              animate={{
                height: [
                  `${h}%`,
                  `${Math.min(95, h + 15)}%`,
                  `${Math.max(10, h - 20)}%`,
                  `${Math.min(90, h + 8)}%`,
                  `${h}%`
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + (i % 3) * 0.8,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          </div>
        ))}
      </div>

      {/* X labels */}
      <div className="flex gap-2.5 px-0.5">
        {days.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[8px] text-body font-mono font-medium">{d}</p>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card3 – Stacked Infinite-Scroll Activity Feed
   ───────────────────────────────────────────── */

const STATUS_ICONS: Record<string, { icon: any; color: string; bg: string; gradient: string; border: string }> = {
  done: { icon: Check, color: "text-signal", bg: "bg-signal/15", gradient: "bg-gradient-to-b from-signal to-signal", border: "border-signal" },
  running: { icon: CircleNotch, color: "text-body", bg: "bg-body/15", gradient: "bg-gradient-to-b from-body to-body", border: "border-body" },
  waiting: { icon: Clock, color: "text-paper", bg: "bg-paper/15", gradient: "bg-gradient-to-b from-paper to-paper", border: "border-paper" },
  idle: { icon: Minus, color: "text-body/60", bg: "bg-ink-850/40", gradient: "bg-gradient-to-b from-body to-muted", border: "border-muted" },
};

export function Card3() {
  const logs = [
    { agent: "Angle 01", action: "Cost of doing nothing · 120 sent", status: "done", t: "9.1%" },
    { agent: "Angle 02", action: "Peer proof · 120 sent", status: "done", t: "6.4%" },
    { agent: "Angle 03", action: "Naming the leak · 74 of 120 sent", status: "running", t: "—" },
    { agent: "Angle 04", action: "Awaiting result from Angle 03", status: "waiting", t: "—" },
    { agent: "Angle 05", action: "Not started — queued", status: "idle", t: "—" },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % logs.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [logs.length]);

  // Signed slot: 0 = active front, negative = above (upcoming), positive = below (past)
  const getSlot = (i: number) => {
    const N = logs.length;
    let rel = i - activeIdx;
    if (rel > Math.floor(N / 2)) rel -= N;
    if (rel < -Math.floor(N / 2)) rel += N;
    return rel;
  };

  // Fixed y positions: tighter stack, not linear steps
  const Y: Record<string, number> = { "-2": -68, "-1": -38, "0": 0, "1": 38, "2": 68 };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {logs.map((l, i) => {
        const slot = getSlot(i);
        const si = STATUS_ICONS[l.status];
        const abs = Math.abs(slot);
        const isActive = slot === 0;
        const isVisible = abs <= 2;

        const yOffset = Y[String(slot)] ?? (slot < 0 ? -120 : 120);
        const scale = isActive ? 1 : abs === 1 ? 0.93 : 0.87;
        const opacity = isActive ? 1 : abs === 1 ? 0.65 : 0.38;
        const zIndex = isActive ? 30 : abs === 1 ? 20 : 10;

        return (
          <motion.div
            key={l.agent}
            className="absolute left-0 right-0 mx-auto px-1.5"
            style={{ zIndex }}
            animate={{
              y: isVisible ? yOffset : slot < 0 ? -150 : 150,
              scale,
              opacity: isVisible ? opacity : 0,
            }}
            transition={{
              y: { type: "spring", stiffness: 500, damping: 35 },
              scale: { type: "spring", stiffness: 500, damping: 35 },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
          >
            <div className={`w-full rounded-2xl border flex items-center gap-2.5 ${isActive
              ? "px-3 py-2.5 bg-ink-950 border-white/10"
              : "px-2.5 py-1.5 bg-ink-850/30 border-white/8"
              }`}>

              {/* Icon badge — full on active, compact on behind */}
              <div className={`shrink-0 rounded-[8px] flex items-center justify-center font-bold text-white transition-all duration-300 ${si.gradient} border ${si.border} shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.6),inset_0.5px_0_0_0_rgba(255,255,255,0.2),inset_0_2px_6px_0_rgba(255,255,255,0.3),inset_0_-0.5px_0_0_rgba(0,0,0,0.3),inset_-0.5px_0_0_0_rgba(0,0,0,0.1),inset_0_-2px_6px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06),0_4px_6px_0_rgba(0,0,0,0.04)] ${isActive ? "w-8 h-8" : "w-5 h-5"
                }`}>
                <si.icon weight="bold" className={`${isActive ? "w-4 h-4" : "w-2.5 h-2.5"} ${l.status === "running" ? "animate-spin" : ""}`} />
              </div>

              {/* Text — full on active, name-only on behind */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono font-semibold text-paper leading-none ${isActive ? "text-[10px]" : "text-[9px]"
                    }`}>{l.agent}</span>
                  <span className={`font-mono uppercase tracking-wide rounded px-1 py-0.5 ${si.bg} ${si.color} ${isActive ? "text-[7px]" : "text-[6px]"
                    }`}>{l.status}</span>
                </div>
                {isActive && (
                  <p className="text-[9px] text-body truncate mt-0.5 leading-tight">{l.action}</p>
                )}
              </div>

              {isActive && (
                <span className="text-[9px] font-mono text-body shrink-0">{l.t}</span>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Progress dots */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {logs.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-paper/25"
            animate={{
              width: i === activeIdx ? 14 : 4,
              opacity: i === activeIdx ? 0.7 : 0.2,
            }}
            style={{ height: 3 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card4 – Memory / Knowledge Base Namespaces
   ───────────────────────────────────────────── */

const NS_ICONS: Record<string, React.ElementType> = {
  outbound: TerminalWindow,
  referral: ChatCircle,
  paid: Globe,
  inbound: FileText,
};

const NS_COLORS: Record<string, { bar: string; dot: string; badge: string; buttonBg: string; buttonBorder: string }> = {
  outbound: { bar: "from-signal to-signal", dot: "bg-signal", badge: "bg-signal/15 text-signal", buttonBg: "bg-signal", buttonBorder: "border-signal" },
  referral: { bar: "from-signal-lift to-signal-lift", dot: "bg-signal-lift", badge: "bg-signal-lift/15 text-signal-lift", buttonBg: "bg-signal-lift", buttonBorder: "border-signal-lift" },
  paid: { bar: "from-body to-body", dot: "bg-body", badge: "bg-body/15 text-body", buttonBg: "bg-body", buttonBorder: "border-body" },
  inbound: { bar: "from-paper to-paper", dot: "bg-paper", badge: "bg-paper/15 text-paper", buttonBg: "bg-paper", buttonBorder: "border-paper" },
};

const RETRIEVAL_QUERIES = [
  { ns: "outbound", q: "Ops leads · agencies, 20-80 staff", t: "₹4.2L" },
  { ns: "referral", q: "Introduction from past client", t: "₹6.0L" },
  { ns: "outbound", q: "Founders still selling personally", t: "₹2.8L" },
  { ns: "paid", q: "Search · \"sales audit\"", t: "₹0.9L" },
  { ns: "inbound", q: "Newsletter · issue 14", t: "₹1.6L" },
  { ns: "referral", q: "Partner network", t: "₹3.4L" },
];

export function Card4() {
  const namespaces = [
    { name: "outbound", hits: 342, fill: 88 },
    { name: "referral", hits: 218, fill: 56 },
    { name: "paid", hits: 97, fill: 25 },
    { name: "inbound", hits: 54, fill: 14 },
  ];

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % RETRIEVAL_QUERIES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeNs = RETRIEVAL_QUERIES[tick].ns;
  const recentQueries = [0, 1, 2, 3].map(
    (offset) => RETRIEVAL_QUERIES[(tick - offset + RETRIEVAL_QUERIES.length) % RETRIEVAL_QUERIES.length]
  );

  return (
    <div className="w-full h-full flex gap-5 py-2 px-3">

      {/* ── Left panel: Namespace bars ── */}
      <div className="flex-1 flex flex-col gap-0 min-w-0 pr-2">
        <p className="text-[8px] font-mono uppercase tracking-widest text-body mb-3">Sources</p>

        <div className="flex flex-col gap-3 flex-1">
          {namespaces.map((ns, i) => {
            const c = NS_COLORS[ns.name];
            const isActive = ns.name === activeNs;
            const Icon = (NS_ICONS[ns.name] || Database) as React.ComponentType<{ size?: number; weight?: string; className?: string }>;

            return (
              <div key={ns.name} className="flex items-center gap-3 group relative">

                {/* Icon Container with 3D effect */}
                <div
                  className={`relative flex shrink-0 items-center justify-center w-[36px] h-[36px] rounded-[12px] border transition-all duration-500 ${isActive ? `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_4px_4px_0_0_rgba(255,255,255,0.06),inset_6px_6px_0_0_rgba(255,255,255,0.04),inset_8px_8px_0_0_rgba(255,255,255,0.02),0_1px_2px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06),0_4px_6px_0_rgba(0,0,0,0.04),0_6px_8px_0_rgba(0,0,0,0.02)] text-white ${c.buttonBg} ${c.buttonBorder} scale-105` : 'dark:bg-ink-950/80 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_0px_rgba(0,0,0,0.04)] bg-white border-transparent text-[#A1A1A1]'}`}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} className="relative z-10" />
                </div>

                {/* Name */}
                <span className={`text-[10px] font-mono w-16 shrink-0 transition-colors duration-400 ${isActive ? "text-paper font-semibold" : "text-body group-hover:text-paper/70"}`}>
                  {ns.name}
                </span>

                {/* Cyberpunk Bar track */}
                <div className="flex-1 h-1.5 bg-ink-850/30 rounded-full overflow-hidden relative backdrop-blur-sm shadow-inner">
                  <motion.div
                    className={`absolute left-0 top-0 bottom-0 rounded-full overflow-hidden bg-gradient-to-r ${c.bar}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${ns.fill}%`, opacity: isActive ? 1 : 0.25 }}
                    transition={{
                      width: { duration: 1.2, delay: i * 0.1, type: "spring", bounce: 0.2 },
                      opacity: { duration: 0.4 },
                    }}
                  >
                    {/* Scanning light beam effect inside the bar */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Hit count */}
                <div className={`flex items-center gap-1.5 w-10 justify-end transition-all duration-500 ${isActive ? "opacity-100 scale-105" : "opacity-60 scale-100"}`}>
                  <span className={`text-[9px] font-mono font-medium ${isActive ? "text-paper" : "text-body"}`}>
                    {ns.hits}
                  </span>
                  {isActive && (
                    <motion.div
                      className={`w-1 h-1 rounded-full ${c.dot}`}
                      animate={{ opacity: [1, 0.2, 1], scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 pt-3 mt-auto">
          <div className="relative flex items-center justify-center w-2 h-2">
            <motion.div
              className="absolute inset-0 rounded-full bg-signal/40"
              animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-signal" />
          </div>
          <span className="text-[8px] font-mono text-body font-medium tracking-wide">Attribution live</span>
        </div>
      </div>

      {/* Thin divider */}
      <div className="w-px bg-white/8 self-stretch shrink-0" />

      {/* ── Right panel: Retrieval log ── */}
      <div className="w-[172px] shrink-0 flex flex-col gap-0">
        <p className="text-[8px] font-mono uppercase tracking-widest text-body mb-2.5">Revenue by source</p>

        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
          {recentQueries.map((q, qi) => {
            const c = NS_COLORS[q.ns];
            return (
              <motion.div
                key={`${q.ns}-${q.q}-${qi}`}
                className="rounded-xl border border-white/8 bg-ink-850/20 dark:bg-ink-950/80 px-2.5 py-2"
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: qi === 0 ? 1 : qi === 1 ? 0.8 : qi === 2 ? 0.5 : 0.25,
                  y: 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35, delay: qi * 0.05 }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-[6.5px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded-md ${c.badge}`}>
                    {q.ns}
                  </span>
                  <span className="text-[7px] font-mono text-body/50 ml-auto tabular-nums">{q.t}</span>
                </div>
                <p className="text-[8px] text-paper/75 leading-tight font-mono truncate">{q.q}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   Card5 – Tool Call Inspector
───────────────────────────────────────────── */
export function Card5() {
  const tools = [
    { name: "onboarding", calls: 14, icon: Check, latency: "day 1", color: "bg-gradient-to-b from-signal-lift to-signal-lift", borderColor: "border-signal-lift" },
    { name: "check_in", calls: 8, icon: Clock, latency: "day 30", color: "bg-gradient-to-b from-signal to-signal", borderColor: "border-signal" },
    { name: "expansion", calls: 22, icon: Globe, latency: "day 90", color: "bg-gradient-to-b from-paper to-paper", borderColor: "border-paper" },
    { name: "referral_ask", calls: 31, icon: ChatCircle, latency: "day 120", color: "bg-gradient-to-b from-body to-body", borderColor: "border-body" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-2 w-full">
        {tools.map((t, i) => (
          <motion.div
            key={i}
            className="relative rounded-[12px] border border-white/8 bg-ink-950 dark:bg-ink-950/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between p-2.5 group hover:border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Top Row: 3D Icon + Calls */}
            <div className="flex items-start justify-between">
              <div className={`w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-ink-950 ${t.color} border ${t.borderColor} shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.6),inset_0.5px_0_0_0_rgba(255,255,255,0.2),inset_0_2px_6px_0_rgba(255,255,255,0.3),inset_0_-0.5px_0_0_rgba(0,0,0,0.3),inset_-0.5px_0_0_0_rgba(0,0,0,0.1),inset_0_-2px_6px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06),0_4px_6px_0_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-300`}>
                <t.icon weight="fill" className="w-3.5 h-3.5 relative z-10" />
              </div>

              <div className="flex flex-col items-end gap-0.5 mt-0.5">
                <span className="text-[12px] font-mono font-bold text-paper leading-none">{t.calls}</span>
                <span className="text-[7px] font-mono text-body/80 uppercase tracking-widest leading-none">Runs</span>
              </div>
            </div>

            {/* Bottom Row: Name + Latency + Progress */}
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-paper tracking-tight">{t.name}</span>
                <span className="text-[8px] font-mono text-body tabular-nums">{t.latency}</span>
              </div>
              <div className="w-full h-1.5 bg-ink-850/50 rounded-full overflow-hidden shadow-inner relative">
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 rounded-full ${t.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(t.calls / 31) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Grid Component
───────────────────────────────────────────── */
/*
  One card per sprint, in the order the sprints appear in lib/content.ts. The
  figures inside the visuals are illustrative, like the prices on the pricing
  section - they show the shape of what a sprint produces, not a claim about
  a particular client's numbers.
*/
const CARDS = [
  {
    title: "Conversion Sprint",
    description: "Discovery, pitch and follow-up drawn as one path, so a stall has a location.",
    visual: <Card1 />,
    colSpan: "lg:col-span-1",
    height: "h-[260px]",
  },
  {
    title: "Offer Sprint",
    description: "Price architecture, scope and guarantee, measured against what you discount.",
    visual: <Card2 />,
    colSpan: "lg:col-span-1",
    height: "h-[260px]",
  },
  {
    title: "Message Sprint",
    description: "Six competing angles, tagged on the way out so one of them can win.",
    visual: <Card3 />,
    colSpan: "lg:col-span-1",
    height: "h-[260px]",
  },
  {
    title: "Demand Sprint",
    description: "Channels instrumented to report revenue by source, not leads by source.",
    visual: <Card4 />,
    colSpan: "lg:col-span-2",
    height: "h-[260px]",
  },
  {
    title: "Retention Sprint",
    description: "The sequences after the signature, where the cheapest revenue lives.",
    visual: <Card5 />,
    colSpan: "lg:col-span-1",
    height: "h-[260px]",
  }
];

export interface AgentBentoGridProps {
  className?: string;
}

export function AgentBentoGrid({ className }: AgentBentoGridProps) {
  return (
    /* Two columns from sm, not md: on a phone this used to be five stacked
       260px cards, which is most of the page's mobile scroll on its own. */
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-5xl mx-auto", className)}>
      {CARDS.map((card, idx) => (
        <FeatCard
          key={idx}
          title={card.title}
          description={card.description}
          className={cn(card.colSpan, card.height)}
        >
          {card.visual}
        </FeatCard>
      ))}
    </div>
  );
}

export default AgentBentoGrid;
