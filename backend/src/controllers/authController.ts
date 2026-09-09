import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { User, UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';

export const devLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const targetRole = role || UserRole.Citizen;
    const email = `dev@${targetRole.toLowerCase()}.com`;
    const name = `Dev ${targetRole}`;

    let userId = `dev-id-${targetRole.toLowerCase()}`;
    let userRole = targetRole;
    let userName = name;
    let userEmail = email;

    try {
      let user = await User.findOne({ email }).maxTimeMS(2000);
      if (!user) {
        user = await User.create({
          firebaseUid: `dev-uid-${targetRole.toLowerCase()}`,
          email,
          name,
          role: targetRole,
          phone: '555-0000',
        });
      }
      userId = user.id;
      userRole = user.role;
      userName = user.name;
      userEmail = user.email;
    } catch {
      console.warn('DB query timed out/unreachable, returning in-memory dev session');
    }

    const token = generateToken(userId, userRole);
    res.status(200).json({
      _id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Dev login failed', error: error.message });
  }
};

export const loginOrRegister = async (req: Request, res: Response): Promise<void> => {
  const { idToken, role, name, phone } = req.body;

  if (!idToken) {
    res.status(400).json({ message: 'Firebase ID Token is required' });
    return;
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name: fbName } = decodedToken;

    if (!email) {
      res.status(400).json({ message: 'Email not provided by Firebase' });
      return;
    }

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Register new user
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || fbName || 'Anonymous',
        role: role || UserRole.Citizen,
        phone,
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};
