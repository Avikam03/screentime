// var storage = chrome.storage.local;
var storage = [];

var storageCurTabReal = {
	id: null,
	url: new URL("chrome://newtab/"),
	title: null,
	startTime: null,
	endTime: null
};

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId == chrome.windows.WINDOW_ID_NONE) {
		// set end time of cur tab in storage to right now
		if (storageCurTabReal.url.hostname != "newtab") {
			storageCurTabReal.endTime = Date.now();
			storage.push(storageCurTabReal);
			console.log(storageCurTabReal);
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
		storage.push(storageCurTabReal);
		console.log(storageCurTabReal);
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