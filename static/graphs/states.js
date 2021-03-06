let margin = {
  top: 20,
  bottom: 40,
  left: 0,
  right: 20,
};

let width = 1000 - margin.left - margin.right;
let height = 700 - margin.top - margin.bottom;
d3.json('../static/json/us-data.json', function (error, us) {
  let projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);
  let path = d3.geoPath().projection(projection);

  let svg = d3
    .select('#avgIncome')
    .append('svg')
    .attr('id', 'chart')
    .attr('viewBox', [0, 0, 975, 610]);

  let myColor = d3.scaleLinear().range(['white', '#003f5c']).domain([10, 130]);

  let tooltip = d3
    .select('#avgIncome')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  let mouseover = function (d) {
    tooltip.style('opacity', 1);
  };
  let mousemove = function (d) {
    const avgIncome = d.properties.value * 1000;
    tooltip
      .html(`Average income for ${d.properties.name} is $${avgIncome}`)
      .style('top', d3.event.pageY - 10 + 'px')
      .style('left', d3.event.pageX + 10 + 'px');
  };
  let mouseleave = function (d) {
    tooltip.style('opacity', 0);
  };

  d3.json('/averageIncome', function (json) {
    for (let i = 0; i < json.averageIncome.length; i++) {
      let dataState = json.averageIncome[i].state;
      let dataValue = parseFloat(json.averageIncome[i].avg_income).toFixed(2);
      for (let n = 0; n < us.features.length; n++) {
        let jsonState = us.features[n].properties.abbr;
        if (dataState == jsonState) {
          us.features[n].properties.value = dataValue;
          break;
        }
      }
    }

    svg
      .selectAll('path')
      .data(us.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .style('fill', function (d) {
        let value = d.properties.value;
        return myColor(value);
      })
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);
  });

  let linear = d3
    .scaleLinear()
    .domain([20000, 140000])
    .range(['white', '#003f5c']);

  let legend = d3.select('svg');
  legend
    .append('g')
    .attr('class', 'legendLinear')
    .attr('transform', 'translate(100,20)');

  let legendLinear = d3
    .legendColor()
    .shapeWidth(100)
    .cells([20000, 40000, 60000, 80000, 100000, 120000, 140000])
    .orient('horizontal')
    .scale(linear);

  legend.select('.legendLinear').call(legendLinear);
});
