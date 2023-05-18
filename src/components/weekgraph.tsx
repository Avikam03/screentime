import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WeekGraphProps {
  data: number[]; // Array of seconds
}

const WeekGraph: React.FC<WeekGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 500;
  const height = width / 3;
  const margin = { top: 20, right: 40, bottom: 20, left: 15 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3
      .scaleBand()
      .domain(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'])
      .range([margin.left, width - margin.right])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    const yMax = Math.max(...data); // Maximum value in seconds

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([chartHeight, margin.top]);

    const xAxis = d3.axisBottom(xScale);

    const yAxis = d3
      .axisRight(yScale)
      .ticks(3)
      .tickFormat((d) => {
        if (yMax < 60) {
          return `${d}s`; // Format as seconds
        } else if (yMax < 3600) {
          return `${Math.floor(Number(d) / 60)}m`; // Format as minutes
        } else {
          return `${Math.floor(Number(d) / 3600)}h`; // Format as hours
        }
      });

    svg
      .select<SVGGElement>('.x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);
    svg
      .select<SVGGElement>('.y-axis')
      .attr('transform', `translate(${width - margin.right}, 0)`)
      .call(yAxis);
    svg
      .selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i]) || 0)
      .attr('y', (d) => yScale(d)) // Use yScale directly without dividing by 60
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => chartHeight - yScale(d)) // Use yScale directly without dividing by 60
      .attr('fill', '#007AFF');
  }, [data]);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
};

export default WeekGraph;
