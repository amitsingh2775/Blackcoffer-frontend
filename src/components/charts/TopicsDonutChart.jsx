import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TopicsDonutChart = ({ data, loading }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (loading || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data - count topics
    const topicsData = d3.rollup(
      data.filter(d => d.topic),
      v => v.length,
      d => d.topic
    );

    const processedData = Array.from(topicsData, ([topic, count]) => ({
      topic,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    if (!processedData.length) {
      svg.append("text")
        .attr("x", 200)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .attr("class", "text-gray-400")
        .text("No topic data available");
      return;
    }

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.5;

    const container = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(processedData.map(d => d.topic))
      .range(d3.schemeSet3);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 5);

    // Tooltip
    const tooltip = d3.select("body").selectAll(".donut-tooltip").data([null]);
    const tooltipEnter = tooltip.enter().append("div").attr("class", "donut-tooltip");
    const tooltipUpdate = tooltipEnter.merge(tooltip)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Create arcs
    const arcs = container.selectAll(".arc")
      .data(pie(processedData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add paths
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.topic))
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        const total = d3.sum(processedData, d => d.count);
        const percentage = ((d.data.count / total) * 100).toFixed(1);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arcHover)
          .style("opacity", 1);
        
        tooltipUpdate
          .style("opacity", 1)
          .html(`
            <strong>${d.data.topic}</strong><br/>
            Count: ${d.data.count}<br/>
            Percentage: ${percentage}%
          `);
      })
      .on("mousemove", (event) => {
        tooltipUpdate
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
          .style("opacity", 0.8);
        
        tooltipUpdate.style("opacity", 0);
      });

    // Add labels for larger slices
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text(d => {
        const total = d3.sum(processedData, d => d.count);
        const percentage = (d.data.count / total) * 100;
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
      });

    // Add center text
    container.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("fill", "#9CA3AF")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Top Topics");
    
    container.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("fill", "#6B7280")
      .style("font-size", "12px")
      .text(`${processedData.length} categories`);

    // Animate entry
    arcs.select("path")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 0.8);

    return () => {
      d3.select("body").selectAll(".donut-tooltip").remove();
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
    <div className="w-full flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TopicsDonutChart;