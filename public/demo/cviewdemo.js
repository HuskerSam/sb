class cViewDemo extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      setTimeout(() => {
        this.canvasHelper.cameraSelect.selectedIndex = 2;
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();
      }, 200);
    };
/*
    setInterval(() => {
    }, 1000);
        setInterval(() => {
          this.canvasHelper.cameraSelect.selectedIndex = 0;
          this.canvasHelper.cameraSelect.click();
        }, 1500);
        */
  }
  closeHeaderBands() {

  }
}
