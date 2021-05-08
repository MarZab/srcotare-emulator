/**
 * Config contains all the tasks with their settings
 */

export const TASK_ID_SIZE = 4;

export interface TaskConfig {
  // message size in bits, 0 for variable length
  reportMessageSize: number;
}

export class Config {
  private _tasks: Map<number, TaskConfig>;

  constructor() {
    this._tasks = new Map();
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
}
