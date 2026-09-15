(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rive"] = factory();
	else
		root["rive"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

var Rive = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;

var k = moduleArg, aa, ba, ca = new Promise((b, a) => {
  aa = b;
  ba = a;
}), da = "object" == typeof window, ea = "function" == typeof importScripts;
function ja() {
  function b(m) {
    const h = d;
    c = a = 0;
    d = new Map();
    h.forEach(l => {
      try {
        l(m);
      } catch (n) {
        console.error(n);
      }
    });
    this.ua();
    e && e.Oa();
  }
  let a = 0, c = 0, d = new Map(), e = null, f = null;
  this.requestAnimationFrame = function(m) {
    a ||= requestAnimationFrame(b.bind(this));
    const h = ++c;
    d.set(h, m);
    return h;
  };
  this.cancelAnimationFrame = function(m) {
    d.delete(m);
    a && 0 == d.size && (cancelAnimationFrame(a), a = 0);
  };
  this.Ma = function(m) {
    f && (document.body.remove(f), f = null);
    m || (f = document.createElement("div"), f.style.backgroundColor = "black", f.style.position = "fixed", f.style.right = 0, f.style.top = 0, f.style.color = "white", f.style.padding = "4px", f.innerHTML = "RIVE FPS", m = function(h) {
      f.innerHTML = "RIVE FPS " + h.toFixed(1);
    }, document.body.appendChild(f));
    e = new function() {
      let h = 0, l = 0;
      this.Oa = function() {
        var n = performance.now();
        l ? (++h, n -= l, 1000 < n && (m(1000 * h / n), h = l = 0)) : (l = n, h = 0);
      };
    }();
  };
  this.Ja = function() {
    f && (document.body.remove(f), f = null);
    e = null;
  };
  this.ua = function() {
  };
}
function ka(b) {
  console.assert(!0);
  const a = new Map();
  let c = -Infinity;
  this.push = function(d) {
    d = d + ((1 << b) - 1) >> b;
    a.has(d) && clearTimeout(a.get(d));
    a.set(d, setTimeout(function() {
      a.delete(d);
      0 == a.length ? c = -Infinity : d == c && (c = Math.max(...a.keys()), console.assert(c < d));
    }, 1000));
    c = Math.max(d, c);
    return c << b;
  };
}
const la = k.onRuntimeInitialized;
k.onRuntimeInitialized = function() {
  la && la();
  let b = k.decodeAudio;
  k.decodeAudio = function(e, f) {
    e = b(e);
    f(e);
  };
  let a = k.decodeFont;
  k.decodeFont = function(e, f) {
    e = a(e);
    f(e);
  };
  const c = k.FileAssetLoader;
  k.ptrToAsset = e => {
    let f = k.ptrToFileAsset(e);
    return f.isImage ? k.ptrToImageAsset(e) : f.isFont ? k.ptrToFontAsset(e) : f.isAudio ? k.ptrToAudioAsset(e) : f;
  };
  k.CustomFileAssetLoader = c.extend("CustomFileAssetLoader", {__construct:function({loadContents:e}) {
    this.__parent.__construct.call(this);
    this.Da = e;
  }, loadContents:function(e, f) {
    e = k.ptrToAsset(e);
    return this.Da(e, f);
  },});
  k.CDNFileAssetLoader = c.extend("CDNFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
  }, loadContents:function(e) {
    let f = k.ptrToAsset(e);
    e = f.cdnUuid;
    if ("" === e) {
      return !1;
    }
    (function(m, h) {
      var l = new XMLHttpRequest();
      l.responseType = "arraybuffer";
      l.onreadystatechange = function() {
        4 == l.readyState && 200 == l.status && h(l);
      };
      l.open("GET", m, !0);
      l.send(null);
    })(f.cdnBaseUrl + "/" + e, m => {
      f.decode(new Uint8Array(m.response));
    });
    return !0;
  },});
  k.FallbackFileAssetLoader = c.extend("FallbackFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
    this.ta = [];
  }, addLoader:function(e) {
    this.ta.push(e);
  }, loadContents:function(e, f) {
    for (let m of this.ta) {
      if (m.loadContents(e, f)) {
        return !0;
      }
    }
    return !1;
  },});
  let d = k.computeAlignment;
  k.computeAlignment = function(e, f, m, h, l = 1.0) {
    return d.call(this, e, f, m, h, l);
  };
};
const na = "createConicGradient createImageData createLinearGradient createPattern createRadialGradient getContextAttributes getImageData getLineDash getTransform isContextLost isPointInPath isPointInStroke measureText".split(" "), oa = new function() {
  function b() {
    if (!a) {
      var g = document.createElement("canvas"), t = {alpha:1, depth:0, stencil:0, antialias:0, premultipliedAlpha:1, preserveDrawingBuffer:0, powerPreference:"high-performance", failIfMajorPerformanceCaveat:0, enableExtensionsByDefault:1, explicitSwapControl:1, renderViaOffscreenBackBuffer:1,};
      let q;
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        if (q = g.getContext("webgl", t), c = 1, !q) {
          return console.log("No WebGL support. Image mesh will not be drawn."), !1;
        }
      } else {
        if (q = g.getContext("webgl2", t)) {
          c = 2;
        } else {
          if (q = g.getContext("webgl", t)) {
            c = 1;
          } else {
            return console.log("No WebGL support. Image mesh will not be drawn."), !1;
          }
        }
      }
      q = new Proxy(q, {get(E, v) {
        if (E.isContextLost()) {
          if (l || (console.error("Cannot render the mesh because the GL Context was lost. Tried to invoke ", v), l = !0), "function" === typeof E[v]) {
            return function() {
            };
          }
        } else {
          return "function" === typeof E[v] ? function(...I) {
            return E[v].apply(E, I);
          } : E[v];
        }
      }, set(E, v, I) {
        if (E.isContextLost()) {
          l || (console.error("Cannot render the mesh because the GL Context was lost. Tried to set property " + v), l = !0);
        } else {
          return E[v] = I, !0;
        }
      },});
      d = Math.min(q.getParameter(q.MAX_RENDERBUFFER_SIZE), q.getParameter(q.MAX_TEXTURE_SIZE));
      function F(E, v, I) {
        v = q.createShader(v);
        q.shaderSource(v, I);
        q.compileShader(v);
        I = q.getShaderInfoLog(v);
        if (0 < (I || "").length) {
          throw I;
        }
        q.attachShader(E, v);
      }
      g = q.createProgram();
      F(g, q.VERTEX_SHADER, "attribute vec2 vertex;\n                attribute vec2 uv;\n                uniform vec4 mat;\n                uniform vec2 translate;\n                varying vec2 st;\n                void main() {\n                    st = uv;\n                    gl_Position = vec4(mat2(mat) * vertex + translate, 0, 1);\n                }");
      F(g, q.FRAGMENT_SHADER, "precision highp float;\n                uniform sampler2D image;\n                varying vec2 st;\n                void main() {\n                    gl_FragColor = texture2D(image, st);\n                }");
      q.bindAttribLocation(g, 0, "vertex");
      q.bindAttribLocation(g, 1, "uv");
      q.linkProgram(g);
      t = q.getProgramInfoLog(g);
      if (0 < (t || "").trim().length) {
        throw t;
      }
      e = q.getUniformLocation(g, "mat");
      f = q.getUniformLocation(g, "translate");
      q.useProgram(g);
      q.bindBuffer(q.ARRAY_BUFFER, q.createBuffer());
      q.enableVertexAttribArray(0);
      q.enableVertexAttribArray(1);
      q.bindBuffer(q.ELEMENT_ARRAY_BUFFER, q.createBuffer());
      q.uniform1i(q.getUniformLocation(g, "image"), 0);
      q.pixelStorei(q.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0);
      a = q;
    }
    return !0;
  }
  let a = null, c = 0, d = 0, e = null, f = null, m = 0, h = 0, l = !1;
  b();
  this.Wa = function() {
    b();
    return d;
  };
  this.Ia = function(g) {
    a.deleteTexture && a.deleteTexture(g);
  };
  this.Ha = function(g) {
    if (!b()) {
      return null;
    }
    const t = a.createTexture();
    if (!t) {
      return null;
    }
    a.bindTexture(a.TEXTURE_2D, t);
    a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, g);
    a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE);
    a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE);
    a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
    2 == c ? (a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_LINEAR), a.generateMipmap(a.TEXTURE_2D)) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
    return t;
  };
  const n = new ka(8), r = new ka(8), w = new ka(10), y = new ka(10);
  this.La = function(g, t, q, F, E) {
    if (b()) {
      var v = n.push(g), I = r.push(t);
      if (a.canvas) {
        if (a.canvas.width != v || a.canvas.height != I) {
          a.canvas.width = v, a.canvas.height = I;
        }
        a.viewport(0, I - t, g, t);
        a.disable(a.SCISSOR_TEST);
        a.clearColor(0, 0, 0, 0);
        a.clear(a.COLOR_BUFFER_BIT);
        a.enable(a.SCISSOR_TEST);
        q.sort((C, W) => W.xa - C.xa);
        v = w.push(F);
        m != v && (a.bufferData(a.ARRAY_BUFFER, 8 * v, a.DYNAMIC_DRAW), m = v);
        v = 0;
        for (var L of q) {
          a.bufferSubData(a.ARRAY_BUFFER, v, L.ha), v += 4 * L.ha.length;
        }
        console.assert(v == 4 * F);
        for (var R of q) {
          a.bufferSubData(a.ARRAY_BUFFER, v, R.Aa), v += 4 * R.Aa.length;
        }
        console.assert(v == 8 * F);
        v = y.push(E);
        h != v && (a.bufferData(a.ELEMENT_ARRAY_BUFFER, 2 * v, a.DYNAMIC_DRAW), h = v);
        L = 0;
        for (var fa of q) {
          a.bufferSubData(a.ELEMENT_ARRAY_BUFFER, L, fa.indices), L += 2 * fa.indices.length;
        }
        console.assert(L == 2 * E);
        fa = 0;
        R = !0;
        v = L = 0;
        for (const C of q) {
          C.image.ca != fa && (a.bindTexture(a.TEXTURE_2D, C.image.ba || null), fa = C.image.ca);
          C.Za ? (a.scissor(C.ma, I - C.na - C.sa, C.kb, C.sa), R = !0) : R && (a.scissor(0, I - t, g, t), R = !1);
          q = 2 / g;
          const W = -2 / t;
          a.uniform4f(e, C.M[0] * q * C.W, C.M[1] * W * C.X, C.M[2] * q * C.W, C.M[3] * W * C.X);
          a.uniform2f(f, C.M[4] * q * C.W + q * (C.ma - C.Xa * C.W) - 1, C.M[5] * W * C.X + W * (C.na - C.Ya * C.X) + 1);
          a.vertexAttribPointer(0, 2, a.FLOAT, !1, 0, v);
          a.vertexAttribPointer(1, 2, a.FLOAT, !1, 0, v + 4 * F);
          a.drawElements(a.TRIANGLES, C.indices.length, a.UNSIGNED_SHORT, L);
          v += 4 * C.ha.length;
          L += 2 * C.indices.length;
        }
        console.assert(v == 4 * F);
        console.assert(L == 2 * E);
      }
    }
  };
  this.canvas = function() {
    return b() && a.canvas;
  };
}(), pa = k.onRuntimeInitialized;
k.onRuntimeInitialized = function() {
  function b(p) {
    switch(p) {
      case n.srcOver:
        return "source-over";
      case n.screen:
        return "screen";
      case n.overlay:
        return "overlay";
      case n.darken:
        return "darken";
      case n.lighten:
        return "lighten";
      case n.colorDodge:
        return "color-dodge";
      case n.colorBurn:
        return "color-burn";
      case n.hardLight:
        return "hard-light";
      case n.softLight:
        return "soft-light";
      case n.difference:
        return "difference";
      case n.exclusion:
        return "exclusion";
      case n.multiply:
        return "multiply";
      case n.hue:
        return "hue";
      case n.saturation:
        return "saturation";
      case n.color:
        return "color";
      case n.luminosity:
        return "luminosity";
    }
  }
  function a(p) {
    return "rgba(" + ((16711680 & p) >>> 16) + "," + ((65280 & p) >>> 8) + "," + ((255 & p) >>> 0) + "," + ((4278190080 & p) >>> 24) / 255 + ")";
  }
  function c() {
    0 < I.length && (oa.La(v.drawWidth(), v.drawHeight(), I, L, R), I = [], R = L = 0, v.reset(512, 512));
    for (const p of E) {
      for (const u of p.u) {
        u();
      }
      p.u = [];
    }
    E.clear();
  }
  pa && pa();
  var d = k.RenderPaintStyle;
  const e = k.RenderPath, f = k.RenderPaint, m = k.Renderer, h = k.StrokeCap, l = k.StrokeJoin, n = k.BlendMode, r = d.fill, w = d.stroke, y = k.FillRule.evenOdd;
  let g = 1;
  var t = k.RenderImage.extend("CanvasRenderImage", {__construct:function({P:p, V:u} = {}) {
    this.__parent.__construct.call(this);
    this.ca = g;
    g = g + 1 & 2147483647 || 1;
    this.P = p;
    this.V = u;
  }, __destruct:function() {
    this.ba && (oa.Ia(this.ba), URL.revokeObjectURL(this.ka));
    this.__parent.__destruct.call(this);
  }, decode:function(p) {
    var u = this;
    u.V && u.V(u);
    var A = new Image();
    u.ka = URL.createObjectURL(new Blob([p], {type:"image/png",}));
    A.onload = function() {
      u.Ca = A;
      u.ba = oa.Ha(A);
      u.size(A.width, A.height);
      u.P && u.P(u);
    };
    A.src = u.ka;
  },}), q = e.extend("CanvasRenderPath", {__construct:function() {
    this.__parent.__construct.call(this);
    this.G = new Path2D();
  }, rewind:function() {
    this.G = new Path2D();
  }, addPath:function(p, u, A, D, z, B, G) {
    var H = this.G, V = H.addPath;
    p = p.G;
    const M = new DOMMatrix();
    M.a = u;
    M.b = A;
    M.c = D;
    M.d = z;
    M.e = B;
    M.f = G;
    V.call(H, p, M);
  }, fillRule:function(p) {
    this.ja = p;
  }, moveTo:function(p, u) {
    this.G.moveTo(p, u);
  }, lineTo:function(p, u) {
    this.G.lineTo(p, u);
  }, cubicTo:function(p, u, A, D, z, B) {
    this.G.bezierCurveTo(p, u, A, D, z, B);
  }, close:function() {
    this.G.closePath();
  },}), F = f.extend("CanvasRenderPaint", {color:function(p) {
    this.la = a(p);
  }, thickness:function(p) {
    this.Fa = p;
  }, join:function(p) {
    switch(p) {
      case l.miter:
        this.aa = "miter";
        break;
      case l.round:
        this.aa = "round";
        break;
      case l.bevel:
        this.aa = "bevel";
    }
  }, cap:function(p) {
    switch(p) {
      case h.butt:
        this.$ = "butt";
        break;
      case h.round:
        this.$ = "round";
        break;
      case h.square:
        this.$ = "square";
    }
  }, style:function(p) {
    this.Ea = p;
  }, blendMode:function(p) {
    this.Ba = b(p);
  }, clearGradient:function() {
    this.O = null;
  }, linearGradient:function(p, u, A, D) {
    this.O = {ya:p, za:u, pa:A, qa:D, fa:[],};
  }, radialGradient:function(p, u, A, D) {
    this.O = {ya:p, za:u, pa:A, qa:D, fa:[], Va:!0,};
  }, addStop:function(p, u) {
    this.O.fa.push({color:p, stop:u,});
  }, completeGradient:function() {
  }, draw:function(p, u, A) {
    let D = this.Ea;
    var z = this.la, B = this.O;
    p.globalCompositeOperation = this.Ba;
    if (null != B) {
      z = B.ya;
      var G = B.za;
      const V = B.pa;
      var H = B.qa;
      const M = B.fa;
      B.Va ? (B = V - z, H -= G, z = p.createRadialGradient(z, G, 0, z, G, Math.sqrt(B * B + H * H))) : z = p.createLinearGradient(z, G, V, H);
      for (let U = 0, N = M.length; U < N; U++) {
        G = M[U], z.addColorStop(G.stop, a(G.color));
      }
      this.la = z;
      this.O = null;
    }
    switch(D) {
      case w:
        p.strokeStyle = z;
        p.lineWidth = this.Fa;
        p.lineCap = this.$;
        p.lineJoin = this.aa;
        p.stroke(u);
        break;
      case r:
        p.fillStyle = z, p.fill(u, A);
    }
  },});
  const E = new Set();
  let v = null, I = [], L = 0, R = 0;
  var fa = k.CanvasRenderer = m.extend("Renderer", {__construct:function(p) {
    this.__parent.__construct.call(this);
    this.F = [1, 0, 0, 1, 0, 0];
    this.m = p.getContext("2d");
    this.ia = p;
    this.u = [];
  }, save:function() {
    this.F.push(...this.F.slice(this.F.length - 6));
    this.u.push(this.m.save.bind(this.m));
  }, restore:function() {
    const p = this.F.length - 6;
    if (6 > p) {
      throw "restore() called without matching save().";
    }
    this.F.splice(p);
    this.u.push(this.m.restore.bind(this.m));
  }, transform:function(p, u, A, D, z, B) {
    const G = this.F, H = G.length - 6;
    G.splice(H, 6, G[H] * p + G[H + 2] * u, G[H + 1] * p + G[H + 3] * u, G[H] * A + G[H + 2] * D, G[H + 1] * A + G[H + 3] * D, G[H] * z + G[H + 2] * B + G[H + 4], G[H + 1] * z + G[H + 3] * B + G[H + 5]);
    this.u.push(this.m.transform.bind(this.m, p, u, A, D, z, B));
  }, rotate:function(p) {
    const u = Math.sin(p);
    p = Math.cos(p);
    this.transform(p, u, -u, p, 0, 0);
  }, _drawPath:function(p, u) {
    this.u.push(u.draw.bind(u, this.m, p.G, p.ja === y ? "evenodd" : "nonzero"));
  }, _drawRiveImage:function(p, u, A, D) {
    var z = p.Ca;
    if (z) {
      var B = this.m, G = b(A);
      this.u.push(function() {
        B.globalCompositeOperation = G;
        B.globalAlpha = D;
        B.drawImage(z, 0, 0);
        B.globalAlpha = 1;
      });
    }
  }, _getMatrix:function(p) {
    const u = this.F, A = u.length - 6;
    for (let D = 0; 6 > D; ++D) {
      p[D] = u[A + D];
    }
  }, _drawImageMesh:function(p, u, A, D, z, B, G, H, V, M, U) {
    u = this.m.canvas.width;
    var N = this.m.canvas.height;
    const rb = M - H, sb = U - V;
    H = Math.max(H, 0);
    V = Math.max(V, 0);
    M = Math.min(M, u);
    U = Math.min(U, N);
    const ta = M - H, ua = U - V;
    console.assert(ta <= Math.min(rb, u));
    console.assert(ua <= Math.min(sb, N));
    if (!(0 >= ta || 0 >= ua)) {
      M = ta < rb || ua < sb;
      u = U = 1;
      var ha = Math.ceil(ta * U), ia = Math.ceil(ua * u);
      N = oa.Wa();
      ha > N && (U *= N / ha, ha = N);
      ia > N && (u *= N / ia, ia = N);
      v || (v = new k.DynamicRectanizer(N), v.reset(512, 512));
      N = v.addRect(ha, ia);
      0 > N && (c(), E.add(this), N = v.addRect(ha, ia), console.assert(0 <= N));
      var tb = N & 65535, ub = N >> 16;
      I.push({M:this.F.slice(this.F.length - 6), image:p, ma:tb, na:ub, Xa:H, Ya:V, kb:ha, sa:ia, W:U, X:u, ha:new Float32Array(z), Aa:new Float32Array(B), indices:new Uint16Array(G), Za:M, xa:p.ca << 1 | (M ? 1 : 0),});
      L += z.length;
      R += G.length;
      var ma = this.m, lc = b(A);
      this.u.push(function() {
        ma.save();
        ma.resetTransform();
        ma.globalCompositeOperation = lc;
        ma.globalAlpha = D;
        const vb = oa.canvas();
        vb && ma.drawImage(vb, tb, ub, ha, ia, H, V, ta, ua);
        ma.restore();
      });
    }
  }, _clipPath:function(p) {
    this.u.push(this.m.clip.bind(this.m, p.G, p.ja === y ? "evenodd" : "nonzero"));
  }, clear:function() {
    E.add(this);
    this.u.push(this.m.clearRect.bind(this.m, 0, 0, this.ia.width, this.ia.height));
  }, flush:function() {
  }, translate:function(p, u) {
    this.transform(1, 0, 0, 1, p, u);
  },});
  k.makeRenderer = function(p) {
    const u = new fa(p), A = u.m;
    return new Proxy(u, {get(D, z) {
      if ("function" === typeof D[z]) {
        return function(...B) {
          return D[z].apply(D, B);
        };
      }
      if ("function" === typeof A[z]) {
        if (-1 < na.indexOf(z)) {
          throw Error("RiveException: Method call to '" + z + "()' is not allowed, as the renderer cannot immediately pass through the return                 values of any canvas 2d context methods.");
        }
        return function(...B) {
          u.u.push(A[z].bind(A, ...B));
        };
      }
      return D[z];
    }, set(D, z, B) {
      if (z in A) {
        return u.u.push(() => {
          A[z] = B;
        }), !0;
      }
    },});
  };
  k.decodeImage = function(p, u) {
    (new t({P:u})).decode(p);
  };
  k.renderFactory = {makeRenderPaint:function() {
    return new F();
  }, makeRenderPath:function() {
    return new q();
  }, makeRenderImage:function() {
    let p = W;
    return new t({V:() => {
      p.total++;
    }, P:() => {
      p.loaded++;
      if (p.loaded === p.total) {
        const u = p.ready;
        u && (u(), p.ready = null);
      }
    },});
  },};
  let C = k.load, W = null;
  k.load = function(p, u, A = !0) {
    const D = new k.FallbackFileAssetLoader();
    void 0 !== u && D.addLoader(u);
    A && (u = new k.CDNFileAssetLoader(), D.addLoader(u));
    return new Promise(function(z) {
      let B = null;
      W = {total:0, loaded:0, ready:function() {
        z(B);
      },};
      B = C(p, D);
      0 == W.total && z(B);
    });
  };
  let mc = k.RendererWrapper.prototype.align;
  k.RendererWrapper.prototype.align = function(p, u, A, D, z = 1.0) {
    mc.call(this, p, u, A, D, z);
  };
  d = new ja();
  k.requestAnimationFrame = d.requestAnimationFrame.bind(d);
  k.cancelAnimationFrame = d.cancelAnimationFrame.bind(d);
  k.enableFPSCounter = d.Ma.bind(d);
  k.disableFPSCounter = d.Ja;
  d.ua = c;
  k.resolveAnimationFrame = c;
  k.cleanup = function() {
    v && v.delete();
  };
};
var qa = Object.assign({}, k), ra = "./this.program", x = "", sa, va;
if (da || ea) {
  ea ? x = self.location.href : "undefined" != typeof document && document.currentScript && (x = document.currentScript.src), _scriptName && (x = _scriptName), x.startsWith("blob:") ? x = "" : x = x.substr(0, x.replace(/[?#].*/, "").lastIndexOf("/") + 1), ea && (va = b => {
    var a = new XMLHttpRequest();
    a.open("GET", b, !1);
    a.responseType = "arraybuffer";
    a.send(null);
    return new Uint8Array(a.response);
  }), sa = (b, a, c) => {
    if (wa(b)) {
      var d = new XMLHttpRequest();
      d.open("GET", b, !0);
      d.responseType = "arraybuffer";
      d.onload = () => {
        200 == d.status || 0 == d.status && d.response ? a(d.response) : c();
      };
      d.onerror = c;
      d.send(null);
    } else {
      fetch(b, {credentials:"same-origin"}).then(e => e.ok ? e.arrayBuffer() : Promise.reject(Error(e.status + " : " + e.url))).then(a, c);
    }
  };
}
var xa = k.print || console.log.bind(console), ya = k.printErr || console.error.bind(console);
Object.assign(k, qa);
qa = null;
k.thisProgram && (ra = k.thisProgram);
var za;
k.wasmBinary && (za = k.wasmBinary);
var Aa, Ba = !1, Ca, J, Da, Ea, K, O, Fa, Ga;
function Ha() {
  var b = Aa.buffer;
  k.HEAP8 = Ca = new Int8Array(b);
  k.HEAP16 = Da = new Int16Array(b);
  k.HEAPU8 = J = new Uint8Array(b);
  k.HEAPU16 = Ea = new Uint16Array(b);
  k.HEAP32 = K = new Int32Array(b);
  k.HEAPU32 = O = new Uint32Array(b);
  k.HEAPF32 = Fa = new Float32Array(b);
  k.HEAPF64 = Ga = new Float64Array(b);
}
var Ia = [], Ja = [], Ka = [];
function La() {
  var b = k.preRun.shift();
  Ia.unshift(b);
}
var Ma = 0, Na = null, Oa = null;
function Pa(b) {
  k.onAbort?.(b);
  b = "Aborted(" + b + ")";
  ya(b);
  Ba = !0;
  b = new WebAssembly.RuntimeError(b + ". Build with -sASSERTIONS for more info.");
  ba(b);
  throw b;
}
var Qa = b => b.startsWith("data:application/octet-stream;base64,"), wa = b => b.startsWith("file://"), Ra;
function Sa(b) {
  if (b == Ra && za) {
    return new Uint8Array(za);
  }
  if (va) {
    return va(b);
  }
  throw "both async and sync fetching of the wasm failed";
}
function Ta(b) {
  return za ? Promise.resolve().then(() => Sa(b)) : new Promise((a, c) => {
    sa(b, d => a(new Uint8Array(d)), () => {
      try {
        a(Sa(b));
      } catch (d) {
        c(d);
      }
    });
  });
}
function Ua(b, a, c) {
  return Ta(b).then(d => WebAssembly.instantiate(d, a)).then(c, d => {
    ya(`failed to asynchronously prepare wasm: ${d}`);
    Pa(d);
  });
}
function Va(b, a) {
  var c = Ra;
  return za || "function" != typeof WebAssembly.instantiateStreaming || Qa(c) || wa(c) || "function" != typeof fetch ? Ua(c, b, a) : fetch(c, {credentials:"same-origin"}).then(d => WebAssembly.instantiateStreaming(d, b).then(a, function(e) {
    ya(`wasm streaming compile failed: ${e}`);
    ya("falling back to ArrayBuffer instantiation");
    return Ua(c, b, a);
  }));
}
var Wa = b => {
  for (; 0 < b.length;) {
    b.shift()(k);
  }
}, Xa = (b, a) => Object.defineProperty(a, "name", {value:b}), Ya = [], P = [], Q, S = b => {
  if (!b) {
    throw new Q("Cannot use deleted val. handle = " + b);
  }
  return P[b];
}, Za = b => {
  switch(b) {
    case void 0:
      return 2;
    case null:
      return 4;
    case !0:
      return 6;
    case !1:
      return 8;
    default:
      const a = Ya.pop() || P.length;
      P[a] = b;
      P[a + 1] = 1;
      return a;
  }
}, $a = b => {
  var a = Error, c = Xa(b, function(d) {
    this.name = b;
    this.message = d;
    d = Error(d).stack;
    void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(a.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : `${this.name}: ${this.message}`;
  };
  return c;
}, ab, bb, T = b => {
  for (var a = ""; J[b];) {
    a += bb[J[b++]];
  }
  return a;
}, cb = [], db = () => {
  for (; cb.length;) {
    var b = cb.pop();
    b.g.L = !1;
    b["delete"]();
  }
}, eb, fb = {}, gb = (b, a) => {
  if (void 0 === a) {
    throw new Q("ptr should not be undefined");
  }
  for (; b.o;) {
    a = b.R(a), b = b.o;
  }
  return a;
}, hb = {}, kb = b => {
  b = ib(b);
  var a = T(b);
  jb(b);
  return a;
}, lb = (b, a) => {
  var c = hb[b];
  if (void 0 === c) {
    throw b = `${a} has unknown type ${kb(b)}`, new Q(b);
  }
  return c;
}, mb = () => {
}, nb = !1, ob = (b, a, c) => {
  if (a === c) {
    return b;
  }
  if (void 0 === c.o) {
    return null;
  }
  b = ob(b, a, c.o);
  return null === b ? null : c.Ka(b);
}, pb = {}, qb = (b, a) => {
  a = gb(b, a);
  return fb[a];
}, wb, yb = (b, a) => {
  if (!a.j || !a.i) {
    throw new wb("makeClassHandle requires ptr and ptrType");
  }
  if (!!a.v !== !!a.s) {
    throw new wb("Both smartPtrType and smartPtr must be specified");
  }
  a.count = {value:1};
  return xb(Object.create(b, {g:{value:a, writable:!0,},}));
}, xb = b => {
  if ("undefined" === typeof FinalizationRegistry) {
    return xb = a => a, b;
  }
  nb = new FinalizationRegistry(a => {
    a = a.g;
    --a.count.value;
    0 === a.count.value && (a.s ? a.v.C(a.s) : a.j.h.C(a.i));
  });
  xb = a => {
    var c = a.g;
    c.s && nb.register(a, {g:c}, a);
    return a;
  };
  mb = a => {
    nb.unregister(a);
  };
  return xb(b);
}, zb = {}, Ab = b => {
  for (; b.length;) {
    var a = b.pop();
    b.pop()(a);
  }
};
function Bb(b) {
  return this.fromWireType(O[b >> 2]);
}
var Cb = {}, Db = {}, X = (b, a, c) => {
  function d(h) {
    h = c(h);
    if (h.length !== b.length) {
      throw new wb("Mismatched type converter count");
    }
    for (var l = 0; l < b.length; ++l) {
      Eb(b[l], h[l]);
    }
  }
  b.forEach(function(h) {
    Db[h] = a;
  });
  var e = Array(a.length), f = [], m = 0;
  a.forEach((h, l) => {
    hb.hasOwnProperty(h) ? e[l] = hb[h] : (f.push(h), Cb.hasOwnProperty(h) || (Cb[h] = []), Cb[h].push(() => {
      e[l] = hb[h];
      ++m;
      m === f.length && d(e);
    }));
  });
  0 === f.length && d(e);
};
function Fb(b, a, c = {}) {
  var d = a.name;
  if (!b) {
    throw new Q(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (hb.hasOwnProperty(b)) {
    if (c.Ua) {
      return;
    }
    throw new Q(`Cannot register type '${d}' twice`);
  }
  hb[b] = a;
  delete Db[b];
  Cb.hasOwnProperty(b) && (a = Cb[b], delete Cb[b], a.forEach(e => e()));
}
function Eb(b, a, c = {}) {
  if (!("argPackAdvance" in a)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  return Fb(b, a, c);
}
var Gb = b => {
  throw new Q(b.g.j.h.name + " instance already deleted");
};
function Hb() {
}
var Ib = (b, a, c) => {
  if (void 0 === b[a].l) {
    var d = b[a];
    b[a] = function(...e) {
      if (!b[a].l.hasOwnProperty(e.length)) {
        throw new Q(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${b[a].l})!`);
      }
      return b[a].l[e.length].apply(this, e);
    };
    b[a].l = [];
    b[a].l[d.K] = d;
  }
}, Jb = (b, a, c) => {
  if (k.hasOwnProperty(b)) {
    if (void 0 === c || void 0 !== k[b].l && void 0 !== k[b].l[c]) {
      throw new Q(`Cannot register public name '${b}' twice`);
    }
    Ib(k, b, b);
    if (k.hasOwnProperty(c)) {
      throw new Q(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`);
    }
    k[b].l[c] = a;
  } else {
    k[b] = a, void 0 !== c && (k[b].mb = c);
  }
}, Kb = b => {
  if (void 0 === b) {
    return "_unknown";
  }
  b = b.replace(/[^a-zA-Z0-9_]/g, "$");
  var a = b.charCodeAt(0);
  return 48 <= a && 57 >= a ? `_${b}` : b;
};
function Lb(b, a, c, d, e, f, m, h) {
  this.name = b;
  this.constructor = a;
  this.B = c;
  this.C = d;
  this.o = e;
  this.Pa = f;
  this.R = m;
  this.Ka = h;
  this.va = [];
}
var Mb = (b, a, c) => {
  for (; a !== c;) {
    if (!a.R) {
      throw new Q(`Expected null or instance of ${c.name}, got an instance of ${a.name}`);
    }
    b = a.R(b);
    a = a.o;
  }
  return b;
};
function Nb(b, a) {
  if (null === a) {
    if (this.da) {
      throw new Q(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!a.g) {
    throw new Q(`Cannot pass "${Ob(a)}" as a ${this.name}`);
  }
  if (!a.g.i) {
    throw new Q(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return Mb(a.g.i, a.g.j.h, this.h);
}
function Pb(b, a) {
  if (null === a) {
    if (this.da) {
      throw new Q(`null is not a valid ${this.name}`);
    }
    if (this.U) {
      var c = this.ea();
      null !== b && b.push(this.C, c);
      return c;
    }
    return 0;
  }
  if (!a || !a.g) {
    throw new Q(`Cannot pass "${Ob(a)}" as a ${this.name}`);
  }
  if (!a.g.i) {
    throw new Q(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.T && a.g.j.T) {
    throw new Q(`Cannot convert argument of type ${a.g.v ? a.g.v.name : a.g.j.name} to parameter type ${this.name}`);
  }
  c = Mb(a.g.i, a.g.j.h, this.h);
  if (this.U) {
    if (void 0 === a.g.s) {
      throw new Q("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.fb) {
      case 0:
        if (a.g.v === this) {
          c = a.g.s;
        } else {
          throw new Q(`Cannot convert argument of type ${a.g.v ? a.g.v.name : a.g.j.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = a.g.s;
        break;
      case 2:
        if (a.g.v === this) {
          c = a.g.s;
        } else {
          var d = a.clone();
          c = this.ab(c, Za(() => d["delete"]()));
          null !== b && b.push(this.C, c);
        }
        break;
      default:
        throw new Q("Unsupporting sharing policy");
    }
  }
  return c;
}
function Qb(b, a) {
  if (null === a) {
    if (this.da) {
      throw new Q(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!a.g) {
    throw new Q(`Cannot pass "${Ob(a)}" as a ${this.name}`);
  }
  if (!a.g.i) {
    throw new Q(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (a.g.j.T) {
    throw new Q(`Cannot convert argument of type ${a.g.j.name} to parameter type ${this.name}`);
  }
  return Mb(a.g.i, a.g.j.h, this.h);
}
function Rb(b, a, c, d, e, f, m, h, l, n, r) {
  this.name = b;
  this.h = a;
  this.da = c;
  this.T = d;
  this.U = e;
  this.$a = f;
  this.fb = m;
  this.wa = h;
  this.ea = l;
  this.ab = n;
  this.C = r;
  e || void 0 !== a.o ? this.toWireType = Pb : (this.toWireType = d ? Nb : Qb, this.A = null);
}
var Sb = (b, a, c) => {
  if (!k.hasOwnProperty(b)) {
    throw new wb("Replacing nonexistent public symbol");
  }
  void 0 !== k[b].l && void 0 !== c ? k[b].l[c] = a : (k[b] = a, k[b].K = c);
}, Tb = [], Ub, Vb = b => {
  var a = Tb[b];
  a || (b >= Tb.length && (Tb.length = b + 1), Tb[b] = a = Ub.get(b));
  return a;
}, Wb = (b, a, c = []) => {
  b.includes("j") ? (b = b.replace(/p/g, "i"), a = (0,k["dynCall_" + b])(a, ...c)) : a = Vb(a)(...c);
  return a;
}, Xb = (b, a) => (...c) => Wb(b, a, c), Y = (b, a) => {
  b = T(b);
  var c = b.includes("j") ? Xb(b, a) : Vb(a);
  if ("function" != typeof c) {
    throw new Q(`unknown function pointer with signature ${b}: ${a}`);
  }
  return c;
}, Yb, Zb = (b, a) => {
  function c(f) {
    e[f] || hb[f] || (Db[f] ? Db[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  a.forEach(c);
  throw new Yb(`${b}: ` + d.map(kb).join([", "]));
};
function $b(b) {
  for (var a = 1; a < b.length; ++a) {
    if (null !== b[a] && void 0 === b[a].A) {
      return !0;
    }
  }
  return !1;
}
function ac(b, a, c, d, e) {
  var f = a.length;
  if (2 > f) {
    throw new Q("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  var m = null !== a[1] && null !== c, h = $b(a), l = "void" !== a[0].name, n = f - 2, r = Array(n), w = [], y = [];
  return Xa(b, function(...g) {
    if (g.length !== n) {
      throw new Q(`function ${b} called with ${g.length} arguments, expected ${n}`);
    }
    y.length = 0;
    w.length = m ? 2 : 1;
    w[0] = e;
    if (m) {
      var t = a[1].toWireType(y, this);
      w[1] = t;
    }
    for (var q = 0; q < n; ++q) {
      r[q] = a[q + 2].toWireType(y, g[q]), w.push(r[q]);
    }
    g = d(...w);
    if (h) {
      Ab(y);
    } else {
      for (q = m ? 1 : 2; q < a.length; q++) {
        var F = 1 === q ? t : r[q - 2];
        null !== a[q].A && a[q].A(F);
      }
    }
    t = l ? a[0].fromWireType(g) : void 0;
    return t;
  });
}
var bc = (b, a) => {
  for (var c = [], d = 0; d < b; d++) {
    c.push(O[a + 4 * d >> 2]);
  }
  return c;
}, cc = b => {
  b = b.trim();
  const a = b.indexOf("(");
  return -1 !== a ? b.substr(0, a) : b;
}, dc = (b, a, c) => {
  if (!(b instanceof Object)) {
    throw new Q(`${c} with invalid "this": ${b}`);
  }
  if (!(b instanceof a.h.constructor)) {
    throw new Q(`${c} incompatible with "this" of type ${b.constructor.name}`);
  }
  if (!b.g.i) {
    throw new Q(`cannot call emscripten binding method ${c} on deleted object`);
  }
  return Mb(b.g.i, b.g.j.h, a.h);
}, ec = b => {
  9 < b && 0 === --P[b + 1] && (P[b] = void 0, Ya.push(b));
}, fc = {name:"emscripten::val", fromWireType:b => {
  var a = S(b);
  ec(b);
  return a;
}, toWireType:(b, a) => Za(a), argPackAdvance:8, readValueFromPointer:Bb, A:null,}, gc = (b, a, c) => {
  switch(a) {
    case 1:
      return c ? function(d) {
        return this.fromWireType(Ca[d]);
      } : function(d) {
        return this.fromWireType(J[d]);
      };
    case 2:
      return c ? function(d) {
        return this.fromWireType(Da[d >> 1]);
      } : function(d) {
        return this.fromWireType(Ea[d >> 1]);
      };
    case 4:
      return c ? function(d) {
        return this.fromWireType(K[d >> 2]);
      } : function(d) {
        return this.fromWireType(O[d >> 2]);
      };
    default:
      throw new TypeError(`invalid integer width (${a}): ${b}`);
  }
}, Ob = b => {
  if (null === b) {
    return "null";
  }
  var a = typeof b;
  return "object" === a || "array" === a || "function" === a ? b.toString() : "" + b;
}, hc = (b, a) => {
  switch(a) {
    case 4:
      return function(c) {
        return this.fromWireType(Fa[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.fromWireType(Ga[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${a}): ${b}`);
  }
}, ic = (b, a, c) => {
  switch(a) {
    case 1:
      return c ? d => Ca[d] : d => J[d];
    case 2:
      return c ? d => Da[d >> 1] : d => Ea[d >> 1];
    case 4:
      return c ? d => K[d >> 2] : d => O[d >> 2];
    default:
      throw new TypeError(`invalid integer width (${a}): ${b}`);
  }
}, jc = (b, a, c, d) => {
  if (0 < d) {
    d = c + d - 1;
    for (var e = 0; e < b.length; ++e) {
      var f = b.charCodeAt(e);
      if (55296 <= f && 57343 >= f) {
        var m = b.charCodeAt(++e);
        f = 65536 + ((f & 1023) << 10) | m & 1023;
      }
      if (127 >= f) {
        if (c >= d) {
          break;
        }
        a[c++] = f;
      } else {
        if (2047 >= f) {
          if (c + 1 >= d) {
            break;
          }
          a[c++] = 192 | f >> 6;
        } else {
          if (65535 >= f) {
            if (c + 2 >= d) {
              break;
            }
            a[c++] = 224 | f >> 12;
          } else {
            if (c + 3 >= d) {
              break;
            }
            a[c++] = 240 | f >> 18;
            a[c++] = 128 | f >> 12 & 63;
          }
          a[c++] = 128 | f >> 6 & 63;
        }
        a[c++] = 128 | f & 63;
      }
    }
    a[c] = 0;
  }
}, kc = b => {
  for (var a = 0, c = 0; c < b.length; ++c) {
    var d = b.charCodeAt(c);
    127 >= d ? a++ : 2047 >= d ? a += 2 : 55296 <= d && 57343 >= d ? (a += 4, ++c) : a += 3;
  }
  return a;
}, nc = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, oc = (b, a, c) => {
  var d = a + c;
  for (c = a; b[c] && !(c >= d);) {
    ++c;
  }
  if (16 < c - a && b.buffer && nc) {
    return nc.decode(b.subarray(a, c));
  }
  for (d = ""; a < c;) {
    var e = b[a++];
    if (e & 128) {
      var f = b[a++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var m = b[a++] & 63;
        e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | m : (e & 7) << 18 | f << 12 | m << 6 | b[a++] & 63;
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, pc = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, qc = (b, a) => {
  var c = b >> 1;
  for (var d = c + a / 2; !(c >= d) && Ea[c];) {
    ++c;
  }
  c <<= 1;
  if (32 < c - b && pc) {
    return pc.decode(J.subarray(b, c));
  }
  c = "";
  for (d = 0; !(d >= a / 2); ++d) {
    var e = Da[b + 2 * d >> 1];
    if (0 == e) {
      break;
    }
    c += String.fromCharCode(e);
  }
  return c;
}, rc = (b, a, c) => {
  c ??= 2147483647;
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var d = a;
  c = c < 2 * b.length ? c / 2 : b.length;
  for (var e = 0; e < c; ++e) {
    Da[a >> 1] = b.charCodeAt(e), a += 2;
  }
  Da[a >> 1] = 0;
  return a - d;
}, sc = b => 2 * b.length, tc = (b, a) => {
  for (var c = 0, d = ""; !(c >= a / 4);) {
    var e = K[b + 4 * c >> 2];
    if (0 == e) {
      break;
    }
    ++c;
    65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
  }
  return d;
}, uc = (b, a, c) => {
  c ??= 2147483647;
  if (4 > c) {
    return 0;
  }
  var d = a;
  c = d + c - 4;
  for (var e = 0; e < b.length; ++e) {
    var f = b.charCodeAt(e);
    if (55296 <= f && 57343 >= f) {
      var m = b.charCodeAt(++e);
      f = 65536 + ((f & 1023) << 10) | m & 1023;
    }
    K[a >> 2] = f;
    a += 4;
    if (a + 4 > c) {
      break;
    }
  }
  K[a >> 2] = 0;
  return a - d;
}, vc = b => {
  for (var a = 0, c = 0; c < b.length; ++c) {
    var d = b.charCodeAt(c);
    55296 <= d && 57343 >= d && ++c;
    a += 4;
  }
  return a;
}, wc = (b, a, c) => {
  var d = [];
  b = b.toWireType(d, c);
  d.length && (O[a >> 2] = Za(d));
  return b;
}, xc = {}, yc = b => {
  var a = xc[b];
  return void 0 === a ? T(b) : a;
}, zc = [], Ac = b => {
  var a = zc.length;
  zc.push(b);
  return a;
}, Bc = (b, a) => {
  for (var c = Array(b), d = 0; d < b; ++d) {
    c[d] = lb(O[a + 4 * d >> 2], "parameter " + d);
  }
  return c;
}, Cc = Reflect.construct, Dc = {}, Fc = () => {
  if (!Ec) {
    var b = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:ra || "./this.program"}, a;
    for (a in Dc) {
      void 0 === Dc[a] ? delete b[a] : b[a] = Dc[a];
    }
    var c = [];
    for (a in b) {
      c.push(`${a}=${b[a]}`);
    }
    Ec = c;
  }
  return Ec;
}, Ec, Gc = [null, [], []], Hc = b => 0 === b % 4 && (0 !== b % 100 || 0 === b % 400), Ic = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Jc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Kc(b) {
  var a = Array(kc(b) + 1);
  jc(b, a, 0, a.length);
  return a;
}
var Lc = (b, a, c, d) => {
  function e(g, t, q) {
    for (g = "number" == typeof g ? g.toString() : g || ""; g.length < t;) {
      g = q[0] + g;
    }
    return g;
  }
  function f(g, t) {
    return e(g, t, "0");
  }
  function m(g, t) {
    function q(E) {
      return 0 > E ? -1 : 0 < E ? 1 : 0;
    }
    var F;
    0 === (F = q(g.getFullYear() - t.getFullYear())) && 0 === (F = q(g.getMonth() - t.getMonth())) && (F = q(g.getDate() - t.getDate()));
    return F;
  }
  function h(g) {
    switch(g.getDay()) {
      case 0:
        return new Date(g.getFullYear() - 1, 11, 29);
      case 1:
        return g;
      case 2:
        return new Date(g.getFullYear(), 0, 3);
      case 3:
        return new Date(g.getFullYear(), 0, 2);
      case 4:
        return new Date(g.getFullYear(), 0, 1);
      case 5:
        return new Date(g.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(g.getFullYear() - 1, 11, 30);
    }
  }
  function l(g) {
    var t = g.I;
    for (g = new Date((new Date(g.J + 1900, 0, 1)).getTime()); 0 < t;) {
      var q = g.getMonth(), F = (Hc(g.getFullYear()) ? Ic : Jc)[q];
      if (t > F - g.getDate()) {
        t -= F - g.getDate() + 1, g.setDate(1), 11 > q ? g.setMonth(q + 1) : (g.setMonth(0), g.setFullYear(g.getFullYear() + 1));
      } else {
        g.setDate(g.getDate() + t);
        break;
      }
    }
    q = new Date(g.getFullYear() + 1, 0, 4);
    t = h(new Date(g.getFullYear(), 0, 4));
    q = h(q);
    return 0 >= m(t, g) ? 0 >= m(q, g) ? g.getFullYear() + 1 : g.getFullYear() : g.getFullYear() - 1;
  }
  var n = O[d + 40 >> 2];
  d = {ib:K[d >> 2], hb:K[d + 4 >> 2], Y:K[d + 8 >> 2], ga:K[d + 12 >> 2], Z:K[d + 16 >> 2], J:K[d + 20 >> 2], D:K[d + 24 >> 2], I:K[d + 28 >> 2], nb:K[d + 32 >> 2], gb:K[d + 36 >> 2], jb:n ? n ? oc(J, n) : "" : ""};
  c = c ? oc(J, c) : "";
  n = {"%c":"%a %b %d %H:%M:%S %Y", "%D":"%m/%d/%y", "%F":"%Y-%m-%d", "%h":"%b", "%r":"%I:%M:%S %p", "%R":"%H:%M", "%T":"%H:%M:%S", "%x":"%m/%d/%y", "%X":"%H:%M:%S", "%Ec":"%c", "%EC":"%C", "%Ex":"%m/%d/%y", "%EX":"%H:%M:%S", "%Ey":"%y", "%EY":"%Y", "%Od":"%d", "%Oe":"%e", "%OH":"%H", "%OI":"%I", "%Om":"%m", "%OM":"%M", "%OS":"%S", "%Ou":"%u", "%OU":"%U", "%OV":"%V", "%Ow":"%w", "%OW":"%W", "%Oy":"%y",};
  for (var r in n) {
    c = c.replace(new RegExp(r, "g"), n[r]);
  }
  var w = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), y = "January February March April May June July August September October November December".split(" ");
  n = {"%a":g => w[g.D].substring(0, 3), "%A":g => w[g.D], "%b":g => y[g.Z].substring(0, 3), "%B":g => y[g.Z], "%C":g => f((g.J + 1900) / 100 | 0, 2), "%d":g => f(g.ga, 2), "%e":g => e(g.ga, 2, " "), "%g":g => l(g).toString().substring(2), "%G":l, "%H":g => f(g.Y, 2), "%I":g => {
    g = g.Y;
    0 == g ? g = 12 : 12 < g && (g -= 12);
    return f(g, 2);
  }, "%j":g => {
    for (var t = 0, q = 0; q <= g.Z - 1; t += (Hc(g.J + 1900) ? Ic : Jc)[q++]) {
    }
    return f(g.ga + t, 3);
  }, "%m":g => f(g.Z + 1, 2), "%M":g => f(g.hb, 2), "%n":() => "\n", "%p":g => 0 <= g.Y && 12 > g.Y ? "AM" : "PM", "%S":g => f(g.ib, 2), "%t":() => "\t", "%u":g => g.D || 7, "%U":g => f(Math.floor((g.I + 7 - g.D) / 7), 2), "%V":g => {
    var t = Math.floor((g.I + 7 - (g.D + 6) % 7) / 7);
    2 >= (g.D + 371 - g.I - 2) % 7 && t++;
    if (t) {
      53 == t && (q = (g.D + 371 - g.I) % 7, 4 == q || 3 == q && Hc(g.J) || (t = 1));
    } else {
      t = 52;
      var q = (g.D + 7 - g.I - 1) % 7;
      (4 == q || 5 == q && Hc(g.J % 400 - 1)) && t++;
    }
    return f(t, 2);
  }, "%w":g => g.D, "%W":g => f(Math.floor((g.I + 7 - (g.D + 6) % 7) / 7), 2), "%y":g => (g.J + 1900).toString().substring(2), "%Y":g => g.J + 1900, "%z":g => {
    g = g.gb;
    var t = 0 <= g;
    g = Math.abs(g) / 60;
    return (t ? "+" : "-") + String("0000" + (g / 60 * 100 + g % 60)).slice(-4);
  }, "%Z":g => g.jb, "%%":() => "%"};
  c = c.replace(/%%/g, "\x00\x00");
  for (r in n) {
    c.includes(r) && (c = c.replace(new RegExp(r, "g"), n[r](d)));
  }
  c = c.replace(/\0\0/g, "%");
  r = Kc(c);
  if (r.length > a) {
    return 0;
  }
  Ca.set(r, b);
  return r.length - 1;
};
Q = k.BindingError = class extends Error {
  constructor(b) {
    super(b);
    this.name = "BindingError";
  }
};
P.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1,);
k.count_emval_handles = () => P.length / 2 - 5 - Ya.length;
ab = k.PureVirtualError = $a("PureVirtualError");
for (var Mc = Array(256), Nc = 0; 256 > Nc; ++Nc) {
  Mc[Nc] = String.fromCharCode(Nc);
}
bb = Mc;
k.getInheritedInstanceCount = () => Object.keys(fb).length;
k.getLiveInheritedInstances = () => {
  var b = [], a;
  for (a in fb) {
    fb.hasOwnProperty(a) && b.push(fb[a]);
  }
  return b;
};
k.flushPendingDeletes = db;
k.setDelayFunction = b => {
  eb = b;
  cb.length && eb && eb(db);
};
wb = k.InternalError = class extends Error {
  constructor(b) {
    super(b);
    this.name = "InternalError";
  }
};
Object.assign(Hb.prototype, {isAliasOf:function(b) {
  if (!(this instanceof Hb && b instanceof Hb)) {
    return !1;
  }
  var a = this.g.j.h, c = this.g.i;
  b.g = b.g;
  var d = b.g.j.h;
  for (b = b.g.i; a.o;) {
    c = a.R(c), a = a.o;
  }
  for (; d.o;) {
    b = d.R(b), d = d.o;
  }
  return a === d && c === b;
}, clone:function() {
  this.g.i || Gb(this);
  if (this.g.N) {
    return this.g.count.value += 1, this;
  }
  var b = xb, a = Object, c = a.create, d = Object.getPrototypeOf(this), e = this.g;
  b = b(c.call(a, d, {g:{value:{count:e.count, L:e.L, N:e.N, i:e.i, j:e.j, s:e.s, v:e.v,},}}));
  b.g.count.value += 1;
  b.g.L = !1;
  return b;
}, ["delete"]() {
  this.g.i || Gb(this);
  if (this.g.L && !this.g.N) {
    throw new Q("Object already scheduled for deletion");
  }
  mb(this);
  var b = this.g;
  --b.count.value;
  0 === b.count.value && (b.s ? b.v.C(b.s) : b.j.h.C(b.i));
  this.g.N || (this.g.s = void 0, this.g.i = void 0);
}, isDeleted:function() {
  return !this.g.i;
}, deleteLater:function() {
  this.g.i || Gb(this);
  if (this.g.L && !this.g.N) {
    throw new Q("Object already scheduled for deletion");
  }
  cb.push(this);
  1 === cb.length && eb && eb(db);
  this.g.L = !0;
  return this;
},});
Object.assign(Rb.prototype, {Qa(b) {
  this.wa && (b = this.wa(b));
  return b;
}, oa(b) {
  this.C?.(b);
}, argPackAdvance:8, readValueFromPointer:Bb, fromWireType:function(b) {
  function a() {
    return this.U ? yb(this.h.B, {j:this.$a, i:c, v:this, s:b,}) : yb(this.h.B, {j:this, i:b,});
  }
  var c = this.Qa(b);
  if (!c) {
    return this.oa(b), null;
  }
  var d = qb(this.h, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.i = c, d.g.s = b, d.clone();
    }
    d = d.clone();
    this.oa(b);
    return d;
  }
  d = this.h.Pa(c);
  d = pb[d];
  if (!d) {
    return a.call(this);
  }
  d = this.T ? d.Ga : d.pointerType;
  var e = ob(c, this.h, d.h);
  return null === e ? a.call(this) : this.U ? yb(d.h.B, {j:d, i:e, v:this, s:b,}) : yb(d.h.B, {j:d, i:e,});
},});
Yb = k.UnboundTypeError = $a("UnboundTypeError");
var Pc = {_abort_js:() => {
  Pa("");
}, _embind_create_inheriting_constructor:(b, a, c) => {
  b = T(b);
  a = lb(a, "wrapper");
  c = S(c);
  var d = a.h, e = d.B, f = d.o.B, m = d.o.constructor;
  b = Xa(b, function(...h) {
    d.o.va.forEach(function(l) {
      if (this[l] === f[l]) {
        throw new ab(`Pure virtual function ${l} must be implemented in JavaScript`);
      }
    }.bind(this));
    Object.defineProperty(this, "__parent", {value:e});
    this.__construct(...h);
  });
  e.__construct = function(...h) {
    if (this === e) {
      throw new Q("Pass correct 'this' to __construct");
    }
    h = m.implement(this, ...h);
    mb(h);
    var l = h.g;
    h.notifyOnDestruction();
    l.N = !0;
    Object.defineProperties(this, {g:{value:l}});
    xb(this);
    h = l.i;
    h = gb(d, h);
    if (fb.hasOwnProperty(h)) {
      throw new Q(`Tried to register registered instance: ${h}`);
    }
    fb[h] = this;
  };
  e.__destruct = function() {
    if (this === e) {
      throw new Q("Pass correct 'this' to __destruct");
    }
    mb(this);
    var h = this.g.i;
    h = gb(d, h);
    if (fb.hasOwnProperty(h)) {
      delete fb[h];
    } else {
      throw new Q(`Tried to unregister unregistered instance: ${h}`);
    }
  };
  b.prototype = Object.create(e);
  Object.assign(b.prototype, c);
  return Za(b);
}, _embind_finalize_value_object:b => {
  var a = zb[b];
  delete zb[b];
  var c = a.ea, d = a.C, e = a.ra, f = e.map(m => m.Ta).concat(e.map(m => m.cb));
  X([b], f, m => {
    var h = {};
    e.forEach((l, n) => {
      var r = m[n], w = l.Ra, y = l.Sa, g = m[n + e.length], t = l.bb, q = l.eb;
      h[l.Na] = {read:F => r.fromWireType(w(y, F)), write:(F, E) => {
        var v = [];
        t(q, F, g.toWireType(v, E));
        Ab(v);
      }};
    });
    return [{name:a.name, fromWireType:l => {
      var n = {}, r;
      for (r in h) {
        n[r] = h[r].read(l);
      }
      d(l);
      return n;
    }, toWireType:(l, n) => {
      for (var r in h) {
        if (!(r in n)) {
          throw new TypeError(`Missing field: "${r}"`);
        }
      }
      var w = c();
      for (r in h) {
        h[r].write(w, n[r]);
      }
      null !== l && l.push(d, w);
      return w;
    }, argPackAdvance:8, readValueFromPointer:Bb, A:d,}];
  });
}, _embind_register_bigint:() => {
}, _embind_register_bool:(b, a, c, d) => {
  a = T(a);
  Eb(b, {name:a, fromWireType:function(e) {
    return !!e;
  }, toWireType:function(e, f) {
    return f ? c : d;
  }, argPackAdvance:8, readValueFromPointer:function(e) {
    return this.fromWireType(J[e]);
  }, A:null,});
}, _embind_register_class:(b, a, c, d, e, f, m, h, l, n, r, w, y) => {
  r = T(r);
  f = Y(e, f);
  h &&= Y(m, h);
  n &&= Y(l, n);
  y = Y(w, y);
  var g = Kb(r);
  Jb(g, function() {
    Zb(`Cannot construct ${r} due to unbound types`, [d]);
  });
  X([b, a, c], d ? [d] : [], t => {
    t = t[0];
    if (d) {
      var q = t.h;
      var F = q.B;
    } else {
      F = Hb.prototype;
    }
    t = Xa(r, function(...L) {
      if (Object.getPrototypeOf(this) !== E) {
        throw new Q("Use 'new' to construct " + r);
      }
      if (void 0 === v.H) {
        throw new Q(r + " has no accessible constructor");
      }
      var R = v.H[L.length];
      if (void 0 === R) {
        throw new Q(`Tried to invoke ctor of ${r} with invalid number of parameters (${L.length}) - expected (${Object.keys(v.H).toString()}) parameters instead!`);
      }
      return R.apply(this, L);
    });
    var E = Object.create(F, {constructor:{value:t},});
    t.prototype = E;
    var v = new Lb(r, t, E, y, q, f, h, n);
    if (v.o) {
      var I;
      (I = v.o).S ?? (I.S = []);
      v.o.S.push(v);
    }
    q = new Rb(r, v, !0, !1, !1);
    I = new Rb(r + "*", v, !1, !1, !1);
    F = new Rb(r + " const*", v, !1, !0, !1);
    pb[b] = {pointerType:I, Ga:F};
    Sb(g, t);
    return [q, I, F];
  });
}, _embind_register_class_class_function:(b, a, c, d, e, f, m) => {
  var h = bc(c, d);
  a = T(a);
  a = cc(a);
  f = Y(e, f);
  X([], [b], l => {
    function n() {
      Zb(`Cannot call ${r} due to unbound types`, h);
    }
    l = l[0];
    var r = `${l.name}.${a}`;
    a.startsWith("@@") && (a = Symbol[a.substring(2)]);
    var w = l.h.constructor;
    void 0 === w[a] ? (n.K = c - 1, w[a] = n) : (Ib(w, a, r), w[a].l[c - 1] = n);
    X([], h, y => {
      y = ac(r, [y[0], null].concat(y.slice(1)), null, f, m);
      void 0 === w[a].l ? (y.K = c - 1, w[a] = y) : w[a].l[c - 1] = y;
      if (l.h.S) {
        for (const g of l.h.S) {
          g.constructor.hasOwnProperty(a) || (g.constructor[a] = y);
        }
      }
      return [];
    });
    return [];
  });
}, _embind_register_class_class_property:(b, a, c, d, e, f, m, h) => {
  a = T(a);
  f = Y(e, f);
  X([], [b], l => {
    l = l[0];
    var n = `${l.name}.${a}`, r = {get() {
      Zb(`Cannot access ${n} due to unbound types`, [c]);
    }, enumerable:!0, configurable:!0};
    r.set = h ? () => {
      Zb(`Cannot access ${n} due to unbound types`, [c]);
    } : () => {
      throw new Q(`${n} is a read-only property`);
    };
    Object.defineProperty(l.h.constructor, a, r);
    X([], [c], w => {
      w = w[0];
      var y = {get() {
        return w.fromWireType(f(d));
      }, enumerable:!0};
      h && (h = Y(m, h), y.set = g => {
        var t = [];
        h(d, w.toWireType(t, g));
        Ab(t);
      });
      Object.defineProperty(l.h.constructor, a, y);
      return [];
    });
    return [];
  });
}, _embind_register_class_constructor:(b, a, c, d, e, f) => {
  var m = bc(a, c);
  e = Y(d, e);
  X([], [b], h => {
    h = h[0];
    var l = `constructor ${h.name}`;
    void 0 === h.h.H && (h.h.H = []);
    if (void 0 !== h.h.H[a - 1]) {
      throw new Q(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    h.h.H[a - 1] = () => {
      Zb(`Cannot construct ${h.name} due to unbound types`, m);
    };
    X([], m, n => {
      n.splice(1, 0, null);
      h.h.H[a - 1] = ac(l, n, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(b, a, c, d, e, f, m, h) => {
  var l = bc(c, d);
  a = T(a);
  a = cc(a);
  f = Y(e, f);
  X([], [b], n => {
    function r() {
      Zb(`Cannot call ${w} due to unbound types`, l);
    }
    n = n[0];
    var w = `${n.name}.${a}`;
    a.startsWith("@@") && (a = Symbol[a.substring(2)]);
    h && n.h.va.push(a);
    var y = n.h.B, g = y[a];
    void 0 === g || void 0 === g.l && g.className !== n.name && g.K === c - 2 ? (r.K = c - 2, r.className = n.name, y[a] = r) : (Ib(y, a, w), y[a].l[c - 2] = r);
    X([], l, t => {
      t = ac(w, t, n, f, m);
      void 0 === y[a].l ? (t.K = c - 2, y[a] = t) : y[a].l[c - 2] = t;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:(b, a, c, d, e, f, m, h, l, n) => {
  a = T(a);
  e = Y(d, e);
  X([], [b], r => {
    r = r[0];
    var w = `${r.name}.${a}`, y = {get() {
      Zb(`Cannot access ${w} due to unbound types`, [c, m]);
    }, enumerable:!0, configurable:!0};
    y.set = l ? () => Zb(`Cannot access ${w} due to unbound types`, [c, m]) : () => {
      throw new Q(w + " is a read-only property");
    };
    Object.defineProperty(r.h.B, a, y);
    X([], l ? [c, m] : [c], g => {
      var t = g[0], q = {get() {
        var E = dc(this, r, w + " getter");
        return t.fromWireType(e(f, E));
      }, enumerable:!0};
      if (l) {
        l = Y(h, l);
        var F = g[1];
        q.set = function(E) {
          var v = dc(this, r, w + " setter"), I = [];
          l(n, v, F.toWireType(I, E));
          Ab(I);
        };
      }
      Object.defineProperty(r.h.B, a, q);
      return [];
    });
    return [];
  });
}, _embind_register_emval:b => Eb(b, fc), _embind_register_enum:(b, a, c, d) => {
  function e() {
  }
  a = T(a);
  e.values = {};
  Eb(b, {name:a, constructor:e, fromWireType:function(f) {
    return this.constructor.values[f];
  }, toWireType:(f, m) => m.value, argPackAdvance:8, readValueFromPointer:gc(a, c, d), A:null,});
  Jb(a, e);
}, _embind_register_enum_value:(b, a, c) => {
  var d = lb(b, "enum");
  a = T(a);
  b = d.constructor;
  d = Object.create(d.constructor.prototype, {value:{value:c}, constructor:{value:Xa(`${d.name}_${a}`, function() {
  })},});
  b.values[c] = d;
  b[a] = d;
}, _embind_register_float:(b, a, c) => {
  a = T(a);
  Eb(b, {name:a, fromWireType:d => d, toWireType:(d, e) => e, argPackAdvance:8, readValueFromPointer:hc(a, c), A:null,});
}, _embind_register_function:(b, a, c, d, e, f) => {
  var m = bc(a, c);
  b = T(b);
  b = cc(b);
  e = Y(d, e);
  Jb(b, function() {
    Zb(`Cannot call ${b} due to unbound types`, m);
  }, a - 1);
  X([], m, h => {
    Sb(b, ac(b, [h[0], null].concat(h.slice(1)), null, e, f), a - 1);
    return [];
  });
}, _embind_register_integer:(b, a, c, d, e) => {
  a = T(a);
  -1 === e && (e = 4294967295);
  e = h => h;
  if (0 === d) {
    var f = 32 - 8 * c;
    e = h => h << f >>> f;
  }
  var m = a.includes("unsigned") ? function(h, l) {
    return l >>> 0;
  } : function(h, l) {
    return l;
  };
  Eb(b, {name:a, fromWireType:e, toWireType:m, argPackAdvance:8, readValueFromPointer:ic(a, c, 0 !== d), A:null,});
}, _embind_register_memory_view:(b, a, c) => {
  function d(f) {
    return new e(Ca.buffer, O[f + 4 >> 2], O[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,][a];
  c = T(c);
  Eb(b, {name:c, fromWireType:d, argPackAdvance:8, readValueFromPointer:d,}, {Ua:!0,});
}, _embind_register_std_string:(b, a) => {
  a = T(a);
  var c = "std::string" === a;
  Eb(b, {name:a, fromWireType:function(d) {
    var e = O[d >> 2], f = d + 4;
    if (c) {
      for (var m = f, h = 0; h <= e; ++h) {
        var l = f + h;
        if (h == e || 0 == J[l]) {
          m = m ? oc(J, m, l - m) : "";
          if (void 0 === n) {
            var n = m;
          } else {
            n += String.fromCharCode(0), n += m;
          }
          m = l + 1;
        }
      }
    } else {
      n = Array(e);
      for (h = 0; h < e; ++h) {
        n[h] = String.fromCharCode(J[f + h]);
      }
      n = n.join("");
    }
    jb(d);
    return n;
  }, toWireType:function(d, e) {
    e instanceof ArrayBuffer && (e = new Uint8Array(e));
    var f = "string" == typeof e;
    if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array)) {
      throw new Q("Cannot pass non-string to std::string");
    }
    var m = c && f ? kc(e) : e.length;
    var h = Oc(4 + m + 1), l = h + 4;
    O[h >> 2] = m;
    if (c && f) {
      jc(e, J, l, m + 1);
    } else {
      if (f) {
        for (f = 0; f < m; ++f) {
          var n = e.charCodeAt(f);
          if (255 < n) {
            throw jb(l), new Q("String has UTF-16 code units that do not fit in 8 bits");
          }
          J[l + f] = n;
        }
      } else {
        for (f = 0; f < m; ++f) {
          J[l + f] = e[f];
        }
      }
    }
    null !== d && d.push(jb, h);
    return h;
  }, argPackAdvance:8, readValueFromPointer:Bb, A(d) {
    jb(d);
  },});
}, _embind_register_std_wstring:(b, a, c) => {
  c = T(c);
  if (2 === a) {
    var d = qc;
    var e = rc;
    var f = sc;
    var m = h => Ea[h >> 1];
  } else {
    4 === a && (d = tc, e = uc, f = vc, m = h => O[h >> 2]);
  }
  Eb(b, {name:c, fromWireType:h => {
    for (var l = O[h >> 2], n, r = h + 4, w = 0; w <= l; ++w) {
      var y = h + 4 + w * a;
      if (w == l || 0 == m(y)) {
        r = d(r, y - r), void 0 === n ? n = r : (n += String.fromCharCode(0), n += r), r = y + a;
      }
    }
    jb(h);
    return n;
  }, toWireType:(h, l) => {
    if ("string" != typeof l) {
      throw new Q(`Cannot pass non-string to C++ string type ${c}`);
    }
    var n = f(l), r = Oc(4 + n + a);
    O[r >> 2] = n / a;
    e(l, r + 4, n + a);
    null !== h && h.push(jb, r);
    return r;
  }, argPackAdvance:8, readValueFromPointer:Bb, A(h) {
    jb(h);
  }});
}, _embind_register_value_object:(b, a, c, d, e, f) => {
  zb[b] = {name:T(a), ea:Y(c, d), C:Y(e, f), ra:[],};
}, _embind_register_value_object_field:(b, a, c, d, e, f, m, h, l, n) => {
  zb[b].ra.push({Na:T(a), Ta:c, Ra:Y(d, e), Sa:f, cb:m, bb:Y(h, l), eb:n,});
}, _embind_register_void:(b, a) => {
  a = T(a);
  Eb(b, {lb:!0, name:a, argPackAdvance:0, fromWireType:() => {
  }, toWireType:() => {
  },});
}, _emscripten_get_now_is_monotonic:() => 1, _emscripten_memcpy_js:(b, a, c) => J.copyWithin(b, a, a + c), _emval_as:(b, a, c) => {
  b = S(b);
  a = lb(a, "emval::as");
  return wc(a, c, b);
}, _emval_call_method:(b, a, c, d, e) => {
  b = zc[b];
  a = S(a);
  c = yc(c);
  return b(a, a[c], d, e);
}, _emval_decref:ec, _emval_get_method_caller:(b, a, c) => {
  var d = Bc(b, a), e = d.shift();
  b--;
  var f = Array(b);
  a = `methodCaller<(${d.map(m => m.name).join(", ")}) => ${e.name}>`;
  return Ac(Xa(a, (m, h, l, n) => {
    for (var r = 0, w = 0; w < b; ++w) {
      f[w] = d[w].readValueFromPointer(n + r), r += d[w].argPackAdvance;
    }
    m = 1 === c ? Cc(h, f) : h.apply(m, f);
    return wc(e, l, m);
  }));
}, _emval_get_module_property:b => {
  b = yc(b);
  return Za(k[b]);
}, _emval_get_property:(b, a) => {
  b = S(b);
  a = S(a);
  return Za(b[a]);
}, _emval_incref:b => {
  9 < b && (P[b + 1] += 1);
}, _emval_new_array:() => Za([]), _emval_new_cstring:b => Za(yc(b)), _emval_new_object:() => Za({}), _emval_run_destructors:b => {
  var a = S(b);
  Ab(a);
  ec(b);
}, _emval_set_property:(b, a, c) => {
  b = S(b);
  a = S(a);
  c = S(c);
  b[a] = c;
}, _emval_take_value:(b, a) => {
  b = lb(b, "_emval_take_value");
  b = b.readValueFromPointer(a);
  return Za(b);
}, emscripten_date_now:() => Date.now(), emscripten_get_now:() => performance.now(), emscripten_resize_heap:b => {
  var a = J.length;
  b >>>= 0;
  if (2147483648 < b) {
    return !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = a * (1 + 0.2 / c);
    d = Math.min(d, b + 100663296);
    var e = Math;
    d = Math.max(b, d);
    a: {
      e = (e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536) - Aa.buffer.byteLength + 65535) / 65536;
      try {
        Aa.grow(e);
        Ha();
        var f = 1;
        break a;
      } catch (m) {
      }
      f = void 0;
    }
    if (f) {
      return !0;
    }
  }
  return !1;
}, environ_get:(b, a) => {
  var c = 0;
  Fc().forEach((d, e) => {
    var f = a + c;
    e = O[b + 4 * e >> 2] = f;
    for (f = 0; f < d.length; ++f) {
      Ca[e++] = d.charCodeAt(f);
    }
    Ca[e] = 0;
    c += d.length + 1;
  });
  return 0;
}, environ_sizes_get:(b, a) => {
  var c = Fc();
  O[b >> 2] = c.length;
  var d = 0;
  c.forEach(e => d += e.length + 1);
  O[a >> 2] = d;
  return 0;
}, fd_close:() => 52, fd_seek:function() {
  return 70;
}, fd_write:(b, a, c, d) => {
  for (var e = 0, f = 0; f < c; f++) {
    var m = O[a >> 2], h = O[a + 4 >> 2];
    a += 8;
    for (var l = 0; l < h; l++) {
      var n = J[m + l], r = Gc[b];
      0 === n || 10 === n ? ((1 === b ? xa : ya)(oc(r, 0)), r.length = 0) : r.push(n);
    }
    e += h;
  }
  O[d >> 2] = e;
  return 0;
}, strftime_l:(b, a, c, d) => Lc(b, a, c, d)}, Z = function() {
  function b(c) {
    Z = c.exports;
    Aa = Z.memory;
    Ha();
    Ub = Z.__indirect_function_table;
    Ja.unshift(Z.__wasm_call_ctors);
    Ma--;
    k.monitorRunDependencies?.(Ma);
    0 == Ma && (null !== Na && (clearInterval(Na), Na = null), Oa && (c = Oa, Oa = null, c()));
    return Z;
  }
  var a = {env:Pc, wasi_snapshot_preview1:Pc,};
  Ma++;
  k.monitorRunDependencies?.(Ma);
  if (k.instantiateWasm) {
    try {
      return k.instantiateWasm(a, b);
    } catch (c) {
      ya(`Module.instantiateWasm callback failed with error: ${c}`), ba(c);
    }
  }
  Ra ||= Qa("canvas_advanced.wasm") ? "canvas_advanced.wasm" : k.locateFile ? k.locateFile("canvas_advanced.wasm", x) : x + "canvas_advanced.wasm";
  Va(a, function(c) {
    b(c.instance);
  }).catch(ba);
  return {};
}(), jb = b => (jb = Z.free)(b), Oc = b => (Oc = Z.malloc)(b), ib = b => (ib = Z.__getTypeName)(b);
k.dynCall_jiji = (b, a, c, d, e) => (k.dynCall_jiji = Z.dynCall_jiji)(b, a, c, d, e);
k.dynCall_viijii = (b, a, c, d, e, f, m) => (k.dynCall_viijii = Z.dynCall_viijii)(b, a, c, d, e, f, m);
k.dynCall_iiiiij = (b, a, c, d, e, f, m) => (k.dynCall_iiiiij = Z.dynCall_iiiiij)(b, a, c, d, e, f, m);
k.dynCall_iiiiijj = (b, a, c, d, e, f, m, h, l) => (k.dynCall_iiiiijj = Z.dynCall_iiiiijj)(b, a, c, d, e, f, m, h, l);
k.dynCall_iiiiiijj = (b, a, c, d, e, f, m, h, l, n) => (k.dynCall_iiiiiijj = Z.dynCall_iiiiiijj)(b, a, c, d, e, f, m, h, l, n);
var Qc;
Oa = function Rc() {
  Qc || Sc();
  Qc || (Oa = Rc);
};
function Sc() {
  function b() {
    if (!Qc && (Qc = !0, k.calledRun = !0, !Ba)) {
      Wa(Ja);
      aa(k);
      if (k.onRuntimeInitialized) {
        k.onRuntimeInitialized();
      }
      if (k.postRun) {
        for ("function" == typeof k.postRun && (k.postRun = [k.postRun]); k.postRun.length;) {
          var a = k.postRun.shift();
          Ka.unshift(a);
        }
      }
      Wa(Ka);
    }
  }
  if (!(0 < Ma)) {
    if (k.preRun) {
      for ("function" == typeof k.preRun && (k.preRun = [k.preRun]); k.preRun.length;) {
        La();
      }
    }
    Wa(Ia);
    0 < Ma || (k.setStatus ? (k.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        k.setStatus("");
      }, 1);
      b();
    }, 1)) : b());
  }
}
if (k.preInit) {
  for ("function" == typeof k.preInit && (k.preInit = [k.preInit]); 0 < k.preInit.length;) {
    k.preInit.pop()();
  }
}
Sc();
moduleRtn = ca;



  return moduleRtn;
}
);
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rive);


/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"@rive-app/canvas-lite","version":"2.32.0","description":"A lite version of Rive\'s canvas based web api.","main":"rive.js","homepage":"https://rive.app","repository":{"type":"git","url":"https://github.com/rive-app/rive-wasm/tree/master/js"},"keywords":["rive","animation"],"author":"Rive","contributors":["Luigi Rosso <luigi@rive.app> (https://rive.app)","Maxwell Talbot <max@rive.app> (https://rive.app)","Arthur Vivian <arthur@rive.app> (https://rive.app)","Umberto Sonnino <umberto@rive.app> (https://rive.app)","Matthew Sullivan <matt.j.sullivan@gmail.com> (mailto:matt.j.sullivan@gmail.com)"],"license":"MIT","files":["rive.js","rive.js.map","rive.wasm","rive_fallback.wasm","rive.d.ts","rive_advanced.mjs.d.ts"],"typings":"rive.d.ts","dependencies":{},"browser":{"fs":false,"path":false}}');

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _Animation__WEBPACK_IMPORTED_MODULE_0__.Animation)
/* harmony export */ });
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);



/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation)
/* harmony export */ });
/**
 * Represents an animation that can be played on an Artboard.
 * Wraps animations and instances from the runtime and keeps track of playback state.
 *
 * The `Animation` class manages the state and behavior of a single animation instance,
 * including its current time, loop count, and ability to scrub to a specific time.
 *
 * The class provides methods to advance the animation, apply its interpolated keyframe
 * values to the Artboard, and clean up the underlying animation instance when the
 * animation is no longer needed.
 */
var Animation = /** @class */ (function () {
    /**
     * Constructs a new animation
     * @constructor
     * @param {any} animation: runtime animation object
     * @param {any} instance: runtime animation instance object
     */
    function Animation(animation, artboard, runtime, playing) {
        this.animation = animation;
        this.artboard = artboard;
        this.playing = playing;
        this.loopCount = 0;
        /**
         * The time to which the animation should move to on the next render.
         * If not null, the animation will scrub to this time instead of advancing by the given time.
         */
        this.scrubTo = null;
        this.instance = new runtime.LinearAnimationInstance(animation, artboard);
    }
    Object.defineProperty(Animation.prototype, "name", {
        /**
         * Returns the animation's name
         */
        get: function () {
            return this.animation.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "time", {
        /**
         * Returns the animation's name
         */
        get: function () {
            return this.instance.time;
        },
        /**
         * Sets the animation's current time
         */
        set: function (value) {
            this.instance.time = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "loopValue", {
        /**
         * Returns the animation's loop type
         */
        get: function () {
            return this.animation.loopValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "needsScrub", {
        /**
         * Indicates whether the animation needs to be scrubbed.
         * @returns `true` if the animation needs to be scrubbed, `false` otherwise.
         */
        get: function () {
            return this.scrubTo !== null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the animation by the give time. If the animation needs scrubbing,
     * time is ignored and the stored scrub value is used.
     * @param time the time to advance the animation by if no scrubbing required
     */
    Animation.prototype.advance = function (time) {
        if (this.scrubTo === null) {
            this.instance.advance(time);
        }
        else {
            this.instance.time = 0;
            this.instance.advance(this.scrubTo);
            this.scrubTo = null;
        }
    };
    /**
     * Apply interpolated keyframe values to the artboard. This should be called after calling
     * .advance() on an animation instance so that new values are applied to properties.
     *
     * Note: This does not advance the artboard, which updates all objects on the artboard
     * @param mix - Mix value for the animation from 0 to 1
     */
    Animation.prototype.apply = function (mix) {
        this.instance.apply(mix);
    };
    /**
     * Deletes the backing Wasm animation instance; once this is called, this
     * animation is no more.
     */
    Animation.prototype.cleanup = function () {
        this.instance.delete();
    };
    return Animation;
}());



/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioAssetWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.AudioAssetWrapper),
/* harmony export */   AudioWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.AudioWrapper),
/* harmony export */   BLANK_URL: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.BLANK_URL),
/* harmony export */   CustomFileAssetLoaderWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.CustomFileAssetLoaderWrapper),
/* harmony export */   FileAssetWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.FileAssetWrapper),
/* harmony export */   FileFinalizer: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.FileFinalizer),
/* harmony export */   FontAssetWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.FontAssetWrapper),
/* harmony export */   FontWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.FontWrapper),
/* harmony export */   ImageAssetWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.ImageAssetWrapper),
/* harmony export */   ImageWrapper: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.ImageWrapper),
/* harmony export */   createFinalization: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.createFinalization),
/* harmony export */   finalizationRegistry: () => (/* reexport safe */ _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__.finalizationRegistry),
/* harmony export */   registerTouchInteractions: () => (/* reexport safe */ _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__.registerTouchInteractions),
/* harmony export */   sanitizeUrl: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeUrl)
/* harmony export */ });
/* harmony import */ var _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _finalizationRegistry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);





/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerTouchInteractions: () => (/* binding */ registerTouchInteractions)
/* harmony export */ });
var _this = undefined;
/**
 * Returns the clientX and clientY properties from touch or mouse events. Also
 * calls preventDefault() on the event if it is a touchstart or touchmove to prevent
 * scrolling the page on mobile devices
 * @param event - Either a TouchEvent or a MouseEvent
 * @returns - Coordinates of the clientX and clientY properties from the touch/mouse event
 */
var getClientCoordinates = function (event, isTouchScrollEnabled, enableMultiTouch) {
    var _a, _b;
    var coordinates = [];
    if (["touchstart", "touchmove"].indexOf(event.type) > -1 &&
        ((_a = event.changedTouches) === null || _a === void 0 ? void 0 : _a.length)) {
        // This flag, if false, prevents touch events on the canvas default behavior
        // which may prevent scrolling if a drag motion on the canvas is performed
        if (!isTouchScrollEnabled) {
            event.preventDefault();
        }
        var cnt = 0;
        var totalTouches = enableMultiTouch
            ? event.changedTouches.length
            : 1;
        while (cnt < totalTouches) {
            var touch = event.changedTouches[cnt];
            coordinates.push({
                clientX: touch.clientX,
                clientY: touch.clientY,
                identifier: touch.identifier,
            });
            cnt++;
        }
    }
    else if (event.type === "touchend" &&
        ((_b = event.changedTouches) === null || _b === void 0 ? void 0 : _b.length)) {
        var cnt = 0;
        var totalTouches = enableMultiTouch
            ? event.changedTouches.length
            : 1;
        while (cnt < totalTouches) {
            var touch = event.changedTouches[cnt];
            coordinates.push({
                clientX: touch.clientX,
                clientY: touch.clientY,
                identifier: touch.identifier,
            });
            cnt++;
        }
    }
    else {
        coordinates.push({
            clientX: event.clientX,
            clientY: event.clientY,
            identifier: 0,
        });
    }
    return coordinates;
};
/**
 * Registers mouse move/up/down callback handlers on the canvas to send meaningful coordinates to
 * the state machine pointer move/up/down functions based on cursor interaction
 */
var registerTouchInteractions = function (_a) {
    var canvas = _a.canvas, artboard = _a.artboard, _b = _a.stateMachines, stateMachines = _b === void 0 ? [] : _b, renderer = _a.renderer, rive = _a.rive, fit = _a.fit, alignment = _a.alignment, _c = _a.isTouchScrollEnabled, isTouchScrollEnabled = _c === void 0 ? false : _c, _d = _a.dispatchPointerExit, dispatchPointerExit = _d === void 0 ? true : _d, _e = _a.enableMultiTouch, enableMultiTouch = _e === void 0 ? false : _e, _f = _a.layoutScaleFactor, layoutScaleFactor = _f === void 0 ? 1.0 : _f;
    if (!canvas ||
        !stateMachines.length ||
        !renderer ||
        !rive ||
        !artboard ||
        typeof window === "undefined") {
        return null;
    }
    /**
     * After a touchend event, some browsers may fire synthetic mouse events
     * (mouseover, mousedown, mousemove, mouseup) if the touch interaction did not cause
     * any default action (such as scrolling).
     *
     * This is done to simulate the behavior of a mouse for applications that do not support
     * touch events.
     *
     * We're keeping track of the previous event to not send the synthetic mouse events if the
     * touch event was a click (touchstart -> touchend).
     *
     * This is only needed when `isTouchScrollEnabled` is false
     * When true, `preventDefault()` is called which prevents this behaviour.
     **/
    var _prevEventType = null;
    var _syntheticEventsActive = false;
    var processEventCallback = function (event) {
        // Exit early out of all synthetic mouse events
        // https://stackoverflow.com/questions/9656990/how-to-prevent-simulated-mouse-events-in-mobile-browsers
        // https://stackoverflow.com/questions/25572070/javascript-touchend-versus-click-dilemma
        if (_syntheticEventsActive && event instanceof MouseEvent) {
            // Synthetic event finished
            if (event.type == "mouseup") {
                _syntheticEventsActive = false;
            }
            return;
        }
        // Test if it's a "touch click". This could cause the browser to send
        // synthetic mouse events.
        _syntheticEventsActive =
            isTouchScrollEnabled &&
                event.type === "touchend" &&
                _prevEventType === "touchstart";
        _prevEventType = event.type;
        var boundingRect = event.currentTarget.getBoundingClientRect();
        var coordinateSets = getClientCoordinates(event, isTouchScrollEnabled, enableMultiTouch);
        var forwardMatrix = rive.computeAlignment(fit, alignment, {
            minX: 0,
            minY: 0,
            maxX: boundingRect.width,
            maxY: boundingRect.height,
        }, artboard.bounds, layoutScaleFactor);
        var invertedMatrix = new rive.Mat2D();
        forwardMatrix.invert(invertedMatrix);
        coordinateSets.forEach(function (coordinateSet) {
            var clientX = coordinateSet.clientX;
            var clientY = coordinateSet.clientY;
            if (!clientX && !clientY) {
                return;
            }
            var canvasX = clientX - boundingRect.left;
            var canvasY = clientY - boundingRect.top;
            var canvasCoordinatesVector = new rive.Vec2D(canvasX, canvasY);
            var transformedVector = rive.mapXY(invertedMatrix, canvasCoordinatesVector);
            var transformedX = transformedVector.x();
            var transformedY = transformedVector.y();
            coordinateSet.transformedX = transformedX;
            coordinateSet.transformedY = transformedY;
            transformedVector.delete();
            canvasCoordinatesVector.delete();
        });
        invertedMatrix.delete();
        forwardMatrix.delete();
        switch (event.type) {
            /**
             * There's a 2px buffer for a hitRadius when translating the pointer coordinates
             * down to the state machine. In cases where the hitbox is about that much away
             * from the Artboard border, we don't have exact precision on determining pointer
             * exit. We're therefore adding to the translated coordinates on mouseout of a canvas
             * to ensure that we report the mouse has truly exited the hitarea.
             * https://github.com/rive-app/rive-cpp/blob/master/src/animation/state_machine_instance.cpp#L336
             *
             */
            case "mouseout":
                var _loop_1 = function (stateMachine) {
                    if (dispatchPointerExit) {
                        coordinateSets.forEach(function (coordinateSet) {
                            stateMachine.pointerExit(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                        });
                    }
                    else {
                        coordinateSets.forEach(function (coordinateSet) {
                            stateMachine.pointerMove(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                        });
                    }
                };
                for (var _i = 0, stateMachines_1 = stateMachines; _i < stateMachines_1.length; _i++) {
                    var stateMachine = stateMachines_1[_i];
                    _loop_1(stateMachine);
                }
                break;
            // Pointer moving/hovering on the canvas
            case "touchmove":
            case "mouseover":
            case "mousemove": {
                var _loop_2 = function (stateMachine) {
                    coordinateSets.forEach(function (coordinateSet) {
                        stateMachine.pointerMove(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                    });
                };
                for (var _a = 0, stateMachines_2 = stateMachines; _a < stateMachines_2.length; _a++) {
                    var stateMachine = stateMachines_2[_a];
                    _loop_2(stateMachine);
                }
                break;
            }
            // Pointer click initiated but not released yet on the canvas
            case "touchstart":
            case "mousedown": {
                var _loop_3 = function (stateMachine) {
                    coordinateSets.forEach(function (coordinateSet) {
                        stateMachine.pointerDown(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                    });
                };
                for (var _b = 0, stateMachines_3 = stateMachines; _b < stateMachines_3.length; _b++) {
                    var stateMachine = stateMachines_3[_b];
                    _loop_3(stateMachine);
                }
                break;
            }
            // Pointer click released on the canvas
            case "touchend": {
                var _loop_4 = function (stateMachine) {
                    coordinateSets.forEach(function (coordinateSet) {
                        stateMachine.pointerUp(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                        stateMachine.pointerExit(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                    });
                };
                for (var _c = 0, stateMachines_4 = stateMachines; _c < stateMachines_4.length; _c++) {
                    var stateMachine = stateMachines_4[_c];
                    _loop_4(stateMachine);
                }
                break;
            }
            case "mouseup": {
                var _loop_5 = function (stateMachine) {
                    coordinateSets.forEach(function (coordinateSet) {
                        stateMachine.pointerUp(coordinateSet.transformedX, coordinateSet.transformedY, coordinateSet.identifier);
                    });
                };
                for (var _d = 0, stateMachines_5 = stateMachines; _d < stateMachines_5.length; _d++) {
                    var stateMachine = stateMachines_5[_d];
                    _loop_5(stateMachine);
                }
                break;
            }
            default:
        }
    };
    var callback = processEventCallback.bind(_this);
    canvas.addEventListener("mouseover", callback);
    canvas.addEventListener("mouseout", callback);
    canvas.addEventListener("mousemove", callback);
    canvas.addEventListener("mousedown", callback);
    canvas.addEventListener("mouseup", callback);
    canvas.addEventListener("touchmove", callback, {
        passive: isTouchScrollEnabled,
    });
    canvas.addEventListener("touchstart", callback, {
        passive: isTouchScrollEnabled,
    });
    canvas.addEventListener("touchend", callback);
    return function () {
        canvas.removeEventListener("mouseover", callback);
        canvas.removeEventListener("mouseout", callback);
        canvas.removeEventListener("mousemove", callback);
        canvas.removeEventListener("mousedown", callback);
        canvas.removeEventListener("mouseup", callback);
        canvas.removeEventListener("touchmove", callback);
        canvas.removeEventListener("touchstart", callback);
        canvas.removeEventListener("touchend", callback);
    };
};


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BLANK_URL: () => (/* binding */ BLANK_URL),
/* harmony export */   sanitizeUrl: () => (/* binding */ sanitizeUrl)
/* harmony export */ });
// Reference: https://github.com/braintree/sanitize-url/tree/main
var invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
var htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
var htmlCtrlEntityRegex = /&(newline|tab);/gi;
var ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
var urlSchemeRegex = /^.+(:|&colon;)/gim;
var relativeFirstCharacters = [".", "/"];
var BLANK_URL = "about:blank";
function isRelativeUrlWithoutProtocol(url) {
    return relativeFirstCharacters.indexOf(url[0]) > -1;
}
// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str) {
    var removedNullByte = str.replace(ctrlCharactersRegex, "");
    return removedNullByte.replace(htmlEntitiesRegex, function (match, dec) {
        return String.fromCharCode(dec);
    });
}
function sanitizeUrl(url) {
    if (!url) {
        return BLANK_URL;
    }
    var sanitizedUrl = decodeHtmlCharacters(url)
        .replace(htmlCtrlEntityRegex, "")
        .replace(ctrlCharactersRegex, "")
        .trim();
    if (!sanitizedUrl) {
        return BLANK_URL;
    }
    if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl;
    }
    var urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
    if (!urlSchemeParseResults) {
        return sanitizedUrl;
    }
    var urlScheme = urlSchemeParseResults[0];
    if (invalidProtocolRegex.test(urlScheme)) {
        return BLANK_URL;
    }
    return sanitizedUrl;
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioAssetWrapper: () => (/* binding */ AudioAssetWrapper),
/* harmony export */   AudioWrapper: () => (/* binding */ AudioWrapper),
/* harmony export */   CustomFileAssetLoaderWrapper: () => (/* binding */ CustomFileAssetLoaderWrapper),
/* harmony export */   FileAssetWrapper: () => (/* binding */ FileAssetWrapper),
/* harmony export */   FileFinalizer: () => (/* binding */ FileFinalizer),
/* harmony export */   FontAssetWrapper: () => (/* binding */ FontAssetWrapper),
/* harmony export */   FontWrapper: () => (/* binding */ FontWrapper),
/* harmony export */   ImageAssetWrapper: () => (/* binding */ ImageAssetWrapper),
/* harmony export */   ImageWrapper: () => (/* binding */ ImageWrapper),
/* harmony export */   createFinalization: () => (/* binding */ createFinalization),
/* harmony export */   finalizationRegistry: () => (/* binding */ finalizationRegistry)
/* harmony export */ });
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FileFinalizer = /** @class */ (function () {
    function FileFinalizer(file) {
        this.selfUnref = false;
        this._file = file;
    }
    FileFinalizer.prototype.unref = function () {
        if (this._file) {
            this._file.unref();
        }
    };
    return FileFinalizer;
}());
var ObjectFinalizer = /** @class */ (function () {
    function ObjectFinalizer(finalizableObject) {
        this._finalizableObject = finalizableObject;
    }
    ObjectFinalizer.prototype.unref = function () {
        this._finalizableObject.unref();
    };
    return ObjectFinalizer;
}());
var AssetWrapper = /** @class */ (function () {
    function AssetWrapper() {
        this.selfUnref = false;
    }
    AssetWrapper.prototype.unref = function () { };
    return AssetWrapper;
}());
var ImageWrapper = /** @class */ (function (_super) {
    __extends(ImageWrapper, _super);
    function ImageWrapper(image) {
        var _this = _super.call(this) || this;
        _this._nativeImage = image;
        return _this;
    }
    Object.defineProperty(ImageWrapper.prototype, "nativeImage", {
        get: function () {
            return this._nativeImage;
        },
        enumerable: false,
        configurable: true
    });
    ImageWrapper.prototype.unref = function () {
        if (this.selfUnref) {
            this._nativeImage.unref();
        }
    };
    return ImageWrapper;
}(AssetWrapper));
var AudioWrapper = /** @class */ (function (_super) {
    __extends(AudioWrapper, _super);
    function AudioWrapper(audio) {
        var _this = _super.call(this) || this;
        _this._nativeAudio = audio;
        return _this;
    }
    Object.defineProperty(AudioWrapper.prototype, "nativeAudio", {
        get: function () {
            return this._nativeAudio;
        },
        enumerable: false,
        configurable: true
    });
    AudioWrapper.prototype.unref = function () {
        if (this.selfUnref) {
            this._nativeAudio.unref();
        }
    };
    return AudioWrapper;
}(AssetWrapper));
var FontWrapper = /** @class */ (function (_super) {
    __extends(FontWrapper, _super);
    function FontWrapper(font) {
        var _this = _super.call(this) || this;
        _this._nativeFont = font;
        return _this;
    }
    Object.defineProperty(FontWrapper.prototype, "nativeFont", {
        get: function () {
            return this._nativeFont;
        },
        enumerable: false,
        configurable: true
    });
    FontWrapper.prototype.unref = function () {
        if (this.selfUnref) {
            this._nativeFont.unref();
        }
    };
    return FontWrapper;
}(AssetWrapper));
var CustomFileAssetLoaderWrapper = /** @class */ (function () {
    function CustomFileAssetLoaderWrapper(runtime, loaderCallback) {
        this._assetLoaderCallback = loaderCallback;
        this.assetLoader = new runtime.CustomFileAssetLoader({
            loadContents: this.loadContents.bind(this),
        });
    }
    CustomFileAssetLoaderWrapper.prototype.loadContents = function (asset, bytes) {
        var assetWrapper;
        if (asset.isImage) {
            assetWrapper = new ImageAssetWrapper(asset);
        }
        else if (asset.isAudio) {
            assetWrapper = new AudioAssetWrapper(asset);
        }
        else if (asset.isFont) {
            assetWrapper = new FontAssetWrapper(asset);
        }
        return this._assetLoaderCallback(assetWrapper, bytes);
    };
    return CustomFileAssetLoaderWrapper;
}());
/**
 * Rive class representing a FileAsset with relevant metadata fields to describe
 * an asset associated wtih the Rive File
 */
var FileAssetWrapper = /** @class */ (function () {
    function FileAssetWrapper(nativeAsset) {
        this._nativeFileAsset = nativeAsset;
    }
    FileAssetWrapper.prototype.decode = function (bytes) {
        this._nativeFileAsset.decode(bytes);
    };
    Object.defineProperty(FileAssetWrapper.prototype, "name", {
        get: function () {
            return this._nativeFileAsset.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "fileExtension", {
        get: function () {
            return this._nativeFileAsset.fileExtension;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "uniqueFilename", {
        get: function () {
            return this._nativeFileAsset.uniqueFilename;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "isAudio", {
        get: function () {
            return this._nativeFileAsset.isAudio;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "isImage", {
        get: function () {
            return this._nativeFileAsset.isImage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "isFont", {
        get: function () {
            return this._nativeFileAsset.isFont;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "cdnUuid", {
        get: function () {
            return this._nativeFileAsset.cdnUuid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileAssetWrapper.prototype, "nativeFileAsset", {
        get: function () {
            return this._nativeFileAsset;
        },
        enumerable: false,
        configurable: true
    });
    return FileAssetWrapper;
}());
/**
 * Rive class extending the FileAsset that exposes a `setRenderImage()` API with a
 * decoded Image (via the `decodeImage()` API) to set a new Image on the Rive FileAsset
 */
var ImageAssetWrapper = /** @class */ (function (_super) {
    __extends(ImageAssetWrapper, _super);
    function ImageAssetWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageAssetWrapper.prototype.setRenderImage = function (image) {
        this._nativeFileAsset.setRenderImage(image.nativeImage);
    };
    return ImageAssetWrapper;
}(FileAssetWrapper));
/**
 * Rive class extending the FileAsset that exposes a `setAudioSource()` API with a
 * decoded Audio (via the `decodeAudio()` API) to set a new Audio on the Rive FileAsset
 */
var AudioAssetWrapper = /** @class */ (function (_super) {
    __extends(AudioAssetWrapper, _super);
    function AudioAssetWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AudioAssetWrapper.prototype.setAudioSource = function (audio) {
        this._nativeFileAsset.setAudioSource(audio.nativeAudio);
    };
    return AudioAssetWrapper;
}(FileAssetWrapper));
/**
 * Rive class extending the FileAsset that exposes a `setFont()` API with a
 * decoded Font (via the `decodeFont()` API) to set a new Font on the Rive FileAsset
 */
var FontAssetWrapper = /** @class */ (function (_super) {
    __extends(FontAssetWrapper, _super);
    function FontAssetWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FontAssetWrapper.prototype.setFont = function (font) {
        this._nativeFileAsset.setFont(font.nativeFont);
    };
    return FontAssetWrapper;
}(FileAssetWrapper));
var FakeFinalizationRegistry = /** @class */ (function () {
    function FakeFinalizationRegistry(_) {
    }
    FakeFinalizationRegistry.prototype.register = function (object) {
        object.selfUnref = true;
    };
    FakeFinalizationRegistry.prototype.unregister = function (_) { };
    return FakeFinalizationRegistry;
}());
var MyFinalizationRegistry = typeof FinalizationRegistry !== "undefined"
    ? FinalizationRegistry
    : FakeFinalizationRegistry;
var finalizationRegistry = new MyFinalizationRegistry(function (ob) {
    ob === null || ob === void 0 ? void 0 : ob.unref();
});
var createFinalization = function (target, finalizable) {
    var finalizer = new ObjectFinalizer(finalizable);
    finalizationRegistry.register(target, finalizer);
};



/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alignment: () => (/* binding */ Alignment),
/* harmony export */   DataEnum: () => (/* binding */ DataEnum),
/* harmony export */   EventType: () => (/* binding */ EventType),
/* harmony export */   Fit: () => (/* binding */ Fit),
/* harmony export */   Layout: () => (/* binding */ Layout),
/* harmony export */   LoopType: () => (/* binding */ LoopType),
/* harmony export */   Rive: () => (/* binding */ Rive),
/* harmony export */   RiveEventType: () => (/* binding */ RiveEventType),
/* harmony export */   RiveFile: () => (/* binding */ RiveFile),
/* harmony export */   RuntimeLoader: () => (/* binding */ RuntimeLoader),
/* harmony export */   StateMachineInput: () => (/* binding */ StateMachineInput),
/* harmony export */   StateMachineInputType: () => (/* binding */ StateMachineInputType),
/* harmony export */   Testing: () => (/* binding */ Testing),
/* harmony export */   ViewModel: () => (/* binding */ ViewModel),
/* harmony export */   ViewModelInstance: () => (/* binding */ ViewModelInstance),
/* harmony export */   ViewModelInstanceArtboard: () => (/* binding */ ViewModelInstanceArtboard),
/* harmony export */   ViewModelInstanceAssetImage: () => (/* binding */ ViewModelInstanceAssetImage),
/* harmony export */   ViewModelInstanceBoolean: () => (/* binding */ ViewModelInstanceBoolean),
/* harmony export */   ViewModelInstanceColor: () => (/* binding */ ViewModelInstanceColor),
/* harmony export */   ViewModelInstanceEnum: () => (/* binding */ ViewModelInstanceEnum),
/* harmony export */   ViewModelInstanceList: () => (/* binding */ ViewModelInstanceList),
/* harmony export */   ViewModelInstanceNumber: () => (/* binding */ ViewModelInstanceNumber),
/* harmony export */   ViewModelInstanceString: () => (/* binding */ ViewModelInstanceString),
/* harmony export */   ViewModelInstanceTrigger: () => (/* binding */ ViewModelInstanceTrigger),
/* harmony export */   ViewModelInstanceValue: () => (/* binding */ ViewModelInstanceValue),
/* harmony export */   decodeAudio: () => (/* binding */ decodeAudio),
/* harmony export */   decodeFont: () => (/* binding */ decodeFont),
/* harmony export */   decodeImage: () => (/* binding */ decodeImage)
/* harmony export */ });
/* harmony import */ var _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var package_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _animation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};




var RiveError = /** @class */ (function (_super) {
    __extends(RiveError, _super);
    function RiveError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isHandledError = true;
        return _this;
    }
    return RiveError;
}(Error));
// #regions helpers
var resolveErrorMessage = function (error) {
    return error && error.isHandledError
        ? error.message
        : "Problem loading file; may be corrupt!";
};
// #region layout
// Fit options for the canvas
var Fit;
(function (Fit) {
    Fit["Cover"] = "cover";
    Fit["Contain"] = "contain";
    Fit["Fill"] = "fill";
    Fit["FitWidth"] = "fitWidth";
    Fit["FitHeight"] = "fitHeight";
    Fit["None"] = "none";
    Fit["ScaleDown"] = "scaleDown";
    Fit["Layout"] = "layout";
})(Fit || (Fit = {}));
// Alignment options for the canvas
var Alignment;
(function (Alignment) {
    Alignment["Center"] = "center";
    Alignment["TopLeft"] = "topLeft";
    Alignment["TopCenter"] = "topCenter";
    Alignment["TopRight"] = "topRight";
    Alignment["CenterLeft"] = "centerLeft";
    Alignment["CenterRight"] = "centerRight";
    Alignment["BottomLeft"] = "bottomLeft";
    Alignment["BottomCenter"] = "bottomCenter";
    Alignment["BottomRight"] = "bottomRight";
})(Alignment || (Alignment = {}));
// Alignment options for Rive animations in a HTML canvas
var Layout = /** @class */ (function () {
    function Layout(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.fit = (_a = params === null || params === void 0 ? void 0 : params.fit) !== null && _a !== void 0 ? _a : Fit.Contain;
        this.alignment = (_b = params === null || params === void 0 ? void 0 : params.alignment) !== null && _b !== void 0 ? _b : Alignment.Center;
        this.layoutScaleFactor = (_c = params === null || params === void 0 ? void 0 : params.layoutScaleFactor) !== null && _c !== void 0 ? _c : 1;
        this.minX = (_d = params === null || params === void 0 ? void 0 : params.minX) !== null && _d !== void 0 ? _d : 0;
        this.minY = (_e = params === null || params === void 0 ? void 0 : params.minY) !== null && _e !== void 0 ? _e : 0;
        this.maxX = (_f = params === null || params === void 0 ? void 0 : params.maxX) !== null && _f !== void 0 ? _f : 0;
        this.maxY = (_g = params === null || params === void 0 ? void 0 : params.maxY) !== null && _g !== void 0 ? _g : 0;
    }
    // Alternative constructor to build a Layout from an interface/object
    Layout.new = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        console.warn("This function is deprecated: please use `new Layout({})` instead");
        return new Layout({ fit: fit, alignment: alignment, minX: minX, minY: minY, maxX: maxX, maxY: maxY });
    };
    /**
     * Makes a copy of the layout, replacing any specified parameters
     */
    Layout.prototype.copyWith = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, layoutScaleFactor = _a.layoutScaleFactor, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        return new Layout({
            fit: fit !== null && fit !== void 0 ? fit : this.fit,
            alignment: alignment !== null && alignment !== void 0 ? alignment : this.alignment,
            layoutScaleFactor: layoutScaleFactor !== null && layoutScaleFactor !== void 0 ? layoutScaleFactor : this.layoutScaleFactor,
            minX: minX !== null && minX !== void 0 ? minX : this.minX,
            minY: minY !== null && minY !== void 0 ? minY : this.minY,
            maxX: maxX !== null && maxX !== void 0 ? maxX : this.maxX,
            maxY: maxY !== null && maxY !== void 0 ? maxY : this.maxY,
        });
    };
    // Returns fit for the Wasm runtime format
    Layout.prototype.runtimeFit = function (rive) {
        if (this.cachedRuntimeFit)
            return this.cachedRuntimeFit;
        var fit;
        if (this.fit === Fit.Cover)
            fit = rive.Fit.cover;
        else if (this.fit === Fit.Contain)
            fit = rive.Fit.contain;
        else if (this.fit === Fit.Fill)
            fit = rive.Fit.fill;
        else if (this.fit === Fit.FitWidth)
            fit = rive.Fit.fitWidth;
        else if (this.fit === Fit.FitHeight)
            fit = rive.Fit.fitHeight;
        else if (this.fit === Fit.ScaleDown)
            fit = rive.Fit.scaleDown;
        else if (this.fit === Fit.Layout)
            fit = rive.Fit.layout;
        else
            fit = rive.Fit.none;
        this.cachedRuntimeFit = fit;
        return fit;
    };
    // Returns alignment for the Wasm runtime format
    Layout.prototype.runtimeAlignment = function (rive) {
        if (this.cachedRuntimeAlignment)
            return this.cachedRuntimeAlignment;
        var alignment;
        if (this.alignment === Alignment.TopLeft)
            alignment = rive.Alignment.topLeft;
        else if (this.alignment === Alignment.TopCenter)
            alignment = rive.Alignment.topCenter;
        else if (this.alignment === Alignment.TopRight)
            alignment = rive.Alignment.topRight;
        else if (this.alignment === Alignment.CenterLeft)
            alignment = rive.Alignment.centerLeft;
        else if (this.alignment === Alignment.CenterRight)
            alignment = rive.Alignment.centerRight;
        else if (this.alignment === Alignment.BottomLeft)
            alignment = rive.Alignment.bottomLeft;
        else if (this.alignment === Alignment.BottomCenter)
            alignment = rive.Alignment.bottomCenter;
        else if (this.alignment === Alignment.BottomRight)
            alignment = rive.Alignment.bottomRight;
        else
            alignment = rive.Alignment.center;
        this.cachedRuntimeAlignment = alignment;
        return alignment;
    };
    return Layout;
}());

// Runtime singleton; use getInstance to provide a callback that returns the
// Rive runtime
var RuntimeLoader = /** @class */ (function () {
    // Class is never instantiated
    function RuntimeLoader() {
    }
    // Loads the runtime
    RuntimeLoader.loadRuntime = function () {
        _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            // Loads Wasm bundle
            locateFile: function () { return RuntimeLoader.wasmURL; },
        })
            .then(function (rive) {
            var _a;
            RuntimeLoader.runtime = rive;
            // Fire all the callbacks
            while (RuntimeLoader.callBackQueue.length > 0) {
                (_a = RuntimeLoader.callBackQueue.shift()) === null || _a === void 0 ? void 0 : _a(RuntimeLoader.runtime);
            }
        })
            .catch(function (error) {
            // Capture specific error details
            var errorDetails = {
                message: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
                type: (error === null || error === void 0 ? void 0 : error.name) || "Error",
                // Some browsers may provide additional WebAssembly-specific details
                wasmError: error instanceof WebAssembly.CompileError ||
                    error instanceof WebAssembly.RuntimeError,
                originalError: error,
            };
            // Log detailed error for debugging
            console.debug("Rive WASM load error details:", errorDetails);
            // In case unpkg fails, or the wasm was not supported, we try to load the fallback module from jsdelivr.
            // This `rive_fallback.wasm` is compiled to support older architecture.
            // TODO: (Gordon): preemptively test browser support and load the correct wasm file. Then use jsdelvr only if unpkg fails.
            var backupJsdelivrUrl = "https://cdn.jsdelivr.net/npm/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive_fallback.wasm");
            if (RuntimeLoader.wasmURL.toLowerCase() !== backupJsdelivrUrl) {
                console.warn("Failed to load WASM from ".concat(RuntimeLoader.wasmURL, " (").concat(errorDetails.message, "), trying jsdelivr as a backup"));
                RuntimeLoader.setWasmUrl(backupJsdelivrUrl);
                RuntimeLoader.loadRuntime();
            }
            else {
                var errorMessage = [
                    "Could not load Rive WASM file from ".concat(RuntimeLoader.wasmURL, " or ").concat(backupJsdelivrUrl, "."),
                    "Possible reasons:",
                    "- Network connection is down",
                    "- WebAssembly is not supported in this environment",
                    "- The WASM file is corrupted or incompatible",
                    "\nError details:",
                    "- Type: ".concat(errorDetails.type),
                    "- Message: ".concat(errorDetails.message),
                    "- WebAssembly-specific error: ".concat(errorDetails.wasmError),
                    "\nTo resolve, you may need to:",
                    "1. Check your network connection",
                    "2. Set a new WASM source via RuntimeLoader.setWasmUrl()",
                    "3. Call RuntimeLoader.loadRuntime() again",
                ].join("\n");
                console.error(errorMessage);
            }
        });
    };
    // Provides a runtime instance via a callback
    RuntimeLoader.getInstance = function (callback) {
        // If it's not loading, start loading runtime
        if (!RuntimeLoader.isLoading) {
            RuntimeLoader.isLoading = true;
            RuntimeLoader.loadRuntime();
        }
        if (!RuntimeLoader.runtime) {
            RuntimeLoader.callBackQueue.push(callback);
        }
        else {
            callback(RuntimeLoader.runtime);
        }
    };
    // Provides a runtime instance via a promise
    RuntimeLoader.awaitInstance = function () {
        return new Promise(function (resolve) {
            return RuntimeLoader.getInstance(function (rive) { return resolve(rive); });
        });
    };
    // Manually sets the wasm url
    RuntimeLoader.setWasmUrl = function (url) {
        RuntimeLoader.wasmURL = url;
    };
    // Gets the current wasm url
    RuntimeLoader.getWasmUrl = function () {
        return RuntimeLoader.wasmURL;
    };
    // Flag to indicate that loading has started/completed
    RuntimeLoader.isLoading = false;
    // List of callbacks for the runtime that come in while loading
    RuntimeLoader.callBackQueue = [];
    // Path to the Wasm file; default path works for testing only;
    // if embedded wasm is used then this is never used.
    RuntimeLoader.wasmURL = "https://unpkg.com/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive.wasm");
    return RuntimeLoader;
}());

// #endregion
// #region state machines
var StateMachineInputType;
(function (StateMachineInputType) {
    StateMachineInputType[StateMachineInputType["Number"] = 56] = "Number";
    StateMachineInputType[StateMachineInputType["Trigger"] = 58] = "Trigger";
    StateMachineInputType[StateMachineInputType["Boolean"] = 59] = "Boolean";
})(StateMachineInputType || (StateMachineInputType = {}));
/**
 * An input for a state machine
 */
var StateMachineInput = /** @class */ (function () {
    function StateMachineInput(type, runtimeInput) {
        this.type = type;
        this.runtimeInput = runtimeInput;
    }
    Object.defineProperty(StateMachineInput.prototype, "name", {
        /**
         * Returns the name of the input
         */
        get: function () {
            return this.runtimeInput.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachineInput.prototype, "value", {
        /**
         * Returns the current value of the input
         */
        get: function () {
            return this.runtimeInput.value;
        },
        /**
         * Sets the value of the input
         */
        set: function (value) {
            this.runtimeInput.value = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Fires a trigger; does nothing on Number or Boolean input types
     */
    StateMachineInput.prototype.fire = function () {
        if (this.type === StateMachineInputType.Trigger) {
            this.runtimeInput.fire();
        }
    };
    /**
     * Deletes the input
     */
    StateMachineInput.prototype.delete = function () {
        this.runtimeInput = null;
    };
    return StateMachineInput;
}());

var RiveEventType;
(function (RiveEventType) {
    RiveEventType[RiveEventType["General"] = 128] = "General";
    RiveEventType[RiveEventType["OpenUrl"] = 131] = "OpenUrl";
})(RiveEventType || (RiveEventType = {}));
var BaseArtboard = /** @class */ (function () {
    function BaseArtboard(_isBindableArtboard) {
        this.isBindableArtboard = false;
        this.isBindableArtboard = _isBindableArtboard;
    }
    return BaseArtboard;
}());
var Artboard = /** @class */ (function (_super) {
    __extends(Artboard, _super);
    function Artboard(artboard, _file) {
        var _this = _super.call(this, false) || this;
        _this.nativeArtboard = artboard;
        _this.file = _file;
        return _this;
    }
    return Artboard;
}(BaseArtboard));
var BindableArtboard = /** @class */ (function (_super) {
    __extends(BindableArtboard, _super);
    function BindableArtboard(artboard) {
        var _this = _super.call(this, true) || this;
        _this.selfUnref = false;
        _this.nativeArtboard = artboard;
        return _this;
    }
    BindableArtboard.prototype.destroy = function () {
        if (this.selfUnref) {
            this.nativeArtboard.unref();
        }
    };
    return BindableArtboard;
}(BaseArtboard));
var StateMachine = /** @class */ (function () {
    /**
     * @constructor
     * @param stateMachine runtime state machine object
     * @param instance runtime state machine instance object
     */
    function StateMachine(stateMachine, runtime, playing, artboard) {
        this.stateMachine = stateMachine;
        this.playing = playing;
        this.artboard = artboard;
        /**
         * Caches the inputs from the runtime
         */
        this.inputs = [];
        this.instance = new runtime.StateMachineInstance(stateMachine, artboard);
        this.initInputs(runtime);
    }
    Object.defineProperty(StateMachine.prototype, "name", {
        get: function () {
            return this.stateMachine.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "statesChanged", {
        /**
         * Returns a list of state names that have changed on this frame
         */
        get: function () {
            var names = [];
            for (var i = 0; i < this.instance.stateChangedCount(); i++) {
                names.push(this.instance.stateChangedNameByIndex(i));
            }
            return names;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the state machine instance by a given time.
     * @param time - the time to advance the animation by in seconds
     */
    StateMachine.prototype.advance = function (time) {
        this.instance.advance(time);
    };
    /**
     * Advances the state machine instance by a given time and apply changes to artboard.
     * @param time - the time to advance the animation by in seconds
     */
    StateMachine.prototype.advanceAndApply = function (time) {
        this.instance.advanceAndApply(time);
    };
    /**
     * Returns the number of events reported from the last advance call
     * @returns Number of events reported
     */
    StateMachine.prototype.reportedEventCount = function () {
        return this.instance.reportedEventCount();
    };
    /**
     * Returns a RiveEvent object emitted from the last advance call at the given index
     * of a list of potentially multiple events. If an event at the index is not found,
     * undefined is returned.
     * @param i index of the event reported in a list of potentially multiple events
     * @returns RiveEvent or extended RiveEvent object returned, or undefined
     */
    StateMachine.prototype.reportedEventAt = function (i) {
        return this.instance.reportedEventAt(i);
    };
    /**
     * Fetches references to the state machine's inputs and caches them
     * @param runtime an instance of the runtime; needed for the SMIInput types
     */
    StateMachine.prototype.initInputs = function (runtime) {
        // Fetch the inputs from the runtime if we don't have them
        for (var i = 0; i < this.instance.inputCount(); i++) {
            var input = this.instance.input(i);
            this.inputs.push(this.mapRuntimeInput(input, runtime));
        }
    };
    /**
     * Maps a runtime input to it's appropriate type
     * @param input
     */
    StateMachine.prototype.mapRuntimeInput = function (input, runtime) {
        if (input.type === runtime.SMIInput.bool) {
            return new StateMachineInput(StateMachineInputType.Boolean, input.asBool());
        }
        else if (input.type === runtime.SMIInput.number) {
            return new StateMachineInput(StateMachineInputType.Number, input.asNumber());
        }
        else if (input.type === runtime.SMIInput.trigger) {
            return new StateMachineInput(StateMachineInputType.Trigger, input.asTrigger());
        }
    };
    /**
     * Deletes the backing Wasm state machine instance; once this is called, this
     * state machine is no more.
     */
    StateMachine.prototype.cleanup = function () {
        this.inputs.forEach(function (input) {
            input.delete();
        });
        this.inputs.length = 0;
        this.instance.delete();
    };
    StateMachine.prototype.bindViewModelInstance = function (viewModelInstance) {
        if (viewModelInstance.runtimeInstance != null) {
            this.instance.bindViewModelInstance(viewModelInstance.runtimeInstance);
        }
    };
    return StateMachine;
}());
// #endregion
// #region animator
/**
 * Manages animation
 */
var Animator = /** @class */ (function () {
    /**
     * Constructs a new animator
     * @constructor
     * @param runtime Rive runtime; needed to instance animations & state machines
     * @param artboard the artboard that holds all animations and state machines
     * @param animations optional list of animations
     * @param stateMachines optional list of state machines
     */
    function Animator(runtime, artboard, eventManager, animations, stateMachines) {
        if (animations === void 0) { animations = []; }
        if (stateMachines === void 0) { stateMachines = []; }
        this.runtime = runtime;
        this.artboard = artboard;
        this.eventManager = eventManager;
        this.animations = animations;
        this.stateMachines = stateMachines;
    }
    /**
     * Adds animations and state machines by their names. If names are shared
     * between animations & state machines, then the first one found will be
     * created. Best not to use the same names for these in your Rive file.
     * @param animatable the name(s) of animations and state machines to add
     * @returns a list of names of the playing animations and state machines
     */
    Animator.prototype.add = function (animatables, playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        animatables = mapToStringArray(animatables);
        // If animatables is empty, play or pause everything
        if (animatables.length === 0) {
            this.animations.forEach(function (a) { return (a.playing = playing); });
            this.stateMachines.forEach(function (m) { return (m.playing = playing); });
        }
        else {
            // Play/pause already instanced items, or create new instances
            var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
            var instancedMachineNames = this.stateMachines.map(function (m) { return m.name; });
            for (var i = 0; i < animatables.length; i++) {
                var aIndex = instancedAnimationNames.indexOf(animatables[i]);
                var mIndex = instancedMachineNames.indexOf(animatables[i]);
                if (aIndex >= 0 || mIndex >= 0) {
                    if (aIndex >= 0) {
                        // Animation is instanced, play/pause it
                        this.animations[aIndex].playing = playing;
                    }
                    else {
                        // State machine is instanced, play/pause it
                        this.stateMachines[mIndex].playing = playing;
                    }
                }
                else {
                    // Try to create a new animation instance
                    var anim = this.artboard.animationByName(animatables[i]);
                    if (anim) {
                        var newAnimation = new _animation__WEBPACK_IMPORTED_MODULE_2__.Animation(anim, this.artboard, this.runtime, playing);
                        // Display the first frame of the specified animation
                        newAnimation.advance(0);
                        newAnimation.apply(1.0);
                        this.animations.push(newAnimation);
                    }
                    else {
                        // Try to create a new state machine instance
                        var sm = this.artboard.stateMachineByName(animatables[i]);
                        if (sm) {
                            var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                            this.stateMachines.push(newStateMachine);
                        }
                    }
                }
            }
        }
        // Fire play/paused events for animations
        if (fireEvent) {
            if (playing) {
                this.eventManager.fire({
                    type: EventType.Play,
                    data: this.playing,
                });
            }
            else {
                this.eventManager.fire({
                    type: EventType.Pause,
                    data: this.paused,
                });
            }
        }
        return playing ? this.playing : this.paused;
    };
    /**
     * Adds linear animations by their names.
     * @param animatables the name(s) of animations to add
     * @param playing whether animations should play on instantiation
     */
    Animator.prototype.initLinearAnimations = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedAnimationNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.animations[aIndex].playing = playing;
            }
            else {
                // Try to create a new animation instance
                var anim = this.artboard.animationByName(animatables[i]);
                if (anim) {
                    var newAnimation = new _animation__WEBPACK_IMPORTED_MODULE_2__.Animation(anim, this.artboard, this.runtime, playing);
                    // Display the first frame of the specified animation
                    newAnimation.advance(0);
                    newAnimation.apply(1.0);
                    this.animations.push(newAnimation);
                }
                else {
                    console.error("Animation with name ".concat(animatables[i], " not found."));
                }
            }
        }
    };
    /**
     * Adds state machines by their names.
     * @param animatables the name(s) of state machines to add
     * @param playing whether state machines should play on instantiation
     */
    Animator.prototype.initStateMachines = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedStateMachineNames = this.stateMachines.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedStateMachineNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.stateMachines[aIndex].playing = playing;
            }
            else {
                // Try to create a new state machine instance
                var sm = this.artboard.stateMachineByName(animatables[i]);
                if (sm) {
                    var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                    this.stateMachines.push(newStateMachine);
                }
                else {
                    console.warn("State Machine with name ".concat(animatables[i], " not found."));
                    // In order to maintain compatibility with current behavior, if a state machine is not found
                    // we look for an animation with the same name
                    this.initLinearAnimations([animatables[i]], playing);
                }
            }
        }
    };
    /**
     * Play the named animations/state machines
     * @param animatables the names of the animations/machines to play; plays all if empty
     * @returns a list of the playing items
     */
    Animator.prototype.play = function (animatables) {
        return this.add(animatables, true);
    };
    /**
     * Advance state machines if they are paused after initialization
     */
    Animator.prototype.advanceIfPaused = function () {
        this.stateMachines.forEach(function (sm) {
            if (!sm.playing) {
                sm.advanceAndApply(0);
            }
        });
    };
    /**
     * Pauses named animations and state machines, or everything if nothing is
     * specified
     * @param animatables names of the animations and state machines to pause
     * @returns a list of names of the animations and state machines paused
     */
    Animator.prototype.pause = function (animatables) {
        return this.add(animatables, false);
    };
    /**
     * Set time of named animations
     * @param animations names of the animations to scrub
     * @param value time scrub value, a floating point number to which the playhead is jumped
     * @returns a list of names of the animations that were scrubbed
     */
    Animator.prototype.scrub = function (animatables, value) {
        var forScrubbing = this.animations.filter(function (a) {
            return animatables.includes(a.name);
        });
        forScrubbing.forEach(function (a) { return (a.scrubTo = value); });
        return forScrubbing.map(function (a) { return a.name; });
    };
    Object.defineProperty(Animator.prototype, "playing", {
        /**
         * Returns a list of names of all animations and state machines currently
         * playing
         */
        get: function () {
            return this.animations
                .filter(function (a) { return a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "paused", {
        /**
         * Returns a list of names of all animations and state machines currently
         * paused
         */
        get: function () {
            return this.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return !m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stops and removes all named animations and state machines
     * @param animatables animations and state machines to remove
     * @returns a list of names of removed items
     */
    Animator.prototype.stop = function (animatables) {
        var _this = this;
        animatables = mapToStringArray(animatables);
        // If nothing's specified, wipe them out, all of them
        var removedNames = [];
        // Stop everything
        if (animatables.length === 0) {
            removedNames = this.animations
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.map(function (m) { return m.name; }));
            // Clean up before emptying the arrays
            this.animations.forEach(function (a) { return a.cleanup(); });
            this.stateMachines.forEach(function (m) { return m.cleanup(); });
            // Empty out the arrays
            this.animations.splice(0, this.animations.length);
            this.stateMachines.splice(0, this.stateMachines.length);
        }
        else {
            // Remove only the named animations/state machines
            var animationsToRemove = this.animations.filter(function (a) {
                return animatables.includes(a.name);
            });
            animationsToRemove.forEach(function (a) {
                a.cleanup();
                _this.animations.splice(_this.animations.indexOf(a), 1);
            });
            var machinesToRemove = this.stateMachines.filter(function (m) {
                return animatables.includes(m.name);
            });
            machinesToRemove.forEach(function (m) {
                m.cleanup();
                _this.stateMachines.splice(_this.stateMachines.indexOf(m), 1);
            });
            removedNames = animationsToRemove
                .map(function (a) { return a.name; })
                .concat(machinesToRemove.map(function (m) { return m.name; }));
        }
        this.eventManager.fire({
            type: EventType.Stop,
            data: removedNames,
        });
        // Return the list of animations removed
        return removedNames;
    };
    Object.defineProperty(Animator.prototype, "isPlaying", {
        /**
         * Returns true if at least one animation is active
         */
        get: function () {
            return (this.animations.reduce(function (acc, curr) { return acc || curr.playing; }, false) ||
                this.stateMachines.reduce(function (acc, curr) { return acc || curr.playing; }, false));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isPaused", {
        /**
         * Returns true if all animations are paused and there's at least one animation
         */
        get: function () {
            return (!this.isPlaying &&
                (this.animations.length > 0 || this.stateMachines.length > 0));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isStopped", {
        /**
         * Returns true if there are no playing or paused animations/state machines
         */
        get: function () {
            return this.animations.length === 0 && this.stateMachines.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If there are no animations or state machines, add the first one found
     * @returns the name of the animation or state machine instanced
     */
    Animator.prototype.atLeastOne = function (playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        var instancedName;
        if (this.animations.length === 0 && this.stateMachines.length === 0) {
            if (this.artboard.animationCount() > 0) {
                // Add the first animation
                this.add([(instancedName = this.artboard.animationByIndex(0).name)], playing, fireEvent);
            }
            else if (this.artboard.stateMachineCount() > 0) {
                // Add the first state machine
                this.add([(instancedName = this.artboard.stateMachineByIndex(0).name)], playing, fireEvent);
            }
        }
        return instancedName;
    };
    /**
     * Checks if any animations have looped and if so, fire the appropriate event
     */
    Animator.prototype.handleLooping = function () {
        for (var _i = 0, _a = this.animations.filter(function (a) { return a.playing; }); _i < _a.length; _i++) {
            var animation = _a[_i];
            // Emit if the animation looped
            if (animation.loopValue === 0 && animation.loopCount) {
                animation.loopCount = 0;
                // This is a one-shot; if it has ended, delete the instance
                this.stop(animation.name);
            }
            else if (animation.loopValue === 1 && animation.loopCount) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.Loop },
                });
                animation.loopCount = 0;
            }
            // Wasm indicates a loop at each time the animation
            // changes direction, so a full loop/lap occurs every
            // two loop counts
            else if (animation.loopValue === 2 && animation.loopCount > 1) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.PingPong },
                });
                animation.loopCount = 0;
            }
        }
    };
    /**
     * Checks if states have changed in state machines and fires a statechange
     * event
     */
    Animator.prototype.handleStateChanges = function () {
        var statesChanged = [];
        for (var _i = 0, _a = this.stateMachines.filter(function (sm) { return sm.playing; }); _i < _a.length; _i++) {
            var stateMachine = _a[_i];
            statesChanged.push.apply(statesChanged, stateMachine.statesChanged);
        }
        if (statesChanged.length > 0) {
            this.eventManager.fire({
                type: EventType.StateChange,
                data: statesChanged,
            });
        }
    };
    Animator.prototype.handleAdvancing = function (time) {
        this.eventManager.fire({
            type: EventType.Advance,
            data: time,
        });
    };
    return Animator;
}());
// #endregion
// #region events
/**
 * Supported event types triggered in Rive
 */
var EventType;
(function (EventType) {
    EventType["Load"] = "load";
    EventType["LoadError"] = "loaderror";
    EventType["Play"] = "play";
    EventType["Pause"] = "pause";
    EventType["Stop"] = "stop";
    EventType["Loop"] = "loop";
    EventType["Draw"] = "draw";
    EventType["Advance"] = "advance";
    EventType["StateChange"] = "statechange";
    EventType["RiveEvent"] = "riveevent";
    EventType["AudioStatusChange"] = "audiostatuschange";
})(EventType || (EventType = {}));
/**
 * Looping types: one-shot, loop, and ping-pong
 */
var LoopType;
(function (LoopType) {
    LoopType["OneShot"] = "oneshot";
    LoopType["Loop"] = "loop";
    LoopType["PingPong"] = "pingpong";
})(LoopType || (LoopType = {}));
// Manages Rive events and listeners
var EventManager = /** @class */ (function () {
    function EventManager(listeners) {
        if (listeners === void 0) { listeners = []; }
        this.listeners = listeners;
    }
    // Gets listeners of specified type
    EventManager.prototype.getListeners = function (type) {
        return this.listeners.filter(function (e) { return e.type === type; });
    };
    // Adds a listener
    EventManager.prototype.add = function (listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    };
    /**
     * Removes a listener
     * @param listener the listener with the callback to be removed
     */
    EventManager.prototype.remove = function (listener) {
        // We can't simply look for the listener as it'll be a different instance to
        // one originally subscribed. Find all the listeners of the right type and
        // then check their callbacks which should match.
        for (var i = 0; i < this.listeners.length; i++) {
            var currentListener = this.listeners[i];
            if (currentListener.type === listener.type) {
                if (currentListener.callback === listener.callback) {
                    this.listeners.splice(i, 1);
                    break;
                }
            }
        }
    };
    /**
     * Clears all listeners of specified type, or every listener if no type is
     * specified
     * @param type the type of listeners to clear, or all listeners if not
     * specified
     */
    EventManager.prototype.removeAll = function (type) {
        var _this = this;
        if (!type) {
            this.listeners.splice(0, this.listeners.length);
        }
        else {
            this.listeners
                .filter(function (l) { return l.type === type; })
                .forEach(function (l) { return _this.remove(l); });
        }
    };
    // Fires an event
    EventManager.prototype.fire = function (event) {
        var eventListeners = this.getListeners(event.type);
        eventListeners.forEach(function (listener) { return listener.callback(event); });
    };
    return EventManager;
}());
// Manages a queue of tasks
var TaskQueueManager = /** @class */ (function () {
    function TaskQueueManager(eventManager) {
        this.eventManager = eventManager;
        this.queue = [];
    }
    // Adds a task top the queue
    TaskQueueManager.prototype.add = function (task) {
        this.queue.push(task);
    };
    // Processes all tasks in the queue
    TaskQueueManager.prototype.process = function () {
        while (this.queue.length > 0) {
            var task = this.queue.shift();
            if (task === null || task === void 0 ? void 0 : task.action) {
                task.action();
            }
            if (task === null || task === void 0 ? void 0 : task.event) {
                this.eventManager.fire(task.event);
            }
        }
    };
    return TaskQueueManager;
}());
// #endregion
// #region Audio
var SystemAudioStatus;
(function (SystemAudioStatus) {
    SystemAudioStatus[SystemAudioStatus["AVAILABLE"] = 0] = "AVAILABLE";
    SystemAudioStatus[SystemAudioStatus["UNAVAILABLE"] = 1] = "UNAVAILABLE";
})(SystemAudioStatus || (SystemAudioStatus = {}));
// Class to handle audio context availability and status changes
var AudioManager = /** @class */ (function (_super) {
    __extends(AudioManager, _super);
    function AudioManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._started = false;
        _this._enabled = false;
        _this._status = SystemAudioStatus.UNAVAILABLE;
        return _this;
    }
    AudioManager.prototype.delay = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
            });
        });
    };
    AudioManager.prototype.timeout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (_, reject) { return setTimeout(reject, 50); })];
            });
        });
    };
    // Alerts animations on status changes and removes the listeners to avoid alerting twice.
    AudioManager.prototype.reportToListeners = function () {
        this.fire({ type: EventType.AudioStatusChange });
        this.removeAll();
    };
    /**
     * The audio context has been resolved.
     * Alert any listeners that we can now play audio.
     * Rive will now play audio at the configured volume.
     */
    AudioManager.prototype.enableAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this._enabled) {
                    this._enabled = true;
                    this._status = SystemAudioStatus.AVAILABLE;
                    this.reportToListeners();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if we are able to play audio.
     *
     * We currently check the audio context, when resume() returns before a timeout we know that the
     * audio context is running and we can enable audio.
     */
    AudioManager.prototype.testAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this._status === SystemAudioStatus.UNAVAILABLE &&
                            this._audioContext !== null)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([this._audioContext.resume(), this.timeout()])];
                    case 2:
                        _b.sent();
                        this.enableAudio();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Establish audio for use with rive.
     * We both test if we can use audio intermittently and listen for user interaction.
     * The aim is to enable audio playback as soon as the browser allows this.
     */
    AudioManager.prototype._establishAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._started) return [3 /*break*/, 5];
                        this._started = true;
                        if (!(typeof window == "undefined")) return [3 /*break*/, 1];
                        this.enableAudio();
                        return [3 /*break*/, 5];
                    case 1:
                        this._audioContext = new AudioContext();
                        this.listenForUserAction();
                        _a.label = 2;
                    case 2:
                        if (!(this._status === SystemAudioStatus.UNAVAILABLE)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.testAudio()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(1000)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AudioManager.prototype.listenForUserAction = function () {
        var _this = this;
        // NOTE: AudioContexts are ready immediately if requested in a ui callback
        // we *could* re request one in this listener.
        var _clickListener = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // note this has "better" results than calling `await this.testAudio()`
                // as we force audio to be enabled in the current thread, rather than chancing
                // the thread to be passed over for some other async context
                this.enableAudio();
                return [2 /*return*/];
            });
        }); };
        // NOTE: we should test this on mobile/pads
        document.addEventListener("pointerdown", _clickListener, {
            once: true,
        });
    };
    /**
     * Establish the audio context for rive, this lets rive know that we can play audio.
     */
    AudioManager.prototype.establishAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._establishAudio();
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(AudioManager.prototype, "systemVolume", {
        get: function () {
            if (this._status === SystemAudioStatus.UNAVAILABLE) {
                // We do an immediate test to avoid depending on the delay of the running test
                this.testAudio();
                return 0;
            }
            return 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AudioManager.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    return AudioManager;
}(EventManager));
var audioManager = new AudioManager();
var FakeResizeObserver = /** @class */ (function () {
    function FakeResizeObserver() {
    }
    FakeResizeObserver.prototype.observe = function () { };
    FakeResizeObserver.prototype.unobserve = function () { };
    FakeResizeObserver.prototype.disconnect = function () { };
    return FakeResizeObserver;
}());
var MyResizeObserver = globalThis.ResizeObserver || FakeResizeObserver;
/**
 * This class takes care of any observers that will be attached to an animation.
 * It should be treated as a singleton because observers are much more performant
 * when used for observing multiple elements by a single instance.
 */
var ObjectObservers = /** @class */ (function () {
    function ObjectObservers() {
        var _this = this;
        this._elementsMap = new Map();
        /**
         * Resize observers trigger both when the element changes its size and also when the
         * element is added or removed from the document.
         */
        this._onObservedEntry = function (entry) {
            var observed = _this._elementsMap.get(entry.target);
            if (observed !== null) {
                observed.onResize(entry.target.clientWidth == 0 || entry.target.clientHeight == 0);
            }
            else {
                _this._resizeObserver.unobserve(entry.target);
            }
        };
        this._onObserved = function (entries) {
            entries.forEach(_this._onObservedEntry);
        };
        this._resizeObserver = new MyResizeObserver(this._onObserved);
    }
    // Adds an observable element
    ObjectObservers.prototype.add = function (element, onResize) {
        var observed = {
            onResize: onResize,
            element: element,
        };
        this._elementsMap.set(element, observed);
        this._resizeObserver.observe(element);
        return observed;
    };
    // Removes an observable element
    ObjectObservers.prototype.remove = function (observed) {
        this._resizeObserver.unobserve(observed.element);
        this._elementsMap.delete(observed.element);
    };
    return ObjectObservers;
}());
var observers = new ObjectObservers();
var RiveFile = /** @class */ (function () {
    function RiveFile(params) {
        // Allow the runtime to automatically load assets hosted in Rive's runtime.
        this.enableRiveAssetCDN = true;
        this.referenceCount = 0;
        this.destroyed = false;
        this.selfUnref = false;
        this.bindableArtboards = [];
        this.src = params.src;
        this.buffer = params.buffer;
        if (params.assetLoader)
            this.assetLoader = params.assetLoader;
        this.enableRiveAssetCDN =
            typeof params.enableRiveAssetCDN == "boolean"
                ? params.enableRiveAssetCDN
                : true;
        // New event management system
        this.eventManager = new EventManager();
        if (params.onLoad)
            this.on(EventType.Load, params.onLoad);
        if (params.onLoadError)
            this.on(EventType.LoadError, params.onLoadError);
    }
    RiveFile.prototype.releaseFile = function () {
        var _a;
        if (this.selfUnref) {
            (_a = this.file) === null || _a === void 0 ? void 0 : _a.unref();
        }
        this.file = null;
    };
    RiveFile.prototype.releaseBindableArtboards = function () {
        this.bindableArtboards.forEach(function (bindableArtboard) {
            return bindableArtboard.destroy();
        });
    };
    RiveFile.prototype.initData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, loader, loaderWrapper, _b, fileFinalizer;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.src) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, loadRiveFile(this.src)];
                    case 1:
                        _a.buffer = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (this.destroyed) {
                            return [2 /*return*/];
                        }
                        if (this.assetLoader) {
                            loaderWrapper = new _utils__WEBPACK_IMPORTED_MODULE_3__.CustomFileAssetLoaderWrapper(this.runtime, this.assetLoader);
                            loader = loaderWrapper.assetLoader;
                        }
                        // Load the Rive file
                        _b = this;
                        return [4 /*yield*/, this.runtime.load(new Uint8Array(this.buffer), loader, this.enableRiveAssetCDN)];
                    case 3:
                        // Load the Rive file
                        _b.file = _c.sent();
                        fileFinalizer = new _utils__WEBPACK_IMPORTED_MODULE_3__.FileFinalizer(this.file);
                        _utils__WEBPACK_IMPORTED_MODULE_3__.finalizationRegistry.register(this, fileFinalizer);
                        if (this.destroyed) {
                            this.releaseFile();
                            return [2 /*return*/];
                        }
                        if (this.file !== null) {
                            this.eventManager.fire({
                                type: EventType.Load,
                                data: this,
                            });
                        }
                        else {
                            this.fireLoadError(RiveFile.fileLoadErrorMessage);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RiveFile.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If no source file url specified, it's a bust
                        if (!this.src && !this.buffer) {
                            this.fireLoadError(RiveFile.missingErrorMessage);
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        _a = this;
                        return [4 /*yield*/, RuntimeLoader.awaitInstance()];
                    case 2:
                        _a.runtime = _b.sent();
                        if (this.destroyed) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.initData()];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        this.fireLoadError(error_1 instanceof Error ? error_1.message : RiveFile.fileLoadErrorMessage);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RiveFile.prototype.fireLoadError = function (message) {
        this.eventManager.fire({
            type: EventType.LoadError,
            data: message,
        });
        throw new Error(message);
    };
    /**
     * Subscribe to Rive-generated events
     * @param type the type of event to subscribe to
     * @param callback callback to fire when the event occurs
     */
    RiveFile.prototype.on = function (type, callback) {
        this.eventManager.add({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @param type the type of event to unsubscribe from
     * @param callback the callback to unsubscribe
     */
    RiveFile.prototype.off = function (type, callback) {
        this.eventManager.remove({
            type: type,
            callback: callback,
        });
    };
    RiveFile.prototype.cleanup = function () {
        this.referenceCount -= 1;
        if (this.referenceCount <= 0) {
            this.removeAllRiveEventListeners();
            this.releaseFile();
            this.releaseBindableArtboards();
            this.destroyed = true;
        }
    };
    /**
     * Unsubscribes all Rive listeners from an event type, or everything if no type is
     * given
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    RiveFile.prototype.removeAllRiveEventListeners = function (type) {
        this.eventManager.removeAll(type);
    };
    RiveFile.prototype.getInstance = function () {
        if (this.file !== null) {
            this.referenceCount += 1;
            return this.file;
        }
    };
    RiveFile.prototype.destroyIfUnused = function () {
        if (this.referenceCount <= 0) {
            this.cleanup();
        }
    };
    RiveFile.prototype.createBindableArtboard = function (nativeBindableArtboard) {
        if (nativeBindableArtboard != null) {
            var bindableArtboard = new BindableArtboard(nativeBindableArtboard);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(bindableArtboard, bindableArtboard.nativeArtboard);
            this.bindableArtboards.push(bindableArtboard);
            return bindableArtboard;
        }
        return null;
    };
    /**
     * @deprecated This function is deprecated. For better stability and memory management
     * use `getBindableArtboard()` instead.
     * @param {string} name - The name of the artboard.
     * @returns {Artboard} The artboard to bind to.
     */
    RiveFile.prototype.getArtboard = function (name) {
        var nativeArtboard = this.file.artboardByName(name);
        if (nativeArtboard != null) {
            return new Artboard(nativeArtboard, this);
        }
    };
    RiveFile.prototype.getBindableArtboard = function (name) {
        var nativeArtboard = this.file.bindableArtboardByName(name);
        return this.createBindableArtboard(nativeArtboard);
    };
    RiveFile.prototype.getDefaultBindableArtboard = function () {
        var nativeArtboard = this.file.bindableArtboardDefault();
        return this.createBindableArtboard(nativeArtboard);
    };
    RiveFile.prototype.internalBindableArtboardFromArtboard = function (artboard) {
        var nativeBindableArtboard = this.file.internalBindableArtboardFromArtboard(artboard);
        return this.createBindableArtboard(nativeBindableArtboard);
    };
    // Error message for missing source or buffer
    RiveFile.missingErrorMessage = "Rive source file or data buffer required";
    // Error message for file load error
    RiveFile.fileLoadErrorMessage = "The file failed to load";
    return RiveFile;
}());

var Rive = /** @class */ (function () {
    function Rive(params) {
        var _this = this;
        var _a;
        // Tracks if a Rive file is loaded
        this.loaded = false;
        // Tracks if a Rive file is destroyed
        this.destroyed = false;
        // Reference of an object that handles any observers for the animation
        this._observed = null;
        /**
         * Tracks if a Rive file is loaded; we need this in addition to loaded as some
         * commands (e.g. contents) can be called as soon as the file is loaded.
         * However, playback commands need to be queued and run in order once initial
         * animations and autoplay has been sorted out. This applies to play, pause,
         * and start.
         */
        this.readyForPlaying = false;
        // Runtime artboard
        this.artboard = null;
        // place to clear up event listeners
        this.eventCleanup = null;
        this.shouldDisableRiveListeners = false;
        this.automaticallyHandleEvents = false;
        this.dispatchPointerExit = true;
        // Allow all pointers to be passed to the runtime
        this.enableMultiTouch = false;
        // Allow the runtime to automatically load assets hosted in Rive's runtime.
        this.enableRiveAssetCDN = true;
        // Keep a local value of the set volume to update it asynchronously
        this._volume = 1;
        // Keep a local value of the set width to update it asynchronously
        this._artboardWidth = undefined;
        // Keep a local value of the set height to update it asynchronously
        this._artboardHeight = undefined;
        // Keep a local value of the device pixel ratio used in rendering and canvas/artboard resizing
        this._devicePixelRatioUsed = 1;
        // Whether the canvas element's size is 0
        this._hasZeroSize = false;
        // Audio event listener
        this._audioEventListener = null;
        // draw method bound to the class
        this._boundDraw = null;
        this._viewModelInstance = null;
        this._dataEnums = null;
        // Durations to generate a frame for the last second. Used for performance profiling.
        this.durations = [];
        this.frameTimes = [];
        this.frameCount = 0;
        this.isTouchScrollEnabled = false;
        this.onCanvasResize = function (hasZeroSize) {
            var toggledDisplay = _this._hasZeroSize !== hasZeroSize;
            _this._hasZeroSize = hasZeroSize;
            if (!hasZeroSize) {
                if (toggledDisplay) {
                    _this.resizeDrawingSurfaceToCanvas();
                }
            }
            else if (!_this._layout.maxX || !_this._layout.maxY) {
                _this.resizeToCanvas();
            }
        };
        /**
         * Used be draw to track when a second of active rendering time has passed.
         * Used for debugging purposes
         */
        this.renderSecondTimer = 0;
        this._boundDraw = this.draw.bind(this);
        this.canvas = params.canvas;
        if (params.canvas.constructor === HTMLCanvasElement) {
            this._observed = observers.add(this.canvas, this.onCanvasResize);
        }
        this.src = params.src;
        this.buffer = params.buffer;
        this.riveFile = params.riveFile;
        this.layout = (_a = params.layout) !== null && _a !== void 0 ? _a : new Layout();
        this.shouldDisableRiveListeners = !!params.shouldDisableRiveListeners;
        this.isTouchScrollEnabled = !!params.isTouchScrollEnabled;
        this.automaticallyHandleEvents = !!params.automaticallyHandleEvents;
        this.dispatchPointerExit =
            params.dispatchPointerExit === false
                ? params.dispatchPointerExit
                : this.dispatchPointerExit;
        this.enableMultiTouch = !!params.enableMultiTouch;
        this.enableRiveAssetCDN =
            params.enableRiveAssetCDN === undefined
                ? true
                : params.enableRiveAssetCDN;
        // New event management system
        this.eventManager = new EventManager();
        if (params.onLoad)
            this.on(EventType.Load, params.onLoad);
        if (params.onLoadError)
            this.on(EventType.LoadError, params.onLoadError);
        if (params.onPlay)
            this.on(EventType.Play, params.onPlay);
        if (params.onPause)
            this.on(EventType.Pause, params.onPause);
        if (params.onStop)
            this.on(EventType.Stop, params.onStop);
        if (params.onLoop)
            this.on(EventType.Loop, params.onLoop);
        if (params.onStateChange)
            this.on(EventType.StateChange, params.onStateChange);
        if (params.onAdvance)
            this.on(EventType.Advance, params.onAdvance);
        /**
         * @deprecated Use camelCase'd versions instead.
         */
        if (params.onload && !params.onLoad)
            this.on(EventType.Load, params.onload);
        if (params.onloaderror && !params.onLoadError)
            this.on(EventType.LoadError, params.onloaderror);
        if (params.onplay && !params.onPlay)
            this.on(EventType.Play, params.onplay);
        if (params.onpause && !params.onPause)
            this.on(EventType.Pause, params.onpause);
        if (params.onstop && !params.onStop)
            this.on(EventType.Stop, params.onstop);
        if (params.onloop && !params.onLoop)
            this.on(EventType.Loop, params.onloop);
        if (params.onstatechange && !params.onStateChange)
            this.on(EventType.StateChange, params.onstatechange);
        /**
         * Asset loading
         */
        if (params.assetLoader)
            this.assetLoader = params.assetLoader;
        // Hook up the task queue
        this.taskQueue = new TaskQueueManager(this.eventManager);
        this.init({
            src: this.src,
            buffer: this.buffer,
            riveFile: this.riveFile,
            autoplay: params.autoplay,
            autoBind: params.autoBind,
            animations: params.animations,
            stateMachines: params.stateMachines,
            artboard: params.artboard,
            useOffscreenRenderer: params.useOffscreenRenderer,
        });
    }
    Object.defineProperty(Rive.prototype, "viewModelCount", {
        get: function () {
            return this.file.viewModelCount();
        },
        enumerable: false,
        configurable: true
    });
    // Alternative constructor to build a Rive instance from an interface/object
    Rive.new = function (params) {
        console.warn("This function is deprecated: please use `new Rive({})` instead");
        return new Rive(params);
    };
    // Event handler for when audio context becomes available
    Rive.prototype.onSystemAudioChanged = function () {
        this.volume = this._volume;
    };
    // Initializes the Rive object either from constructor or load()
    Rive.prototype.init = function (_a) {
        var _this = this;
        var src = _a.src, buffer = _a.buffer, riveFile = _a.riveFile, animations = _a.animations, stateMachines = _a.stateMachines, artboard = _a.artboard, _b = _a.autoplay, autoplay = _b === void 0 ? false : _b, _c = _a.useOffscreenRenderer, useOffscreenRenderer = _c === void 0 ? false : _c, _d = _a.autoBind, autoBind = _d === void 0 ? false : _d;
        if (this.destroyed) {
            return;
        }
        this.src = src;
        this.buffer = buffer;
        this.riveFile = riveFile;
        // If no source file url specified, it's a bust
        if (!this.src && !this.buffer && !this.riveFile) {
            throw new RiveError(Rive.missingErrorMessage);
        }
        // List of animations that should be initialized.
        var startingAnimationNames = mapToStringArray(animations);
        // List of state machines that should be initialized
        var startingStateMachineNames = mapToStringArray(stateMachines);
        // Ensure loaded is marked as false if loading new file
        this.loaded = false;
        this.readyForPlaying = false;
        // Ensure the runtime is loaded
        RuntimeLoader.awaitInstance()
            .then(function (runtime) {
            if (_this.destroyed) {
                return;
            }
            _this.runtime = runtime;
            _this.removeRiveListeners();
            _this.deleteRiveRenderer();
            // Get the canvas where you want to render the animation and create a renderer
            _this.renderer = _this.runtime.makeRenderer(_this.canvas, useOffscreenRenderer);
            // Initial size adjustment based on devicePixelRatio if no width/height are
            // specified explicitly
            if (!(_this.canvas.width || _this.canvas.height)) {
                _this.resizeDrawingSurfaceToCanvas();
            }
            // Load Rive data from a source uri or a data buffer
            _this.initData(artboard, startingAnimationNames, startingStateMachineNames, autoplay, autoBind)
                .then(function (hasInitialized) {
                if (hasInitialized) {
                    return _this.setupRiveListeners();
                }
            })
                .catch(function (e) {
                console.error(e);
            });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    /**
     * Setup Rive Listeners on the canvas
     * @param riveListenerOptions - Enables TouchEvent events on the canvas. Set to true to allow
     * touch scrolling on the canvas element on touch-enabled devices
     * i.e. { isTouchScrollEnabled: true }
     */
    Rive.prototype.setupRiveListeners = function (riveListenerOptions) {
        var _this = this;
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        if (!this.shouldDisableRiveListeners) {
            var activeStateMachines = (this.animator.stateMachines || [])
                .filter(function (sm) { return sm.playing && _this.runtime.hasListeners(sm.instance); })
                .map(function (sm) { return sm.instance; });
            var touchScrollEnabledOption = this.isTouchScrollEnabled;
            var dispatchPointerExit = this.dispatchPointerExit;
            var enableMultiTouch = this.enableMultiTouch;
            if (riveListenerOptions &&
                "isTouchScrollEnabled" in riveListenerOptions) {
                touchScrollEnabledOption = riveListenerOptions.isTouchScrollEnabled;
            }
            this.eventCleanup = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.registerTouchInteractions)({
                canvas: this.canvas,
                artboard: this.artboard,
                stateMachines: activeStateMachines,
                renderer: this.renderer,
                rive: this.runtime,
                fit: this._layout.runtimeFit(this.runtime),
                alignment: this._layout.runtimeAlignment(this.runtime),
                isTouchScrollEnabled: touchScrollEnabledOption,
                dispatchPointerExit: dispatchPointerExit,
                enableMultiTouch: enableMultiTouch,
                layoutScaleFactor: this._layout.layoutScaleFactor,
            });
        }
    };
    /**
     * Remove Rive Listeners setup on the canvas
     */
    Rive.prototype.removeRiveListeners = function () {
        if (this.eventCleanup) {
            this.eventCleanup();
            this.eventCleanup = null;
        }
    };
    /**
     * If the instance has audio and the system audio is not ready
     * we hook the instance to the audio manager
     */
    Rive.prototype.initializeAudio = function () {
        var _this = this;
        var _a;
        // Initialize audio if needed
        if (audioManager.status == SystemAudioStatus.UNAVAILABLE) {
            if (((_a = this.artboard) === null || _a === void 0 ? void 0 : _a.hasAudio) && this._audioEventListener === null) {
                this._audioEventListener = {
                    type: EventType.AudioStatusChange,
                    callback: function () { return _this.onSystemAudioChanged(); },
                };
                audioManager.add(this._audioEventListener);
                audioManager.establishAudio();
            }
        }
    };
    Rive.prototype.initArtboardSize = function () {
        if (!this.artboard)
            return;
        // Use preset values if they are not undefined
        this._artboardWidth = this.artboard.width =
            this._artboardWidth || this.artboard.width;
        this._artboardHeight = this.artboard.height =
            this._artboardHeight || this.artboard.height;
    };
    // Initializes runtime with Rive data and preps for playing.
    // Returns true for successful initialization.
    Rive.prototype.initData = function (artboardName, animationNames, stateMachineNames, autoplay, autoBind) {
        return __awaiter(this, void 0, void 0, function () {
            var riveFile, error_2, msg;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!(this.riveFile == null)) return [3 /*break*/, 2];
                        riveFile = new RiveFile({
                            src: this.src,
                            buffer: this.buffer,
                            enableRiveAssetCDN: this.enableRiveAssetCDN,
                            assetLoader: this.assetLoader,
                        });
                        this.riveFile = riveFile;
                        return [4 /*yield*/, riveFile.init()];
                    case 1:
                        _b.sent();
                        if (this.destroyed) {
                            // In the very unlikely scenario where the rive file created by this Rive is shared by
                            // another rive file, we only want to destroy it if this file is the only owner.
                            riveFile.destroyIfUnused();
                            return [2 /*return*/, false];
                        }
                        _b.label = 2;
                    case 2:
                        this.file = this.riveFile.getInstance();
                        // Initialize and draw frame
                        this.initArtboard(artboardName, animationNames, stateMachineNames, autoplay, autoBind);
                        // Initialize the artboard size
                        this.initArtboardSize();
                        // Check for audio
                        this.initializeAudio();
                        // Everything's set up, emit a load event
                        this.loaded = true;
                        this.eventManager.fire({
                            type: EventType.Load,
                            data: (_a = this.src) !== null && _a !== void 0 ? _a : "buffer",
                        });
                        // Only initialize paused state machines after the load event has been fired
                        // to allow users to initialize inputs and view models before the first advance
                        this.animator.advanceIfPaused();
                        // Flag ready for playback commands and clear the task queue; this order
                        // is important or it may infinitely recurse
                        this.readyForPlaying = true;
                        this.taskQueue.process();
                        this.drawFrame();
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _b.sent();
                        msg = resolveErrorMessage(error_2);
                        console.warn(msg);
                        this.eventManager.fire({ type: EventType.LoadError, data: msg });
                        return [2 /*return*/, Promise.reject(msg)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Initialize for playback
    Rive.prototype.initArtboard = function (artboardName, animationNames, stateMachineNames, autoplay, autoBind) {
        if (!this.file) {
            return;
        }
        // Fetch the artboard
        var rootArtboard = artboardName
            ? this.file.artboardByName(artboardName)
            : this.file.defaultArtboard();
        // Check we have a working artboard
        if (!rootArtboard) {
            var msg = "Invalid artboard name or no default artboard";
            console.warn(msg);
            this.eventManager.fire({ type: EventType.LoadError, data: msg });
            return;
        }
        this.artboard = rootArtboard;
        rootArtboard.volume = this._volume * audioManager.systemVolume;
        // Initialize the animator
        this.animator = new Animator(this.runtime, this.artboard, this.eventManager);
        // Initialize the animations; as loaded hasn't happened yet, we need to
        // suppress firing the play/pause events until the load event has fired. To
        // do this we tell the animator to suppress firing events, and add event
        // firing to the task queue.
        var instanceNames;
        if (animationNames.length > 0 || stateMachineNames.length > 0) {
            instanceNames = animationNames.concat(stateMachineNames);
            this.animator.initLinearAnimations(animationNames, autoplay);
            this.animator.initStateMachines(stateMachineNames, autoplay);
        }
        else {
            instanceNames = [this.animator.atLeastOne(autoplay, false)];
        }
        // Queue up firing the playback events
        this.taskQueue.add({
            event: {
                type: autoplay ? EventType.Play : EventType.Pause,
                data: instanceNames,
            },
        });
        if (autoBind) {
            var viewModel = this.file.defaultArtboardViewModel(rootArtboard);
            if (viewModel !== null) {
                var runtimeInstance = viewModel.defaultInstance();
                if (runtimeInstance !== null) {
                    var viewModelInstance = new ViewModelInstance(runtimeInstance, null);
                    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, viewModelInstance.runtimeInstance);
                    this.bindViewModelInstance(viewModelInstance);
                }
            }
        }
    };
    // Draws the current artboard frame
    Rive.prototype.drawFrame = function () {
        var _a, _b;
        if ((_a = document === null || document === void 0 ? void 0 : document.timeline) === null || _a === void 0 ? void 0 : _a.currentTime) {
            if (this.loaded && this.artboard && !this.frameRequestId) {
                this._boundDraw(document.timeline.currentTime);
                (_b = this.runtime) === null || _b === void 0 ? void 0 : _b.resolveAnimationFrame();
            }
        }
        else {
            this.startRendering();
        }
    };
    /**
     * Draw rendering loop; renders animation frames at the correct time interval.
     * @param time the time at which to render a frame
     */
    Rive.prototype.draw = function (time, onSecond) {
        var _a;
        // Clear the frameRequestId, as we're now rendering a fresh frame
        this.frameRequestId = null;
        var before = performance.now();
        // On the first pass, make sure lastTime has a valid value
        if (!this.lastRenderTime) {
            this.lastRenderTime = time;
        }
        // Handle the onSecond callback
        this.renderSecondTimer += time - this.lastRenderTime;
        if (this.renderSecondTimer > 5000) {
            this.renderSecondTimer = 0;
            onSecond === null || onSecond === void 0 ? void 0 : onSecond();
        }
        // Calculate the elapsed time between frames in seconds
        var elapsedTime = (time - this.lastRenderTime) / 1000;
        this.lastRenderTime = time;
        // - Advance non-paused animations by the elapsed number of seconds
        // - Advance any animations that require scrubbing
        // - Advance to the first frame even when autoplay is false
        var activeAnimations = this.animator.animations
            .filter(function (a) { return a.playing || a.needsScrub; })
            // The scrubbed animations must be applied first to prevent weird artifacts
            // if the playing animations conflict with the scrubbed animating attribuates.
            .sort(function (first) { return (first.needsScrub ? -1 : 1); });
        for (var _i = 0, activeAnimations_1 = activeAnimations; _i < activeAnimations_1.length; _i++) {
            var animation = activeAnimations_1[_i];
            animation.advance(elapsedTime);
            if (animation.instance.didLoop) {
                animation.loopCount += 1;
            }
            animation.apply(1.0);
        }
        // - Advance non-paused state machines by the elapsed number of seconds
        // - Advance to the first frame even when autoplay is false
        var activeStateMachines = this.animator.stateMachines.filter(function (a) { return a.playing; });
        for (var _b = 0, activeStateMachines_1 = activeStateMachines; _b < activeStateMachines_1.length; _b++) {
            var stateMachine = activeStateMachines_1[_b];
            // Check for events before the current frame's state machine advance
            var numEventsReported = stateMachine.reportedEventCount();
            if (numEventsReported) {
                for (var i = 0; i < numEventsReported; i++) {
                    var event_1 = stateMachine.reportedEventAt(i);
                    if (event_1) {
                        if (event_1.type === RiveEventType.OpenUrl) {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                            // Handle the event side effect if explicitly enabled
                            if (this.automaticallyHandleEvents) {
                                var newAnchorTag = document.createElement("a");
                                var _c = event_1, url = _c.url, target = _c.target;
                                var sanitizedUrl = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.sanitizeUrl)(url);
                                url && newAnchorTag.setAttribute("href", sanitizedUrl);
                                target && newAnchorTag.setAttribute("target", target);
                                if (sanitizedUrl && sanitizedUrl !== _utils__WEBPACK_IMPORTED_MODULE_3__.BLANK_URL) {
                                    newAnchorTag.click();
                                }
                            }
                        }
                        else {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                        }
                    }
                }
            }
            stateMachine.advanceAndApply(elapsedTime);
            // stateMachine.instance.apply(this.artboard);
        }
        // Once the animations have been applied to the artboard, advance it
        // by the elapsed time.
        if (this.animator.stateMachines.length == 0) {
            this.artboard.advance(elapsedTime);
        }
        var renderer = this.renderer;
        // Canvas must be wiped to prevent artifacts
        renderer.clear();
        renderer.save();
        // Update the renderer alignment if necessary
        this.alignRenderer();
        // Do not draw on 0 canvas size
        if (!this._hasZeroSize) {
            this.artboard.draw(renderer);
        }
        renderer.restore();
        renderer.flush();
        // Check for any animations that looped
        this.animator.handleLooping();
        // Check for any state machines that had a state change
        this.animator.handleStateChanges();
        // Report advanced time
        this.animator.handleAdvancing(elapsedTime);
        // Add duration to create frame to durations array
        this.frameCount++;
        var after = performance.now();
        this.frameTimes.push(after);
        this.durations.push(after - before);
        while (this.frameTimes[0] <= after - 1000) {
            this.frameTimes.shift();
            this.durations.shift();
        }
        (_a = this._viewModelInstance) === null || _a === void 0 ? void 0 : _a.handleCallbacks();
        // Calling requestAnimationFrame will rerun draw() at the correct rate:
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
        if (this.animator.isPlaying) {
            // Request a new rendering frame
            this.startRendering();
        }
        else if (this.animator.isPaused) {
            // Reset the end time so on playback it starts at the correct frame
            this.lastRenderTime = 0;
        }
        else if (this.animator.isStopped) {
            // Reset animation instances, artboard and time
            // TODO: implement this properly when we have instancing
            // this.initArtboard();
            // this.drawFrame();
            this.lastRenderTime = 0;
        }
    };
    /**
     * Align the renderer
     */
    Rive.prototype.alignRenderer = function () {
        var _a = this, renderer = _a.renderer, runtime = _a.runtime, _layout = _a._layout, artboard = _a.artboard;
        // Align things up safe in the knowledge we can restore if changed
        renderer.align(_layout.runtimeFit(runtime), _layout.runtimeAlignment(runtime), {
            minX: _layout.minX,
            minY: _layout.minY,
            maxX: _layout.maxX,
            maxY: _layout.maxY,
        }, artboard.bounds, this._devicePixelRatioUsed * _layout.layoutScaleFactor);
    };
    Object.defineProperty(Rive.prototype, "fps", {
        get: function () {
            return this.durations.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "frameTime", {
        get: function () {
            if (this.durations.length === 0) {
                return 0;
            }
            return (this.durations.reduce(function (a, b) { return a + b; }, 0) / this.durations.length).toFixed(4);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Cleans up all Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances,
     * renderer instance, file and runtime.
     *
     * Once this is called, you will need to initialise a new instance of the
     * Rive class
     */
    Rive.prototype.cleanup = function () {
        var _a, _b;
        this.destroyed = true;
        // Stop the renderer if it hasn't already been stopped.
        this.stopRendering();
        // Clean up any artboard, animation or state machine instances.
        this.cleanupInstances();
        // Remove from observer
        if (this._observed !== null) {
            observers.remove(this._observed);
        }
        this.removeRiveListeners();
        if (this.file) {
            (_a = this.riveFile) === null || _a === void 0 ? void 0 : _a.cleanup();
            this.file = null;
        }
        this.riveFile = null;
        this.deleteRiveRenderer();
        if (this._audioEventListener !== null) {
            audioManager.remove(this._audioEventListener);
            this._audioEventListener = null;
        }
        (_b = this._viewModelInstance) === null || _b === void 0 ? void 0 : _b.cleanup();
        this._viewModelInstance = null;
        this._dataEnums = null;
    };
    /**
     * Cleans up the Renderer object. Only call this API if you no longer
     * need to render Rive content in your session.
     */
    Rive.prototype.deleteRiveRenderer = function () {
        var _a;
        (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.delete();
        this.renderer = null;
    };
    /**
     * Cleans up any Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances.
     *
     * Once this is called, things will need to be reinitialized or bad things
     * might happen.
     */
    Rive.prototype.cleanupInstances = function () {
        if (this.eventCleanup !== null) {
            this.eventCleanup();
        }
        // Delete all animation and state machine instances
        this.stop();
        if (this.artboard) {
            this.artboard.delete();
            this.artboard = null;
        }
    };
    /**
     * Tries to query the setup Artboard for a text run node with the given name.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - TextValueRun node or undefined if the text run cannot be queried
     */
    Rive.prototype.retrieveTextRun = function (textRunName) {
        var _a;
        if (!textRunName) {
            console.warn("No text run name provided");
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access text run, but the Artboard is null");
            return;
        }
        var textRun = this.artboard.textRun(textRunName);
        if (!textRun) {
            console.warn("Could not access a text run with name '".concat(textRunName, "' in the '").concat((_a = this.artboard) === null || _a === void 0 ? void 0 : _a.name, "' Artboard. Note that you must rename a text run node in the Rive editor to make it queryable at runtime."));
            return;
        }
        return textRun;
    };
    /**
     * Returns a string from a given text run node name, or undefined if the text run
     * cannot be queried.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - String value of the text run node or undefined
     */
    Rive.prototype.getTextRunValue = function (textRunName) {
        var textRun = this.retrieveTextRun(textRunName);
        return textRun ? textRun.text : undefined;
    };
    /**
     * Sets a text value for a given text run node name if possible
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @param textRunValue - String value to set on the text run node
     */
    Rive.prototype.setTextRunValue = function (textRunName, textRunValue) {
        var textRun = this.retrieveTextRun(textRunName);
        if (textRun) {
            textRun.text = textRunValue;
        }
    };
    // Plays specified animations; if none specified, it unpauses everything.
    Rive.prototype.play = function (animationNames, autoplay) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, queue up the play
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.play(animationNames, autoplay); },
            });
            return;
        }
        this.animator.play(animationNames);
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.setupRiveListeners();
        this.startRendering();
    };
    // Pauses specified animations; if none specified, pauses all.
    Rive.prototype.pause = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.pause(animationNames); },
            });
            return;
        }
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.animator.pause(animationNames);
    };
    Rive.prototype.scrub = function (animationNames, value) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.scrub(animationNames, value); },
            });
            return;
        }
        // Scrub the animation time; we draw a single frame here so that if
        // nothing's currently playing, the scrubbed animation is still rendered/
        this.animator.scrub(animationNames, value || 0);
        this.drawFrame();
    };
    // Stops specified animations; if none specifies, stops them all.
    Rive.prototype.stop = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.stop(animationNames); },
            });
            return;
        }
        // If there is no artboard, this.animator will be undefined
        if (this.animator) {
            this.animator.stop(animationNames);
        }
        if (this.eventCleanup) {
            this.eventCleanup();
        }
    };
    /**
     * Resets the animation
     * @param artboard the name of the artboard, or default if none given
     * @param animations the names of animations for playback
     * @param stateMachines the names of state machines for playback
     * @param autoplay whether to autoplay when reset, defaults to false
     *
     */
    Rive.prototype.reset = function (params) {
        var _a, _b;
        // Get the current artboard, animations, state machines, and playback states
        var artBoardName = params === null || params === void 0 ? void 0 : params.artboard;
        var animationNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.animations);
        var stateMachineNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.stateMachines);
        var autoplay = (_a = params === null || params === void 0 ? void 0 : params.autoplay) !== null && _a !== void 0 ? _a : false;
        var autoBind = (_b = params === null || params === void 0 ? void 0 : params.autoBind) !== null && _b !== void 0 ? _b : false;
        // Stop everything and clean up
        this.cleanupInstances();
        // Reinitialize an artboard instance with the state
        this.initArtboard(artBoardName, animationNames, stateMachineNames, autoplay, autoBind);
        this.taskQueue.process();
    };
    // Loads a new Rive file, keeping listeners in place
    Rive.prototype.load = function (params) {
        this.file = null;
        // Stop all animations
        this.stop();
        // Reinitialize
        this.init(params);
    };
    Object.defineProperty(Rive.prototype, "layout", {
        /**
         * Returns the current layout. Note that layout should be treated as
         * immutable. If you want to change the layout, create a new one use the
         * layout setter
         */
        get: function () {
            return this._layout;
        },
        // Sets a new layout
        set: function (layout) {
            this._layout = layout;
            // If the maxX or maxY are 0, then set them to the canvas width and height
            if (!layout.maxX || !layout.maxY) {
                this.resizeToCanvas();
            }
            if (this.loaded && !this.animator.isPlaying) {
                this.drawFrame();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the layout bounds to the current canvas size; this is typically called
     * when the canvas is resized
     */
    Rive.prototype.resizeToCanvas = function () {
        this._layout = this.layout.copyWith({
            minX: 0,
            minY: 0,
            maxX: this.canvas.width,
            maxY: this.canvas.height,
        });
    };
    /**
     * Accounts for devicePixelRatio as a multiplier to render the size of the canvas drawing surface.
     * Uses the size of the backing canvas to set new width/height attributes. Need to re-render
     * and resize the layout to match the new drawing surface afterwards.
     * Useful function for consumers to include in a window resize listener.
     *
     * This method will set the {@link devicePixelRatioUsed} property.
     *
     * Optionally, you can provide a {@link customDevicePixelRatio} to provide a
     * custom value.
     */
    Rive.prototype.resizeDrawingSurfaceToCanvas = function (customDevicePixelRatio) {
        if (this.canvas instanceof HTMLCanvasElement && !!window) {
            var _a = this.canvas.getBoundingClientRect(), width = _a.width, height = _a.height;
            var dpr = customDevicePixelRatio || window.devicePixelRatio || 1;
            this.devicePixelRatioUsed = dpr;
            this.canvas.width = dpr * width;
            this.canvas.height = dpr * height;
            this.resizeToCanvas();
            this.drawFrame();
            if (this.layout.fit === Fit.Layout) {
                var scaleFactor = this._layout.layoutScaleFactor;
                this.artboard.width = width / scaleFactor;
                this.artboard.height = height / scaleFactor;
            }
        }
    };
    Object.defineProperty(Rive.prototype, "source", {
        // Returns the animation source, which may be undefined
        get: function () {
            return this.src;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "activeArtboard", {
        /**
         * Returns the name of the active artboard
         */
        get: function () {
            return this.artboard ? this.artboard.name : "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "animationNames", {
        // Returns a list of animation names on the chosen artboard
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded || !this.artboard) {
                return [];
            }
            var animationNames = [];
            for (var i = 0; i < this.artboard.animationCount(); i++) {
                animationNames.push(this.artboard.animationByIndex(i).name);
            }
            return animationNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "stateMachineNames", {
        /**
         * Returns a list of state machine names from the current artboard
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded || !this.artboard) {
                return [];
            }
            var stateMachineNames = [];
            for (var i = 0; i < this.artboard.stateMachineCount(); i++) {
                stateMachineNames.push(this.artboard.stateMachineByIndex(i).name);
            }
            return stateMachineNames;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the inputs for the specified instanced state machine, or an empty
     * list if the name is invalid or the state machine is not instanced
     * @param name the state machine name
     * @returns the inputs for the named state machine
     */
    Rive.prototype.stateMachineInputs = function (name) {
        // If the file's not loaded, early out, nothing to pause
        if (!this.loaded) {
            return;
        }
        var stateMachine = this.animator.stateMachines.find(function (m) { return m.name === name; });
        return stateMachine === null || stateMachine === void 0 ? void 0 : stateMachine.inputs;
    };
    // Returns the input with the provided name at the given path
    Rive.prototype.retrieveInputAtPath = function (name, path) {
        if (!name) {
            console.warn("No input name provided for path '".concat(path, "'"));
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access input: '".concat(name, "', at path: '").concat(path, "', but the Artboard is null"));
            return;
        }
        var input = this.artboard.inputByPath(name, path);
        if (!input) {
            console.warn("Could not access an input with name: '".concat(name, "', at path:'").concat(path, "'"));
            return;
        }
        return input;
    };
    /**
     * Set the boolean input with the provided name at the given path with value
     * @param input the state machine input name
     * @param value the value to set the input to
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.setBooleanStateAtPath = function (inputName, value, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Boolean) {
            input.asBool().value = value;
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a boolean"));
        }
    };
    /**
     * Set the number input with the provided name at the given path with value
     * @param input the state machine input name
     * @param value the value to set the input to
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.setNumberStateAtPath = function (inputName, value, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Number) {
            input.asNumber().value = value;
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a number"));
        }
    };
    /**
     * Fire the trigger with the provided name at the given path
     * @param input the state machine input name
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.fireStateAtPath = function (inputName, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Trigger) {
            input.asTrigger().fire();
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a trigger"));
        }
    };
    // Returns the TextValueRun object for the provided name at the given path
    Rive.prototype.retrieveTextAtPath = function (name, path) {
        if (!name) {
            console.warn("No text name provided for path '".concat(path, "'"));
            return;
        }
        if (!path) {
            console.warn("No path provided for text '".concat(name, "'"));
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access text: '".concat(name, "', at path: '").concat(path, "', but the Artboard is null"));
            return;
        }
        var text = this.artboard.textByPath(name, path);
        if (!text) {
            console.warn("Could not access text with name: '".concat(name, "', at path:'").concat(path, "'"));
            return;
        }
        return text;
    };
    /**
     * Retrieves the text value for a specified text run at a given path
     * @param textName The name of the text run
     * @param path The path to the text run within the artboard
     * @returns The text value of the text run, or undefined if not found
     *
     * @example
     * // Get the text value for a text run named "title" at one nested artboard deep
     * const titleText = riveInstance.getTextRunValueAtPath("title", "artboard1");
     *
     * @example
     * // Get the text value for a text run named "subtitle" within a nested group two artboards deep
     * const subtitleText = riveInstance.getTextRunValueAtPath("subtitle", "group/nestedGroup");
     *
     * @remarks
     * If the text run cannot be found at the specified path, a warning will be logged to the console.
     */
    Rive.prototype.getTextRunValueAtPath = function (textName, path) {
        var run = this.retrieveTextAtPath(textName, path);
        if (!run) {
            console.warn("Could not get text with name: '".concat(textName, "', at path:'").concat(path, "'"));
            return;
        }
        return run.text;
    };
    /**
     * Sets the text value for a specified text run at a given path
     * @param textName The name of the text run
     * @param value The new text value to set
     * @param path The path to the text run within the artboard
     * @returns void
     *
     * @example
     * // Set the text value for a text run named "title" at one nested artboard deep
     * riveInstance.setTextRunValueAtPath("title", "New Title", "artboard1");
     *
     * @example
     * // Set the text value for a text run named "subtitle" within a nested group two artboards deep
     * riveInstance.setTextRunValueAtPath("subtitle", "New Subtitle", "group/nestedGroup");
     *
     * @remarks
     * If the text run cannot be found at the specified path, a warning will be logged to the console.
     */
    Rive.prototype.setTextRunValueAtPath = function (textName, value, path) {
        var run = this.retrieveTextAtPath(textName, path);
        if (!run) {
            console.warn("Could not set text with name: '".concat(textName, "', at path:'").concat(path, "'"));
            return;
        }
        run.text = value;
    };
    Object.defineProperty(Rive.prototype, "playingStateMachineNames", {
        // Returns a list of playing machine names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "playingAnimationNames", {
        // Returns a list of playing animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations.filter(function (a) { return a.playing; }).map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedAnimationNames", {
        // Returns a list of paused animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedStateMachineNames", {
        /**
         *  Returns a list of paused machine names
         * @returns a list of state machine names that are paused
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return !m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPlaying", {
        /**
         * @returns true if any animation is playing
         */
        get: function () {
            return this.animator.isPlaying;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPaused", {
        /**
         * @returns true if all instanced animations are paused
         */
        get: function () {
            return this.animator.isPaused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isStopped", {
        /**
         * @returns true if no animations are playing or paused
         */
        get: function () {
            return this.animator.isStopped;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "bounds", {
        /**
         * @returns the bounds of the current artboard, or undefined if the artboard
         * isn't loaded yet.
         */
        get: function () {
            return this.artboard ? this.artboard.bounds : undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Subscribe to Rive-generated events
     * @param type the type of event to subscribe to
     * @param callback callback to fire when the event occurs
     */
    Rive.prototype.on = function (type, callback) {
        this.eventManager.add({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @param type the type of event to unsubscribe from
     * @param callback the callback to unsubscribe
     */
    Rive.prototype.off = function (type, callback) {
        this.eventManager.remove({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @deprecated
     * @param callback the callback to unsubscribe from
     */
    Rive.prototype.unsubscribe = function (type, callback) {
        console.warn("This function is deprecated: please use `off()` instead.");
        this.off(type, callback);
    };
    /**
     * Unsubscribes all Rive listeners from an event type, or everything if no type is
     * given
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.removeAllRiveEventListeners = function (type) {
        this.eventManager.removeAll(type);
    };
    /**
     * Unsubscribes all listeners from an event type, or everything if no type is
     * given
     * @deprecated
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.unsubscribeAll = function (type) {
        console.warn("This function is deprecated: please use `removeAllRiveEventListeners()` instead.");
        this.removeAllRiveEventListeners(type);
    };
    /**
     * Stops the rendering loop; this is different from pausing in that it doesn't
     * change the state of any animation. It stops rendering from occurring. This
     * is designed for situations such as when Rive isn't visible.
     *
     * The only way to start rendering again is to call `startRendering`.
     * Animations that are marked as playing will start from the position that
     * they would have been at if rendering had not been stopped.
     */
    Rive.prototype.stopRendering = function () {
        if (this.loaded && this.frameRequestId) {
            if (this.runtime.cancelAnimationFrame) {
                this.runtime.cancelAnimationFrame(this.frameRequestId);
            }
            else {
                cancelAnimationFrame(this.frameRequestId);
            }
            this.frameRequestId = null;
        }
    };
    /**
     * Starts the rendering loop if it has been previously stopped. If the
     * renderer is already active, then this will have zero effect.
     */
    Rive.prototype.startRendering = function () {
        if (this.loaded && this.artboard && !this.frameRequestId) {
            if (this.runtime.requestAnimationFrame) {
                this.frameRequestId = this.runtime.requestAnimationFrame(this._boundDraw);
            }
            else {
                this.frameRequestId = requestAnimationFrame(this._boundDraw);
            }
        }
    };
    /**
     * Enables frames-per-second (FPS) reporting for the runtime
     * If no callback is provided, Rive will append a fixed-position div at the top-right corner of
     * the page with the FPS reading
     * @param fpsCallback - Callback from the runtime during the RAF loop that supplies the FPS value
     */
    Rive.prototype.enableFPSCounter = function (fpsCallback) {
        this.runtime.enableFPSCounter(fpsCallback);
    };
    /**
     * Disables frames-per-second (FPS) reporting for the runtime
     */
    Rive.prototype.disableFPSCounter = function () {
        this.runtime.disableFPSCounter();
    };
    Object.defineProperty(Rive.prototype, "contents", {
        /**
         * Returns the contents of a Rive file: the artboards, animations, and state machines
         */
        get: function () {
            if (!this.loaded) {
                return undefined;
            }
            var riveContents = {
                artboards: [],
            };
            for (var i = 0; i < this.file.artboardCount(); i++) {
                var artboard = this.file.artboardByIndex(i);
                var artboardContents = {
                    name: artboard.name,
                    animations: [],
                    stateMachines: [],
                };
                for (var j = 0; j < artboard.animationCount(); j++) {
                    var animation = artboard.animationByIndex(j);
                    artboardContents.animations.push(animation.name);
                }
                for (var k = 0; k < artboard.stateMachineCount(); k++) {
                    var stateMachine = artboard.stateMachineByIndex(k);
                    var name_1 = stateMachine.name;
                    var instance = new this.runtime.StateMachineInstance(stateMachine, artboard);
                    var inputContents = [];
                    for (var l = 0; l < instance.inputCount(); l++) {
                        var input = instance.input(l);
                        inputContents.push({ name: input.name, type: input.type });
                    }
                    artboardContents.stateMachines.push({
                        name: name_1,
                        inputs: inputContents,
                    });
                }
                riveContents.artboards.push(artboardContents);
            }
            return riveContents;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "volume", {
        /**
         * Getter / Setter for the volume of the artboard
         */
        get: function () {
            if (this.artboard && this.artboard.volume !== this._volume) {
                this._volume = this.artboard.volume;
            }
            return this._volume;
        },
        set: function (value) {
            this._volume = value;
            if (this.artboard) {
                this.artboard.volume = value * audioManager.systemVolume;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "artboardWidth", {
        /**
         * The width of the artboard.
         *
         * This will return 0 if the artboard is not loaded yet and a custom
         * width has not been set.
         *
         * Do not set this value manually when using {@link resizeDrawingSurfaceToCanvas}
         * with a {@link Layout.fit} of {@link Fit.Layout}, as the artboard width is
         * automatically set.
         */
        get: function () {
            var _a;
            if (this.artboard) {
                return this.artboard.width;
            }
            return (_a = this._artboardWidth) !== null && _a !== void 0 ? _a : 0;
        },
        set: function (value) {
            this._artboardWidth = value;
            if (this.artboard) {
                this.artboard.width = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "artboardHeight", {
        /**
         * The height of the artboard.
         *
         * This will return 0 if the artboard is not loaded yet and a custom
         * height has not been set.
         *
         * Do not set this value manually when using {@link resizeDrawingSurfaceToCanvas}
         * with a {@link Layout.fit} of {@link Fit.Layout}, as the artboard height is
         * automatically set.
         */
        get: function () {
            var _a;
            if (this.artboard) {
                return this.artboard.height;
            }
            return (_a = this._artboardHeight) !== null && _a !== void 0 ? _a : 0;
        },
        set: function (value) {
            this._artboardHeight = value;
            if (this.artboard) {
                this.artboard.height = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Reset the artboard size to its original values.
     */
    Rive.prototype.resetArtboardSize = function () {
        if (this.artboard) {
            this.artboard.resetArtboardSize();
            this._artboardWidth = this.artboard.width;
            this._artboardHeight = this.artboard.height;
        }
        else {
            // If the artboard isn't loaded, we need to reset the custom width and height
            this._artboardWidth = undefined;
            this._artboardHeight = undefined;
        }
    };
    Object.defineProperty(Rive.prototype, "devicePixelRatioUsed", {
        /**
         * The device pixel ratio used in rendering and canvas/artboard resizing.
         *
         * This value will be overidden by the device pixel ratio used in
         * {@link resizeDrawingSurfaceToCanvas}. If you use that method, do not set this value.
         */
        get: function () {
            return this._devicePixelRatioUsed;
        },
        set: function (value) {
            this._devicePixelRatioUsed = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the data context with the view model instance.
     */
    Rive.prototype.bindViewModelInstance = function (viewModelInstance) {
        var _a;
        if (this.artboard && !this.destroyed) {
            if (viewModelInstance && viewModelInstance.runtimeInstance) {
                viewModelInstance.internalIncrementReferenceCount();
                (_a = this._viewModelInstance) === null || _a === void 0 ? void 0 : _a.cleanup();
                this._viewModelInstance = viewModelInstance;
                if (this.animator.stateMachines.length > 0) {
                    this.animator.stateMachines.forEach(function (stateMachine) {
                        return stateMachine.bindViewModelInstance(viewModelInstance);
                    });
                }
                else {
                    this.artboard.bindViewModelInstance(viewModelInstance.runtimeInstance);
                }
            }
        }
    };
    Object.defineProperty(Rive.prototype, "viewModelInstance", {
        get: function () {
            return this._viewModelInstance;
        },
        enumerable: false,
        configurable: true
    });
    Rive.prototype.viewModelByIndex = function (index) {
        var viewModel = this.file.viewModelByIndex(index);
        if (viewModel !== null) {
            return new ViewModel(viewModel);
        }
        return null;
    };
    Rive.prototype.viewModelByName = function (name) {
        var viewModel = this.file.viewModelByName(name);
        if (viewModel !== null) {
            return new ViewModel(viewModel);
        }
        return null;
    };
    Rive.prototype.enums = function () {
        if (this._dataEnums === null) {
            var dataEnums = this.file.enums();
            this._dataEnums = dataEnums.map(function (dataEnum) {
                return new DataEnum(dataEnum);
            });
        }
        return this._dataEnums;
    };
    Rive.prototype.defaultViewModel = function () {
        if (this.artboard) {
            var viewModel = this.file.defaultArtboardViewModel(this.artboard);
            if (viewModel) {
                return new ViewModel(viewModel);
            }
        }
        return null;
    };
    /**
     * @deprecated This function is deprecated. For better stability and memory management
     * use `getBindableArtboard()` instead.
     * @param {string} name - The name of the artboard.
     * @returns {Artboard} The artboard to bind to.
     */
    Rive.prototype.getArtboard = function (name) {
        var _a, _b;
        return (_b = (_a = this.riveFile) === null || _a === void 0 ? void 0 : _a.getArtboard(name)) !== null && _b !== void 0 ? _b : null;
    };
    Rive.prototype.getBindableArtboard = function (name) {
        var _a, _b;
        return (_b = (_a = this.riveFile) === null || _a === void 0 ? void 0 : _a.getBindableArtboard(name)) !== null && _b !== void 0 ? _b : null;
    };
    Rive.prototype.getDefaultBindableArtboard = function () {
        var _a, _b;
        return (_b = (_a = this.riveFile) === null || _a === void 0 ? void 0 : _a.getDefaultBindableArtboard()) !== null && _b !== void 0 ? _b : null;
    };
    // Error message for missing source or buffer
    Rive.missingErrorMessage = "Rive source file or data buffer required";
    // Error message for removed rive file
    Rive.cleanupErrorMessage = "Attempt to use file after calling cleanup.";
    return Rive;
}());

var ViewModel = /** @class */ (function () {
    function ViewModel(viewModel) {
        this._viewModel = viewModel;
    }
    Object.defineProperty(ViewModel.prototype, "instanceCount", {
        get: function () {
            return this._viewModel.instanceCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "name", {
        get: function () {
            return this._viewModel.name;
        },
        enumerable: false,
        configurable: true
    });
    ViewModel.prototype.instanceByIndex = function (index) {
        var instance = this._viewModel.instanceByIndex(index);
        if (instance !== null) {
            var viewModelInstance = new ViewModelInstance(instance, null);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, instance);
            return viewModelInstance;
        }
        return null;
    };
    ViewModel.prototype.instanceByName = function (name) {
        var instance = this._viewModel.instanceByName(name);
        if (instance !== null) {
            var viewModelInstance = new ViewModelInstance(instance, null);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, instance);
            return viewModelInstance;
        }
        return null;
    };
    ViewModel.prototype.defaultInstance = function () {
        var runtimeInstance = this._viewModel.defaultInstance();
        if (runtimeInstance !== null) {
            var viewModelInstance = new ViewModelInstance(runtimeInstance, null);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, runtimeInstance);
            return viewModelInstance;
        }
        return null;
    };
    ViewModel.prototype.instance = function () {
        var runtimeInstance = this._viewModel.instance();
        if (runtimeInstance !== null) {
            var viewModelInstance = new ViewModelInstance(runtimeInstance, null);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, runtimeInstance);
            return viewModelInstance;
        }
        return null;
    };
    Object.defineProperty(ViewModel.prototype, "properties", {
        get: function () {
            return this._viewModel.getProperties();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "instanceNames", {
        get: function () {
            return this._viewModel.getInstanceNames();
        },
        enumerable: false,
        configurable: true
    });
    return ViewModel;
}());

var DataEnum = /** @class */ (function () {
    function DataEnum(dataEnum) {
        this._dataEnum = dataEnum;
    }
    Object.defineProperty(DataEnum.prototype, "name", {
        get: function () {
            return this._dataEnum.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataEnum.prototype, "values", {
        get: function () {
            return this._dataEnum.values;
        },
        enumerable: false,
        configurable: true
    });
    return DataEnum;
}());

var PropertyType;
(function (PropertyType) {
    PropertyType["Number"] = "number";
    PropertyType["String"] = "string";
    PropertyType["Boolean"] = "boolean";
    PropertyType["Color"] = "color";
    PropertyType["Trigger"] = "trigger";
    PropertyType["Enum"] = "enum";
    PropertyType["List"] = "list";
    PropertyType["Image"] = "image";
    PropertyType["Artboard"] = "artboard";
})(PropertyType || (PropertyType = {}));
var ViewModelInstance = /** @class */ (function () {
    function ViewModelInstance(runtimeInstance, parent) {
        this._parents = [];
        this._children = [];
        this._viewModelInstances = new Map();
        this._propertiesWithCallbacks = [];
        this._referenceCount = 0;
        this.selfUnref = false;
        this._runtimeInstance = runtimeInstance;
        if (parent !== null) {
            this._parents.push(parent);
        }
    }
    Object.defineProperty(ViewModelInstance.prototype, "runtimeInstance", {
        get: function () {
            return this._runtimeInstance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModelInstance.prototype, "nativeInstance", {
        get: function () {
            return this._runtimeInstance;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstance.prototype.handleCallbacks = function () {
        if (this._propertiesWithCallbacks.length !== 0) {
            this._propertiesWithCallbacks.forEach(function (property) {
                property.handleCallbacks();
            });
            this._propertiesWithCallbacks.forEach(function (property) {
                property.clearChanges();
            });
        }
        this._children.forEach(function (child) { return child.handleCallbacks(); });
    };
    ViewModelInstance.prototype.addParent = function (parent) {
        if (!this._parents.includes(parent)) {
            this._parents.push(parent);
            if (this._propertiesWithCallbacks.length > 0 ||
                this._children.length > 0) {
                parent.addToViewModelCallbacks(this);
            }
        }
    };
    ViewModelInstance.prototype.removeParent = function (parent) {
        var index = this._parents.indexOf(parent);
        if (index !== -1) {
            var parent_1 = this._parents[index];
            parent_1.removeFromViewModelCallbacks(this);
            this._parents.splice(index, 1);
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.addToPropertyCallbacks = function (property) {
        var _this = this;
        if (!this._propertiesWithCallbacks.includes(property)) {
            this._propertiesWithCallbacks.push(property);
            if (this._propertiesWithCallbacks.length > 0) {
                this._parents.forEach(function (parent) {
                    parent.addToViewModelCallbacks(_this);
                });
            }
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.removeFromPropertyCallbacks = function (property) {
        var _this = this;
        if (this._propertiesWithCallbacks.includes(property)) {
            this._propertiesWithCallbacks = this._propertiesWithCallbacks.filter(function (prop) { return prop !== property; });
            if (this._children.length === 0 &&
                this._propertiesWithCallbacks.length === 0) {
                this._parents.forEach(function (parent) {
                    parent.removeFromViewModelCallbacks(_this);
                });
            }
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.addToViewModelCallbacks = function (instance) {
        var _this = this;
        if (!this._children.includes(instance)) {
            this._children.push(instance);
            this._parents.forEach(function (parent) {
                parent.addToViewModelCallbacks(_this);
            });
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.removeFromViewModelCallbacks = function (instance) {
        var _this = this;
        if (this._children.includes(instance)) {
            this._children = this._children.filter(function (child) { return child !== instance; });
            if (this._children.length === 0 &&
                this._propertiesWithCallbacks.length === 0) {
                this._parents.forEach(function (parent) {
                    parent.removeFromViewModelCallbacks(_this);
                });
            }
        }
    };
    ViewModelInstance.prototype.clearCallbacks = function () {
        this._propertiesWithCallbacks.forEach(function (property) {
            property.clearCallbacks();
        });
    };
    ViewModelInstance.prototype.propertyFromPath = function (path, type) {
        var pathSegments = path.split("/");
        return this.propertyFromPathSegments(pathSegments, 0, type);
    };
    ViewModelInstance.prototype.viewModelFromPathSegments = function (pathSegments, index) {
        var viewModelInstance = this.internalViewModelInstance(pathSegments[index]);
        if (viewModelInstance !== null) {
            if (index == pathSegments.length - 1) {
                return viewModelInstance;
            }
            else {
                return viewModelInstance.viewModelFromPathSegments(pathSegments, index++);
            }
        }
        return null;
    };
    ViewModelInstance.prototype.propertyFromPathSegments = function (pathSegments, index, type) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        if (index < pathSegments.length - 1) {
            var viewModelInstance = this.internalViewModelInstance(pathSegments[index]);
            if (viewModelInstance !== null) {
                return viewModelInstance.propertyFromPathSegments(pathSegments, index + 1, type);
            }
            else {
                return null;
            }
        }
        var instance = null;
        switch (type) {
            case PropertyType.Number:
                instance = (_b = (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.number(pathSegments[index])) !== null && _b !== void 0 ? _b : null;
                if (instance !== null) {
                    return new ViewModelInstanceNumber(instance, this);
                }
                break;
            case PropertyType.String:
                instance = (_d = (_c = this._runtimeInstance) === null || _c === void 0 ? void 0 : _c.string(pathSegments[index])) !== null && _d !== void 0 ? _d : null;
                if (instance !== null) {
                    return new ViewModelInstanceString(instance, this);
                }
                break;
            case PropertyType.Boolean:
                instance = (_f = (_e = this._runtimeInstance) === null || _e === void 0 ? void 0 : _e.boolean(pathSegments[index])) !== null && _f !== void 0 ? _f : null;
                if (instance !== null) {
                    return new ViewModelInstanceBoolean(instance, this);
                }
                break;
            case PropertyType.Color:
                instance = (_h = (_g = this._runtimeInstance) === null || _g === void 0 ? void 0 : _g.color(pathSegments[index])) !== null && _h !== void 0 ? _h : null;
                if (instance !== null) {
                    return new ViewModelInstanceColor(instance, this);
                }
                break;
            case PropertyType.Trigger:
                instance = (_k = (_j = this._runtimeInstance) === null || _j === void 0 ? void 0 : _j.trigger(pathSegments[index])) !== null && _k !== void 0 ? _k : null;
                if (instance !== null) {
                    return new ViewModelInstanceTrigger(instance, this);
                }
                break;
            case PropertyType.Enum:
                instance = (_m = (_l = this._runtimeInstance) === null || _l === void 0 ? void 0 : _l.enum(pathSegments[index])) !== null && _m !== void 0 ? _m : null;
                if (instance !== null) {
                    return new ViewModelInstanceEnum(instance, this);
                }
                break;
            case PropertyType.List:
                instance = (_p = (_o = this._runtimeInstance) === null || _o === void 0 ? void 0 : _o.list(pathSegments[index])) !== null && _p !== void 0 ? _p : null;
                if (instance !== null) {
                    return new ViewModelInstanceList(instance, this);
                }
                break;
            case PropertyType.Image:
                instance = (_r = (_q = this._runtimeInstance) === null || _q === void 0 ? void 0 : _q.image(pathSegments[index])) !== null && _r !== void 0 ? _r : null;
                if (instance !== null) {
                    return new ViewModelInstanceAssetImage(instance, this);
                }
                break;
            case PropertyType.Artboard:
                instance = (_t = (_s = this._runtimeInstance) === null || _s === void 0 ? void 0 : _s.artboard(pathSegments[index])) !== null && _t !== void 0 ? _t : null;
                if (instance !== null) {
                    return new ViewModelInstanceArtboard(instance, this);
                }
                break;
        }
        return null;
    };
    ViewModelInstance.prototype.internalViewModelInstance = function (name) {
        var _a;
        if (this._viewModelInstances.has(name)) {
            return this._viewModelInstances.get(name);
        }
        var viewModelRuntimeInstance = (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.viewModel(name);
        if (viewModelRuntimeInstance !== null) {
            var viewModelInstance = new ViewModelInstance(viewModelRuntimeInstance, this);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, viewModelRuntimeInstance);
            viewModelInstance.internalIncrementReferenceCount();
            this._viewModelInstances.set(name, viewModelInstance);
            return viewModelInstance;
        }
        return null;
    };
    /**
     * method to access a property instance of type number belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the number property
     */
    ViewModelInstance.prototype.number = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Number);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type string belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the string property
     */
    ViewModelInstance.prototype.string = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.String);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type boolean belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the boolean property
     */
    ViewModelInstance.prototype.boolean = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Boolean);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type color belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the ttrigger property
     */
    ViewModelInstance.prototype.color = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Color);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type trigger belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the trigger property
     */
    ViewModelInstance.prototype.trigger = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Trigger);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type enum belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the enum property
     */
    ViewModelInstance.prototype.enum = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Enum);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type list belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the list property
     */
    ViewModelInstance.prototype.list = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.List);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a view model property instance belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the image property
     */
    ViewModelInstance.prototype.image = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Image);
        return viewmodelInstanceValue;
    };
    /**
     * method to access an artboard property instance belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the image property
     */
    ViewModelInstance.prototype.artboard = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Artboard);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a view model property instance belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the view model property
     */
    ViewModelInstance.prototype.viewModel = function (path) {
        var pathSegments = path.split("/");
        var parentViewModelInstance = pathSegments.length > 1
            ? this.viewModelFromPathSegments(pathSegments.slice(0, pathSegments.length - 1), 0)
            : this;
        if (parentViewModelInstance != null) {
            return parentViewModelInstance.internalViewModelInstance(pathSegments[pathSegments.length - 1]);
        }
        return null;
    };
    ViewModelInstance.prototype.internalReplaceViewModel = function (name, value) {
        var _a;
        if (value.runtimeInstance !== null) {
            var result = ((_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.replaceViewModel(name, value.runtimeInstance)) ||
                false;
            if (result) {
                value.internalIncrementReferenceCount();
                var oldInstance_1 = this.internalViewModelInstance(name);
                if (oldInstance_1 !== null) {
                    oldInstance_1.removeParent(this);
                    if (this._children.includes(oldInstance_1)) {
                        this._children = this._children.filter(function (child) { return child !== oldInstance_1; });
                    }
                    oldInstance_1.cleanup();
                }
                this._viewModelInstances.set(name, value);
                value.addParent(this);
            }
            return result;
        }
        return false;
    };
    /**
     * method to replace a view model property with another view model value
     * @param path - path to the view model property
     * @param value - view model that will replace the original
     */
    ViewModelInstance.prototype.replaceViewModel = function (path, value) {
        var _a;
        var pathSegments = path.split("/");
        var viewModelInstance = pathSegments.length > 1
            ? this.viewModelFromPathSegments(pathSegments.slice(0, pathSegments.length - 1), 0)
            : this;
        return ((_a = viewModelInstance === null || viewModelInstance === void 0 ? void 0 : viewModelInstance.internalReplaceViewModel(pathSegments[pathSegments.length - 1], value)) !== null && _a !== void 0 ? _a : false);
    };
    /*
     * method to add one to the reference counter of the instance.
     * Use if the file owning the reference is destroyed but the instance needs to stay around
     */
    ViewModelInstance.prototype.incrementReferenceCount = function () {
        var _a;
        this._referenceCount++;
        (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.incrementReferenceCount();
    };
    /*
     * method to subtract one to the reference counter of the instance.
     * Use if incrementReferenceCount has been called
     */
    ViewModelInstance.prototype.decrementReferenceCount = function () {
        var _a;
        this._referenceCount--;
        (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.decrementReferenceCount();
    };
    Object.defineProperty(ViewModelInstance.prototype, "properties", {
        get: function () {
            var _a;
            return (((_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.getProperties().map(function (prop) { return (__assign({}, prop)); })) || []);
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstance.prototype.internalIncrementReferenceCount = function () {
        this._referenceCount++;
    };
    ViewModelInstance.prototype.cleanup = function () {
        var _this = this;
        var _a;
        this._referenceCount--;
        if (this._referenceCount <= 0) {
            if (this.selfUnref) {
                (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.unref();
            }
            this._runtimeInstance = null;
            this.clearCallbacks();
            this._propertiesWithCallbacks = [];
            this._viewModelInstances.forEach(function (value) {
                value.cleanup();
            });
            this._viewModelInstances.clear();
            var children = __spreadArray([], this._children, true);
            this._children.length = 0;
            var parents = __spreadArray([], this._parents, true);
            this._parents.length = 0;
            children.forEach(function (child) {
                child.removeParent(_this);
            });
            parents.forEach(function (parent) {
                parent.removeFromViewModelCallbacks(_this);
            });
        }
    };
    return ViewModelInstance;
}());

var ViewModelInstanceValue = /** @class */ (function () {
    function ViewModelInstanceValue(instance, parent) {
        this.callbacks = [];
        this._viewModelInstanceValue = instance;
        this._parentViewModel = parent;
    }
    ViewModelInstanceValue.prototype.on = function (callback) {
        // Since we don't clean the changed flag for properties that don't have listeners,
        // we clean it the first time we add a listener to it
        if (this.callbacks.length === 0) {
            this._viewModelInstanceValue.clearChanges();
        }
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
            this._parentViewModel.addToPropertyCallbacks(this);
        }
    };
    ViewModelInstanceValue.prototype.off = function (callback) {
        if (!callback) {
            this.callbacks.length = 0;
        }
        else {
            this.callbacks = this.callbacks.filter(function (cb) { return cb !== callback; });
        }
        if (this.callbacks.length === 0) {
            this._parentViewModel.removeFromPropertyCallbacks(this);
        }
    };
    ViewModelInstanceValue.prototype.internalHandleCallback = function (callback) { };
    ViewModelInstanceValue.prototype.handleCallbacks = function () {
        var _this = this;
        if (this._viewModelInstanceValue.hasChanged) {
            this.callbacks.forEach(function (callback) {
                _this.internalHandleCallback(callback);
            });
        }
    };
    ViewModelInstanceValue.prototype.clearChanges = function () {
        this._viewModelInstanceValue.clearChanges();
    };
    ViewModelInstanceValue.prototype.clearCallbacks = function () {
        this.callbacks.length = 0;
    };
    Object.defineProperty(ViewModelInstanceValue.prototype, "name", {
        get: function () {
            return this._viewModelInstanceValue.name;
        },
        enumerable: false,
        configurable: true
    });
    return ViewModelInstanceValue;
}());

var ViewModelInstanceString = /** @class */ (function (_super) {
    __extends(ViewModelInstanceString, _super);
    function ViewModelInstanceString(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceString.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceString.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceString;
}(ViewModelInstanceValue));

var ViewModelInstanceNumber = /** @class */ (function (_super) {
    __extends(ViewModelInstanceNumber, _super);
    function ViewModelInstanceNumber(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceNumber.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceNumber.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceNumber;
}(ViewModelInstanceValue));

var ViewModelInstanceBoolean = /** @class */ (function (_super) {
    __extends(ViewModelInstanceBoolean, _super);
    function ViewModelInstanceBoolean(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceBoolean.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceBoolean.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceBoolean;
}(ViewModelInstanceValue));

var ViewModelInstanceTrigger = /** @class */ (function (_super) {
    __extends(ViewModelInstanceTrigger, _super);
    function ViewModelInstanceTrigger(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    ViewModelInstanceTrigger.prototype.trigger = function () {
        return this._viewModelInstanceValue.trigger();
    };
    ViewModelInstanceTrigger.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceTrigger;
}(ViewModelInstanceValue));

var ViewModelInstanceEnum = /** @class */ (function (_super) {
    __extends(ViewModelInstanceEnum, _super);
    function ViewModelInstanceEnum(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceEnum.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModelInstanceEnum.prototype, "valueIndex", {
        get: function () {
            return this._viewModelInstanceValue
                .valueIndex;
        },
        set: function (val) {
            this._viewModelInstanceValue.valueIndex = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModelInstanceEnum.prototype, "values", {
        get: function () {
            return this._viewModelInstanceValue.values;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceEnum.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceEnum;
}(ViewModelInstanceValue));

var ViewModelInstanceList = /** @class */ (function (_super) {
    __extends(ViewModelInstanceList, _super);
    function ViewModelInstanceList(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceList.prototype, "length", {
        get: function () {
            return this._viewModelInstanceValue.size;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceList.prototype.addInstance = function (instance) {
        if (instance.runtimeInstance != null) {
            this._viewModelInstanceValue.addInstance(instance.runtimeInstance);
            instance.addParent(this._parentViewModel);
        }
    };
    ViewModelInstanceList.prototype.addInstanceAt = function (instance, index) {
        if (instance.runtimeInstance != null) {
            if (this._viewModelInstanceValue.addInstanceAt(instance.runtimeInstance, index)) {
                instance.addParent(this._parentViewModel);
                return true;
            }
        }
        return false;
    };
    ViewModelInstanceList.prototype.removeInstance = function (instance) {
        if (instance.runtimeInstance != null) {
            this._viewModelInstanceValue.removeInstance(instance.runtimeInstance);
            instance.removeParent(this._parentViewModel);
        }
    };
    ViewModelInstanceList.prototype.removeInstanceAt = function (index) {
        this._viewModelInstanceValue.removeInstanceAt(index);
    };
    ViewModelInstanceList.prototype.instanceAt = function (index) {
        var runtimeInstance = this._viewModelInstanceValue.instanceAt(index);
        if (runtimeInstance != null) {
            var viewModelInstance = new ViewModelInstance(runtimeInstance, this._parentViewModel);
            (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createFinalization)(viewModelInstance, runtimeInstance);
            return viewModelInstance;
        }
        return null;
    };
    ViewModelInstanceList.prototype.swap = function (a, b) {
        this._viewModelInstanceValue.swap(a, b);
    };
    ViewModelInstanceList.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceList;
}(ViewModelInstanceValue));

var ViewModelInstanceColor = /** @class */ (function (_super) {
    __extends(ViewModelInstanceColor, _super);
    function ViewModelInstanceColor(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceColor.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceColor.prototype.rgb = function (r, g, b) {
        this._viewModelInstanceValue.rgb(r, g, b);
    };
    ViewModelInstanceColor.prototype.rgba = function (r, g, b, a) {
        this._viewModelInstanceValue.argb(a, r, g, b);
    };
    ViewModelInstanceColor.prototype.argb = function (a, r, g, b) {
        this._viewModelInstanceValue.argb(a, r, g, b);
    };
    // Value 0 to 255
    ViewModelInstanceColor.prototype.alpha = function (a) {
        this._viewModelInstanceValue.alpha(a);
    };
    // Value 0 to 1
    ViewModelInstanceColor.prototype.opacity = function (o) {
        this._viewModelInstanceValue.alpha(Math.round(Math.max(0, Math.min(1, o)) * 255));
    };
    ViewModelInstanceColor.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceColor;
}(ViewModelInstanceValue));

var ViewModelInstanceAssetImage = /** @class */ (function (_super) {
    __extends(ViewModelInstanceAssetImage, _super);
    function ViewModelInstanceAssetImage(instance, root) {
        return _super.call(this, instance, root) || this;
    }
    Object.defineProperty(ViewModelInstanceAssetImage.prototype, "value", {
        set: function (image) {
            var _a;
            this._viewModelInstanceValue.value((_a = image === null || image === void 0 ? void 0 : image.nativeImage) !== null && _a !== void 0 ? _a : null);
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceAssetImage.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceAssetImage;
}(ViewModelInstanceValue));

var ViewModelInstanceArtboard = /** @class */ (function (_super) {
    __extends(ViewModelInstanceArtboard, _super);
    function ViewModelInstanceArtboard(instance, root) {
        return _super.call(this, instance, root) || this;
    }
    Object.defineProperty(ViewModelInstanceArtboard.prototype, "value", {
        set: function (artboard) {
            var _a;
            var bindableArtboard;
            if (artboard.isBindableArtboard) {
                bindableArtboard = artboard;
            }
            else {
                bindableArtboard = artboard.file.internalBindableArtboardFromArtboard(artboard.nativeArtboard);
            }
            this._viewModelInstanceValue.value((_a = bindableArtboard === null || bindableArtboard === void 0 ? void 0 : bindableArtboard.nativeArtboard) !== null && _a !== void 0 ? _a : null);
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceArtboard.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceArtboard;
}(ViewModelInstanceValue));

// Loads Rive data from a URI via fetch.
var loadRiveFile = function (src) { return __awaiter(void 0, void 0, void 0, function () {
    var req, res, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = new Request(src);
                return [4 /*yield*/, fetch(req)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.arrayBuffer()];
            case 2:
                buffer = _a.sent();
                return [2 /*return*/, buffer];
        }
    });
}); };
// #endregion
// #region utility functions
/*
 * Utility function to ensure an object is a string array
 */
var mapToStringArray = function (obj) {
    if (typeof obj === "string") {
        return [obj];
    }
    else if (obj instanceof Array) {
        return obj;
    }
    // If obj is undefined, return empty array
    return [];
};
// #endregion
// #region testing utilities
// Exports to only be used for tests
var Testing = {
    EventManager: EventManager,
    TaskQueueManager: TaskQueueManager,
};
// #endregion
// #region asset loaders
/**
 * Decodes bytes into an audio asset.
 *
 * Be sure to call `.unref()` on the audio once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeAudio = function (bytes) { return __awaiter(void 0, void 0, void 0, function () {
    var decodedPromise, audio, audioWrapper;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                decodedPromise = new Promise(function (resolve) {
                    return RuntimeLoader.getInstance(function (rive) {
                        rive.decodeAudio(bytes, resolve);
                    });
                });
                return [4 /*yield*/, decodedPromise];
            case 1:
                audio = _a.sent();
                audioWrapper = new _utils__WEBPACK_IMPORTED_MODULE_3__.AudioWrapper(audio);
                _utils__WEBPACK_IMPORTED_MODULE_3__.finalizationRegistry.register(audioWrapper, audio);
                return [2 /*return*/, audioWrapper];
        }
    });
}); };
/**
 * Decodes bytes into an image.
 *
 * Be sure to call `.unref()` on the image once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeImage = function (bytes) { return __awaiter(void 0, void 0, void 0, function () {
    var decodedPromise, image, imageWrapper;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                decodedPromise = new Promise(function (resolve) {
                    return RuntimeLoader.getInstance(function (rive) {
                        rive.decodeImage(bytes, resolve);
                    });
                });
                return [4 /*yield*/, decodedPromise];
            case 1:
                image = _a.sent();
                imageWrapper = new _utils__WEBPACK_IMPORTED_MODULE_3__.ImageWrapper(image);
                _utils__WEBPACK_IMPORTED_MODULE_3__.finalizationRegistry.register(imageWrapper, image);
                return [2 /*return*/, imageWrapper];
        }
    });
}); };
/**
 * Decodes bytes into a font.
 *
 * Be sure to call `.unref()` on the font once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeFont = function (bytes) { return __awaiter(void 0, void 0, void 0, function () {
    var decodedPromise, font, fontWrapper;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                decodedPromise = new Promise(function (resolve) {
                    return RuntimeLoader.getInstance(function (rive) {
                        rive.decodeFont(bytes, resolve);
                    });
                });
                return [4 /*yield*/, decodedPromise];
            case 1:
                font = _a.sent();
                fontWrapper = new _utils__WEBPACK_IMPORTED_MODULE_3__.FontWrapper(font);
                _utils__WEBPACK_IMPORTED_MODULE_3__.finalizationRegistry.register(fontWrapper, font);
                return [2 /*return*/, fontWrapper];
        }
    });
}); };
// #endregion

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=rive.js.map