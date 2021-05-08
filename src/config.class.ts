/**
 * Config contains all the tasks with their settings
 */

export const TASK_ID_SIZE = 4;
export const TEMPLATE_ID_SIZE = 4;

export interface TaskConfig {
  // message size in bits, 0 for variable length
  reportMessageSize: number;
}

export class Config {
  private _tasks: Map<number, TaskConfig>;
  private _templates: Map<number, number[]>;

  constructor() {
    this._tasks = new Map();
    this._templates = new Map();
  }

  getTask(taskId: number): TaskConfig {
    if (taskId > Math.pow(2, TASK_ID_SIZE)) {
      throw new Error('Task ID out of bounds');
    }
    if (taskId === 0) {
      throw new Error('Task ID out of bounds');
    }
    const taskConfig = this._tasks.has(taskId)
      ? this._tasks.get(taskId)
      : undefined;
    if (!taskConfig) {
      throw new Error('Task not defined');
    }
    return taskConfig;
  }

  setTask(taskId: number, taskConfig: TaskConfig): void {
    if (taskId > Math.pow(2, TASK_ID_SIZE)) {
      throw new Error('Task ID out of bounds');
    }
    if (taskId === 0) {
      throw new Error('Task ID out of bounds');
    }
    this._tasks.set(taskId, taskConfig);
    return;
  }

  getTemplate(templateId: number): number[] {
    if (templateId > Math.pow(2, TEMPLATE_ID_SIZE)) {
      throw new Error('Template ID out of bounds');
    }
    if (templateId === 0) {
      throw new Error('Template ID out of bounds');
    }
    if (this._templates.has(templateId)) {
      return this._templates.get(templateId) as number[];
    }
    throw new Error('Template not defined');
  }

  setTemplate(templateId: number, config: number[]): void {
    if (templateId > Math.pow(2, TEMPLATE_ID_SIZE)) {
      throw new Error('Template ID out of bounds');
    }
    if (templateId === 0) {
      throw new Error('Template ID out of bounds');
    }
    this._templates.set(templateId, config);
  }
}
