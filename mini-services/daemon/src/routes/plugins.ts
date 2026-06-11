/**
 * Plugins Route — Borrowed from Open Design's plugin-as-filesystem pattern.
 *
 * OD Pattern: Plugins are folders containing `SKILL.md` + `open-design.json`.
 * The daemon serves plugin manifests and handles apply/remove operations.
 */

import { Router } from 'express';
import { store } from '../lib/store.js';

export const pluginsRouter = Router();

// GET /api/plugins — List available plugins
pluginsRouter.get('/', (_req, res) => {
  const plugins = store.getPlugins();
  res.json({ plugins });
});

// POST /api/plugins/apply — Apply a plugin to the active project
pluginsRouter.post('/apply', (req, res) => {
  const { pluginName, inputs } = req.body;

  if (!pluginName) {
    res.status(400).json({ code: 'BAD_REQUEST', message: 'pluginName is required' });
    return;
  }

  const plugin = store.getPlugin(pluginName);
  if (!plugin) {
    res.status(404).json({ code: 'NOT_FOUND', message: `Plugin '${pluginName}' not found` });
    return;
  }

  const project = store.getProject('default');
  if (!project) {
    res.status(404).json({ code: 'PROJECT_NOT_FOUND', message: 'Default project not found' });
    return;
  }

  // Apply plugin to project (OD's AppliedPluginSnapshot pattern)
  const appliedPlugin = {
    id: `${pluginName}-${Date.now()}`,
    name: plugin.name,
    version: plugin.version,
    capabilities: plugin.od?.capabilities || [],
    inputs: inputs || {},
    appliedAt: Date.now(),
  };

  project.plugins.push(appliedPlugin);

  res.json({
    ok: true,
    snapshot: {
      snapshotId: appliedPlugin.id,
      pluginId: pluginName,
      pluginVersion: plugin.version,
      capabilitiesGranted: appliedPlugin.capabilities,
      inputs: appliedPlugin.inputs,
      appliedAt: appliedPlugin.appliedAt,
    },
  });
});

// POST /api/plugins/remove — Remove a plugin from the active project
pluginsRouter.post('/remove', (req, res) => {
  const { pluginName } = req.body;

  const project = store.getProject('default');
  if (!project) {
    res.status(404).json({ code: 'PROJECT_NOT_FOUND', message: 'Default project not found' });
    return;
  }

  const idx = project.plugins.findIndex((p) => p.name === pluginName);
  if (idx === -1) {
    res.status(404).json({ code: 'NOT_FOUND', message: `Plugin '${pluginName}' not applied` });
    return;
  }

  project.plugins.splice(idx, 1);
  res.json({ ok: true });
});
