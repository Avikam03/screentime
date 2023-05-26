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
  const [selectedBarIndex, setSelectedBarIndex] = useState(0);
  const [todayIndex, setTodayIndex] = useState(0);
  const [allData, setAllData] = useState<ScreenTime>({});

  const handleBarClick = (index: number) => {
    console.log("just set it to " + index)
    setSelectedBarIndex(index);
    // Do something with the selected bar data
  };

  useEffect(() => {
    setLoading(true);
  
    // Run the code only on the client-side
    if (typeof window !== 'undefined') {
      import('../../public/storage.js').then((storage) => {
        storage.default.get('limitify_data').then((result: ScreenTime | null | undefined) => {
          if (result) {
            var curDate = new Date();

            setSelectedBarIndex(curDate.getDay());
            setTodayIndex(curDate.getDay());
            console.log("just initialised selectebarindex to " + curDate.getDay());
            
            setAllData(result);
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

  useEffect(() => {  
    if (typeof window !== 'undefined' && allData) {
      setLoading(true);
      var daydata: { [key: string]: number } = allData[(selectedBarIndex).toString()] || {}; // get the data for today
      var sortedData = Object.entries(daydata).sort((a, b) => b[1] - a[1]);
      daydata = Object.fromEntries(sortedData);
      setProcessedData(daydata);
      setLoading(false);
    }
  }, [selectedBarIndex]);

  return (

    <main className={`min-h-screen items-center justify-between ${inter.className}`}>
      <div className="mx-3 my-3 place-items-center">
        {loading ? <h2 className="mt-4 text-4xl font-extrabold dark:text-white">Loading...</h2>
                 : null
        }
        {/* <h2 className="mt-4 text-xl font-extrabold dark:text-white">Screen time for the week</h2> */}
        
        <h2 className="mt-4 text-lg dark:text-white">Usage</h2>
        <h1 className="mt-2 text-4xl dark:text-white"> 
          { processedData['total'] == undefined
            ? "no data recorded yet"
            : Math.ceil(processedData['total']) > 3600
            ? Math.floor(Math.ceil(processedData['total']) / 3600) + "h " + Math.floor((Math.ceil(processedData['total']) % 3600) / 60) + "min" // If time is more than an hour
            : Math.ceil(processedData['total']) > 60
            ? Math.floor(Math.ceil(processedData['total']) / 60) + "min" // If time is more than 1 minute
            : Math.floor(Math.ceil(processedData['total'])) + "s" // If time is less than one minute
          } 
        </h1>
        
        <WeekGraph data={weekData} selectedBarIndex={selectedBarIndex} onBarClick={handleBarClick} />

        <div className="my-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium dark:border-neutral-500">
                    <tr>
                      <th scope="col" className="px-6 py-4">Website</th>
                      <th scope="col" className="px-6 py-4">Time</th>
                      {selectedBarIndex == todayIndex ? <th scope="col" className="px-6 py-4">Limit</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(processedData).map((key) => (
                      key != "total" && key != "" &&
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

                        {selectedBarIndex == todayIndex ?
                        <td className="whitespace-nowrap px-6 py-4">
                          <button>
                            +
                          </button>
                        </td>
                        : null}
                        
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
