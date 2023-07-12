const DEBUG = true;

const chromeurls = [
  "chrome://about",
  "chrome://accessibility",
  "chrome://app-service-internals",
  "chrome://app-settings",
  "chrome://apps",
  "chrome://attribution-internals",
  "chrome://autofill-internals",
  "chrome://blob-internals",
  "chrome://bluetooth-internals",
  "chrome://bookmarks",
  "chrome://chrome-urls",
  "chrome://components",
  "chrome://connectors-internals",
  "chrome://crashes",
  "chrome://credits",
  "chrome://device-log",
  "chrome://dino",
  "chrome://discards",
  "chrome://download-internals",
  "chrome://downloads",
  "chrome://extensions",
  "chrome://extensions-internals",
  "chrome://flags",
  "chrome://gcm-internals",
  "chrome://gpu",
  "chrome://help",
  "chrome://histograms",
  "chrome://history",
  "chrome://history-clusters-internals",
  "chrome://indexeddb-internals",
  "chrome://inspect",
  "chrome://interstitials",
  "chrome://invalidations",
  "chrome://local-state",
  "chrome://management",
  "chrome://media-engagement",
  "chrome://media-internals",
  "chrome://metrics-internals",
  "chrome://net-export",
  "chrome://net-internals",
  "chrome://network-errors",
  "chrome://new-tab-page",
  "chrome://new-tab-page-third-party",
  "chrome://newtab",
  "chrome://ntp-tiles-internals",
  "chrome://omnibox",
  "chrome://optimization-guide-internals",
  "chrome://password-manager",
  "chrome://password-manager-internals",
  "chrome://policy",
  "chrome://predictors",
  "chrome://prefs-internals",
  "chrome://print",
  "chrome://private-aggregation-internals",
  "chrome://process-internals",
  "chrome://profile-internals",
  "chrome://quota-internals",
  "chrome://safe-browsing",
  "chrome://serviceworker-internals",
  "chrome://settings",
  "chrome://signin-internals",
  "chrome://site-engagement",
  "chrome://sync-internals",
  "chrome://system",
  "chrome://terms",
  "chrome://topics-internals",
  "chrome://tracing",
  "chrome://translate-internals",
  "chrome://ukm",
  "chrome://usb-internals",
  "chrome://user-actions",
  "chrome://version",
  "chrome://web-app-internals",
  "chrome://webrtc-internals",
  "chrome://webrtc-logs",
  "chrome://whats-new",
  "chrome://internals/session-service",
];

const storage = {
  add(value) {
    const key = "data";
    return new Promise((resolve) => {
      const startDate = new Date(value.startTime);
      const endDate = new Date(value.endTime);

      this.get("limitify_curweek").then((curweek) => {
        var curweekstart = new Date(curweek.start);
        var curweekend = new Date(curweek.end);

        if (startDate > curweekend) {
          DEBUG
            ? console.log(
                "NEW WEEK: updating curweek in storage & reseting all data"
              )
            : null;
          // new week
          // set curweekstart to start of new week
          // set curweekend to end of new week
          const startweek = new Date(startDate);
          startweek.setDate(startDate.getDate() - startDate.getDay());
          startweek.setHours(0, 0, 0, 0);

          const endweek = new Date(startweek);
          endweek.setDate(startweek.getDate() + 6);
          endweek.setHours(23, 59, 59, 999);

          const promises = [
            this.set("limitify_curweek", {
              start: startweek.getTime(),
              end: endweek.getTime(),
            }),
            this.set(key + "_0", {}),
            this.set(key + "_1", {}),
            this.set(key + "_2", {}),
            this.set(key + "_3", {}),
            this.set(key + "_4", {}),
            this.set(key + "_5", {}),
            this.set(key + "_6", {}),
          ];

          Promise.all(promises).then(() => {
            resolve();
          });
        }

        if (startDate <= curweekend && endDate > curweekend) {
          // case when start and end dates span across multiple weeks
          value.endTime = curweekend;
          this.add(value).then(() => {
            resolve();
          });

          var temp = new Date(curweekend);
          temp.setDate(curweekend.getDate() + 1);
          temp.setHours(0, 0, 0, 0);
          value.startTime = temp;
          value.endTime = endDate;

          this.add(value).then(() => {
            resolve();
          });
        } else if (startDate.getDay() !== endDate.getDay()) {
          // at this point, we know that
          // startDate <= curweekend && endDate <= curweekend
          // however, it's still possible that startDate and endDate span across multiple days

          value.endTime = new Date(startDate);
          value.endTime.setHours(23, 59, 59, 999);

          this.add(value).then(() => {
            value.startTime = new Date(startDate);
            value.startTime.setDate(startDate.getDate() + 1);
            value.startTime.setHours(0, 0, 0, 0);
            value.endTime = new Date(endDate);

            this.add(value).then(() => {
              resolve();
            });
          });
        } else if (startDate.getDay() === endDate.getDay()) {
          // at this point, we know that
          // startDate.getDay() == endDate.getDay()

          const dayOfWeek = startDate.getDay().toString();
          this.get(key + "_" + dayOfWeek).then((result) => {
            if (Object.keys(result).length === 0) {
              result = {};
            }
            if (!result.hasOwnProperty(value.url)) {
              result[value.url] = 0;
            }

            if (!result.hasOwnProperty("total")) {
              result["total"] = 0;
            }

            var toadd =
              Math.abs(startDate.getTime() - endDate.getTime()) / 1000;
            result[value.url] += toadd;
            result["total"] += toadd;

            DEBUG
              ? console.log("+" + toadd + " seconds to " + value.url)
              : null;

            this.set(key + "_" + dayOfWeek, result).then(() => {
              resolve();
            });
          });
        }
      });
    });
  },

  set(key, value) {
    return new Promise((resolve) => {
      const data = { [key]: value };
      chrome.storage.sync.set(data, () => {
        resolve();
      });
    });
  },

  set_local(key, value) {
    return new Promise((resolve) => {
      const data = { [key]: value };
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  },

  get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        resolve(result[key] || []);
      });
    });
  },

  get_local(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || []);
      });
    });
  },
};

