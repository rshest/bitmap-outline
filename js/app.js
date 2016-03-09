
var Opt = function() {
  this.trace = true;
  this.gridWidth = 10;
  this.gridHeight = 10;

  this.cellWidth = 30;
  this.cellHeight = 30;

  this.joinCorners = false;
  this.cornerRadius = 12;
  this.outlineWidth = 6;
  
  this.extrudeX = -10;
  this.extrudeY = -10;
  
  this.randomize = updateGridFull;
  
  this.outlineColor = "#150222";
  this.insideColor = "#673a7f";
  this.onColor = "#b0bab0";
  this.offColor = "#e9f4e9";
  this.gridColor = "#888";
};

var opt = new Opt();


var bitmap = [];

function randomizeBitmap() {
  bitmap = [];
  for (var i = 0; i < opt.gridWidth*opt.gridHeight; i++) {
    var val = Math.round(Math.random());
    bitmap.push(val);
  }  
}

function updateGridFull() {
  randomizeBitmap();
  updateGrid();
}


function updateGrid() {
  var svg = d3.select("#grid").select("svg");
  
  
  svg.attr("width", opt.gridWidth*opt.cellWidth)
    .attr("height", opt.gridHeight*opt.cellHeight);
  
  
  var toggleCell = function(d, i) {
    if (d3.event.buttons == 1) {
      bitmap[i] = 1 - bitmap[i];
      updateGrid();
    }    
  };

  var rect = svg.select("#cells").selectAll("rect").data(bitmap);
  rect.enter().append("rect");
  rect
    .attr("x", function (d, i) { return opt.cellWidth*(i%opt.gridWidth);})
    .attr("y", function (d, i) { return opt.cellHeight*Math.floor(i/opt.gridWidth);})
    .attr("width", opt.cellWidth)
    .attr("height", opt.cellHeight)
    .on("mouseenter", toggleCell)
    .on("mousedown", toggleCell);
  
  svg.selectAll("rect")
    .attr("class", "cell")
    .attr("fill", function (d) {
        return (d == 1) ? opt.onColor : opt.offColor;})
    .attr("stroke", opt.gridColor);

  var contour = traceBitmap(bitmap, opt.gridWidth, opt.joinCorners);

  var extX = opt.extrudeX*0.01;
  var extY = opt.extrudeY*0.01;

  extrudeContour(contour, extX, extY);  
  
  var r = opt.cornerRadius;
  r = Math.min(r, Math.min(opt.cellWidth*(1 + extX*2), 
    opt.cellHeight*(1 + extY*2))*0.5);
  var path = contourToSVGPathRC(contour, opt.cellWidth, opt.cellHeight, r);
  
  svg.select("path")
    .attr("stroke-width", opt.outlineWidth)
    .attr("stroke", opt.outlineColor)
    .attr("fill", opt.insideColor)
    .attr("d", opt.trace ? path : ""); 
}

function createGrid() {
  var svg = d3.select("#grid").append("svg");       
  svg.append("g").attr("id", "cells"); 
  svg.append("path")
    .attr("class", "contour");
    
  updateGrid();
}

function createGui() {
    var gui = new dat.GUI();
    gui.remember(opt);

    gui.add(opt, 'trace').onChange(updateGrid);

    gui.add(opt, 'gridWidth', 1, 256).step(1).onChange(updateGridFull);
    gui.add(opt, 'gridHeight', 1, 256).step(1).onChange(updateGridFull);
    
    gui.add(opt, 'cellWidth', 5, 50).step(1).onChange(updateGrid);
    gui.add(opt, 'cellHeight', 5, 50).step(1).onChange(updateGrid);
    
    gui.add(opt, 'joinCorners').onChange(updateGrid);


    gui.add(opt, 'cornerRadius', 0, 50).step(1).onChange(updateGrid);
    gui.add(opt, 'outlineWidth', 0, 10).step(0.1).onChange(updateGrid);
    
    gui.add(opt, 'extrudeX', -50, 50).step(1).onChange(updateGrid);
    gui.add(opt, 'extrudeY', -50, 50).step(1).onChange(updateGrid);
      
    gui.addColor(opt, 'outlineColor').onChange(updateGrid);
    gui.addColor(opt, 'insideColor').onChange(updateGrid);
    gui.addColor(opt, 'onColor').onChange(updateGrid);
    gui.addColor(opt, 'offColor').onChange(updateGrid);
    gui.addColor(opt, 'gridColor').onChange(updateGrid);
    
    gui.add(opt, 'randomize');  
}

window.onload = function () {
  createGui();
    
  randomizeBitmap();
  createGrid();
}