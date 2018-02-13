class GLOBALUTIL {
  static color(str) {
    if (!str) {
      str = '1,1,1';
    }
    let parts = str.split(',');
    let cA = [];
    let r = Number(parts[0]);
    if (isNaN(r))
      r = 0;
    let g = Number(parts[1]);
    if (isNaN(g))
      g = 0;
    let b = Number(parts[2]);
    if (isNaN(b))
      b = 0;

    return new BABYLON.Color3(r, g, b);
  }
  static colorRGB255(str) {
    let bC = this.color(str);
    if (isNaN(bC.r))
      bC.r = 1;
    if (isNaN(bC.g))
      bC.g = 1;
    if (isNaN(bC.b))
      bC.b = 1;

    return 'rgb(' + (bC.r * 255.0).toFixed(0) + ',' + (bC.g * 255.0).toFixed(0) + ',' + (bC.b * 255.0).toFixed(0) + ')'
  }
  static dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {
      type: mimeString
    });
    return blob;
  }
  static getNumberOrDefault(str, d) {
    if (this.isNumeric(str))
      return Number(str);
    return d;
  }
  static getVector(str, x, y, z) {
    if (str !== undefined)
      if (str !== '') {
        let parts = str.trim().split(',');
        x = GLOBALUTIL.getNumberOrDefault(parts[0], x);
        y = GLOBALUTIL.getNumberOrDefault(parts[1], y);
        z = GLOBALUTIL.getNumberOrDefault(parts[2], z);
      }
    return new BABYLON.Vector3(x, y, z);
  }
  static isNumeric(v) {
    if (v === undefined)
      return false;
    if (v === '')
      return false;
    return !isNaN(parseFloat(Number(v))) && isFinite(Number(v));
  }
  static path(obj, is, value) {
    try {
      if (typeof is == 'string')
        return this.path(obj, is.split('.'), value);
      else if (is.length == 1 && value !== undefined)
        return obj[is[0]] = value;
      else if (is.length == 0)
        return obj;
      else
        return this.path(obj[is[0]], is.slice(1), value);
    } catch (e) {
      console.log('path() err', e);
    }
  }
  static replaceAll(str, search, replacement) {
    let t = str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(t, 'g'), replacement);
  }
  static setColorLabel(dom, defaultValue) {
    let v = dom.value;
    if (v === '')
      if (defaultValue)
        v = defaultValue;

    let rgb = '';
    if (v !== '')
      rgb = this.colorRGB255(v);
    dom.parentNode.querySelector('span').style.background = rgb;
  }
  static formatNumber(num) {
    let leftSide = 3;
    let rightSide = 3;
    if (!this.isNumeric(num))
      num = 0;
    num = Number(num);
    let str = num.toFixed(rightSide);
    let parts = str.split('.');
    let left = parts[0];
    let right = parts[1];
    let leftFinal = left.padStart(leftSide, ' ');
    let rightFinal = right.padEnd(rightSide, ' ');
    return leftFinal + '.' + rightFinal;
  }
  static HexToRGB(hex) {
    var r = this.HexToR(hex) / 255;
    var g = this.HexToG(hex) / 255;
    var b = this.HexToB(hex) / 255;
    return new BABYLON.Color3(r, g, b);
  }
  static HexToR(h) {
    return parseInt((this.CutHex(h)).substring(0, 2), 16)
  }
  static HexToG(h) {
    return parseInt((this.CutHex(h)).substring(2, 4), 16)
  }
  static HexToB(h) {
    return parseInt((this.CutHex(h)).substring(4, 6), 16)
  }
  static CutHex(h) {
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h
  }
  static msToTime(duration) {
    let milliseconds = (duration % 1000),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
    milliseconds = (milliseconds < 100) ? "0" + milliseconds : milliseconds;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }
}
