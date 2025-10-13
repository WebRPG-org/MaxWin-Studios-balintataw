/*:
 * @plugindesc ES5: In‑game webcam preview without Python/Flask. Captures the user's camera via getUserMedia and renders inside RPG Maker MV (NW.js only).
 * @author John Paul Fusin
 *
 * @param ShowOnStartup
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc Show the webcam preview automatically when the map loads.
 *
 * @param Width
 * @type number
 * @min 16
 * @default 320
 * @desc Preview width in pixels.
 *
 * @param Height
 * @type number
 * @min 16
 * @default 240
 * @desc Preview height in pixels.
 *
 * @param X
 * @type number
 * @default 0
 * @desc Screen X of the preview sprite.
 *
 * @param Y
 * @type number
 * @default 0
 * @desc Screen Y of the preview sprite.
 *
 * @param Mirror
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc Mirror the preview horizontally (selfie view).
 *
 * @param Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * @desc Sprite opacity (0-255).
 *
 * @param FPS
 * @type number
 * @min 5
 * @max 60
 * @default 30
 * @desc Target frame capture rate.
 *
 * @help
 * === What this plugin does ===
 * - Uses the browser's MediaDevices API to show a live webcam feed directly in game.
 * - No Python, no external installs for the player. Works in MV desktop (NW.js) and in browser (if allowed).
 *
 * === Permissions ===
 * - The first run will ask for camera permission. In packaged NW.js you can auto-approve with
 *   package.json → { "chromium-args": "--use-fake-ui-for-media-stream" }
 *   (This auto-accepts the permission UI; it does NOT use a fake camera.)
 *
 * === Plugin Commands (MV) ===
 *   CAM_SHOW                 # show/start the webcam preview
 *   CAM_HIDE                 # hide/stop the webcam preview
 *   CAM_TOGGLE               # toggle visibility
 *   CAM_SET_OPACITY 0..255   # change opacity
 *   CAM_SET_POS x y          # move sprite
 *   CAM_MIRROR ON|OFF        # mirror toggle
 *   CAM_SET_SIZE w h         # resize
 *
 * Known notes:
 * - Some older GPUs may need drivers updated for camera decode.
 * - If you need to stream to external devices like your Flask/MJPEG did, use WebRTC/DataChannel or keep ESP32-CAM.
 */

