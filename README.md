# store-easy

A lightweight, type-safe browser storage wrapper for `localStorage` and `sessionStorage` with expiration, namespacing, and default type enforcement.

## 🚀 Features

- ✅ Easy-to-use API for `localStorage` and `sessionStorage`
- 🔒 Type-safe (optional strict mode)
- ⏳ Expiration support (e.g. `1d`, `30min`, etc.)
- 🗂️ Namespace support for scoped keys
- 🔁 Batch set (`setMany`) support
- 🔍 Utility methods: `has`, `getAll`, `isExpired`, etc.

---

## 📦 Installation

```bash
npm install store-easy
```

or

```bash
yarn add store-easy
```

---

## 🛠 Usage

```js
import Store from "store-easy";

// Create a default store using localStorage
const store = new Store();

// Basic usage
store.set("username", "hyunjin", { type: "string" });
const name = store.get("username"); // "hyunjin"

// With expiration (in minutes)
store.set("token", "abc123", { type: "string", expires: "10min" });

// Namespace usage
const profileStore = store.ns("profile");
profileStore.set("age", 20, { type: "int" });

// Batch set
store.setMany([
  ["count", 1, { type: "int" }],
  ["flags", [true, false], { type: "array" }],
]);

// Utility methods
store.has("token"); // true or false
store.isExpired("token"); // true or false
store.getAll(); // { username: "hyunjin", ... }
```

---

## ⚙️ API

### Constructor

```ts
new Store(storageType?: "localStorage" | "sessionStorage", prefix?: string)
```

- `storageType`: `"localStorage"` (default) or `"sessionStorage"`
- `prefix`: optional key prefix for namespacing

---

### Methods

| Method | Description |
|--------|-------------|
| `set(key, value, options?)` | Set a value with optional `type`, `expires`, and `strict` |
| `setMany(entries)` | Batch set multiple key-value pairs |
| `get(key)` | Retrieve a value |
| `remove(key)` | Remove a key |
| `clear()` | Clear all keys (within namespace if used) |
| `has(key)` | Check if a key exists |
| `isExpired(key)` | Check if a key is expired |
| `getAll()` | Get all non-expired values |
| `ns(namespace)` | Create a new store instance scoped to a namespace |

---

## ✅ Type System

The following types are supported under `strict` mode:

- `string`
- `number`
- `int`
- `object`
- `array`
- `boolean`
- `date`

If `strict: false` is passed, type checking is skipped and type defaults to `"no-type"`.

---

## ⏳ Expiration Format

The `expires` option accepts either:

- A number (milliseconds)
- A string (e.g. `"1d"`, `"30min"`, `"10s"`)

Supported units: `s`, `sec`, `m`, `min`, `h`, `d`

---

## 📄 License

MIT © 2025 [jhj]
