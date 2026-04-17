const express = require('express');
const router = express.Router();

const DEFAULT_USER = {
  id: 'user-consultant-1',
  username: 'gbanks',
  role: 'equity_lead',
  full_name: 'Gary Banks',
  department: 'Disability Services Division',
  idi_stage: 'Adaptation'
};

// No login needed — return Gary's profile automatically
router.post('/login', (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(DEFAULT_USER, process.env.JWT_SECRET || 'one-dsd-secret', { expiresIn: '365d' });
  res.json({ token, user: DEFAULT_USER });
});

router.get('/me', (req, res) => {
  res.json({ user: DEFAULT_USER });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'OK' });
});

module.exports = router;