/* global Scene_Map, Graphics, PluginManager */
(function () {
  'use strict';

  var params = PluginManager.parameters('WebcamInGame');
  if (!params || !params.hasOwnProperty('ShowOnStartup')) {
    // fallback if filename was changed
    var keys = Object.keys(PluginManager._parameters);
    for (var i = 0; i < keys.length; i++) {
      var c = PluginManager._parameters[keys[i]];
      if (c && c.hasOwnProperty('ShowOnStartup')) {
        params = c;
        break;
      }
    }
  }
  params = params || {};

  var P_SHOW = String(params['ShowOnStartup'] || 'false') === 'true';
  var P_W = Number(params['Width'] || 320);
  var P_H = Number(params['Height'] || 240);
  var P_X = Number(params['X'] || 0);
  var P_Y = Number(params['Y'] || 0);
  var P_MIR = String(params['Mirror'] || 'true') === 'true';
  var P_OP = Number(params['Opacity'] || 255);
  var P_FPS = Math.max(5, Math.min(60, Number(params['FPS'] || 30)));

  // Singleton state
  var Webcam = {
    _video: null,
    _canvas: null,
    _ctx: null,
    _sprite: null,
    _texture: null,
    _stream: null,
    _timer: null,
    _running: false,
    _w: P_W,
    _h: P_H,
    _x: P_X,
    _y: P_Y,
    _mirror: P_MIR,
    _opacity: P_OP,

    ensureElements: function () {
      if (!this._video) {
        var v = document.createElement('video');
        v.setAttribute('playsinline', '');
        v.setAttribute('autoplay', '');
        v.muted = true;
        v.width = this._w;
        v.height = this._h;
        v.style.display = 'none';
        document.body.appendChild(v);
        this._video = v;
      }
      if (!this._canvas) {
        var c = document.createElement('canvas');
        c.width = this._w;
        c.height = this._h;
        this._canvas = c;
        this._ctx = c.getContext('2d');
      }
      if (!this._texture) {
        this._texture = new PIXI.Texture(new PIXI.BaseTexture(this._canvas));
      }
      if (!this._sprite) {
        var s = new PIXI.Sprite(this._texture);
        s.x = this._x;
        s.y = this._y;
        s.alpha = this._opacity / 255.0;
        this._sprite = s;
      }
    },

    addToScene: function (scene) {
      this.ensureElements();
      if (scene && scene.addChild && this._sprite && !this._sprite.parent) {
        scene.addChild(this._sprite);
      }
    },

    _captureOnce: function () {
      if (!this._running || !this._video || !this._ctx) return;
      var w = this._w,
        h = this._h;
      this._canvas.width = w;
      this._canvas.height = h;
      this._ctx.save();
      if (this._mirror) {
        this._ctx.translate(w, 0);
        this._ctx.scale(-1, 1);
      }
      try {
        this._ctx.drawImage(this._video, 0, 0, w, h);
      } catch (e) {
        // drawImage may throw before the first frame is ready
      }
      this._ctx.restore();
      if (this._texture && this._texture.baseTexture)
        this._texture.baseTexture.update();
    },

    start: function () {
      var self = this;
      if (this._running) return Promise.resolve();
      this.ensureElements();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return Promise.reject(new Error('getUserMedia not supported'));
      }
      return navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (stream) {
          self._stream = stream;
          try {
            self._video.srcObject = stream;
          } catch (e) {
            self._video.src = window.URL.createObjectURL(stream);
          }
          self._video.play();
          self._running = true;
          // capture loop
          var interval = Math.round(1000 / P_FPS);
          self._timer = setInterval(function () {
            self._captureOnce();
          }, interval);
        });
    },

    stop: function () {
      this._running = false;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
      if (this._stream) {
        var tracks = this._stream.getTracks ? this._stream.getTracks() : [];
        for (var i = 0; i < tracks.length; i++) {
          try {
            tracks[i].stop();
          } catch (e) {}
        }
        this._stream = null;
      }
      if (this._video) {
        try {
          this._video.pause();
        } catch (e) {}
      }
    },

    visible: function () {
      return !!(this._sprite && this._sprite.parent);
    },
    show: function (scene) {
      this.addToScene(scene || SceneManager._scene);
    },
    hide: function () {
      if (this._sprite && this._sprite.parent) {
        this._sprite.parent.removeChild(this._sprite);
      }
    },

    setOpacity: function (v) {
      this._opacity = Math.max(0, Math.min(255, Number(v) || 0));
      if (this._sprite) this._sprite.alpha = this._opacity / 255;
    },
    setPos: function (x, y) {
      this._x = Number(x) || 0;
      this._y = Number(y) || 0;
      if (this._sprite) {
        this._sprite.x = this._x;
        this._sprite.y = this._y;
      }
    },
    setSize: function (w, h) {
      this._w = Math.max(16, Number(w) || this._w);
      this._h = Math.max(16, Number(h) || this._h);
      if (this._video) {
        this._video.width = this._w;
        this._video.height = this._h;
      }
    },
    setMirror: function (on) {
      this._mirror = !!(String(on).toLowerCase() === 'on' || on === true);
    },
  };

  // Hook into Scene_Map lifecycle
  var _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function () {
    _Scene_Map_start.call(this);
    if (P_SHOW) {
      Webcam.start()
        .then(function () {
          Webcam.show(SceneManager._scene);
        })
        .catch(function (e) {
          console.error('[WebcamInGame] start failed:', e);
        });
    }
  };

  // Cleanup on map termination
  var _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function () {
    _Scene_Map_terminate.call(this);
    Webcam.hide();
    Webcam.stop();
  };

  // Plugin commands
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    var cmd = String(command || '').toUpperCase();
    if (cmd === 'CAM_SHOW') {
      var scene = SceneManager._scene;
      Webcam.start()
        .then(function () {
          Webcam.show(scene);
        })
        .catch(function (e) {
          console.error('[WebcamInGame] CAM_SHOW failed:', e);
        });
    } else if (cmd === 'CAM_HIDE') {
      Webcam.hide();
      Webcam.stop();
    } else if (cmd === 'CAM_TOGGLE') {
      if (Webcam.visible()) {
        Webcam.hide();
      } else {
        var sc = SceneManager._scene;
        Webcam.start().then(function () {
          Webcam.show(sc);
        });
      }
    } else if (cmd === 'CAM_SET_OPACITY') {
      Webcam.setOpacity(args && args[0]);
    } else if (cmd === 'CAM_SET_POS') {
      Webcam.setPos(args && args[0], args && args[1]);
    } else if (cmd === 'CAM_MIRROR') {
      Webcam.setMirror(args && args[0]);
    } else if (cmd === 'CAM_SET_SIZE') {
      Webcam.setSize(args && args[0], args && args[1]);
    }
  };

  // Expose a tiny public bridge for other plugins (ES5-safe)
  window.WebcamInGame = {
    start: function () {
      return Webcam.start();
    },
    show: function () {
      Webcam.show(SceneManager._scene);
    },
    hide: function () {
      Webcam.hide();
    },
    stop: function () {
      Webcam.stop();
    },
    getFeedEl: function () {
      // Prefer <video> element when available; fall back to the backing canvas
      return Webcam._video || Webcam._canvas || null;
    },
  };
})();
