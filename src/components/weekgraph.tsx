import * as d3 from "d3";
import { useState, useEffect } from 'react'

export default function WeekGraph() {

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  type Entry = {
    Country: string;
    Value: number;
  };
  
  useEffect(() => {
    // append the svg object to the body of the page
    const svg = d3
    .select("#weekgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv")
      .then(function (data) {

        // const countries = data
        // .map((d) => d.Country)
        // .filter((country): country is string => country !== undefined);

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        // X axis
        const x = d3
        .scaleBand()
        .range([0, width])
        .domain(days)
        .padding(0.2);
    
        svg
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear().domain([0, 13000]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // Bars
        svg
          .selectAll("mybar")
          .data(data)
          .enter()
          .append("rect")
          // .attr("x", function(d) { return x(d); })
          // .attr("y", function(d) { return y(d.Value); })
          .attr("width", x.bandwidth())
          // .attr("height", function(d) { return height - y(d.Value); })
          .attr("fill", "#69b3a2");
      });
  }, [])

  return <div id="weekgraph"></div>;
};



