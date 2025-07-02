import NIM from 'nim-web-sdk-ng';

declare global {
  interface Window {
    NIM: typeof NIM;
    nim: InstanceType<typeof NIM> | void;
  }
  type strAnyObj = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}
