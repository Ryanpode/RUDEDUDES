var RUDEDUDES = (function (my, $) {
	my.encounter = function(myPlayer, enemyPlayer){
		var encounter = this;

		encounter.myPlayer = myPlayer;
		encounter.enemyPlayer = enemyPlayer;

		encounter.myDude = myPlayer.getStartingDude();
		encounter.enemyDude = enemyPlayer.getStartingDude();

		
		encounter.compareSpeed = function() {
			//get the effective speed, taking stats, status, and abilities into consideration
			var getEffectiveSpeed = function(dude) {
				return dude.stats.Spd;
			};
			
			return getEffectiveSpeed(myDude) - getEffectiveSpeed(enemyDude);
		};
		
		return encounter;
	};
	my.player = function(dudes){
		var player = this;

		player.dudes = dudes;

		player.getStartingDude = function(){
			for (var i = 0; i < player.dudes.length; i++) {
				if(player.dudes[i].stats.HP > 0) {
					return player.dudes[i];
				}
			};
			return -1;
		};

		return player;
	};
	my.dude = function(dudeConfig, dudeList, moveList){
		var dude = this;

		dude.dudeID = dudeConfig.dudeID;
		dude.dudeInfo = dudeList.getDude(dudeConfig.dudeID);
		dude.stats = {
			HP: dudeConfig.dudeStats.HP,
			Atk: dudeConfig.dudeStats.Atk,
			Def: dudeConfig.dudeStats.Def,
			Spd: dudeConfig.dudeStats.Spd
		};
		dude.defaultStats = {
			HP: dudeConfig.dudeDefaultStats.HP,
			Atk: dudeConfig.dudeDefaultStats.Atk,
			Def: dudeConfig.dudeDefaultStats.Def,
			Spd: dudeConfig.dudeDefaultStats.Spd
		};
		dude.moves = {
			passive: moveList.getMove(dudeConfig.moves.passive),
			ability1: moveList.getMove(dudeConfig.moves.ability1),
			ability2: moveList.getMove(dudeConfig.moves.ability2),
			ability3: moveList.getMove(dudeConfig.moves.ability3),
			ult: moveList.getMove(dudeConfig.moves.ult)
		};

		return dude;
	};
	my.stats = function(HP, Atk, Def, Spd){
		var stats = this;

		stats.HP = HP;
		stats.Atk = Atk;
		stats.Def = Def;
		stats.Spd = Spd;
		return stats;
	};
	my.dudeList = function() {
		var dudes = [
			{
				name: 'Cool Guy',
				type: 'Water'
			},
			{
				name: 'Tom',
				type: 'Fire'
			},
			{
				name: 'Keith',
				type: 'Normal'
			},
			{
				name: 'Laika',
				type: 'Dark'
			}
		];
		var getDude = function(index){return this.dudes[index];}
		return {
			dudes: dudes,
			getDude: getDude
		}
	};
	my.move = function(moveName, moveType, moveClass, moveBase, moveDescription, moveEffects){
		var move = this;

		move.moveName = moveName;
		move.moveType = moveType;
		move.moveClass = moveClass; 
		move.moveBase = moveBase;
		move.moveDescription = moveDescription;
		move.moveEffects = moveEffects;

		return move;
	},
	my.moveEffects = function(RUDEDUDES){
		this.getTypeMultiplier = function(attackType, dudeType) {
			switch (attackType) {
				case 'Water':
					switch(dudeType) {
						case 'Water':
							return 1
						case 'Fire':
							return .5
					}
				case 'Fire':
					switch(dudeType) {
						case 'Water':
							return 2
						case 'Fire':
							return 1
					}
			}
		};
				
		this.dealDamage = function(move, attackingDude, targetDude, encounter) {
			var typeMultiplier = this.getTypeMultiplier(targetDude.dudeInfo.type, move.moveType);
			var bonusMultiplier = attackingDude.stats.Atk / targetDude.stats.Def;
			var base = move.moveBase;
			var newHP = targetDude.stats.HP - base * typeMultiplier * bonusMultiplier
			 targetDude.stats.HP = Math.max(newHP,0);
		};
		
		this.useMove = function(move, attackingDude, targetDude, encounter) {
			var dude = attackingDude;
			var dudeEffects = move.moveEffects
			for (i = 0; i < dudeEffects.length; i++) {
				switch(dudeEffects[i]) {
					case 'damageTarget':
						this.dealDamage(move, attackingDude, targetDude, encounter)
						break;
				}
			}
			console.log(encounter.enemyDude.stats);
			my.encounterCanvas(640,360).drawHUD(RudeDudesGame,encounter,my);
		};
		return this;
	};
	my.moveList = function(RUDEDUDES){
		var moves = [
			new RUDEDUDES.move('Watershot', 'Water', 'AtWill', '2', 'Shoots water', ['damageTarget']),
			new RUDEDUDES.move('Firestick', 'Fire', 'AtWill', '2', 'Hit him with a firestick', ['damageTarget'])
		];
		var getMove = function(index){return moves[index];}
		return  {
			moves: moves,
			getMove: getMove
		}
	};
	my.encounterCanvas = function(width, height) {
		console.log('encounterCanvas init');
		var encounterCanvas = this;

		encounterCanvas.width = width;34
		encounterCanvas.height = height;
		
		encounterCanvas.drawHUD = function(RudeDudesGame, encounter, RUDEDUDES) {
			//encounterCanvas.layers.HUD.removeChildren();
			encounterCanvas.drawMoveButtons(RudeDudesGame, encounter, RUDEDUDES);
			encounterCanvas.drawTopHUD(RudeDudesGame, encounter, RUDEDUDES);
			//encounterCanvas.drawTopHUD(RudeDudesGame, encounter, RUDEDUDES);
		};
		encounterCanvas.drawTopHUD = function(RudeDudesGame, encounter, RUDEDUDES) {
			var canvas = encounterCanvas;

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
			var widthMyHP = canvasWidth * xRatio * (encounter.myDude.stats.HP / encounter.myDude.defaultStats.HP);
			var widthEnemyHP = canvasWidth * xRatio * (encounter.enemyDude.stats.HP / encounter.enemyDude.defaultStats.HP);
			var fontSize = canvasHeight * .04;
			
			//create my dude
			var drawHP = function(x,y,width,height,widthHP){
				var sprite = RudeDudesGame.game.add.sprite(x,y);
			    var graphics = RudeDudesGame.game.add.graphics(0,0);

			    console.log(x,y,width,height,widthHP);

			    graphics.beginFill(0x008800);
			    graphics.lineStyle(0,0,0);
			    graphics.drawRect(0,0,widthHP,height);

			    graphics.beginFill(0,0);
			    graphics.lineStyle(1, 'black', 1);
			    graphics.drawRect(0,0,width,height);

				sprite.addChild(graphics);
			};
			drawHP(xMyTotal,y,width,height,widthMyHP);
			drawHP(xEnemyTotal,y,width,height,widthEnemyHP);
			
			var myTextSprite = RudeDudesGame.game.add.sprite(xMyTotal,yText);
		    var myText = RudeDudesGame.game.add.text(0,0,encounter.myDude.dudeInfo.name,{'fontSize':fontSize});
			myTextSprite.addChild(myText);

			var enemyTextSprite = RudeDudesGame.game.add.sprite(xEnemyTotal,yText);
		    var enemyText = RudeDudesGame.game.add.text(0,0,encounter.enemyDude.dudeInfo.name,{'fontSize':fontSize});
		    enemyText.x = width - enemyText.width;
			enemyTextSprite.addChild(enemyText);
		    			
		};
		
		this.drawMoveButtons = function(RudeDudesGame, encounter, RUDEDUDES) {
			
			var moveEffects = new RUDEDUDES.moveEffects(RUDEDUDES);
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
/**/
			};
			
			drawButton((3/16),.125,'(Passive)',encounter.myDude.moves.passive,encounter,this);
			drawButton((5/16),.125,'(Ability 1)',encounter.myDude.moves.ability1,encounter,this);
			drawButton((7/16),.125,'(Ability 2)',encounter.myDude.moves.ability2,encounter,this);
			drawButton((9/16),.125,'(Ability 3)',encounter.myDude.moves.ability3,encounter,this);
			drawButton((11/16),.125,'(Ultimate)',encounter.myDude.moves.ult,encounter,this);
		};
		
		return this;
	};
	return my;
}(RUDEDUDES || {}, jQuery));
