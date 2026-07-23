"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

// 100 fun developer-style phrases — varied commands, no boring echo-only
const DEFAULT_LINES = [
  // ── Welcome ──
  'ssh iradmin@techbox.ir "Welcome home, engineer"',
  'cat /etc/motto && echo "Home of Iranian IT"',
  'curl -s techbox.ir/api/vibes | jq ".warmth"',
  'figlet -f slant "TechBox" | lolcat',

  // ── Who we are ──
  'echo "A box full of technologies, not just a box"',
  'uname -a && echo "Built by engineers, for engineers"',
  'whoami && echo "An Iranian IT engineer who never gives up"',
  'id -u && echo "uid=0(root) gid=0(iran-devs) groups=storage,servers,network"',
  'hostname && echo "techbox.ir — where servers feel at home"',
  'echo "We are not just a website. We are a movement."',

  // ── Servers & Storage ──
  'lscpu | grep "Model name" && echo "We love all of them"',
  'echo "Threadripper 7995WX? Yes please. Two of them."',
  'smartctl -a /dev/sda | grep "All Flash"',
  'echo "We sell servers. We also hug them sometimes."',
  'dmidecode -t memory | head -5 && echo "128GB DDR5 ECC, just for starters"',
  'echo "A server without RAID is like tea without sugar"',
  'cat /proc/cpuinfo | grep "model name" | head -1 && echo "This is art"',
  'echo "We ship servers to Bandar Abbas. Also to Mashhad. Also to your office."',
  'echo "Shipping a 42U rack to Mazandaran? Hold my chai."',
  'echo "We deliver servers everywhere. Even where Google Maps gives up."',
  'echo "FedEx: We cannot deliver there. Us: Watch us."',
  'echo "Storage? We have more options than a Turkish bazaar."',
  'nvme list && echo "All NVMe. All flash. All day."',
  'echo "We travel the world to bring servers home. Customs loves us."',
  'echo "Our warehouse looks like a spaceship hangar"',
  'echo "Every server we sell gets a personal goodbye letter"',
  'echo "We do not just sell hardware. We sell peace of mind."',

  // ── Datacenter ──
  'echo "We build datacenters from scratch. Literally from zero."',
  'echo "Concrete, cables, cooling — we do it all"',
  'echo "Datacenter overhaul? We breathe life into old racks"',
  'echo "We provide the best storage in Iran. Every city. Every province."',
  'echo "From Tehran to Bandar Abbas, our storage travels fast"',
  'echo "UPS + generator + redundant power = sweet dreams"',
  'echo "Our racks are tidier than most people\'s desks"',
  'echo "Hot aisle, cold aisle, warm chai in between"',
  'echo "We have seen datacenters in 14 countries. Ours is better."',
  'echo "Tier 3? We aim for Tier chai — always available"',

  // ── Customers ──
  'echo "MAPNA uses our servers. So can you."',
  'echo "Big Iranian companies trust us. You should too."',
  'echo "We work with enterprises. And startups. And students with big dreams."',
  'echo "Our clients range from banks to bazaar merchants"',
  'echo "Government IT needs an overhaul. We are ready when they call."',
  'echo "Government websites: 3 seconds load time. Our website: instant."',
  'echo "We provide firewalls. Firewalls provide security. Security provides sleep."',
  'echo "FortiGate, Palo Alto, Cisco — we speak all firewall dialects"',

  // ── Culture & Humor ──
  'echo "We are in Karaj, Gohardasht. Come visit. Bring ghormeh sabzi."',
  'echo "Nikamal Tower, Floor 3. The one with the good WiFi."',
  'echo "Our office runs on chai and pure determination"',
  'echo "The office help does not provide tea. We provide our own tears."',
  'echo "We eat ghormeh sabzi while configuring NAS. Multitasking."',
  'echo "Setting up a Synology? That is a 2-ghormeh-sabzi job."',
  'echo "Lunch break? Only after the RAID sync is done."',
  'echo "Red flowers for Hormozgan. Red flowers for Jask. Red flowers for the South."',
  'echo "Red flowers for Bandar Abbas — where servers meet the sea"',
  'echo "If you are from the South, you get free shipping. Just kidding. Maybe."',
  'echo "We like iPads and MacBooks. We pretend Surface does not exist."',
  'echo "Next.js: Fast. .NET: ... let us change the subject."',
  'echo "React makes us happy. jQuery makes us cry."',
  'echo "We write our code in TypeScript. Our docs in Persian. Our love in both."',
  'echo "Sanctions? We built our own supply chain. With blackjack and servers."',
  'echo "The whole world banned us. We said: Challenge accepted."',
  'echo "No matter what the US says, our servers keep running"',
  'echo "Uptime 99.99% even when geopolitics says otherwise"',
  'echo "We do not have AWS. We have something better: ourselves."',
  'echo "Made in Iran, loved by engineers"',
  'echo "Our ping to local servers? Chef\'s kiss."',

  // ── Tech Humor ──
  'echo "There are 10 types of people: those who use RAID and those who cry"',
  'echo "A NAS walks into a bar. Bartender says: We do not serve your type."',
  'echo "Why did the sysadmin go broke? He lost his cache."',
  'echo "How many sysadmins to change a light bulb? None. That is a hardware issue."',
  'echo "There is no cloud. It is just someone else\'s NAS in Iran."',
  'echo "My backup strategy? Pray and RAID 6."',
  'echo "I would tell you a UDP joke, but you might not get it."',
  'echo "Debugging: Being the detective in a crime movie where you are also the murderer"',
  'echo "It works on my NAS. Ship it."',
  'echo "sudo make-me-a-sandwich && echo Done, boss"',
  'echo "Have you tried turning the datacenter off and on again?"',
  'echo "rm -rf /problems && echo All fixed"',
  'echo "git commit -m \'fix: everything\' && echo Pushed to production. Pray."',
  'echo "404: Sleep not found. Server room too loud."',

  // ── Website Features ──
  'echo "Did you check our news sidebar? It is alive and updating."',
  'echo "Our articles are written by engineers, not marketers"',
  'echo "Our content writers actually understand RAID levels"',
  'echo "Have you watched our video reels? They are actually fun."',
  'echo "Check our timeline section — add your own tech milestones"',
  'echo "Register on techbox.ir and walk around. No commitment."',
  'echo "Confirm your identity to unlock badges and more features"',
  'echo "Let us know who you are. We are curious about our community."',
  'echo "Let us support each other. Engineers helping engineers."',
  'echo "Your feedback makes us better. Your complaints make us stronger."',
  'echo "techbox.ir — bookmark it before your colleague does"',
  'echo "We have NAS selectors, RAID calculators, and subnet tools"',
  'echo "Our RAID calculator does not judge your disk choices"',
  'echo "Compare products side by side. Like engineers do."',
  'echo "The consultation button is not decoration. Click it."',
  'echo "Newsletter signup: 2 seconds. Unsubscribe: also 2 seconds. Fair deal."',

  // ── Fun Endings ──
  'echo "This terminal will never stop. Just like Iranian engineers."',
  'echo "EOF — but not end of fun"',
  'echo "Press Ctrl+C to exit. Just kidding. You cannot leave."',
  'echo "Thank you for reading this far. You are a real one."',
  'echo "Now go configure a NAS. You deserve it."',
];

interface TerminalLine {
  command: string;
  output?: string;
}

function buildLines(sentences: string[]): TerminalLine[] {
  return sentences.map((s) => ({
    command: s,
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
  const userScrolledUp = useRef(false);
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

  // Detect when user scrolls up manually
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

  // Auto-scroll only when user is at the bottom
  useEffect(() => {
    if (scrollRef.current && !userScrolledUp.current) {
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
        className="p-4 h-[250px] overflow-y-auto space-y-1 text-left terminal-scroll"
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
