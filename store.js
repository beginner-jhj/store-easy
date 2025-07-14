class Store {
  #keys;
  #prefix;

  /**
   * Create a new Store instance
   * @param {"localStorage" | "sessionStorage"} storageType - The type of storage to use
   * @param {string} [prefix] - Optional namespace prefix
   */
  constructor(storageType = "localStorage", prefix = "") {
    this.storage =
      storageType === "localStorage" ? localStorage : sessionStorage;
    this.#prefix = prefix;
    this.#updateKeys();
  }

  /**
   * Create a namespaced store
   * @param {string} namespace - Non-empty string namespace
   * @returns {Store} A new Store instance with the given namespace
   */
  ns(namespace) {
    if (typeof namespace !== "string" || !namespace.trim()) {
      throw new Error("Namespace must be a non-empty string.");
    }
    return new Store(
      this.storage === localStorage ? "localStorage" : "sessionStorage",
      namespace
    );
  }

  /**
   * Get the current keys in storage (filtered by namespace if provided)
   * @returns {string[]} An array of keys
   */
  get keys() {
    return this.#keys;
  }

  #withPrefix(key) {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  #updateKeys() {
    this.#keys = Object.keys(this.storage).filter((key) =>
      this.#prefix ? key.startsWith(this.#prefix + ":") : true
    );
  }

  /**
   * Set a value into storage
   * @param {string} key - The key
   * @param {any} value - The value to store
   * @param {{ 
   * type?: 'string' | 'number' | 'int' | 'object' | 'array' | 'boolean' | 'date', 
   * expires?: number|string, 
   * strict?: boolean 
   * }} [options] - Optional options
   */
  set(key, value, options = {}) {
    const fullKey = this.#withPrefix(key);
    const previous = this.#getMeta(fullKey);

    let {
      type = previous?.type,
      expires,
      strict = previous?.strict ?? true,
    } = options;

    if (strict && !type) {
      throw new Error("Type is required when strict is true");
    }

    if (!type && !strict) {
      type = "no-type";
    }

    if (strict) {
      this.#typeCheck(value, type);
    }

    const expiresAt = expires ? Date.now() + this.#parseExpires(expires) : null;

    const payload = { value, type, strict, expiresAt };
    this.storage.setItem(fullKey, JSON.stringify(payload));
    this.#updateKeys();
  }

  /**
   * Set multiple values at once
   * @param {Array<[string, any, object?]> | Map<string, any>} entries - Iterable entries
   */
  setMany(entries) {
    const iterable = entries instanceof Map ? entries.entries() : entries;
    for (const item of iterable) {
      const [key, value, options = {}] = item;
      const fullKey = this.#withPrefix(key);
      const previous = this.#getMeta(fullKey);

      let {
        type = previous?.type,
        expires,
        strict = previous?.strict ?? true,
      } = options;

      if (strict && !type) {
        throw new Error(`Type is required when strict is true (key: "${key}")`);
      }

      if (!type && !strict) {
        type = "no-type";
      }

      if (strict) {
        this.#typeCheck(value, type);
      }

      const expiresAt = expires ? Date.now() + this.#parseExpires(expires) : null;
      const payload = { value, type, strict, expiresAt };
      this.storage.setItem(fullKey, JSON.stringify(payload));
    }
    this.#updateKeys();
  }

  /**
   * Retrieve a value by key
   * @param {string} key - The key to retrieve
   * @returns {any|null} The stored value, or null if not found or expired
   */
  get(key) {
    const fullKey = this.#withPrefix(key);
    const storedValue = this.storage.getItem(fullKey);
    if (!storedValue) return null;

    try {
      const { value, type, strict, expiresAt } = JSON.parse(storedValue);

      if (expiresAt && Date.now() > expiresAt) {
        this.remove(key);
        return null;
      }

      if (strict && type !== "no-type") {
        this.#typeCheck(value, type);
      }

      return value;
    } catch (e) {
      console.warn(`Invalid stored value for key "${key}"`, e);
      return null;
    }
  }

  /**
   * Remove a value by key
   * @param {string} key - The key to remove
   */
  remove(key) {
    const fullKey = this.#withPrefix(key);
    this.storage.removeItem(fullKey);
    this.#updateKeys();
  }

  /**
   * Clear all keys (filtered by namespace if applicable)
   */
  clear() {
    if (this.#prefix) {
      for (const key of Object.keys(this.storage)) {
        if (key.startsWith(this.#prefix + ":")) {
          this.storage.removeItem(key);
        }
      }
    } else {
      this.storage.clear();
    }
    this.#updateKeys();
  }

  /**
   * Internal: Type checking helper
   * @param {any} value - The value to check
   * @param {string} type - The expected type
   */
  #typeCheck(value, type) {
    const isValid = {
      string: () => typeof value === "string",
      number: () => typeof value === "number",
      int: () => typeof value === "number" && Number.isInteger(value),
      object: () =>
        typeof value === "object" && value !== null && !Array.isArray(value),
      array: () => Array.isArray(value),
      boolean: () => typeof value === "boolean",
      date: () => value instanceof Date,
      "no-type": () => true,
    }[type];

    if (!isValid) {
      throw new Error(
        "Unsupported type. Expected one of: string, number, int, object, array, boolean, date."
      );
    }

    if (!isValid()) {
      throw new Error(`Type check failed. Expected ${type}.`);
    }
  }

  /**
   * Internal: Convert expires input to milliseconds
   * @param {number|string} expires - The expires option
   * @returns {number} Expiration duration in milliseconds
   */
  #parseExpires(expires) {
    const unitToMs = {
      s: 1000,
      sec: 1000,
      m: 60 * 1000,
      min: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    if (typeof expires === "number") return expires;

    if (typeof expires === "string") {
      const match = expires
        .trim()
        .toLowerCase()
        .match(/^(\d+)\s*(s|sec|m|min|h|d)$/);
      if (!match) {
        throw new Error(`Invalid expires format: "${expires}"`);
      }
      const [, amount, unit] = match;
      const ms = unitToMs[unit];
      return parseInt(amount, 10) * ms;
    }

    throw new TypeError(
      "expires must be a number or a string like '1d', '30min', etc."
    );
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Check if a key is expired
   * @param {string} key
   * @returns {boolean}
   */
  isExpired(key) {
    const fullKey = this.#withPrefix(key);
    const raw = this.storage.getItem(fullKey);
    if (!raw) return false;

    try {
      const { expiresAt } = JSON.parse(raw);
      return expiresAt && Date.now() > expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Get all key-value pairs
   * @returns {Record<string, any>} An object containing all keys and values
   */
  getAll() {
    const result = {};
    for (const fullKey of this.#keys) {
      const key = this.#prefix
        ? fullKey.slice(this.#prefix.length + 1)
        : fullKey;
      const value = this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Internal: Retrieve type metadata for a key
   * @param {string} fullKey
   * @returns {{type?: string, strict?: boolean}|null}
   */
  #getMeta(fullKey) {
    const raw = this.storage.getItem(fullKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return {
        type: parsed?.type,
        strict: parsed?.strict,
      };
    } catch {
      return null;
    }
  }
}

export default Store;
