// Low-precision Moon phase for the background scene (Meeus, Astronomical Algorithms, ch. 22/47/48, main terms).
// Accuracy of the illuminated fraction is checked against pyswisseph in check_phase.py.
const RAD = Math.PI / 180;
const norm = (d) => ((d % 360) + 360) % 360;

export function moonPhase(date = new Date()) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const D = norm(297.8501921 + 445267.1114034 * T);   // mean elongation of the Moon
  const M = norm(357.5291092 + 35999.0502909 * T);    // Sun's mean anomaly
  const Mp = norm(134.9633964 + 477198.8675055 * T);  // Moon's mean anomaly
  const F = norm(93.2720950 + 483202.0175233 * T);    // Moon's argument of latitude
  const s = (x) => Math.sin(x * RAD);
  // Phase angle i (Meeus 48.4), degrees
  const i = 180 - D - 6.289 * s(Mp) + 2.100 * s(M) - 1.274 * s(2 * D - Mp)
    - 0.658 * s(2 * D) - 0.214 * s(2 * Mp) - 0.110 * s(D);
  const fraction = (1 + Math.cos(i * RAD)) / 2;
  // Waxing while the Moon's geocentric longitude is less than 180 deg east of the Sun
  const L0 = 280.46646 + 36000.76983 * T;
  const sunLon = L0 + (1.914602 - 0.004817 * T) * s(M) + 0.019993 * s(2 * M) + 0.000289 * s(3 * M);
  const moonLon = 218.3164477 + 481267.88123421 * T + 6.288774 * s(Mp) + 1.274027 * s(2 * D - Mp)
    + 0.658314 * s(2 * D) + 0.213618 * s(2 * Mp) - 0.185116 * s(M) - 0.114332 * s(2 * F);
  const elongation = norm(moonLon - sunLon);
  return { phaseAngle: norm(i), fraction, waxing: elongation < 180, elongation };
}
