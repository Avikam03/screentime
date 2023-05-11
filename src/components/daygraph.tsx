import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function DayGraph() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // set the dimensions and margins of the graph
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse the Data
    d3.csv(
      'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv'
    ).then((data) => {
      // Add X axis
      const x = d3
        .scaleLinear()
        .domain([0, 13000])
        .range([0, width]);

      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

      // Y axis
      const y = d3
        .scaleBand()
        .range([0, height])
        .domain(data.filter((d) => d.Country !== undefined).map((d) => d.Country as string))
        .padding(0.1);

      svg.append('g').call(d3.axisLeft(y));

      // Bars
      svg
        .selectAll('myRect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', x(0))
        .attr('y', (d) => (d.Country !== undefined ? y(d.Country) as number : 0))
        .attr('width', (d) => x(Number(d.Value)))
        .attr('height', y.bandwidth())
        .attr('fill', '#69b3a2');
    });
  }, []);

  return <div id="daygraph" ref={chartRef}></div>;
};