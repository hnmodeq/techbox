import fs from "node:fs";
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const [db]: any = await p.$queryRawUnsafe(
    `select pg_size_pretty(pg_database_size(current_database())) s, pg_database_size(current_database()) b`
  );
  console.log(`LOGICAL DATA SIZE: ${db.s}  (${Number(db.b).toLocaleString()} bytes)`);
  console.log(`Neon free cap    : 0.5 GB = 536,870,912 bytes`);
  console.log(`That is ${((Number(db.b) / 536870912) * 100).toFixed(1)}% of the cap\n`);

  const rows: any[] = await p.$queryRawUnsafe(`
    select c.relname t,
      pg_size_pretty(pg_total_relation_size(c.oid)) total,
      pg_total_relation_size(c.oid) bytes,
      coalesce(s.n_live_tup,0) rows
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    left join pg_stat_user_tables s on s.relid=c.oid
    where n.nspname='public' and c.relkind='r'
    order by pg_total_relation_size(c.oid) desc limit 12`);
  console.log("TOP TABLES");
  for (const r of rows) console.log(`  ${String(r.t).padEnd(28)} ${String(r.total).padStart(9)}  ${Number(r.rows)} rows`);
})().catch(e => console.log("ERR", e.message)).finally(() => p.$disconnect());
