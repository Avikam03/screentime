// import chromeurls from './chromeurls';

var storageCurTabReal = {
	id: null,
	url: "newtab",
	favicon: null,
	title: null,
	startTime: null,
	endTime: null
};

const storage = {
	add(value) {
		const key = "limitify_data";
		return new Promise((resolve) => {
			const startDate = new Date(value.startTime);
			const endDate = new Date(value.endTime);

			const curweekstartPromise = this.get("limitify_curweek_start");
			const curweekendPromise = this.get("limitify_curweek_end");

			Promise.all([curweekstartPromise, curweekendPromise]).then(([curweekstart, curweekend]) => {
				curweekstart = new Date(curweekstart);
				curweekend = new Date(curweekend);

				if (startDate <= curweekend && endDate > curweekend) {
					value.endTime = curweekend;
					this.add(value).then(() => {
						resolve();
					});
					
					const temp = new Date(endDate);
					temp.setDate(endDate.getDate() - endDate.getDay());
					temp.setHours(0, 0, 0, 0);
					value.startTime = temp;
					value.endTime = endDate;
				}
						
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
						this.set("limitify_data", {})
					];

					Promise.all(promises).then(() => {
						resolve();
					});
				}

				// at this point, we know that
				// startDate <= curweekend && endDate <= curweekend
				// however, it's still possible that startDate and endDate span across multiple days
			
				if (startDate.getDay() !== endDate.getDay()) {
					value.endTime = new Date(startDate);
					value.endTime.setHours(23, 59, 59, 999);
					this.add(value).then(() => {
						resolve();
					});

					value.startTime = new Date(endDate);
					value.startTime.setHours(0, 0, 0, 0);
					value.endTime = new Date(endDate);
				}

				// at this point, we know that
				// startDate.getDay() == endDate.getDay()
				
				this.get(key).then((result) => {
					if (!result[startDate.getDay().toString()]) {
						result[startDate.getDay().toString()] = {};
					}
					if (!result[startDate.getDay().toString()][value.url]) {
						result[startDate.getDay().toString()][value.url] = 0;
					}

					if (!result[startDate.getDay().toString()]["total"]) {
						result[startDate.getDay().toString()]["total"] = 0;
					}
					
					var toadd = Math.abs(startDate.getTime() - endDate.getTime()) / 1000;
					result[startDate.getDay().toString()][value.url] += toadd;
					result[startDate.getDay().toString()]["total"] += toadd;
					
					console.log("just added " + toadd + "seconds")
					console.log("updated seconds for " + value + ": " + result[startDate.getDay().toString()][value.url]);

					this.set(key, result).then(() => {
						resolve();
					});
				});
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

	get(key) {
		return new Promise((resolve) => {
			chrome.storage.sync.get([key], (result) => {
				result[key] ? resolve(result[key]) : resolve([]);
			});
		});
	}
};

console.log("hello world")

var currentdate = new Date();

var startweek = new Date(currentdate);
startweek.setDate(currentdate.getDate() - currentdate.getDay());
startweek.setHours(0, 0, 0, 0);

var endweek = new Date(startweek);
endweek.setDate(startweek.getDate() + 6);
endweek.setHours(23, 59, 59, 999);


Promise.all([
	storage.set("limitify_curweek_start", startweek),
	storage.set("limitify_curweek_end", endweek),
	storage.set("limitify_data", {})
]).then(() => {
	console.log("Storage Initialization complete.");
}).catch((error) => {
	console.error("Storage Initialization failed:", error);
});

  
chrome.windows.onFocusChanged.addListener((windowId) => {	
  if (windowId === chrome.windows.WINDOW_ID_NONE) {	
    // set end time of cur tab in storage to right now	
    // if (chromeurls.includes("chrome://" + storageCurTabReal.url) === false) {
		// console.log("just added " + "chrome://" + storageCurTabReal.url);
	if (storageCurTabReal.url !== "newtab") {	
		storageCurTabReal.endTime = Date.now();	
		console.log(storageCurTabReal);	
		storage.add(storageCurTabReal).then(() => {	
        	console.log("Tab data added.");	
      	}).catch((error) => {	
        	console.error("Failed to add tab data:", error);	
      	});	
    }
  } else {	
    if (storageCurTabReal.url !== "newtab") {	
    	console.log("changedTo: " + storageCurTabReal.url);	
    }	
    storageCurTabReal.startTime = Date.now();	
  }
});

function changedTo(tabId, tab) {	
	var changeurl = new URL(tab.url === "" ? "chrome://newtab/" : tab.url);	
	// var changeurl = tab.url === "" ? "chrome://newtab/" : tab.url;	
	changeurl.hostname !== "newtab" ? console.log("changedTo: " + changeurl) : null;	
	// if (chromeurls.includes("chrome://" + storageCurTabReal.url) === false) {
		// console.log("just added " + "chrome://" + storageCurTabReal.url);
	if (storageCurTabReal.url !== "newtab") {	
		storageCurTabReal.endTime = Date.now();	
		console.log(storageCurTabReal);	
		storage.add(storageCurTabReal).then(() => {	
			console.log("Tab data added.");	
		}).catch((error) => {	
			console.error("Failed to add tab data:", error);	
		});	
	}
	storageCurTabReal = {	
		id: tabId,	
		url: changeurl.hostname,	
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
