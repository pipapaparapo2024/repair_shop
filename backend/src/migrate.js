const { runMigrations } = require('./migrations');

runMigrations();
console.log('Migrations applied');

