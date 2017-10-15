class cRenderLog {
  constructor(btn, container) {
    this.status = 0;
    this.button = btn;
    this.container = container;
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
}
