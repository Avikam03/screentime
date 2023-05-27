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
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        result[key] ? resolve(result[key]) : resolve([]);
      });
    });
  },
};
