define('./view/VIEW', function(canvas) {
	console.log('test');
	canvas.encounterView = function() {
		this.test = 0;
		console.log(canvas);
		return this;
	};
});