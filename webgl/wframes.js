class wFrames {
  constructor(parentKey = null) {
    this.parentKey = parentKey;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.compiledFrames = [];
    this.rawFrames = {};
    this.orderedKeys = [];
    this._compileFrames();
    this.runLength = 0;
    this.frameAttributeFields = [ 'scaleX', 'scaleY', 'scaleZ', 'offsetX', 'offsetY', 'offsetZ',
          'rotateX', 'rotateY', 'rotateZ', 'visibility'];
    this.processedFrames = [];
    this.baseOffset = 0;
  }
  handleFrameChanges() {
    this._compileFrames();
  }
  applyFrameValues(block, time) {

  }
  _calcFrameTimes() {

/*

      let frame_offset = this.baseOffset;

      var base_frame_start = node.base_frame.time_obj.time_ms;
      node.base_frame._frame_start = base_frame_start;
      node.base_frame.dgrid_frame_row.start = base_frame_start.toString() + 'ms';

      var frame_count = node.frames.length;
      var previous_frame_start = base_frame_start;
      var max_frame_start = previous_frame_start;
      for (var frame_ctr = 0; frame_ctr < frame_count; frame_ctr++) {
          var frame = node.frames[frame_ctr];
          frame['time_obj'] = this.__str_to_frame_time(frame.time);

          if (frame.time_obj.offset_type == 'n') // use leading offset only
              previous_frame_start = 0;
          else if (frame.time_obj.offset_type == 'p') // offset from previous frame
              previous_frame_start = previous_frame_start;
          else if (frame.time_obj.offset_type == 'b') // offset from base frame
              previous_frame_start = base_frame_start;

          previous_frame_start += frame.time_obj.time_ms;
          frame._frame_start = previous_frame_start;
          frame.dgrid_frame_row.start = previous_frame_start.toString() + 'ms';
          max_frame_start = Math.max(max_frame_start, previous_frame_start);
      }
      node._max_frame_length = max_frame_start;
*/
  }
  setParentKey(parentKey) {
    this.parentKey = parentKey;
    this._compileFrames();
  }
  _compileFrames() {
    if (! this.parentKey)
      this.rawFrames = {};
    else
      this.rawFrames = this.fireSet.queryCache('parentKey', this.parentKey);

    this._sortFrames();

    this._calcFrameTimes();
  }
  _sortFrames() {
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
  getNextOrder() {
    let next = 1;
    for (let c = 0, l = this.orderedKeys.length; c < l; c++) {
      let frameCache = this.fireSet.getCache(this.orderedKeys[c]);
      if (! GLOBALUTIL.isNumeric(frameCache.frameOrder))
        continue;

      let order = Number(frameCache.frameOrder);
      if (order >= next)
        next = order + 1;
    }

    return next;
  }
}
