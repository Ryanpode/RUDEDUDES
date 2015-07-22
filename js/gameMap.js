//define some globals for testing
var stats1 = new RUDEDUDES.stats(100,3,4,5);
    var dudeList = new RUDEDUDES.dudeList();
    var moveList = new RUDEDUDES.moveList(RUDEDUDES);
    
    var config1 = {
      dudeID: 1,
      dudeStats: stats1,
      dudeDefaultStats: stats1,
      moves: {
        passive: -1,
        ability1: 1,
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
        ability1: 2,
        ability2: -1,
        ability3: -1,
        ult: -2
      }
    };
    var duder1 = new RUDEDUDES.dude(config1, dudeList, moveList);
    var duder1b = new RUDEDUDES.dude(config1b, dudeList, moveList);
    var player1 = new RUDEDUDES.player([duder1,duder1b]);



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

    var movementSpeed = 200;

    if(this.cursors.up.isDown) {
      this.player.body.velocity.y -= movementSpeed;
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y += movementSpeed;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= movementSpeed;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += movementSpeed;
    }
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  },
  enterGrass: function(player, door) {
    if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
      var randomCheck = Math.random() * 60;
      if (randomCheck < 1) {
        this.state.start('Encounter');
      }
    }
  }
};
RudeDudesGame.GameOver = function(){};
RudeDudesGame.GameOver.prototype = {
  create: function() {
    var textSize = canvas.height * .3;
    var gameOverText = RudeDudesGame.game.add.text(canvas.width/2,canvas.height/2,'GAME OVER',{'fontSize':textSize});
    gameOverText.x -= gameOverText.width / 2;
  }
};
//encounter
RudeDudesGame.Encounter = function(){};
RudeDudesGame.Encounter.prototype = {
  create: function() {


    var stats2 = new RUDEDUDES.stats(100,4,3,2);
    var config2 = {
      dudeID: 0,
      dudeStats: stats2,
      dudeDefaultStats: stats2,
      moves: {
        passive: -1,
        ability1: 0,
        ability2: -1,
        ability3: -1,
        ult: -2
      }
    };
    var duder2 = new RUDEDUDES.dude(config2, dudeList, moveList);
    var player2 = new RUDEDUDES.player([duder2]);


    var graphics = this.game.add.graphics(0,0);
    this.encounter = new RUDEDUDES.encounter(player1, player2);
    
    //DRAWING STARTS HERE 
    canvas = {};

    canvas.width = 640;
    canvas.height = 320;
    canvas.graphicsStaticHUD = RudeDudesGame.game.add.graphics();

    canvas.graphicsMyHP = RudeDudesGame.game.add.graphics();
    canvas.graphicsEnemyHP = RudeDudesGame.game.add.graphics();

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
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
    var moveSideLength = canvas.width * .125;
    var nameFontSize = canvasHeight * .04;
    var moveFontSize = canvasHeight * .04;
    var eventFontSize = canvasHeight * .03;
    var endingFontSize = canvasHeight * .08;
    var yMove = canvasHeight * .3;
    var xMyMove = canvasWidth*xPaddingRatio;
    var xEnemyMove = canvasWidth - canvasWidth*xRatio - canvasWidth*(xPaddingRatio);

    canvas.myText = RudeDudesGame.game.add.text(xMyTotal,yText,this.encounter.myDude.dudeInfo.name,{'fontSize':nameFontSize});
    canvas.enemyText = RudeDudesGame.game.add.text(xEnemyTotal + width,yText,this.encounter.enemyDude.dudeInfo.name,{'fontSize':nameFontSize});
    canvas.enemyText.x -= canvas.enemyText.width;
    
    canvas.myMoveText = RudeDudesGame.game.add.text(xMyMove,yMove,'',{'fontSize':eventFontSize});
    canvas.enemyMoveText = RudeDudesGame.game.add.text(xEnemyMove,yMove,'',{'fontSize':eventFontSize});

    canvas.drawTopHUD = function(encounter) {
      

       canvas.updateHP = function(encounter) {

        var widthMyHP = canvasWidth * xRatio * (encounter.myDude.stats.HP / encounter.myDude.defaultStats.HP);
        var widthEnemyHP = canvasWidth * xRatio * (encounter.enemyDude.stats.HP / encounter.enemyDude.defaultStats.HP);
        
        canvas.myText.destroy();
        canvas.enemyText.destroy();

        canvas.myText = RudeDudesGame.game.add.text(xMyTotal,yText,encounter.myDude.dudeInfo.name,{'fontSize':nameFontSize});
        canvas.enemyText = RudeDudesGame.game.add.text(xEnemyTotal + width,yText,encounter.enemyDude.dudeInfo.name,{'fontSize':nameFontSize});

        var drawHP = function(x,y,width,height,widthHP,graphics) {
            graphics.clear();
            
            graphics.beginFill(0x008800);
            graphics.lineStyle(0,0,0);
            graphics.drawRect(x,y,widthHP,height);
        };

        var drawHPBar = function(x,y,width,height,widthHP,graphics){

            drawHP(x,y,width,height,widthHP,graphics);

            canvas.graphicsStaticHUD.beginFill(0,0);
            canvas.graphicsStaticHUD.lineStyle(1, 'black', 1);
            canvas.graphicsStaticHUD.drawRect(x,y,width,height);

        };
        drawHPBar(xMyTotal,y,width,height,widthMyHP,canvas.graphicsMyHP);
        drawHPBar(xEnemyTotal,y,width,height,widthEnemyHP,canvas.graphicsEnemyHP);
        
      };

      canvas.updateHP(encounter);

      canvas.myMoveText;
      canvas.enemyMoveText;
              
    };

    canvas.displayMyMoveText = function(encounter) {
      canvas.myMoveText.destroy();
      var myDudeName = encounter.myDude.dudeInfo.name;
      var moveResults = encounter.myDude.moveResults;
      var moveText = myDudeName + " used " + moveResults.move.moveName;
      var text = RudeDudesGame.game.add.text(50,100,moveText,{'fontSize':eventFontSize});
      canvas.myMoveText = text;
      RudeDudesGame.game.time.events.add(1000, function() {
        text.destroy();
      }, this);

    };

    canvas.displayEnemyMoveText = function(encounter) {
      canvas.enemyMoveText.destroy();
      var enemyDudeName = encounter.enemyDude.dudeInfo.name;
      var moveResults = encounter.enemyDude.moveResults;
      var moveText = enemyDudeName + " used " + moveResults.move.moveName;
      var text = RudeDudesGame.game.add.text(570,100,moveText,{'fontSize':eventFontSize});
      text.x -= text.width
      canvas.enemyMoveText = text;
      RudeDudesGame.game.time.events.add(1000, function() {
        text.destroy();
      }, this);

    };

    canvas.displayEnemyDeadText = function(encounter) {
      var enemyDudeName = encounter.enemyDude.dudeInfo.name;
      var endingText = "Enemy " + encounter.enemyDude.dudeInfo.name + " has DIED!";
      var text = RudeDudesGame.game.add.text(320,120,endingText,{'fontSize':endingFontSize});
      text.x -= text.width / 2;
      return text;
    };

    canvas.displayMyDeadText = function(encounter) {
      var enemyDudeName = encounter.enemyDude.dudeInfo.name;
      var endingText = encounter.myDude.dudeInfo.name + " has DIED!";
      var text = RudeDudesGame.game.add.text(320,120,endingText,{'fontSize':endingFontSize});
      text.x -= text.width / 2;
      return text;
    };

    canvas.drawMoveButtons = function(encounter) {
      var moveEffects = RUDEDUDES.moveEffects;
      var drawButton = function(xRatio,defaultText,move){
        
        var color = 0x888888;
        var text = defaultText;
        var moveEffect = function(){};
        
        if (move !== undefined) {
          color = 0x008800
          text = move.moveName;
          moveEffect = function(){moveEffects.useMove(move, encounter.myDude, encounter.enemyDude, encounter)};
        };
        
        var x = canvas.width * xRatio;
        var y = canvas.height - moveSideLength;
        var yText = y  + moveSideLength / 2 - moveFontSize / 2;

        var sprite = RudeDudesGame.game.add.sprite(x,y);
          var graphics = RudeDudesGame.game.add.graphics(0,0);
          var text = RudeDudesGame.game.add.text(moveSideLength/2,moveSideLength/2,text,{'fontSize':moveFontSize,'align':'center','width':moveSideLength});
          text.anchor.x = Math.round(text.width * 0.5) / text.width;
          text.anchor.y = Math.round(text.height * 0.5) / text.height;

            // set a fill and line style
          graphics.beginFill(color);
          graphics.lineStyle(1, 'black', 1);
          graphics.drawRect(0,0,moveSideLength,moveSideLength);
          
        sprite.addChild(graphics);
        sprite.addChild(text);

        sprite.inputEnabled = true;
        sprite.events.onInputDown.add(function(){moveEffect()}, this);

      };
      
      drawButton((3/16),'(Passive)',encounter.myDude.moves.passive);
      drawButton((5/16),'(Ability 1)',encounter.myDude.moves.ability1);
      drawButton((7/16),'(Ability 2)',encounter.myDude.moves.ability2);
      drawButton((9/16),'(Ability 3)',encounter.myDude.moves.ability3);
      drawButton((11/16),'(Ultimate)',encounter.myDude.moves.ult);
    };

    canvas.drawHUD = function(encounter) {
      canvas.graphicsStaticHUD.clear();


      //canvas.layers.HUD.removeChildren();
      canvas.drawMoveButtons(encounter);
      canvas.drawTopHUD(encounter);
      //canvas.drawTopHUD(RudeDudesGame, encounter, RUDEDUDES);
    };
    canvas.drawHUD(this.encounter);
    this.encounter.canvas = canvas;


  },
  update: function() {

    var postMyDudeDead = function(encounter) {
      if (encounter.lose) {
        RudeDudesGame.game.state.start('GameOver');
      } else {
        encounter.myDude = encounter.myPlayer.getStartingDude();
        encounter.canvas.drawHUD(encounter);
      }
    };

    var postEnemyDudeDead = function(encounter) {
      console.log(encounter);
      if (encounter.win) {
          RudeDudesGame.game.state.start('Game');
      } else {
        encounter.enemyDude = encounter.enemyPlayer.getStartingDude();
        encounter.canvas.drawHUD(encounter);
      }
    }; 

    if (this.encounter.myDude.moveComplete) {

      //display move text
      this.encounter.canvas.displayMyMoveText(this.encounter);

      //run animations

      //update affteced HUD elements
      this.encounter.canvas.updateHP(this.encounter);

      //reset state
      this.encounter.myDude.moveComplete = false;
      this.encounter.myDude.moveResults = {};
      this.encounter.myTurn = false;

      //check for dead dudes
      if (this.encounter.myDude.stats.HP <= 0) {
        var text = this.encounter.canvas.displayMyDeadText(this.encounter);
        RudeDudesGame.game.time.events.add(700, function() {
          text.destroy();
          postMyDudeDead(this.encounter);
        }, this);
      }
      if (this.encounter.enemyDude.stats.HP <= 0) {
        var text = this.encounter.canvas.displayEnemyDeadText(this.encounter);
        RudeDudesGame.game.time.events.add(700, function() {
          text.destroy();
          postEnemyDudeDead(this.encounter);
        }, this);
      }

      //use enemy move
      this.encounter.useEnemyMove();
    }

    if (this.encounter.enemyDude.moveComplete) {

      //display move text
      this.encounter.canvas.displayEnemyMoveText(this.encounter);

      //run animations

      //update affteced HUD elements
      this.encounter.canvas.updateHP(this.encounter);

      //check for dead dudes
      if (this.encounter.myDude.stats.HP <= 0) {
        var text = this.encounter.canvas.displayMyDeadText(this.encounter);
        RudeDudesGame.game.time.events.add(700, function() {
          text.destroy();
          postMyDudeDead(this.encounter);
        }, this);
      }
      if (this.encounter.enemyDude.stats.HP <= 0) {
        var text = this.encounter.canvas.displayEnemyDeadText(this.encounter);
        RudeDudesGame.game.time.events.add(700, function() {
          text.destroy();
          postEnemyDudeDead(this.encounter);
        }, this);
      }

      //reset state
      this.encounter.enemyDude.moveComplete = false;
      this.encounter.enemyDude.moveResults = {};
      this.encounter.myTurn = true;
    }



  }
}