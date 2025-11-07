// Cross-browser API compatibility
const api = typeof browser !== "undefined" ? browser : chrome;

export default {
  add(key, value) {
    return new Promise((resolve) => {
      this.get(key).then((result) => {
        result.push(value);
        this.set(key, result).then(() => {
          resolve();
        });
      });
    });
  },

  set(key, value) {
    return new Promise((resolve) => {
      api.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  get(key) {
    return new Promise((resolve) => {
      api.storage.sync.get([key], (result) => {
        result[key] ? resolve(result[key]) : resolve([]);
      });
    });
  },
};
