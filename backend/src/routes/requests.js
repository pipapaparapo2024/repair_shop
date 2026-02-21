const express = require('express');
const requestService = require('../services/requestService');
const { loadUser, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const created = requestService.createRequest(req.body || {});
    res.status(201).json(created);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.get('/', loadUser, requireRole('dispatcher'), (req, res) => {
  try {
    const status = req.query.status;
    const requests = requestService.listRequests(
      status ? { status } : undefined,
    );
    res.json(requests);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.get('/my', loadUser, requireRole('master'), (req, res) => {
  try {
    const requests = requestService.listRequestsForMaster(req.user.id);
    res.json(requests);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.patch('/:id/assign', loadUser, requireRole('dispatcher'), (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const assignedTo = req.body.assignedTo;
    const updated = requestService.assignRequest(id, assignedTo, req.user.id);
    res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.patch('/:id/cancel', loadUser, requireRole('dispatcher'), (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const updated = requestService.cancelRequest(id, req.user.id);
    res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.patch('/:id/take', loadUser, requireRole('master'), (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const updated = requestService.takeRequest(id, req.user.id);
    res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.patch('/:id/done', loadUser, requireRole('master'), (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const updated = requestService.completeRequest(id, req.user.id);
    res.json(updated);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

router.get('/:id/history', loadUser, (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const history = requestService.getRequestHistory(id);
    res.json(history);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
});

module.exports = router;
