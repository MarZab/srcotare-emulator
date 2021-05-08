import { TaskId } from './task.interface';

export enum MessageStatus {
  QUEUED = 'QUEUED',
  PENDING = 'PENDING',
  SENT = 'SENT',
}

export enum MessageType {
  /**
   * One-off message, that needs to be sent in one part
   *  - use this for important messages
   *  - has a fixed size
   */
  SINGLETON = 'SINGLETON',
  /**
   * Recurring message, that, if not sent, can be removed from
   *  the queue by the task
   *  - use this for less important messages, that can be left out
   *    in certain conditions
   *  - has a fixed size
   */
  RECURRING = 'RECURRING',

  /**
   * Streaming message, that would not fit in a singleton and is
   *  transferred in parts over time
   *  - use this for images, video, etc
   *  - these can be stopped by the server
   */
  STREAM = 'STREAM',
}

export interface MessageInterface<T> {
  taskId: TaskId;

  /**
   * When the message was added (or mutated)
   */
  added: Date;

  /**
   * Current status
   */
  status: MessageStatus;

  /**
   * When this message was sent
   *  - null when status is pending
   */
  sent?: Date;

  type: MessageType;

  /**
   * todo
   */
  data: T;
  size: number;
}
