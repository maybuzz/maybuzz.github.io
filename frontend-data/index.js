"use strict";

// used Mike Bostock's Zoomable Circle Pack example; https://bl.ocks.org/mbostock/7607535
// Dennis Wegereef @Denniswegereef, Folkert-Jan vd Pol @FjvdP and Titus Wormer @wooorm helped me setup this datavis

d3.json("/data.json").then(result => {

  const margin = 20
  const diameter = 750

  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)

  const g = svg.append("g")
    .attr( "transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")" )

  const color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsla(323, 80%, 82%, 1)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)

    // structure data
    // setup .nest() with Dennis Weegreef
    // .nest() and .map attempts documented in process.md
    const sortByLanguage = d3.nest()
      .key(d => d.originalLanguage)
      .entries(result)
      .map(data => ({ name: data.key, children: data.values }))

    const dataLanguage = sortByLanguage.map(data => {
      return { name: data.key, children: sortByLanguage }
    })[0]

    const dataBooks = sortByLanguage.map(data => {
      return { name: data.key, children: result }
    })[0]

    // setup circle pack
    // setup with Folkert-Jan vd Pol, finished setup + fixed hierarchy with Titus Wormer
    const root = d3.hierarchy(dataLanguage)
      .sum(d => d.totalPages)
      .sort((a, b) => b.value - a.value)

    const pack = d3.pack()
      .size([diameter, diameter])
      .padding(3)

    const nodes = pack(root).descendants()
    let focus = root
    let view

    const circle = g.selectAll("circle")
      .data(nodes)
      .enter()
        .append("circle")
        .attr("class", d => d.parent ? d.children ? "node" : "node node--leaf" : "node node--root" )
        .style("fill", d => d.children ? color(d.depth) : null )
        .on("click", d => { if (focus !== d) zoom(d), d3.event.stopPropagation() })

    const text = g.selectAll("text")
      .data(nodes)
      .enter()
        .append("text")
        .attr("class", "label")
        .style("font-size", function(d) { return ( Math.min( 0.2 * d.r, (0.2 * d.r - 8) / this.getComputedTextLength() * 24 ) + "px" ) })
        .style("fill-opacity", d => d.parent === root ? 1 : 0 )
        .style("display", d => d.parent === root ? "inline" : "none" )
        .text( d => d.data.name || d.data.title )

    const node = g.selectAll("circle, text")

    svg.on("click", function() { zoom(root) })

    zoomTo([root.x, root.y, root.r * 2 + margin])

    function zoom(d) {
      focus = d

      const transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          let i = d3.interpolateZoom(view, [ focus.x, focus.y, focus.r * 2 + margin ])
          return (t) => zoomTo(i(t))
        })

      transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline" })
        .style("fill-opacity", d => d.parent === focus ? 1 : 0 )
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline" })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none" }) }

    function zoomTo(v) {
      const k = diameter / v[2]
      view = v
      node.attr("transform", d =>  "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")" )
      circle.attr("r", d => d.r * k ) }

}).catch(err => console.log(err) )
