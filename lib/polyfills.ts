import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';

class WebCrypto {
  getRandomValues(array: ArrayBufferView): ArrayBufferView {
    if (array === null) throw new Error('Array is null');
    if (!(array instanceof Int8Array || array instanceof Uint8Array || 
          array instanceof Int16Array || array instanceof Uint16Array || 
          array instanceof Int32Array || array instanceof Uint32Array)) {
      throw new Error('Invalid array type');
    }
    return expoCryptoGetRandomValues(array);
  }

  // Stub implementation of required methods
  subtle = {};
  randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

declare global {
  var crypto: WebCrypto;
}

if (typeof global.crypto === 'undefined') {
  global.crypto = new WebCrypto();
}
