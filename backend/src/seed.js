const db = require('./db');

function seed() {
  const now = new Date().toISOString();

  const users = [
    { name: 'Dispatcher', role: 'dispatcher', password: 'password' },
    { name: 'Master 1', role: 'master', password: 'password' },
    { name: 'Master 2', role: 'master', password: 'password' },
  ];

  const insertUser = db.prepare(
    'INSERT INTO users (name, role, password) VALUES (?, ?, ?)',
  );

  const insertRequest = db.prepare(
    'INSERT INTO requests (clientName, phone, address, problemText, status, assignedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const tx = db.transaction(() => {
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if (userCount === 0) {
      users.forEach((u) => insertUser.run(u.name, u.role, u.password));
    }

    const requestCount = db
      .prepare('SELECT COUNT(*) as c FROM requests')
      .get().c;

    if (requestCount === 0) {
      insertRequest.run(
        'Иван Иванов',
        '+70001112233',
        'ул. Ленина, 1',
        'Не работает кондиционер',
        'new',
        null,
        now,
        now,
      );

      insertRequest.run(
        'Петр Петров',
        '+70001112234',
        'ул. Пушкина, 10',
        'Протекает кран',
        'assigned',
        2,
        now,
        now,
      );

      insertRequest.run(
        'Сидор Сидоров',
        '+70001112235',
        'ул. Горького, 5',
        'Не включается свет',
        'in_progress',
        3,
        now,
        now,
      );
    }
  });

  tx();

  console.log('Seed data inserted');
}

seed();

