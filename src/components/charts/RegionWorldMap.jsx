import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RegionWorldMap = ({ data, loading }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data - count insights by country
    const countryData = d3.rollup(
      data.filter(d => d.country),
      v => v.length,
      d => d.country
    );

    // Create a simple world map visualization using circles
    // Since we don't have TopoJSON, we'll create a regional chart instead
    const processedData = Array.from(countryData, ([country, count]) => ({
      country,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 15);

    if (!processedData.length) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .attr("class", "text-gray-400")
        .text("No geographic data available");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 120, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.country))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.count)])
      .nice()
      .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateGreens)
      .domain([0, d3.max(processedData, d => d.count)]);

    // Tooltip
    const tooltip = d3.select("body").selectAll(".map-tooltip").data([null]);
    const tooltipEnter = tooltip.enter().append("div").attr("class", "map-tooltip");
    const tooltipUpdate = tooltipEnter.merge(tooltip)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Circles representing countries
    container.selectAll(".country-circle")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "country-circle")
      .attr("cx", d => xScale(d.country) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.count))
      .attr("r", 0)
      .attr("fill", d => colorScale(d.count))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .attr("r", d => Math.sqrt(d.count) * 3 + 5);
        
        tooltipUpdate
          .style("opacity", 1)
          .html(`<strong>${d.country}</strong><br/>Insights: ${d.count}`);
      })
      .on("mousemove", (event) => {
        tooltipUpdate
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .attr("r", d => Math.sqrt(d.count) * 3);
        
        tooltipUpdate.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("r", d => Math.sqrt(d.count) * 3);

    // X Axis
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("fill", "#9CA3AF")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .each(function(d) {
        const text = d3.select(this);
        const words = d.split(/\s+/);
        if (words.length > 2) {
          text.text(words.slice(0, 2).join(' ') + '...');
        }
      });

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

    // Title
    container.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("fill", "#9CA3AF")
      .style("font-size", "12px")
      .text("Data Points by Country");

    return () => {
      d3.select("body").selectAll(".map-tooltip").remove();
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
      <div className="mt-2 text-xs text-gray-400 text-center">
        Circle size represents number of insights
      </div>
    </div>
  );
};

export default RegionWorldMap;