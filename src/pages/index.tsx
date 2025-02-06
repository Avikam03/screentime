import Image from "next/image";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";

import WeekGraph from "../components/weekgraph";

const inter = Inter({ subsets: ["latin"] });

type ScreenTime = {
  [key: string]: {
    [key: string]: number;
  };
};

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

  const handleBarClick = (index: number) => {
    setSelectedBarIndex(index);
    // Do something with the selected bar data
  };

  const handleToggle =
    (website: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newBlockedData = { ...blockedData };
      newBlockedData[website] = !newBlockedData[website];
      setBlockedData(newBlockedData);

      import("../../public/storage.js").then((storage) =>
        Promise.all([
          storage.default.set("limitify_blocked", newBlockedData),
        ]).then()
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
        allData[selectedBarIndex.toString()] || {}; // get the data for today
      var sortedData = Object.entries(daydata).sort((a, b) => b[1] - a[1]);
      daydata = Object.fromEntries(sortedData);
      setProcessedData(daydata);
      setLoading(false);
    }
  }, [selectedBarIndex]);

  return (
    <body
      className={`bg-white dark:bg-[#272624] min-h-screen ${inter.className}`}
    >
      <div className="px-3 py-3">
        {loading ? (
          <h2 className="mt-4 text-4xl font-extrabold text-black dark:text-white">
            Loading...
          </h2>
        ) : null}

        <div className="flex flex-col items-start">
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

        <WeekGraph
          data={weekData}
          selectedBarIndex={selectedBarIndex}
          onBarClick={handleBarClick}
        />

        <div className="my-4 flex flex-col">
          <div className="sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm font-light text-left">
                  <thead className="border-b font-medium border-neutral-500">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-black dark:text-white">
                        Website
                      </th>
                      <th scope="col" className="px-6 py-4 text-black dark:text-white whitespace-nowrap w-24">
                        Time
                      </th>
                      {selectedBarIndex == todayIndex && (
                        <th scope="col" className="px-6 py-4 text-black dark:text-white whitespace-nowrap w-24">
                          Block
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(processedData).map(
                      (key, idx) =>
                        key !== "total" && key !== "" && (
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
                              {Math.ceil(processedData[key]) > 3600
                                ? `${Math.floor(Math.ceil(processedData[key]) / 3600)}h ${Math.floor(
                                    (Math.ceil(processedData[key]) % 3600) / 60
                                  )}min`
                                : Math.ceil(processedData[key]) > 60
                                ? `${Math.floor(Math.ceil(processedData[key]) / 60)}min`
                                : `${Math.floor(Math.ceil(processedData[key]))}s`}
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
    </body>
  );
}
