import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const IntensityBarChart = ({ data, loading }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (loading || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data - group by sector and calculate average intensity
    const sectorData = d3.rollup(
      data.filter(d => d.sector && d.intensity != null),
      v => d3.mean(v, d => d.intensity),
      d => d.sector
    );

    const processedData = Array.from(sectorData, ([sector, avgIntensity]) => ({
      sector,
      avgIntensity: avgIntensity || 0
    })).sort((a, b) => b.avgIntensity - a.avgIntensity).slice(0, 10);

    if (!processedData.length) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .attr("class", "text-gray-400")
        .text("No data available");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.sector))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.avgIntensity)])
      .nice()
      .range([height, 0]);

    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(processedData, d => d.avgIntensity)]);

    // Tooltip
    const tooltip = d3.select("body").selectAll(".tooltip").data([null]);
    const tooltipEnter = tooltip.enter().append("div").attr("class", "tooltip");
    const tooltipUpdate = tooltipEnter.merge(tooltip)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Bars
    container.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.sector))
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", d => colorScale(d.avgIntensity))
      .attr("rx", 4)
      .on("mouseover", (event, d) => {
        tooltipUpdate
          .style("opacity", 1)
          .html(`<strong>${d.sector}</strong><br/>Avg Intensity: ${d.avgIntensity.toFixed(2)}`);
      })
      .on("mousemove", (event) => {
        tooltipUpdate
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => {
        tooltipUpdate.style("opacity", 0);
      })
      .transition()
      .duration(800)
      .attr("y", d => yScale(d.avgIntensity))
      .attr("height", d => height - yScale(d.avgIntensity));

    // X Axis
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("fill", "#9CA3AF")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y Axis
    container.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("fill", "#9CA3AF");

    // Axis styling
    container.selectAll(".domain")
      .style("stroke", "#4B5563");
    
    container.selectAll(".tick line")
      .style("stroke", "#4B5563");

    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [data, loading]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
};

export default IntensityBarChart;