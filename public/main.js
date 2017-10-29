var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var link, node;
var Graph;
var optArray = [];

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data.json", function(error, graph) {

  if (error) throw error;

  Graph = graph
  for (var i = 0; i < graph.nodes.length - 1; i++) {
      optArray.push(graph.nodes[i].id);
  }
  optArray = optArray.sort();
  $(function () {
      $("#search").autocomplete({
          source: optArray
      });
  });

  var graphRec = JSON.parse(JSON.stringify(graph));
  d3.select(".input").html('<form class="force-control" ng-if="formControl"><input type="range" id="thersholdSlider" class="slider" name="points" value="0" step="0.25" min="0" max="3"></form>');
  document.getElementById("thersholdSlider").onchange = function() {threshold(this.value);};

  link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 6)
    .attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on('dblclick', connectedNodes)

  node.append("title")
    .text(function(d) { return d.id; });

  var text = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(graph.nodes)
      .enter().append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    text
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
  }

  var toggle = 0;
  var linkedByIndex = {};
  for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[i + "," + i] = 1;
  };

  graph.links.forEach(function (d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
  })

  function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
  }

  function connectedNodes() {
      if (toggle == 0) {
          d = d3.select(this).node().__data__;
          node.style("opacity", function (o) {
              return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
          });
          link.style("opacity", function (o) {
              return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
          });
          toggle = 1;
      } else {
          node.style("opacity", 1);
          link.style("opacity", 1);
          toggle = 0;
      }
  }

  function threshold(thresh) {
    thresh = Number(thresh);
    graph.links.splice(0, graph.links.length);
      for (var i = 0; i < graphRec.links.length; i++) {
        if (graphRec.links[i].value > thresh) {graph.links.push(graphRec.links[i]);}
      }
    restart();
  }

  function restart() {
    link = link.data(graph.links);
    console.log(link);

    link.exit().remove();

    link = link.enter().append("line")
    .attr("class", "link")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); })
    .merge(link);

    node = node.data(graph.nodes);

    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

    simulation.alphaTarget(0.3).restart();
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
}

function searchNode() {
    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll("circle");
    if (selectedVal == "none") {
        node.style("stroke", "white").style("stroke-width", "1");
    } else {
        var selected = node.filter(function (d) {
            return d.id != selectedVal;
        });
        selected.style("opacity", "0");
        var link = svg.selectAll(".links")
        link.style("opacity", "0");
        selected
          .transition()
          .duration(5000)
          .style("opacity", "1")
        d3.selectAll(".links").transition()
            .duration(5000)
            .style("opacity", 1);
    }

}

function togglelabel() {
  var labels = document.querySelector('.labels')
  labels.classList.toggle('hide')
}
