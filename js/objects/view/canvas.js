define('./view/VIEW', function(VIEW) {
	VIEW.canvas = function() {
		this.canvas = document.getElementById('myCanvas');
		this.ctx = canvas.getContext('2d');
		
		return this;
	};
});