var canvasWidth = 640;
var canvasHeight = 360;

var RudeDudesGame = RudeDudesGame || {};

RudeDudesGame.game = new Phaser.Game(640, 360, Phaser.AUTO, '');

RudeDudesGame.game.state.add('Boot', RudeDudesGame.Boot);
RudeDudesGame.game.state.add('Preload', RudeDudesGame.Preload);
RudeDudesGame.game.state.add('Game', RudeDudesGame.Game);
RudeDudesGame.game.state.add('Encounter', RudeDudesGame.Encounter);

RudeDudesGame.game.state.start('Boot');

	

