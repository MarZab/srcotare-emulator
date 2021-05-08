import { BitStream } from 'bit-buffer';
import { types } from 'util';

import { Config, TASK_ID_SIZE } from './config.class';

const TEMPLATE_ID_SIZE = 4;
const BLOCK_SIZE = 50 * 8; // part size
const MAX_SIZE = 320 * 8; // transmission max size

/**
 * The type of the transmission
 */
enum ClientReportType {
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
  private _data: Map<number, ArrayBuffer>;
  private _type: ClientReportType;

  private finalized = false;

  /**
   * Create a new Client Report or read an existing one
   * @param _config - system wide config
   * @param v - optional
   */
  constructor(_config: Config, v: ClientReportType);
  constructor(_config: Config, v: ArrayBuffer);
  constructor(private _config: Config, v: ArrayBuffer | ClientReportType) {
    if (types.isArrayBuffer(v)) {
      this.finalized = true;
      const stream = new BitStream(v);
      this._type = stream.readBits(2);
      this._data = new Map();
      switch (this._type) {
        case ClientReportType.TEMPLATE: {
          const templateId = stream.readBits(TEMPLATE_ID_SIZE);
          // loop template
          break;
        }
        case ClientReportType.KEY_VALUE: {
          while (stream.bitsLeft > 0) {
            const taskId = stream.readBits(TASK_ID_SIZE);
            const data = stream.readBitStream(8); // todo, get size of task report
            this._data.set(taskId, data.readArrayBuffer(1));
          }
          break;
        }
      }
    } else {
      this._data = new Map();
      this._type = v;
    }
  }

  public write(taskId: number, data: ArrayBuffer): void {
    this._data.set(taskId, data);
  }

  public read(taskId: number): ArrayBuffer {
    const data = this._data.has(taskId) ? this._data.get(taskId) : undefined;
    if (!data) {
      throw new Error('No data for this task');
    }
    return data;
  }

  public bytes(templateId?: number): ArrayBuffer {
    const stream = new BitStream(new ArrayBuffer(MAX_SIZE));
    switch (this._type) {
      case ClientReportType.KEY_VALUE: {
        stream.writeBits(this._type, 2);
        for (const [k, v] of this._data) {
          stream.writeBits(k, TASK_ID_SIZE);
          stream.writeArrayBuffer(new BitStream(v), 8); // todo get bits from config size of task report
        }
        break;
      }
      case ClientReportType.TEMPLATE: {
        if (!templateId) {
          throw new Error('Template ID Required');
        }
        stream.writeBits(this._type, 2);
        stream.writeBits(templateId, TEMPLATE_ID_SIZE);
        // todo loop template items
        break;
      }
      case ClientReportType.SYSTEM:
      case ClientReportType.CUSTOM: {
        stream.writeBits(this._type, 2);
      }
    }
    stream.index = 0;
    return stream.readArrayBuffer(MAX_SIZE);
  }

  public get type(): ClientReportType {
    return this._type;
  }
}