chrome.runtime.onInstalled.addListener(() => {
  const currentdate = new Date();
  const startweek = new Date(currentdate);
  startweek.setDate(currentdate.getDate() - currentdate.getDay());
  startweek.setHours(0, 0, 0, 0);
  console.log("startweek set to: " + startweek.toString());

  const endweek = new Date(startweek);
  endweek.setDate(startweek.getDate() + 6);
  endweek.setHours(23, 59, 59, 999);
  console.log("endweek set to: " + endweek.toString());

  Promise.all([
    storage.get("data_0"),
    storage.get("data_1"),
    storage.get("data_2"),
    storage.get("data_3"),
    storage.get("data_4"),
    storage.get("data_5"),
    storage.get("data_6"),

    storage.get("limitify_blocked"),
    storage.get("limitify_curweek"),
    storage.get_local("limitify_curtab"),
  ])
    .then(
      ([
        data0,
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        limitifyBlocked,
        limitifyCurweek,
        limitifyCurtab,
      ]) => {
        console.log("sunday: " + JSON.stringify(data0));
        console.log("monday: " + JSON.stringify(data1));
        console.log("tuesday: " + JSON.stringify(data2));
        console.log("wednesday: " + JSON.stringify(data3));
        console.log("thursday: " + JSON.stringify(data4));
        console.log("friday: " + JSON.stringify(data5));
        console.log("saturday: " + JSON.stringify(data6));
        console.log("limitifyBlocked: " + JSON.stringify(limitifyBlocked));
        console.log("limitifyCurweek: " + JSON.stringify(limitifyCurweek));
        console.log("limitifyCurtab: " + JSON.stringify(limitifyCurtab));

        storage.set("limitify_data", {});
        Object.keys(limitifyBlocked).length === 0
          ? storage.set("limitify_blocked", {})
          : null;

        Object.keys(limitifyCurweek).length === 0
          ? storage.set("limitify_curweek", {
              start: startweek.getTime(),
              end: endweek.getTime(),
            })
          : null;

        Object.keys(limitifyCurtab).length === 0
          ? storage.set_local("limitify_curtab", {
              id: null,
              url: "newtab",
              favicon: null,
              title: null,
              startTime: Date.now(),
              endTime: null,
            })
          : null;

        console.log("Initialized storage.");
      }
    )
    .catch((error) => {
      console.log("ERROR: Failed to initialize storage", error);
    });
});

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab) {
        resolve(tab);
      } else {
        reject(new Error("Unable to retrieve the current tab."));
      }
    });
  });
}

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Set end time of the current tab in storage to right now
    DEBUG ? console.log("WINDOW_LOST_FOCUS: left browser window(s)") : null;
    endCurTab();
  } else {
    DEBUG ? console.log("SWITCHED_WINDOWS: changed browser windows") : null;
    getCurrentTab()
      .then((tab) => {
        changedTo(tab.id, tab);
      })
      .catch((error) => {
        console.log("ERROR: Failed to get current tab:", error);
      });
  }
});

