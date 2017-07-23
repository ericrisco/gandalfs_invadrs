function update () {
  nyanMovement();

  // Restart?
  if (restartButton.isDown && lives == 0) {
    restartGame();
  }

  // Rainbow active?
  if (fireButton.isDown && nyancat.alive) {
    fireRainbow();
  }

  // Handle drops
  handleGalletitas();
  handleRedbulls();

  // Overlaps
  game.physics.arcade.overlap(galletitas, nyancat, galletitaHitsNyan, null, this);
  game.physics.arcade.overlap(redbulls, nyancat, redbullHitsNyan, null, this);
  game.physics.arcade.overlap(rainbows, gandalfs, rainbowHitsGandalf, null, this);

}
