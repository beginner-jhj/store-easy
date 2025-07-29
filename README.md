# store-easy

A lightweight, type-safe browser storage wrapper for `localStorage` and `sessionStorage` with namespacing and default type enforcement.

## 🚀 Features

- ✅ Easy-to-use API for `localStorage` and `sessionStorage`
- 🔒 Type-safe (optional strict mode)
- 🗂️ Namespace support for scoped keys
- 🔁 Batch set (`setMany`) support
- 🔍 Utility methods: `has`, `getAll`, etc.

---

## 📦 Installation

```bash
npm install store-easy

or

yarn add store-easy
```

🛠 Usage

```js
import Store from "store-easy";

// Create a default store using localStorage
const store = new Store();

// Basic usage
store.set("username", "hyunjin", { type: "string" });
const name = store.get("username"); // "hyunjin"

// Namespace usage
const profileStore = store.ns("profile");
profileStore.set("age", 20, { type: "int" });

// Batch set
store.setMany([
  ["count", 1, { type: "int" }],
  ["flags", [true, false], { type: "array" }],
]);

// Utility methods
store.has("username"); // true or false
store.getAll(); // { username: "hyunjin", ... }
```

---

## ⚙️ API

### Constructor

```ts
new Store(storageType?: "localStorage" | "sessionStorage", prefix?: string)
storageType: "localStorage" (default) or "sessionStorage"

prefix: optional key prefix for namespacing
```

### Methods

| Method | Description |
|--------|-------------|
| `set(key, value, options?)` | Set a value with optional type and strict options |
| `setMany(entries)` | Batch set multiple key-value pairs |
| `get(key)` | Retrieve a value |
| `remove(key)` | Remove a key |
| `clear()` | Clear all keys (within namespace if used) |
| `has(key)` | Check if a key exists |
| `getAll()` | Get all stored values (within namespace if used) |
| `ns(namespace)` | Create a new store instance scoped to a namespace |

### ✅ Type System
The following types are supported under strict mode:

- string
- number
- int
- object
- array
- boolean
- date

If strict: false is passed, type checking is skipped and type defaults to "no-type".

---

## ❗ Error Handling & Type Failures

`store-easy` includes built-in type validation. For example:

```js
store.set("age", "twenty", { type: "number" });
// ❌ Throws: Type check failed. Expected number.
```

- If `strict: true` and the value does not match the type, a runtime error is thrown.
- If no type is passed and `strict` is false, the value is saved without validation.
- If the namespace is invalid (e.g., empty string), `.ns()` will throw an error.

---

## 🧪 Demo Page

A live demo showcasing namespace separation, type safety, and multi-tab diary functionality:

👉 [https://monologue-one.netlify.app](https://monologue-one.netlify.app)

---

## 🔧 What Problems Does This Library Solve?

- LocalStorage/sessionStorage does not provide native type enforcement — this library ensures that values are stored/retrieved with the correct type.
- Key collision is common in large apps — `store-easy` solves this via namespacing.
- Manually parsing JSON, handling batch sets, or tracking keys can be tedious — `store-easy` simplifies these with a compact API.

---
