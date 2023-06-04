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

var storageCurTabReal = {
  id: null,
  url: "newtab",
  favicon: null,
  title: null,
  startTime: null,
  endTime: null,
};

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

              // console.log("just added " + toadd + "seconds to " + value.url);

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
    // set end time of cur tab in storage to right now
    if (!chromeurls.includes("chrome://" + storageCurTabReal.url)) {
      storageCurTabReal.endTime = Date.now();
      storage
        .add(storageCurTabReal)
        .then(() => {})
        .catch((error) => {
          console.error("Failed to add tab data:", error);
        });
    }
  } else {
    getCurrentTab().then((tab) => {
      changedTo(tab.id, tab);
    });
  }
});

function changedTo(tabId, tab) {
  const changeurl = new URL(tab.url === "" ? "chrome://newtab/" : tab.url);
  const timenow = new Date();
  console.log(
    "changed to " +
      changeurl.hostname +
      " at time: " +
      timenow.toLocaleTimeString()
  );
  if (
    !chromeurls.includes("chrome://" + storageCurTabReal.url) &&
    storageCurTabReal.url !== ""
  ) {
    console.log(
      "left " +
        storageCurTabReal.url +
        " at time: " +
        timenow.toLocaleTimeString()
    );
    storageCurTabReal.endTime = Date.now();
    storage
      .add(storageCurTabReal)
      .then(() => {})
      .catch((error) => {
        console.error("Failed to add tab data:", error);
      });
  }
  storageCurTabReal = {
    id: tabId,
    url: changeurl.hostname,
    title: tab.title,
    startTime: Date.now(),
    endTime: null,
  };

  storage.get("limitify_blocked").then((result) => {
    if (result[changeurl.hostname]) {
      chrome.tabs.get(tabId, (tab) => {
        try {
          setTimeout(() => {
            chrome.tabs.remove(tabId);
          }, 1000);
        } catch (e) {
          console.log("error removing tab: " + e);
        }
      });
    }
  });
}

// listen to onUpdated events so as to be notified when a URL is set.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    changedTo(tabId, tab);
  }
});

// chrome.tabs.onCreated.addListener((tab) => {
//   changedTo(tab.id, tab);
// });

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    changedTo(tab.id, tab);
  });
});
