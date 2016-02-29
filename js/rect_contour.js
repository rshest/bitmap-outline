function traceBitmap(pixels, width, joinDiagonals) {
  var res = [];
  if (width == 0) {
    return res;
  }
  
  var edges = {};
  var npixels = pixels.length;
  var height = Math.round(npixels/width);
  var neighborOffs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var edgeOffs = [[0, 1], [1, width + 2], [width + 2, width + 1], [width + 1, 0]];
  
  var isInside = function(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  };
  
  //  extract (non-duplicated) edges of every non-empty pixel's square
  var idx = 0, i, j, e, ni, nj, esrc, edst;
  for (j = 0; j < height; j++) {
    for (i = 0; i < width; i++) {
      if (!pixels[i + j*width]) continue;
      
      //  consider inserting each edge, clockwise
      for (e = 0; e < 4; e++) {
        ni = neighborOffs[e][0] + i;
        nj = neighborOffs[e][1] + j;
        if (isInside(ni, nj) && pixels[ni + nj*width]) continue;
        
        //  no pixels sharing the edge, insert it
        idx = i + j*(width + 1);
        esrc = edgeOffs[e][0] + idx;
        edst = edgeOffs[e][1] + idx;
        if (esrc in edges) {
          edges[esrc].push(edst);
        } else {
          edges[esrc] = [edst];
        }
      }
    }
  }

  var idx2coor = function(idx) {
    return [idx%(width + 1), Math.floor(idx/(width + 1))];
  };
  
  var vertical = function(e) {
    return Math.abs(e[0] - e[1]) > width;
  };
  
  var collinear = function(e1, e2) {
    return e1[0] == e1[1] || e2[0] == e2[1] || 
      vertical(e1) == vertical(e2);
  };
  
  var clockwise = function(a, b, c) {
    if (vertical([a, b])) {
      return !vertical([b, c]) && (a < b) == (c < b);
    } else {
      return vertical([b, c]) && (a < b) == (b < c);      
    }
  };
  
  //  traverse the contours, collapsing aligned segments
  var curEdge = [-1, -1], chain, ca, cb, cbArr;
  while (Object.keys(edges).length > 0) {
    for (e in edges) break;
    chain = [idx2coor(e)];
    res.push(chain);
    curEdge = [e, e];
    while (true) {
      ca = curEdge[1];
      cbArr = edges[ca];
      if (cbArr == undefined) break;
      
      cb = cbArr[0]; 
      if (cbArr.length > 1) {
        //  at this point we still have more than one outgoing edge, e.g:
        //  x|
        //   |x
        if (!clockwise(curEdge[0], ca, cb) == joinDiagonals) {
          cbArr.splice(0, 1);
        } else {
          cb = cbArr[1];
          cbArr.splice(1, 1);
        }
      } else {
        delete edges[ca];
      }
      
      if (collinear(curEdge, [ca, cb])) {
        curEdge[1] = cb;  
      } else {
        chain.push(idx2coor(ca));
        curEdge = [ca, cb];  
      }
    }
  }
        
  return res;
}

function contourToSVGPath(contour, scaleX, scaleY) {
  var res = "", chain, p, pidx, cidx;
  for (cidx in contour) {
      chain = contour[cidx];
      res += "M";
      for (pidx in chain) {
        p = chain[pidx];
        res += p[0]*scaleX + " " + p[1]*scaleY + " ";
      }
      res += "z ";
  }
  return res;
}

function contourToSVGPathRC(contour, scaleX, scaleY, r) {
  var clockwise = function (a, b, c) {
    var x1 = b[0] - a[0];
    var y1 = b[1] - a[1];
    var x2 = c[0] - b[0];
    var y2 = c[1] - b[1];
    return (x1*y2) - (y1*x2) < 0;
  };
   
  var res = "";
  var chain, pa, pb, pc, np, cidx, i, sign, sign1, sweep;
  for (cidx in contour) {
    chain = contour[cidx];
    res += "M";
    np = chain.length;
    for (i = 1; i <= np; i++) {
      pa = chain[i - 1];
      pb = chain[i%np];
      pc = chain[(i + 1)%np];
      sweep = clockwise(pa, pb, pc) ? 0 : 1;
      if (pb[1] == pa[1]) {
        sign = Math.sign(pb[0] - pa[0]);
        sign1 = Math.sign(pc[1] - pb[1]);
        
        if (i == 1) {
          res += (pa[0]*scaleX + r*sign) + " " + pa[1]*scaleY + " ";
        }
        res += "h" + ((pb[0] - pa[0])*scaleX - 2*r*sign) + " ";
        res += "a" + r + " " + r + " 0 0 " + sweep + " " + 
          (r*sign) + " " + (r*sign1) + " ";
      } else {
        sign = Math.sign(pb[1] - pa[1]);
        sign1 = Math.sign(pc[0] - pb[0]);
        if (i == 1) {
          res += pa[0]*scaleX + " " + (pa[1]*scaleY + r*sign) + " ";
        }
        res += "v" + ((pb[1] - pa[1])*scaleY - 2*r*sign) + " ";
        res += "a" + r + " " + r + " 0 0 " + sweep + " " + 
          (r*sign1) + " " + (r*sign) + " ";
      }
    }
    res += "z ";
  } 
  return res;
}

function extrudeContour(contour, dx, dy) {
  var chain, pa, pb, np, cidx, i, offx, offy;
  for (cidx in contour) {
      chain = contour[cidx];
      np = chain.length;
      for (i = 1; i <= np; i++) {
        pa = chain[i - 1];
        pb = chain[i%np];
        if (pb[1] == pa[1]) {
          offx = 0;
          offy = (pb[0] > pa[0]) ? -dy : dy;
        } else {
          offx = (pb[1] > pa[1]) ? dx : -dx;
          offy = 0;
        }
        pa[0] += offx;
        pa[1] += offy;
        pb[0] += offx;
        pb[1] += offy;
      }
  }  
}