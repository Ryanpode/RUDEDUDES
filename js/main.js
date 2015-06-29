var canvasWidth = 640;
var canvasHeight = 360;

requirejs.config({
    baseUrl: 'js/objects',
});

//define RUDEDUDES
requirejs(['RUDEDUDES'], function (RUDEDUDES) {
	test(RUDEDUDES);
});

var test = function(RUDEDUDES) {
	//console.log(RUDEDUDES);
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
	var duder1 = new RUDEDUDES.dude(config1, dudeList, moveList);
	
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
	
	var encounter = new RUDEDUDES.encounter(duder1, duder2);
	var cnv = new RUDEDUDES.encounterCanvas(640, 360);
	window.setInterval(function(){
		cnv.drawHUD(encounter,RUDEDUDES);
	}, 1000);
};

