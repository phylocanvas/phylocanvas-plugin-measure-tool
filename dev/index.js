import 'phylocanvas/polyfill';

import Phylocanvas from 'phylocanvas';
import measureToolPlugin from '../src';

Phylocanvas.plugin(measureToolPlugin);

const tree = Phylocanvas.createTree('phylocanvas', {
  measureTool: {},
  padding: 10,
});

tree.setTreeType('rectangular');
// tree.setTreeType('circular');
tree.containerElement.style.overflow = 'hidden';

const toogleButton = document.createElement('button');
toogleButton.innerHTML = 'Toggle';
toogleButton.addEventListener('click', () => tree.measureTool.toggle());
document.body.appendChild(toogleButton);

const subtreeButton = document.createElement('button');
subtreeButton.innerHTML = 'subtree';
subtreeButton.addEventListener('click', () => {
  const branch = tree.branches.E;
  branch.redrawTreeFromBranch();
});
document.body.appendChild(subtreeButton);

const resetButton = document.createElement('button');
resetButton.innerHTML = 'Redraw Original';
resetButton.addEventListener('click', () => tree.redrawOriginalTree());
document.body.appendChild(resetButton);


tree.on('error', event => { throw event.error; });

tree.on('loaded', () => console.log('loaded'));

tree.load('((B:0.2,(C:0.3,(G:0.2,H:0.3)D:0.4)E:0.5)F:0.1)A;');
// tree.load('(((((((strain1:8.0,(((((((strain2:2.0,strain3:2.0):0.0,(strain4:1.0,strain5:1.0):1.0):0.0,strain6:1.0):0.0,strain7:0.0):0.0,strain8:3.0):0.0,strain9:2.0):1.0,((strain10:0.0,strain11:1.0):2.0,(strain12:2.0,((strain13:0.0,(strain14:0.0,strain15:0.0):0.0):6.0,strain16:3.0):0.0):0.0):2.0):16.0):39.0,(strain17:1.0,(strain18:0.0,strain19:0.0):0.0):22.0):1.0,(strain20:4.0,(strain21:0.0,strain22:1.0):1.0):50.0):2.0,strain23:26.0):5.0,strain24:46.0):2.0):1.0);');

tree.measureTool.enable();

window.tree = tree;
