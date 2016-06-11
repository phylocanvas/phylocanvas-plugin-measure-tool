# Phylocanvas Measure Tool Plugin
Interactive distance measure tool for Phylocanvas.

## Usage
```
npm install phylocanvas phylocanvas-plugin-measure-tool
```
```javascript
import Phylocanvas from 'phylocanvas';
import measureToolPlugin from 'phylocanvas-plugin-measure-tool';

Phylocanvas.plugin(measureToolPlugin);

Phylocanvas.createTree('id', {
  // config defaults
  measureTool: {
    isActive: false,
    fontSize: 16,
    crosshairSize: 10,
  },
})
```


## Options

A list of available options:
* `isActive`: A boolean flag to enable or disable the measure tool.
* `fontSize`: The font size of distance label.
* `crosshairSize`: The size of crosshair shape.


## Methods

* `enable`: activates the measure tool.
* `disable`: deactivates the measure tool.
* `toggle`: activates or deactivates the measure tool.
