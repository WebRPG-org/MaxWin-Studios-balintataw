/*:
 * @plugindesc Blink Detection v1.0
 * @author John Paul Fusin
 * @param HUD Position
 * @type select
 * @option Top-Left
 * @option Top-Right
 * @option Bottom-Left
 * @option Bottom-Right
 * @default Top-Left
 *
 * @param HUD Opacity
 * @type number
 * @min 0
 * @max 1
 * @decimals 1
 * @default 0.8
 *
 * @param Blink Sensitivity
 * @type number
 * @decimals 2
 * @default 0.22
 *
 * @param Use ESP32-CAM
 * @type boolean
 * @default false
 *
 * @param ESP32-CAM IP
 * @type string
 * @default http://192.168.1.12/cam-lo.jpg
 *
 * @help
 * BlinkDetector v1.0 (EAR-based)
 * -------------------------------
 * Detects player blinks via webcam or ESP32-CAM snapshot feed.
 * Includes HUD counter, camera preview, event triggers, and ESP32 auto-reconnect.
 *
 * Plugin Commands:
 *   BlinkDetector Start [SwitchID] [CommonEventID]
 *   BlinkDetector Stop
 *
 * Controls:
 *   H - Toggle HUD
 *   P - Toggle Camera Preview
 */

(function () {
  var params = PluginManager.parameters('BlinkDetector');
  var hudPos = String(params['HUD Position'] || 'Top-Left');
  var hudOpacity = Number(params['HUD Opacity'] || 0.8);
  var blinkSensitivity = Number(params['Blink Sensitivity'] || 0.22);
  var useESP32 = params['Use ESP32-CAM'] === 'true';
  var esp32IP = String(params['ESP32-CAM IP'] || '');

  var video = null;
  var img = null;
  var espReloadInterval = null;
  var detector = null;
  var detecting = false;
  var targetSwitch = 0;
  var targetCommonEvent = 0;
  var lastBlinkTime = 0;
  var hud = null;
  var blinkCount = 0;
  var hudVisible = true;
  var previewVisible = false;
  var previewBox = null;

  // Auto-reconnect for ESP32
  var reconnectAttempts = 0;
  var maxReconnectAttempts = 12;
  var reconnecting = false;
  var reconnectBaseDelay = 2000;
  var reconnectTimer = null;

  // EAR calculation helper
  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function calcEAR(kp, indices) {
    var p1 = kp[indices[0]],
      p2 = kp[indices[1]],
      p3 = kp[indices[2]],
      p4 = kp[indices[3]],
      p5 = kp[indices[4]],
      p6 = kp[indices[5]];
    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 1.0;
    var vert1 = dist(p2, p6);
    var vert2 = dist(p3, p5);
    var horiz = dist(p1, p4);
    return (vert1 + vert2) / (2.0 * horiz);
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  //--------------------------------------------------
  // HUD
  //--------------------------------------------------
  function createHUD() {
    if (hud) return;
    hud = document.createElement('div');
    Object.assign(hud.style, {
      position: 'fixed',
      padding: '8px 12px',
      background: 'rgba(0,0,0,' + hudOpacity + ')',
      color: 'white',
      fontFamily: 'monospace',
      borderRadius: '8px',
      zIndex: '9999',
      fontSize: '14px',
      opacity: '1',
      pointerEvents: 'none',
    });

    if (hudPos === 'Top-Right') {
      hud.style.top = '10px';
      hud.style.right = '10px';
    } else if (hudPos === 'Bottom-Left') {
      hud.style.bottom = '10px';
      hud.style.left = '10px';
    } else if (hudPos === 'Bottom-Right') {
      hud.style.bottom = '10px';
      hud.style.right = '10px';
    } else {
      hud.style.top = '10px';
      hud.style.left = '10px';
    }
    hud.innerHTML = 'Blink Detector Ready<br>Blinks: 0';
    document.body.appendChild(hud);
  }

  function updateHUD(status, color) {
    if (!hud) createHUD();
    hud.style.color = color || 'white';
    hud.innerHTML = status + '<br>Blinks: ' + blinkCount;
  }

  function toggleHUD() {
    hudVisible = !hudVisible;
    if (hud) hud.style.opacity = hudVisible ? '1' : '0';
  }

  //--------------------------------------------------
  // Preview
  //--------------------------------------------------
  function createPreviewBox() {
    if (previewBox) return;
    previewBox = document.createElement('div');
    Object.assign(previewBox.style, {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '160px',
      height: '120px',
      border: '2px solid lime',
      borderRadius: '8px',
      overflow: 'hidden',
      zIndex: '9998',
      display: 'none',
      background: '#000',
    });
    document.body.appendChild(previewBox);
  }

  function togglePreview() {
    previewVisible = !previewVisible;
    if (!previewBox) createPreviewBox();
    previewBox.style.display = previewVisible ? 'block' : 'none';
    var feed = video || img;
    if (previewVisible && feed && !previewBox.contains(feed)) {
      previewBox.innerHTML = '';
      previewBox.appendChild(feed);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key && e.key.toLowerCase() === 'h') toggleHUD();
    if (e.key && e.key.toLowerCase() === 'p') togglePreview();
  });

  //--------------------------------------------------
  // ESP32 helpers
  //--------------------------------------------------
  function clearReconnectState() {
    reconnectAttempts = 0;
    reconnecting = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect() {
    if (!useESP32) return;
    if (reconnecting) return;
    reconnecting = true;
    reconnectAttempts = 0;
    updateHUD('🔄 Reconnecting ESP32...', 'orange');
    tryReconnect();
  }

  function tryReconnect() {
    reconnectAttempts++;
    if (reconnectAttempts > maxReconnectAttempts) {
      updateHUD('🔴 ESP32 reconnect failed', 'red');
      reconnecting = false;
      return;
    }
    var delay = reconnectBaseDelay * Math.pow(1.5, reconnectAttempts - 1);
    reconnectTimer = setTimeout(function () {
      startESP32Feed()
        .then(function () {
          updateHUD('🟢 ESP32 Reconnected', 'lime');
          clearReconnectState();
        })
        .catch(function () {
          reconnecting = false;
          tryReconnect();
        });
    }, delay);
  }

  //--------------------------------------------------
  // Feed setup
  //--------------------------------------------------
  function appendCacheBuster(url) {
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + 'cb=' + Date.now();
  }

  function loadImageOnce(imgEl, url, timeout) {
    timeout = timeout || 5000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          reject(new Error('Timeout'));
        }
      }, timeout);
      imgEl.onload = function () {
        if (!done) {
          done = true;
          clearTimeout(timer);
          resolve();
        }
      };
      imgEl.onerror = function () {
        if (!done) {
          done = true;
          clearTimeout(timer);
          reject(new Error('Image error'));
        }
      };
      imgEl.src = appendCacheBuster(url);
    });
  }

  function waitForNonZeroSize(el, type, timeout) {
    timeout = timeout || 5000;
    return new Promise(function (resolve, reject) {
      var start = Date.now();
      (function check() {
        var w = type === 'video' ? el.videoWidth : el.naturalWidth;
        var h = type === 'video' ? el.videoHeight : el.naturalHeight;
        if (w > 0 && h > 0) resolve();
        else if (Date.now() - start > timeout) reject(new Error('No frame'));
        else requestAnimationFrame(check);
      })();
    });
  }

  function cleanupMedia() {
    if (espReloadInterval) clearInterval(espReloadInterval);
    espReloadInterval = null;
    if (img)
      try {
        img.remove();
      } catch (e) {}
    img = null;
    if (video) {
      try {
        if (video.srcObject) {
          var tracks = video.srcObject.getTracks();
          for (var i = 0; i < tracks.length; i++) tracks[i].stop();
        }
        video.remove();
      } catch (e) {}
      video = null;
    }
  }

  function startESP32Feed() {
    return new Promise(function (resolve, reject) {
      cleanupMedia();
      img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      document.body.appendChild(img);

      img.onerror = function () {
        updateHUD('⚠️ ESP32 error', 'orange');
        scheduleReconnect();
      };

      loadImageOnce(img, esp32IP, 4000)
        .then(function () {
          espReloadInterval = setInterval(function () {
            try {
              img.src = appendCacheBuster(esp32IP);
            } catch (e) {}
          }, 450);
          resolve();
        })
        .catch(reject);
    });
  }

  async function initCamera() {
    cleanupMedia();
    if (useESP32) {
      try {
        await startESP32Feed();
        await waitForNonZeroSize(img, 'image', 5000);
        updateHUD('🟢 ESP32 Connected', 'lime');
        clearReconnectState();
        return;
      } catch (err) {
        updateHUD('🔴 ESP32 Failed', 'red');
        scheduleReconnect();
        return;
      }
    }

    video = document.createElement('video');
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    document.body.appendChild(video);
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await waitForNonZeroSize(video, 'video', 5000);
      updateHUD('🟢 Webcam Active', 'lime');
    } catch (err) {
      updateHUD('🔴 Webcam Failed', 'red');
      throw err;
    }
  }

  //--------------------------------------------------
  // Detector + EAR Blink Logic
  //--------------------------------------------------
  async function setupDetector() {
    var model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    detector = await faceLandmarksDetection.createDetector(model, {
      runtime: 'tfjs',
    });
    updateHUD('🟢 Detection Ready', 'lime');
  }

  async function detectBlinkLoop() {
    updateHUD('🟢 Detecting blinks...', 'lime');
    var smoothEAR = [];
    var SMOOTH = 5;

    while (detecting) {
      try {
        var feed = video || img;
        if (!feed) {
          await sleep(300);
          continue;
        }

        var faces = await detector.estimateFaces(feed);
        if (faces && faces.length > 0) {
          var kp = faces[0].keypoints;
          var leftEAR = calcEAR(kp, [33, 160, 158, 133, 153, 144]);
          var rightEAR = calcEAR(kp, [362, 385, 387, 263, 373, 380]);
          var ear = (leftEAR + rightEAR) / 2;

          smoothEAR.push(ear);
          if (smoothEAR.length > SMOOTH) smoothEAR.shift();
          var smoothed =
            smoothEAR.reduce(function (a, b) {
              return a + b;
            }, 0) / smoothEAR.length;

          if (
            smoothed < blinkSensitivity &&
            Date.now() - lastBlinkTime > 1000
          ) {
            lastBlinkTime = Date.now();
            blinkCount++;
            updateHUD('🔵 Blink Detected', 'cyan');
            triggerActions();
            setTimeout(function () {
              updateHUD('🟢 Detecting blinks...', 'lime');
            }, 800);
          }
        } else {
          updateHUD('⚪ No face detected', 'gray');
        }
      } catch (err) {
        if (useESP32) scheduleReconnect();
      }
      await sleep(150);
    }
  }

  //--------------------------------------------------
  // Triggers
  //--------------------------------------------------
  function triggerActions() {
    if (targetSwitch > 0) {
      $gameSwitches.setValue(targetSwitch, true);
      setTimeout(function () {
        $gameSwitches.setValue(targetSwitch, false);
      }, 300);
    }
    if (targetCommonEvent > 0) {
      var ce = $dataCommonEvents[targetCommonEvent];
      if (ce) {
        var interpreter = new Game_Interpreter();
        interpreter.setup(ce.list);
        interpreter.executeCommand();
      }
    }
  }

  //--------------------------------------------------
  // Start / Stop
  //--------------------------------------------------
  async function startDetection(switchId, commonEventId) {
    if (detecting) return;
    targetSwitch = Number(switchId) || 0;
    targetCommonEvent = Number(commonEventId) || 0;
    detecting = true;
    blinkCount = 0;
    createHUD();
    createPreviewBox();
    updateHUD('🟡 Initializing...', 'yellow');

    try {
      await initCamera();
      await setupDetector();
      detectBlinkLoop();
    } catch (err) {
      updateHUD('❌ Failed to Start', 'red');
      detecting = false;
    }
  }

  function stopDetection() {
    detecting = false;
    cleanupMedia();
    if (hud)
      try {
        hud.remove();
      } catch (e) {}
    if (previewBox)
      try {
        previewBox.remove();
      } catch (e) {}
    clearReconnectState();
  }

  //--------------------------------------------------
  // Plugin Commands
  //--------------------------------------------------
  var _cmd = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _cmd.call(this, command, args);
    if (command === 'BlinkDetector') {
      var sub = args[0];
      if (sub === 'Start') startDetection(args[1], args[2]);
      else if (sub === 'Stop') stopDetection();
    }
  };
})();
