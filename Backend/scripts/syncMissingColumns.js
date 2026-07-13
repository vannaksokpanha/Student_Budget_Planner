// One-time, additive schema sync: adds columns/enum values the models define
// but the live database is missing. Never drops or narrows anything, so it's
// safe to run against the shared dev database at any time.
//
//   node scripts/syncMissingColumns.js
const sequelize = require('../config/database');
const models = require('../models/associations');

const run = async () => {
    const qi = sequelize.getQueryInterface();

    for (const model of Object.values(models)) {
        const table = model.getTableName();
        let existing;
        try {
            existing = await qi.describeTable(table);
        } catch {
            console.log(`[${table}] table missing — creating`);
            await model.sync();
            continue;
        }

        for (const [name, attr] of Object.entries(model.rawAttributes)) {
            const col = attr.field || name;
            if (!existing[col]) {
                console.log(`[${table}] adding column ${col}`);
                await qi.addColumn(table, col, attr);
            } else if (attr.type.constructor.name === 'ENUM') {
                // Widen the enum if the model defines values the DB lacks
                const dbValues = existing[col].type.match(/enum\((.*)\)/i)?.[1] || '';
                const missing = attr.type.values.filter(v => !dbValues.includes(`'${v}'`));
                if (missing.length) {
                    console.log(`[${table}] widening enum ${col} with: ${missing.join(', ')}`);
                    await qi.changeColumn(table, col, attr);
                }
            }
        }
    }

    console.log('Done.');
    await sequelize.close();
};

run().catch(err => { console.error(err); process.exit(1); });
