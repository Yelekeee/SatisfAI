import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { analyzeReview } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// All review routes require auth
router.use(authMiddleware);

// GET /api/reviews — list reviews with optional filters
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { sentiment, category, customerClass, search, page = '1', limit = '20' } = req.query as Record<string, string>;

  const conditions: object[] = [];
  if (sentiment) conditions.push({ aiSentiment: sentiment });
  if (category) conditions.push({ aiCategory: category });
  if (customerClass) conditions.push({ aiCustomerClass: customerClass });
  if (search) {
    conditions.push({
      OR: [
        { reviewText: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ],
    });
  }
  const where = conditions.length > 0 ? { AND: conditions } : {};

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.review.count({ where }),
  ]);

  res.json({ reviews, total, page: pageNum, limit: limitNum });
});

// GET /api/reviews/stats — aggregate stats for dashboard
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  const [total, sentimentCounts, categoryCounts, avgRating, recentNegative] = await Promise.all([
    prisma.review.count(),
    prisma.review.groupBy({ by: ['aiSentiment'], _count: { id: true } }),
    prisma.review.groupBy({ by: ['aiCategory'], _count: { id: true } }),
    prisma.review.aggregate({ _avg: { starRating: true } }),
    prisma.review.count({ where: { aiSentiment: 'negative', createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  res.json({
    total,
    sentimentCounts: Object.fromEntries(sentimentCounts.map((s) => [s.aiSentiment ?? 'unknown', s._count.id])),
    categoryCounts: Object.fromEntries(categoryCounts.map((c) => [c.aiCategory ?? 'unknown', c._count.id])),
    avgRating: avgRating._avg.starRating,
    recentNegative,
  });
});

// GET /api/reviews/:id — single review
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await prisma.review.findUnique({ where: { id: String(req.params.id) } });
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  res.json(review);
});

// POST /api/reviews — create a review (no auto-analysis, manager triggers manually)
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerName, productName, starRating, reviewText, category } = req.body;

  if (!productName || !starRating || !reviewText || !category) {
    res.status(400).json({ error: 'productName, starRating, reviewText, and category are required' });
    return;
  }

  const review = await prisma.review.create({
    data: { customerName, productName, starRating, reviewText, category },
  });

  res.status(201).json(review);
});

// POST /api/reviews/:id/analyze — re-analyze an existing review
router.post('/:id/analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await prisma.review.findUnique({ where: { id: String(req.params.id) } });
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  const result = await analyzeReview(review.reviewText, review.starRating, review.productName);
  const updated = await prisma.review.update({
    where: { id: review.id },
    data: {
      aiSentiment: result.sentiment,
      aiSentimentScore: result.sentimentScore,
      aiCategory: result.category,
      aiCustomerClass: result.customerClass,
      aiKeyPhrases: result.keyPhrases,
      aiComplaintSummary: result.complaintSummary,
      aiEmotion: result.emotion,
      aiAnalyzedAt: new Date(),
    },
  });

  res.json(updated);
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  await prisma.review.delete({ where: { id } });
  res.status(204).send();
});

export default router;
