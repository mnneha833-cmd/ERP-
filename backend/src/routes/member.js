import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', async (req, res) => {
  const userId = req.user.sub;
  const tasks = await prisma.task.findMany({
    where: { assignedToId: userId },
    include: { project: true },
    orderBy: { updatedAt: 'desc' }
  });
  const count = status => tasks.filter(t => t.status === status).length;
  res.json({
    stats: {
      total: tasks.length,
      inProgress: count('IN_PROGRESS'),
      completed: count('COMPLETED'),
      pending: tasks.filter(t => ['ASSIGNED', 'REVISION_REQUIRED'].includes(t.status)).length
    },
    recentTasks: tasks.slice(0, 5)
  });
});

router.get('/profile', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, name: true, email: true, employeeId: true, department: true, designation: true, phone: true, avatarUrl: true }
  });
  res.json(user);
});

router.put('/profile', async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2).max(80),
    phone: z.string().max(25).optional().nullable(),
    department: z.string().max(80).optional().nullable()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Check the profile fields' });

  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: parsed.data,
    select: { id: true, name: true, email: true, employeeId: true, department: true, designation: true, phone: true }
  });
  res.json(user);
});

router.get('/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: req.user.sub },
    include: { project: true, updates: { orderBy: { createdAt: 'desc' }, take: 3 } },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
  });
  res.json(tasks);
});

router.get('/tasks/:id', async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, assignedToId: req.user.sub },
    include: { project: true, updates: { orderBy: { createdAt: 'desc' } } }
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.post('/tasks/:id/updates', async (req, res) => {
  const parsed = z.object({
    progress: z.number().int().min(0).max(100),
    status: z.enum(['IN_PROGRESS', 'SUBMITTED']),
    workNotes: z.string().min(5).max(3000)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter valid progress, status and work notes' });

  const task = await prisma.task.findFirst({ where: { id: req.params.id, assignedToId: req.user.sub } });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const update = await prisma.$transaction(async tx => {
    const record = await tx.taskUpdate.create({
      data: { ...parsed.data, taskId: task.id, userId: req.user.sub }
    });
    await tx.task.update({
      where: { id: task.id },
      data: { progress: parsed.data.progress, status: parsed.data.status }
    });
    return record;
  });
  res.status(201).json({ message: 'Work progress submitted', update });
});

router.get('/notifications', async (req, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.user.sub },
    orderBy: { createdAt: 'desc' },
    take: 30
  });
  res.json(items);
});

export default router;
