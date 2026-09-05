import test from 'node:test';
import assert from 'node:assert/strict';
import { animationColumn, directionIndex, frameAt, cellRect } from '../runtime/geometry.js';
test('screen coordinates map cardinal and diagonal directions clockwise', () => {
  for (const [x,y,index] of [[0,-1,0],[1,-1,2],[1,0,4],[1,1,6],[0,1,8],[-1,1,10],[-1,0,12],[-1,-1,14]]) assert.equal(directionIndex(x,y),index);
  assert.equal(directionIndex(0,0),null);
  assert.equal(directionIndex(-.001,-1),0);
});
test('timing boundaries, wrapping and one-shot completion', () => {
  assert.deepEqual(frameAt([100,200],99),{index:0,done:false});
  assert.deepEqual(frameAt([100,200],100),{index:1,done:false});
  assert.deepEqual(frameAt([100,200],300),{index:0,done:false});
  assert.deepEqual(frameAt([100,200],300,false),{index:1,done:true});
  assert.throws(() => frameAt([0],5),TypeError);
});
test('last v2 direction is isolated inside the atlas', () => {
  const m={atlas:{rows:11,columns:8,cellWidth:192,cellHeight:208}};
  assert.deepEqual(cellRect(m,10,7),{x:1344,y:2080,width:192,height:208});
  assert.throws(()=>cellRect(m,11,0),RangeError);
});
test('desktop animations may reuse atlas columns without duplicating artwork', () => {
  const animation = { frameIndices: [4, 4, 3, 4] };
  assert.equal(animationColumn(animation, 0), 4);
  assert.equal(animationColumn(animation, 2), 3);
  assert.equal(animationColumn({}, 2), 2);
  assert.throws(() => animationColumn({ frameIndices: [-1] }, 0), RangeError);
});
