var storageCurTabReal = {
	id: null,
	url: new URL("chrome://newtab/"),
	title: null,
	startTime: null,
	endTime: null
};

console.log("hello world")
// chrome.storage.sync.set({ limitify_raw: [] }).then(() => {
// 	console.log("just set limitify_raw to" + []);
// });
// chrome.storage.sync.set({ limitify_processed: [] }).then(() => {
// 	console.log("just set limitify_processed to" + []);
// });

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId == chrome.windows.WINDOW_ID_NONE) {
		// set end time of cur tab in storage to right now
		if (storageCurTabReal.url.hostname != "newtab") {
			storageCurTabReal.endTime = Date.now();
			console.log(storageCurTabReal);
			chrome.storage.sync.get(['limitify_raw'], function(result) {
				var temparr = result.key ? result.key : [];
				temparr.push(storageCurTabReal);
				chrome.storage.sync.set({'limitify_raw': temparr})
			});
		}
	} else {
		if (storageCurTabReal.url.hostname != "newtab") {
			console.log("changedTo: " + storageCurTabReal.url);
		}
		storageCurTabReal.startTime = Date.now();
	}
})

function changedTo(tabId, tab) {
	var changeurl = new URL(tab.url == "" ? "chrome://newtab/" : tab.url);
	changeurl.hostname != "newtab" ? console.log("changedTo: " + changeurl) : null;

	if (storageCurTabReal.url.hostname != "newtab") {
		storageCurTabReal.endTime = Date.now();
		console.log(storageCurTabReal);
		chrome.storage.sync.get(['limitify_raw'], function(result) {
			var temparr = result.key ? result.key : [];
			temparr.push(storageCurTabReal);
			chrome.storage.sync.set({'limitify_raw': temparr})
		});
	}
	storageCurTabReal = {
		id: tabId,
		url: changeurl,
		title: tab.title,
		startTime: Date.now(),
		endTime: null
	};
}

// listen to onUpdated events so as to be notified when a URL is set.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		changedTo(tabId, tab);
	}
})

chrome.tabs.onCreated.addListener((tab) => {
	changedTo(tab.id, tab);
})

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		changedTo(tab.id, tab);
	});
})

chrome.storage.onChanged.addListener((changes, namespace) => {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
	  console.log(`Storage key "${key}" in namespace "${namespace}" changed.`)
	  console.log(`Old value was "${JSON.stringify(oldValue)}"`)
	  console.log(`new value is "${JSON.stringify(newValue)}"`)
	}
});