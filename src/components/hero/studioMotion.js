// Motion is sampled from time so pauses, resizing and reduced-motion mode stay deterministic.
const clamp = value => Math.max(0, Math.min(1, value));
const progress = (time, start, duration) => clamp((time - start) / duration);
const smooth = value => value * value * value * (value * (value * 6 - 15) + 10);
const travel = (time, start, duration) => smooth(progress(time, start, duration));
const bell = value => 16 * value * value * (1 - value) * (1 - value);
const settle = (time, start, strength, frequency = 15) => {
  const age = time - start;
  return age < 0 ? 0 : strength * Math.exp(-age * 5) * Math.sin(age * frequency);
};
function bezier(a, b, c, d, t) {
  const u = 1 - t;
  return a.map((value, i) => u*u*u*value + 3*u*u*t*b[i] + 3*u*t*t*c[i] + t*t*t*d[i]);
}

const ENTRANCE_SPEED = 1.4;
export const STUDIO_ENTRANCE_SECONDS = 11 / ENTRANCE_SPEED;

export function sampleStudioMotion(seconds, reducedMotion = false) {
  const time = reducedMotion ? 14 : Math.max(0, seconds);
  const t = reducedMotion ? 14 : time * ENTRANCE_SPEED;
  const idleTime = time - STUDIO_ENTRANCE_SECONDS;
  const fall = progress(t, 0, 1.7);
  const touchdown = Math.abs(settle(t, 1.7, .055, 18));
  const camera = {
    position: [-1.05, 6*(1-fall*fall) + touchdown, .2],
    rotation: [0, .12 + .16*(1-fall), -.055*(1-fall) + settle(t, 1.7, .012)],
    legFold: .2*(1-travel(t, .55, 1.15)) - Math.abs(settle(t, 1.7, .012)),
  };

  const flightIn = travel(t, 2.8, 3.5);
  const hoverWeight = flightIn;
  const dronePosition = bezier([9,5.5,-3.2], [5,4.9,-2.3], [-.2,4.1,-1.6], [.8,3.65,-1.05], flightIn);
  if (!reducedMotion) {
    dronePosition[0] += Math.sin(time*.77)*.035*hoverWeight;
    dronePosition[1] += (Math.sin(time*1.3)*.035 + Math.sin(time*2.1)*.012)*hoverWeight;
    dronePosition[2] += Math.cos(time*.9)*.025*hoverWeight;
  }
  const bankIn = bell(flightIn);
  const drone = {
    position: dronePosition,
    rotation: [.08 + bankIn*.13, -.3 - bankIn*.65, -.025 + bankIn*.24],
  };

  // Equipment arrives at full size on a shallow arc and settles on its feet.
  const tourIn = travel(t, 5.7, 2.6);
  const tourTravel = 1-tourIn;
  const tour = {
    position: [.45 + 9*tourTravel, .03 + .24*bell(tourIn), 1.35 + .8*tourTravel],
    rotation: [0, .12 + .35*(1-tourIn), -.1*bell(tourIn) + settle(t, 8.3, .025)],
  };

  const gimbalIn = travel(t, 8, 3);
  const gimbalTravel = 1-gimbalIn;
  const handling = bell(gimbalIn)*.2;
  const scan = reducedMotion ? .12 : Math.sin(idleTime*.5)*.2;
  const gimbal = {
    position: [1.85 + 9*gimbalTravel, .14*bell(gimbalIn), -.2 - .5*gimbalTravel],
    rotation: [0, .15*(1-gimbalIn), handling*.16 + settle(t, 11, .014)],
    handleRoll: handling + scan*.09,
    pan: .35 + scan - handling*.5,
    // The roll motor counters the handle; the payload stays horizontal.
    counterRoll: -(handling + scan*.09),
    pitch: reducedMotion ? 0 : Math.sin(idleTime*.4)*.025,
  };

  const flashAge = t - 2.5;
  const flash = !reducedMotion && flashAge > 0 && flashAge < .18 ? Math.sin(flashAge/.18*Math.PI) : 0;
  return { camera, drone, tour, gimbal, flash, time };
}
