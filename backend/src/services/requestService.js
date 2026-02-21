const requestRepository = require('../repositories/requestRepository');

function now() {
  return new Date().toISOString();
}

function createRequest(payload) {
  const clientName = String(payload.clientName || '').trim();
  const phone = String(payload.phone || '').trim();
  const address = String(payload.address || '').trim();
  const problemText = String(payload.problemText || '').trim();

  if (!clientName || !phone || !address || !problemText) {
    const error = new Error('Missing required fields');
    error.statusCode = 400;
    throw error;
  }

  const timestamp = now();
  const created = requestRepository.createRequest({
    clientName,
    phone,
    address,
    problemText,
    now: timestamp,
  });

  requestRepository.addHistory({
    requestId: created.id,
    prevStatus: null,
    nextStatus: created.status,
    changedBy: null,
    changedAt: timestamp,
  });

  return created;
}

function listRequests(filter) {
  return requestRepository.getRequests(filter || {});
}

function listRequestsForMaster(masterId) {
  return requestRepository.getRequestsByAssignedTo(masterId);
}

function assignRequest(id, assignedTo, actorId) {
  const value = Number(assignedTo);
  if (!Number.isInteger(value) || value <= 0) {
    const error = new Error('Invalid master id');
    error.statusCode = 400;
    throw error;
  }

  const existing = requestRepository.getRequestById(id);
  if (!existing) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  const timestamp = now();
  const updated = requestRepository.assignRequest(id, value, timestamp);
  if (!updated) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  requestRepository.addHistory({
    requestId: id,
    prevStatus: existing.status,
    nextStatus: updated.status,
    changedBy: actorId || null,
    changedAt: timestamp,
  });

  return updated;
}

function cancelRequest(id, actorId) {
  const existing = requestRepository.getRequestById(id);
  if (!existing) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  const timestamp = now();
  const updated = requestRepository.cancelRequest(id, timestamp);
  if (!updated) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  requestRepository.addHistory({
    requestId: id,
    prevStatus: existing.status,
    nextStatus: updated.status,
    changedBy: actorId || null,
    changedAt: timestamp,
  });

  return updated;
}

function takeRequest(id, masterId) {
  const existing = requestRepository.getRequestById(id);
  if (!existing) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  const timestamp = now();
  const updated = requestRepository.takeRequest(id, masterId, timestamp);
  if (!updated) {
    const error = new Error('Request already taken or status changed');
    error.statusCode = 409;
    throw error;
  }

  requestRepository.addHistory({
    requestId: id,
    prevStatus: existing.status,
    nextStatus: updated.status,
    changedBy: masterId,
    changedAt: timestamp,
  });

  return updated;
}

function completeRequest(id, masterId) {
  const existing = requestRepository.getRequestById(id);
  if (!existing) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  const timestamp = now();
  const updated = requestRepository.completeRequest(id, masterId, timestamp);
  if (!updated) {
    const error = new Error('Request cannot be completed');
    error.statusCode = 400;
    throw error;
  }

  requestRepository.addHistory({
    requestId: id,
    prevStatus: existing.status,
    nextStatus: updated.status,
    changedBy: masterId,
    changedAt: timestamp,
  });

  return updated;
}

function getRequestHistory(id) {
  return requestRepository.getHistoryByRequestId(id);
}

module.exports = {
  createRequest,
  listRequests,
  listRequestsForMaster,
  assignRequest,
  cancelRequest,
  takeRequest,
  completeRequest,
  getRequestHistory,
};
