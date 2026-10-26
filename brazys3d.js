/*
 * brazys3d.js – 3D šokantis modelis svetainei.
 *
 *   Brazys3D.openModal()               – pilno ekrano langas (paspaudus „President“)
 *   Brazys3D.mountCenter(parentEl)     – modelis per vidurį virš tėvinio elemento (žaidimas)
 *   Brazys3D.mount(el)                 – modelis į bet kurį elementą
 *   Brazys3D.autoBind()                – pats užkabina paspaudimą ant „Mindaugas Brazys / President“
 *
 * Failai (model.obj, model.mtl, model_baseColor.png) turi būti tame pačiame aplanke kaip ir puslapis,
 * arba nustatyk Brazys3D.base = 'kelias/'.
 */
(function () {
  'use strict';

  var API = { base: '' };
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';
  var threeReady = null;
  var modelReady = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function ensureThree() {
    if (window.THREE && THREE.OBJLoader && THREE.MTLLoader) return Promise.resolve();
    if (!threeReady) {
      threeReady = loadScript(THREE_URL + 'build/three.min.js')
        .then(function () { return loadScript(THREE_URL + 'examples/js/loaders/MTLLoader.js'); })
        .then(function () { return loadScript(THREE_URL + 'examples/js/loaders/OBJLoader.js'); });
    }
    return threeReady;
  }

  // Modelis kraunamas vieną kartą, o kiekvienas langas gauna kopiją
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
              obj.traverse(function (c) {
                if (!c.isMesh) return;
                var old = Array.isArray(c.material) ? c.material[0] : c.material;
                if (old && old.map) old.map.encoding = THREE.sRGBEncoding;
                c.material = new THREE.MeshStandardMaterial({
                  map: old ? old.map : null, roughness: 0.8, metalness: 0
                });
              });
              var box = new THREE.Box3().setFromObject(obj);
              obj.position.sub(box.getCenter(new THREE.Vector3()));
              res(obj);
            }, undefined, rej);
          }, undefined, rej);
        });
      });
      modelReady.catch(function () { modelReady = null; });
    }
    return modelReady;
  }

  var DURATION = 3.8;
  var easeInOut = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var seg = function (t, a, b) { return clamp01((t - a) / (b - a)); };

  function pose(t) {
    var y = 0, sy = 1, sx = 1, fx = 0, sp = 0;
    var crouch = Math.sin(seg(t, 0, 0.35) * Math.PI);
    sy -= 0.07 * crouch; sx += 0.04 * crouch;

    var j1 = seg(t, 0.35, 1.1);
    y += Math.sin(j1 * Math.PI) * 0.55;
    fx = easeInOut(j1) * Math.PI;

    var s = seg(t, 1.1, 2.9);
    sp = easeInOut(s) * Math.PI * 2 * 5;
    if (t > 1.1 && t < 2.9) y += Math.abs(Math.sin(s * Math.PI * 6)) * 0.04;

    var j2 = seg(t, 2.9, 3.6);
    if (j2 > 0) {
      y += Math.sin(j2 * Math.PI) * 0.5;
      fx = Math.PI + easeInOut(j2) * Math.PI;
    }
    var land = Math.sin(seg(t, 3.6, DURATION) * Math.PI);
    sy -= 0.06 * land; sx += 0.03 * land;
    return { y: y, sy: sy, sx: sx, fx: fx, sp: sp };
  }

  function makeShadowTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0.45)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  // Vienas 3D langas viename elemente
  function mount(el, opts) {
    opts = opts || {};
    var state = { dead: false, t0: null, ready: false, raf: 0 };
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;height:100%;';
    el.appendChild(wrap);
    var note = document.createElement('div');
    note.textContent = '…';
    note.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;opacity:.6;font:14px system-ui,sans-serif;pointer-events:none;';
    wrap.appendChild(note);

    var renderer, scene, camera, root, flip, spin, shadow;

    function render() { if (renderer) renderer.render(scene, camera); }

    function resize() {
      if (!renderer) return;
      var w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var aspect = w / h;
      var visH = Math.max(3.4, 1.7 / aspect);
      camera.position.z = visH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.updateProjectionMatrix();
      render();
    }

    function tick(now) {
      if (state.dead) return;
      if (state.t0 === null) return;
      var t = (now - state.t0) / 1000;
      if (t >= DURATION) {
        state.t0 = null;
        root.position.y = 0; root.scale.set(1, 1, 1);
        flip.rotation.x = 0; spin.rotation.y = 0;
        shadow.scale.set(1, 1, 1); shadow.material.opacity = 1;
        render();
        if (opts.onEnd) opts.onEnd();
        return;
      }
      var p = pose(t);
      root.position.y = p.y;
      root.scale.set(p.sx, p.sy, p.sx);
      flip.rotation.x = p.fx;
      spin.rotation.y = p.sp;
      var k = Math.max(0.45, 1 - p.y * 0.8);
      shadow.scale.set(k, k, k);
      shadow.material.opacity = k;
      render();
      state.raf = requestAnimationFrame(tick);
    }

    function dance() {
      if (!state.ready || state.dead || state.t0 !== null) return;
      state.t0 = performance.now();
      if (opts.onStart) opts.onStart();
      state.raf = requestAnimationFrame(tick);
    }

    ensureModel().then(function (model) {
      if (state.dead) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;cursor:pointer;touch-action:manipulation;';
      wrap.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      camera.position.set(0, 0.1, 6);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x666677, 0.9));
      var key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2, 3, 4);
      scene.add(key);

      root = new THREE.Group(); flip = new THREE.Group(); spin = new THREE.Group();
      root.add(flip); flip.add(spin);
      spin.add(model.clone(true));
      scene.add(root);

      shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.8),
        new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.96;
      scene.add(shadow);

      state.ready = true;
      note.remove();
      resize();
      renderer.domElement.addEventListener('click', dance);
      if (opts.autoDance) setTimeout(dance, 250);
    }).catch(function () {
      note.textContent = 'Nepavyko įkelti 3D modelio';
    });

    var ro = (window.ResizeObserver ? new ResizeObserver(resize) : null);
    if (ro) ro.observe(wrap); else window.addEventListener('resize', resize);

    return {
      dance: dance,
      destroy: function () {
        state.dead = true;
        cancelAnimationFrame(state.raf);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        if (renderer) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); }
        wrap.remove();
      }
    };
  }

  // Modelis per vidurį virš tėvinio elemento (žaidimo kortelių juostos)
  function mountCenter(parent, opts) {
    opts = opts || {};
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    var box = document.createElement('div');
    box.className = 'brazys3d-center';
    box.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:5;' +
      'width:' + (opts.width || 'min(260px,38vw)') + ';height:' + (opts.height || 'min(360px,60vw)') + ';';
    parent.appendChild(box);
    var inst = mount(box, opts);
    var destroy = inst.destroy;
    inst.destroy = function () { destroy(); box.remove(); };
    return inst;
  }

  // Pilno ekrano langas
  function openModal() {
    if (document.getElementById('brazys3d-modal')) return;
    var back = document.createElement('div');
    back.id = 'brazys3d-modal';
    back.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(8,10,16,.82);' +
      'display:grid;place-items:center;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';
    var card = document.createElement('div');
    card.style.cssText =
      'position:relative;width:min(92vw,520px);height:min(86vh,720px);border-radius:20px;' +
      'background:radial-gradient(120% 90% at 50% 0%,#232a3a,#10131c);' +
      'border:1px solid rgba(255,255,255,.12);overflow:hidden;';
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Uždaryti ✕';
    close.style.cssText =
      'position:absolute;top:12px;right:12px;z-index:2;padding:8px 14px;border-radius:10px;cursor:pointer;' +
      'background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);font:14px system-ui,sans-serif;';
    var hint = document.createElement('div');
    hint.textContent = 'Paspausk ant jo';
    hint.style.cssText =
      'position:absolute;left:0;right:0;bottom:14px;text-align:center;color:#fff;opacity:.65;' +
      'font:14px system-ui,sans-serif;pointer-events:none;z-index:2;';
    var stage = document.createElement('div');
    stage.style.cssText = 'position:absolute;inset:0;';
    card.appendChild(stage); card.appendChild(close); card.appendChild(hint);
    back.appendChild(card);
    document.body.appendChild(back);

    var inst = mount(stage, {
      autoDance: true,
      onStart: function () { hint.style.visibility = 'hidden'; },
      onEnd: function () { hint.textContent = 'Dar kartą?'; hint.style.visibility = 'visible'; }
    });

    function shut() {
      inst.destroy();
      back.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') shut(); }
    close.addEventListener('click', shut);
    back.addEventListener('click', function (e) { if (e.target === back) shut(); });
    document.addEventListener('keydown', onKey);
  }

  // Automatinis užkabinimas: paspaudus kortelę su tekstu „Mindaugas Brazys“ ir „President“
  function autoBind() {
    if (autoBind.done) return;
    autoBind.done = true;
    document.addEventListener('click', function (e) {
      var el = e.target;
      for (var i = 0; i < 6 && el && el !== document.body; i++, el = el.parentElement) {
        var txt = el.textContent || '';
        if (txt.length < 80 && /Mindaugas Brazys/.test(txt) && /President/i.test(txt) && !/CEO/.test(txt)) {
          openModal();
          return;
        }
      }
    });
  }

  API.mount = mount;
  API.mountCenter = mountCenter;
  API.openModal = openModal;
  API.autoBind = autoBind;
  window.Brazys3D = API;
})();
