import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import storage from "../../public/background/storage"

// import { WeekGraph } from '../components/weekgraph'
// import WeekGraph from '../components/weekgraph'

const inter = Inter({ subsets: ['latin'] })

type ScreenTime = {
	id: String;
	url: URL;
	title: String;
	startTime: Date;
	endTime: Date;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([] as ScreenTime[]);

  const [processedData, setProcessedData] = useState({} as {[key: string]: number}); // [hostname: string]: number

  // write a function to get the data from chrome.storage then process it into a graph
  useEffect(() => {
    setLoading(true);
    
    storage.get("limitify_raw").then((result) => {
      setRawData(result)
    })
    storage.set({limitify_raw: []})

    // chrome.storage.sync.get(['limitify_raw'], function(result) {
    //   console.log("limitify_raw:" + result.key);
    //   setRawData(result.key)
    //   chrome.storage.sync.set({limitify_raw: []});
    // });

    storage.get("limitify_processed").then((result) => {
      rawData.forEach(element => {
        result[element.url.hostname] += Math.abs(element.endTime.getTime() - element.startTime.getTime()) / 1000;
      })
      storage.set({limitify_processed: result});
      setProcessedData(result)
    })
    setLoading(false);

    // chrome.storage.sync.get(['limitify_processed'], function(result) {
    //   console.log("limitify_processed:" + result.key);
    //   rawData.forEach(element => {
    //     result.key[element.url.hostname] += Math.abs(element.endTime.getTime() - element.startTime.getTime()) / 1000;
    //   });
    //   chrome.storage.sync.set({limity_processed: result.key});
    //   setProcessedData(result.key)
    // });
    // setLoading(false);

  }, []);


  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">ScreenTime</h1>
        {loading ? <p>Loading...</p> : <p>Here's your screen time for today!</p>}
        {Object.keys(processedData).map((key) => (
          <p>{key}: {processedData[key]}</p>
        ))}
        {/* <WeekGraph /> */}
      </div>
    </main>
  )
}
