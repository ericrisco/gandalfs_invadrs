function create () {
  game.load.start();
  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Initialize sounds
  meowSound = game.add.audio('meow', 1, false);
  explodeSound = game.add.audio('explosion', 1, false);
  galletitaSound = game.add.audio('galletita', 1, false);
  redbullSound = game.add.audio('redbull', 1, false);

  epicSaxGandalf = game.add.audio('gandalf_epic_sax', 1, true);
  nyanCat = game.add.audio('nyancat', 1, true);
  
  playGandalfSaxMusic();

  // Init Background
  background = game.add.image(0,0, 'background');

  // Init Nyan Cat
  nyancat = game.add.sprite(initialPlayerPosition, 540, 'nyan');
  game.physics.enable(nyancat, Phaser.Physics.ARCADE);
  nyancat.anchor.setTo(0.5, 0.5);
  nyancat.body.bounce.x = 1;
  nyancat.body.collideWorldBounds = true;

  // Init Sax Guy
  saxguy = game.add.sprite(385,25,'saxguy');    
  saxguy.animations.add('saxguy');   
  saxguy.play('saxguy',10, true, false);

  // Initialize rainbows 
  rainbows = game.add.group();
  rainbows.enableBody = true;
  rainbows.physicsBodyType = Phaser.Physics.ARCADE;
  rainbows.createMultiple(5, 'rainbow');
  rainbows.setAll('anchor.x', 0.5);
  rainbows.setAll('anchor.y', 1);
  rainbows.setAll('checkWorldBounds', true);
  rainbows.setAll('outOfBoundsKill', true);

  // Initialize gandalfs
  createGandalfs();
  animateGandalfs();

  // Initialize galletitas
  galletitas = game.add.group();
  galletitas.enableBody = true;
  galletitas.physicsBodyType = Phaser.Physics.ARCADE;
  galletitas.createMultiple(10, 'galletita');
  galletitas.setAll('anchor.x', 0.5);
  galletitas.setAll('anchor.y', 0.5);
  galletitas.setAll('checkWorldBounds', true);
  galletitas.setAll('outOfBoundsKill', true);

  // Initialize Redbulls
  redbulls = game.add.group();
  redbulls.enableBody = true;
  redbulls.physicsBodyType = Phaser.Physics.ARCADE;
  redbulls.createMultiple(1, 'redbull');
  redbulls.setAll('anchor.x', 0.5);
  redbulls.setAll('anchor.y', 0.5);
  redbulls.setAll('checkWorldBounds', true);
  redbulls.setAll('outOfBoundsKill', true);

  // Initialize explosions
  explosions = game.add.group();
  explosions.createMultiple(10, 'explosion');
  explosions.setAll('anchor.x', 0.5);
  explosions.setAll('anchor.y', 0.5);
  explosions.forEach(setupExplosion, this);

  // Init Header
  background = game.add.image(0,0, 'header');

  livesText = game.add.text(game.world.bounds.width - 16, 0, "LIVES: " + lives, headerStyle);
  livesText.anchor.set(1, 0);

  scoreText = game.add.text(game.world.centerX, 0, '', headerStyle);
  scoreText.anchor.set(0.5, 0);

  highScoreText = game.add.text(16, 0, '', headerStyle);
  highScoreText.anchor.set(0, 0);

  // Setup controls
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  restartButton = game.input.keyboard.addKey(Phaser.Keyboard.R);

  getHighScore();

  updateScore();
}
