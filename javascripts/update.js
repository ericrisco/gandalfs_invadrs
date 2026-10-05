function update () {
  nyanMovement();

  // Restart?
  if (restartButton.isDown && lives == 0) {
    restartGame();
  }

  // Charged shot (a tap fires a rainbow on key down, see startCharge)
  updateCharge();

  // Handle drops
  handleGalletitas();
  handleRedbulls();

  // Overlaps
  game.physics.arcade.overlap(galletitas, nyancat, galletitaHitsNyan, null, this);
  game.physics.arcade.overlap(redbulls, nyancat, redbullHitsNyan, null, this);
  game.physics.arcade.overlap(rainbows, gandalfs, rainbowHitsGandalf, null, this);
  game.physics.arcade.overlap(beams, gandalfs, beamHitsGandalf, null, this);

}
