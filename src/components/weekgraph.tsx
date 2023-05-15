import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WeekGraphProps {
  data: number[];
}

const WeekGraph: React.FC<WeekGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);

    const width = 500;
    const height = width / 5;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3
      .scaleBand()
      .domain(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yMax = Math.max(...data);
    const yTicks = [0, Math.ceil(yMax), Math.floor(Math.ceil(yMax) / 2)];

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([chartHeight, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickValues(yTicks)
      .tickFormat((d) => `${Math.floor(Number(d) / 3600)}h`);

    svg
      .select<SVGGElement>('.x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    svg
      .select<SVGGElement>('.y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    svg
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]) || 0)
      .attr('y', (d) => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => chartHeight - yScale(d))
      .attr('fill', '#007AFF');
  }, [data]);

  return (
    <svg ref={svgRef}>
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
};

export default WeekGraph;


// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';

// interface WeekGraphProps {
//   data: (string | number)[]; // Array of 7 integers or strings representing minutes for each day
// }

// const WeekGraph: React.FC<WeekGraphProps> = ({ data }) => {
//   const graphRef = useRef<SVGSVGElement>(null);

//   useEffect(() => {
//     // Create the D3 graph when the component mounts
//     if (graphRef.current) {
//       const svg = d3.select(graphRef.current);

//       const graphWidth = window.innerWidth; // Set graph width to the width of the screen
//       const graphHeight = graphWidth / 5; // Calculate graph height based on width to maintain the desired proportion

//       const xScale = d3.scaleBand<string>()
//         .domain(['S', 'M', 'T', 'W', 'T', 'F', 'S']) // X-axis labels
//         .range([0, graphWidth])
//         .padding(0.1);

//       const yScale = d3.scaleLinear<number>()
//         .domain([0, d3.max(data.map((d) => +d)) || 0]) // Convert values to numbers
//         .range([graphHeight, 0]);

//       svg.selectAll<SVGRectElement, number>('rect')
//         .data(data.map((d) => +d))
//         .enter()
//         .append('rect')
//         .attr('x', (d, i) => xScale(i.toString())!)
//         .attr('y', (d) => yScale(d))
//         .attr('width', xScale.bandwidth())
//         .attr('height', (d) => graphHeight - yScale(d))
//         .attr('fill', 'blue'); // Set the bar color to blue

//       // Add X-axis
//       const xAxis = d3.axisBottom(xScale);
//       svg.append('g')
//         .attr('transform', `translate(0, ${graphHeight})`)
//         .call(xAxis)
//         .selectAll('text')
//         .attr('fill', 'white'); // Set X-axis label color to white

//       // Add Y-axis with hour labels
//       const yAxis = d3.axisLeft(yScale).ticks(5, 's').tickFormat((d) => `${Math.floor(Number(d) / 3600)}h`);
//       svg.append('g')
//         .call(yAxis)
//         .selectAll('text')
//         .attr('fill', 'white'); // Set Y-axis label color to white
//     }
//   }, [data]);

//   return (
//     <svg
//       ref={graphRef}
//       className="w-full"
//       viewBox={`0 0 ${window.innerWidth} ${window.innerWidth / 5}`} // Set the viewBox based on the desired graph size
//     ></svg>
//   );
// };

// export default WeekGraph;
