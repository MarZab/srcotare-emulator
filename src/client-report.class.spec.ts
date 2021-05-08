import { ClientReport, ClientReportType } from './client-report.class';
import { Config } from './config.class';
import { getBitsAsString } from './utils/converters';

describe('ClientReport', () => {
  it('should encode/decode a key-value message', () => {
    const config = new Config();

    config.setTask(1, {
      reportMessageSize: 12,
    });

    config.setTask(2, {
      reportMessageSize: 9,
    });

    const coder = new ClientReport(config);

    // encode
    coder.write(1, Uint8Array.from([0b11111111, 0b11110000]));
    coder.write(2, Uint8Array.from([0b11111111, 0b10000000]));

    // decode
    const bytes = coder.bytes(ClientReportType.KEY_VALUE);

    const bit = getBitsAsString(bytes);
    expect(bit.next().value).toEqual('01000111');
    expect(bit.next().value).toEqual('11111111');
    expect(bit.next().value).toEqual('11001011');
    expect(bit.next().value).toEqual('11111110');

    const decoder = new ClientReport(config, bytes);

    expect(decoder.read(1)).toEqual(Uint8Array.from([0b11111111, 0b11110000]));
    expect(decoder.read(2)).toEqual(Uint8Array.from([0b11111111, 0b10000000]));
  });
});
