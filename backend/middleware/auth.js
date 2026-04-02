const jwt = require('jsonwebtoken');

// Middleware: Extraer usuario del token JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware: Verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userRole = req.user.role;
    
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no permitido' });
    }

    next();
  };
};

// Middleware: Control de acceso por módulo
const moduleAccessControl = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const userRole = req.user.role;
  const path = req.path;

  // ADMINISTRADOR tiene acceso a todo
  if (userRole === 'ADMINISTRADOR') {
    return next();
  }

  // ENCARGADO tiene acceso solo a ciertos módulos
  if (userRole === 'ENCARGADO') {
    const allowedPaths = ['/products', '/stock', '/sales'];
    const isAllowed = allowedPaths.some(p => path.startsWith(p));
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Acceso denegado a este módulo' });
    }
    
    return next();
  }

  // COCINA por ahora sin acceso definido
  if (userRole === 'COCINA') {
    return res.status(403).json({ error: 'Acceso no definido para COCINA' });
  }

  res.status(403).json({ error: 'Rol desconocido' });
};

module.exports = {
  authMiddleware,
  requireRole,
  moduleAccessControl
};
