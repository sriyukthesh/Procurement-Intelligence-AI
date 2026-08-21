import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { User, Role, Company } from '../types.js';

export const authRouter = Router();

// Current active session (null by default until authenticated)
let currentUser: User | null = null;

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const usersList = Array.from(db.users.values()).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    organization: u.organization,
    companyId: u.companyId,
    createdAt: u.createdAt,
  }));

  res.json({
    user: currentUser,
    availableUsers: usersList,
  });
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Both Email address and Password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Find matching registered user
  const user = Array.from(db.users.values()).find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  if (!user) {
    return res.status(401).json({
      error: 'No account registered with this email address. Please check your email or Sign Up for a new company account.',
    });
  }

  // Validate password
  if (user.password && user.password !== cleanPass) {
    return res.status(401).json({
      error: 'Incorrect password entered. Please check your password and try again.',
    });
  }

  currentUser = user;

  // Log audit trail
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    targetType: 'AUTH',
    targetId: user.id,
    details: `User authenticated successfully with role ${user.role} (${user.email})`,
    timestamp: new Date().toISOString(),
  });

  const sanitizedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization: user.organization,
    companyId: user.companyId,
    createdAt: user.createdAt,
  };

  res.json({
    token: `jwt_cartelx_${user.id}_${Date.now()}`,
    user: sanitizedUser,
  });
});

// POST /api/auth/register (New Company / Bidder Registration)
authRouter.post('/register', (req: Request, res: Response) => {
  const {
    email,
    password,
    name,
    companyName,
    organization,
    cin,
    gstin,
    pan,
    state,
    industry,
    annualTurnoverCr,
    yearsInBusiness,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Official Email and Password are required to sign up.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Check if account already exists
  const existing = Array.from(db.users.values()).find(
    (u) => u.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    return res.status(400).json({
      error: 'An account with this email address already exists. Please Sign In.',
    });
  }

  const legalName = (companyName || name || 'Registered Bidder Enterprise').trim();
  const compId = `comp_${legalName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)}_${Date.now()}`;

  // Create official company record
  const newCompany: Company = {
    id: compId,
    legalName,
    cin: cin?.trim() || `U45200DL${new Date().getFullYear()}PTC${Math.floor(100000 + Math.random() * 900000)}`,
    gstin: gstin?.trim() || `07AAAAA${Math.floor(1000 + Math.random() * 9000)}B1Z5`,
    pan: pan?.trim() || `AAAAA${Math.floor(1000 + Math.random() * 9000)}B`,
    companyType: 'Private Limited Company',
    registrationDate: new Date().toISOString().split('T')[0],
    registeredAddress: `${legalName} Corporate Office, Industrial Complex`,
    state: state || 'New Delhi',
    district: 'Central',
    contactEmail: cleanEmail,
    contactPhone: '+91 11 2345 6789',
    website: `https://${legalName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
    authorizedRepresentative: name || 'Authorized Director',
    directors: [{ name: name || 'Director Representative', designation: 'Managing Director' }],
    industry: industry || 'Civil Infrastructure & Smart Systems',
    description: `${legalName} - Registered Corporate Bidder on National Procurement Portal.`,
    annualTurnoverCr: Number(annualTurnoverCr) || 45.0,
    yearsInBusiness: Number(yearsInBusiness) || 6,
    isDemo: false,
    status: 'ACTIVE',
    riskScore: 20,
    riskLevel: 'LOW',
  };

  db.companies.set(compId, newCompany);

  // Create User
  const newUser: User = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    password: cleanPass,
    name: name || legalName,
    role: 'COMPANY',
    organization: legalName || organization || 'Registered Contractor Portal',
    companyId: compId,
    createdAt: new Date().toISOString(),
  };

  db.users.set(newUser.id, newUser);
  currentUser = newUser;

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: newUser.id,
    userName: newUser.name,
    userRole: 'COMPANY',
    action: 'COMPANY_ACCOUNT_CREATED',
    targetType: 'USER',
    targetId: newUser.id,
    details: `Created new bidder company account for ${legalName} (${newUser.email})`,
    timestamp: new Date().toISOString(),
  });

  const sanitizedUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    organization: newUser.organization,
    companyId: newUser.companyId,
    createdAt: newUser.createdAt,
  };

  res.status(201).json({
    token: `jwt_cartelx_${newUser.id}_${Date.now()}`,
    user: sanitizedUser,
    company: newCompany,
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  currentUser = null;
  res.json({ success: true, message: 'Logged out successfully.' });
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

