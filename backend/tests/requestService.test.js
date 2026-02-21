process.env.DB_PATH = ':memory:';

const { runMigrations } = require('../src/migrations');
const db = require('../src/db');
const requestService = require('../src/services/requestService');

beforeAll(() => {
  runMigrations();
});

beforeEach(() => {
  db.exec('DELETE FROM request_history; DELETE FROM requests; DELETE FROM users;');
});

function createUser(name, role) {
  const stmt = db.prepare(
    'INSERT INTO users (name, role, password) VALUES (?, ?, ?)',
  );
  const result = stmt.run(name, role, 'password');
  return result.lastInsertRowid;
}

test('заявка проходит статусы new -> assigned -> in_progress -> done', () => {
  const dispatcherId = createUser('Dispatcher', 'dispatcher');
  const masterId = createUser('Master', 'master');

  const created = requestService.createRequest({
    clientName: 'Иван Иванов',
    phone: '+7000',
    address: 'ул. Тестовая, 1',
    problemText: 'Не работает свет',
  });

  expect(created.status).toBe('new');

  const assigned = requestService.assignRequest(created.id, masterId, dispatcherId);
  expect(assigned.status).toBe('assigned');
  expect(assigned.assignedTo).toBe(masterId);

  const inProgress = requestService.takeRequest(created.id, masterId);
  expect(inProgress.status).toBe('in_progress');
  expect(inProgress.assignedTo).toBe(masterId);

  const done = requestService.completeRequest(created.id, masterId);
  expect(done.status).toBe('done');
  expect(done.assignedTo).toBe(masterId);
});

test('повторное взятие в работу даёт ошибку 409', () => {
  const dispatcherId = createUser('Dispatcher', 'dispatcher');
  const masterId = createUser('Master', 'master');

  const created = requestService.createRequest({
    clientName: 'Пётр Петров',
    phone: '+7001',
    address: 'ул. Вторая, 2',
    problemText: 'Не работает кондиционер',
  });

  requestService.assignRequest(created.id, masterId, dispatcherId);

  const first = requestService.takeRequest(created.id, masterId);
  expect(first.status).toBe('in_progress');

  let error;
  try {
    requestService.takeRequest(created.id, masterId);
  } catch (e) {
    error = e;
  }

  expect(error).toBeDefined();
  expect(error.statusCode).toBe(409);
});
