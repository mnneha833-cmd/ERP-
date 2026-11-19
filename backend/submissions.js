
import express from 'express';
import { PrismaClient } from '@prisma/client';
import upload from '../middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Team Member: Submit completed task
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { taskId, memberId, description } = req.body;

    if (!taskId || !memberId || !req.file) {
      return res.status(400).json({
        message: 'Task ID, member ID and file are required'
      });
    }

    // Verify that the task belongs to this member
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assignedToId: memberId
      }
    });

    if (!task) {
      return res.status(404).json({
        message: 'Assigned task not found'
      });
    }

    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        memberId,
        description: description || null,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`
      }
    });

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'SUBMITTED'
      }
    });

    res.status(201).json({
      message: 'Task submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submission error:', error);

    res.status(500).json({
      message: 'Unable to submit task'
    });
  }
});

// Team Lead: View submitted tasks
router.get('/', async (req, res) => {
  try {
    const submissions = await prisma.taskSubmission.findMany({
      include: {
        task: true,
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json(submissions);

  } catch (error) {
    console.error('Fetch submissions error:', error);

    res.status(500).json({
      message: 'Unable to fetch submissions'
    });
  }
});

export default router;

