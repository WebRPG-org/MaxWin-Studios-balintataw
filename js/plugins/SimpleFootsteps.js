var Imported = Imported || {};
Imported.SidescrollerStepSE = true;

var SidescrollerStepSE = SidescrollerStepSE || {}; // Sidescroller Step SE Plugin

//-----------------------------------------------------------------------------

/*:
 * @plugindesc (v1.0) A plugin to play footstep sounds in a sidescroller game.
 *
 * @author John Paul Fusin
 *
 * @param Terrain Sounds
 * @desc Set footstep sounds for different regions (1-6). Format: SE_name, volume, pitch
 * @default Footstep_Grass, 80, 100, Footstep_Stone, 90, 100, Footstep_Wood, 85, 105, Footstep_Metal, 95, 100, Footstep_Sand, 70, 95, Footstep_Water, 60, 90
 *
 * @help
 * This plugin plays footstep sounds based on the player's movement and position in a sidescroller game.
 * You can set footstep sounds for different regions (like terrain tags).
 *
 * Usage:
 * 1. Set the sound names, volume, and pitch in the plugin parameters.
 * 2. Assign the region to your tiles (1-6) to trigger corresponding footstep sounds.
 *
 * Region Tag Example:
 * 1 - Footstep_Grass
 * 2 - Footstep_Stone
 * 3 - Footstep_Wood
 * 4 - Footstep_Metal
 * 5 - Footstep_Sand
 * 6 - Footstep_Water
 *
 */

(function () {
  var parameters = PluginManager.parameters('SidescrollerStepSE');
  var terrainSounds = parameters['Terrain Sounds'].split(',');

  // Create sound objects for each terrain type
  SidescrollerStepSE.terrainSounds = [];
  for (var i = 0; i < terrainSounds.length; i += 3) {
    SidescrollerStepSE.terrainSounds.push({
      name: terrainSounds[i].trim(),
      volume: Number(terrainSounds[i + 1].trim()),
      pitch: Number(terrainSounds[i + 2].trim()),
    });
  }

  //-----------------------------------------------------------------------------

  // Function to get the terrain (or region) under the player based on the player's x position
  function getTerrainAtPlayerPosition(x) {
    // Assuming each region corresponds to a certain x-range (you can adjust this as needed)
    if (x < 100) return 1; // Example: region 1
    if (x < 200) return 2; // Example: region 2
    if (x < 300) return 3; // Example: region 3
    if (x < 400) return 4; // Example: region 4
    if (x < 500) return 5; // Example: region 5
    return 6; // Example: region 6
  }

  // Override the Game_CharacterBase class to add footstep sound logic
  Game_CharacterBase.prototype.playStepSE = function () {
    var x = this._realX; // Get the player's real position (used for sidescroller games)
    var terrainTag = getTerrainAtPlayerPosition(x); // Get the terrain based on X position
    var sound = SidescrollerStepSE.terrainSounds[terrainTag - 1];
    if (sound) {
      AudioManager.playSe({
        name: sound.name,
        volume: sound.volume,
        pitch: sound.pitch,
        pan: 0,
      });
    }
  };

  // Update the player logic to play step sounds
  var _Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function (sceneActive) {
    _Game_Player_update.call(this, sceneActive);
    if (this.isMoving() && !this.isJumping()) {
      this.playStepSE();
    }
  };

  // You can add event followers if you need footstep sounds for them too
  if (Imported.YEP_X_EventFollowers) {
    var _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function (sceneActive) {
      _Game_Event_update.call(this, sceneActive);
      if (this.isMoving()) {
        this.playStepSE();
      }
    };
  }
})();
