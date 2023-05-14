import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import storage from "../../public/storage"

// import { WeekGraph } from '../components/weekgraph'
// import WeekGraph from '../components/weekgraph'
// import DayGraph from '../components/daygraph';

const inter = Inter({ subsets: ['latin'] })

type ScreenTime = {
	id: string;
	url: string;
	title: string;
	startTime: Date;
	endTime: Date;
};

export default function Home() {
  // var loading: boolean = false;
  const [loading, setLoading] = useState(false);
  // var processedData: {[key: string]: number} = {};
  const [processedData, setProcessedData] = useState({} as {[key: string]: number}); // [hostname: string]: number
  
  // write a function to get the data from chrome.storage then process it into a graph
  useEffect(() => {
    console.log("useEffect() in index.tsx")
    // loading = true;
    setLoading(true);
    
    var rawData: ScreenTime[] = [];

    storage.get("limitify_raw").then((result: ScreenTime[]) => {
      console.log("limitify_raw just got getted")
      rawData = result;
      console.log("rawData:" + JSON.stringify(rawData))
    })
    storage.set("limitify_raw", [])

    storage.get("limitify_processed").then((result: {[key: string]: number}) => {
      console.log("limitify_processed just got getted")
      console.log("processed:" + JSON.stringify(result))

      rawData.forEach(element => {
        console.log("element:" + JSON.stringify(element))
        console.log("element.url is: " + JSON.stringify(element.url))
        var date1 = new Date(element.endTime)
        var date2 = new Date(element.startTime)
        // result[element.url.hostname] += Math.abs(date1.getTime() - date2.getTime()) / 1000;
        // console.log("Just added " + Math.abs(date1.getTime() - date2.getTime()) / 1000 + " seconds to " + element.url.hostname);
        if (result[element.url] == undefined) {
          result[element.url] = 0;
        }
        result[element.url] += Math.abs(date1.getTime() - date2.getTime()) / 1000;
        console.log("Just added " + Math.abs(date1.getTime() - date2.getTime()) / 1000 + " seconds to " + element.url);
      })

      var sortedData = Object.entries(result).sort((a, b) => b[1] - a[1]);
      result = Object.fromEntries(sortedData);

      storage.set("limitify_processed", result);
      // processedData = result;
      setProcessedData(result)
      // loading = false;
      setLoading(false);
    })

  }, []);


  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]"> */}
      {/* <div className="place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]"> */}
      <body className="px-4 bg-gradient-to-br from-stone-600 via-black to-slate-700">
      {/* h-max w-full */}

        {loading ? <h2 className="mt-4 text-4xl font-extrabold dark:text-white">Loading...</h2>
                 : <h2 className="mt-4 text-xl font-extrabold dark:text-white">Screen time for today</h2>
        }

        <div className="my-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium dark:border-neutral-500">
                    <tr>
                      <th scope="col" className="px-6 py-4">Website</th>
                      <th scope="col" className="px-6 py-4">Time</th>
                      <th scope="col" className="px-6 py-4">Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(processedData).map((key) => (
                      <tr className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          <div className="flex items-center">
                            <Image 
                              src={"https://www.google.com/s2/favicons?domain=" + key + "&sz=32"}
                              // src={"https://api.faviconkit.com/" + key + "/32"}
                              width={32}
                              height={32}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://avikam.vercel.app/favicon.ico";
                                // target.src={"https://icon.horse/icon/" + key}
                              }}
                              alt=":("
                            />
                            <div className="ml-2">{key}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {   
                            processedData[key] > 3600
                              ? Math.floor(processedData[key] / 3600) + "h " + Math.floor((processedData[key] % 3600) / 60) + "m" // If time is more than an hour
                              : processedData[key] > 60
                              ? Math.round(processedData[key] / 60) + "min" // If time is more than 1 minute
                              : Math.round(processedData[key]) + "s" // If time is less than one minute
                          }

                          {/* {Math.round(processedData[key])} */}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </body>
    </main>
  )
}
