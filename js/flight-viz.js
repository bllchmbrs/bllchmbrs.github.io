var height = 627,
  width = 627,
  originalMatrix,
  matrix,
  layout,
  originalAirports,
  airports;

var outerRadius = Math.min(width, height) / 2 - 8,
  innerRadius = outerRadius - 30;

var fill = d3.scale.category20b();

var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius);

var svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var groups = svg.append("g")
  .attr("class", "groups")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var chords = svg.append("g")
  .attr("class", "chords")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

function generateLayout() {
  return d3.layout.chord()
    .padding(0.02);
}

//////////////////////////////////////////////////
// Utility Functions
//////////////////////////////////////////////////

function filterMatrix(nodes, matrix) {
  var newMatrix = matrix
    .map(function(d, i) {
      return filterArray(nodes, d);
    })
  return filterArray(nodes, newMatrix);
}

function filterArray(nodes, array) {
  return array.filter(function(d, i) {
    return ($.inArray(i, nodes) > -1);
  });
}

function resetAll() {
  layout = generateLayout();
  layout.matrix([]);
  render();

  setTimeout(function() {
    layout = generateLayout();
    layout.matrix(originalMatrix);
    airports = originalAirports;
    render();
  }, 100);
}

//////////////////////////////////////////////////
// Render Functions
//////////////////////////////////////////////////

function renderText() {
  var tableData = d3.select("#info").selectAll("div")
    .data(airports, function(d) {
      return d;
    });

  tableData
    .enter().append("div")
    .style({
      "float": "left",
      "width": "50px"
    })
    .text(function(d) {
      return d + " ";
    });

  tableData.exit().remove();

  colorText();
}

function colorText() {

  d3.select("#info").selectAll("div")
    .style("color", 'black');


  d3.select("#info").selectAll("div")
    .style("color", function(d, i) {
      return fill(i);
    });
}

function highlightText(g, index) {

  d3.select("#info").selectAll("div")
    .filter(function(d, i) {
      return i === index;
    })
    .style("font-weight", "bold");

  d3.select("#info").selectAll("div")
    .filter(function(d, i) {
      return i !== index;
    })
    .style("font-weight", "normal");
}

function render() {
  var dataGroups = groups.selectAll('path')
    .data(layout.groups);

  var dataChords = chords.selectAll('path')
    .data(layout.chords);

  var enterGroups = dataGroups
    .enter()
    .append('path')
    .attr("d", arc)
    .on("mouseover.ht", highlightText)
    .on("mouseover.fd", fade(0.1))
    .on("mouseout", fade(1))
    .on("click", groupClick)
    .style("fill", function(d, i) {
      return fill(d.index);
    });

  var enterChords = dataChords
    .enter()
    .append('path')
    .attr("d", d3.svg.chord().radius(innerRadius))
    .style("fill", function(d, i) {
      return fill(d.target.index);
    });

  dataGroups.exit().remove();
  dataChords.exit().remove();
  renderText();
}

//////////////////////////////////////////////////
// Visualization Functions
//////////////////////////////////////////////////

function getIncludedChords(origin) {
  var asSource = layout.chords().filter(function(d, ind) {
    return d.source.index === origin;
  });

  var asTarget = layout.chords().filter(function(d, ind) {
    return d.target.index === origin;
  });

  return _.uniq(asSource.concat(asTarget));
}

function fade(opacity) {
  return function(g, i) {
    svg.selectAll("g.chords path")
      .filter(function(d) {
        return d.source.index != i && d.target.index != i;
      })
      .transition()
      .style("opacity", opacity);
  };
}

function getIncludedGroups(chords, origin) {
  var targets = chords.map(function(d, i) {
    return d.source.index === origin ? d.target.index : undefined;
  });
  var sources = chords.map(function(d, i) {
    return d.target.index === origin ? d.source.index : undefined;
  });

  return _.uniq(targets.concat(sources, [origin]).filter(function(d) {
    return d !== undefined;
  }));
}

function groupClick(g, i) {
  console.log("Source Node => " + i);

  var includedChords = getIncludedChords(i);
  var includedGroups = getIncludedGroups(includedChords, i);

  console.log("Number of Groups => " + includedGroups.length);
  console.log(includedGroups);
  airports = airports
    .map(function(d, ind) {
      return ($.inArray(ind, includedGroups) > -1) ? d : undefined;
    })
    .filter(function(d) {
      return d !== undefined;
    });


  var newMatrix = filterMatrix(includedGroups, matrix);
  matrix = newMatrix;
  layout = generateLayout();
  layout.matrix([]);
  render();

  setTimeout(function() {
    layout = generateLayout();
    layout.matrix(newMatrix);
    render();
  }, 100);
}



//////////////////////////////////////////////////
// Initialization
//////////////////////////////////////////////////

$.get("/data/flight-airports.csv", function(raw_originalAirports) {
  d3.json("/data/flight-matrix.json", function(data) {
    layout = generateLayout();
    layout.matrix(data);
    originalMatrix = data;
    matrix = originalMatrix;
    originalAirports = raw_originalAirports.split("\n");
    airports = originalAirports;
    console.log(airports.length);
    console.log(matrix.length);
    render();
  });
});
