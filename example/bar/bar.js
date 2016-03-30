'use strict'

new p5(ctx => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  };

  const width  = 960;
  const height = 500;

  const ctxWidth  = width - margin.left - margin.right;
  const ctxHeight = height - margin.top - margin.bottom;

  const chartX = margin.left;
  const chartY = margin.top;

  let data;
  ctx.preload = () => {
    const reAssign = ({ rows }) => {
      data = rows.map(({ obj: { letter, frequency } }) => {
        return {
          letter,
          frequency: +frequency
        }
      });
    }

    ctx.loadTable('data.tsv', 'tsv', 'header', reAssign);
  }

  let xScale, yScale;
  ctx.setup = () => {
    xScale = d3.scale.ordinal()
      .domain(data.map(({ letter }) => letter))
      .rangeRoundBands([ chartX, chartX + ctxWidth ], .1);

    yScale = d3.scale.linear()
      .domain([ 0, d3.max(data, d => d.frequency) ])
      .range([ chartY + ctxHeight, chartY ]);

    ctx.createCanvas(width, height);
    drawBar();
  }

  function drawBar() {
    data.map(({ letter, frequency }) => {
      const barX = xScale(letter);
      const barY = yScale(frequency);

      const barWidth = xScale.rangeBand();
      const barHeight = chartY + ctxHeight - barY;

      // p5.play.js
      // OffsetXY is at the middle of each bar.
      const offsetX = barX + barWidth / 2;
      const offsetY = barY + barHeight / 2;
      const sprite = ctx.createSprite(offsetX, offsetY, barWidth, barHeight);
      sprite.shapeColor = 'steelblue';

      sprite.onMouseOver = function() { this.shapeColor = 'brown'; }
      sprite.onMouseOut  = function() { this.shapeColor = 'steelblue'; }
    });
  }

  ctx.draw = () => {
    init();
    ctx.drawSprites();  // p5.play.js

    drawXAxis();
    drawYAxis();
  }

  function init() {
    ctx.clear();
    ctx.background('white');
    ctx.fill('#333333');
    ctx.noStroke();
    ctx.textSize(12);
  }

  function drawXAxis() {
    ctx.textAlign(ctx.CENTER);
    data.map(({ letter }) => {
      const scalePointer = xScale(letter);
      ctx.text(letter, scalePointer + xScale.rangeBand() / 2, chartY + ctxHeight + 16);
    });
  }

  function drawYAxis() {
    ctx.stroke('#333333');
    ctx.line(chartX, chartY, chartX, chartY + ctxHeight);

    ctx.textAlign(ctx.RIGHT);
    yScale.ticks(10, "%").map(scale => {
      ctx.stroke('#333333');
      const scalePointer = yScale(scale);
      ctx.line(chartX - 4, scalePointer, chartX, scalePointer);

      ctx.noStroke();
      const label = `${Math.round(scale * 100)}%`;
      ctx.text(label, chartX - 8, scalePointer + 4);
    });
  }
});
