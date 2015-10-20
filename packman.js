var ansi = require('ansi');

//--------------------------------------------------------------------------------------------------------------//

var Board = function(){
	this.left_top = [40, 5],
	this.right_top = [110, 5],

	this.left_bottom = [40, 30],
	this.right_bottom = [110, 30],

  	this.cursor = ansi(process.stdout);
};

//--------------------------------------------------------------------------------------------------------------//

Board.prototype = {

	collision_points : [],
	
	food : [],

	obstacles : [ [60,6], [60,7], [60,8], [60,9], [60,10], [60,11],
				  [90,21], [90,22], [90,23], [90,24], [90,25], [90,26], [90,27], [90,28], [90,29],
				  [41,24], [42,24], [43,24], [44,24], [45,24], [46,24], [47,24], [48,24],
				  [61,28], [62,28], [63,28], [64,28], [65,28], 	[66,28], [67,28], [68,28],
				  [70,17], [71,17], [72,17], [73,17], [74,17], [75,17], [76,17], [77,17], [78,17], [79,17],
				  [80,17], [81,17], [82,17], [83,17], [84,17], [85,17], [86,17], [87,17], 
				  [88,17], [89,17], [90,17], [91,17], [92,17], [93,17], [94,17], [95,17], 
				],

	empty_space : [41,29],

	border_points : [],

	generate_line : function(startPoint, endPoint){
		var line_coOrdinates = [];
		if(startPoint[0] != endPoint[0]){
			for(var i = startPoint[0]; i <= endPoint[0]; i++)
				line_coOrdinates.push([i, startPoint[1]]);
		}else{
			for(var i = startPoint[1]; i <= endPoint[1]; i++)
				line_coOrdinates.push([startPoint[0], i]);
		};
		return line_coOrdinates;
	},

	generate_border : function(){
		this.border_points = this.border_points.concat(this.generate_line(this.left_top, this.right_top));
		this.border_points = this.border_points.concat(this.generate_line(this.left_top, this.left_bottom));
		this.border_points = this.border_points.concat(this.generate_line(this.right_top, this.right_bottom));
		this.border_points = this.border_points.concat(this.generate_line(this.left_bottom, this.right_bottom));
	},

	remove_unwanted_points : function(from, comparingCollection){
		var arrayToString = function(array){
			return array.join("");
		};
		var unique = [];
		var temp_from = from.map(arrayToString);
		var comparingCollection = comparingCollection.map(arrayToString);
		temp_from.forEach(function(point, index){
			if(comparingCollection.indexOf(point) == -1)
				unique.push(from[index]);
		});
		return unique;
	},

	generate_food : function(){
		for(var i = this.left_top[1]; i <= this.left_bottom[1]; i++){
			var line = this.generate_line([this.left_top[0],i], [this.right_top[0],i]);
			this.food = this.food.concat(line);
		};
		this.collision_points = this.border_points.concat(this.obstacles).concat([this.empty_space])
		this.food = this.remove_unwanted_points(this.food, this.collision_points);
	},

	print_box : function(){
		var self = this;
		this.border_points.forEach(function(point){
			self.cursor.goto(point[0], point[1]).write('-').reset();
		});
	},

	print_obstacle : function(){
		var self = this;
		this.obstacles.forEach(function(point){
			self.cursor.goto(point[0], point[1]).write('*').reset();
		});
	},

	clearscreen : function(){
  		this.cursor.write('\u001B[2J\u001B[');
	},

};

//--------------------------------------------------------------------------------------------------------------//

var Packman = function(collision_points, food){
	this.represent = '@';
	this.collision_points = collision_points;
	this.food = food;

	this.stdin = process.stdin;
  	this.stdin.setRawMode(true);
  	this.stdin.setEncoding('utf8');

  	this.cursor = ansi(process.stdout);
};

Packman.prototype = {
	score : 0,

	position : [41,29],

	print_food : function(){
		var self = this;
		this.food.forEach(function(point){
			self.cursor.goto(point[0], point[1]).write('.').reset();
		});
	},

	clearscreen : function(){
  		this.cursor.write('\u001B[2J\u001B[');
	},

	isCollide : function(){
		var collision_points = this.collision_points.map(function(p){return p.join('');});
		if(collision_points.indexOf(this.position.join('')) != -1)
			return true;
		return false;
	},

	removeFood : function(){
		var initLength = this.food.length;
		var food = this.food.map(function(p){ return p.join('')});
		var pos = this.position.join('');
		var index;
		for(var i = 0; i< food.length; i++){
			if(pos == food[i]){
				index = i;
				break;
			}
		};
		if(index != undefined)
			this.food.splice(index, 1);
		if(initLength != this.food.length)
			this.score++;
	},

	isFoodEmpty : function(){
		return this.food.length == 0;
	},

	move : function(direction){
		switch (direction){
			case 'w' :
				this.position = [this.position[0], this.position[1]-1]
				break;
			case 'a' :
				this.position = [this.position[0]-1, this.position[1]]
				break;
			case 's' :
				this.position = [this.position[0], this.position[1]+1]
				break;
			case 'd' :
				this.position = [this.position[0]+1, this.position[1]]
				break;
		};
		if(this.isCollide()){
			this.end();
		};
		this.removeFood();
		if(this.isFoodEmpty())
			this.win();
  		this.cursor.hide();
		print();
	},

	win : function(){
		this.clearscreen();
		this.cursor.goto(60,19).write('GAME OVER Your WON : '+this.score+"\n").reset();
		process.exit(0);
	},

	end : function(){
		this.clearscreen();
		this.cursor.goto(60,19).write('GAME OVER Your Score : '+this.score+"\n").reset();
		process.exit(0);
	},

	listenInput : function(){
		var self = this;

		this.stdin.on('data', function(key) {
	  		if (key === '\u0003') {
	      		self.end();
	    	}else{
	      		if (['w', 'a', 's', 'd'].indexOf(key) !== -1) {
	        		self.move.call(self, key)
	      		}
	    	}
	  	})
	},

	print_score : function(){
		this.cursor.goto(130,5).write("Score : "+this.score).reset();
	},

	print_packman : function(){
		this.cursor.goto(this.position[0], this.position[1]).write(this.represent).reset();
	}
};

//--------------------------------------------------------------------------------------------------------------//

var b = new Board();
b.generate_border();
b.generate_food();

var p = new Packman(b.collision_points, b.food);
p.listenInput();

var print = function(){
	b.clearscreen();
	b.print_box();
	b.print_obstacle();
	p.print_food();
	p.print_packman();
	p.print_score();
};

print();