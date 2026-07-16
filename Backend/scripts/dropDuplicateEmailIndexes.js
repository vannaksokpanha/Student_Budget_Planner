// One-time repair: the `users` table accumulated dozens of duplicate UNIQUE
// indexes on `email` (email, email_2, email_3, …) from past sync({ alter:true })
// runs, hitting MySQL's 64-key-per-table limit and crashing boot with
// "Too many keys specified; max 64 keys allowed".
//
// This drops every non-PRIMARY index that covers the `email` column. The next
// plain `sync()` boot re-adds the single named `users_email_unique` index (see
// models/User.js), so uniqueness is restored cleanly with room to spare.
//
//   node scripts/dropDuplicateEmailIndexes.js
const sequelize = require('../config/database');

const run = async () => {
    await sequelize.authenticate();

    // SHOW INDEX gives one row per (index, column). Collect the distinct index
    // names that touch `email`, skipping PRIMARY (can't/shouldn't drop it).
    const [rows] = await sequelize.query('SHOW INDEX FROM `users`');
    const indexNames = [...new Set(
        rows
            .filter(r => r.Column_name === 'email' && r.Key_name !== 'PRIMARY')
            .map(r => r.Key_name)
    )];

    if (indexNames.length === 0) {
        console.log('No email indexes found — nothing to drop.');
        await sequelize.close();
        return;
    }

    console.log(`Found ${indexNames.length} email index(es): dropping all so sync() can re-add a single clean one.`);
    for (const name of indexNames) {
        await sequelize.query('DROP INDEX `' + name + '` ON `users`');
        console.log(`  dropped ${name}`);
    }

    console.log('Done. Restart the backend — sync() will add users_email_unique.');
    await sequelize.close();
};

run().catch(err => { console.error(err); process.exit(1); });
