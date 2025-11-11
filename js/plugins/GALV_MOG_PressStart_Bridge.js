/*:
 * @plugindesc Bridge: Make GALV "Press Start" gate MOG Title Picture Commands (ES5)
 * @author John Paul Fusin
 * @help
 * Load order:
 *   GALV_CustomTitle.js
 *   MOG_TitlePictureCom.js
 *   GALV_MOG_PressStart_Bridge.js (this)
 *
 * What it does:
 * - While GALV's Press Start is active, MOG's picture commands are hidden and input is blocked.
 * - After OK/Enter/Space/Z/Click, the overlay fades and MOG's UI fades in and activates.
 *
 * No parameters. Works out-of-the-box.
 */
(function () {
  'use strict';

  // Utility: safe check for a field
  function has(obj, key) {
    return obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  // Track gate state
  // 0 = no gate; 1 = waiting for press start; 2 = fading in commands
  var _Scene_Title_create = Scene_Title.prototype.create;
  Scene_Title.prototype.create = function () {
    _Scene_Title_create.call(this);

    // If GALV plugin is present and Press Start is currently active, gate MOG UI.
    this._mogGateState =
      typeof Galv !== 'undefined' &&
      has(this, '_pressStart') &&
      this._pressStart
        ? 1
        : 0;
    this._mogGateFade = 0;

    // If MOG created its HUD field already, start hidden while the gate is active.
    if (this._mogGateState === 1 && this._hudField) {
      this._hudField.visible = false;
      this._hudField.opacity = 0;
    }
    // Also make sure the (vanilla) command window isn't interactable until gate lifts.
    if (this._mogGateState === 1 && this._commandWindow) {
      this._commandWindow.deactivate();
      if (this._commandWindow.open) this._commandWindow.close();
    }
  };

  // Wrap MOG's updatePictureCommands so it doesn't run during the gate.
  var _updatePicCom = Scene_Title.prototype.updatePictureCommands;
  Scene_Title.prototype.updatePictureCommands = function () {
    // If we never entered a gate, just run MOG as usual.
    if (this._mogGateState === 0) return _updatePicCom.call(this);

    // STATE 1: Waiting for GALV press start to finish
    if (this._mogGateState === 1) {
      // GALV flips this._pressStart to false once OK/Touch triggers and begins fading the image out.
      // While it's true, keep MOG hidden and do nothing.
      if (this._pressStart) {
        if (this._hudField) {
          this._hudField.visible = false;
          this._hudField.opacity = 0;
        }
        // Block command window just in case
        if (this._commandWindow) this._commandWindow.deactivate();
        return; // suppress MOG input/animations
      }

      // When _pressStart just turned false, start a short fade-in for MOG UI.
      this._mogGateState = 2;
      this._mogGateFade = 30; // frames of fade-in
      if (this._hudField) {
        this._hudField.visible = true;
        this._hudField.opacity = 0;
      }
      // Open/activate command window so MOG can drive it (MOG uses its handlers).
      if (this._commandWindow) {
        if (this._commandWindow.open) this._commandWindow.open();
        this._commandWindow.activate();
      }
    }

    // STATE 2: Fade-in MOG UI, then fully hand over to MOG
    if (this._mogGateState === 2) {
      if (this._hudField) {
        var t = Math.max(0, Math.min(1, (30 - this._mogGateFade) / 30));
        this._hudField.opacity = Math.floor(255 * t);
      }
      this._mogGateFade--;
      if (this._mogGateFade <= 0) {
        // Fade finished — let MOG run normally from now on.
        this._mogGateState = 0;
      } else {
        // While fading, still suppress MOG's own update to avoid early clicks; just draw the fade.
        return;
      }
    }

    // Normal MOG update after gate is over
    return _updatePicCom.call(this);
  };

  // Optional: also keep GALV's command window closed while gating, in case other plugins poke it.
  var _Scene_Title_update = Scene_Title.prototype.update;
  Scene_Title.prototype.update = function () {
    _Scene_Title_update.call(this);

    if (this._mogGateState === 1) {
      if (this._commandWindow) {
        this._commandWindow.deactivate();
        if (this._commandWindow.open && this._commandWindow.isOpen()) {
          this._commandWindow.close();
        }
      }
    }
  };
})();
