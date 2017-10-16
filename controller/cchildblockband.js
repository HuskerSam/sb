class cChildBlockBand {
  constructor(container) {
    this.parentContainer = container;
    this._addChildBlockList();
  }
  _addChildBlockList() {
    let childBar = document.createElement('div');
    let c = this.parentContainer;
    childBar.setAttribute('class', 'block-editor-children-bar-wrapper');
    let html = '<button class="block-editor-child options-button">' +
    '<i class="material-icons">add</i>4x2x2</button>';
    html += '<div class="childwrapper">';
    html += '<div class="block-editor-child selected">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '</div>';
    childBar.innerHTML = html;
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

    let controlBar = document.createElement('div');
    controlBar.innerHTML = 'frames area';
    c.insertBefore(controlBar, null);
    c.insertBefore(childBar, c.childNodes[0]);
    }
}
