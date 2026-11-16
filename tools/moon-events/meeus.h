/* C port of the Moonplan app's own Moon/Sun series (MoonCore: MoonPosition, SunPosition, Nutation, JulianTime ΔT).
   Only the 2005-2150 ΔT branch is ported (the generator range is 2026-2029). */
#ifndef MEEUS_H
#define MEEUS_H
#include <math.h>
#include "tables.h"

#define J2000 2451545.0
#define D2R (M_PI / 180.0)
static double norm360(double x) { double r = fmod(x, 360.0); return r < 0 ? r + 360.0 : r; }
static double wrap180(double x) { double r = norm360(x); return r > 180.0 ? r - 360.0 : r; }
static double sinD(double x) { return sin(x * D2R); }
static double cosD(double x) { return cos(x * D2R); }

static double delta_t(double jd) {
    double y = 2000.0 + (jd - J2000) / 365.25;
    return 64.7 + 0.184 * (y - 2005.0) + 0.001657 * (y - 2005.0) * (y - 2030.0);
}
static double centuries_tt(double jdut) { return (jdut + delta_t(jdut) / 86400.0 - J2000) / 36525.0; }

static double nutation_dpsi(double t) {
    double omega = 125.04452 - 1934.136261 * t, l = 280.4665 + 36000.7698 * t, lm = 218.3165 + 481267.8813 * t;
    return (-17.20 * sinD(omega) - 1.32 * sinD(2 * l) - 0.23 * sinD(2 * lm) + 0.21 * sinD(2 * omega)) / 3600.0;
}
static double e_factor(int m, double e) { int a = abs(m); return a == 1 ? e : (a == 2 ? e * e : 1.0); }

/* Apparent ecliptic longitude of the Moon (Meeus ch. 47 + nutation), degrees. */
static double moon_lon_t(double t) {
    double t2 = t * t, t3 = t2 * t, t4 = t3 * t;
    double lp = norm360(218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841.0 - t4 / 65194000.0);
    double d = norm360(297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868.0 - t4 / 113065000.0);
    double m = norm360(357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000.0);
    double mp = norm360(134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699.0 - t4 / 14712000.0);
    double f = norm360(93.2720950 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000.0 + t4 / 863310000.0);
    double a1 = norm360(119.75 + 131.849 * t), a2 = norm360(53.09 + 479264.290 * t);
    double e = 1.0 - 0.002516 * t - 0.0000074 * t2;
    double dr = d * D2R, mr = m * D2R, mpr = mp * D2R, fr = f * D2R, sum = 0.0;
    for (int i = 0; i < 360; i += 6) {
        const int *r = TABLE_LR + i;
        double arg = r[0] * dr + r[1] * mr + r[2] * mpr + r[3] * fr;
        sum += r[4] * e_factor(r[1], e) * sin(arg);
    }
    sum += 3958.0 * sinD(a1) + 1962.0 * sinD(lp - f) + 318.0 * sinD(a2);
    return norm360(lp + sum / 1000000.0 + nutation_dpsi(t));
}

/* Apparent longitude of the Sun (Meeus ch. 25 + nutation + aberration), degrees. */
static double sun_lon_t(double t) {
    double l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t, m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    double e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
    double c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sinD(m) + (0.019993 - 0.000101 * t) * sinD(2 * m) + 0.000289 * sinD(3 * m);
    double v = m + c, r = 1.000001018 * (1 - e * e) / (1 + e * cosD(v));
    return norm360(l0 + c + nutation_dpsi(t) - 20.4898 / 3600.0 / r);
}
static double moon_lon(double jdut) { return moon_lon_t(centuries_tt(jdut)); }
static double sun_lon(double jdut) { return sun_lon_t(centuries_tt(jdut)); }
#endif
