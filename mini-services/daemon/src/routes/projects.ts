/**
 * Projects Route — CRUD operations for studio projects.
 *
 * Borrowed from Open Design's project management pattern.
 */

import { Router } from 'express';
import { store } from '../lib/store.js';

export const projectsRouter = Router();

// GET /api/projects — List projects
projectsRouter.get('/', (_req, res) => {
  const projects = store.getProjects();
  res.json({ projects });
});

// POST /api/projects — Create a new project
projectsRouter.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ code: 'BAD_REQUEST', message: 'name is required' });
    return;
  }

  const project = store.createProject(name);
  res.json({ project });
});

// GET /api/projects/:id — Get a project
projectsRouter.get('/:id', (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) {
    res.status(404).json({ code: 'PROJECT_NOT_FOUND', message: 'Project not found' });
    return;
  }
  res.json({ project });
});
