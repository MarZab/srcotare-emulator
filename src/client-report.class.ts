import { BitStream } from 'bit-buffer';

import { Config, TASK_ID_SIZE, TEMPLATE_ID_SIZE } from './config.class';

const MAX_SIZE = 320; // transmission max size 320

/**
 * The type of the transmission
 */
export enum ClientReportType {
  /**
   * A template report
   * @example
   *    0b000001000000000000000000000
   *    0b00             <- template mode
   *    0b0001           <- template id (TEMPLATE_ID_SIZE)
   *    0b00000000       <- data for task 1 (8 bits)
   *    0b00000000       <- data for task 2 (8 bits)
   *    0b00000          <- data for task 3 (5 bits)
   *    0b..            <- data for task 4 (n bits) fills the rest of BLOCK_SIZE
   */
  TEMPLATE = 0b00,

  /**
   * A key-value report
   * @example
   *    0b0100100000000001000000000001100000
   *    0b01             <- key-value mode
   *    0b0001           <- task 1 id (TASK_ID_SIZE)
   *    0b00000000       <- data for task 1 (8 bits)
   *    0b0010           <- task 2 id (TASK_ID_SIZE)
   *    0b00000000          <- data for task 2 (8 bits)
   *    0b0011           <- task 3 id (TASK_ID_SIZE)
   *    0b00000          <- data for task 2 (5 bits)
   *    0b0100           <- task 4 id (TASK_ID_SIZE)
   *    0b...          <- data for task 2 (n bits) fills the rest of BLOCK_SIZE
   */
  KEY_VALUE = 0b01,

  /**
   * Custom report
   * @example
   *    0b1000000000
   *    0b10             <- custom report mode
   *    0b00000000       <- data
   */
  CUSTOM = 0b10,

  /**
   * System report
   * @example
   *    0b1100000000
   *    0b11             <- system report mode
   *    0b00000000       <- data
   */
  SYSTEM = 0b11,
}

export class ClientReport {
  private _data: Map<number, BitStream>;

  /**
   * Create a new Client Report or read an existing one
   * @param config - system wide config
   * @param data - data from existing report to parse, if any
   */
  constructor(private _config: Config, data?: Uint8Array) {
    if (data !== undefined) {
      this._data = new Map();

      const inBuffer = new ArrayBuffer(data.length);
      const inView = new Uint8Array(inBuffer);
      data.forEach((value, i) => (inView[i] = value));

      const stream = new BitStream(inBuffer);
      stream.bigEndian = true;

      const type = stream.readBits(2);
      switch (type) {
        case ClientReportType.TEMPLATE: {
          const templateId = stream.readBits(TEMPLATE_ID_SIZE);

          const template = this._config.getTemplate(templateId);

          for (const taskId of template) {
            const length = this._config.getTask(taskId).reportMessageSize;

            const inStream = stream.readBitStream(length);
            inStream.bigEndian = true;

            const outStream = new BitStream(
              new ArrayBuffer(Math.ceil(length / 8)),
            );
            outStream.bigEndian = true;

            outStream.writeBitStream(inStream, length);
            outStream.index = 0;

            this._data.set(taskId, outStream);
          }

          break;
        }

        case ClientReportType.KEY_VALUE: {
          while (stream.bitsLeft > 0) {
            const taskId = stream.readBits(TASK_ID_SIZE);
            if (taskId === 0) {
              break;
            }
            const length = this._config.getTask(taskId).reportMessageSize;
            const inStream = stream.readBitStream(length);
            inStream.bigEndian = true;

            const outStream = new BitStream(
              new ArrayBuffer(Math.ceil(length / 8)),
            );
            outStream.bigEndian = true;

            outStream.writeBitStream(inStream, length);
            outStream.index = 0;

            this._data.set(taskId, outStream);
          }
          break;
        }
        default:
          throw new Error(`Template type ${type} not supported`);
      }
    } else {
      this._data = new Map();
    }
  }

  public write(taskId: number, inData: Uint8Array): void {
    const length = this._config.getTask(taskId).reportMessageSize;

    const inBuffer = new ArrayBuffer(inData.length);
    const inView = new Uint8Array(inBuffer);
    inData.forEach((value, i) => (inView[i] = value));

    const inStream = new BitStream(inBuffer);
    inStream.bigEndian = true;
    const outStream = new BitStream(new ArrayBuffer(Math.ceil(length / 8)));
    outStream.bigEndian = true;

    outStream.writeBitStream(inStream, length);
    outStream.index = 0;

    this._data.set(taskId, outStream);
  }

  public read(taskId: number): Uint8Array {
    if (this._data.has(taskId)) {
      const data = this._data.get(taskId);
      if (data !== undefined) {
        const output = data.readArrayBuffer(data.view.byteLength);
        data.index = 0;
        return output;
      }
    }
    throw new Error('No data for this task');
  }

  public bytes(type: ClientReportType, templateId?: number): Uint8Array {
    const stream = new BitStream(new ArrayBuffer(MAX_SIZE));
    stream.bigEndian = true;
    switch (type) {
      case ClientReportType.KEY_VALUE: {
        stream.writeBits(type, 2);
        for (const [taskId, taskBitStream] of this._data) {
          // write task id
          stream.writeBits(taskId, TASK_ID_SIZE);
          const length = this._config.getTask(taskId).reportMessageSize;
          stream.writeBitStream(taskBitStream, length);
        }
        break;
      }

      case ClientReportType.TEMPLATE: {
        if (!templateId) {
          throw new Error('Template ID Required');
        }
        stream.writeBits(ClientReportType.TEMPLATE, 2);
        stream.writeBits(templateId, TEMPLATE_ID_SIZE);

        const template = this._config.getTemplate(templateId);

        for (const taskId of template) {
          const length = this._config.getTask(taskId).reportMessageSize;
          if (!this._data.has(taskId)) {
            // write zeros
            stream.writeBitStream(
              new BitStream(new ArrayBuffer(Math.ceil(length / 8))),
              length,
            );
          } else {
            const taskBitStream = this._data.get(taskId) as BitStream;
            stream.writeBitStream(taskBitStream, length);
          }
        }

        break;
      }
      default:
        throw new Error(`Template type ${type} not supported`);
    }
    stream.index = 0;
    return stream.readArrayBuffer(stream.view.byteLength);
  }
}
