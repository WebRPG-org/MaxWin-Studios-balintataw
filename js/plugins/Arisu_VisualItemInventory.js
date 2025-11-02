//=============================================================================
// Arisu's Dollhouse - Visual Item Inventory - for RPG Maker MV version 1.6.1
// Arisu_VisualItemInventory.js
//=============================================================================
/*:
 * @plugindesc <VisualItemInventory> created by Arisu's Dollhouse
 * @author Arisu's Dollhouse
 *
 * @help
 * == Introduction ==
 *
 * This plugin changes the item list displayed in-game to become more visual.
 * The item, weapon, and armor icons will be displayed enlarged and show the
 * count next to them while a tooltip displays the selected item's name.
 *
 * This is confirmed to work with the following plugins:
 * - YEP_ItemCore
 * - YEP_X_ItemPictureImg
 * - YEP_EquipCore
 * - YEP_ShopMenuCore
 * - YEP_VictoryAftermath
 *
 * == Instructions ==
 *
 * # Install this plugin into your RPG Maker MV project's js/plugin folder.
 * # Open your game project in RPG Maker MV and open up the Plugin Manager.
 * # Add a new plugin and place this plugin beneath all Yanfly plugins present.
 * # Adjust any Plugin Parameter settings to this plugin.
 * # Read through plugin help file to understand how to use plugin.
 * # When testing this plugin, save first.
 *
 * == Notetags ==
 *
 * Item, Weapon, Armor Notetags
 *
 *   <Cell BG Color: r, g, b, a>
 *   - Changes the color of the item's cell background color from default.
 *   - Replace 'r' with red value from 0 to 255.
 *   - Replace 'g' with green value from 0 to 255.
 *   - Replace 'b' with blue value from 0 to 255.
 *   - Replace 'a' with alpha value from 0 to 1.
 *
 * == Warning ==
 *
 * This plugin is made for RPG Maker MV versions 1.6.1 and below. If you update
 * RPG Maker MV past that and this plugin breaks, I am NOT responsible for it.
 *
 * == Terms of Use ==
 *
 * # For Free and Commercial Use.
 * # Put "Arisu's Dollhouse" in your game's credits.
 * # Do not redistribute this plugin without permission.
 * # Do not take code from this plugin without permission.
 * # Edit of code is allowed as long as it's within plugin file.
 * # I do not support changes made to code edit.
 *
 * == Changelog ==
 *
 * * None
 *
 * @param Settings
 *
 * @param AntiAliasIcons
 * @text Anti-Alias Icons?
 * @parent Settings
 * @type boolean
 * @on Smooth Icons
 * @off Pixelated Icons
 * @desc true: Anti-Alias
 * false: Pixelated
 * @default false
 *
 * @param ShowPicture
 * @text Show Picture?
 * @parent Settings
 * @type boolean
 * @on Use Picture
 * @off Use Icon
 * @desc true: Uses Picture (Requires YEP_X_ItemPictureImg.js)
 * false: Uses Icon
 * @default true
 *
 * @param AntiAliasPicture
 * @text Anti-Alias Picture?
 * @parent ShowPicture
 * @type boolean
 * @on Smooth Pictures
 * @off Pixelated Pictures
 * @desc true: Anti-Alias
 * false: Pixelated
 * @default true
 *
 * @param AffectedScenes
 * @text Affected Scenes
 * @parent Settings
 *
 * @param Scene_Item
 * @parent AffectedScenes
 * @type boolean
 * @on Affect Scene_Item
 * @off Ignore Scene_Item
 * @desc true: Affect
 * false: Ignore
 * @default true
 *
 * @param Scene_Equip
 * @parent AffectedScenes
 * @type boolean
 * @on Affect Scene_Equip
 * @off Ignore Scene_Equip
 * @desc true: Affect
 * false: Ignore
 * @default true
 *
 * @param Scene_Shop
 * @parent AffectedScenes
 * @type boolean
 * @on Affect Scene_Shop
 * @off Ignore Scene_Shop
 * @desc true: Affect
 * false: Ignore
 * @default true
 *
 * @param Scene_Battle
 * @parent AffectedScenes
 * @type boolean
 * @on Affect Scene_Battle
 * @off Ignore Scene_Battle
 * @desc true: Affect
 * false: Ignore
 * @default false
 *
 * @param CellSize
 * @text Cell Size
 * @parent Settings
 *
 * @param CellWidth
 * @text Width
 * @parent CellSize
 * @desc Pixel width of each item
 * @default 72
 *
 * @param CellHeight
 * @text Height
 * @parent CellSize
 * @desc Pixel height of each item
 * @default 72
 *
 * @param CellColors
 * @text Cell Colors
 * @parent Settings
 *
 * @param ConsumbleItemBgColor
 * @text Consumable Items
 * @parent CellColors
 * @desc format: rgba(red, green, blue, alpha)
 * rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(141, 198, 63, 0.5)
 *
 * @param UnusableItemBgColor
 * @text Unusable Items
 * @parent CellColors
 * @desc format: rgba(red, green, blue, alpha)
 * rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(183, 183, 183, 0.5)
 *
 * @param KeyItemBgColor
 * @text Key Items
 * @parent CellColors
 * @desc format: rgba(red, green, blue, alpha)
 * rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(255, 247, 153, 0.5)
 *
 * @param WeaponBgColor
 * @text Weapons
 * @parent CellColors
 * @desc format: rgba(red, green, blue, alpha)
 * rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(237, 28, 36, 0.5)
 *
 * @param ArmorBgColor
 * @text Armors
 * @parent CellColors
 * @desc format: rgba(red, green, blue, alpha)
 * rgba(0-255, 0-255, 0-255, 0-1)
 * @default rgba(109, 207, 246, 0.5)
 *
 * @param NameWindow
 * @text Name Window
 * @parent Settings
 *
 * @param FontSize
 * @text Font Size
 * @parent NameWindow
 * @desc Font size for name window
 * @default 16
 *
 */
