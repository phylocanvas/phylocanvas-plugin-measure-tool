import { Tree, utils } from 'phylocanvas';

const { translatePoint, getPixelRatio } = utils.canvas;

class MeasureTool {

  constructor(tree, { isActive = false, fontSize = 24, crosshairSize = 10 }) {
    this.tree = tree;
    this.canvas = tree.canvas.canvas;
    this.cxt = tree.canvas;

    this.isActive = isActive;
    this.fontSize = fontSize;
    this.crosshairSize = crosshairSize;

    this.tree.addListener('click', event => this.onClick(event));
    this.tree.addListener('mousemove', event => this.onMousemove(event));
    this.tree.addListener('keydown', event => this.onKeydown(event));
  }

  enable() {
    if (!this.isActive) {
      this.isActive = true;
      this.originalCursor = this.canvas.style.cursor;
      this.canvas.style.cursor = 'crosshair';
      this.tree.draw();
    }
  }

  disable() {
    if (this.isActive) {
      this.isActive = false;
      this.canvas.style.cursor = this.originalCursor;
      this.tree.draw();
    }
  }

  toggle() {
    if (this.isActive) {
      this.disable();
    } else {
      this.enable();
    }
  }

  onClick(event) {
    if (!this.isActive) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.clickPoint) {
      this.clickPoint = null;
    } else {
      this.clickPoint = { x: event.layerX, y: event.layerY };
    }
    this.tree.draw();
  }

  onMousemove(event) {
    if (!this.isActive) return;

    this.mousePoint = { x: event.layerX, y: event.layerY };
    this.xAxisOnly = !this.yAxisOnly && event.metaKey || event.ctrlKey;
    this.yAxisOnly = !this.xAxisOnly && event.shiftKey;
  }

  onKeydown(event) {
    if (!this.isActive) return;

    if (event.which === 27) {
      this.clickPoint = null;
      this.mousePoint = null;
    }

    this.tree.draw();
  }

  setStyle() {
    this.cxt.strokeStyle = 'blue';
    this.cxt.lineWidth = Math.max(0.01, 2 / this.tree.zoom);
    this.cxt.textBaseline = 'middle';
    this.cxt.textAlign = 'center';
    this.cxt.font = `${this.fontSize / this.tree.zoom}px Sans-serif`;
  }

  draw() {
    if (!this.isActive) return;

    const { tree, cxt, fontSize, crosshairSize,
            xAxisOnly, yAxisOnly, clickPoint, mousePoint } = this;

    if (!clickPoint) return;

    this.setStyle();

    this.drawCrosshair(clickPoint.x, clickPoint.y, crosshairSize);

    if (!mousePoint) return;

    // draw a line connecting clicked point and current mouse point
    const startX = clickPoint.x;
    const startY = clickPoint.y;
    const endY = xAxisOnly ? clickPoint.y : mousePoint.y;
    const endX = yAxisOnly ? clickPoint.x : mousePoint.x;
    const startCanvasPoint = translatePoint(clickPoint, tree);
    const endCanvasPoint = translatePoint({ x: endX, y: endY }, tree);
    cxt.beginPath();
    cxt.moveTo(startCanvasPoint.x, startCanvasPoint.y);
    cxt.lineTo(endCanvasPoint.x, endCanvasPoint.y);
    cxt.stroke();
    cxt.closePath();

    // caluclate distance
    const hypot = Math.hypot(startX - endX, startY - endY);
    const distance =
      (getPixelRatio(cxt) * hypot / tree.branchScalar / tree.zoom).toFixed(6);

    // clear distance label background
    const labelWidth = cxt.measureText(distance).width;
    const labelHeight = fontSize / tree.zoom;
    const labelPoint =
      translatePoint({ x: (startX + endX) / 2, y: (startY + endY) / 2 }, tree);
    cxt.clearRect(labelPoint.x - labelWidth / 2,
      labelPoint.y - labelHeight / 2, labelWidth, labelHeight);

    // draw distance label
    cxt.fillText(distance, labelPoint.x, labelPoint.y);

    if (xAxisOnly || yAxisOnly) {
      this.drawCrosshair(endX, endY, crosshairSize);
    }
  }

  drawCrosshair(x, y, size) {
    const centre = translatePoint({ x, y }, this.tree);
    const start = translatePoint({
      x: x - size,
      y: y - size },
    this.tree);
    const end = translatePoint({
      x: x + size,
      y: y + size },
    this.tree);
    this.cxt.beginPath();
    this.cxt.moveTo(centre.x, start.y);
    this.cxt.lineTo(centre.x, end.y);
    this.cxt.moveTo(start.x, centre.y);
    this.cxt.lineTo(end.x, centre.y);
    this.cxt.stroke();
    this.cxt.closePath();
  }

}

export default function plugin(decorate) {
  decorate(this, 'createTree', (delegate, args) => {
    const tree = delegate(...args);
    const [ , config = {} ] = args;
    tree.measureTool = new MeasureTool(tree, config.measureTool || {});
    return tree;
  });

  decorate(Tree, 'draw', function (delegate, args) {
    delegate.apply(this, args);
    this.measureTool.draw.apply(this.measureTool, args);
  });

  this.MeasureTool = MeasureTool;
}
