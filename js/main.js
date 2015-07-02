var canvasWidth = 640;
var canvasHeight = 360;


var test = function() {

	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

	function preload() { 
		
		// Add the Isometric plug-in to Phaser
	    game.plugins.add(new Phaser.Plugin.Isometric(game));

	 	// Set the world size
	    game.world.setBounds(0, 0, 2048, 1024);

	 	// Start the physical system
	    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

	 	// set the middle of the world in the middle of the screen
	    game.iso.anchor.setTo(0.5, 0);
	}

	function create() {
	}

	function update() {
	}

	/*console.log(RUDEDUDES);
	
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
		dudeStats:  new RUDEDUDES.stats(10,3,4,5),
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
	
	var encounter = new RUDEDUDES.encounter(player1, player2);
	var cnv = new RUDEDUDES.encounterCanvas(640, 360);
	window.setInterval(function(){
		cnv.drawHUD(encounter,RUDEDUDES);
	}, 1000);*/
};
