const DEBUG = true;
const CHROME_URLS = [
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

// Constants for common states/values
const TAB_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  LOCKED: 'locked'
};

const EMPTY_TAB = {
  id: null,
  url: 'newtab',
  title: null,
  startTime: null,
  endTime: null
};

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

// Helper functions
function log(message) {
  if (DEBUG) console.log(message);
}

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    const queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      tab ? resolve(tab) : reject(new Error('Unable to retrieve current tab'));
    });
  });
}

function getUrlHostname(tab) {
  try {
    const url = tab.url || 'chrome://newtab/';
    if (tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('file:')) {
      return 'newtab';
    }
    return new URL(url).hostname;
  } catch (e) {
    return 'newtab';
  }
}

async function saveTabSession(tab) {
  if (!tab?.startTime) return;
  
  tab.endTime = Date.now();
  try {
    await storage.add(tab);
  } catch (error) {
    log(`Failed to save tab session: ${error}`);
  }
}

async function updateCurrentTab(tabId, tab) {
  if (!tab?.url) {
    log('Invalid tab data');
    return;
  }

  const currentTab = await storage.get_local('limitify_curtab');
  const hostname = getUrlHostname(tab);

  // Save previous tab session
  if (currentTab?.startTime && !CHROME_URLS.includes(`chrome://${currentTab.url}`)) {
    await saveTabSession(currentTab);
  }

  // Don't track chrome URLs
  if (CHROME_URLS.includes(`chrome://${hostname}`)) {
    await storage.set_local('limitify_curtab', EMPTY_TAB);
    return;
  }

  // Set up tracking for new tab
  const newTabData = {
    id: tabId,
    url: hostname,
    title: tab.title,
    startTime: Date.now(),
    endTime: null
  };

  await storage.set_local('limitify_curtab', newTabData);

  // Check if site should be blocked
  const blockedSites = await storage.get('limitify_blocked');
  if (blockedSites[hostname]) {
    setTimeout(() => {
      try {
        chrome.tabs.remove(tabId);
      } catch (e) {
        log(`Error removing blocked tab: ${e}`);
      }
    }, 1000);
  }
}

// Event Listeners
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  const currentTab = await storage.get_local('limitify_curtab');

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    log('WINDOW_LOST_FOCUS: left browser window(s)');
    if (currentTab?.startTime) {
      await saveTabSession(currentTab);
      await storage.set_local('limitify_curtab', EMPTY_TAB);
    }
  } else {
    log('SWITCHED_WINDOWS: changed browser windows');
    try {
      const tab = await getCurrentTab();
      await updateCurrentTab(tab.id, tab);
    } catch (error) {
      log(`Failed to handle window focus: ${error}`);
    }
  }
});

chrome.idle.onStateChanged.addListener(async (newState) => {
  log(`CHANGED STATE TO: ${newState}`);
  
  const currentTab = await storage.get_local('limitify_curtab');
  if (!currentTab?.startTime) return;

  await saveTabSession(currentTab);

  if (newState === TAB_STATES.IDLE || newState === TAB_STATES.LOCKED) {
    log(`${newState.toUpperCase()}: gone into ${newState}`);
    await storage.set_local('limitify_curtab', EMPTY_TAB);
  } else if (newState === TAB_STATES.ACTIVE) {
    log(`ACTIVE: back from being ${newState}`);
    try {
      const tab = await getCurrentTab();
      await updateCurrentTab(tab.id, tab);
    } catch (error) {
      log(`Failed to handle active state: ${error}`);
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateCurrentTab(tabId, tab);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateCurrentTab(tab.id, tab);
  });
});
