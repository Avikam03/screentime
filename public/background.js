const DEBUG = false;

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
    const key = "limitify_data";
    return new Promise((resolve) => {
      const startDate = new Date(value.startTime);
      const endDate = new Date(value.endTime);

      const curweekstartPromise = this.get("limitify_curweek_start");
      const curweekendPromise = this.get("limitify_curweek_end");

      Promise.all([curweekstartPromise, curweekendPromise]).then(
        ([curweekstart, curweekend]) => {
          curweekstart = new Date(curweekstart);
          curweekend = new Date(curweekend);

          if (startDate > curweekend) {
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
              this.set("limitify_curweek_start", startweek),
              this.set("limitify_curweek_end", endweek),
              this.set("limitify_data", {}),
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

            const temp = new Date(curweekend);
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

            this.get(key).then((result) => {
              const dayOfWeek = startDate.getDay().toString();
              if (!result[dayOfWeek]) {
                result[dayOfWeek] = {};
              }
              if (!result[dayOfWeek][value.url]) {
                result[dayOfWeek][value.url] = 0;
              }

              if (!result[dayOfWeek]["total"]) {
                result[dayOfWeek]["total"] = 0;
              }

              var toadd =
                Math.abs(startDate.getTime() - endDate.getTime()) / 1000;
              result[dayOfWeek][value.url] += toadd;
              result[dayOfWeek]["total"] += toadd;

              DEBUG
                ? console.log("just added " + toadd + " seconds to " + value.url)
                : null;

              this.set(key, result).then(() => {
                resolve();
              });
            });
          }
        }
      );
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

  get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
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

  const endweek = new Date(startweek);
  endweek.setDate(startweek.getDate() + 6);
  endweek.setHours(23, 59, 59, 999);

  Promise.all([
    storage.set("limitify_curweek_start", startweek),
    storage.set("limitify_curweek_end", endweek),
    storage.set("limitify_data", {}),
    storage.set("limitify_blocked", {}),
    storage.set("limitify_curtab", {
      id: null,
      url: "newtab",
      favicon: null,
      title: null,
      startTime: null,
      endTime: null,
    }),
  ])
    .then(() => {
      console.log("initialised storage.");
    })
    .catch((error) => {
      console.error("Failed to initialise storage", error);
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
    var storageCurTabReal = {};

    storage
      .get("limitify_curtab")
      .then((result) => {
        storageCurTabReal = result;
        if (
          !chromeurls.includes("chrome://" + storageCurTabReal.url) &&
          storageCurTabReal.url !== ""
        ) {
          var timenow = new Date();
          DEBUG
            ? console.log(
                "windowOnChanged: left " +
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
        return storage.set("limitify_curtab", {
          id: null,
          url: "newtab",
          favicon: null,
          title: null,
          startTime: null,
          endTime: null,
        });
      })
      .catch((error) => {
        console.error("Failed to update tab data:", error);
      });
  } else {
    getCurrentTab()
      .then((tab) => {
        changedTo(tab.id, tab);
      })
      .catch((error) => {
        console.error("Failed to get current tab:", error);
      });
  }
});

function changedTo(tabId, tab) {
  var storageCurTabReal = {};
  const changeurl = new URL(tab.url === "" ? "chrome://newtab/" : tab.url);
  const timenow = new Date();

  storage
    .get("limitify_curtab")
    .then((result) => {
      storageCurTabReal = result;
      if (
        !chromeurls.includes("chrome://" + storageCurTabReal.url) &&
        storageCurTabReal.url !== ""
      ) {
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

      storageCurTabReal = {
        id: tabId,
        url: changeurl.hostname,
        title: tab.title,
        startTime: Date.now(),
        endTime: null,
      };
      return storage.set("limitify_curtab", storageCurTabReal);
    })
    .catch((error) => {
      console.error("Failed to update tab data:", error);
    });

  storage.get("limitify_blocked").then((result) => {
    if (result[changeurl.hostname]) {
      chrome.tabs.get(tabId, (tab) => {
        try {
          setTimeout(() => {
            chrome.tabs.remove(tabId);
          }, 1000);
        } catch (e) {
          DEBUG ? console.log("error removing tab: " + e) : null;
        }
      });
    }
  });
}

function endCurTab() {
  var storageCurTabReal = {};
  storage
    .get("limitify_curtab")
    .then((result) => {
      storageCurTabReal = result;
      if (
        !chromeurls.includes("chrome://" + storageCurTabReal.url) &&
        storageCurTabReal.url !== ""
      ) {
        var timenow = new Date();
        DEBUG
          ? console.log(
              "IDLE: left " +
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
        startTime: null,
        endTime: null,
      };
      return storage.set("limitify_curtab", storageCurTabReal);
    })
    .catch((error) => {
      console.error("Failed to update tab data:", error);
    });
}

chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === "idle") {
    endCurTab();
  } else if (newState === "active") {
    getCurrentTab()
      .then((tab) => {
        changedTo(tab.id, tab);
      })
      .catch((error) => {
        console.error("Failed to get current tab:", error);
      });
  }
});

// used when the user changes url in the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    changedTo(tabId, tab);
  }
});

// used when the user changes tab (includes creating a new tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    changedTo(tab.id, tab);
  });
});
