function preload () {
  game.cache = new Phaser.Cache(game);
  game.load.reset();
  game.load.removeAll();
  
  game.load.image('nyan', 'images/nyan.png?v=1');
  game.load.image('galletita', 'images/galletita.png?v=3');
  game.load.image('background', 'images/euskal.jpg?v=3');
  game.load.image('header', 'images/header.png?v=3');

  game.load.spritesheet('gandalf', 'images/gandalf.png?v=1', 40, 60);
  game.load.spritesheet('redbull', 'images/redbull.png?v=1', 75, 60);
  game.load.spritesheet('rainbow', 'images/rainbow.png?v=1', 40, 40);
  game.load.spritesheet('explosion', 'images/explosion.png?v=1', 80, 80);
  game.load.spritesheet('saxguy', 'images/saxguy.png?v=1', 300, 130);

  game.load.audio('meow', 'sounds/meow.wav');
  game.load.audio('explosion', 'sounds/explosion.wav');
  game.load.audio('galletita', 'sounds/galletita.wav');
  game.load.audio('redbull', 'sounds/redbull.wav');

  game.load.audio('gandalf_epic_sax', 'sounds/gandalf_epic_sax.mp3');
  game.load.audio('nyancat', 'sounds/nyancat.mp3');

}
