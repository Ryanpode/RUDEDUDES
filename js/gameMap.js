
var RudeDudesGame = RudeDudesGame || {};
RudeDudesGame.Boot = function(){};
//setting game configuration and loading the assets for the loading screen
RudeDudesGame.Boot.prototype = {
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
RudeDudesGame.Preload = function(){};
RudeDudesGame.Preload.prototype = {
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
RudeDudesGame.Game = function(){};
RudeDudesGame.Game.prototype = {
  create: function() {
    this.map = this.game.add.tilemap('level1');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('gameTiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('Background');
    this.blockedLayer = this.map.createLayer('Blocked');
    //this.grassLayer = this.map.createLayer('Grass');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 5000, true, 'Blocked');

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
    this.state.start('Encounter');
  }
};
//encounter
RudeDudesGame.Encounter = function(){};
RudeDudesGame.Encounter.prototype = {
  create: function() {
    var graphics = this.game.add.graphics(0,0);
    
    console.log(RUDEDUDES);
    
    var stats1 = new RUDEDUDES.stats(100,3,4,5);
    var dudeList = new RUDEDUDES.dudeList();
    var moveList = new RUDEDUDES.moveList(RUDEDUDES);
    
    var config1 = {
      dudeID: 0,
      dudeStats: stats1,
      dudeDefaultStats: stats1,
      moves: {
        passive: -1,
        ability1: 0,
        ability2: -1,
        ability3: -1,
        ult: -2
      }
    };
    var config1b = {
      dudeID: 2,
      dudeStats:  new RUDEDUDES.stats(50,3,4,5),
      dudeDefaultStats:  new RUDEDUDES.stats(100,3,4,5),
      moves: {
        passive: -1,
        ability1: 1,
        ability2: -1,
        ability3: -1,
        ult: -2
      }
    };
    var duder1 = new RUDEDUDES.dude(config1, dudeList, moveList);
    var duder1b = new RUDEDUDES.dude(config1b, dudeList, moveList);
    var player1 = new RUDEDUDES.player([duder1b,duder1]);

    var stats2 = new RUDEDUDES.stats(100,4,3,2);
    var config2 = {
      dudeID: 1,
      dudeStats: stats2,
      dudeDefaultStats: stats2,
      moves: {
        passive: -1,
        ability1: 1,
        ability2: -1,
        ability3: -1,
        ult: -2
      }
    };
    var duder2 = new RUDEDUDES.dude(config2, dudeList, moveList);
    var player2 = new RUDEDUDES.player([duder2]);

    this.encounter = new RUDEDUDES.encounter(player1, player2);
    encounterCanvas = {};

    encounterCanvas.width = 640;
    encounterCanvas.height = 320;
    encounterCanvas.graphicsStaticHUD = RudeDudesGame.game.add.graphics(0,0,encounterCanvas.HUD);

    encounterCanvas.graphicsMyHP = RudeDudesGame.game.add.graphics();
    encounterCanvas.graphicsEnemyHP = RudeDudesGame.game.add.graphics();

    encounterCanvas.drawTopHUD = function(RudeDudesGame, encounter) {
      
      var canvasWidth = encounterCanvas.width;
      var canvasHeight = encounterCanvas.height;
      var textPaddingRatio = .02
      var xPaddingRatio = .05;
      var yPaddingRatio = .05;
      var xRatio = .35;
      var yRatio = .03;
      var xMyTotal = canvasWidth*xPaddingRatio;
      var xEnemyTotal = canvasWidth - canvasWidth*xRatio - canvasWidth*(xPaddingRatio);
      var y = canvasHeight * yPaddingRatio;
      var height = canvasHeight * yRatio;
      var yText = y + canvasHeight * textPaddingRatio + height
      var width = xRatio * canvasWidth;
      var fontSize = canvasHeight * .04;

      encounter.getHPWidth = function(HPRatio){
        return canvasWidth * xRatio * HPRatio;
      };

       encounterCanvas.updateHP = function(encounter) {

        var widthMyHP = canvasWidth * xRatio * (encounter.myDude.stats.HP / encounter.myDude.defaultStats.HP);
        var widthEnemyHP = canvasWidth * xRatio * (encounter.enemyDude.stats.HP / encounter.enemyDude.defaultStats.HP);
      
        var drawHP = function(x,y,width,height,widthHP,graphics) {
            graphics.clear();
            
            graphics.beginFill(0x008800);
            graphics.lineStyle(0,0,0);
            graphics.drawRect(x,y,widthHP,height);
        };

        var drawHPBar = function(x,y,width,height,widthHP,graphics){

            drawHP(x,y,width,height,widthHP,graphics);

            encounterCanvas.graphicsStaticHUD.beginFill(0,0);
            encounterCanvas.graphicsStaticHUD.lineStyle(1, 'black', 1);
            encounterCanvas.graphicsStaticHUD.drawRect(x,y,width,height);

        };
        drawHPBar(xMyTotal,y,width,height,widthMyHP,encounterCanvas.graphicsMyHP);
        drawHPBar(xEnemyTotal,y,width,height,widthEnemyHP,encounterCanvas.graphicsEnemyHP);
        
      };

      encounterCanvas.updateHP(encounter);

      var myText = RudeDudesGame.game.add.text(xMyTotal,yText,encounter.myDude.dudeInfo.name,{'fontSize':fontSize});
      var enemyText = RudeDudesGame.game.add.text(xEnemyTotal + width,yText,encounter.enemyDude.dudeInfo.name,{'fontSize':fontSize});
      enemyText.x -= enemyText.width;
              
    };
    encounterCanvas.drawMoveButtons = function(RudeDudesGame, encounter) {
      var moveEffects = new RUDEDUDES.moveEffects();
      var drawButton = function(xRatio,sideRatio,defaultText,move,encounter,canvas){
        
        var color = 0x888888;
        var text = defaultText;
        var moveEffect = function(){};
        
        if (move !== undefined) {
          color = 0x008800
          text = move.moveName;
          moveEffect = function(){moveEffects.useMove(move, encounter.myDude, encounter.enemyDude, encounter)};
        };
        
        var sideLength = encounterCanvas.width * sideRatio;
        var x = encounterCanvas.width * xRatio;
        var y = encounterCanvas.height - sideLength;
        var fontSize = sideLength * .15;
        var yText = y  + sideLength / 2 - fontSize / 2;

        var sprite = RudeDudesGame.game.add.sprite(x,y);
          var graphics = RudeDudesGame.game.add.graphics(0,0);
          var text = RudeDudesGame.game.add.text(sideLength/2,sideLength/2,text,{'fontSize':fontSize,'align':'center','width':sideLength});
          text.anchor.x = Math.round(text.width * 0.5) / text.width;
          text.anchor.y = Math.round(text.height * 0.5) / text.height;

            // set a fill and line style
          graphics.beginFill(color);
          graphics.lineStyle(1, 'black', 1);
          graphics.drawRect(0,0,sideLength,sideLength);
          
        sprite.addChild(graphics);
        sprite.addChild(text);

        sprite.inputEnabled = true;
        sprite.events.onInputDown.add(function(){moveEffect()}, this);

      };
      
      drawButton((3/16),.125,'(Passive)',encounter.myDude.moves.passive,encounter,this);
      drawButton((5/16),.125,'(Ability 1)',encounter.myDude.moves.ability1,encounter,this);
      drawButton((7/16),.125,'(Ability 2)',encounter.myDude.moves.ability2,encounter,this);
      drawButton((9/16),.125,'(Ability 3)',encounter.myDude.moves.ability3,encounter,this);
      drawButton((11/16),.125,'(Ultimate)',encounter.myDude.moves.ult,encounter,this);
    };

    encounterCanvas.drawHUD = function(RudeDudesGame, encounter) {
      encounterCanvas.graphicsStaticHUD.clear();

      //encounterCanvas.layers.HUD.removeChildren();
      encounterCanvas.drawMoveButtons(RudeDudesGame, encounter);
      encounterCanvas.drawTopHUD(RudeDudesGame, encounter);
      //encounterCanvas.drawTopHUD(RudeDudesGame, encounter, RUDEDUDES);
    };
    encounterCanvas.drawHUD(this,this.encounter);
    this.encounter.encounterCanvas = encounterCanvas;

    /*var cnv = new RUDEDUDES.encounterCanvas(640, 360);
    cnv.drawHUD(this, encounter,RUDEDUDES);
    window.setInterval(function(){
      cnv.drawHUD(this, encounter,RUDEDUDES);
    }, 1000);   */  

  },
  update: function() {
    //console.log(this);
    this.encounter.encounterCanvas.updateHP(this.encounter);
  }
}