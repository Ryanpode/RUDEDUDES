define({
	encounter: function(myDude, enemyDude){
		this.myDude = myDude;
		this.enemyDude = enemyDude;
		
		this.compareSpeed = function() {
			//get the effective speed, taking stats, status, and abilities into consideration
			var getEffectiveSpeed = function(dude) {
				return dude.stats.Spd;
			};
			
			return getEffectiveSpeed(myDude) - getEffectiveSpeed(enemyDude);
		};
		
		return this;
	},
	dude: function(dudeConfig, dudeList, moveList){
		this.dudeID = dudeConfig.dudeID;
		this.dudeInfo = dudeList.getDude(dudeConfig.dudeID);
		this.stats = {
			HP: dudeConfig.dudeStats.HP,
			Atk: dudeConfig.dudeStats.Atk,
			Def: dudeConfig.dudeStats.Def,
			Spd: dudeConfig.dudeStats.Spd
		};
		this.defaultStats = {
			HP: dudeConfig.dudeDefaultStats.HP,
			Atk: dudeConfig.dudeDefaultStats.Atk,
			Def: dudeConfig.dudeDefaultStats.Def,
			Spd: dudeConfig.dudeDefaultStats.Spd
		};
		this.moves = {
			passive: moveList.getMove(dudeConfig.moves.passive),
			ability1: moveList.getMove(dudeConfig.moves.ability1),
			ability2: moveList.getMove(dudeConfig.moves.ability2),
			ability3: moveList.getMove(dudeConfig.moves.ability3),
			ult: moveList.getMove(dudeConfig.moves.ult)
		};
		return this;
	},
	stats: function(HP, Atk, Def, Spd){
		this.HP = HP;
		this.Atk = Atk;
		this.Def = Def;
		this.Spd = Spd;
		return this;
	},
	dudeList: function() {
		var dudes = [
			{
				name: 'Cool Guy',
				type: 'Water'
			},
			{
				name: 'Tom',
				type: 'Fire'
			}
		];
		var getDude = function(index){return this.dudes[index];}
		return {
			dudes: dudes,
			getDude: getDude
		}
	},
	move: function(moveName, moveType, moveClass, moveBase, moveDescription, moveEffects){
		this.moveName = moveName;
		this.moveType = moveType;
		this.moveClass = moveClass;
		this.moveBase = moveBase;
		this.moveDescription = moveDescription;
		this.moveEffects = moveEffects;
	},
	moveEffects: function(RUDEDUDES){
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
		};
		return this;
	},
	moveList: function(RUDEDUDES){
		var moves = [
			new RUDEDUDES.move('Watershot', 'Water', 'AtWill', '2', 'Shoots water', ['damageTarget']),
			new RUDEDUDES.move('Firestick', 'Fire', 'AtWill', '2', 'Hit him with a firestick', ['damageTarget'])
		];
		var getMove = function(index){return moves[index];}
		return  {
			moves: moves,
			getMove: getMove
		}
	},
	encounterCanvas: function(width, height) {
		this.width = width;
		this.height = height;
		
		var game_el = document.querySelector('#game');
		this.stage = new Kinetic.Stage({container: game_el, width: this.width, height: this.height})
		
		var layer_names = ['background', 'dudes', 'animations', 'HUD'];
		this.layers = {};
		for (i = 0; i < layer_names.length ; i++){
			this.stage.add(this.layers[layer_names[i]] = new Kinetic.Layer({id: layer_names[i]})); 
		}
		this.drawHUD = function(encounter, RUDEDUDES) {
			this.layers.HUD.removeChildren();
			this.drawMoveButtons(encounter, RUDEDUDES);
			this.drawTopHUD(encounter, RUDEDUDES);
		};
		this.drawTopHUD = function(encounter, RUDEDUDES) {
			var canvas = this;

			var canvasWidth = canvas.stage.width();
			var canvasHeight = canvas.stage.height();
			var xPaddingRatio = .05;
			var yPaddingRatio = .05;
			var xRatio = .35;
			var yRatio = .03;
			var xMyTotal = canvasWidth*xPaddingRatio;
			var xEnemyTotal = canvasWidth - canvasWidth*xRatio - canvasWidth*(xPaddingRatio);
			var y = canvasHeight * yPaddingRatio;
			var height = canvasHeight * yRatio;
			var width = xRatio * canvasWidth;
			var widthMyHP = canvasWidth * xRatio * (encounter.myDude.stats.HP / encounter.myDude.defaultStats.HP);
			var widthEnemyHP = canvasWidth * xRatio * (encounter.enemyDude.stats.HP / encounter.enemyDude.defaultStats.HP);
			
			//create my dude
			var rectMyBox = new Kinetic.Rect({
				x: xMyTotal,
				y: y,
				width: width,
				height: height,
				stroke: 'black',
				strokewidth: 1,
			});
			var rectMyHP = new Kinetic.Rect({
				x: xMyTotal,
				y: y,
				width: widthMyHP,
				height: height,
				fill: 'green'
			});
			canvas.layers.HUD.add(rectMyBox);
			canvas.layers.HUD.add(rectMyHP);
			
			//create enemy dude
			var rectEnemyBox = new Kinetic.Rect({
				x: xEnemyTotal,
				y: y,
				width: width,
				height: height,
				stroke: 'black',
				strokewidth: 1,
			});
			var rectEnemyHP = new Kinetic.Rect({
				x: xEnemyTotal,
				y: y,
				width: widthEnemyHP,
				height: height,
				fill: 'green'
			});
			canvas.layers.HUD.add(rectEnemyBox);
			canvas.layers.HUD.add(rectEnemyHP);
			
			//draw it :) 
			canvas.layers.HUD.draw();
			
		};
		
		this.drawMoveButtons = function(encounter, RUDEDUDES) {
			
			var moveEffects = new RUDEDUDES.moveEffects(RUDEDUDES);
			var drawButton = function(xRatio,sideRatio,defaultText,move,encounter,canvas){
				
				var color = 'rgba(125,125,125,.7)';
				var text = defaultText;
				var moveEffect = function(){};
				
				if (move !== undefined) {
					color = 'rgba(0,125,0,1)'
					text = move.moveName;
					moveEffect = function(){moveEffects.useMove(move, encounter.myDude, encounter.enemyDude, encounter)};
				};
				
				var sideLength = canvas.stage.width() * sideRatio;
				var x = canvas.stage.width() * xRatio;
				var y = canvas.stage.height() - sideLength;
				var fontSize = sideLength * .15;
				
				var btn = new Kinetic.Rect({
					x: x,
					y: y,
					width: sideLength,
					height: sideLength,
					stroke: 'black',
					strokewidth: 1,
					fill: color
				});
				
				btn.on('click', moveEffect);
				
				canvas.layers.HUD.add(btn);
				canvas.layers.HUD.add(new Kinetic.Text({
					x: x,
					y: y  + sideLength / 2 - fontSize / 2,
					text: text,
					align: 'center',
					width: sideLength,
					fontSize: fontSize,
					fill: 'black'
				}));
				canvas.layers.HUD.draw();
			};
			
			drawButton((3/16),.125,'(Passive)',encounter.myDude.moves.passive,encounter,this);
			drawButton((5/16),.125,'(Ability 1)',encounter.myDude.moves.ability1,encounter,this);
			drawButton((7/16),.125,'(Ability 2)',encounter.myDude.moves.ability2,encounter,this);
			drawButton((9/16),.125,'(Ability 3)',encounter.myDude.moves.ability3,encounter,this);
			drawButton((11/16),.125,'(Ultimate)',encounter.myDude.moves.ult,encounter,this);
		};
		
		return this;
	}
});
