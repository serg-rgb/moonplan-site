/* Precomputes the Moon events the "Moon today" page needs (assets/today/events.json).
   Mirrors the Moonplan app: Moon and Sun from the app's own Meeus series (meeus.h; phases, sign changes, void-of-course
   bracket), planets and the constellation from Astronomy Engine (apparent longitude of date / J2000 constellation).
   Build: cc -O2 -I/Users/admin/Desktop/Moonplan/vendor/astronomy-engine -o gen gen.c /Users/admin/Desktop/Moonplan/vendor/astronomy-engine/astronomy.c -lm
   Run:   ./gen > ../../assets/today/events.json */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "astronomy.h"
#include "meeus.h"

#define UNIX_JD 2440587.5
#define MAXN 4096
static double jd_of(double unix_s) { return unix_s / 86400.0 + UNIX_JD; }
static double unix_of(double jd) { return (jd - UNIX_JD) * 86400.0; }

/* ---- Astronomy Engine side (same calls as the app's Ephemeris.swift) ---- */
static double planet_lon(astro_body_t body, double jdut) {
    astro_time_t t = Astronomy_TimeFromDays(jdut - J2000);
    astro_vector_t v = Astronomy_GeoVector(body, t, ABERRATION);
    astro_rotation_t rot = Astronomy_Rotation_EQJ_ECT(&t);
    astro_vector_t e = Astronomy_RotateVector(rot, v);
    return norm360(atan2(e.y, e.x) * 180.0 / M_PI);
}
static const astro_body_t BODIES[9] = {BODY_SUN, BODY_MERCURY, BODY_VENUS, BODY_MARS, BODY_JUPITER, BODY_SATURN, BODY_URANUS, BODY_NEPTUNE, BODY_PLUTO};
static double body_lon(int i, double jdut) { return i == 0 ? sun_lon(jdut) : planet_lon(BODIES[i], jdut); }

static const char *ZOD[12] = {"Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Sgr", "Cap", "Aqr", "Psc"};
static const int ZOD_ELEMENT[12] = {0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3}; /* 0 fruit, 1 root, 2 flower, 3 leaf */
static int zodiac_index(const char *s) { for (int i = 0; i < 12; i++) if (!strcmp(s, ZOD[i])) return i; return -1; }
static const char *const_symbol(double ra_h, double dec) { return Astronomy_Constellation(ra_h, dec).symbol; }
static const char *ecliptic_symbol(double lon) { /* J2000 ecliptic point, latitude 0 */
    double eps = 23.4392911 * D2R, l = lon * D2R, x = cos(l), y = sin(l) * cos(eps), z = sin(l) * sin(eps);
    return const_symbol(norm360(atan2(y, x) * 180.0 / M_PI) / 15.0, asin(z) * 180.0 / M_PI);
}
/* MoonConstellation.onEcliptic: Ophiuchus counts as Scorpius; other non-zodiac -> nearest zodiac on the ecliptic. */
static int on_ecliptic(double lon) {
    for (double d = 0; d <= 30; d += 0.05)
        for (int k = 0; k < 2; k++) {
            const char *s = ecliptic_symbol(norm360(lon + (k ? -d : d)));
            if (!strcmp(s, "Oph")) return 7;
            int z = zodiac_index(s); if (z >= 0) return z;
        }
    return 7;
}
/* Garden element of MoonConstellation.at(): 0 fruit, 1 root, 2 flower, 3 leaf. */
static int moon_element(double jdut) {
    astro_time_t t = Astronomy_TimeFromDays(jdut - J2000);
    astro_vector_t v = Astronomy_GeoMoon(t);
    astro_equatorial_t eq = Astronomy_EquatorFromVector(v);
    const char *sym = const_symbol(eq.ra, eq.dec);
    int z = zodiac_index(sym);
    if (z < 0 && !strcmp(sym, "Oph")) z = 7;
    if (z < 0) {
        astro_vector_t e = Astronomy_RotateVector(Astronomy_Rotation_EQJ_ECL(), v);
        z = on_ecliptic(norm360(atan2(e.y, e.x) * 180.0 / M_PI));
    }
    return ZOD_ELEMENT[z];
}

/* ---- events ---- */
static double elong(double jd) { return norm360(moon_lon(jd) - sun_lon(jd)); }
static double bisect_phase(double a, double b, double target) { /* elongation crosses target upwards in (a,b] */
    for (int i = 0; i < 60; i++) { double m = 0.5 * (a + b); if (wrap180(elong(m) - target) < 0) a = m; else b = m; }
    return 0.5 * (a + b);
}
static double bisect_lon(double a, double b, double target) {
    for (int i = 0; i < 60; i++) { double m = 0.5 * (a + b); if (wrap180(moon_lon(m) - target) < 0) a = m; else b = m; }
    return 0.5 * (a + b);
}
static double bisect_element(double a, double b, int from_el) { /* last instant with element == from_el */
    for (int i = 0; i < 40; i++) { double m = 0.5 * (a + b); if (moon_element(m) == from_el) a = m; else b = m; }
    return b;
}

