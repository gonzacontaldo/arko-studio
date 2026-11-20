import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleStudioMotion, STUDIO_ENTRANCE_SECONDS } from '../src/components/hero/studioMotion.js';

const actors = ['camera', 'drone', 'tour', 'gimbal'];
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));

test('all equipment remains continuous throughout the faster entrances and landings', () => {
  const delta = 1 / 120;
  let previous = sampleStudioMotion(0);
  for (let time = delta; time < STUDIO_ENTRANCE_SECONDS + 2; time += delta) {
    const next = sampleStudioMotion(time);
    for (const actor of actors) {
      assert.ok(next[actor].position.every(Number.isFinite));
      assert.ok(next[actor].rotation.every(Number.isFinite));
      assert.ok(distance(next[actor].position, previous[actor].position) < .15, `${actor} jumped at ${time}`);
      assert.ok(distance(next[actor].rotation, previous[actor].rotation) < .03, `${actor} snapped at ${time}`);
    }
    previous = next;
  }
});

test('all equipment stays in place after entering, without exits or loop resets', () => {
  const final = sampleStudioMotion(STUDIO_ENTRANCE_SECONDS + 3);
  assert.ok(STUDIO_ENTRANCE_SECONDS < 8, 'the entrance sequence should finish faster');
  for (const time of [23, 25, 28, 56, 120, 3600, 86400]) {
    const pose = sampleStudioMotion(time);
    for (const actor of actors) {
      assert.ok(distance(pose[actor].position, final[actor].position) < .13, `${actor} left its position at ${time}`);
    }
    assert.equal(pose.flash, 0, 'the flash should only fire on the initial entrance');
  }
});

test('equipment settles into the existing composition and the gimbal counters handle roll', () => {
  const pose = sampleStudioMotion(14);
  assert.ok(Math.abs(pose.camera.position[1]) < .001);
  assert.ok(Math.abs(pose.tour.position[1] - .03) < .001);
  assert.ok(Math.abs(pose.gimbal.position[0] - 1.85) < .001);
  assert.ok(Math.abs(pose.gimbal.handleRoll + pose.gimbal.counterRoll) < 1e-10);
});

test('reduced motion always shows the same complete composition without flashes', () => {
  const still = sampleStudioMotion(0, true);
  for (const time of [1, 7, 19, 100]) assert.deepEqual(sampleStudioMotion(time, true), still);
  assert.equal(still.flash, 0);
  for (const actor of actors) assert.ok(Math.abs(still[actor].position[0]) < 3);
});
