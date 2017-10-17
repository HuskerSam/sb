class cBandChildren {
  constructor(domContainer) {
    this.parentContainer = domContainer;
    this._addChildBlockList();
  }
  _addChildBlockList() {    let html = '<div class="block-editor-child selected">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '</div>';
    this.parentContainer.innerHTML = html;
/*
    let collapseButton = document.createElement('button');
    collapseButton.setAttribute('class', 'selected-mesh-helper-collapse-button');
    collapseButton.innerHTML = '+';
    collapseButton.addEventListener('click', e => {
      if (helperDom.style.display === 'none') {
        helperDom.style.display = 'block';
        collapseButton.innerHTML = '-';
      } else {
        helperDom.style.display = 'none';
        collapseButton.innerHTML = '+';
      }
    });
    */
    }
}
