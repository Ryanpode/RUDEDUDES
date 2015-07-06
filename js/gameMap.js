
var TopDownGame = TopDownGame || {};
TopDownGame.Boot = function(){};
//setting game configuration and loading the assets for the loading screen
TopDownGame.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/images/preloader-bar.png');
  },
  create: function() {

    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';

    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //screen size will be set automatically
    this.scale.setScreenSize(true);

    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.state.start('Preload');
  }
};


//loading the game assets
TopDownGame.Preload = function(){};
TopDownGame.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.tilemap('level1', 'assets/tilemaps/tileMap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/tiles.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('grass', 'assets/images/grass.png');
  },
  create: function() {
    this.state.start('Game');
  }
};


//title screen
TopDownGame.Game = function(){};
TopDownGame.Game.prototype = {
  create: function() {
    this.map = this.game.add.tilemap('level1');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('gameTiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('Background');
    this.blockedLayer = this.map.createLayer('Blocked');
    //this.grassLayer = this.map.createLayer('Grass');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'Blocked');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    this.createGrass();

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objects');
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);


    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

  },
  createGrass: function() {
    //create items
    this.grass = this.game.add.group();
    this.grass.enableBody = true;

    result = this.findObjectsByType('grass', this.map, 'objects');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.grass);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    console.log(element);
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(this.player, this.grass, this.enterGrass, null, this);

    //player movement
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown) {
      this.player.body.velocity.y -= 500;
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y += 500;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 500;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 500;
    }
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  },
  enterGrass: function(player, door) {
    console.log(player);
    console.log(door);
    console.log('IN THE GRASS!');
    startEncounter();
  };


//title screen
TopDownGame.Encounter = function(){};
TopDownGame.Game.prototype = {
  create: function() {

  },
  update: function() {
    
  }
}