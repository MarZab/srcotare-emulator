import { ClientReport } from './client-report.class';
import {Config} from "./config.class";



describe('ClientReport', () => {
  it('should encode a key-value message', () => {
    const config = new Config();

    const coder = new ClientReport(config);
  });
});
