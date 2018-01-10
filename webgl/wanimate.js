class cViewAnimate {
  constructor(dialog) {
  }
  _addPlayBarToCanvas() {
    this.playBarWrapper = document.createElement('div');
    this.playBarWrapper.classList.add('play-bar-wrapper');
    let canvasWrapper = this.dialog.querySelector('.popup-canvas-wrapper');
    canvasWrapper.appendChild(this.playBarWrapper);

    this.playBarPlayButton = document.createElement('button');
    this.playBarWrapper.append(this.playBarPlayButton);
    this.playBarPlayButton.innerHTML = '<i class="material-icons">play_arrow</i>';
    this.playBarPlayButton.setAttribute('class', 'btn play-button');

    this.playBarSlider = document.createElement('input');
    this.playBarWrapper.append(this.playBarSlider);
    this.playBarSlider.setAttribute('type', 'range');
  }
  showAnimation(key, type) {
    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas)
      this.context = new wContext(this.canvas);
  }
}
