
QUnit.test("trace_null", function(assert) {
  var cont = traceBitmap([], 0);
  assert.deepEqual(cont, []);  
});

QUnit.test("trace_empty", function(assert) {
  var cont = traceBitmap([0], 1);
  assert.deepEqual(cont, []);  
});

QUnit.test("trace_one", function(assert) {
  var cont = traceBitmap([1], 1);
  assert.deepEqual(cont, [[[0,0], [1,0], [1,1], [0,1]]]);     
});


QUnit.test("trace_simple", function(assert) {
    var bm = [
        0,0,1,0,
        0,0,1,0,
        0,0,1,0];
    var cont = traceBitmap(bm, 4);
    var res = [[[2,0], [3,0], [3,3], [2,3]]];
    assert.deepEqual(cont, res);  
});

QUnit.test("trace_disjoint", function(assert) {
  var bm = [
    0,0,1,0,
    1,0,1,0,
    1,0,1,0];
  var cont = traceBitmap(bm, 4);
  var res = [
    [[2,0], [3,0], [3,3], [2,3]],
    [[0,1], [1,1], [1,3], [0,3]]];
  assert.deepEqual(cont, res);
});


QUnit.test("trace_convex", function(assert) {
  var bm = [
    0,1,1,1,
    0,1,1,1,
    0,0,0,0];
  var cont = traceBitmap(bm, 4);
  var res = [[[1,0], [4,0], [4,2], [1,2]]];
  assert.deepEqual(cont, res);
});

QUnit.test("trace_hole", function(assert) {
  var bm = [
    1,1,1,1,
    1,0,0,1,
    1,1,0,1,
    0,1,1,1];
  var cont = traceBitmap(bm, 4);
  var res = [
      [[0,0], [4,0], [4,4], [1,4], [1,3], [0,3]],
      [[1,1], [1,2], [2,2], [2,3], [3,3], [3,1]]];
  assert.deepEqual(cont, res);
});

QUnit.test("trace_concave", function(assert) {
  var bm = [
    0,0,1,0,
    1,1,1,1,
    1,0,1,1];
  var cont = traceBitmap(bm, 4);
  var res = [[
    [2,0], [3,0], [3,1], [4,1], [4,3], [2,3], 
    [2,2], [1,2], [1,3], [0,3], [0,1], [2,1]]];
  assert.deepEqual(cont, res);
});

QUnit.test("trace_diagonal", function(assert) {
  var bm = [
    1,0,1,0,
    0,1,0,1,
    1,0,0,1];
  var cont = traceBitmap(bm, 4, true);
  var res = [[
    [0,0], [1,0], [1,1], [2,1], [2,0], [3,0], [3,1], [4,1],
    [4,3], [3,3], [3,1], [2,1], [2,2], [1,2], [1,3], [0,3], 
    [0,2], [1,2], [1,1], [0,1]]];
  assert.deepEqual(cont, res);  
});

QUnit.test("trace_diagonal_sep", function(assert) {
  var bm = [
    1,0,1,0,
    0,1,0,1,
    1,0,0,1];
  var cont = traceBitmap(bm, 4, false);
  var res = [
    [[0,0], [1,0], [1,1], [0,1]],
    [[2,0], [3,0], [3,1], [2,1]],
    [[1,1], [2,1], [2,2], [1,2]],
    [[3,1], [4,1], [4,3], [3,3]],
    [[0,2], [1,2], [1,3], [0,3]]];
  assert.deepEqual(cont, res);
});