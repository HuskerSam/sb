class wFrames {
  constructor(parentKey = null) {
    this.parentKey = parentKey;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.compiledFrames = [];
    this.rawFrames = {};
    this.orderedKeys = [];
    this._compileFrames();
  }
  handleFrameChanges() {
    this._compileFrames();
  }
  applyFrameValues(block, time) { }
  setParentKey(parentKey) {
    this.parentKey = parentKey;
    this._compileFrames();
  }
  _compileFrames() {
    if (! this.parentKey)
      this.rawFrames = {};
    else
      this.rawFrames = this.fireSet.queryCache('parentKey', this.parentKey);

    this.__sortFrames();
  }
  __sortFrames() {
    this.orderedKeys = [];

    for (let i in this.rawFrames)
      this.orderedKeys.push(i);

    this.orderedKeys.sort((a, b) => {
      let a_order = 0;
      let b_order = 0;
      if (GLOBALUTIL.isNumeric(this.fireSet.getCache(a).frameOrder))
        a_order = Number(this.fireSet.getCache(a).frameOrder);
      if (GLOBALUTIL.isNumeric(this.fireSet.getCache(b).frameOrder))
        b_order = Number(this.fireSet.getCache(b).frameOrder);

      if (a_order !== b_order) return a_order - b_order;
      if (a > b) return 1;
      if (a < b) return -1;

      return 0;
    });
  }
}
