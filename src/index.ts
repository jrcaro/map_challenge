import * as d3 from "d3";
import * as topojson from "topojson-client";
import { latLongCommunities } from "./communities";
const spainjson = require("./data/spain.json");
const d3Composite = require("d3-composite-projections");
import { infectedFebruary, infectedMarch, ResultEntry } from "./stats";

// set the affected color scale
var color = d3
  .scaleThreshold<number, string>()
  .domain([0, 20, 500, 1000, 2000, 5000, 9000])
  .range([
    "#ffffff",
    "#cfc5e5",
    "#a78cc7",
    "#8652a5",
    "#923BA4",
    "#68007e",
    "#000000"
  ]);

const assignCCAABackgroundColor = (
  CCAAName: string,
  infected: ResultEntry[]
) => {
  const item = infected.find(item => item.name === CCAAName);
  return item ? color(item.value) : color(0);
};

const updateCCAABackground = (infected: ResultEntry[]) => {
  const paths = svg.selectAll("path")
  paths
  .style("fill", function(d: any) {
    return assignCCAABackgroundColor(d.properties.NAME_1, infected);
  })
  .attr("d", geoPath as any);
};

const calculateRadiusBasedOnAffectedCases = (comunidad: string, data: ResultEntry[]) => {
  const entry = data.find(item => item.name === comunidad);

  const maxAffected = data.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );

const affectedRadiusScale = d3
    .scaleLinear()
    .domain([0, maxAffected])
    .clamp(true)
    .range([1, 50]);
  return entry ? affectedRadiusScale(entry.value) : 0;
};

const updateCircles = (data: ResultEntry[]) => {
  const circles = svg.selectAll("circle");
  circles
    .data(latLongCommunities)
    .merge(circles as any)
    .transition()
    .duration(500)
    .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name, data));
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

// Let's paint first the map
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .style("fill", function(d: any) {
    return assignCCAABackgroundColor(d.properties.NAME_1, infectedFebruary);
  })
  .attr("d", geoPath as any);

  svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", 15)
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name, infectedFebruary))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1]);

document
  .getElementById("init")
  .addEventListener("click", function handleInfectedFebruary() {
    updateCCAABackground(infectedFebruary);
    updateCircles(infectedFebruary);
  });

document
  .getElementById("actual")
  .addEventListener("click", function handleInfectedMarch() {
    updateCCAABackground(infectedMarch);
    updateCircles(infectedMarch);
  });