//=============================================================================

var Imported = Imported || {};
Imported.Arisu_VisualItemInventory = true;
var parameters = $plugins.filter(function (p) {
    return p.description.contains("<VisualItemInventory>")
})[0].parameters;
var Arisu = Arisu || {};
Arisu.VisualItemInventory = {};
Arisu.ConvertParameters = function () {
    ["CellWidth", "CellHeight", "FontSize"].forEach(function (key) {
        Arisu.VisualItemInventory[key] = Number(parameters[key])
    }, this);
    ["AntiAliasIcons", "ShowPicture", "AntiAliasPicture", "Scene_Item", "Scene_Equip", "Scene_Shop", "Scene_Battle"].forEach(function (key) {
        Arisu.VisualItemInventory[key] = eval(parameters[key])
    }, this);
    ["ConsumbleItemBgColor", "UnusableItemBgColor", "KeyItemBgColor", "WeaponBgColor", "ArmorBgColor"].forEach(function (key) {
        Arisu.VisualItemInventory[key] = String(parameters[key])
    }, this)
}
();
DataManager.ArisuGetItemCellBgColor = function (item) {
    if (!item)
        return "rgba(0, 0, 0, 1)";
    if (item.note.match(/<Cell BG Color:[ ](.*)>/i)) {
        var array = String(RegExp.$1).split(",");
        var str = "rgba(" + (array[0] || 0) + "," + (array[1] || 0) + "," + (array[2] || 0) + "," + (array[3] || .5) + ")";
        return str
    }
    if (this.isItem(item)) {
        if (item.itypeId === 2) {
            return Arisu.VisualItemInventory.KeyItemBgColor
        } else if (item.consumable) {
            return Arisu.VisualItemInventory.ConsumbleItemBgColor
        } else {
            return Arisu.VisualItemInventory.UnusableItemBgColor
        }
    } else if (this.isWeapon(item)) {
        return Arisu.VisualItemInventory.WeaponBgColor
    } else if (this.isArmor(item)) {
        return Arisu.VisualItemInventory.ArmorBgColor
    }
    return "rgba(0, 0, 0, 0.5)"
};
Arisu.VisualItemInventory.Window_ItemList_initialize = Window_ItemList.prototype.initialize;
Window_ItemList.prototype.initialize = function (x, y, width, height) {
    Arisu.VisualItemInventory.Window_ItemList_initialize.call(this, x, y, width, height);
    this.ArisuCreateItemNameWindow()
};
Window_ItemList.prototype.ArisuValidVisualItemInventoryScenes = function () {
    if (Arisu.VisualItemInventory.Scene_Item && SceneManager._scene instanceof Scene_Item)
        return true;
    if (Arisu.VisualItemInventory.Scene_Equip && SceneManager._scene instanceof Scene_Equip)
        return true;
    if (Arisu.VisualItemInventory.Scene_Battle && SceneManager._scene instanceof Scene_Battle)
        return true;
    return false
};
Window_ShopSell.prototype.ArisuValidVisualItemInventoryScenes = function () {
    return Arisu.VisualItemInventory.Scene_Shop
};
Arisu.VisualItemInventory.Window_ItemList_maxCols = Window_ItemList.prototype.maxCols;
Window_ItemList.prototype.maxCols = function () {
    if (this.ArisuValidVisualItemInventoryScenes()) {
        this._maxCols = this._maxCols || Math.floor(this.contents.width / Arisu.VisualItemInventory.CellWidth);
        return this._maxCols
    } else {
        return Arisu.VisualItemInventory.Window_ItemList_maxCols.call(this)
    }
};
Arisu.VisualItemInventory.Window_ItemList_spacing = Window_ItemList.prototype.spacing;
Window_ItemList.prototype.spacing = function () {
    if (this.ArisuValidVisualItemInventoryScenes()) {
        return 0
    } else {
        return Arisu.VisualItemInventory.Window_ItemList_spacing.call(this)
    }
};
Arisu.VisualItemInventory.Window_ItemList_itemHeight = Window_ItemList.prototype.itemHeight;
Window_ItemList.prototype.itemHeight = function () {
    if (this.ArisuValidVisualItemInventoryScenes()) {
        this._itemHeight = this._itemHeight || Arisu.VisualItemInventory.CellHeight;
        return this._itemHeight
    } else {
        return Arisu.VisualItemInventory.Window_ItemList_itemHeight.call(this)
    }
};
Arisu.VisualItemInventory.Window_ItemList_drawItem = Window_ItemList.prototype.drawItem;
Window_ItemList.prototype.drawItem = function (index) {
    if (this.ArisuValidVisualItemInventoryScenes()) {
        this.ArisuDrawItem(index)
    } else {
        Arisu.VisualItemInventory.Window_ItemList_drawItem.call(this, index)
    }
};
Window_ItemList.prototype.ArisuDrawItem = function (index) {
    var item = this._data[index];
    if (!item)
        return;
    var rect = this.itemRect(index);
    this.ArisuPreDraw(item, rect);
    if (this.ArisuIsDrawItemWithPicture(item)) {
        this.ArisuPrepareDrawItemPicture(item, rect)
    } else {
        this.ArisuDrawLargeIcon(item.iconIndex, rect)
    }
    this.ArisuPostDraw(item, rect)
};
Window_ItemList.prototype.ArisuPreDraw = function (item, rect) {
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    this.ArisuDrawItemCellGrid(item, rect)
};
Window_ItemList.prototype.ArisuPostDraw = function (item, rect) {
    this.drawItemNumber(item, rect.x, rect.y + rect.height - this.lineHeight(), rect.width - this.textPadding())
};
Window_ItemList.prototype.ArisuDrawItemCellGrid = function (item, rect) {
    var color = DataManager.ArisuGetItemCellBgColor(item);
    this.contents.fillRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8, color)
};
Window_ItemList.prototype.ArisuIsDrawItemWithPicture = function (item) {
    if (!item)
        return false;
    if (!Imported.YEP_X_ItemPictureImg)
        return false;
    if (item.pictureImg === "")
        return false;
    return Arisu.VisualItemInventory.ShowPicture
};
Window_ItemList.prototype.ArisuPrepareDrawItemPicture = function (item, rect) {
    var filename = ItemManager.getItemPictureImageFilename(item);
    var hue = item.pictureHue;
    var bitmap = ImageManager.reservePicture(filename, hue);
    bitmap.addLoadListener(this.ArisuDrawItemPictureImage.bind(this, bitmap, item, rect))
};
Window_ItemList.prototype.ArisuDrawItemPictureImage = function (bitmap, item, rect) {
    this.ArisuPreDraw(item, rect);
    var pw = bitmap.width;
    var ph = bitmap.height;
    var sx = 0;
    var sy = 0;
    var dw = pw;
    var dh = ph;
    if (dw > rect.width) {
        var rate = rect.width / dw;
        dw = Math.floor(dw * rate);
        dh = Math.floor(dh * rate)
    }
    if (dh > rect.height) {
        var rate = rect.height / dh;
        dw = Math.floor(dw * rate);
        dh = Math.floor(dh * rate)
    }
    var dx = rect.x + (rect.width - dw) / 2;
    var dy = rect.y + (rect.height - dh) / 2;
    this.contents._context.imageSmoothingEnabled = Arisu.VisualItemInventory.AntiAliasPicture;
    this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy, dw, dh);
    this.contents._context.imageSmoothingEnabled = true;
    this.drawItemNumber(item, rect.x, rect.y + rect.height - this.lineHeight(), rect.width - this.textPadding())
};
Window_ItemList.prototype.ArisuDrawLargeIcon = function (iconIndex, rect) {
    var bitmap = ImageManager.loadSystem("IconSet");
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    var dw = Arisu.VisualItemInventory.CellWidth;
    var dh = Arisu.VisualItemInventory.CellHeight;
    var dx = rect.x + (rect.width - dw) / 2;
    var dy = rect.y + (rect.height - dh) / 2;
    this.contents._context.imageSmoothingEnabled = Arisu.VisualItemInventory.AntiAliasIcons;
    this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy, dw, dh);
    this.contents._context.imageSmoothingEnabled = true
};
Window_ItemList.prototype.ArisuCreateItemNameWindow = function () {
    if (this.ArisuValidVisualItemInventoryScenes()) {
        this._ArisuItemNameWindow = new Window_ArisuItemName;
        this.addChild(this._ArisuItemNameWindow)
    }
};
Arisu.VisualItemInventory.Window_ItemList_updateHelp = Window_ItemList.prototype.updateHelp;
Window_ItemList.prototype.updateHelp = function () {
    Arisu.VisualItemInventory.Window_ItemList_updateHelp.call(this);
    if (this._ArisuItemNameWindow) {
        this._ArisuItemNameWindow.setItem(this.item())
    }
};
Arisu.VisualItemInventory.Window_ItemList_deactivate = Window_ItemList.prototype.deactivate;
Window_ItemList.prototype.deactivate = function () {
    Arisu.VisualItemInventory.Window_ItemList_deactivate.call(this);
    if (this._ArisuItemNameWindow) {
        this._ArisuItemNameWindow.setItem(null)
    }
};
function Window_ArisuItemName() {
    this.initialize.apply(this, arguments)
}
Window_ArisuItemName.prototype = Object.create(Window_Base.prototype);
Window_ArisuItemName.prototype.constructor = Window_ArisuItemName;
Window_ArisuItemName.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth / 2, this.lineHeight());
    this.opacity = 0;
    this.contentsOpacity = 0;
    this._item = null
};
Window_ArisuItemName.prototype.standardPadding = function () {
    return 0
};
Window_ArisuItemName.prototype.setItem = function (item) {
    this._item = item;
    this.refresh();
    this.reposition()
};
Window_ArisuItemName.prototype.refresh = function () {
    var text = this._item ? this._item.name : "";
    if (text !== "") {
        this.resetFontSettings();
        this.contents.fontSize = Arisu.VisualItemInventory.FontSize;
		var remain = this.textWidth(text) % 8
        var width = 8 + (this.textWidth(text) - remain) + this.textPadding() * 4;
        this.width = width + Math.round(width / 64)
		this.height = 44;
        this.createContents();
        this.resetFontSettings();
        this.contents.fontSize = Arisu.VisualItemInventory.FontSize;
        this.contents.clear();
        this.fillBackground();
        this.drawText(text, 0, 4, this.width, "center");
        this.opacity = 0;
        this.contentsOpacity = 240
    } else {
        this.opacity = 0;
        this.contentsOpacity = 0
    }
};
Window_ArisuItemName.prototype.fillBackground = function () {
	this.contents.fillRect(0, 0, this.width, this.height, this.normalColor());
    this.contents.fillRect(4, 4, this.width - 8, this.height - 8, this.gaugeBackColor())
};
Window_ArisuItemName.prototype.reposition = function () {
    if (!this.parent)
        return;
    var index = this.parent.index();
    var rect = this.parent.itemRect(index);
    rect.x += this.parent.standardPadding();
    rect.y += this.parent.standardPadding();
    this.x = rect.x - Math.round((this.width - rect.width) / 2);
    if (this.x + this.width > this.parent.width - 12)
        this.x = (this.parent.width - this.width) - 14;
    if (this.x < 0)
        this.x = 14;
    this.y = rect.y + rect.height - 8;
    if (this.y + this.height > this.parent.height)
        this.y = rect.y - this.height;
    if (this.y < 0)
        this.y = 0
};
if (Imported.YEP_EquipCore && Arisu.VisualItemInventory.Scene_Equip) {
    Window_EquipItem.prototype.maxCols = function () {
        this._maxCols = this._maxCols || Math.floor(this.contents.width / Arisu.VisualItemInventory.CellWidth);
        return this._maxCols
    };
    Window_EquipItem.prototype.drawItem = function (index) {
        var item = this._data[index];
        if (item === null) {
            this.drawRemoveEquip(index)
        } else {
            this.ArisuDrawItem(index)
        }
    };
    Window_EquipItem.prototype.drawRemoveEquip = function (index) {
        if (!this.isEnabled(null))
            return;
        var rect = this.itemRect(index);
        var color = this.gaugeBackColor();
        this.contents.paintOpacity = 64;
        this.contents.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, color);
        this.changePaintOpacity(true);
        this.ArisuDrawLargeIcon(Yanfly.Icon.RemoveEquip, rect);
        var text = Yanfly.Param.EquipRemoveText;
        this.resetFontSettings();
        this.makeFontSmaller();
        this.contents.drawText(text, rect.x, rect.y, rect.width, rect.height, "center");
        this.resetFontSettings()
    };
    Scene_Equip.prototype.updateLowerRightWindowTriggers = function () {
        if (!this._lowerRightVisibility)
            return;
        if (Input.isRepeated("tab")) {
            this.shiftLowerRightWindows()
        } else if (this.isLowerWindowTouched()) {
            this.shiftLowerRightWindows()
        }
    }
}
if (Imported.YEP_ShopMenuCore && Arisu.VisualItemInventory.Scene_Shop) {
    Window_ShopSell.prototype.maxCols = function () {
        this._maxCols = this._maxCols || Math.floor(this.contents.width / Arisu.VisualItemInventory.CellWidth);
        return this._maxCols
    };
    Window_ShopSell.prototype.updateHelp = function () {
        Yanfly.Shop.Window_ShopSell_updateHelp.call(this);
        if (this._infoWindow)
            this._infoWindow.setItem(this.item());
        if (this._statusWindow)
            this._statusWindow.setItem(this.item());
        if (this._ArisuItemNameWindow) {
            this._ArisuItemNameWindow.setItem(this.item())
        }
    };
    Window_ShopStatus.prototype.updateParamSwitch = function () {
        if (!this.isEquipItem())
            return;
        if (this.isTouched(-1)) {
            SoundManager.playCursor();
            this.adjustLeft();
            this.refresh()
        } else if (this.isTouched(1)) {
            SoundManager.playCursor();
            this.adjustRight();
            this.refresh()
        } else if (Input.isRepeated("tab") || this.isTouched(0)) {
            SoundManager.playCursor();
            this.adjustMode();
            this.refresh()
        }
    }
}
if (Imported.YEP_VictoryAftermath && Arisu.VisualItemInventory.Scene_Battle) {
    Window_VictoryDrop.prototype.ArisuValidVisualItemInventoryScenes = function () {
        return false
    }
}