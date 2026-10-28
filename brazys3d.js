/*
 * brazys3d.js v2 – 3D personažas su „kaulais“ (be paruošto skeleto).
 *
 *   Brazys3D.walker.toggle(el)        – pasirodo ant puslapio, vaikšto, paspaudus rodo judesius
 *   Brazys3D.mountCenter(parentEl)    – stovi per vidurį (žaidimas); .play(name) / .react('ok'|'bad'|'record')
 *   Brazys3D.MOVES                    – judesių sąrašas
 *
 * Failai: model.obj, model.mtl, model_baseColor.png – šalia šio failo.
 */
(function () {
  'use strict';

  var G = typeof window !== 'undefined' ? window : globalThis;
  var cs = typeof document !== 'undefined' ? document.currentScript : null;
  var API = { base: cs && cs.src ? cs.src.replace(/[^/]*$/, '') : '' };
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';

  /* ------------------------------------------------------------------ */
  /*  Matematika ir „kaulai“                                              */
  /* ------------------------------------------------------------------ */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeInOut(x) { x = clamp01(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  // Kaulai: 0 kūnas, 1 galva, 2/3 kairė ranka (viršus/apačia), 4/5 dešinė ranka,
  // 6/7 kairė koja, 8/9 dešinė koja. „Kairė“ = ekrano kairė (x<0), kai personažas žiūri į kamerą.
  var NB = 10;
  var J = {
    head: [0, 0.60, -0.02],
    shL: [-0.225, 0.57, 0], shR: [0.225, 0.57, 0],
    elL: [-0.35, 0.227, 0], elR: [0.35, 0.227, 0],
    hipL: [-0.10, -0.12, 0], hipR: [0.10, -0.12, 0],
    knL: [-0.125, -0.52, 0], knR: [0.125, -0.52, 0]
  };
  var WRIST = [0.465, -0.09, 0];

  function rotMat(rx, ry, rz, o, k) {
    // R = Rz * Ry * Rx
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    var a00 = cy, a01 = sy * sx, a02 = sy * cx, a10 = 0, a11 = cx, a12 = -sx, a20 = -sy, a21 = cy * sx, a22 = cy * cx;
    o[k] = cz * a00 - sz * a10; o[k + 1] = cz * a01 - sz * a11; o[k + 2] = cz * a02 - sz * a12;
    o[k + 3] = sz * a00 + cz * a10; o[k + 4] = sz * a01 + cz * a11; o[k + 5] = sz * a02 + cz * a12;
    o[k + 6] = a20; o[k + 7] = a21; o[k + 8] = a22;
  }
  function mulV(R, k, v, o) {
    o[0] = R[k] * v[0] + R[k + 1] * v[1] + R[k + 2] * v[2];
    o[1] = R[k + 3] * v[0] + R[k + 4] * v[1] + R[k + 5] * v[2];
    o[2] = R[k + 6] * v[0] + R[k + 7] * v[1] + R[k + 8] * v[2];
  }

  // Svoriai pagal taško padėtį (modelis A pozoje, centruotas, ~1.9 aukščio)
  function weightsAt(x, y, z, w) {
    var ax = Math.abs(x), i;
    for (i = 0; i < NB; i++) w[i] = 0;
    var xb = y > 0.55 ? 0.22 : 0.22 + (0.55 - y) * 0.10;
    var hw = 0.025 + 0.06 * smooth(0.35, 0.58, y);
    var armM = smooth(xb - hw, xb + hw, ax);
    // pozicija išilgai rankos (petys -> riešas)
    var sx = J.shR[0], sy = J.shR[1], sz = J.shR[2];
    var ux = WRIST[0] - sx, uy = WRIST[1] - sy, uz = WRIST[2] - sz;
    var len2 = ux * ux + uy * uy + uz * uz;
    var s = ((ax - sx) * ux + (y - sy) * uy + (z - sz) * uz) / len2;
    var eW = smooth(0.42, 0.62, s);
    var hW = smooth(0.60, 0.68, y) * (1 - smooth(0.14, 0.20, ax)) * (1 - armM);
    var legM = smooth(-0.04, -0.26, y) * (1 - smooth(0.28, 0.36, ax)) * (1 - armM);
    var sR = smooth(-0.035, 0.035, x);
    var kW = smooth(-0.40, -0.64, y);
    w[1] = hW;
    if (x < 0) { w[2] = armM * (1 - eW); w[3] = armM * eW; } else { w[4] = armM * (1 - eW); w[5] = armM * eW; }
    var lL = legM * (1 - sR), lR = legM * sR;
    w[6] = lL * (1 - kW); w[7] = lL * kW; w[8] = lR * (1 - kW); w[9] = lR * kW;
    var sum = 0;
    for (i = 1; i < NB; i++) sum += w[i];
    if (sum > 1) { for (i = 1; i < NB; i++) w[i] /= sum; w[0] = 0; } else w[0] = 1 - sum;
  }

  // positions: Float32Array (x,y,z...) -> {idx:Uint8Array(4N), wt:Float32Array(4N), dyn:Uint32Array}
  function computeSkin(pos) {
    var N = pos.length / 3, idx = new Uint8Array(N * 4), wt = new Float32Array(N * 4), dyn = [];
    var w = new Float32Array(NB), i, k, v;
    for (v = 0; v < N; v++) {
      weightsAt(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], w);
      // 4 didžiausi
      var bi = [0, 0, 0, 0], bw = [0, 0, 0, 0];
      for (i = 0; i < NB; i++) {
        var wi = w[i];
        if (wi <= bw[3]) continue;
        k = 3;
        while (k > 0 && wi > bw[k - 1]) { bw[k] = bw[k - 1]; bi[k] = bi[k - 1]; k--; }
        bw[k] = wi; bi[k] = i;
      }
      var t = bw[0] + bw[1] + bw[2] + bw[3];
      for (k = 0; k < 4; k++) { idx[v * 4 + k] = bi[k]; wt[v * 4 + k] = t > 0 ? bw[k] / t : (k === 0 ? 1 : 0); }
      if (!(bi[0] === 0 && wt[v * 4] > 0.9999)) dyn.push(v);
    }
    return { idx: idx, wt: wt, dyn: new Uint32Array(dyn) };
  }

  var _tmpA = [0, 0, 0], _tmpB = [0, 0, 0], _Ru = new Float32Array(9), _Rl = new Float32Array(9);
  function chain(P, iUp, iLow, sh, el, M) {
    var b = P.b;
    rotMat(b[iUp * 3], b[iUp * 3 + 1], b[iUp * 3 + 2], _Ru, 0);
    rotMat(b[iLow * 3], b[iLow * 3 + 1], b[iLow * 3 + 2], _Rl, 0);
    var k, t;
    // viršutinė dalis
    for (k = 0; k < 9; k++) M[iUp * 12 + k] = _Ru[k];
    mulV(_Ru, 0, sh, _tmpA);
    M[iUp * 12 + 9] = sh[0] - _tmpA[0]; M[iUp * 12 + 10] = sh[1] - _tmpA[1]; M[iUp * 12 + 11] = sh[2] - _tmpA[2];
    // apatinė: R = Ru*Rl ; t = Ru*(el - Rl*el - sh) + sh
    var o = iLow * 12;
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++)
      M[o + r * 3 + c] = _Ru[r * 3] * _Rl[c] + _Ru[r * 3 + 1] * _Rl[3 + c] + _Ru[r * 3 + 2] * _Rl[6 + c];
    mulV(_Rl, 0, el, _tmpA);
    _tmpB[0] = el[0] - _tmpA[0] - sh[0]; _tmpB[1] = el[1] - _tmpA[1] - sh[1]; _tmpB[2] = el[2] - _tmpA[2] - sh[2];
    mulV(_Ru, 0, _tmpB, _tmpA);
    M[o + 9] = _tmpA[0] + sh[0]; M[o + 10] = _tmpA[1] + sh[1]; M[o + 11] = _tmpA[2] + sh[2];
  }
  function boneMats(P, M) {
    var k, b = P.b;
    for (k = 0; k < 12; k++) M[k] = 0;
    M[0] = M[4] = M[8] = 1;
    // galva
    rotMat(b[3], b[4], b[5], _Ru, 0);
    for (k = 0; k < 9; k++) M[12 + k] = _Ru[k];
    mulV(_Ru, 0, J.head, _tmpA);
    M[21] = J.head[0] - _tmpA[0]; M[22] = J.head[1] - _tmpA[1]; M[23] = J.head[2] - _tmpA[2];
    chain(P, 2, 3, J.shL, J.elL, M);
    chain(P, 4, 5, J.shR, J.elR, M);
    chain(P, 6, 7, J.hipL, J.knL, M);
    chain(P, 8, 9, J.hipR, J.knR, M);
  }

  function skinPositions(rest, restN, skin, M, out, outN) {
    var dyn = skin.dyn, idx = skin.idx, wt = skin.wt, n = dyn.length, i, k, v, bone, w, o;
    for (i = 0; i < n; i++) {
      v = dyn[i];
      var x = rest[v * 3], y = rest[v * 3 + 1], z = rest[v * 3 + 2];
      var X = 0, Y = 0, Z = 0, nx = 0, ny = 0, nz = 0;
      var hx, hy, hz;
      if (restN) { hx = restN[v * 3]; hy = restN[v * 3 + 1]; hz = restN[v * 3 + 2]; }
      for (k = 0; k < 4; k++) {
        w = wt[v * 4 + k];
        if (w === 0) continue;
        o = idx[v * 4 + k] * 12;
        X += w * (M[o] * x + M[o + 1] * y + M[o + 2] * z + M[o + 9]);
        Y += w * (M[o + 3] * x + M[o + 4] * y + M[o + 5] * z + M[o + 10]);
        Z += w * (M[o + 6] * x + M[o + 7] * y + M[o + 8] * z + M[o + 11]);
        if (restN) {
          nx += w * (M[o] * hx + M[o + 1] * hy + M[o + 2] * hz);
          ny += w * (M[o + 3] * hx + M[o + 4] * hy + M[o + 5] * hz);
          nz += w * (M[o + 6] * hx + M[o + 7] * hy + M[o + 8] * hz);
        }
      }
      out[v * 3] = X; out[v * 3 + 1] = Y; out[v * 3 + 2] = Z;
      if (restN) { outN[v * 3] = nx; outN[v * 3 + 1] = ny; outN[v * 3 + 2] = nz; }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Poza ir judesiai                                                    */
  /* ------------------------------------------------------------------ */
  function newPose() {
    var P = { y: 0, sx: 1, sy: 1, fx: 0, fz: 0, yaw: 0, lean: 0, b: new Float32Array(30) };
    P.reset = function () {
      P.y = 0; P.sx = 1; P.sy = 1; P.fx = 0; P.fz = 0; P.yaw = 0; P.lean = 0;
      for (var i = 0; i < 30; i++) P.b[i] = 0;
    };
    P.head = function (rx, ry, rz) { P.b[3] = rx; P.b[4] = ry; P.b[5] = rz; };
    // abd – kėlimas į šoną, fwd – į priekį, elf – alkūnė į priekį, elo – dilbis į šoną/aukštyn
    P.arm = function (side, abd, fwd, elf, elo) {
      var sg = side === 'L' ? -1 : 1, iu = side === 'L' ? 2 : 4, il = iu + 1;
      P.b[iu * 3] = -fwd; P.b[iu * 3 + 2] = sg * abd;
      P.b[il * 3] = -elf; P.b[il * 3 + 2] = sg * elo;
    };
    // fwd – koja į priekį, knee – keliai lenkiami atgal, abd – į šoną
    P.leg = function (side, fwd, knee, abd) {
      var sg = side === 'L' ? -1 : 1, iu = side === 'L' ? 6 : 8, il = iu + 1;
      P.b[iu * 3] = -fwd; P.b[iu * 3 + 2] = sg * abd;
      P.b[il * 3] = knee;
    };
    P.isRest = function () {
      if (P.y || P.fx || P.fz || P.yaw || P.lean || P.sx !== 1 || P.sy !== 1) return false;
      for (var i = 0; i < 30; i++) if (P.b[i]) return false;
      return true;
    };
    return P;
  }
  function bonesRest(P) { for (var i = 0; i < 30; i++) if (P.b[i]) return false; return true; }

  function env(t, d, a, b) { return smooth(0, a, t) * smooth(d, d - b, t); }
  // Raktinių kadrų interpoliacija: kf(t, [[laikas, reikšmė], ...])
  function kf(t, k) {
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) {
      if (t <= k[i][0]) { var a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * smooth(a[0], b[0], t); }
    }
    return k[k.length - 1][1];
  }
  function pulse(t, t0, d) { var u = (t - t0) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; }

  var MOVES = {
    idle: { loop: true, f: function (P, t) {
      var b = Math.sin(t * 2.2);
      P.sy = 1 + 0.006 * b;
      P.head(0.03 * Math.sin(t * 0.7), 0.2 * Math.sin(t * 0.45), 0.02 * Math.sin(t * 0.9));
      P.arm('L', 0.03 * b, 0.02, 0.06, 0); P.arm('R', 0.03 * b, 0.02, 0.06, 0);
    } },
    walk: { loop: true, f: function (P, t) {
      var ph = t * Math.PI * 2 * 1.0, s = Math.sin(ph), c = Math.cos(ph);
      P.leg('R', 0.5 * s, 0.1 + 0.62 * Math.max(0, c), 0.02);
      P.leg('L', -0.5 * s, 0.1 + 0.62 * Math.max(0, -c), 0.02);
      P.arm('R', 0.04, -0.5 * s, 0.25 + 0.2 * Math.max(0, s), 0);
      P.arm('L', 0.04, 0.5 * s, 0.25 + 0.2 * Math.max(0, -s), 0);
      P.y = 0.02 * Math.abs(c); P.fz = 0.05 * s; P.fx = 0.05;
      P.head(0.02, -0.08 * s, 0);
    } },
    land: { d: 0.5, f: function (P, t) {
      var q = Math.sin(Math.PI * clamp01(t / 0.5));
      P.sy = 1 - 0.1 * q; P.sx = 1 + 0.05 * q;
      P.leg('R', 0, 0.5 * q, 0.04 * q); P.leg('L', 0, 0.5 * q, 0.04 * q);
    } },
    wave: { d: 2.6, f: function (P, t) {
      var e = env(t, 2.6, 0.4, 0.4);
      P.arm('R', 1.95 * e, 0, 0.3 * e, 0.55 * Math.sin(t * 12) * e);
      P.arm('L', 0.05 * e, 0, 0.1 * e, 0);
      P.head(0, 0.2 * e * Math.sin(t * 2), 0.12 * e);
      P.fz = 0.04 * Math.sin(t * 3) * e; P.y = 0.012 * Math.abs(Math.sin(t * 6)) * e;
    } },
    dance: { d: 3.6, f: function (P, t) {
      var e = env(t, 3.6, 0.35, 0.45), ph = t * Math.PI * 2 * 1.9, s = Math.sin(ph), q = Math.sin(ph / 2);
      P.y = (0.04 * Math.abs(Math.sin(ph)) - 0.03) * e;
      P.fz = 0.09 * q * e; P.yaw = 0.4 * q * e;
      P.leg('R', 0.18 * s * e, (0.3 + 0.25 * Math.max(0, s)) * e, 0.06 * e);
      P.leg('L', -0.18 * s * e, (0.3 + 0.25 * Math.max(0, -s)) * e, 0.06 * e);
      P.arm('R', e * (0.3 + 2.2 * smooth(-0.15, 0.15, q)), 0.2 * e * s, 0.3 * e, 0);
      P.arm('L', e * (0.3 + 2.2 * smooth(0.15, -0.15, q)), -0.2 * e * s, 0.3 * e, 0);
      P.head(0.12 * s * e, 0, 0.1 * q * e);
    } },
    flex: { d: 2.8, f: function (P, t) {
      var e = env(t, 2.8, 0.4, 0.4), p = 1 + 0.05 * Math.sin(t * 9);
      P.arm('R', 1.3 * e, 0, 0, 1.55 * e * p); P.arm('L', 1.3 * e, 0, 0, 1.55 * e * p);
      P.leg('R', 0, 0.12 * e, 0.12 * e); P.leg('L', 0, 0.12 * e, 0.12 * e);
      P.sy = 1 + 0.02 * e; P.fx = -0.05 * e;
      P.head(-0.1 * e, 0.3 * e * Math.sin(t * 2.2), 0);
    } },
    fight: { d: 3.6, f: function (P, t) {
      var e = env(t, 3.6, 0.45, 0.5);
      var pR = Math.max(pulse(t, 0.8, 0.32), pulse(t, 1.4, 0.32), pulse(t, 2.7, 0.32));
      var pL = pulse(t, 2.05, 0.4);
      P.yaw = (0.85 + 0.25 * (pR - pL)) * e; P.y = -0.075 * e + 0.012 * Math.sin(t * 14) * e; P.fx = 0.07 * e;
      P.leg('R', 0.35 * e, 0.55 * e, 0.08 * e); P.leg('L', -0.28 * e, 0.5 * e, 0.08 * e);
      P.arm('R', 0.12 * e, (0.95 + 0.6 * pR) * e, (1.8 - 1.7 * pR) * e, 0);
      P.arm('L', 0.12 * e, (0.95 + 0.6 * pL) * e, (1.8 - 1.7 * pL) * e, 0);
      P.head(0.2 * e, 0, 0);
    } },
    cheer: { d: 2.0, f: function (P, t) {
      var u = t / 1.1, j = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0;
      var e2 = smooth(0, 0.25, t) * smooth(2.0, 1.5, t);
      P.y = 0.5 * j;
      P.sy = 1 - 0.08 * pulse(t, 0, 0.25) - 0.08 * pulse(t, 1.1, 0.25);
      P.arm('R', 2.45 * e2, 0, 0, 0); P.arm('L', 2.45 * e2, 0, 0, 0);
      P.leg('R', 0.3 * j, 0.8 * j, 0.1 * j); P.leg('L', 0.3 * j, 0.8 * j, 0.1 * j);
      P.head(-0.25 * e2, 0, 0);
    } },
    spin: { d: 1.8, f: function (P, t) {
      var u = easeInOut(t / 1.6), e = env(t, 1.8, 0.2, 0.3);
      P.yaw = u * Math.PI * 4;
      P.arm('R', 1.15 * e, 0, 0, 0.1 * e); P.arm('L', 1.15 * e, 0, 0, 0.1 * e);
      P.leg('R', 1.1 * e, 1.5 * e, 0.05); P.y = 0.04 * e * Math.sin(u * 20);
    } },
    nod: { d: 1.8, f: function (P, t) {
      var e = env(t, 1.8, 0.2, 0.3);
      P.head(0.32 * Math.sin(t * 15) * e, 0, 0);
      P.y = 0.012 * Math.abs(Math.sin(t * 7.5)) * e;
      P.arm('R', 0.1 * e, 0.3 * e, 0.4 * e, 0);
    } },
    bow: { d: 2.4, f: function (P, t) {
      var e = env(t, 2.4, 0.6, 0.6);
      P.fx = 0.85 * e; P.head(0.2 * e, 0, 0);
      P.arm('R', 0, 0.4 * e, 0.4 * e, 0); P.arm('L', 0, 0.4 * e, 0.4 * e, 0);
    } },
    facepalm: { d: 2.8, f: function (P, t) {
      var e = env(t, 2.8, 0.45, 0.55);
      P.head(0.5 * e, 0.3 * e * Math.sin(t * 5), 0);
      P.arm('R', 0, 1.4 * e, 1.6 * e, 0);
      P.arm('L', -0.1 * e, 0.1 * e, 0.1 * e, 0);
      P.sy = 1 - 0.015 * e; P.fx = 0.12 * e;
      P.leg('R', 0, 0.12 * e, 0); P.leg('L', 0, 0.12 * e, 0);
    } },
    // Spyris į logotipą: pasilenkia, užsimoja, spiria (kontaktas ties hit), pergalingai pakelia rankas
    kick: { d: 2.8, hit: 1.12, f: function (P, t, hop) {
      P.lean = kf(t, [[0, 0], [0.5, 0.5], [0.9, 0.56], [1.02, -0.04], [1.25, -0.2], [1.9, -0.2], [2.4, 0], [2.8, 0]]);
      P.leg('R', kf(t, [[0, 0], [0.5, 0], [0.9, -0.8], [1.12, 1.55], [1.95, 1.55], [2.4, 0], [2.8, 0]]),
        kf(t, [[0, 0.1], [0.5, 0.1], [0.9, 1.35], [1.12, 0.06], [1.95, 0.06], [2.4, 0.1], [2.8, 0.1]]), 0.05);
      P.leg('L', -0.1 * smooth(0.5, 1, t), kf(t, [[0, 0.1], [0.9, 0.5], [2.3, 0.5], [2.8, 0.1]]), 0.04);
      var sw = smooth(0.3, 0.9, t);
      P.arm('L', 0.35 * sw, kf(t, [[0, 0], [0.45, 1.15], [0.9, 1.15], [1.12, -0.2], [1.9, -0.2], [2.3, 0], [2.8, 0]]), 0.5 * sw, 0);
      P.arm('R', kf(t, [[0, 0], [0.9, 0.5], [1.12, 1.5], [1.9, 1.5], [2.1, 2.45], [2.55, 2.45], [2.8, 0]]), 0, 0, 0);
      P.head(kf(t, [[0, 0], [0.5, 0.38], [1.0, 0.42], [1.2, -0.18], [2.0, -0.18], [2.4, 0], [2.8, 0]]), 0, 0);
      var hp = Math.sin(Math.PI * clamp01((t - 0.85) / 0.55));
      P.y = (hop || 0) * hp + 0.04 * hp;
    } },
    // ♥ Meilė: linksi galva, rankomis virš galvos rodo širdelę, iššoka širdelės
    love: { d: 3.4, ev: [[0.7, 'heart', 3], [1.3, 'heart', 3], [1.9, 'heart', 4], [2.5, 'heart', 3]], f: function (P, t) {
      var e = env(t, 3.4, 0.45, 0.5), pu = 1 + 0.06 * Math.sin(t * 9) * e, hz = smooth(0.1, 0.55, t) * smooth(3.4, 2.9, t);
      P.head(0.3 * Math.sin(t * 8) * e, 0, 0.05 * Math.sin(t * 4) * e);
      P.arm('R', 2.35 * hz * pu, 0, 0, 1.25 * hz); P.arm('L', 2.35 * hz * pu, 0, 0, 1.25 * hz);
      P.y = 0.02 * Math.abs(Math.sin(t * 6)) * e; P.sy = 1 + 0.012 * Math.sin(t * 9) * e;
      P.leg('R', 0, 0.08 * e, 0.03 * e); P.leg('L', 0, 0.08 * e, 0.03 * e);
    } },
    // 👎 „No like“: purto galvą, numoja ranka, spiria koja, debesėlyje parašo „No like“
    nolike: { d: 3.7, ev: [[0.35, 'bubble', 'No like'], [1.5, 'bubble2'], [2.45, 'dust']], f: function (P, t) {
      var e = env(t, 3.7, 0.3, 0.4), sh = smooth(0.25, 0.5, t) * smooth(2.0, 1.6, t), hd = smooth(0.35, 0.8, t) * smooth(3.5, 3.0, t);
      P.head(0.06 * e, 0.8 * Math.sin(t * 11) * sh + 0.1 * Math.sin(t * 3) * e, 0.05 * e);
      P.arm('R', 0.3 * hd, 1.25 * hd, 1.1 * hd, 0.7 * Math.sin(t * 13) * hd);
      P.arm('L', 0.08 * e, 0.05 * e, 0.12 * e, 0);
      P.leg('R', kf(t, [[0, 0], [1.9, 0], [2.2, -0.55], [2.45, 1.5], [2.95, 1.5], [3.4, 0], [3.7, 0]]),
        kf(t, [[0, 0.05], [1.9, 0.05], [2.2, 1.25], [2.45, 0.06], [2.95, 0.06], [3.4, 0.05], [3.7, 0.05]]), 0.05);
      P.leg('L', -0.08 * smooth(1.9, 2.3, t) * smooth(3.4, 3.0, t), 0.18 * smooth(1.9, 2.3, t) * smooth(3.4, 3.0, t), 0.04);
      var hp = Math.sin(Math.PI * clamp01((t - 2.15) / 0.6));
      P.y = 0.05 * hp; P.fx = -0.12 * smooth(1.9, 2.4, t) * smooth(3.4, 2.9, t);
    } },
    // 👍 Patinka: rodo ranka į kortelę, kita ranka aukštyn, linksi galva, iššoka širdelės
    like: { d: 3.4, ev: [[0.6, 'heart', 3], [1.4, 'heart', 3], [2.2, 'heart', 3]], f: function (P, t, hop, side) {
      var e = env(t, 3.4, 0.4, 0.5), near = side > 0 ? 'L' : 'R', far = side > 0 ? 'R' : 'L', j = Math.abs(Math.sin(t * 5.5));
      P.arm(near, 0.1 * e, (1.5 + 0.12 * Math.sin(t * 11)) * e, 0.05 * e, 0);
      P.arm(far, 2.45 * e * (0.9 + 0.1 * Math.sin(t * 8)), 0, 0, 0);
      P.head(0.28 * Math.sin(t * 9) * e, 0.15 * side * e, 0);
      P.y = 0.06 * j * e; P.sy = 1 - 0.015 * j * e;
      P.leg('R', 0.12 * Math.sin(t * 5.5) * e, (0.2 + 0.15 * j) * e, 0.05); P.leg('L', -0.12 * Math.sin(t * 5.5) * e, (0.2 + 0.15 * (1 - j)) * e, 0.05);
    } },
    // Paspaudžia logotipą (kontaktas ties 0,8 s)
    press: { d: 1.6, ev: [[0.8, 'click']], f: function (P, t, hop, side) {
      var e = env(t, 1.6, 0.3, 0.35), near = side > 0 ? 'L' : 'R', ex = kf(t, [[0, 0], [0.55, 1.0], [0.8, 1.55], [1.1, 1.0], [1.6, 0]]);
      P.arm(near, 0.2 * e, ex * 1.0, 0.1, 0); P.head(-0.12 * e, 0, 0); P.fx = 0.06 * e;
      P.leg('R', 0, 0.08 * e, 0.03); P.leg('L', 0, 0.08 * e, 0.03);
    } },
    // Abiem rankomis paliečia kortelę / sumą (V.elev – kiek rankas kelti aukštyn)
    touch: { d: 1.8, f: function (P, t, hop, side, V) {
      var e = env(t, 1.8, 0.3, 0.35), el = (V && V.elev) || 0, fw = (1.5 + el) * e, pat = 0.07 * Math.sin(t * 15) * e;
      P.arm('L', 0.1 * e, fw + pat, 0.12 * e, 0); P.arm('R', 0.1 * e, fw - pat, 0.12 * e, 0);
      P.head(-0.2 * e * Math.max(0, el), 0.1 * side * e, 0);
      P.leg('R', 0, 0.06 * e, 0.03); P.leg('L', 0, 0.06 * e, 0.03);
    } },
    // Spiria į pavardės raides (kontaktas ties 1,12 s), po to du debesėliai
    kickname: { d: 3.6, hit: 1.12, ev: [[1.12, 'letters'], [1.3, 'bubble', 'No like'], [2.2, 'bubble2'], [2.0, 'dust']], f: function (P, t) {
      P.leg('R', kf(t, [[0, 0], [0.5, 0], [0.9, -0.8], [1.12, 1.55], [1.95, 1.55], [2.5, 0], [3.6, 0]]),
        kf(t, [[0, 0.1], [0.5, 0.1], [0.9, 1.35], [1.12, 0.06], [1.95, 0.06], [2.5, 0.1], [3.6, 0.1]]), 0.05);
      P.leg('L', -0.1 * smooth(0.5, 1, t) * smooth(2.8, 2.3, t), kf(t, [[0, 0.1], [0.9, 0.5], [2.3, 0.5], [3.0, 0.1], [3.6, 0.1]]), 0.04);
      var sw = smooth(0.3, 0.9, t) * smooth(2.8, 2.3, t);
      P.arm('L', 0.35 * sw, kf(t, [[0, 0], [0.45, 1.15], [0.9, 1.15], [1.12, -0.2], [1.9, -0.2], [2.4, 0], [3.6, 0]]), 0.5 * sw, 0);
      P.arm('R', 0.5 * sw, 0.2 * sw, 0.3 * sw, 0);
      P.head(kf(t, [[0, 0], [0.5, 0.3], [1.0, 0.35], [1.2, -0.12], [2.4, -0.12], [3.0, 0], [3.6, 0]]), 0.5 * Math.sin(t * 10) * smooth(2.0, 2.2, t) * smooth(3.2, 2.8, t), 0);
      var hp = Math.sin(Math.PI * clamp01((t - 0.85) / 0.55));
      P.y = 0.05 * hp;
    } },
    breakdance: { d: 3.8, f: function (P, t) {
      var a = clamp01((t - 0.35) / 0.75), b = clamp01((t - 2.9) / 0.7), s = clamp01((t - 1.1) / 1.8);
      var y = 0, fx = 0;
      P.sy = 1 - 0.07 * pulse(t, 0, 0.35) - 0.06 * pulse(t, 3.6, 0.2);
      if (t > 0.35 && t < 1.1) y += Math.sin(Math.PI * a) * 0.55;
      fx = easeInOut(a) * Math.PI;
      if (t >= 2.9) { y += Math.sin(Math.PI * clamp01((t - 2.9) / 0.7)) * 0.5; fx = Math.PI + easeInOut(b) * Math.PI; }
      P.yaw = easeInOut(s) * Math.PI * 2 * 5;
      if (t > 1.1 && t < 2.9) y += Math.abs(Math.sin(s * Math.PI * 6)) * 0.04;
      P.y = y; P.fx = fx;
      var ls = smooth(1.15, 1.45, t) * smooth(2.95, 2.65, t);
      P.leg('R', 0.1 * ls, 0.15 * ls, 0.6 * ls); P.leg('L', 0.1 * ls, 0.15 * ls, 0.6 * ls);
      P.arm('R', 0.5 * ls, 0, 0, 0); P.arm('L', 0.5 * ls, 0, 0, 0);
    } }
  };
  var RANDOM_OK = ['wave', 'dance', 'flex', 'cheer', 'spin', 'nod', 'fight', 'bow'];
  var RANDOM_CLICK = ['wave', 'dance', 'flex', 'fight', 'cheer', 'spin', 'bow', 'breakdance'];
  var lastPick = '';
  function pick(list) {
    var m, n = 0;
    do { m = list[Math.floor(Math.random() * list.length)]; n++; } while (m === lastPick && n < 6);
    lastPick = m; return m;
  }
  function reactionFor(kind) {
    if (kind === 'bad') return 'facepalm';
    if (kind === 'record') return Math.random() < 0.6 ? 'breakdance' : 'cheer';
    return pick(['nod', 'wave', 'cheer', 'dance', 'flex', 'spin']);
  }

  /* ------------------------------------------------------------------ */
  /*  Kitas kodas veikia tik naršyklėje                                   */
  /* ------------------------------------------------------------------ */
  API.MOVES = MOVES;
  API.kf = kf;
  API._rig = { computeSkin: computeSkin, newPose: newPose, boneMats: boneMats, skinPositions: skinPositions, weightsAt: weightsAt, MOVES: MOVES, J: J };
  G.Brazys3D = API;
  if (typeof document === 'undefined') return;

  var threeReady = null, modelReady = null;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function ensureThree() {
    if (G.THREE && THREE.OBJLoader && THREE.MTLLoader) return Promise.resolve();
    if (!threeReady) {
      threeReady = loadScript(THREE_URL + 'build/three.min.js')
        .then(function () { return loadScript(THREE_URL + 'examples/js/loaders/MTLLoader.js'); })
        .then(function () { return loadScript(THREE_URL + 'examples/js/loaders/OBJLoader.js'); });
    }
    return threeReady;
  }

  // Modelis kraunamas ir „kaulai“ skaičiuojami vieną kartą
  function ensureModel() {
    if (!modelReady) {
      modelReady = ensureThree().then(function () {
        return new Promise(function (res, rej) {
          var mtl = new THREE.MTLLoader();
          mtl.setPath(API.base);
          mtl.load('model.mtl', function (materials) {
            materials.preload();
            var loader = new THREE.OBJLoader();
            loader.setMaterials(materials);
            loader.setPath(API.base);
            loader.load('model.obj', function (obj) {
              var box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3());
              var parts = [];
              obj.traverse(function (m) {
                if (!m.isMesh) return;
                var old = Array.isArray(m.material) ? m.material[0] : m.material;
                if (old && old.map) old.map.encoding = THREE.sRGBEncoding;
                var g = m.geometry.clone();
                g.translate(-c.x, -c.y, -c.z);
                var pos = g.attributes.position.array;
                parts.push({
                  geo: g,
                  mat: new THREE.MeshStandardMaterial({ map: old ? old.map : null, roughness: 0.8, metalness: 0 }),
                  rest: new Float32Array(pos),
                  restN: g.attributes.normal ? new Float32Array(g.attributes.normal.array) : null,
                  skin: computeSkin(pos)
                });
              });
              res(parts);
            }, undefined, rej);
          }, undefined, rej);
        });
      });
      modelReady.catch(function () { modelReady = null; });
    }
    return modelReady;
  }

  // Vienas personažo egzempliorius: root -> flip -> spin -> tinklai
  function buildCharacter(parts) {
    var root = new THREE.Group(), flip = new THREE.Group(), spin = new THREE.Group();
    root.add(flip); flip.add(spin);
    var list = parts.map(function (p) {
      var geo = p.geo.clone();
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2);
      geo.attributes.position.setUsage(THREE.DynamicDrawUsage);
      if (geo.attributes.normal) geo.attributes.normal.setUsage(THREE.DynamicDrawUsage);
      var mesh = new THREE.Mesh(geo, p.mat);
      mesh.frustumCulled = false;
      spin.add(mesh);
      return { p: p, geo: geo, mesh: mesh };
    });
    var M = new Float32Array(NB * 12), dirty = false;
    return {
      root: root, flip: flip, spin: spin,
      applyPose: function (P) {
        var rest = bonesRest(P);
        if (rest && !dirty) return;
        boneMats(P, M);
        for (var i = 0; i < list.length; i++) {
          var it = list[i], pa = it.geo.attributes.position, na = it.geo.attributes.normal;
          if (rest) {
            pa.array.set(it.p.rest); if (na) na.array.set(it.p.restN);
          } else {
            skinPositions(it.p.rest, it.p.restN, it.p.skin, M, pa.array, na ? na.array : null);
          }
          pa.needsUpdate = true; if (na) na.needsUpdate = true;
        }
        dirty = !rest;
      }
    };
  }

  function makeShadowTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  function addLights(scene) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 0.95));
    var key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2, 3, 4);
    scene.add(key);
  }

  /* ------------------------------------------------------------------ */
  /*  1) Žaidimas: stovi per vidurį                                       */
  /* ------------------------------------------------------------------ */
  function mount(el, opts) {
    opts = opts || {};
    var st = { dead: false, ready: false, move: null, t0: 0, raf: 0 };
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;height:100%;';
    el.appendChild(wrap);
    var renderer, scene, camera, ch, shadow, P = newPose();

    function render() { if (renderer) renderer.render(scene, camera); }
    function resize() {
      if (!renderer) return;
      var w = wrap.clientWidth || 1, h = wrap.clientHeight || 1, aspect = w / h;
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      var visH = Math.max(3.4, 1.9 / aspect);
      camera.position.z = visH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.updateProjectionMatrix();
      render();
    }
    function show(Pp) {
      ch.root.position.y = Pp.y;
      ch.root.scale.set(Pp.sx, Pp.sy, Pp.sx);
      ch.flip.rotation.set(Pp.fx, 0, Pp.fz);
      ch.spin.rotation.y = Pp.yaw;
      ch.applyPose(Pp);
      var k = Math.max(0.45, 1 - Pp.y * 0.8);
      shadow.scale.set(k, k, k); shadow.material.opacity = k;
      render();
    }
    function tick(now) {
      if (st.dead || !st.move) return;
      var t = (now - st.t0) / 1000, mv = MOVES[st.move];
      P.reset();
      if (t >= mv.d) { st.move = null; show(P); return; }
      mv.f(P, t); show(P);
      st.raf = requestAnimationFrame(tick);
    }
    function play(name) {
      if (!st.ready || st.dead || st.move || !MOVES[name] || !MOVES[name].d) return;
      st.move = name; st.t0 = performance.now();
      st.raf = requestAnimationFrame(tick);
    }

    ensureModel().then(function (parts) {
      if (st.dead) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;cursor:pointer;touch-action:manipulation;';
      wrap.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      camera.position.set(0, 0.1, 6);
      addLights(scene);
      ch = buildCharacter(parts);
      scene.add(ch.root);
      shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8),
        new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.96;
      scene.add(shadow);
      st.ready = true;
      resize();
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      renderer.domElement.addEventListener('click', function (e) {
        var cv = renderer.domElement, r = cv.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        scene.updateMatrixWorld(true);
        ray.setFromCamera(ndc, camera);
        if (ray.intersectObject(ch.spin, true).length) { play(pick(RANDOM_CLICK)); return; }
        if (opts.passThrough) {
          cv.style.pointerEvents = 'none';
          var under = document.elementFromPoint(e.clientX, e.clientY);
          cv.style.pointerEvents = '';
          if (under && under.click) under.click();
        }
      });
    }).catch(function () {});

    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(wrap); else window.addEventListener('resize', resize);

    return {
      play: play,
      react: function (kind) { play(reactionFor(kind)); },
      destroy: function () {
        st.dead = true; cancelAnimationFrame(st.raf);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        if (renderer) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); }
        wrap.remove();
      }
    };
  }

  function injectCss() {
    if (document.getElementById('brazys3d-css')) return;
    var s = document.createElement('style');
    s.id = 'brazys3d-css';
    s.textContent =
      '.brazys3d-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:5;width:min(260px,38vw);height:min(360px,60vw)}' +
      '@media(max-width:720px){.brazys3d-center{left:auto;right:2px;transform:translateY(-50%);width:96px;height:140px}}' +
      '.b3-load{animation:b3pulse 1s ease-in-out infinite}@keyframes b3pulse{50%{opacity:.55}}' +
      '#sh.b3-nologo .cl .lw{visibility:hidden}';
    document.head.appendChild(s);
  }
  function mountCenter(parent, opts) {
    opts = opts || {};
    injectCss();
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    var box = document.createElement('div');
    box.className = 'brazys3d-center';
    if (opts.width) box.style.width = opts.width;
    if (opts.height) box.style.height = opts.height;
    parent.appendChild(box);
    opts.passThrough = true;
    var inst = mount(box, opts), destroy = inst.destroy;
    inst.el = box;
    inst.destroy = function () { destroy(); box.remove(); };
    return inst;
  }

  /* ------------------------------------------------------------------ */
  /*  2) Vaikštantis ant puslapio                                         */
  /* ------------------------------------------------------------------ */
  var walker = null;

  function startWalker(srcEl) {
    injectCss();
    if (srcEl) srcEl.classList.add('b3-load');
    ensureModel().then(function (parts) {
      if (srcEl) srcEl.classList.remove('b3-load');
      if (walker) return;
      walker = createWalker(parts, srcEl);
    }).catch(function () { if (srcEl) srcEl.classList.remove('b3-load'); });
  }

  function createWalker(parts, srcEl) {
    var W = window.innerWidth, H = window.innerHeight;
    var layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;z-index:100000;pointer-events:none;';
    document.body.appendChild(layer);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(W, H, false);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    layer.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(0, W, H, 0, -2000, 2000);
    addLights(scene);
    var ch = buildCharacter(parts);
    scene.add(ch.root);
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }));
    scene.add(shadow);

    var hit = document.createElement('div');
    hit.style.cssText = 'position:fixed;left:0;top:0;z-index:100001;cursor:pointer;touch-action:manipulation;';
    document.body.appendChild(hit);

    var S, floor = 8, P = newPose();
    function size() { S = Math.max(120, Math.min(210, H * 0.26)) / 1.9; }
    size();

    // Figūra „išlenda“ iš portreto: jos galva (~1.74 aukščio vieneto virš pėdų) sutampa su nuotraukos centru
    var av = srcEl && (srcEl.querySelector('.pp-ph') || srcEl);
    var ar = av ? av.getBoundingClientRect() : null;
    var sx0 = ar ? ar.left + ar.width / 2 : W * 0.5, sy0 = ar ? ar.top + ar.height / 2 : H * 0.3;
    var s = {
      mode: 'fall', x: sx0, y: H - sy0 - 1.74 * S, vy: 0,
      dir: 1, timer: 0, move: null, mt: 0, yaw: 0, face: 0, t: 0, nextAct: 8 + Math.random() * 6, gone: 0, dead: false
    };
    // sklandus pasirodymas: drobė išryškėja, o portreto vietoje sublyksi šviesa
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity .35s ease-out';
    requestAnimationFrame(function () { renderer.domElement.style.opacity = '1'; });
    if (ar && document.body.animate !== undefined) {
      var fl = document.createElement('div');
      fl.style.cssText = 'position:fixed;left:' + sx0 + 'px;top:' + sy0 + 'px;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;z-index:100003;pointer-events:none;' +
        'background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 68%);';
      document.body.appendChild(fl);
      fl.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).onfinish = function () { fl.remove(); };
    }
    s.fl = floor; s.kt = null; s.vt = null; s.chain = []; s.evd = 0; s.next = null; s.air = 0; s.lp = null;

    function setMove(name) { s.mode = 'act'; s.move = name; s.mt = 0; s.face = 0; s.evd = 0; }
    function leave() { if (s.mode !== 'leave' && !s.dead) { s.mode = 'leave'; s.kt = null; s.vt = null; s.chain = []; s.next = null; s.fl = floor; s.dir = s.x < W / 2 ? -1 : 1; [].forEach.call(document.querySelectorAll('[data-b3d].lit'), function (el) { el.classList.remove('lit'); }); } }

    // ilgas paspaudimas (~0,7 s) ant figūros – išeina; trumpas – parodo judesį
    var lpT = 0, lpFired = false;
    hit.addEventListener('pointerdown', function () { lpFired = false; clearTimeout(lpT); lpT = setTimeout(function () { lpFired = true; leave(); }, 700); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hit.addEventListener(ev, function () { clearTimeout(lpT); }); });
    hit.addEventListener('click', function (e) {
      e.stopPropagation();
      if (lpFired) { lpFired = false; return; }
      if (s.mode === 'idle' || s.mode === 'walk') setMove(pick(WALK_CLICK));
    });
    function onResize() {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H, false);
      camera.right = W; camera.top = H; camera.updateProjectionMatrix();
      size();
    }
    window.addEventListener('resize', onResize);

    var raf = 0, last = performance.now();
    var WALK_OK = RANDOM_OK.concat(['love', 'nolike']), WALK_CLICK = RANDOM_CLICK.concat(['love', 'nolike']);
    var G_ = 2600, kickDone = false, logoGone = false, noTgt = 0, pollT = 0.4, stable = 0, lastSig = '';

    // ---- spyris į Žalgirio logotipą ----
    function findKick() {
      var sh = document.getElementById('sh'); if (!sh) return null;
      var h = sh.querySelector('.cl h2'); if (!h) return null;
      var nm = h.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (nm.indexOf('zalgiris') < 0) return null;
      var el = h.parentElement.querySelector('.lw'); if (!el) return null;
      var r = el.getBoundingClientRect();
      if (r.width < 12 || r.bottom < 40 || r.top > H) return null;
      return { el: el, r: r };
    }
    function applyNologo(on) { var sh = document.getElementById('sh'); if (sh) sh.classList.toggle('b3-nologo', on); }
    function geom(r, side0) {
      var R = r.width / 2, cx = r.left + R, margin = S * 0.55, side = side0 || (cx < W / 2 ? 1 : -1);
      var want = Math.max(floor, H - r.bottom), ledge = Math.max(floor, Math.min(want, H - 1.95 * S));
      return { side: side, kdir: -side, R: R, cx: cx,
        xk: Math.max(margin, Math.min(W - margin, cx + side * (0.55 * R + 0.82 * S))),
        ledge: ledge, hop: Math.max(0, (want - ledge) / S) };
    }
    // iš naujo suranda logotipą (jei kortelė perpiešta ar pajudėjo) ir atnaujina taikinį
    function retarget() {
      var tg = findKick();
      if (!tg || !s.kt) return false;
      var g = geom(tg.r, s.kt.side);
      s.kt.el = tg.el; s.kt.xk = g.xk; s.kt.hop = g.hop;
      if (Math.abs(g.ledge - s.kt.ledge) > 1) { s.kt.ledge = g.ledge; if (s.mode === 'approach' || s.mode === 'kick') { s.y = g.ledge; s.fl = g.ledge; } }
      return true;
    }
    function startKick(tg) {
      var g = geom(tg.r), margin = S * 0.55;
      var xl = Math.max(margin, Math.min(W - margin, g.xk + g.side * 2.0 * S));
      s.kt = { el: tg.el, side: g.side, kdir: g.kdir, xk: g.xk, ledge: g.ledge, hop: g.hop, hit: false };
      var h = g.ledge - s.y;
      if (h > 30) {
        var vy0 = Math.sqrt(2 * G_ * h);
        s.lp = { t: 0, T: vy0 / G_, vy0: vy0, x0: s.x, x1: xl, y0: s.y, dir: xl >= s.x ? 1 : -1 };
        s.mode = 'leap'; s.face = s.lp.dir * 1.15;
      } else { s.fl = g.ledge; s.y = g.ledge; s.x = xl; s.mode = 'approach'; }
    }
    function abortKick() { s.kt = null; s.next = null; s.fl = floor; s.mode = 'idle'; s.timer = 0.8; }
    function finishKick() { s.kt = null; s.fl = floor; s.mode = 'idle'; s.timer = 1.2; }
    function impact(x, y, d, label) {
      var col = (getComputedStyle(document.getElementById('sh') || document.body).getPropertyValue('--a') || '#ffc82e').trim() || '#ffc82e';
      var ring = document.createElement('div');
      ring.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:4px solid ' + col + ';z-index:100003;pointer-events:none;';
      document.body.appendChild(ring);
      ring.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(3.4)', opacity: 0 }], { duration: 560, easing: 'ease-out' }).onfinish = function () { ring.remove(); };
      for (var i = 0; i < 10; i++) {
        var sp = document.createElement('div'), an = (Math.random() - 0.5) * 2.2 + (d > 0 ? 0 : Math.PI), ds = 50 + Math.random() * 90;
        sp.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:7px;height:7px;margin:-3px 0 0 -3px;border-radius:50%;background:' + col + ';z-index:100003;pointer-events:none;';
        document.body.appendChild(sp);
        sp.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(an) * ds + 'px,' + (Math.sin(an) * ds - 30) + 'px) scale(.2)', opacity: 0 }],
          { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(sp);
      }
      if (label === '') return;
      var tx = document.createElement('div');
      tx.textContent = label || 'PAF!';
      tx.style.cssText = 'position:fixed;left:' + x + 'px;top:' + (y - 46) + 'px;z-index:100003;pointer-events:none;font:800 30px/1 var(--hd,Impact,sans-serif);letter-spacing:.04em;color:' + col + ';-webkit-text-stroke:2px #000;paint-order:stroke fill;text-shadow:0 3px 0 #000;';
      document.body.appendChild(tx);
      tx.animate([{ transform: 'translate(-50%,0) rotate(-8deg) scale(.3)', opacity: 0 }, { transform: 'translate(-50%,-6px) rotate(-8deg) scale(1.15)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%,-14px) rotate(-8deg) scale(1)', opacity: 1, offset: 0.7 }, { transform: 'translate(-50%,-26px) rotate(-8deg) scale(1)', opacity: 0 }],
        { duration: 900, easing: 'ease-out' }).onfinish = function () { tx.remove(); };
    }
    function kickLogo(K) {
      var r = K.el.getBoundingClientRect(), img = K.el.querySelector('img.lg') || K.el, d = K.kdir;
      var c = img.cloneNode(true);
      c.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;margin:0;z-index:100002;pointer-events:none;object-fit:contain;';
      document.body.appendChild(c);
      c.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate(' + (d * W * 0.3) + 'px,' + (-H * 0.1) + 'px) rotate(' + (d * 420) + 'deg) scale(.85)', opacity: 1, offset: 0.4 },
        { transform: 'translate(' + (d * W * 0.95) + 'px,' + (H * 0.55) + 'px) rotate(' + (d * 1100) + 'deg) scale(.4)', opacity: 0, offset: 1 }
      ], { duration: 1200, easing: 'cubic-bezier(.2,.65,.35,1)', fill: 'forwards' }).onfinish = function () { c.remove(); };
      logoGone = true; applyNologo(true);
      impact(r.left + r.width / 2, r.top + r.height / 2, d);
      var sh = document.getElementById('sh');
      if (sh && sh.animate) sh.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,2px)' }, { transform: 'translate(6px,-2px)' }, { transform: 'translate(-3px,1px)' }, { transform: 'translate(0,0)' }], { duration: 340 });
    }

    // ---- efektai: širdelės ir debesėlis su tekstu ----
    function hearts(n, ox, oy) {
      var cols = ['#ff3b5c', '#ff6b8b', '#e4262f', '#ff8fab', '#ff2e63'];
      for (var i = 0; i < n; i++) {
        var h = document.createElement('div'), fs = 16 + Math.random() * 20, dx = (Math.random() - 0.5) * S * 1.4, up = S * (0.6 + Math.random() * 0.9);
        h.textContent = '\u2665';
        h.style.cssText = 'position:fixed;left:' + (ox + (Math.random() - 0.5) * S * 0.3) + 'px;top:' + oy + 'px;z-index:100003;pointer-events:none;font:' + fs + 'px/1 system-ui,sans-serif;color:' + cols[i % cols.length] + ';text-shadow:0 2px 4px rgba(0,0,0,.35);opacity:0;';
        document.body.appendChild(h);
        if (!h.animate) { h.remove(); continue; }
        h.animate([
          { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
          { transform: 'translate(calc(-50% + ' + dx * 0.4 + 'px),' + (-up * 0.35) + 'px) scale(1.15)', opacity: 1, offset: 0.2 },
          { transform: 'translate(calc(-50% + ' + dx + 'px),' + (-up) + 'px) scale(.85)', opacity: 0 }
        ], { duration: 1300 + Math.random() * 800, delay: i * 90, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }).onfinish = (function (n) { return function () { n.remove(); }; })(h);
      }
    }
    function bubble(txt, away, idx) {
      var side = away || (s.x < W / 2 ? 1 : -1), mx = s.x, my = H - s.y - 1.45 * S;
      var bx = Math.max(S * 0.9, Math.min(W - S * 0.9, s.x + side * S * 0.85)), by = Math.max(34, H - s.y - 2.05 * S);
      if (idx) { bx = Math.max(S * 0.9, Math.min(W - S * 0.9, bx + side * S * 0.3)); by = by - 0.75 * S >= 34 ? by - 0.75 * S : by + 0.75 * S; }
      var fs = Math.max(16, Math.round(S * 0.2)), w = document.createElement('div');
      w.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:100003;pointer-events:none;';
      function dot(x, y, r) {
        var c = document.createElement('div');
        c.style.cssText = 'position:absolute;left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px;border-radius:50%;background:#fff;border:3px solid #111;box-sizing:border-box;';
        w.appendChild(c);
      }
      dot(mx + (bx - mx) * 0.22, my + (by - my) * 0.22, 5);
      dot(mx + (bx - mx) * 0.45, my + (by - my) * 0.45, 8);
      var b = document.createElement('div');
      b.textContent = txt;
      b.style.cssText = 'position:absolute;left:' + bx + 'px;top:' + by + 'px;transform:translate(-50%,-50%);white-space:nowrap;background:#fff;color:#111;border:3px solid #111;border-radius:999px;padding:.45em .9em;font:800 ' + fs + 'px/1 var(--hd,Impact,sans-serif);letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 0 rgba(0,0,0,.3);';
      w.appendChild(b);
      document.body.appendChild(w);
      if (!w.animate) { setTimeout(function () { w.remove(); }, 2200); return; }
      b.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.12)', opacity: 1, offset: 0.2 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 380, easing: 'ease-out', fill: 'both' });
      w.animate([{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 2400, fill: 'forwards' }).onfinish = function () { w.remove(); };
    }
    function letters(el, dir) {
      var tn = null, i;
      for (i = 0; i < el.childNodes.length; i++) if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim()) { tn = el.childNodes[i]; break; }
      if (!tn || !el.animate) return;
      var cs = getComputedStyle(el), txt = tn.nodeValue, rg = document.createRange(), col = cs.webkitTextFillColor;
      if (!col || /rgba\(0, 0, 0, 0\)|transparent/.test(col)) col = cs.color;
      var prevVis = el.style.visibility, made = [];
      for (i = 0; i < txt.length; i++) {
        if (/\s/.test(txt.charAt(i))) continue;
        rg.setStart(tn, i); rg.setEnd(tn, i + 1);
        var r = rg.getBoundingClientRect(); if (r.width < 1) continue;
        var d = document.createElement('div');
        d.textContent = txt.charAt(i);
        d.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;height:' + r.height + 'px;line-height:' + r.height + 'px;z-index:100002;pointer-events:none;white-space:pre;font:' + cs.font + ';color:' + col + ';';
        document.body.appendChild(d);
        var dx = dir * (S * (0.8 + Math.random() * 2.2)), up = -(S * (0.5 + Math.random() * 1.0)), rot = dir * (240 + Math.random() * 700);
        d.animate([
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + dx * 0.55 + 'px,' + up + 'px) rotate(' + rot * 0.5 + 'deg)', opacity: 1, offset: 0.4 },
          { transform: 'translate(' + dx + 'px,' + (S * 1.2) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
        ], { duration: 1000 + Math.random() * 500, delay: i * 18, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }).onfinish = (function (n) { return function () { n.remove(); }; })(d);
        made.push(d);
      }
      el.style.visibility = 'hidden';
      setTimeout(function () {
        el.style.visibility = prevVis;
        if (el.animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
      }, 1900);
    }
    function fx(kind, arg) {
      var side = s.vt ? s.vt.dirTo : 0;
      if (kind === 'heart') hearts(arg || 3, s.x, H - s.y - (s.move === 'love' ? 2.1 : 1.7) * S);
      else if (kind === 'bubble') bubble(arg, side ? -side : 0, 0);
      else if (kind === 'bubble2') { if (s.vt && s.vt.t2) bubble(s.vt.t2, side ? -side : 0, 1); }
      else if (kind === 'dust') impact(s.x + (side || 1) * 0.55 * S, H - s.y - 0.08 * S, side || 1, '');
      else if (kind === 'letters') {
        var tg = vFind('val');
        impact(s.x + (side || 1) * 0.75 * S, H - s.y - 0.8 * S, side || 1, '');
        if (tg) letters(tg.el, side || 1);
      }
      else if (kind === 'click') { var f = document.querySelector('#sh .ry-fx'); if (f && !f.classList.contains('lit')) f.click(); }
    }

    // ---- kortelių „sąmoningumas“: Ryto logotipas, užpildymas, pokytis; Gudaitis; Valančiūnas ----
    var vSeen = {}, logoAt = -1e9;
    function nrm(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    function sheetOpen() {
      var md = document.getElementById('md'), sh = document.getElementById('sh');
      return sh && sh.firstElementChild && (!md || md.classList.contains('o')) ? sh : null;
    }
    function ryOpen() { var sh = sheetOpen(); return sh && sh.querySelector('.cl.ry') ? sh : null; }
    function inView(r) { return r.height > 0 && r.top > 44 && r.bottom < H - 6; }
    function textRect(el) { var rg = document.createRange(); rg.selectNodeContents(el); var r = rg.getBoundingClientRect(); return r.width > 2 ? r : el.getBoundingClientRect(); }
    function cellBy(tr, re) {
      var c = tr.querySelectorAll('td[data-lb]');
      for (var i = 0; i < c.length; i++) if (re.test(nrm(c[i].getAttribute('data-lb')))) return c[i];
      return null;
    }
    function playerH2(sh, re) {
      var h = sh.querySelector('h2');
      return h && !sh.querySelector('.cl') && re.test(nrm(h.textContent)) ? h : null;
    }
    function vFind(kind) {
      var sh = sheetOpen(); if (!sh) return null;
      var el = null, neg = false, i, list, r, rect;
      if (kind === 'logo' || kind === 'fill' || kind === 'chg') {
        if (!ryOpen()) return null;
        if (kind === 'logo') el = sh.querySelector('.ry-fx');
        else {
          var re = kind === 'fill' ? /uzpildymas|filling/ : /pokyt|change/;
          list = sh.querySelectorAll('.kp > div');
          for (i = 0; i < list.length; i++) { var sm = list[i].querySelector('small'); if (sm && re.test(nrm(sm.textContent))) { el = list[i]; break; } }
          if (el && kind === 'chg') neg = !!el.querySelector('.neg') || /^\s*-/.test(((el.querySelector('b') || {}).textContent) || '');
        }
        if (!el) return null;
        rect = el.getBoundingClientRect();
      } else if (kind === 'gud') {
        list = sh.querySelectorAll('tr.pc[data-p]');
        for (i = 0; i < list.length; i++) if (nrm(list[i].getAttribute('data-p')).indexOf('gudaitis') >= 0) { el = cellBy(list[i], /sutarties|contract/) || list[i].children[3]; break; }
        if (!el && playerH2(sh, /gudaitis/)) {
          var cs = sh.querySelectorAll('tr.pc td[data-lb]'), cc = [];
          for (i = 0; i < cs.length; i++) if (/sutarties|contract/.test(nrm(cs[i].getAttribute('data-lb')))) cc.push(cs[i]);
          el = cc.length ? cc[cc.length - 1] : null;
          if (!el) { var kk = sh.querySelectorAll('.kp > div'); for (i = 0; i < kk.length; i++) if (/alga|salary/.test(nrm((kk[i].querySelector('small') || {}).textContent))) { el = kk[i].querySelector('b') || kk[i]; break; } }
        }
        if (!el) return null;
        rect = textRect(el);
      } else if (kind === 'val') {
        list = sh.querySelectorAll('tr.pc[data-p]');
        for (i = 0; i < list.length; i++) if (nrm(list[i].getAttribute('data-p')).indexOf('valanciunas') >= 0) { el = list[i].querySelector('td.l b') || list[i].querySelector('b') || list[i].children[0]; break; }
        if (!el) el = playerH2(sh, /valanciunas/);
        if (!el) return null;
        rect = textRect(el);
      }
      if (!el || rect.width < 8) return null;
      return { el: el, r: rect, neg: neg, lit: el.classList.contains('lit') };
    }
    // geometrija pagal veiksmo tipą: šalia (logotipas, užpildymas), prisilietimas rankomis (pokytis, Gudaitis), spyris (Valančiūnas)
    function vGeom(kind, r) {
      var margin = S * 0.55, roomR = W - r.right, roomL = r.left, side = roomR >= roomL ? 1 : -1, room = side > 0 ? roomR : roomL, xk, ledge, elev = 0;
      var px = r.left + r.width / 2, cy = r.top + r.height / 2, hi = Math.max(floor, H - 1.95 * S);
      if (kind === 'chg' || kind === 'gud') {
        xk = px + side * 0.55 * S;
        ledge = Math.max(floor, Math.min(hi, H - cy - 1.35 * S));
        elev = Math.max(-0.5, Math.min(1.0, Math.atan2((H - cy) - ledge - 1.45 * S, 0.6 * S)));
      } else if (kind === 'val') {
        xk = side > 0 ? r.right + 0.62 * S : r.left - 0.62 * S;
        ledge = Math.max(floor, Math.min(hi, H - cy - 0.8 * S));
      } else {
        xk = room >= S * 0.7 ? (side > 0 ? r.right + 0.55 * S : r.left - 0.55 * S) : (side > 0 ? W - margin : margin);
        ledge = Math.max(floor, Math.min(Math.max(floor, H - r.bottom), hi));
      }
      xk = Math.max(margin, Math.min(W - margin, xk));
      return { xk: xk, ledge: ledge, elev: elev, dirTo: xk < px ? 1 : -1 };
    }
    function abortVisit() { s.vt = null; s.chain = []; s.next = null; s.fl = floor; s.mode = 'idle'; s.timer = 0.8; }
    function startVisit(kind) {
      var tg = vFind(kind); if (!tg) return;
      s.vt = { kind: kind, xk: s.x, ledge: floor, dirTo: 1, elev: 0, wait: 0, t2: '' }; s.chain = [];
      if (kind === 'logo') logoAt = performance.now();
      if (kind === 'logo' && !inView(tg.r)) {
        var sh = ryOpen(); if (sh && sh.scrollTo) sh.scrollTo({ top: 0, behavior: 'smooth' }); else if (sh) sh.scrollTop = 0;
        s.mode = 'vwait'; return;
      }
      s.mode = 'vapp';
    }
    function nextChain() {
      var n = s.chain.shift(), d = s.vt ? s.vt.dirTo : 1;
      setMove(n);
      s.face = n === 'love' ? 0 : n === 'touch' ? d * 1.0 : n === 'kickname' ? d * 1.35 : d * 0.7;
    }
    function vAct() {
      var K = s.vt, tg = vFind(K.kind); if (!tg) { abortVisit(); return; }
      var seq;
      if (K.kind === 'logo') { if (tg.lit) { vSeen.logo = true; abortVisit(); return; } seq = ['press', 'love']; }
      else if (K.kind === 'fill') seq = ['nolike'];
      else if (K.kind === 'chg') seq = tg.neg ? ['touch', 'nolike'] : ['touch', 'love'];
      else if (K.kind === 'gud') { seq = ['touch', 'nolike']; K.t2 = 'Per brangu'; }
      else { seq = ['kickname']; K.t2 = 'Senas \slunkius'; }
      s.chain = seq; nextChain();
    }
    function visitPoll() {
      var sh = sheetOpen();
      if (!sh) { vSeen = {}; logoAt = -1e9; return; }
      var now = performance.now(), lg = vFind('logo');
      if (lg && !lg.lit && now - logoAt > 25000) { startVisit('logo'); return; }
      var kinds = ['fill', 'chg', 'gud', 'val'];
      for (var i = 0; i < kinds.length; i++) {
        var k = kinds[i], tg = vFind(k);
        if (!tg) { vSeen[k] = false; continue; }
        if (tg.r.bottom < 0 || tg.r.top > H) { vSeen[k] = false; continue; }
        var cy = tg.r.top + tg.r.height / 2;
        if (!vSeen[k] && inView(tg.r) && cy > H * 0.18 && cy < H * 0.88) { startVisit(k); return; }
      }
    }
    function frame(now) {
      if (s.dead) return;
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - last) / 1000); last = now; s.t += dt;
      var speed = 1.45 * S, margin = S * 0.55;
      P.reset();

      // Žalgirio kortelė atidaryta? -> spyris į logotipą
      pollT -= dt;
      if (pollT <= 0) {
        pollT = 0.25;
        var tg = findKick();
        if (tg) {
          noTgt = 0;
          var sig = Math.round(tg.r.left) + ',' + Math.round(tg.r.top) + ',' + Math.round(tg.r.width);
          stable = (sig === lastSig) ? stable + 1 : 0; lastSig = sig;
          if (logoGone) applyNologo(true);
          else if (!kickDone && !s.kt && stable >= 2 && (s.mode === 'idle' || s.mode === 'walk')) { kickDone = true; startKick(tg); }
        } else { stable = 0; lastSig = ''; if (++noTgt >= 4) { kickDone = false; logoGone = false; applyNologo(false); } }
        if (!s.vt && !s.kt && (s.mode === 'idle' || s.mode === 'walk')) visitPoll();
      }

      // gravitacija (nusileidimas nuo „lentynos“)
      if (s.mode !== 'fall' && s.mode !== 'leap' && s.mode !== 'vleap' && s.y > s.fl) {
        s.air = Math.max(s.air, s.y - s.fl);
        s.vy -= G_ * dt; s.y += s.vy * dt;
        if (s.y <= s.fl) { s.y = s.fl; s.vy = 0; if (s.air > S * 0.6 && s.mode !== 'leave') { setMove('land'); if (s.vt) s.next = 'vapp'; } s.air = 0; }
      }

      if (s.mode === 'fall') {
        s.vy -= G_ * dt; s.y += s.vy * dt;
        var fa = Math.min(1, Math.abs(s.vy) / 500);
        P.sy = 1 + Math.min(0.05, Math.abs(s.vy) / 40000); P.fx = 0;
        P.arm('L', 1.9 * fa, 0.1, 0.1, 0.25 * fa); P.arm('R', 1.9 * fa, 0.1, 0.1, 0.25 * fa);
        P.leg('L', 0.3 * fa, 0.5 * fa, 0.12 * fa); P.leg('R', -0.2 * fa, 0.7 * fa, 0.12 * fa);
        if (s.y <= s.fl) { s.y = s.fl; s.vy = 0; setMove('land'); s.face = 0; }
      } else if (s.mode === 'leap') {
        var L = s.lp, tt = Math.min(L.t + dt, L.T); L.t += dt;
        var u = Math.min(1, L.t / L.T), e = easeInOut(u), mid = smooth(0.15, 0.4, u) * smooth(0.95, 0.7, u);
        s.x = L.x0 + (L.x1 - L.x0) * u; s.y = L.y0 + L.vy0 * tt - 0.5 * G_ * tt * tt; s.face = L.dir * 1.15;
        P.fz = -L.dir * e * Math.PI * 2;
        P.arm('L', 1.5 * mid, 0.3 * mid, 0, 0); P.arm('R', 1.5 * mid, 0.3 * mid, 0, 0);
        P.leg('L', 0.9 * mid, 1.3 * mid, 0.05); P.leg('R', 0.9 * mid, 1.3 * mid, 0.05);
        if (!findKick()) abortKick();
        else if (L.t >= L.T) { retarget(); s.x = L.x1; s.y = s.kt.ledge; s.fl = s.kt.ledge; s.vy = 0; P.fz = 0; setMove('land'); s.next = 'approach'; }
      } else if (s.mode === 'approach') {
        if (!retarget()) abortKick();
        else {
          var K = s.kt, dx = K.xk - s.x, dr = dx >= 0 ? 1 : -1;
          MOVES.walk.f(P, s.t); s.face = dr * 1.15;
          if (Math.abs(dx) <= speed * 1.2 * dt + 1) { s.x = K.xk; s.mode = 'kick'; s.mt = 0; s.face = K.kdir * 1.35; }
          else s.x += dr * speed * 1.2 * dt;
        }
      } else if (s.mode === 'kick') {
        var K2 = s.kt, kv = MOVES.kick; s.mt += dt; s.face = K2.kdir * 1.35;
        if (!K2.hit && !retarget()) abortKick();
        else {
          kv.f(P, s.mt, K2.hop);
          if (!K2.hit && s.mt >= kv.hit) { K2.hit = true; kickLogo(K2); }
          if (s.mt >= kv.d) finishKick();
        }
      } else if (s.mode === 'vwait') {
        MOVES.idle.f(P, s.t); s.face = 0; s.vt.wait += dt;
        var vw = vFind(s.vt.kind);
        if (!vw || s.vt.wait > 3) abortVisit();
        else if (inView(vw.r) && s.vt.wait > 0.5) s.mode = 'vapp';
      } else if (s.mode === 'vapp') {
        var va = s.vt ? vFind(s.vt.kind) : null;
        if (!va || va.r.bottom < 0 || va.r.top > H) abortVisit();
        else {
          var K3 = s.vt, gg = vGeom(K3.kind, va.r); K3.xk = gg.xk; K3.ledge = gg.ledge; K3.dirTo = gg.dirTo; K3.elev = gg.elev;
          if (gg.ledge <= s.y + 30) s.fl = gg.ledge; else s.fl = floor;
          var vdx = gg.xk - s.x, vdr = vdx >= 0 ? 1 : -1;
          if (Math.abs(vdx) > 3) { MOVES.walk.f(P, s.t); s.face = vdr * 1.15; s.x += vdr * Math.min(Math.abs(vdx), speed * 1.3 * dt); }
          else {
            s.x = gg.xk;
            if (gg.ledge - s.y > 30) {
              var vh = gg.ledge - s.y, vv = Math.sqrt(2 * G_ * vh);
              s.lp = { t: 0, T: vv / G_, vy0: vv, x0: s.x, x1: s.x, y0: s.y, dir: gg.dirTo };
              s.mode = 'vleap'; s.face = gg.dirTo * 0.7;
            } else if (s.y > s.fl + 2) { s.face = gg.dirTo * 0.7; }
            else vAct();
          }
        }
      } else if (s.mode === 'vleap') {
        var VL = s.lp, vt2 = Math.min(VL.t + dt, VL.T); VL.t += dt;
        var vu = Math.min(1, VL.t / VL.T), ve = easeInOut(vu), vm = smooth(0.15, 0.4, vu) * smooth(0.95, 0.7, vu);
        s.y = VL.y0 + VL.vy0 * vt2 - 0.5 * G_ * vt2 * vt2;
        P.fz = -VL.dir * ve * Math.PI * 2;
        P.arm('L', 1.5 * vm, 0.3 * vm, 0, 0); P.arm('R', 1.5 * vm, 0.3 * vm, 0, 0);
        P.leg('L', 0.9 * vm, 1.3 * vm, 0.05); P.leg('R', 0.9 * vm, 1.3 * vm, 0.05);
        if (!s.vt || !vFind(s.vt.kind)) abortVisit();
        else if (VL.t >= VL.T) { var vg2 = vGeom(s.vt.kind, vFind(s.vt.kind).r); s.vt.ledge = vg2.ledge; s.y = vg2.ledge; s.fl = vg2.ledge; s.vy = 0; P.fz = 0; setMove('land'); s.next = 'vapp'; }
      } else if (s.mode === 'idle') {
        MOVES.idle.f(P, s.t); s.face = 0; s.timer -= dt; s.nextAct -= dt;
        if (s.nextAct <= 0) { s.nextAct = 8 + Math.random() * 7; setMove(pick(WALK_OK)); }
        else if (s.timer <= 0) {
          s.dir = s.x < margin * 2 ? 1 : s.x > W - margin * 2 ? -1 : (Math.random() < 0.5 ? -1 : 1);
          s.mode = 'walk'; s.timer = 1.8 + Math.random() * 2.6;
        }
      } else if (s.mode === 'walk' || s.mode === 'leave') {
        MOVES.walk.f(P, s.t); s.face = s.dir * 1.15; s.x += s.dir * speed * dt;
        if (s.mode === 'walk') {
          if (s.x > W - margin) { s.x = W - margin; s.dir = -1; }
          if (s.x < margin) { s.x = margin; s.dir = 1; }
          s.timer -= dt;
          if (s.timer <= 0) { s.mode = 'idle'; s.timer = 0.8 + Math.random() * 1.8; }
        } else if (s.x < -S * 0.7 || s.x > W + S * 0.7) { destroy(); return; }
      } else if (s.mode === 'act') {
        var mv = MOVES[s.move]; s.mt += dt;
        while (mv.ev && s.evd < mv.ev.length && s.mt >= mv.ev[s.evd][0]) { var evn = mv.ev[s.evd]; s.evd++; fx(evn[1], evn[2]); }
        if (s.mt >= mv.d) {
          if (s.next) { s.mode = s.next; s.next = null; }
          else if (s.chain && s.chain.length) nextChain();
          else {
            if (s.vt) { vSeen[s.vt.kind] = true; s.vt = null; s.fl = floor; }
            s.mode = 'idle'; s.timer = 0.6 + Math.random() * 1.2;
          }
        } else mv.f(P, s.mt, 0, s.vt ? s.vt.dirTo : (s.face >= 0 ? 1 : -1), s.vt);
      }

      s.yaw += (s.face - s.yaw) * Math.min(1, dt * (s.mode === 'kick' ? 10 : 8));
      // palinkimas sukasi apie pėdas (ne apie kūno vidurį)
      var lo = s.kt ? s.kt.kdir : 0, lx = lo * 0.95 * Math.sin(P.lean) * S, ly = -0.95 * (1 - Math.cos(P.lean)) * S;
      ch.root.position.set(s.x + lx, s.y + 0.95 * S * P.sy + P.y * S + ly, 0);
      ch.root.scale.set(P.sx * S, P.sy * S, P.sx * S);
      ch.flip.rotation.set(P.fx, 0, P.fz - (s.kt ? s.kt.kdir : 0) * P.lean);
      ch.spin.rotation.y = s.yaw + P.yaw;
      ch.applyPose(P);
      var air = Math.max(0, s.y - s.fl) / S + Math.max(0, P.y);
      var k = Math.max(0.4, 1 - air * 0.6);
      shadow.position.set(s.x, s.fl + 1, -10);
      shadow.rotation.x = 0;
      shadow.scale.set(S * 0.9 * k, S * 0.16 * k, 1);
      shadow.material.opacity = k;
      renderer.render(scene, camera);
      hit.style.width = (S * 0.7) + 'px'; hit.style.height = (S * 1.9) + 'px';
      hit.style.transform = 'translate(' + (s.x - S * 0.35) + 'px,' + (H - S * 1.9 - s.y) + 'px)';
      hit.style.display = (s.mode === 'fall' || s.mode === 'leap' || s.mode === 'approach' || s.mode === 'kick' || s.mode === 'vleap' || s.mode === 'vapp') ? 'none' : 'block';
    }
    raf = requestAnimationFrame(frame);

    function destroy() {
      s.dead = true; cancelAnimationFrame(raf); applyNologo(false);
      [].forEach.call(document.querySelectorAll('[data-b3d].lit'), function (el) { el.classList.remove('lit'); });
      window.removeEventListener('resize', onResize);
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
      layer.remove(); hit.remove();
      walker = null;
    }
    return { leave: leave, destroy: destroy, _state: function () { return s; } };
  }

  API.walker = {
    toggle: function (srcEl) {
      if (walker) walker.leave();
      else startWalker(srcEl);
    },
    start: startWalker,
    active: function () { return !!walker; },
    stop: function () { if (walker) walker.leave(); }
  };
  API.mount = mount;
  API.mountCenter = mountCenter;
  API._createWalker = createWalker;
})();
