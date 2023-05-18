import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';

import WeekGraph from '../components/weekgraph';

const inter = Inter({ subsets: ['latin'] });

type ScreenTime = {
  [key: string]: {
    [key: string]: number;
  };
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState({} as { [key: string]: number });
  const [weekData, setWeekData] = useState([] as number[]);

  useEffect(() => {
    setLoading(true);
  
    // Run the code only on the client-side
    if (typeof window !== 'undefined') {
      import('../../public/storage.js').then((storage) => {
        storage.default.get('limitify_data').then((result: ScreenTime | null | undefined) => {
          if (result) {
            var curDate = new Date();
  
            var todaysdata: { [key: string]: number } = result[(curDate.getDay()).toString()] || {}; // get the data for today
            var sortedData = Object.entries(todaysdata).sort((a, b) => b[1] - a[1]);
            todaysdata = Object.fromEntries(sortedData);
            setProcessedData(todaysdata);
  
            var weekData = [];
            weekData.push(result["0"]?.total || 0)
            weekData.push(result["1"]?.total || 0)
            weekData.push(result["2"]?.total || 0)
            weekData.push(result["3"]?.total || 0)  
            weekData.push(result["4"]?.total || 0)
            weekData.push(result["5"]?.total || 0)
            weekData.push(result["6"]?.total || 0)
          
            setWeekData(weekData);
          }
  
          setLoading(false);
        });
      });
    }
  }, []);

  return (

    <main
      className={`min-h-screen items-center justify-between ${inter.className}`}
    >
      <div className="mx-3 my-3 place-items-center before:absolute before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40">

        {loading ? <h2 className="mt-4 text-4xl font-extrabold dark:text-white">Loading...</h2>
                 : null
        }

        <h2 className="mt-4 text-xl font-extrabold dark:text-white">Screen time for the week</h2>

        <WeekGraph data={weekData}/>
        
        <h2 className="mt-4 text-lg dark:text-white">Usage</h2>
        <h1 className="mt-2 text-4xl font-extrabold dark:text-white"> 
          { processedData['total'] == undefined
            ? "no data recorded yet"
            : Math.ceil(processedData['total']) > 3600
            ? Math.floor(Math.ceil(processedData['total']) / 3600) + "h " + Math.floor((Math.ceil(processedData['total']) % 3600) / 60) + "min" // If time is more than an hour
            : Math.ceil(processedData['total']) > 60
            ? Math.floor(Math.ceil(processedData['total']) / 60) + "min" // If time is more than 1 minute
            : Math.floor(Math.ceil(processedData['total'])) + "s" // If time is less than one minute
          } 
        </h1>

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
                      key != "total" &&
                      <tr className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          <div className="flex items-center">
                            <Image 
                              src={"https://www.google.com/s2/favicons?domain=" + key + "&sz=32"}
                              // src={"https://api.faviconkit.com/" + key + "/32"}
                              width={32}
                              height={32}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://www.google.com/s2/favicons?domain=example.com&sz=32";
                              }}
                              alt=""
                            />
                            <div className="ml-2">{key}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {   
                            Math.ceil(processedData[key]) > 3600
                              ? Math.floor(Math.ceil(processedData[key]) / 3600) + "h " + Math.floor((Math.ceil(processedData[key]) % 3600) / 60) + "min" // If time is more than an hour
                              : Math.ceil(processedData[key]) > 60
                              ? Math.floor(Math.ceil(processedData[key]) / 60) + "min" // If time is more than 1 minute
                              : Math.floor(Math.ceil(processedData[key])) + "s" // If time is less than one minute
                          }
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
      </div>
    </main>
  )
}
