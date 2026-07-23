"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const DEFAULT_LINES = [
  'python3 -c "print(\'Welcome to TechBox 👋\')"',
  "curl -s https://techbox.ir/status | jq '.platform'",
  "SELECT * FROM modules WHERE category = 'infrastructure';",
  "docker compose up -d --build techbox-stack",
  "ping -c 5 server network storage security | grep 'all here'",
  "git log --oneline --grep='IT engineers love this'",
  "npm run deploy --env=production --target=iran-devs",
  'echo "Articles | Videos | Forum | Tools | Shop"',
  "traceroute techbox.ir --show-hops=community",
  "sudo systemctl status techbox-platform ● active",
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
  fullWidth?: boolean;
}

export function TerminalHero({ lines: propLines, fullWidth }: TerminalHeroProps) {
  // Only use defaults when propLines is undefined/null, not when it's an empty array
  const sentences = propLines != null ? (propLines.length > 0 ? propLines : []) : DEFAULT_LINES;
  const terminalLines = useMemo(() => buildLines(sentences), [sentences]);

  // Completed lines stay forever (never cleared)
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  // Current typing state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentTyped, setCurrentTyped] = useState("");
  const [phase, setPhase] = useState<"command" | "pause">("command");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion, show everything instantly
  useEffect(() => {
    if (shouldReduceMotion) {
      setCompletedLines(terminalLines.map((l) => l.command));
      setDone(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion]);

  // Reset state when terminalLines change (e.g. API response arrives)
  useEffect(() => {
    if (terminalLines.length > 0) {
      setCompletedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setCurrentTyped("");
      setPhase("command");
      setDone(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalLines]);

  useEffect(() => {
    if (shouldReduceMotion || done) return;

    const line = terminalLines[currentLineIndex];
    if (!line) { setDone(true); return; }

    if (phase === "command") {
      if (currentCharIndex < line.command.length) {
        const t = setTimeout(() => {
          setCurrentTyped(line.command.slice(0, currentCharIndex + 1));
          setCurrentCharIndex((c) => c + 1);
        }, 28 + Math.random() * 20);
        return () => clearTimeout(t);
      } else {
        // Command fully typed — commit to completed lines
        const t = setTimeout(() => {
          setCompletedLines((prev) => [...prev, line.command]);
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
  }, [currentLineIndex, currentCharIndex, phase, done, shouldReduceMotion, terminalLines]);

  // Auto-scroll on every change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completedLines, currentTyped]);

  // When all lines are typed, restart from the beginning (keep old lines)
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setCurrentTyped("");
      setPhase("command");
      setDone(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div
      className={`w-full ${fullWidth ? "max-w-full" : "max-w-4xl"} mx-auto rounded-xl overflow-hidden border border-border shadow-2xl bg-[#0d1117] font-mono text-sm`}
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
        className="p-4 h-[250px] overflow-y-auto space-y-1 text-left"
        style={{ scrollbarWidth: "none" }}
      >
        {/* All completed lines — stay forever */}
        {completedLines.map((cmd, i) => (
          <div key={`done-${i}`} className="flex flex-wrap items-center gap-1">
            <TerminalPrompt />
            <span className="text-[#e6edf3] break-all">{cmd}</span>
          </div>
        ))}

        {/* Currently typing line */}
        {currentTyped && (
          <div className="flex flex-wrap items-center gap-1">
            <TerminalPrompt />
            <span className="text-[#e6edf3] break-all">{currentTyped}</span>
            {phase === "command" && <Caret />}
          </div>
        )}

        {/* Idle caret when all done */}
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
