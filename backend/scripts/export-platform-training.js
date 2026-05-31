const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const outPath = path.join(__dirname, '..', 'ml', 'data', 'platform-training-snapshots.json');

async function main() {
  const snapshots = await prisma.$queryRaw`
    SELECT "rows"
    FROM "platform_training_snapshots"
    ORDER BY "updatedAt" ASC
  `;

  const rows = snapshots.flatMap(snapshot => Array.isArray(snapshot.rows) ? snapshot.rows : []);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');

  console.log(`Exported ${rows.length} platform training rows to ${outPath}`);
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
