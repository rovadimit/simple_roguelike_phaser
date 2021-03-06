// font size
var FONT = 32;

// map dimensions
var ROWS = 10;
var COLS = 10;

// number of actors per level, including player
var ACTORS = 10;

// the structure of the map
var map;

// the ascii display, as a 2d array of characters
var screen;

var background;
var walls;

var cursors;

// a list of all actors, 0 is the player
var player;
var actorList;
var livingEnemies;

// points to each actor in its position, for quick searching
var actorMap;

// initialize phaser, call create() once done
var game = new Phaser.Game(COLS * 60, ROWS * 60, Phaser.AUTO, null, { preload: preload, create: create, update: update });

function preload() {
	// preload the assets
	game.load.image('background', 'assets/background.png');
	game.load.image('tile', 'assets/tile.png');
	game.load.image('floor', 'assets/floor.png');
	game.load.image('alien', 'assets/alien.png');
	game.load.image('alien', 'assets/alien_walk.png');
	game.load.image('slime', 'assets/slime.png');
	game.load.image('slime', 'assets/slime_walk.png');
	game.load.image('slime', 'assets/slime_dead.png');
	game.load.image('slime', 'assets/worm.png');
	game.load.image('slime', 'assets/worm_walk.png');
	game.load.image('slime', 'assets/worm_dead.png');
}

function create() {
	// enable arcade physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// init keyboard commands
	game.input.keyboard.addCallbacks(null, null, onKeyUp);

	// initialize map
	initMap();

	// initialize screen
	screen = [];
	for (var y = 0; y < ROWS; y++) {
		var newRow = [];
		screen.push(newRow);
		for (var x = 0; x < COLS; x++)
			// newRow.push(initCell('', x, y));
			newRow.push('');
	}

	// initialize actors
	initActors();

	// draw level
	drawMap();
	drawActors();
}

function update() {

}

function initMap() {

	// create a new random map
	map = [];

	for (var y = 0; y < ROWS; y++) {
		var newRow = [];
		for (var x = 0; x < COLS; x++) {
			if (Math.random() > 0.8) {
				newRow.push('tile');
			}
			else {
				newRow.push('floor');
			}
		}
		map.push(newRow);
	}
}

function drawMap() {
	// the walls group contains the tiles
	walls = game.add.group();

	// enabling physics for any object in the walls group
	walls.enableBody = true;

	for (var y = 0; y < ROWS; y++)
		for (var x = 0; x < COLS; x++) {
			screen[y][x].content = walls.create(x*60, y*60, map[y][x]);
		}
}

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function initActors() {
	// create actors at random locations
	actorList = [];
	actorMap = {};
	for (var e = 0; e < ACTORS; e++) {
		// create new actor
		var actor = {
			x: 0,
			y: 0,
			hp: e == 0 ? 3 : 1
		};
		do {
			// pick a random position that is both a floor and not occupied
			actor.y = randomInt(ROWS);
			actor.x = randomInt(COLS);
		} while (map[actor.y][actor.x] == 'tile' || actorMap[actor.y + "_" + actor.x] != null);
		
		// add references to the actor to the actors list & map
		actorMap[actor.y + "_" + actor.x] = actor;
		actorList.push(actor);
	}

	// the player is the first actor in the list
	player = actorList[0];
	livingEnemies = ACTORS - 1;
}

function drawActors() {	
	for (var a in actorList) {
		if (actorList[a] != null && actorList[a].hp > 0) {

			screen[actorList[a].y][actorList[a].x].content = a == 0 ? game.add.sprite(actorList[a].x * 60, actorList[a].y * 60, 'alien') : game.add.sprite(actorList[a].x * 60, actorList[a].y * 60, 'slime');

			if (a.key == 'alien_walk') {
				a.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true);
				a.animations.add('right', [7, 8, 9, 10, 11], 10, true);
			}
		}
	}
}

function canGo(actor,dir) {
	return 	actor.x + dir.x >= 0 &&
			actor.x + dir.x <= COLS - 1 &&
			actor.y + dir.y >= 0 &&
			actor.y + dir.y <= ROWS - 1 &&
			map[actor.y + dir.y][actor.x + dir.x] != 'tile';
}

function moveTo(actor, dir) {
	// check if actor can move in the given direction
	if (!canGo(actor, dir)) 
		return false;
	
	// moves actor to the new location
	console.log("actor.x = " + actor.x + " actor.y = " + actor.y + " dir.x = " + dir.x + " dir.y = " + dir.y);
	
	var newKey = (actor.y + dir.y) +'_' + (actor.x + dir.x);
	// if the destination tile has an actor in it 
	if (actorMap[newKey] != null) {
		console.log("destination has an actor");
	// 	decrement hitpoints of the actor at the destination tile
		var victim = actorMap[newKey];
		console.log("victim.hp = " + victim.hp);
		victim.hp--;
		
	// 	if it's dead remove its reference 
		if (victim.hp == 0) {
			actorMap[newKey] = null;
			actorList[actorList.indexOf(victim)] = null;

			if(victim != player) {
				livingEnemies--;
				if (livingEnemies == 0) {
					// victory message
					var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill : '#ff0059', align: "center" } );
					victory.anchor.setTo(0.5, 0.5);
				}
			}
		}
	} else {
		console.log("destination doesn't have an actor");
	// 	remove reference to the actor's old position
		actorMap[actor.y + '_' + actor.x] = null;
		
		// update position
		actor.y += dir.y;
		actor.x += dir.x;

	// 	add reference to the actor's new position
		actorMap[actor.y + '_' + actor.x] = actor;
	}
	return true;
}

function onKeyUp(event) {
	// draw map to overwrite previous actors positions
	drawMap();
	
	// act on player input
	var acted = false;
	switch (event.keyCode) {
		case Phaser.Keyboard.LEFT:
			acted = moveTo(player, {x:-1, y:0});
			break;
			
		case Phaser.Keyboard.RIGHT:
			acted = moveTo(player,{x:1, y:0});
			break;
			
		case Phaser.Keyboard.UP:
			acted = moveTo(player, {x:0, y:-1});
			break;

		case Phaser.Keyboard.DOWN:
			acted = moveTo(player, {x:0, y:1});
			break;
	}
	
	// enemies act every time the player does
	if (acted)
		for (var enemy in actorList) {
			// skip the player
			if(enemy == 0)
				continue;
			
			var e = actorList[enemy];
			if (e != null)
				aiAct(e);
		}
	
	// draw actors in new positions
	drawActors();
}

function aiAct(actor) {
	var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];	
	var dx = player.x - actor.x;
	var dy = player.y - actor.y;
	
	// if player is far away, walk randomly
	if (Math.abs(dx) + Math.abs(dy) > 6)
		// try to walk in random directions until you succeed once
		while (!moveTo(actor, directions[randomInt(directions.length)])) { };
	
	// otherwise walk towards player
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			// left
			moveTo(actor, directions[0]);
		} else {
			// right
			moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			moveTo(actor, directions[2]);
		} else {
			// down
			moveTo(actor, directions[3]);
		}
	}
	if (player.hp < 1) {
		// game over message
		var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill : '#e22', align: "center" } );
		gameOver.anchor.setTo(0.5,0.5);
	}
}