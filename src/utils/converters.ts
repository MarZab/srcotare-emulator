export function* getBitsAsString(buffer: ArrayBuffer): Generator<string> {
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    yield byte.toString(2).padStart(8, '0');
  }
}
