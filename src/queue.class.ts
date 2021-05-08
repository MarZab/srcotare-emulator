import { MessageInterface } from './message.interface';

export class Queue {
  private messages: MessageInterface<any>[] = [];

  /**
   * Add a message
   *  -
   */
  public upsert(
      message: MessageInterface<any>
  ) {

      // sort by significance

      // cut off queue at 10

  }
}
