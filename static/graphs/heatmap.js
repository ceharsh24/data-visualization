const selectDropDown = document.querySelector('.ad-platform');
selectDropDown.addEventListener('change', (event) => {
  if (event.target.value) {
    const result = document.querySelector('.social_media');
    d3.select(result).selectAll('*').remove();
    d3.json(`adPlatform/${event.target.value}`, function (json) {
      let margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = 975 - margin.left - margin.right,
        height = 610 - margin.top - margin.bottom;
      let svg = d3
        .select(result)
        .append('svg')
        .attr('viewBox', [0, 0, 975, 610])
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      let economyStability = [];

      for (i in json.economyStability) {
        economyStability.push(json.economyStability[i].economic_stability);
      }

      let adPlatformRank = [];

      for (i in json.adPlatformRank) {
        adPlatformRank.push(json.adPlatformRank[i].ad_platform_rank);
      }

      let x = d3
        .scaleBand()
        .range([0, width])
        .domain(economyStability)
        .padding(0.15);
      let xAxis = d3.axisBottom().ticks(economyStability).scale(x);
      svg
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg
        .append('text')
        .attr(
          'transform',
          'translate(' + width / 2 + ' ,' + (height + margin.bottom - 10) + ')'
        )
        .style('text-anchor', 'middle')
        .text('economy stability');

      let y = d3
        .scaleBand()
        .range([height, 0])
        .domain(adPlatformRank)
        .padding(0.15);
      let yAxis = d3.axisLeft().ticks(adPlatformRank).scale(y);
      svg.append('g').call(yAxis);
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(`${event.target.value} usage index`);
      let myColor = d3
        .scaleLinear()
        .range(['white', '#003f5c'])
        .domain([0, 100]);

      let tooltip = d3
        .select('#social_media')
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
        tooltip
          .html('Total users in this segment are: ' + d.count)
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px');
      };
      let mouseleave = function (d) {
        tooltip.style('opacity', 0);
      };

      svg
        .selectAll()
        .data(json.income, function (d) {
          return d.economic_stability + ':' + d.ad_platform_rank;
        })
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return x(d.economic_stability);
        })
        .attr('y', function (d) {
          return y(d.ad_platform_rank);
        })
        .attr('width', function (d) {
          // return x.bandwidth();
          return Math.min(
            x.bandwidth(),
            Math.max(
              8,
              (d.count * x.bandwidth()) /
                (json.minAndMaxCount.max - json.minAndMaxCount.min * 10)
            )
          );
        })
        .attr('height', function (d) {
          // return y.bandwidth();
          return Math.min(
            y.bandwidth(),
            Math.max(
              8,
              (d.count * y.bandwidth()) /
                (json.minAndMaxCount.max - json.minAndMaxCount.min * 10)
            )
          );
        })
        .style('fill', function (d) {
          return myColor(d.income);
        })
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
    });
  }
});
