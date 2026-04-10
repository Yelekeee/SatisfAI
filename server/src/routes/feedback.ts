import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/feedback — public, no auth required, no auto-analysis
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { customerName, productName, starRating, reviewText, category } = req.body;

  if (!productName || !starRating || !reviewText || !category) {
    res.status(400).json({ error: 'productName, starRating, reviewText, and category are required' });
    return;
  }

  const review = await prisma.review.create({
    data: { customerName, productName, starRating: Number(starRating), reviewText, category },
  });

  res.status(201).json(review);
});

export default router;
