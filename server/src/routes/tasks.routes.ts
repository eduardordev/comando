import { Router } from 'express';
import type { CreateTaskInput, UpdateTaskInput } from '@comando/shared';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../services/task.service';

export const tasksRouter = Router();

tasksRouter.get('/', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const tasks = await listTasks(status);
  res.json(tasks);
});

tasksRouter.get('/:id', async (req, res) => {
  const task = await getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Tarea no encontrada' });
    return;
  }
  res.json(task);
});

tasksRouter.post('/', async (req, res) => {
  const body = req.body as CreateTaskInput;
  if (!body.title?.trim()) {
    res.status(400).json({ error: 'El título es obligatorio' });
    return;
  }
  const task = await createTask(body);
  res.status(201).json(task);
});

tasksRouter.patch('/:id', async (req, res) => {
  const task = await updateTask(req.params.id, req.body as UpdateTaskInput);
  if (!task) {
    res.status(404).json({ error: 'Tarea no encontrada' });
    return;
  }
  res.json(task);
});

tasksRouter.delete('/:id', async (req, res) => {
  const ok = await deleteTask(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Tarea no encontrada' });
    return;
  }
  res.status(204).send();
});
