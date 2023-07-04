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
  "learn.uwaterloo.ca": "https://i.imgur.com/yVvwU3l.png",
  "web.whatsapp.com": "https://i.imgur.com/47PgHxi.png",
  "linkedin.com": "https://icon.horse/icon/linkedin.com",
  "www.linkedin.com": "https://icon.horse/icon/linkedin.com",
  "app.crowdmark.com": "https://crowdmark.com/wp-content/uploads/2022/10/favicon.png",
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
          storage.default.get("limitify_data")
        ),
        import("../../public/storage.js").then((storage) =>
          storage.default.get("limitify_blocked")
        ),
      ]).then(([result, blockedResult]) => {
        if (result) {
          var curDate = new Date();

          setSelectedBarIndex(curDate.getDay());
          setTodayIndex(curDate.getDay());
          setAllData(result);

          // Process "limitify_data"
          var todaysData: { [key: string]: number } =
            result[curDate.getDay().toString()] || {};
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
          weekData.push(result["0"]?.total || 0);
          weekData.push(result["1"]?.total || 0);
          weekData.push(result["2"]?.total || 0);
          weekData.push(result["3"]?.total || 0);
          weekData.push(result["4"]?.total || 0);
          weekData.push(result["5"]?.total || 0);
          weekData.push(result["6"]?.total || 0);

          setWeekData(weekData);
        }

        setLoading(false);
      });
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
      className={`bg-white dark:bg-[#232221] min-h-screen items-center justify-between ${inter.className}`}
    >
      <div className="px-3 py-3 place-items-center">
        {loading ? (
          <h2 className="mt-4 text-4xl font-extrabold text-black dark:text-white">
            Loading...
          </h2>
        ) : null}
        {/* <h2 className="mt-4 text-xl font-extrabold text-white">Screen time for the week</h2> */}

        <h2 className="ml-2 mt-4 text-lg text-black dark:text-white">Usage</h2>
        <h1 className="ml-2 mt-2 text-4xl text-black dark:text-white">
          {
            processedData["total"] == undefined
              ? "no usage recorded"
              : Math.ceil(processedData["total"]) > 3600
              ? Math.floor(Math.ceil(processedData["total"]) / 3600) +
                "h " +
                Math.floor((Math.ceil(processedData["total"]) % 3600) / 60) +
                "min" // If time is more than an hour
              : Math.ceil(processedData["total"]) > 60
              ? Math.floor(Math.ceil(processedData["total"]) / 60) + "min" // If time is more than 1 minute
              : Math.floor(Math.ceil(processedData["total"])) + "s" // If time is less than one minute
          }
        </h1>

        <WeekGraph
          data={weekData}
          selectedBarIndex={selectedBarIndex}
          onBarClick={handleBarClick}
        />

        <div className="my-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium border-neutral-500">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-black dark:text-white">
                        Website
                      </th>
                      <th scope="col" className="px-6 py-4 text-black dark:text-white">
                        Time
                      </th>
                      {selectedBarIndex == todayIndex ? (
                        <th scope="col" className="px-6 py-4 text-black dark:text-white">
                          Block
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(processedData).map(
                      (key) =>
                        key != "total" && //(
                        key != "" && (
                          <tr className="border-b border-neutral-500">
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              <div className="flex items-center">
                                <Image
                                  src={
                                    (urlFavicons[key] == undefined ?
                                    ("https://www.google.com/s2/favicons?domain=" +
                                    key +
                                    "&sz=32") :
                                    urlFavicons[key]
                                    )
                                  }
                                  // src={"https://api.faviconkit.com/" + key + "/32"}
                                  width={32}
                                  height={32}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "https://www.google.com/s2/favicons?domain=example.com&sz=32";
                                  }}
                                  alt=""
                                />
                                <div className="ml-2 text-black dark:text-white">{key}</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-black dark:text-white">
                              {
                                Math.ceil(processedData[key]) > 3600
                                  ? Math.floor(
                                      Math.ceil(processedData[key]) / 3600
                                    ) +
                                    "h " +
                                    Math.floor(
                                      (Math.ceil(processedData[key]) % 3600) /
                                        60
                                    ) +
                                    "min" // If time is more than an hour
                                  : Math.ceil(processedData[key]) > 60
                                  ? Math.floor(
                                      Math.ceil(processedData[key]) / 60
                                    ) + "min" // If time is more than 1 minute
                                  : Math.floor(Math.ceil(processedData[key])) +
                                    "s" // If time is less than one minute
                              }
                            </td>

                            {selectedBarIndex == todayIndex ? (
                              <td className="whitespace-nowrap px-6 py-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value=""
                                    className="sr-only peer"
                                    checked={blockedData[key]}
                                    onChange={handleToggle(key)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                              </td>
                            ) : null}
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
