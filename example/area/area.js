/* global _ */
/* global d3 */

'use strict'

if(!Array.prototype.last) // firefox
  Array.prototype.last = function() { return this[this.length - 1]; }

new p5(ctx => {
  let dataset;

  ctx.preload = () => {
    const reAssign = results => {
      const parseDate = d3.time.format("%d-%b-%y").parse;
      dataset = results.rows.reverse().map(({ obj: { date, close } }) => {
        return {
          date:  parseDate(date),
          close: +close
        }
      });
    }

    ctx.loadTable('area.tsv', 'tsv', 'header', reAssign);
  }

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const ctxWidth  = 960;
  const ctxHeight = 500;

  const chartWidth  = ctxWidth  - margin.left - margin.right;
  const chartHeight = ctxHeight - margin.top  - margin.bottom;
  const chartX = margin.left;
  const chartY = margin.top;

  let xScale, yScale, xTickFmt, xLabels, yLabels;

  ctx.setup = () => {
    xScale = d3.time.scale()
      .domain(d3.extent(dataset, d => d.date))
      .range([ chartX, chartWidth + chartX ]);

    xTickFmt = xScale.tickFormat(date => date.getFullYear());
    xLabels  = xScale.ticks(d3.time.year);

    yScale = d3.scale.linear()
      .domain([ 0, d3.max(dataset, ({ close }) => close) ])
      .range([ chartHeight + chartY, chartY ]);

    yLabels = yScale.ticks(10);

    ctx.createCanvas(ctxWidth, ctxHeight).parent('area');
    ctx.noLoop();
  }

  ctx.draw = () => {
    ctx.background('white');
    drawArea();

    ctx.textSize(12);
    ctx.stroke('#333333');
    drawXAxis(yScale(0));
    drawYAxis(xScale(dataset[0].date));
  }

  function drawArea() {
    ctx.push();
      ctx.fill('steelblue').noStroke();
      ctx.beginShape();
        ctx.vertex(xScale(dataset[0].date), yScale(0));  // bottom left
        dataset.map(({ date, close }) => ctx.vertex(xScale(date), yScale(close)));
        ctx.vertex(xScale(dataset.last().date), yScale(0));  // bottom right
      ctx.endShape(ctx.CLOSE);
    ctx.pop();
  }

  function drawXAxis(offsetY) {
    ctx.push();
      ctx.line(chartX - 6, offsetY, xScale(dataset.last().date), offsetY);

      ctx.textAlign(ctx.CENTER);
      xLabels.map(label => {
        const scale = xScale(label);
        ctx
          .stroke('#333333')
          .line(scale, offsetY, scale, offsetY + 6);

        ctx
          .fill('#333333')
          .noStroke()
          .text(xTickFmt(label), scale, offsetY + 18);
      });
    ctx.pop();
  }

  function drawYAxis(offsetX) {
    ctx.push();
      ctx.line(chartX, chartY, chartX, yScale(0) + 6);

      ctx.textAlign(ctx.RIGHT);
      yLabels.map(label => {
        const scale = yScale(label);
        ctx
          .stroke('#333333')
          .line(chartX - 6, scale, chartX, scale);

        ctx
          .fill('#333333')
          .noStroke()
          .text(label, offsetX - 8, scale + 5.2);
      })

      ctx
        .rotate(-ctx.HALF_PI)
        .translate(chartX - 'Price ($)'.length * 5.4 - chartY, chartY + chartX - 5.4)
        .text('Price ($)', 0, 0);
    ctx.pop();
  }
});
