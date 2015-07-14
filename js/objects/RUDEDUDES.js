var RUDEDUDES = (function (my, $) {
	my.encounter = function(myPlayer, enemyPlayer){
		var encounter = this;

		encounter.myPlayer = myPlayer;
		encounter.enemyPlayer = enemyPlayer;

		encounter.myDude = myPlayer.getStartingDude();
		encounter.enemyDude = enemyPlayer.getStartingDude();

		//game will check this to update HUD
		encounter.myDude.moveComplete = false;
		encounter.enemyDude.moveComplete = false;
		encounter.myTurn = true;

		encounter.getEnemyMove = function() {
			return encounter.enemyDude.moves.ability1;
		};

		encounter.useEnemyMove = function() {
			console.log(encounter.getEnemyMove());
			console.log( encounter.enemyDude);
			console.log(encounter.myDude);
			console.log(encounter);
			my.moveEffects.useMove(encounter.getEnemyMove(), encounter.enemyDude, encounter.myDude, encounter);
		};

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
	my.moveEffects = function(){
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
			var dudeEffects = move.moveEffects;
			for (i = 0; i < dudeEffects.length; i++) {
				switch(dudeEffects[i]) {
					case 'damageTarget':
						this.dealDamage(move, attackingDude, targetDude, encounter)
						break;
				}
			}
			attackingDude.moveComplete = true;
			//console.log(encounter.enemyDude.stats);
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
	
	
	return my;
}(RUDEDUDES || {}, jQuery));
