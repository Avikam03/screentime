import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WeekGraphProps {
  data: number[];
}

const WeekGraph: React.FC<WeekGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 500;
  const height = width / 3;
  const margin = { top: 20, right: 40, bottom: 40, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3
      .scaleBand()
      .domain(['S', 'M', 'T', 'W', 'T', 'F', 'Sa'])
      .range([margin.left, width - margin.right])
      .paddingInner(0.1)
      .paddingOuter(0.5);

    const yMax = Math.ceil(Math.max(...data));
    const yTicks = [0, yMax];

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([chartHeight, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisRight(yScale)
      .ticks(3)
      .tickValues(yTicks)
      .tickFormat((d) => `${Math.floor(Number(d) / 3600)}h`);

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
      .attr('x', (d, i) => xScale(['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]) || 0)
      .attr('y', (d) => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => chartHeight - yScale(d))
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
