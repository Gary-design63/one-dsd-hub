// Auth bypassed — equity consultant has full access with no login required

const DEFAULT_USER = {
  id: 'user-consultant-1',
  username: 'gbanks',
  role: 'equity_lead',
  full_name: 'Gary Banks',
  department: 'Disability Services Division'
};

function requireAuth(req, res, next) {
  req.user = DEFAULT_USER;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    req.user = DEFAULT_USER;
    next();
  };
}

function optionalAuth(req, res, next) {
  req.user = DEFAULT_USER;
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth, JWT_SECRET: 'unused' };
