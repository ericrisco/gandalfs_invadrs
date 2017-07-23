var game = new Phaser.Game(1024, 576, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

const initialGalletaGravity = 250;
const stepGalletaGravity = 100;

var rainbowTime = 0,
    initialPlayerPosition = 512;
    lives = 3,
    score = 0,
    highScore = 0;
    galletaGravity = initialGalletaGravity;

var headerStyle = { font: "23px consolas", fill: "#00FF00", align: "center" },
    centerStyle = { font: "bold 32px consolas", fill: "#ffffff", align: "center" },
    boldStyle = { font: "bold 32px consolas", fill: "#ffffff", align: "center" };

function setupExplosion (explosion) {
  explosion.animations.add('explode');
}

function nyanMovement () {
  const max = 300;
  const step = 10;
  const slowing = 2;

  if (cursors.right.isDown && nyancat.body.velocity.x < max) {
    // Right
    nyancat.body.velocity.x += step;
  }else if (cursors.left.isDown && nyancat.body.velocity.x > -max) {
    // Left
    nyancat.body.velocity.x -= step;
  }
  else {
    // Slow down
    if (nyancat.body.velocity.x > 0) {
      nyancat.body.velocity.x -= slowing;
    }
    else if (nyancat.body.velocity.x < 0) {
      nyancat.body.velocity.x += slowing;
    }
  }
}

function fireRainbow () {
  const start = 20;
  const velocity = -500;  

  if (game.time.now > rainbowTime) {
    rainbow = rainbows.getFirstExists(false);

    if (rainbow) {
      meowSound.play();
      rainbow.reset(nyancat.x, nyancat.y - start);
      rainbow.body.velocity.y = velocity;
      rainbow.body.velocity.x = nyancat.body.velocity.x / 4
      rainbowTime = game.time.now + 400;         
      rainbow.animations.add('rainbow');
      rainbow.play('rainbow',10, true, false);
    }
  }
}

function rainbowHitsGandalf (rainbow, gandalf) {
  const addScore = 10;

  rainbow.kill();
  explode(gandalf);
  score += addScore;
  updateScore();

  if (gandalfs.countLiving() == 0) {
    newWave();
  }
}

function galletitaHitsNyan (galletita, nyan) {
  galletita.kill();
  explode(nyan);
  lives -= 1;
  updateLivesText();
  if (lives > 0) {
    respawnNyan();
  }
  else {
    gameOver();
  }
}

function redbullHitsNyan(redbull, nyan) {
  var actualPosition = nyancat.body.x;
  redbull.kill();
  nyan.kill();
  nyancat.revive();
  nyancat.body.x = actualPosition;
  lives += 1;
  updateLivesText();
  redbullSound.play();
}

function explode (entity) {
  entity.kill();
  explodeSound.play();
  var explosion = explosions.getFirstExists(false);
  explosion.reset(entity.body.x + (entity.width / 2), entity.body.y + (entity.height / 2));
  explosion.play('explode', 30, false, true);
}

function updateLivesText () {
  livesText.text = "LIVES: " + lives;
}

function getHighScore () {
  savedHighScore = Cookies.get('highScore');
  if (savedHighScore != undefined) {
    highScore = savedHighScore;
    return highScore;
  }else{
    return '0';
  }
}

function updateScore () {
  const padleft = 6;

  if (score > highScore) {
    highScore = score;
  }
  scoreText.text = pad(score, padleft);
  highScoreText.text = "BEST SCORE: " + pad(highScore, padleft);
}

function respawnNyan () {
  nyancat.body.x = initialPlayerPosition;
  setTimeout(function () {
    nyancat.revive();
  }, 1000);
}

function newWave () {
  //Adding gravity throw waves
  galletaGravity += stepGalletaGravity;

  setTimeout(function () {
    gandalfs.removeAll();
    createGandalfs();
    animateGandalfs();
  }, 1000);
}

function restartGame () {
  gameOverText.destroy();
  restartText.destroy();

  lives = 3
  score = 0
  updateScore();
  updateLivesText();
  
  playGandalfSaxMusic();

  respawnNyan();
  newWave();
}

function gameOver () {
  setTimeout(function() {

    galletaGravity = initialGalletaGravity;

    if(highScore <= getHighScore()){
      gameOverText = game.add.text(game.world.centerX, game.world.centerY, "GANDALF WINS AGAIN", boldStyle);
      restartText = game.add.text(game.world.centerX, game.world.height - 16, "PRESS 'R' TO RESTART", centerStyle);
    }else{      
      playNyancatMusic();
      gameOverText = game.add.text(game.world.centerX, game.world.centerY, "NEW RECORD! NYAN CAT WINS!", boldStyle);
      restartText = game.add.text(game.world.centerX, game.world.height - 16, "PRESS 'R' TO RESTART", centerStyle);
    }

    gameOverText.anchor.set(0.5, 0.5);
    restartText.anchor.set(0.5, 1);

    Cookies.set('high_score', highScore, { expires: '9999-12-31' });

  }, 1000);
}

function createGandalfs () {
  gandalfs = game.add.group();
  gandalfs.enableBody = true;
  gandalfs.physicsBodyType = Phaser.Physics.ARCADE;

  for (var y = 0; y < 3; y++) {
    for (var x = 0; x < 10; x++) {
      var gandalf = gandalfs.create(x * 72, y * 48, 'gandalf');
      gandalf.anchor.setTo(0.5, 0.5);
      gandalf.body.moves = true;
      gandalf.animations.add('gandalf');
      gandalf.play('gandalf',5, true, false);
    }
  }

  gandalfs.x = 64;
  gandalfs.y = 96;

  gandalfs.forEach(function (gandalf, i) {
    game.add.tween(gandalf).to( { y: gandalf.body.y + 2 }, 500, Phaser.Easing.Sinusoidal.InOut, true, game.rnd.integerInRange(0, 500), 1000, true);
  })
}

function animateGandalfs () {
  var tween = game.add.tween(gandalfs).to( { x: 308 }, 2500, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);
  tween.onLoop.add(descend, this);
}

function handleGalletitas () {
  gandalfs.forEachAlive(function (gandalf) {
    chanceOfDroppingGalletita = game.rnd.integerInRange(0, 20 * gandalfs.countLiving());
    if (chanceOfDroppingGalletita == 0) {
      dropGalletita(gandalf);
    }
  }, this)
}

function handleRedbulls () {
  gandalfs.forEachAlive(function (gandalf) {
    chanceOfDroppingRedbull = game.rnd.integerInRange(0, 500 * gandalfs.countLiving());
    if (chanceOfDroppingRedbull == 0) {
      dropRedbull(gandalf);
    }
  }, this)
}

function dropGalletita (gandalf) {
  galletita = galletitas.getFirstExists(false);

  if (galletita && nyancat.alive) {
    galletitaSound.play();
    galletita.reset(gandalf.x + gandalfs.x, gandalf.y + gandalfs.y + 16);
    galletita.body.velocity.y = +100;
    galletita.body.gravity.y = galletaGravity;
  }
}

function dropRedbull(gandalf){
  redbull = redbulls.getFirstExists(false);

  if (redbull && nyancat.alive) {
    galletitaSound.play();
    redbull.reset(gandalf.x + gandalfs.x, gandalf.y + gandalfs.y + 16);
    redbull.body.velocity.y = +100;
    redbull.body.gravity.y = 350
    //redbull.animations.add('redbull');
    //redbull.play('redbull',10, true, false);
  }
}

function playGandalfSaxMusic(){
  nyanCat.stop();
  epicSaxGandalf.stop();
  epicSaxGandalf.play();
  epicSaxGandalf.onLoop.add(function(){
    playGandalfSaxMusic();
  }, this);
}

function playNyancatMusic(){
  epicSaxGandalf.stop();
  nyanCat.stop();
  nyanCat.play();
  nyanCat.onLoop.add(function(){
    playNyancatMusic();
  }, this);
}

function descend () {
  if (nyancat.alive) {
    game.add.tween(gandalfs).to( { y: gandalfs.y + 8 }, 2500, Phaser.Easing.Linear.None, true, 0, 0, false);
  }
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}
