import { db, migrate } from '../lib/db';

console.log('Running migrations...');
migrate();
console.log('Migrations completed.');
db.close();
