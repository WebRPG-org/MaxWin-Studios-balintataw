/*:
 * @plugindesc Simple centered menu + Arisu item screen fix + Item Box + Description fix.
 */

(function () {
  //===========================================================================
  // MENU (centered, no actors, no gold)
  //===========================================================================
  Window_Base.prototype.normalColor = function () {
    return '#FFFFFF'; // white text
  };

  Window_Base.prototype.systemColor = function () {
    return '#FFFFFF'; // white for system text too
  };

  const _SM_Menu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
  Scene_Menu.prototype.createStatusWindow = function () {
    _SM_Menu_createStatusWindow.call(this);
    this._statusWindow.x = -9999;
    this._statusWindow.y = -9999;
    this._statusWindow.opacity = 0;
    this._statusWindow.contentsOpacity = 0;
  };

  const _SM_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _SM_Menu_createCommandWindow.call(this);

    const w = 260;
    const h = this._commandWindow.fittingHeight(3);
    const x = (Graphics.boxWidth - w) / 2;
    const y = (Graphics.boxHeight - h) / 2;

    this._commandWindow.move(x, y, w, h);
  };

  const _SM_Menu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
  Scene_Menu.prototype.createGoldWindow = function () {
    _SM_Menu_createGoldWindow.call(this);
    this._goldWindow.x = -9999;
    this._goldWindow.y = -9999;
    this._goldWindow.opacity = 0;
    this._goldWindow.contentsOpacity = 0;
  };

  Window_MenuCommand.prototype.makeCommandList = function () {
    this.addCommand('Inventory', 'item');
    this.addCommand('Options', 'options');
    this.addCommand('Quit', 'gameEnd');
  };

  Scene_Menu.prototype.commandItem = function () {
    SceneManager.push(Scene_Item);
  };

  //===========================================================================
  // SCENE ITEM (no categories, PS1-style help window)
  //===========================================================================

  Scene_Item._lastIndex = 0;

  const _SM_Item_createHelpWindow = Scene_Item.prototype.createHelpWindow;
  Scene_Item.prototype.createHelpWindow = function () {
    _SM_Item_createHelpWindow.call(this);
    const win = this._helpWindow;

    win.width = Graphics.boxWidth - 40;
    win.x = 20;
    win.y = 20;
    win.height = win.fittingHeight(2);
    win.createContents();
  };

  // keep category window logic intact but hide it visually
  const _SM_Item_create = Scene_Item.prototype.create;
  Scene_Item.prototype.create = function () {
    _SM_Item_create.call(this);

    if (this._categoryWindow) {
      this._categoryWindow.selectSymbol('item');
      this._categoryWindow.deactivate();
      this._categoryWindow.hide();
    }

    if (this._itemWindow) {
      let idx = Scene_Item._lastIndex || 0;
      if (idx >= this._itemWindow.maxItems()) idx = 0;
      this._itemWindow.activate();
      this._itemWindow.select(idx);
      this._itemWindow.setHelpWindow(this._helpWindow);
    }
  };

  const _SM_Item_onItemCancel = Scene_Item.prototype.onItemCancel;
  Scene_Item.prototype.onItemCancel = function () {
    if (this._itemWindow) {
      Scene_Item._lastIndex = this._itemWindow.index();
    }
    SceneManager.pop();
  };

  //===========================================================================
  // SHOW ITEMS + KEY ITEMS IN SAME LIST
  //===========================================================================

  const _SM_Item_includes = Window_ItemList.prototype.includes;
  Window_ItemList.prototype.includes = function (item) {
    if (SceneManager._scene instanceof Scene_Item) {
      return (
        item &&
        DataManager.isItem(item) &&
        (item.itypeId === 1 || item.itypeId === 2)
      ); // item + key item
    }
    return _SM_Item_includes.call(this, item);
  };

  //===========================================================================
  // REMOVE ITEM QUANTITY
  //===========================================================================

  Window_ItemList.prototype.numberWidth = function () {
    return 0;
  };
  Window_ItemList.prototype.drawItemNumber = function () {};

  //===========================================================================
  // ITEM BOX PNG (safe Arisu hook)
  //===========================================================================
})();

// Force item description to update immediately on selection
const _SM_ItemList_select = Window_ItemList.prototype.select;
Window_ItemList.prototype.select = function (index) {
  _SM_ItemList_select.call(this, index);
  if (this._helpWindow) {
    const item = this.item();
    this._helpWindow.setItem(item);
  }
};

// Update help whenever cursor moves
Window_ItemList.prototype.updateHelp = function () {
  if (this._helpWindow) {
    this._helpWindow.setItem(this.item());
  }
};

// Item name in the small brown label updates instantly
const _SM_ItemList_drawItemName = Window_ItemList.prototype.drawItemName;
Window_ItemList.prototype.drawItemName = function (item, x, y, width) {
  this.changeTextColor('#FFFFFF'); // white name
  _SM_ItemList_drawItemName.call(this, item, x, y, width);
};

// LIVE UPDATE name label (brown rectangle)
const _SM_updateHelp = Window_ItemList.prototype.updateHelp;
Window_ItemList.prototype.updateHelp = function () {
  _SM_updateHelp.call(this);
  if (this._ArisuItemNameWindow) {
    this._ArisuItemNameWindow.setItem(this.item());
  }
};