function changedTo(tabId, tab) {
  var storageCurTabReal = {};
  var changeurl = new URL(tab.url === "" ? "chrome://newtab/" : tab.url);
  if (
    tab.url.length >= 19 &&
    tab.url.substring(0, 19) == "chrome-extension://"
  ) {
    DEBUG ? console.log("changed to extension page") : null;
    changeurl = new URL("chrome://newtab/");
  }

  if (tab.url.length >= 5 && tab.url.substring(0, 5) == "file:") {
    DEBUG ? console.log("changed to file page") : null;
    changeurl = new URL("chrome://newtab/");
  }

  const timenow = new Date();

  storage
    .get_local("limitify_curtab")
    .then((result) => {
      storageCurTabReal = result;
      if (!chromeurls.includes("chrome://" + storageCurTabReal.url)) {
        DEBUG
          ? console.log(
              "left " +
                storageCurTabReal.url +
                " at time: " +
                timenow.toLocaleTimeString()
            )
          : null;
        storageCurTabReal.endTime = Date.now();
        return storage.add(storageCurTabReal);
      }
    })
    .then(() => {
      DEBUG
        ? console.log(
            "changed to " +
              changeurl.hostname +
              " at time: " +
              timenow.toLocaleTimeString()
          )
        : null;

      if (
        chromeurls.includes("chrome://" + changeurl.hostname) &&
        chromeurls.includes("chrome://" + storageCurTabReal.url)
      ) {
        return;
      }

      storageCurTabReal = {
        id: tabId,
        url: changeurl.hostname,
        title: tab.title,
        startTime: Date.now(),
        endTime: null,
      };
      return storage.set_local("limitify_curtab", storageCurTabReal);
    })
    .catch((error) => {
      console.log("ERROR: Failed to update tab data:", error);
    });

  if (chromeurls.includes("chrome://" + changeurl.hostname)) {
    return;
  }

  storage.get("limitify_blocked").then((result) => {
    if (result[changeurl.hostname]) {
      chrome.tabs.get(tabId, (tab) => {
        setTimeout(() => {
          try {
            chrome.tabs.remove(tabId);
          } catch (e) {
            DEBUG ? console.log("error removing tab: " + e) : null;
          }
        }, 1000);
      });
    }
  });
}

function endCurTab() {
  var timenow = new Date();
  var storageCurTabReal = {};
  storage
    .get_local("limitify_curtab")
    .then((result) => {
      storageCurTabReal = result;
      if (!chromeurls.includes("chrome://" + storageCurTabReal.url)) {
        DEBUG
          ? console.log(
              "left " +
                storageCurTabReal.url +
                " at time: " +
                timenow.toLocaleTimeString()
            )
          : null;
        storageCurTabReal.endTime = Date.now();
        return storage.add(storageCurTabReal);
      }
    })
    .then(() => {
      storageCurTabReal = {
        id: null,
        url: "newtab",
        favicon: null,
        title: null,
        startTime: Date.now(),
        endTime: null,
      };
      storage.set_local("limitify_curtab", storageCurTabReal);
    })
    .catch((error) => {
      console.log("ERROR: Failed to update tab data:", error);
    });
}

chrome.idle.onStateChanged.addListener((newState) => {
  DEBUG ? console.log("CHANGED STATE TO: " + newState) : null;
  if (newState === "idle") {
    DEBUG ? console.log("IDLE: gone into idling") : null;
    endCurTab();
  } else if (newState === "active") {
    DEBUG ? console.log("ACTIVE: back from being idle") : null;
    getCurrentTab()
      .then((tab) => {
        var changeurl = new URL(tab.url === "" ? "chrome://newtab/" : tab.url);
        var timenow = new Date();

        DEBUG
          ? changeurl.hostname != ""
            ? console.log(
                "changed to " +
                  changeurl.hostname +
                  " at time: " +
                  timenow.toLocaleTimeString()
              )
            : console.log(
                "changed to " +
                  "local file" +
                  " at time: " +
                  timenow.toLocaleTimeString()
              )
          : null;

        storage.set_local("limitify_curtab", {
          id: tab.id,
          url: changeurl.hostname,
          title: tab.title,
          startTime: Date.now(),
          endTime: null,
        });
      })
      .catch((error) => {
        console.log("ERROR: Failed to get current tab:", error);
      });
  } else if (newState === "locked") {
    DEBUG ? console.log("LOCKED: gone into locked") : null;
    endCurTab();
  }
});

// used when the user changes url in the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // DEBUG ? console.log("UPDATED: changed url in same tab") : null;
    changedTo(tabId, tab);
  }
});

// used when the user changes tab (includes creating a new tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
  // DEBUG ? console.log("CHANGED: changed tabs") : null;
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    changedTo(tab.id, tab);
  });
});
