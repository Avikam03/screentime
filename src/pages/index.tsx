import Image from "next/image";
import { Inter } from "next/font/google";
import { useState, useEffect, useCallback, KeyboardEvent } from "react";

import WeekGraph from "../components/weekgraph";

const inter = Inter({ subsets: ["latin"] });

type ScreenTime = {
  [key: string]: {
    [key: string]: number;
  };
};

type SortField = 'website' | 'time' | 'blocked';
type SortDirection = 'asc' | 'desc';

const urlFavicons: Record<string, string> = {
  "mail.google.com": "https://i.imgur.com/RONfcuW.png",
  "calendar.google.com": "https://i.imgur.com/OoAyUL7.png",
  "learn.uwaterloo.ca": "https://i.imgur.com/yVvwU3l.png",
  "web.whatsapp.com": "https://i.imgur.com/47PgHxi.png",
  "linkedin.com": "https://icon.horse/icon/linkedin.com",
  "www.linkedin.com": "https://icon.horse/icon/linkedin.com",
  "app.crowdmark.com":
    "https://crowdmark.com/wp-content/uploads/2022/10/favicon.png",
  "adfs.uwaterloo.ca": "https://uwaterloo.ca/favicon.ico",
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState(
    {} as { [key: string]: number }
  );
  const [weekData, setWeekData] = useState([] as number[]);
  const [selectedBarIndex, setSelectedBarIndex] = useState(0);
  const [todayIndex, setTodayIndex] = useState(0);
  const [allData, setAllData] = useState<ScreenTime>({});
  const [blockedData, setBlockedData] = useState(
    {} as { [key: string]: boolean }
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<{ [key: string]: number }>({});
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleBarClick = (index: number) => {
    setSelectedBarIndex(index);
    // Do something with the selected bar data
  };

  const handleToggle =
    (website: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newBlockedData = { ...blockedData };
      newBlockedData[website] = !newBlockedData[website];
      setBlockedData(newBlockedData);
      console.log("Clicked on toggle. New blocked data:", newBlockedData)

      import("../../public/storage.js").then((storage) =>
        Promise.all([
          storage.default.set("limitify_blocked", newBlockedData),
        ]).then(() => {
            // If we just blocked this site, check if we're currently on it
            if (newBlockedData[website] && typeof window !== 'undefined') {
                // Get the browser API (only available in browser context)
                const api = typeof (window as any).browser !== 'undefined' 
                    ? (window as any).browser 
                    : (window as any).chrome;
                
                if (api && api.tabs) {
                    // Get the current active tab
                    api.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                        if (tabs && tabs[0]) {
                            const currentTab = tabs[0];
                            try {
                                const currentUrl = new URL(currentTab.url || '');
                                const currentHostname = currentUrl.hostname;
                                
                                // If current tab matches the blocked website, close it
                                if (currentHostname === website) {
                                    console.log(`Closing tab for blocked site: ${website} with tab id ${currentTab.id}`);
                                    // close after a sec
                                    setTimeout(() => api.tabs.remove(currentTab.id), 1000);
                                }
                            } catch (e) {
                                console.log("Could not parse current tab URL:", e);
                            }
                        }
                    });
                }
            }
        })
      );
    };

  useEffect(() => {
    setLoading(true);

    // Run the code only on the client-side
    if (typeof window !== "undefined") {
      Promise.all([
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_0")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_1")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_2")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_3")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_4")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_5")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("data_6")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("limitify_blocked")
        ),
      ]).then(
        ([data0, data1, data2, data3, data4, data5, data6, blockedResult]) => {
          var tempAllData: ScreenTime = {
            "0": data0,
            "1": data1,
            "2": data2,
            "3": data3,
            "4": data4,
            "5": data5,
            "6": data6,
          };

          var curDate = new Date();

          setSelectedBarIndex(curDate.getDay());
          setTodayIndex(curDate.getDay());
          setAllData(tempAllData);

          // Process tempAllData
          var todaysData: { [key: string]: number } =
            tempAllData[curDate.getDay().toString()] || {};

          var sortedData = Object.entries(todaysData).sort(
            (a, b) => b[1] - a[1]
          );
          todaysData = Object.fromEntries(sortedData);
          setProcessedData(todaysData);

          console.log("today's data: ");
          console.log(todaysData);

          // Process "limitify_blocked"
          if (blockedResult) {
            setBlockedData(blockedResult);
          }

          var weekData = [];
          weekData.push(tempAllData["0"]?.total || 0);
          weekData.push(tempAllData["1"]?.total || 0);
          weekData.push(tempAllData["2"]?.total || 0);
          weekData.push(tempAllData["3"]?.total || 0);
          weekData.push(tempAllData["4"]?.total || 0);
          weekData.push(tempAllData["5"]?.total || 0);
          weekData.push(tempAllData["6"]?.total || 0);

          setWeekData(weekData);

          setLoading(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && allData) {
      setLoading(true);
      var daydata: { [key: string]: number } =
        allData[selectedBarIndex.toString()] || {};
      var sortedData = Object.entries(daydata).sort((a, b) => b[1] - a[1]);
      daydata = Object.fromEntries(sortedData);
      setProcessedData(daydata);
      setFilteredData(daydata);
      setLoading(false);
    }
  }, [selectedBarIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = Object.entries(processedData)
        .filter(([key]) => 
          key.toLowerCase().includes(searchQuery.toLowerCase()) && 
          key !== "total" && 
          key !== ""
        )
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
      setFilteredData(filtered);
    } else {
      setFilteredData(processedData);
    }
  }, [searchQuery, processedData]);

  useEffect(() => {
    if (searchOpen) {
      // Find and focus the search input when searchOpen becomes true
      const searchInput = document.getElementById('website-search');
      searchInput?.focus();
    }
  }, [searchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBlur = () => {
    setSearchOpen(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it with default direction
      setSortField(field);
      setSortDirection(field === 'time' ? 'desc' : 'asc');
    }
  };

  const getSortedData = () => {
    const dataEntries = Object.entries(filteredData)
      .filter(([key]) => key !== "total" && key !== "");

    return dataEntries.sort(([keyA, valueA], [keyB, valueB]) => {
      if (sortField === 'website') {
        return sortDirection === 'asc' 
          ? keyA.localeCompare(keyB)
          : keyB.localeCompare(keyA);
      }
      if (sortField === 'time') {
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
      if (sortField === 'blocked') {
        const blockedA = blockedData[keyA] || false;
        const blockedB = blockedData[keyB] || false;
        return sortDirection === 'asc'
          ? Number(blockedA) - Number(blockedB)
          : Number(blockedB) - Number(blockedA);
      }
      return 0;
    });
  };

  useEffect(() => {
    // Check if user has theme saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // If no saved theme, check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <body className={`bg-white dark:bg-[#272624] min-h-screen ${inter.className}`}>
      <div className="px-3 py-3">
        {loading ? (
          <h2 className="mt-4 text-4xl font-extrabold text-black dark:text-white">
            Loading...
          </h2>
        ) : null}

        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="ml-2 mt-4 text-lg text-black dark:text-white">Usage</h2>
              <h1 className="ml-2 mt-2 text-4xl text-black dark:text-white">
                {processedData["total"] == undefined
                  ? "no usage recorded"
                  : Math.ceil(processedData["total"]) > 3600
                  ? Math.floor(Math.ceil(processedData["total"]) / 3600) +
                    "h " +
                    Math.floor((Math.ceil(processedData["total"]) % 3600) / 60) +
                    "min"
                  : Math.ceil(processedData["total"]) > 60
                  ? Math.floor(Math.ceil(processedData["total"]) / 60) + "min"
                  : Math.floor(Math.ceil(processedData["total"])) + "s"}
              </h1>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-[#31302e] 
                hover:ring-2 hover:ring-neutral-400 dark:hover:ring-neutral-600
                transition-all duration-200 ease-in-out
                mr-2"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg 
                  className="w-6 h-6 text-neutral-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-6 h-6 text-neutral-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              )}
            </button>
          </div>

          <WeekGraph
            data={weekData}
            selectedBarIndex={selectedBarIndex}
            onBarClick={handleBarClick}
          />

          <div className="relative mb-4">
            <div className="flex items-center">
              <input
                id="website-search"
                type="text"
                placeholder="Search websites... (⌘K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchOpen(true)}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 text-sm text-black dark:text-white 
                  bg-gray-100 dark:bg-[#31302e] rounded-lg 
                  focus:outline-none
                  transition-all duration-200 ease-in-out
                  ${searchOpen ? 
                    'ring-1 ring-neutral-400 dark:ring-neutral-600 shadow-md bg-white dark:bg-[#3b3a38]' : 
                    'ring-0 shadow-none'
                  }`}
              />
              <div className={`absolute right-3 top-2.5 text-sm 
                transition-colors duration-200 ease-in-out
                ${searchOpen ? 
                  'text-neutral-600 dark:text-neutral-400' : 
                  'text-gray-400'
                }`}>
                {searchOpen ? '⌘K' : '⌘K'}
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-col">
            <div className="sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-light text-left">
                    <thead className="border-b font-medium border-neutral-500">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-black dark:text-white">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleSort('website')}
                              className="hover:text-neutral-600 dark:hover:text-neutral-400"
                            >
                              Website
                              {sortField === 'website' && (
                                <span className="ml-1 inline-block">
                                  {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-black dark:text-white whitespace-nowrap w-24">
                          <button
                            onClick={() => handleSort('time')}
                            className="hover:text-neutral-600 dark:hover:text-neutral-400"
                          >
                            Time
                            {sortField === 'time' && (
                              <span className="ml-1 inline-block">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        {selectedBarIndex == todayIndex && (
                          <th scope="col" className="px-6 py-4 text-black dark:text-white whitespace-nowrap w-24">
                            <button
                              onClick={() => handleSort('blocked')}
                              className="hover:text-neutral-600 dark:hover:text-neutral-400"
                            >
                              Block
                              {sortField === 'blocked' && (
                                <span className="ml-1 inline-block">
                                  {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </button>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedData().map(
                        ([key, value], idx) => (
                          <tr
                            key={key}
                            className={idx % 2 === 0 ? "bg-[#f4f5f5] dark:bg-[#31302e]" : ""}
                          >
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <Image
                                    src={
                                      urlFavicons[key] ?? 
                                      `https://www.google.com/s2/favicons?domain=${key}&sz=32`
                                    }
                                    width={32}
                                    height={32}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        "https://www.google.com/s2/favicons?domain=example.com&sz=32";
                                    }}
                                    alt=""
                                    className="min-w-[32px]"
                                  />
                                </div>
                                <div
                                  className="ml-2 text-black dark:text-white truncate max-w-[200px] hover:text-clip hover:overflow-visible"
                                >
                                  {key}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-black dark:text-white">
                              {Math.ceil(value) > 3600
                                ? `${Math.floor(Math.ceil(value) / 3600)}h ${Math.floor(
                                    (Math.ceil(value) % 3600) / 60
                                  )}min`
                                : Math.ceil(value) > 60
                                ? `${Math.floor(Math.ceil(value) / 60)}min`
                                : `${Math.floor(Math.ceil(value))}s`}
                            </td>
                            {selectedBarIndex == todayIndex && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={blockedData[key]}
                                    onChange={handleToggle(key)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#3b82f7]"></div>
                                </label>
                              </td>
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  );
}
