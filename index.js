var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload: preload,
  create: create,
  update: update,
});

var ball;
var paddle;
var scoreText;
var scoreTextStart;
var scoreTextEnd;
var scoreOver;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var textStyle = { font: '18px Arial', fill: '#0095DD' };
var newGame;
var playing = false;
var startButton;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#f8f5f5';

  game.load.image('ball', 'img/ball.png');
  game.load.image('paddle', 'img/paddle.jpg');
  game.load.image('brick', 'img/brick.png');
  game.load.spritesheet('button', 'img/button.png', 120, 40);
}
function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down = false;
  ball = game.add.sprite(
    game.world.width * 0.5,
    game.world.height - 25,
    'ball'
  );
  ball.anchor.set(0.5, 0.5);
  game.physics.enable(ball, Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);
  ball.checkWorldBounds = true;

  ball.events.onOutOfBounds.add(ballLeaveScreen, this); // out if screen

  paddle = game.add.sprite(
    game.world.width * 0.5,
    game.world.height - 5,
    'paddle'
  );
  paddle.anchor.set(0.5, 1);
  game.physics.enable(paddle, Phaser.Physics.ARCADE);
  paddle.body.immovable = true;

  initBricks();

  scoreText = game.add.text(5, 5, 'Points: 0', textStyle);

  livesText = game.add.text(
    game.world.width - 5,
    5,
    'Lives: ' + lives,
    textStyle
  );
  livesText.anchor.set(1, 0);
  lifeLostText = game.add.text(
    game.world.width * 0.5,
    game.world.height * 0.5,
    'Life lost, click to continue',
    textStyle
  );
  lifeLostText.anchor.set(0.5);
  lifeLostText.visible = false;

  // create buttom
  startButton = game.add.button(
    game.world.width * 0.5,
    game.world.height * 0.5,
    'button',
    startGame,
    this,
    1,
    0,
    2
  );
  startButton.anchor.set(0.5);
}

function update() {
  game.physics.arcade.collide(ball, paddle, ballHitPaddle);
  game.physics.arcade.collide(ball, bricks, ballHitBrick);
  if (playing) {
    paddle.x = game.input.x || game.world.width * 0.5;
  }

  ball.angle += 1;
}

function initBricks() {
  //create breaks
  brickInfo = {
    width: 50,
    height: 20,
    count: {
      row: 3,
      col: 7,
    },
    offset: {
      top: 50,
      left: 60,
    },
    padding: 10,
  };
  bricks = game.add.group();
  for (c = 0; c < brickInfo.count.col; c++) {
    for (r = 0; r < brickInfo.count.row; r++) {
      var brickX =
        c * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
      var brickY =
        r * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
      newBrick = game.add.sprite(brickX, brickY, 'brick');
      game.physics.enable(newBrick, Phaser.Physics.ARCADE);
      newBrick.body.immovable = true;
      newBrick.anchor.set(0.5);
      bricks.add(newBrick);
    }
  }
}

function ballHitBrick(ball, brick) {
  // kick's breaks
  brick.kill();
  score += 1;
  scoreText.setText('Points: ' + score);

  var count_alive = 0;
  for (i = 0; i < bricks.children.length; i++) {
    if (bricks.children[i].alive == true) {
      count_alive++;
    }
  }
  if (count_alive == 0) {
    ball.reset(game.world.width * 0.5, game.world.height - 25);
    paddle.reset(game.world.width * 0.5, game.world.height - 5);

    scoreTextEnd = game.add.text(
      game.world.width * 0.5,
      game.world.height * 0.5,
      'Congratulations! You win!'.toUpperCase(),
      textStyle
    );
    scoreTextEnd.anchor.set(0.5);
    newGame = game.add.text(
      game.world.width * 0.5,
      game.world.height * 0.5 + 40,
      'Click  to start new game',
      textStyle
    );
    scoreTextEnd.anchor.set(0.5);
    newGame.anchor.set(0.5);

    game.input.onDown.add(function () {
      location.reload();
    });

    playing = false;
  }
}

function ballLeaveScreen() {
  //text life
  lives--;
  if (lives) {
    livesText.setText('Lives: ' + lives);
    lifeLostText.visible = true;
    ball.reset(game.world.width * 0.5, game.world.height - 25);
    paddle.reset(game.world.width * 0.5, game.world.height - 5);
    game.input.onDown.addOnce(function () {
      lifeLostText.visible = false;
      ball.body.velocity.set(150, -150);
    }, this);
  } else {
    scoreOver = game.add.text(
      game.world.width * 0.5,
      game.world.height * 0.5,
      'Game over!'.toUpperCase(),
      textStyle
    );
    scoreOver.anchor.set(0.5);

    scoreTextStart = game.add.text(
      //end game menu
      game.world.width * 0.5,
      game.world.height * 0.5 + 40,
      'Start a new game in 3 sec...',
      textStyle
    );
    scoreTextStart.anchor.set(0.5);
    setTimeout(() => {
      location.reload(); // start new game
    }, 3000);
  }
}

function ballHitPaddle(ball, paddle) {
  ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
}

// function buttom start game
function startGame() {
  startButton.destroy();
  ball.body.velocity.set(150, -150);
  playing = true;
}
