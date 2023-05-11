import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react';
import storage from "../../public/storage"

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
  var loading: boolean = false;
  // const [loading, setLoading] = useState(false);
  var rawData: ScreenTime[] = [];
  // const [rawData, setRawData] = useState([] as ScreenTime[]);
  var processedData: {[key: string]: number} = {};
  // const [processedData, setProcessedData] = useState({} as {[key: string]: number}); // [hostname: string]: number

  // write a function to get the data from chrome.storage then process it into a graph
  useEffect(() => {
    console.log("useEffect() in index.tsx")
    loading = true;
    // setLoading(true);
    
    storage.get("limitify_raw").then((result: ScreenTime[]) => {
      console.log("limitify_raw just got getted")
      rawData = result;
      console.log("rawData:" + JSON.stringify(rawData))
      // setRawData(result)
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
        result[element.url.hostname] += Math.abs(date1.getTime() - date2.getTime()) / 1000;
        console.log("Just added " + Math.abs(date1.getTime() - date2.getTime()) / 1000 + " seconds to " + element.url.hostname);
      })

      storage.set("limitify_processed", result);
      processedData = result;
      // setProcessedData(result)
      loading = false;
      // setLoading(false);
    })

  });


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
