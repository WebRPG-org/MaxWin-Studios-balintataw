/*:
 * @target MZ MV
 * @plugindesc Automatically opens NW.js developer console on playtest.
 * @author John Paul Fusin
 *
 * @help This plugin opens the dev console automatically when the game starts.
 */

(() => {
if (Utils.isNwjs() && Utils.isOptionValid("test")) {
  const _win = require('nw.gui').Window.get();
  _win.showDevTools();
}
})();
