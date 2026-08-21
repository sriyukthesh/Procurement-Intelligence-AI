import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { User, Role } from '../types.js';

export const authRouter = Router();

// Current mock session / user
let currentUser: User = db.users.get('usr_po_1') || {
  id: 'usr_po_1',
  email: 'officer@procurement.gov.in',
  name: 'Rajesh Verma (Senior Procurement Officer)',
  role: 'PROCUREMENT_OFFICER',
  organization: 'National Smart Cities Mission',
  createdAt: new Date().toISOString(),
};

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  res.json({
    user: currentUser,
    availableUsers: Array.from(db.users.values()),
  });
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  
  // Find matching user or generate authenticated session
  let user = Array.from(db.users.values()).find((u) => u.email === email);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      email: email || 'officer@procurement.gov.in',
      name: email?.split('@')[0] || 'Procurement User',
      role: (role as Role) || 'PROCUREMENT_OFFICER',
      organization: 'Department of Public Procurement',
      createdAt: new Date().toISOString(),
    };
    db.users.set(user.id, user);
  }

  currentUser = user;

  // Log action
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    targetType: 'AUTH',
    targetId: user.id,
    details: `User logged in with role ${user.role}`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    token: `jwt_cartelx_${user.id}_${Date.now()}`,
    user,
  });
});

// POST /api/auth/switch-demo-user
authRouter.post('/switch-demo-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const targetUser = db.users.get(userId);
  if (targetUser) {
    currentUser = targetUser;
    res.json({ success: true, user: currentUser });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, name, role, organization, companyId } = req.body;
  const newUser: User = {
    id: `usr_${Date.now()}`,
    email,
    name,
    role: role || 'COMPANY',
    organization,
    companyId,
    createdAt: new Date().toISOString(),
  };

  db.users.set(newUser.id, newUser);
  currentUser = newUser;

  res.status(201).json({ user: newUser });
});
