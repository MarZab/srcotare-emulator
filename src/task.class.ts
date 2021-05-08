/**
 * A task
 *
 */
import { MessageType } from './message.interface';
type MessageTemplateId = number;
type TaskId = number;

export abstract class Task {
  constructor(private id: TaskId) {}

  /**
   *
   * @private
   */
  private templates: Record<MessageTemplateId, MessageTemplate>;

  /**
   *
   * @param templateId - id of template in this.templates
   * @param data - byte data of size this.templates[templateId].size
   * @private
   */
  private queueMessage(
    templateId: MessageTemplateId,
    data: Uint8Array[],
  ) {}

  /**
   *
   */
  public run() {}
}

class MessageTemplate {
  type: MessageType;
  size: number;
}
