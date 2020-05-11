let initStackedBarChart = {
  draw: function (config) {
    (me = this),
      (domEle = config.element),
      (stackKey = config.key),
      (data = config.data),
      (margin = { top: 50, right: 50, bottom: 50, left: 50 }),
      (width = 975 - margin.left - margin.right),
      (height = 610 - margin.top - margin.bottom),
      (xScale = d3.scaleBand().range([0, width]).padding(0.1)),
      (yScale = d3.scaleLinear().range([height, 0])),
      (color = d3.scaleOrdinal(['#ffa600', '#003f5c'])),
      (xAxis = d3.axisBottom(xScale)),
      (yAxis = d3.axisLeft(yScale)),
      (svg = d3
        .select('#exerciser')
        .append('svg')
        .attr('viewBox', [0, 0, 975, 610])
        .append('g')
        .attr(
          'transform',
          'translate(' + margin.left + ',' + margin.top + ')'
        ));
    let stack = d3.stack().keys(stackKey);

    let layers = stack(data);
    xScale.domain(
      data.map(function (d) {
        return d.economic_stability;
      })
    );
    yScale
      .domain([
        0,
        d3.max(layers[layers.length - 1], function (d) {
          return d[1];
        }),
      ])
      .nice();

    let layer = svg
      .selectAll('.layer')
      .data(layers)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .style('fill', function (d, i) {
        return color(i);
      });

    let tooltip = d3
      .select('#exerciser')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .attr('data-html', 'true')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '5px');
    let mouseover = function (d) {
      tooltip.style('opacity', 1);
    };
    let mousemove = function (d) {
      tooltip
        .html(
          `Number of Users: ${d[1] - d[0]} <br>
            Average Income: ${
              d[1] - d[0] === d.data.numberOfExerciser
                ? `$${d.data.avg_income.toFixed(2) * 1000}`
                : `$${d.data.avg_incomeofNonExe.toFixed(2) * 1000}`
            }`
        )
        .style('top', d3.event.pageY - 10 + 'px')
        .style('left', d3.event.pageX + 10 + 'px');
    };
    let mouseleave = function (d) {
      tooltip.style('opacity', 0);
    };

    layer
      .selectAll('rect')
      .data(function (d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return xScale(d.data.economic_stability);
      })
      .attr('y', function (d) {
        return yScale(d[1]);
      })
      .attr('height', function (d) {
        return yScale(d[0]) - yScale(d[1]);
      })
      .attr('width', xScale.bandwidth())
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
    svg
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.bottom - 10) + ')'
      )
      .style('text-anchor', 'middle')
      .text('Economy Stability');

    svg.append('g').attr('class', 'axis axis--y').call(yAxis);
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left - 3)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(`Number of Users`);

    var legend = svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(stackKey)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        return 'translate(0,' + i * 20 + ')';
      });

    legend
      .append('rect')
      .attr('x', width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', d3.scaleOrdinal(['#ffa600', '#003f5c']));

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function (d) {
        return d === 'numberOfExerciser'
          ? `User who do Exercise`
          : `User who don't exercise`;
      });
  },
};

d3.json(`/getExerciserData`, function (json) {
  let data = json.userDetails;
  var key = ['numberOfExerciser', 'numberOfNonExerciser'];
  initStackedBarChart.draw({
    data: data,
    key: key,
    element: 'stacked-bar',
  });
});
