/**
 * In-Memory Store — Borrowed from Open Design's daemon data management.
 *
 * OD Pattern: The daemon maintains ephemeral state for runs, projects, and
 * plugin snapshots. In OD's production system this uses SQLite; here we
 * use in-memory storage for the development daemon.
 */

import { v4 as uuid } from 'uuid';

// ── Types ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  brandSystem?: string;
  plugins: AppliedPlugin[];
}

export interface AppliedPlugin {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  inputs: Record<string, unknown>;
  appliedAt: number;
}

export interface Run {
  id: string;
  projectId: string;
  modality: string;
  status: 'running' | 'succeeded' | 'failed' | 'canceled';
  startedAt: number;
  endedAt?: number;
  artifacts: Artifact[];
  eventCount: number;
}

export interface Artifact {
  id: string;
  type: 'html' | 'image' | 'video' | 'audio' | 'model-3d' | 'text';
  url: string;
  mime: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface PluginManifest {
  name: string;
  title?: string;
  version: string;
  description?: string;
  od?: {
    kind?: string;
    taskKind?: string;
    mode?: string;
    capabilities?: string[];
    media?: {
      imageFormats?: string[];
      videoFormats?: string[];
      audioFormats?: string[];
    };
  };
}

// ── Store ────────────────────────────────────────────────────────────────

class StudioStore {
  private projects = new Map<string, Project>();
  private runs = new Map<string, Run>();
  private plugins = new Map<string, PluginManifest>();

  constructor() {
    // Seed with default project
    const defaultProject: Project = {
      id: 'default',
      name: 'My Studio',
      createdAt: Date.now(),
      plugins: [],
    };
    this.projects.set(defaultProject.id, defaultProject);

    // Seed with built-in plugins
    this.seedPlugins();
  }

  private seedPlugins() {
    const builtinPlugins: PluginManifest[] = [
      {
        name: 'text-content-writer',
        title: 'Text Content Writer',
        version: '1.0.0',
        description: 'Generate articles, scripts, and documentation',
        od: { kind: 'skill', taskKind: 'new-generation', mode: 'text', capabilities: ['prompt:inject'] },
      },
      {
        name: 'image-artist',
        title: 'Image Artist',
        version: '1.0.0',
        description: 'Generate images in various styles and sizes',
        od: { kind: 'image-gen', taskKind: 'image-creation', mode: 'image', capabilities: ['prompt:inject', 'image:generate'], media: { imageFormats: ['png', 'jpg', 'webp'] } },
      },
      {
        name: 'video-director',
        title: 'Video Director',
        version: '1.0.0',
        description: 'Generate videos with scene descriptions',
        od: { kind: 'video-gen', taskKind: 'video-creation', mode: 'video', capabilities: ['prompt:inject', 'video:generate'], media: { videoFormats: ['mp4', 'webm'] } },
      },
      {
        name: 'audio-composer',
        title: 'Audio Composer',
        version: '1.0.0',
        description: 'Generate music, sound effects, and voice',
        od: { kind: 'audio-gen', taskKind: 'audio-creation', mode: 'audio', capabilities: ['prompt:inject', 'audio:generate'], media: { audioFormats: ['mp3', 'wav', 'ogg'] } },
      },
      {
        name: 'model-3d-sculptor',
        title: '3D Model Sculptor',
        version: '1.0.0',
        description: 'Generate 3D models and environments',
        od: { kind: 'model-3d-gen', taskKind: 'model-3d-creation', mode: 'model-3d', capabilities: ['prompt:inject', 'model_3d:generate'] },
      },
    ];

    for (const plugin of builtinPlugins) {
      this.plugins.set(plugin.name, plugin);
    }
  }

  // ── Projects ─────────────────────────────────────────────────────────

  getProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  createProject(name: string): Project {
    const project: Project = { id: uuid(), name, createdAt: Date.now(), plugins: [] };
    this.projects.set(project.id, project);
    return project;
  }

  // ── Runs ─────────────────────────────────────────────────────────────

  createRun(projectId: string, modality: string): Run {
    const run: Run = {
      id: uuid(),
      projectId,
      modality,
      status: 'running',
      startedAt: Date.now(),
      artifacts: [],
      eventCount: 0,
    };
    this.runs.set(run.id, run);
    return run;
  }

  getRun(id: string): Run | undefined {
    return this.runs.get(id);
  }

  updateRun(id: string, update: Partial<Run>): Run | undefined {
    const run = this.runs.get(id);
    if (!run) return undefined;
    Object.assign(run, update);
    return run;
  }

  // ── Plugins ──────────────────────────────────────────────────────────

  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(name: string): PluginManifest | undefined {
    return this.plugins.get(name);
  }
}

// Singleton
export const store = new StudioStore();
