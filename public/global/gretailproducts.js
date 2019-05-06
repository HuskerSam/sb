class gRetailProducts {
  constructor() {
    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
  }

  __checkForPosition(x, y, z) {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option>positions</option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3) {
        if (arr[c] == x && arr[c + 1] == y && arr[c + 2] == z)
          return c / 3 + 1;
      }
    }

    return -1;
  }
  updatePositionList() {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2];
        positionHTML += `<option value="${frag}">${(c / 3) + 1} ${frag}</option>`;
      }

      sel.innerHTML = positionHTML;
      sel.addEventListener('input', e => {
        let vals = sel.value.split(',');

        if (vals.length === 3) {
          let xd = this.record_field_list.querySelector('.xedit');
          let yd = this.record_field_list.querySelector('.yedit');
          let zd = this.record_field_list.querySelector('.zedit');

          xd.parentElement.MaterialTextfield.change(vals[0]);
          yd.parentElement.MaterialTextfield.change(vals[1]);
          zd.parentElement.MaterialTextfield.change(vals[2]);
        }

        sel.selectedIndex = 0;
      });
    }
  }
}
