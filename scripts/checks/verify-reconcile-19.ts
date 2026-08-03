/**
 * Verify production already contains every schema object represented by
 * 20260802000019_reconcile_dbpush_drift before resolving its failed record.
 *
 * Production received these objects through `prisma db push`; migration 19 was
 * intended to be a guarded no-op there, but its final ALTER INDEX statements
 * were not guarded and failed because the indexes already had their final
 * names. This check makes `migrate resolve --applied` evidence-based rather
 * than blind.
 */
import fs from "node:fs";
import { prisma } from "./_shared";

const MIGRATION = "20260802000019_reconcile_dbpush_drift";

const requiredColumns: Array<[string, string]> = [
  ["Comment", "editedAt"],
  ["Job", "benefits"],
  ["Job", "faq"],
  ["Job", "positionDescription"],
  ["Job", "requirements"],
  ["Job", "salaryMax"],
  ["Job", "salaryMin"],
  ["Post", "discountEndsAt"],
  ["Post", "discountPercent"],
  ["Post", "priceAdjustmentPercent"],
  ["Post", "priceAmount"],
  ["Post", "sellerBenefitPercent"],
  ["Post", "series"],
  ["Post", "seriesOrder"],
  ["Post", "sourceCurrency"],
  ["Post", "sourcePriceAmount"],
  ["User", "banReason"],
  ["User", "bannedAt"],
  ["User", "bio"],
  ["User", "mutedUntil"],
];

const requiredIndexes = [
  "CommentVote_fingerprint_commentId_key",
  "Like_fingerprint_module_slug_key",
  "SlugRedirect_sourceModule_sourceSlug_key",
  "TimelineCommentVote_fingerprint_commentId_key",
  "TimelineLike_fingerprint_eventId_key",
  "PasswordResetToken_token_key",
  "VerificationRequest_status_createdAt_idx",
];

type MigrationRow = {
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

type ColumnRow = { table_name: string; column_name: string };
type IndexRow = { indexname: string };

async function main() {
  const migrationRows = await prisma.$queryRawUnsafe<MigrationRow[]>(
    `SELECT finished_at, rolled_back_at
       FROM "_prisma_migrations"
      WHERE migration_name = $1
      ORDER BY started_at DESC
      LIMIT 1`,
    MIGRATION,
  );
  const migration = migrationRows[0];

  if (migration?.finished_at) {
    writeState("applied");
    console.log(`${MIGRATION} is already recorded as applied.`);
    return;
  }
  if (!migration || migration.rolled_back_at) {
    writeState("pending");
    console.log(`${MIGRATION} has no active failed record; migrate deploy will handle it.`);
    return;
  }

  const columns = await prisma.$queryRaw<ColumnRow[]>`
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'public'
  `;
  const existingColumns = new Set(columns.map((row) => `${row.table_name}.${row.column_name}`));
  const missingColumns = requiredColumns
    .map(([table, column]) => `${table}.${column}`)
    .filter((name) => !existingColumns.has(name));

  const indexes = await prisma.$queryRaw<IndexRow[]>`
    SELECT indexname
      FROM pg_indexes
     WHERE schemaname = 'public'
  `;
  const existingIndexes = new Set(indexes.map((row) => row.indexname));
  const missingIndexes = requiredIndexes.filter((name) => !existingIndexes.has(name));

  if (missingColumns.length || missingIndexes.length) {
    console.error("Refusing to resolve migration 19: production is not fully reconciled.");
    if (missingColumns.length) console.error(`Missing columns: ${missingColumns.join(", ")}`);
    if (missingIndexes.length) console.error(`Missing indexes: ${missingIndexes.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  writeState("failed-but-reconciled");
  console.log(
    `Verified ${requiredColumns.length} columns and ${requiredIndexes.length} indexes; ` +
      `${MIGRATION} is safe to resolve as applied.`,
  );
}

function writeState(state: string) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `state=${state}\n`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
