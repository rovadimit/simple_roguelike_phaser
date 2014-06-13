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
	game.load.image('background', 'assets/bg_castle.png');
	game.load.image('tile', 'assets/castleCenter.png');
	game.load.image('floor', 'assets/snowCenter.png');
	game.load.image('alien_small', 'assets/alienGreenSmall.png');
	game.load.image('slime', 'assets/slimeBlue_blue.png');
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
	// the walls group contains the tiles
	walls = game.add.group();

	// enabling physics for any object in the walls group
	walls.enableBody = true;

	// create a new random map
	map = [];

	for (var y = 0; y < ROWS; y++) {
		var newRow = [];
		for (var x = 0; x < COLS; x++) {
			if (Math.random() > 0.8) {
				var tile = walls.create(x*60, y*60, 'tile');
				game.physics.arcade.enable(tile);
				tile.body.immovable = true;
				newRow.push(tile);
			}
			else {
				var tile = walls.create(x*60, y*60, 'floor');
				newRow.push(tile);
			}
		}
		map.push(newRow);
	}
}

function drawMap() {
	for (var y = 0; y < ROWS; y++)
		for (var x = 0; x < COLS; x++) {
			screen[y][x].content = map[y][x];
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
		} while (map[actor.y][actor.x].key == 'tile' || actorMap[actor.y + "_" + actor.x] != null);
		
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
		if (actorList[a] != null && actorList[a].hp > 0) 
			screen[actorList[a].y][actorList[a].x].content = a == 0 ? game.add.sprite(actorList[a].x * 60, actorList[a].y * 60, 'alien_small') : game.add.sprite(actorList[a].x * 60, actorList[a].y * 60, 'slime');;
	}
}


function onKeyUp(event) {

	switch (event.keyCode) {
		case Phaser.Keyboard.LEFT:
			
		case Phaser.Keyboard.RIGHT:
			
		case Phaser.Keyboard.UP:

		case Phaser.Keyboard.DOWN:
	}
}