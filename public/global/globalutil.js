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
  static colorToHex(bColor) {
    let rH = Math.round(bColor.r * 255).toString(16);
    if (rH.length === 1)
      rH = '0' + rH;
    let gH = Math.round(bColor.g * 255).toString(16);
    if (gH.length === 1)
      gH = '0' + gH;
    let bH = Math.round(bColor.b * 255).toString(16);
    if (bH.length === 1)
      bH = '0' + bH;

    return '#' + rH + gH + bH;
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
        let parts = str.toString().trim().split(',');
        x = GLOBALUTIL.getNumberOrDefault(parts[0], x);
        y = GLOBALUTIL.getNumberOrDefault(parts[1], y);
        z = GLOBALUTIL.getNumberOrDefault(parts[2], z);
      }
    return new BABYLON.Vector3(x, y, z);
  }
  static vectorToStr(v) {
    return v.x.toFixed(3) + ',' + v.y.toFixed(3) + ',' + v.z.toFixed(3);
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
      //  console.log('path() err', e);
    }
  }
  static replaceAll(str, search, replacement) {
    let t = str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(t, 'g'), replacement);
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
  static shortDateTime(d) {
    d = new Date(d);
    let od = d.toISOString().substring(5, 10);
    od += ' ' + d.toISOString().substring(11, 16);
    return od;
  }
  static getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  static setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  static __distanceGPSMeters(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180)
    }

    let earthradius_m = 6371000;
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthradius_m * c;
  }
  static getGPSDiff(lat1, lon1, lat2, lon2) {
    let distance = this.__distanceGPSMeters(lat1, lon1, lat2, lon2);
    let horizontal = this.__distanceGPSMeters(lat1, lon1, lat2, lon1);
    let vertical = this.__distanceGPSMeters(lat1, lon1, lat1, lon2);

    return {
      horizontal,
      vertical,
      distance
    };
  }
  static gpsOffsetCoords(lat, lon, ewDiff, nsDiff) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180)
    }
    let earthradius_m = 6371000;
    let dLat = nsDiff / earthradius_m;
    let dLon = ewDiff / (earthradius_m * Math.cos(deg2rad(lat)));
    dLat *= 180 / Math.PI;
    dLon *= 180 / Math.PI;

    lat += dLat;
    lon += dLon;

    return {
      lat, lon
    }
  }
}
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength, padString) {
    targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return String(this) + padString.slice(0, targetLength);
    }
  };
}
