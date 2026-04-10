import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const manager = await prisma.manager.findUnique({ where: { email } });
  if (!manager) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, manager.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { managerId: manager.id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({
    token,
    manager: { id: manager.id, email: manager.email, name: manager.name },
  });
});

export default router;
