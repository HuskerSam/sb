class cPanelLog {
  constructor(btn, container) {
    this.expanded = false;

    this.collapseButton = btn;
    this.collapseButton.addEventListener('click', e => this.toggle(), false);

    this.panel = document.createElement('div');
    this.panel.style.display = 'none';
    this.panel.style.float = 'left';
    this.panel.setAttribute('class', 'context-scene-tools-panel render-log-panel');
    this.panel.innerHTML = '';
    this.panelContainer = container;
    this.panelContainer.appendChild(this.panel);

  }
  statusText() {
    if (this.status === 0)
      return 'Pending';
    if (this.status === -1)
      return 'Warning';
    if (this.status === -2)
      return 'Error';
    if (this.status === 1)
      return 'Success';
  }
  statusColor(){

  }
  toggle() {
    if (this.expanded) {
      this.expanded = false;
      this.panel.style.display = 'none';
      this.collapseButton.style.background = 'rgba(255,255,255,.2)';
      this.collapseButton.style.color = 'black';
    } else {
      this.expanded = true;
      this.panel.style.display = 'inline-block';
      this.collapseButton.style.background = 'rgba(0,0,0,.5)';
      this.collapseButton.style.color = 'white';
    }
  }
}