/* Void window of one sign stay [a,b] (VoidOfCourse.window(forStay:)): last of 8 aspects to Sun, Mercury..Pluto. */
static double void_start(double a, double b) {
    static const double ANG[8] = {0, 60, 90, 120, 180, 240, 270, 300};
    double last = a;
    for (int body = 0; body <= 8; body++) {
        double r0 = norm360(moon_lon(a) - body_lon(body, a));
        double delta = norm360(norm360(moon_lon(b) - body_lon(body, b)) - r0);
        for (int k = 0; k < 8; k++) {
            if (norm360(ANG[k] - r0) > delta) continue;
            double lo = a, hi = b;
            for (int i = 0; i < 26; i++) {
                double mid = 0.5 * (lo + hi);
                double rel = moon_lon(mid) - body_lon(body, mid);
                if (wrap180(rel - ANG[k]) < 0) lo = mid; else hi = mid;
            }
            double x = 0.5 * (lo + hi); if (x > last) last = x;
        }
    }
    return last;
}

static void print_list(const char *name, const long long *v, int n) {
    printf("\"%s\":[", name);
    for (int i = 0; i < n; i++) printf("%s%lld", i ? "," : "", v[i]);
    printf("]");
}

int main(void) {
    struct tm tm0 = {0}; tm0.tm_year = 126; tm0.tm_mon = 10; tm0.tm_mday = 1;   /* 2026-11-01 */
    struct tm tm1 = {0}; tm1.tm_year = 129; tm1.tm_mon = 0; tm1.tm_mday = 1;    /* 2029-01-01 */
    double from = (double)timegm(&tm0), to = (double)timegm(&tm1);
    double jf = jd_of(from), jt = jd_of(to);
    static long long ph[MAXN], ing[MAXN], con[MAXN * 2], voids[MAXN * 2];
    int nph = 0, ning = 0, ncon = 0, nvoid = 0, ph0 = -1;

    /* phase events from 10 days before the range (so the phase at the first noon is known) to the end */
    double prev = elong(jf - 10.0); int q = (int)(prev / 90.0);
    for (double jd = jf - 10.0 + 0.125; jd <= jt; jd += 0.125) {
        double e = elong(jd); int nq = (int)(e / 90.0);
        if (nq != q) {
            double x = bisect_phase(jd - 0.125, jd, nq * 90.0);
            if (ph0 < 0) ph0 = nq;
            ph[nph++] = (long long)floor(unix_of(x));
            q = nq;
        }
    }
    /* sign ingresses: scan from 6 days before so the stay containing `from` has a known entry */
    static double ingJD[MAXN]; int ningAll = 0;
    int sgn = (int)(moon_lon(jf - 6.0) / 30.0);
    for (double jd = jf - 6.0 + 1.0 / 24; jd <= jt + 6.0; jd += 1.0 / 24) {
        int ns = (int)(moon_lon(jd) / 30.0);
        if (ns != sgn) { ingJD[ningAll++] = bisect_lon(jd - 1.0 / 24, jd, ns * 30.0); sgn = ns; }
    }
    int s0 = (int)(moon_lon(jf) / 30.0);
    for (int i = 0; i < ningAll; i++) {
        double u = unix_of(ingJD[i]);
        if (u > from && u <= to) ing[ning++] = (long long)floor(u);
        if (i + 1 < ningAll && unix_of(ingJD[i + 1]) > from && u < to) {
            voids[nvoid++] = (long long)floor(unix_of(void_start(ingJD[i], ingJD[i + 1])));
            voids[nvoid++] = (long long)ceil(unix_of(ingJD[i + 1]));
        }
    }
    /* garden element changes, 10-minute scan, bisected to ~1 ms */
    int c0 = moon_element(jf), cur = c0;
    for (double jd = jf; jd < jt;) {
        double nxt = jd + 10.0 / 1440;
        if (moon_element(nxt) != cur) {
            double x = bisect_element(jd, nxt, cur); cur = moon_element(x + 1e-9);
            con[ncon++] = (long long)floor(unix_of(x)); con[ncon++] = cur; jd = x; continue;
        }
        jd = nxt;
    }
    printf("{\"v\":1,\"from\":%lld,\"to\":%lld,\"ph0\":%d,", (long long)from, (long long)to, ph0);
    print_list("ph", ph, nph); printf(",\"s0\":%d,", s0);
    print_list("ing", ing, ning); printf(",\"c0\":%d,", c0);
    print_list("con", con, ncon); printf(",");
    print_list("voids", voids, nvoid); printf("}\n");
    fprintf(stderr, "phases %d, ingresses %d, element changes %d, void windows %d\n", nph, ning, ncon / 2, nvoid / 2);
    return 0;
}
