var RUDEDUDES = (function (my, $) {
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

		dude.moveResults = {};
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
	};
	my.moveResults = function(move){
		var moveResults = this;

		moveResults.move = move;
		moveResults.damage = 0;
		moveResults.notes = [];

		return moveResults;
	};
	my.moveEffects = function(){
		this.getTypeMultiplier = function(attackType, dudeType) {
			switch (attackType) {
				case 'Water':
					switch(dudeType) {
						case 'Fire':
							return .5;
						default:
							return 1;
					}
				case 'Fire':
					switch(dudeType) {
						case 'Water':
							return 2;
						default:
							return 1;
					}
				default:
					return 1;
			}
		};				
		this.dealDamage = function(move, attackingDude, targetDude, encounter) {
			var typeMultiplier = this.getTypeMultiplier(targetDude.dudeInfo.type, move.moveType);
			var bonusMultiplier = attackingDude.stats.Atk / targetDude.stats.Def;
			var base = move.moveBase;
			var damage =  base * typeMultiplier * bonusMultiplier;
			var newHP = targetDude.stats.HP - damage;
			targetDude.stats.HP = Math.max(newHP,0);
			return damage;
		};
		this.useMove = function(move, attackingDude, targetDude, encounter) {
			var dudeEffects = move.moveEffects;

			//do call each of the proper effect functions and log results in myResults object
			var myResults = new my.moveResults(move);
			for (i = 0; i < dudeEffects.length; i++) {
				switch(dudeEffects[i]) {
					case 'damageTarget':
						//deal damage and save the amount
						myResults.damage += this.dealDamage(move, attackingDude, targetDude, encounter);
						break;
				}
			}
			attackingDude.moveResults = myResults;
			attackingDude.moveComplete = true;
			encounter.checkWinLose();
		};
		return this;
	}(my.moveEffects || {});
	my.moveList = function(){
		var moves = [
			new my.move('Watershot', 'Water', 'AtWill', '8', 'Shoots water', ['damageTarget']),
			new my.move('Firestick', 'Fire', 'AtWill', '8', 'Hit him with a firestick', ['damageTarget']),
			new my.move('Firetooth', 'Fire', 'AtWill', '8', 'Hit him with a firestick', ['damageTarget'])
		];
		var getMove = function(index){return moves[index];}
		return  {
			moves: moves,
			getMove: getMove
		}
	};
	my.encounter = function(myPlayer, enemyPlayer){
		var encounter = this;

		encounter.myPlayer = myPlayer;
		encounter.enemyPlayer = enemyPlayer;

		encounter.myDude = myPlayer.getStartingDude();
		encounter.enemyDude = enemyPlayer.getStartingDude();

		//game will check this to update HUD
		encounter.myDude.moveComplete = false;
		encounter.myDude.moveResults = {};

		encounter.enemyDude.moveComplete = false;
		encounter.enemyDude.moveResults = {};

		encounter.win = false;
		encounter.lose = false;
		encounter.dudeBoxed = false;

		encounter.myTurn = true;

		encounter.throwBox = function() {
			encounter.myPlayer.dudes.push(encounter.enemyDude);
			encounter.moveComplete = true;
			encounter.dudeBoxed = true;
		};

		encounter.checkWinLose = function() {
			if (myPlayer.getStartingDude() < 0) {
				encounter.lose = true;
			}
			if (enemyPlayer.getStartingDude() < 0) {
				encounter.win = true;
			}
		};

		encounter.getEnemyMove = function() {
			return encounter.enemyDude.moves.ability1;
		};

		encounter.useEnemyMove = function() {
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
	
	return my;
}(RUDEDUDES || {}, jQuery));
