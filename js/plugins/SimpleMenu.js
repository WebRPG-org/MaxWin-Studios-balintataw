/*:
 * @plugindesc Simple custom menu for balintataw game
 * @author John Paul Fusin
 */

(function () {
  //===========================================================================
  // MENU (centered, no actors, no gold)
  //===========================================================================

  // global white text (optional, matches your UI)
  Window_Base.prototype.normalColor = function () {
    return '#FFFFFF';
  };
  Window_Base.prototype.systemColor = function () {
    return '#FFFFFF';
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
  // SCENE ITEM (no visible categories, PS1-style help window)
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

  const _SM_Item_create = Scene_Item.prototype.create;
  Scene_Item.prototype.create = function () {
    _SM_Item_create.call(this);

    // hide category window but still let Arisu / default logic use it
    if (this._categoryWindow) {
      this._categoryWindow.selectSymbol('item'); // default to Items
      this._categoryWindow.deactivate();
      this._categoryWindow.hide();
    }

    // focus item window and bind help
    if (this._itemWindow) {
      let idx = Scene_Item._lastIndex || 0;
      if (idx >= this._itemWindow.maxItems()) idx = 0;
      this._itemWindow.setHelpWindow(this._helpWindow);
      this._itemWindow.activate();
      this._itemWindow.select(idx);
    }
  };

  /**
   * Called when the cancel button is pressed in the item scene.
   * This function will remember the last selected index in the item window
   * and then pop the current scene from the scene stack.
   * @memberof Scene_Item
   */
  Scene_Item.prototype.onItemCancel = function () {
    if (this._itemWindow) {
      Scene_Item._lastIndex = this._itemWindow.index();
    }
    SceneManager.pop();
  };

  //===========================================================================
  // SHOW ITEMS + KEY ITEMS IN SAME LIST (for category "item")
  //===========================================================================

  const _SM_Item_includes = Window_ItemList.prototype.includes;
  Window_ItemList.prototype.includes = function (item) {
    if (
      SceneManager._scene instanceof Scene_Item &&
      this._category === 'item'
    ) {
      return (
        item &&
        DataManager.isItem(item) &&
        (item.itypeId === 1 || item.itypeId === 2)
      );
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
  // LIVE DESCRIPTION + NAME UPDATE (no confirm needed)
  //===========================================================================

  const _SM_ItemList_select = Window_ItemList.prototype.select;
  Window_ItemList.prototype.select = function (index) {
    _SM_ItemList_select.call(this, index);
    // calling updateHelp() will trigger Arisu's name-window logic too
    this.updateHelp();
  };

  // keep Arisu's updateHelp, just ensure helpWindow is updated
  const _SM_updateHelp = Window_ItemList.prototype.updateHelp;
  Window_ItemList.prototype.updateHelp = function () {
    _SM_updateHelp.call(this); // Arisu already calls helpWindow + name window
    if (this._helpWindow) {
      this._helpWindow.setItem(this.item());
    }
  };
})();
