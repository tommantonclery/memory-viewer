/// <reference types="vite/client" />

declare module '*.wasm' {
    const init: () => Promise<any>;
    export default init;
  }
  