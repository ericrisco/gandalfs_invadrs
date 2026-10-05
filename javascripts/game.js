var game = new Phaser.Game(1024, 576, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

const initialGalletaGravity = 250;
const stepGalletaGravity = 100;

// Charged shot: hold SPACE to charge, release to fire a beam that pierces gandalfs
const chargeShowTime = 1000,   // ms held before the energy ball shows up
      chargeMinTime = 3000,    // ms held for the beam to fire
      chargeMaxTime = 10000,   // ms held for full power
      minBeamPierce = 2,
      maxBeamPierce = 8;

var chargeStart = 0,           // 0 = not charging
    beamTextures = {};

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

function createEnergyBallTexture () {
  const size = 64;
  var bmd = game.add.bitmapData(size, size);
  var gradient = bmd.context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 0, 255, 0.9)');
  gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
  bmd.context.fillStyle = gradient;
  bmd.context.fillRect(0, 0, size, size);
  bmd.dirty = true;
  bmd.render();
  return bmd;
}

function createBeamTextures () {
  const height = 140;

  for (var pierce = minBeamPierce; pierce <= maxBeamPierce; pierce++) {
    var width = beamWidth(pierce);
    var bmd = game.add.bitmapData(width, height);
    var gradient = bmd.context.createLinearGradient(0, 0, width, 0);

    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.25, 'rgba(255, 0, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.75, 'rgba(255, 0, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    bmd.context.fillStyle = gradient;
    bmd.context.fillRect(0, 0, width, height);
    bmd.dirty = true;
    bmd.render();
    beamTextures[pierce] = bmd;
  }
}

function beamWidth (pierce) {
  return 16 + (pierce - minBeamPierce) * 8;
}

function startCharge () {
  if (!nyancat.alive) {
    return;
  }
  fireRainbow();
  chargeStart = game.time.now;
}

function releaseCharge () {
  if (chargeStart == 0) {
    return;
  }
  var held = game.time.now - chargeStart;
  cancelCharge();

  if (held >= chargeMinTime && nyancat.alive) {
    fireBeam(chargePower(held));
  }
}

function cancelCharge () {
  chargeStart = 0;
  energyBall.visible = false;
}

// 0 at chargeMinTime, 1 at chargeMaxTime and beyond
function chargePower (held) {
  return Math.min(1, Math.max(0, (held - chargeMinTime) / (chargeMaxTime - chargeMinTime)));
}

function updateCharge () {
  if (chargeStart == 0) {
    return;
  }
  if (!nyancat.alive) {
    cancelCharge();
    return;
  }

  var held = game.time.now - chargeStart;
  if (held < chargeShowTime) {
    return;
  }

  var growth = Math.min(1, (held - chargeShowTime) / (chargeMaxTime - chargeShowTime));
  energyBall.visible = true;
  energyBall.x = nyancat.x;
  energyBall.y = nyancat.y - 60;
  energyBall.scale.setTo(0.3 + growth * 0.9, 0.3 + growth * 0.9);

  if (held < chargeMinTime) {
    // Not ready yet
    energyBall.alpha = 0.4;
  }
  else if (held < chargeMaxTime) {
    energyBall.alpha = 1;
  }
  else {
    // Full power: blink
    energyBall.alpha = Math.floor(held / 100) % 2 ? 1 : 0.5;
  }
}

function fireBeam (power) {
  const start = 20;
  const velocity = -700;
  var pierce = Math.round(minBeamPierce + power * (maxBeamPierce - minBeamPierce));

  // Free beams that already left the screen or ran out of pierce
  var deadBeams = [];
  beams.forEachDead(function (beam) {
    deadBeams.push(beam);
  }, this);
  deadBeams.forEach(function (beam) {
    beam.destroy();
  });

  var beam = beams.create(nyancat.x, nyancat.y - start, beamTextures[pierce]);
  beam.anchor.setTo(0.5, 1);
  beam.checkWorldBounds = true;
  beam.outOfBoundsKill = true;
  beam.pierce = pierce;
  beam.body.velocity.y = velocity;
  beam.body.velocity.x = nyancat.body.velocity.x / 4;
  meowSound.play();
}

function beamHitsGandalf (beam, gandalf) {
  const addScore = 10;

  if (!beam.alive) {
    return;
  }

  explode(gandalf);
  score += addScore;
  updateScore();

  beam.pierce -= 1;
  if (beam.pierce <= 0) {
    beam.kill();
  }

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
