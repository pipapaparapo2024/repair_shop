const db = require('../db');

function getRequestById(id) {
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
}

function createRequest(data) {
  const now = data.now;
  const stmt = db.prepare(
    'INSERT INTO requests (clientName, phone, address, problemText, status, assignedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const result = stmt.run(
    data.clientName,
    data.phone,
    data.address,
    data.problemText,
    'new',
    null,
    now,
    now,
  );
  return getRequestById(result.lastInsertRowid);
}

function getRequests(filter) {
  if (filter && filter.status) {
    return db
      .prepare(
        'SELECT * FROM requests WHERE status = ? ORDER BY createdAt DESC',
      )
      .all(filter.status);
  }
  return db
    .prepare('SELECT * FROM requests ORDER BY createdAt DESC')
    .all();
}

function getRequestsByAssignedTo(userId) {
  return db
    .prepare(
      'SELECT * FROM requests WHERE assignedTo = ? ORDER BY createdAt DESC',
    )
    .all(userId);
}

function addHistory(entry) {
  const stmt = db.prepare(
    'INSERT INTO request_history (requestId, prevStatus, nextStatus, changedBy, changedAt) VALUES (?, ?, ?, ?, ?)',
  );
  stmt.run(
    entry.requestId,
    entry.prevStatus,
    entry.nextStatus,
    entry.changedBy,
    entry.changedAt,
  );
}

function getHistoryByRequestId(requestId) {
  return db
    .prepare(
      `
      SELECT
        h.id,
        h.requestId,
        h.prevStatus,
        h.nextStatus,
        h.changedBy,
        h.changedAt,
        u.name AS changedByName
      FROM request_history h
      LEFT JOIN users u ON u.id = h.changedBy
      WHERE h.requestId = ?
      ORDER BY h.changedAt ASC, h.id ASC
    `,
    )
    .all(requestId);
}

function assignRequest(id, assignedTo, now) {
  const stmt = db.prepare(
    'UPDATE requests SET assignedTo = ?, status = ?, updatedAt = ? WHERE id = ?',
  );
  const result = stmt.run(assignedTo, 'assigned', now, id);
  if (result.changes === 0) {
    return null;
  }
  return getRequestById(id);
}

function cancelRequest(id, now) {
  const stmt = db.prepare(
    'UPDATE requests SET status = ?, updatedAt = ? WHERE id = ?',
  );
  const result = stmt.run('canceled', now, id);
  if (result.changes === 0) {
    return null;
  }
  return getRequestById(id);
}

function takeRequest(id, masterId, now) {
  const stmt = db.prepare(
    'UPDATE requests SET status = ?, updatedAt = ? WHERE id = ? AND status = ? AND assignedTo = ?',
  );
  const result = stmt.run('in_progress', now, id, 'assigned', masterId);
  if (result.changes === 0) {
    return null;
  }
  return getRequestById(id);
}

function completeRequest(id, masterId, now) {
  const stmt = db.prepare(
    'UPDATE requests SET status = ?, updatedAt = ? WHERE id = ? AND status = ? AND assignedTo = ?',
  );
  const result = stmt.run('done', now, id, 'in_progress', masterId);
  if (result.changes === 0) {
    return null;
  }
  return getRequestById(id);
}

module.exports = {
  getRequestById,
  createRequest,
  getRequests,
  getRequestsByAssignedTo,
  assignRequest,
  cancelRequest,
  takeRequest,
  completeRequest,
  addHistory,
  getHistoryByRequestId,
};
