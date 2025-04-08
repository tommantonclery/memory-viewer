# 🧠 memory-viewer

[![Rust](https://img.shields.io/badge/backend-rust-orange.svg)](https://www.rust-lang.org/)
[![WASM](https://img.shields.io/badge/compiled%20to-wasm-blue.svg)](https://webassembly.org/)
[![React](https://img.shields.io/badge/frontend-react-61dafb.svg)](https://reactjs.org/)

> A fast, elegant memory viewer for binary files — built with Rust, WASM, and React.

`memory-viewer` is a sleek tool for inspecting binary files with hex and ASCII views, smart search, keyboard control, and byte-level navigation. Drop in any `.bin` and start exploring — instantly, locally, and with no fuss.

---

## 🚀 Features

- 🔍 Hex and ASCII search with next/prev match navigation
- 🖱 Click-to-select and drag-to-range-select bytes
- ⌨️ Arrow key navigation with shift+selection
- 📋 Copy selected bytes as Hex or ASCII
- 📦 Export selection to `.bin`
- ⚡ Powered by Rust (WASM) for performance
- 🎨 Fully responsive, Tailwind-styled dark UI

---

## 🛠 Getting Started

### 📦 Build the core (Rust → WASM)

```bash
cd core
wasm-pack build --target web
```

### 🌐 Run the frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Make sure you build the WASM core before launching the frontend.

---

## 📂 Usage

1. Open the app in your browser
2. Drop in a `.bin`, `.rom`, `.img`, or other binary file
3. Hover, click, or drag to explore the bytes
4. Use search, copy, and export tools to dig in

---

## 🧪 Example Features

| 🔹 Feature        | Description                             |
|------------------|-----------------------------------------|
| `Search ASCII`   | Type any text and find matches           |
| `Search Hex`     | Enter bytes like `48 65 6C 6C 6F`        |
| `Next / Prev`    | Jump between matches                     |
| `Copy`           | Copy selected region as hex or ASCII     |
| `Export Raw`     | Download selected bytes as `.bin`        |

---

## 🤝 Contributing

Pull requests, ideas, and feedback are very welcome!  
Open an [issue](https://github.com/tomc2154/memory-viewer/issues) or submit a [pull request](https://github.com/tomc2154/memory-viewer/pulls).

---

## 📄 License

MIT License.  
See [`LICENSE`](./LICENSE) for full details.
