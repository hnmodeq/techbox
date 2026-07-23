import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const KEYS = {
  echo: "hero.terminal.echo_lines",
  code: "hero.terminal.code_lines",
  echoEnabled: "hero.terminal.echo_enabled",
  codeEnabled: "hero.terminal.code_enabled",
  echoWeight: "hero.terminal.echo_weight",
};

export const DEFAULT_ECHO_LINES = [
  'echo "Welcome to TechBox — home of Iranian IT engineers"',
  'echo "A box full of technologies, not just a box"',
  'echo "We sell servers. We also hug them sometimes."',
  'echo "Threadripper 7995WX? Yes please. Two of them."',
  'echo "A server without RAID is like tea without sugar"',
  'echo "NVMe all flash. All day. All night. Non-stop."',
  'echo "A NAS walks into a bar. Bartender says: We don\'t serve your type."',
  'echo "My backup strategy? Pray and RAID 6."',
  'echo "There are 10 types of people: those who use RAID and those who cry"',
  'echo "There is no cloud. It\'s just someone else\'s NAS in Iran."',
];

export const DEFAULT_CODE_LINES = [
  'ssh iradmin@techbox.ir "Welcome home, engineer"',
  'curl -s techbox.ir/api/vibes | jq ".warmth"',
  'figlet -f slant "TechBox"',
  'uname -a && echo "Built by engineers, for engineers"',
  'whoami && echo "Iranian IT engineer who never gives up"',
  'cat /etc/motto && echo "Home of Iranian IT"',
  'id -u && echo "uid=0(root) gid=0(iran-devs) groups=storage,servers,network"',
  'hostname && echo "techbox.ir — where servers feel at home"',
  'lscpu | grep "Model name" && echo "We love all of them"',
  'smartctl -a /dev/sda | grep "All Flash"',
  'dmidecode -t memory | head -5 && echo "128GB DDR5 ECC, just for starters"',
  'nvme list && echo "All NVMe. All flash. All day."',
  'cat /proc/cpuinfo | grep "model name" | head -1 && echo "This is art"',
  'sudo echo "Done, boss" && echo "Just kidding. Please do not sudo randomly."',
  'git commit -m "fix: everything" && echo "Pushed to production. Pray."',
  'rm -rf /problems && echo "All fixed"',
  'df -h /data && echo "We have room for your data. Always."',
  'free -h && echo "128GB RAM. For starters."',
  'top -bn1 | head -5 && echo "All processes healthy. Like our servers."',
  'netstat -tlnp | grep ":443" && echo "Secure. Always secure."',
  'iptables -L -n | head -10 && echo "Firewall: ON. Hackers: OFF."',
  'docker ps --format "table {{.Names}}" && echo "Containers running smooth"',
  'kubectl get nodes && echo "K8s cluster: All nodes ready"',
  'terraform plan -no-color | tail -5 && echo "Infrastructure as Code. No surprises."',
  'ansible all -m ping && echo "All servers responding. We are everywhere."',
  'rsync -avz /data/ backup@nas:/vol1/ && echo "Backup complete. Sleep well."',
  'tar czf backup-$(date +%Y%m%d).tar.gz /important && echo "Daily backup done"',
  'crontab -l && echo "Scheduled tasks: All running. Like clockwork."',
  'journalctl -u nginx --since "1 hour ago" | tail -5 && echo "Logs clean."',
  'traceroute techbox.ir -m 15 && echo "Shortest path to tech"',
];

async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await getSetting(key, "");
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const [echoLines, codeLines, echoEnabled, codeEnabled, echoWeight] = await Promise.all([
      getJsonSetting(KEYS.echo, DEFAULT_ECHO_LINES),
      getJsonSetting(KEYS.code, DEFAULT_CODE_LINES),
      getSetting(KEYS.echoEnabled, "true"),
      getSetting(KEYS.codeEnabled, "true"),
      getSetting(KEYS.echoWeight, "70"),
    ]);

    return NextResponse.json({
      echoLines,
      codeLines,
      echoEnabled: echoEnabled === "true",
      codeEnabled: codeEnabled === "true",
      echoWeight: parseInt(echoWeight, 10) || 70,
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch {
    return NextResponse.json({
      echoLines: DEFAULT_ECHO_LINES,
      codeLines: DEFAULT_CODE_LINES,
      echoEnabled: true,
      codeEnabled: true,
      echoWeight: 70,
    }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, string> = {};

  if (Array.isArray(body.echoLines)) {
    updates[KEYS.echo] = JSON.stringify(body.echoLines.filter((l: string) => typeof l === "string" && l.trim()).slice(0, 100));
  }
  if (Array.isArray(body.codeLines)) {
    updates[KEYS.code] = JSON.stringify(body.codeLines.filter((l: string) => typeof l === "string" && l.trim()).slice(0, 50));
  }
  if (typeof body.echoEnabled === "boolean") {
    updates[KEYS.echoEnabled] = String(body.echoEnabled);
  }
  if (typeof body.codeEnabled === "boolean") {
    updates[KEYS.codeEnabled] = String(body.codeEnabled);
  }
  if (typeof body.echoWeight === "number") {
    updates[KEYS.echoWeight] = String(Math.max(0, Math.min(100, body.echoWeight)));
  }

  for (const [key, value] of Object.entries(updates)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedBy: user.id },
      create: { key, value, updatedBy: user.id },
    });
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
