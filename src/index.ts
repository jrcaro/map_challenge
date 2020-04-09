import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as d3slider from "d3-simple-slider";
const usajson = require("./data/usa.json");
const d3Composite = require("d3-composite-projections");
import { latLongStates } from "./data/states";
import { confirmed } from "./data/confirmed";

var dataTime = d3
  .range(0, Object.keys(confirmed[0]).length - 1)
  .map(function (d) {
    return new Date(2020, 0, d + 22);
  });

var sliderTime = d3slider
  .sliderBottom()
  .min(d3.min(dataTime))
  .max(d3.max(dataTime))
  .step(Object.keys(confirmed[0]).length - 1)
  .width(800)
  .tickFormat(d3.timeFormat("%m/%d/%Y"))
  .tickValues(dataTime)
  .default(new Date(2020, 0, 22))
  .on("onchange", (val) => {
    var index = val.toLocaleDateString('en-US')
    d3
    .select("p#value-time")
    .text(index);
    console.log(confirmed[0].Province_State);
  });

var gTime = d3
  .select("div#slider-time")
  .append("svg")
  .attr("width", 1000)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(30,30)");

gTime.call(sliderTime);

d3.select("p#value-time").text(confirmed[0]["1/22/20"]);
console.log(sliderTime.value().toLocaleDateString('en-US'));

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(usajson, usajson.objects.states);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  .attr("d", geoPath as any);

svg
  .selectAll("circle")
  .data(latLongStates)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", 10)
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);
