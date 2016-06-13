import { Tree, utils } from 'phylocanvas';

const { getPixelRatio, translatePoint } = utils.canvas;

const DEFAULTS = {
  fillStyle: 'black',
  strokeStyle: 'blue',
  lineWidth: 2,
  fontSize: 18,
  fontFamily: 'Sans-serif',
  textBaseline: 'middle',
  textAlign: 'center',
  crosshairSize: 10,
  guidelines: true,
};

class MeasureTool {

  constructor(tree, options = {}) {
    this.tree = tree;
    this.canvas = tree.canvas.canvas;
    this.cxt = tree.canvas;
    this.pixelRatio = getPixelRatio(this.cxt);

    Object.assign(this, DEFAULTS, options);
    this.isActive = false;

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
      this.clickPoint =
        translatePoint({ x: event.layerX, y: event.layerY }, this.tree);
    }
    this.tree.draw();
  }

  onMousemove(event) {
    if (!this.isActive) return;

    this.mousePoint =
        translatePoint({ x: event.layerX, y: event.layerY }, this.tree);
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

  draw() {
    if (!this.isActive) return;

    const { tree, canvas, cxt, pixelRatio, fontSize, crosshairSize, guidelines,
            xAxisOnly, yAxisOnly, clickPoint, mousePoint } = this;

    if (guidelines && mousePoint) {
      const top = (0 - tree.offsety * pixelRatio) / tree.zoom;
      const bottom = (canvas.height - tree.offsety * pixelRatio) / tree.zoom;
      const left = (0 - tree.offsetx * pixelRatio) / tree.zoom;
      const right = (canvas.width - tree.offsetx * pixelRatio) / tree.zoom;
      cxt.beginPath();
      if (!yAxisOnly) {
        cxt.moveTo(mousePoint.x, top);
        cxt.lineTo(mousePoint.x, bottom);
        cxt.stroke();
      }
      if (!xAxisOnly) {
        cxt.moveTo(left, mousePoint.y);
        cxt.lineTo(right, mousePoint.y);
        cxt.stroke();
      }
      cxt.closePath();
    }

    if (!clickPoint) return;

    // set style
    cxt.fillStyle = this.fillStyle;
    cxt.strokeStyle = this.strokeStyle;
    cxt.lineWidth = Math.max(0.01, this.lineWidth / tree.zoom);
    cxt.textBaseline = this.textBaseline;
    cxt.textAlign = this.textAlign;
    cxt.font = `${fontSize / tree.zoom}px ${this.fontFamily}`;

    this.drawCrosshair(clickPoint, crosshairSize);

    if (!mousePoint) return;

    // draw a line connecting clicked point and current mouse point
    const start = clickPoint;
    const end = { x: yAxisOnly ? clickPoint.x : mousePoint.x,
                  y: xAxisOnly ? clickPoint.y : mousePoint.y };
    cxt.beginPath();
    cxt.moveTo(start.x, start.y);
    cxt.lineTo(end.x, end.y);
    cxt.stroke();
    cxt.closePath();

    // caluclate distance
    const hypot = Math.hypot(start.x - end.x, start.y - end.y);
    const distance = (hypot / tree.branchScalar).toFixed(6);

    // clear distance label background
    const labelWidth = cxt.measureText(distance).width;
    const labelHeight = fontSize / tree.zoom;
    const labelPoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
    cxt.clearRect(labelPoint.x - labelWidth / 2,
      labelPoint.y - labelHeight / 2, labelWidth, labelHeight);

    // draw distance label
    cxt.fillText(distance, labelPoint.x, labelPoint.y);

    if (xAxisOnly || yAxisOnly) {
      this.drawCrosshair(end, crosshairSize);
    }
  }

  drawCrosshair(centre, size) {
    const { tree, pixelRatio } = this;
    const start = { x: centre.x - size / tree.zoom * pixelRatio,
                    y: centre.y - size / tree.zoom * pixelRatio };
    const end = { x: centre.x + size / tree.zoom * pixelRatio,
                  y: centre.y + size / tree.zoom * pixelRatio };
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
    tree.measureTool = new MeasureTool(tree, config.measureTool);
    return tree;
  });

  decorate(Tree, 'draw', function (delegate, args) {
    delegate.apply(this, args);
    this.measureTool.draw.apply(this.measureTool, args);
  });

  this.MeasureTool = MeasureTool;
}
