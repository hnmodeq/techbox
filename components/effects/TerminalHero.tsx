"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_LINES = [
  "به تکباکس خوش اومدی 👋",
  "پلتفرم تخصصی زیرساخت و فناوری اطلاعات",
  "مقاله، ویدیو، انجمن، ابزار، فروشگاه و بیشتر...",
  "محتوای تخصصی برای مهندسان زیرساخت ایران",
  "سرور، شبکه، استوریج، امنیت — همه اینجاست",
];

interface TerminalLine {
  command: string;
  output?: string;
}

function buildLines(sentences: string[]): TerminalLine[] {
  return sentences.map((s, i) => ({
    command: `echo "${s}"`,
    output: s,
  }));
}

function TerminalPrompt({ username = "techbox" }: { username?: string }) {
  return (
    <span className="select-none">
      <span className="text-green-400 font-bold">{username}</span>
      <span className="text-muted-foreground">@</span>
      <span className="text-blue-400 font-bold">techbox</span>
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

interface TerminalHeroProps {
  lines?: string[];
}

export function TerminalHero({ lines: propLines }: TerminalHeroProps) {
  const sentences = propLines && propLines.length > 0 ? propLines : DEFAULT_LINES;
  const terminalLines = useMemo(() => buildLines(sentences), [sentences]);

  const [displayedLines, setDisplayedLines] = useState<
    Array<{ command: string; output?: string; commandDone: boolean; outputDone: boolean }>
  >([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [phase, setPhase] = useState<"command" | "output" | "pause">("command");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion, show everything instantly
  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayedLines(
        terminalLines.map((l) => ({ command: l.command, output: l.output, commandDone: true, outputDone: true }))
      );
      setDone(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || done) return;

    const line = terminalLines[currentLineIndex];
    if (!line) { setDone(true); return; }

    if (phase === "command") {
      if (currentCharIndex < line.command.length) {
        const t = setTimeout(() => {
          setDisplayedLines((prev) => {
            const next = [...prev];
            if (!next[currentLineIndex]) {
              next[currentLineIndex] = { command: "", commandDone: false, outputDone: false };
            }
            next[currentLineIndex] = {
              ...next[currentLineIndex],
              command: line.command.slice(0, currentCharIndex + 1),
            };
            return next;
          });
          setCurrentCharIndex((c) => c + 1);
        }, 28 + Math.random() * 20);
        return () => clearTimeout(t);
      } else {
        // Command typed — mark done, move to output phase
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = { ...next[currentLineIndex], commandDone: true };
          return next;
        });
        const t = setTimeout(() => setPhase("output"), 200);
        return () => clearTimeout(t);
      }
    }

    if (phase === "output") {
      if (line.output) {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = { ...next[currentLineIndex], output: line.output, outputDone: true };
          return next;
        });
      }
      const t = setTimeout(() => setPhase("pause"), 300);
      return () => clearTimeout(t);
    }

    if (phase === "pause") {
      const t = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
        setPhase("command");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentLineIndex, currentCharIndex, phase, done, shouldReduceMotion, terminalLines]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines]);

  // After all lines done, loop from the start after a pause
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setPhase("command");
      setDone(false);
    }, 4000);
    return () => clearTimeout(t);
  }, [done]);

  const currentLine = displayedLines[currentLineIndex];

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-border shadow-2xl bg-[#0d1117] font-mono text-sm"
      dir="ltr"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="mx-auto text-xs text-[#8b949e]">techbox — bash</span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-1 text-left"
        style={{ scrollbarWidth: "none" }}
      >
        {displayedLines.map((l, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-1">
              <TerminalPrompt />
              <span className="text-[#e6edf3] break-all">{l.command}</span>
            </div>
            {l.outputDone && l.output && (
              <div className="text-green-300 pl-2 leading-relaxed">{l.output}</div>
            )}
          </div>
        ))}

        {/* Currently typing line */}
        {!done && (
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <TerminalPrompt />
              <span className="text-[#e6edf3] break-all">
                {currentLine?.command ?? ""}
              </span>
              {phase === "command" && !currentLine?.commandDone && <Caret />}
            </div>
          </div>
        )}

        {done && (
          <div className="flex items-center gap-1">
            <TerminalPrompt />
            <Caret />
          </div>
        )}
      </div>
    </div>
  );
}
