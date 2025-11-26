/*:
 * @plugindesc (MV) Scales Message & Choice windows for 1080p; compatible with YEP_MessageCore. (ES5)
 * @author John Paul Fusin
 *
 * @help
 * Place BELOW Community_Basic and YEP_MessageCore.
 * This plugin overrides YEP's message width/rows AFTER it loads, so your settings here win.
 *
 * Suggested 1080p (1920x1080) starting values:
 *  - Message Width Offset: 120
 *  - Message Rows: 6
 *  - Message Font Size: 36
 *  - Line Height: 40
 *  - Window Padding: 18
 *  - Choice Max Width: 900
 *  - Choice Rows: 8
 *
 * Works with faces, name windows, number input, and choices.
 * If you later prefer YEP's own width/rows again, just turn "Override Width/Rows"
 * to OFF (or move this plugin above YEP).
 *
 * @param Override Width/Rows
 * @type boolean
 * @on YES
 * @off NO
 * @desc If ON, override YEP's message width and rows using the params below.
 * @default true
 *
 * @param Message Width Offset
 * @type number
 * @min 0
 * @desc Screen width minus this value becomes message window width.
 * @default 120
 *
 * @param Message Rows
 * @type number
 * @min 2
 * @max 12
 * @desc Visible rows in the message window (only when Override is ON).
 * @default 6
 *
 * @param Message Font Size
 * @type number
 * @min 12
 * @max 64
 * @desc Base font size for windows (message, choices, number input, etc.).
 * @default 36
 *
 * @param Line Height
 * @type number
 * @min 24
 * @max 64
 * @desc Height per line. Usually FontSize + 4~8. Leave 0 to auto = FontSize + 4.
 * @default 40
 *
 * @param Window Padding
 * @type number
 * @min 0
 * @max 48
 * @desc Inner padding for standard windows.
 * @default 18
 *
 * @param Center Message
 * @type boolean
 * @on YES
 * @off NO
 * @desc Center the message window horizontally.
 * @default true
 *
 * @param Choice Max Width
 * @type number
 * @min 240
 * @desc Max width for choices (kept <= screen - offset).
 * @default 900
 *
 * @param Choice Rows
 * @type number
 * @min 4
 * @max 12
 * @desc Max visible rows in the choice list.
 * @default 8
 *
 * @param Sync Choice Font
 * @type boolean
 * @on YES
 * @off NO
 * @desc Apply Message Font Size and Line Height to choices too.
 * @default true
 */

(function () {
  var N = 'MessageResize_YEP';
  var P = PluginManager.parameters(N);

  function b(x, d) {
    return String(P[x] || d).toLowerCase() === 'true';
  }
  function n(x, d) {
    var v = Number(P[x]);
    return isNaN(v) ? d : v;
  }

  var overrideWR = b('Override Width/Rows', true);
  var widthOffset = n('Message Width Offset', 120);
  var messageRows = n('Message Rows', 6);
  var baseFontSize = n('Message Font Size', 36);
  var lineHeight = n('Line Height', 0);
  var padding = n('Window Padding', 18);
  var centerMsg = b('Center Message', true);
  var choiceMax = n('Choice Max Width', 900);
  var choiceRows = n('Choice Rows', 8);
  var syncChoice = b('Sync Choice Font', true);

  // ---- Global window feel (font size, padding, line height) ----
  var _Window_Base_standardFontSize = Window_Base.prototype.standardFontSize;
  Window_Base.prototype.standardFontSize = function () {
    return baseFontSize;
  };

  var _Window_Base_standardPadding = Window_Base.prototype.standardPadding;
  Window_Base.prototype.standardPadding = function () {
    return padding;
  };

  var _Window_Base_lineHeight = Window_Base.prototype.lineHeight;
  Window_Base.prototype.lineHeight = function () {
    // If user set 0, auto = font + 4
    return lineHeight > 0 ? lineHeight : this.standardFontSize() + 4;
  };

  // ---- Message window sizing (post-YEP override) ----
  // Only override width/rows when the toggle is ON.
  if (overrideWR) {
    Window_Message.prototype.windowWidth = function () {
      return Math.max(240, Graphics.boxWidth - widthOffset);
    };

    Window_Message.prototype.numVisibleRows = function () {
      return messageRows;
    };
  }

  // Keep the message window centered at the bottom if desired.
  var _Window_Message_updatePlacement =
    Window_Message.prototype.updatePlacement;
  Window_Message.prototype.updatePlacement = function () {
    _Window_Message_updatePlacement.call(this);
    if (overrideWR) this.width = this.windowWidth();
    if (centerMsg) this.x = Math.floor((Graphics.boxWidth - this.width) / 2);
  };

  // ---- Choice window polish ----
  // Wider choices to fit larger fonts; cap to screen minus offset.
  Window_ChoiceList.prototype.maxChoiceWidth = function () {
    var cap = Math.max(240, Graphics.boxWidth - widthOffset);
    return Math.min(cap, choiceMax);
  };

  // More visible rows for 1080p
  Window_ChoiceList.prototype.numVisibleRows = function () {
    return choiceRows;
  };

  // Sync choice fonts/line height with message for visual consistency
  var _Window_ChoiceList_resetFontSettings =
    Window_ChoiceList.prototype.resetFontSettings;
  Window_ChoiceList.prototype.resetFontSettings = function () {
    _Window_ChoiceList_resetFontSettings.call(this);
    if (syncChoice) {
      this.contents.fontSize = baseFontSize;
    }
  };

  // ---- Input windows (number/name) feel tiny at 1080p—bump fonts ----
  var _Window_NumberInput_start = Window_NumberInput.prototype.start;
  Window_NumberInput.prototype.start = function () {
    _Window_NumberInput_start.call(this);
    this.resetFontSettings();
  };

  var _Window_NameInput_start = Window_NameInput.prototype.start;
  Window_NameInput.prototype.start = function () {
    _Window_NameInput_start.call(this);
    this.resetFontSettings();
  };
})();
