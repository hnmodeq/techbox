"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

// Fallback phrases (used when API is unavailable)
const FALLBACK_ECHO = [
  'echo "Welcome to TechBox — home of Iranian IT engineers"',
  'echo "A box full of technologies, not just a box"',
  'echo "We sell servers. We also hug them sometimes."',
];

const FALLBACK_CODE = [
  'ssh iradmin@techbox.ir "Welcome home"',
  'uname -a && echo "Built by engineers"',
];

function TerminalPrompt() {
  return (
    <span className="select-none">
      <span className="text-green-400 font-bold">techbox</span>
      <span className="text-muted-foreground">@</span>
      <span className="text-blue-400 font-bold">ir</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-yellow-400">~</span>
      <span className="text-muted-foreground">$ </span>
    </span>
  );
}

function Caret() {
  return (
    <span className="inline-block w-2 h-4 bg-green-400 align-middle animate-[blink_1s_step-end_infinite] ml-0.5" />
  );
}

/**
 * Pick N random items from an array, never repeating the last `avoidRepeat` items.
 */
function pickRandom<T>(arr: T[], count: number): T[] {
  if (arr.length === 0) return [];
  const result: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx: number;
    let attempts = 0;
    do {
      idx = Math.floor(Math.random() * arr.length);
      attempts++;
    } while (used.has(idx) && attempts < 20);
    used.add(idx);
    result.push(arr[idx]);
    if (used.size >= arr.length) used.clear(); // reset if we've used all
  }
  return result;
}

/**
 * Build a mixed sequence from echo + code lists based on weight.
 * Returns a shuffled array where ~echoWeight% are from echo list.
 */
function buildMixedSequence(
  echoLines: string[],
  codeLines: string[],
  echoWeight: number,
  totalLines: number
): string[] {
  const activeEcho = echoLines.length > 0 ? echoLines : [];
  const activeCode = codeLines.length > 0 ? codeLines : [];

  if (activeEcho.length === 0 && activeCode.length === 0) return [];
  if (activeEcho.length === 0) return pickRandom(activeCode, Math.min(totalLines, activeCode.length));
  if (activeCode.length === 0) return pickRandom(activeEcho, Math.min(totalLines, activeEcho.length));

  // Decide how many from each list
  const echoCount = Math.round(totalLines * (echoWeight / 100));
  const codeCount = totalLines - echoCount;

  const echoPicked = pickRandom(activeEcho, Math.min(echoCount, activeEcho.length));
  const codePicked = pickRandom(activeCode, Math.min(codeCount, activeCode.length));

  // Merge and shuffle (Fisher-Yates)
  const merged = [...echoPicked, ...codePicked];
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }

  return merged;
}

interface TerminalHeroProps {
  lines?: string[];           // Legacy single list (backward compat)
  fullWidth?: boolean;
  echoLines?: string[];
  codeLines?: string[];
  echoEnabled?: boolean;
  codeEnabled?: boolean;
  echoWeight?: number;        // 0-100, default 70
}

export function TerminalHero({
  lines: legacyLines,
  fullWidth,
  echoLines: propEcho,
  codeLines: propCode,
  echoEnabled = true,
  codeEnabled = true,
  echoWeight = 70,
}: TerminalHeroProps) {
  // Use dual lists if provided, fall back to legacy single list, then defaults
  const echoLines = propEcho ?? FALLBACK_ECHO;
  const codeLines = propCode ?? FALLBACK_CODE;

  // Build the sequence for this cycle
  const [sequence, setSequence] = useState<string[]>([]);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentTyped, setCurrentTyped] = useState("");
  const [phase, setPhase] = useState<"command" | "pause">("command");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const initializedRef = useRef(false);
  const prevConfigRef = useRef<string>("");

  // Build a new sequence
  const buildNewSequence = () => {
    const activeEcho = echoEnabled ? echoLines : [];
    const activeCode = codeEnabled ? codeLines : [];
    const total = Math.floor(Math.random() * 8) + 5;
    const seq = buildMixedSequence(activeEcho, activeCode, echoWeight, total);
    if (seq.length > 0) {
      setSequence(seq);
      setCompletedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setCurrentTyped("");
      setPhase("command");
      setDone(false);
    }
  };

  // Only rebuild when config actually changes (not on every re-render)
  useEffect(() => {
    const configKey = `${echoEnabled}-${codeEnabled}-${echoWeight}-${echoLines.length}-${codeLines.length}`;
    if (prevConfigRef.current === configKey) return;
    prevConfigRef.current = configKey;

    if (!initializedRef.current) {
      initializedRef.current = true;
    }
    buildNewSequence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [echoEnabled, codeEnabled, echoWeight, echoLines.length, codeLines.length]);

  // If reduced motion, show everything instantly
  useEffect(() => {
    if (shouldReduceMotion && sequence.length > 0) {
      setCompletedLines(sequence);
      setDone(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion]);

  // Typing animation
  useEffect(() => {
    if (shouldReduceMotion || done || sequence.length === 0) return;

    const line = sequence[currentLineIndex];
    if (!line) { setDone(true); return; }

    if (phase === "command") {
      if (currentCharIndex < line.length) {
        const t = setTimeout(() => {
          setCurrentTyped(line.slice(0, currentCharIndex + 1));
          setCurrentCharIndex((c) => c + 1);
        }, 28 + Math.random() * 20);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setCompletedLines((prev) => [...prev, line]);
          setCurrentTyped("");
          setPhase("pause");
        }, 200);
        return () => clearTimeout(t);
      }
    }

    if (phase === "pause") {
      const t = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
        setPhase("command");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentLineIndex, currentCharIndex, phase, done, shouldReduceMotion, sequence]);

  // Detect user scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      userScrolledUp.current = !atBottom;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll when at bottom
  useEffect(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completedLines, currentTyped]);

  // When cycle done, build a new shuffled sequence and restart
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      buildNewSequence();
    }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Legacy single-list support
  const displayLines = legacyLines && legacyLines.length > 0
    ? (completedLines.length > 0 ? completedLines : legacyLines)
    : completedLines;

  return (
    <div
      className={`w-full ${fullWidth ? "max-w-full" : "max-w-4xl"} mx-auto rounded-xl overflow-hidden border border-border shadow-2xl bg-[#0d1117] font-mono text-sm`}
      dir="ltr"
    >
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="mx-auto text-xs text-[#8b949e]">techbox — bash</span>
      </div>

      <div
        ref={scrollRef}
        className="p-4 h-[250px] overflow-y-auto space-y-1 text-left terminal-scroll"
      >
        {displayLines.map((cmd, i) => (
          <div key={`done-${i}`} className="flex flex-wrap items-center gap-1">
            <TerminalPrompt />
            <span className="text-[#e6edf3] break-all">{cmd}</span>
          </div>
        ))}

        {currentTyped && (
          <div className="flex flex-wrap items-center gap-1">
            <TerminalPrompt />
            <span className="text-[#e6edf3] break-all">{currentTyped}</span>
            {phase === "command" && <Caret />}
          </div>
        )}

        {done && !currentTyped && (
          <div className="flex items-center gap-1">
            <TerminalPrompt />
            <Caret />
          </div>
        )}
      </div>
    </div>
  );
}
