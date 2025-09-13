import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LikelihoodBubbleChart = ({ data, loading }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (loading || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter and process data
    const processedData = data
      .filter(d => 
        d.relevance != null && 
        d.likelihood != null && 
        d.intensity != null &&
        d.relevance > 0 && 
        d.likelihood > 0
      )
      .slice(0, 50); // Limit for performance

    if (!processedData.length) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .attr("class", "text-gray-400")
        .text("No data available");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(processedData, d => d.relevance))
      .nice()
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(processedData, d => d.likelihood))
      .nice()
      .range([height, 0]);

    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(processedData, d => d.intensity)])
      .range([3, 20]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Tooltip
    const tooltip = d3.select("body").selectAll(".bubble-tooltip").data([null]);
    const tooltipEnter = tooltip.enter().append("div").attr("class", "bubble-tooltip");
    const tooltipUpdate = tooltipEnter.merge(tooltip)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Bubbles
    container.selectAll(".bubble")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => xScale(d.relevance))
      .attr("cy", d => yScale(d.likelihood))
      .attr("r", 0)
      .attr("fill", d => colorScale(d.sector || 'Unknown'))
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 2);
        
        tooltipUpdate
          .style("opacity", 1)
          .html(`
            <strong>${d.title ? d.title.substring(0, 50) + '...' : 'No Title'}</strong><br/>
            Relevance: ${d.relevance}<br/>
            Likelihood: ${d.likelihood}<br/>
            Intensity: ${d.intensity}<br/>
            Sector: ${d.sector || 'Unknown'}
          `);
      })
      .on("mousemove", (event) => {
        tooltipUpdate
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr("opacity", 0.7)
          .attr("stroke-width", 1);
        
        tooltipUpdate.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("r", d => radiusScale(d.intensity));

    // X Axis
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#9CA3AF")
      .style("text-anchor", "middle")
      .text("Relevance");

    // Y Axis
    container.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#9CA3AF")
      .style("text-anchor", "middle")
      .text("Likelihood");

    // Axis styling
    container.selectAll(".domain")
      .style("stroke", "#4B5563");
    
    container.selectAll(".tick line")
      .style("stroke", "#4B5563");
    
    container.selectAll(".tick text")
      .style("fill", "#9CA3AF");

    return () => {
      d3.select("body").selectAll(".bubble-tooltip").remove();
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
        Bubble size represents intensity
      </div>
    </div>
  );
};

export default LikelihoodBubbleChart;