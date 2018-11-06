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
      console.log('path() err', e);
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
}
class GUTILImportCSV {
  static addCSVMeshRow(row) {
    let promises = [];

    let meshData = {
      title: row.name,
      materialName: row.materialname,
      url: row.meshpath,
      positionX: row.x,
      positionY: row.y,
      positionZ: row.z,
      rotationX: row.rx,
      rotationY: row.ry,
      rotationZ: row.rz,
      scalingX: row.sx,
      scalingY: row.sy,
      scalingZ: row.sz,
      type: 'url'
    };
    promises.push(gAPPP.a.modelSets['mesh'].createWithBlobString(meshData));

    let diffuseColor = '';
    let diffuseTextureName = '';
    if (row.diffuse === 'x') {
      diffuseColor = row.color;
      diffuseTextureName = row.texturepath;
    }
    let ambientColor = '';
    let ambientTextureName = '';
    if (row.ambient === 'x') {
      ambientColor = row.color;
      ambientTextureName = row.texturepath;
    }
    let emissiveColor = '';
    let emissiveTextureName = '';
    if (row.emissive === 'x') {
      emissiveColor = row.color;
      emissiveTextureName = row.texturepath;
    }

    let materialData = {
      title: row.materialname,
      ambientColor,
      ambientTextureName,
      backFaceCulling: true,
      diffuseColor,
      diffuseTextureName,
      emissiveColor,
      emissiveTextureName,
      bumpTextureName: row.bmppath
    };
    promises.push(gAPPP.a.modelSets['material'].createWithBlobString(materialData));

    return Promise.all(promises);
  }
  static addCSVBlockRow(row) {
    let blockData = {
      title: row.name,
      materialName: row.materialname,
      height: row.height,
      width: row.width,
      depth: row.depth
    };

    if (row.blockcode)
      blockData.blockCode = row.blockcode;

    if (row.itemid) {
      blockData.itemId = row.itemid;
      blockData.itemTitle = row.itemtitle;
      blockData.itemDesc = row.itemdesc;
      blockData.itemPrice = row.itemprice;
      blockData.itemCount = row.itemcount;
      blockData.basketBlock = row.basketblock;
    }

    if (row.introtime) {
      blockData.introtime = row.introtime;
      blockData.finishdelay = row.finishdelay;
      blockData.runlength = row.runlength;
    }
    if (row.blockflag) blockData.blockFlag = row.blockflag;

    return gAPPP.a.modelSets['block'].createWithBlobString(blockData).then(blockResult => {
      let frameTime = '0';
      if (row.frametime)
        frameTime = row.frametime;

      if (row.itemid) {
        this.__CSVSignPostRows(row).then(() => {});
      }

      return gAPPP.a.modelSets['frame'].createWithBlobString({
        parentKey: blockResult.key,
        positionX: row.x,
        positionY: row.y,
        positionZ: row.z,
        rotationX: row.rx,
        rotationY: row.ry,
        rotationZ: row.rz,
        scalingX: row.sx,
        scalingY: row.sy,
        scalingZ: row.sz,
        frameOrder: 10,
        frameTime
      });
    });
  }
  static addCSVBlockChildRow(row) {
    let ele = gAPPP.a.modelSets['block'].getValuesByFieldLookup('title', row.parent);
    let key = gAPPP.a.modelSets['block'].lastKeyLookup;

    if (!ele) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }
    let inheritMaterial = false;
    if (row.materialname === 'inherit')
      inheritMaterial = true;

    let blockChildData = {
      materialName: row.materialname,
      parentKey: key,
      childType: row.childtype,
      childName: row.name,
      inheritMaterial
    };

    if (row.productindex) {
      blockChildData.productIndex = row.productindex;
      blockChildData.origRow = row;
    }
    if (row.cameraname)
      blockChildData.cameraName = row.cameraname;
    if (row.cameratargetblock)
      blockChildData.cameraTargetBlock = row.cameratargetblock;
    if (row.blockflag) blockChildData.blockFlag = row.blockflag;

    return gAPPP.a.modelSets['blockchild'].createWithBlobString(blockChildData).then(childResults => {

      let frameData = {
        parentKey: childResults.key,
        positionX: row.x,
        positionY: row.y,
        positionZ: row.z,
        rotationX: row.rx,
        rotationY: row.ry,
        rotationZ: row.rz,
        scalingX: row.sx,
        scalingY: row.sy,
        scalingZ: row.sz,
        visibility: row.visibility,
        frameOrder: '10',
        frameTime: '0'
      };

      if (row.cameraradius)
        frameData.cameraRadius = row.cameraradius;
      if (row.cameraheightoffset)
        frameData.cameraHeightOffset = row.cameraheightoffset;
      if (row.cameraacceleration)
        frameData.cameraAcceleration = row.cameraacceleration;
      if (row.maxcameraspeed)
        frameData.maxCameraSpeed = row.maxcameraspeed;
      if (row.camerafov)
        frameData.cameraFOV = row.camerafov;
      if (row.camerarotationoffset)
        frameData.cameraRotationOffset = row.camerarotationoffset;
      if (row.startx)
        frameData.cameraOriginX = row.startx;
      if (row.starty)
        frameData.cameraOriginY = row.starty;
      if (row.startz)
        frameData.cameraOriginZ = row.startz;

      return gAPPP.a.modelSets['frame'].createWithBlobString(frameData);
    });
  }
  static addCSVShapeRow(row) {
    let texturename = row.texturepath;
    let bumptexturename = row.bmppath;

    if (row.scalev) {
      if (row.texturepath) {
        texturename = row.materialname;
        gAPPP.a.modelSets['texture'].createWithBlobString({
          title: texturename,
          url: row.texturepath,
          uScale: row.scaleu,
          vScale: row.scalev
        }).then(results => {});
      }

      if (row.bmppath) {
        bumptexturename = row.materialname + 'bmp';
        gAPPP.a.modelSets['texture'].createWithBlobString({
          title: bumptexturename,
          url: row.bmppath,
          uScale: row.scaleu,
          vScale: row.scalev
        }).then(results => {});
      }
    }

    if (row.materialname)
      gAPPP.a.modelSets['material'].createWithBlobString({
        title: row.materialname,
        ambientColor: row.color,
        ambientTextureName: texturename,
        backFaceCulling: true,
        diffuseColor: row.color,
        diffuseTextureName: texturename,
        emissiveColor: row.color,
        emissiveTextureName: texturename,
        bumpTextureName: bumptexturename
      }).then(results => {});

    return gAPPP.a.modelSets['shape'].createWithBlobString({
      title: row.name,
      materialName: row.materialname,
      boxHeight: row.height,
      boxWidth: row.width,
      boxDepth: row.depth,
      shapeType: row.shapetype
    });
  }
  static addCSVBlockChildFrameRow(row) {
    let ele = gAPPP.a.modelSets['block'].getValuesByFieldLookup('title', row.parent);
    let key = gAPPP.a.modelSets['block'].lastKeyLookup;

    if (!ele) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }

    let promises = [];
    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', key);
    for (let c in children) {
      let d = children[c];
      if (d.childType === row.childtype && d.childName === row.name) {

        let frameData = {
          parentKey: c,
          positionX: row.x,
          positionY: row.y,
          positionZ: row.z,
          rotationX: row.rx,
          rotationY: row.ry,
          rotationZ: row.rz,
          scalingX: row.sx,
          scalingY: row.sy,
          scalingZ: row.sz,
          visibility: row.visibility,
          frameOrder: row.frameorder,
          frameTime: row.frametime
        };
        promises.push(gAPPP.a.modelSets['frame'].createWithBlobString(frameData));
      }
    }

    return Promise.all(promises);
  }
  static addCSVRowList(rowList) {
    let promises = [];
    for (let c = 0, l = rowList.length; c < l; c++)
      promises.push(this.addCSVRow(rowList[c]));

    return Promise.all(promises);
  }
  static addCSVRow(row) {
    console.log(row);
    switch (row.asset) {
      case 'productfollowcamera':
        return this.addCSVCamera(row);
      case 'meshtexture':
        return this.addCSVMeshRow(row);
      case 'block':
        return this.addCSVBlockRow(row);
      case 'blockchild':
        return this.addCSVBlockChildRow(row);
      case 'textplane':
        return this.addCSVTextPlane(row);
      case 'shape':
        return this.addCSVShapeRow(row);
      case 'blockchildframe':
        return this.addCSVBlockChildFrameRow(row);
      case 'productbasket':
        return this.addCSVBasketProducts(row);
    }
  }
  static addCSVTextPlane(row) {
    let promises = [];

    let shapeData = {
      title: row.name,
      materialName: row.name,
      boxHeight: row.height,
      boxWidth: row.width,
      boxDepth: row.depth,
      shapeType: 'plane'
    };
    promises.push(gAPPP.a.modelSets['shape'].createWithBlobString(shapeData));

    let textureData = {
      textDepth: row.textdepth,
      textFontFamily: row.textfontfamily,
      hasAlpha: true,
      isText: true,
      textFontColor: row.textfontcolor,
      textureText: row.texturetext,
      textureText2: row.texturetext2,
      url: '',
      title: row.name
    };
    promises.push(gAPPP.a.modelSets['texture'].createWithBlobString(textureData));

    let materialData = {
      title: row.name,
      ambientColor: '',
      ambientTextureName: '',
      backFaceCulling: true,
      diffuseColor: '',
      diffuseTextureName: row.name,
      emissiveColor: '',
      emissiveTextureName: ''
    };
    promises.push(gAPPP.a.modelSets['material'].createWithBlobString(materialData));

    return Promise.all(promises);
  }
  static __CSVSignPostRows(row) {
    let newObjects = [];
    let blockRow = this.defaultCSVRow();
    blockRow.asset = 'block';
    blockRow.height = '1';
    blockRow.width = '2';
    blockRow.depth = '2';
    blockRow.materialname = 'decolor: 0,.7,0';
    blockRow.name = row.name + '_signpost';
    newObjects.push(blockRow);

    let textPlane = this.defaultCSVRow();
    textPlane.asset = 'textplane';
    textPlane.hasalpha = true;
    textPlane.istext = true;
    textPlane.textfontcolor = '0,0,0';
    textPlane.texturetext = row.itemtitle;
    textPlane.texturetext2 = row.itemdesc;
    textPlane.width = '10';
    textPlane.height = '10';
    textPlane.depth = '10';
    textPlane.textdepth = '.5';
    textPlane.textfontfamily = 'Geneva';
    textPlane.name = row.name + '_pricedesc';
    newObjects.push(textPlane);

    let signChildren = [];
    let blockDescShapeBC = this.defaultCSVRow();
    blockDescShapeBC.asset = 'blockchild';
    blockDescShapeBC.childtype = 'shape';
    blockDescShapeBC.parent = blockRow.name;
    blockDescShapeBC.name = textPlane.name;
    blockDescShapeBC.x = '.06';
    blockDescShapeBC.y = '1.5';
    blockDescShapeBC.z = '.5';
    blockDescShapeBC.sx = '.5';
    blockDescShapeBC.sy = '.5';
    blockDescShapeBC.sz = '.5';
    blockDescShapeBC.ry = '-90deg';
    signChildren.push(blockDescShapeBC);

    let blockImageShape = this.defaultCSVRow();
    blockImageShape.asset = 'shape';
    blockImageShape.materialname = row.name + '_signpostimage'
    blockImageShape.name = row.name + '_signpostimage'
    blockImageShape.scaleu = '1';
    blockImageShape.scalev = '1';
    blockImageShape.shapetype = 'plane';
    blockImageShape.texturepath = row.texturepath;
    blockImageShape.width = '3';
    blockImageShape.height = '3';
    newObjects.push(blockImageShape);

    let blockImageBC = this.defaultCSVRow();
    blockImageBC.asset = 'blockchild';
    blockImageBC.childtype = 'shape';
    blockImageBC.parent = blockRow.name;
    blockImageBC.name = blockImageShape.name;
    blockImageBC.x = '.06';
    blockImageBC.y = '6';
    blockImageBC.ry = '-90deg';
    signChildren.push(blockImageBC);

    let blockSPBC = this.defaultCSVRow();
    blockSPBC.asset = 'blockchild';
    blockSPBC.childtype = 'shape';
    blockSPBC.parent = blockRow.name;
    blockSPBC.name = 'signboard';
    blockSPBC.materialname = 'inherit';
    blockSPBC.y = '5';
    signChildren.push(blockSPBC);

    let blockSP2BC = this.defaultCSVRow();
    blockSP2BC.asset = 'blockchild';
    blockSP2BC.childtype = 'shape';
    blockSP2BC.parent = blockRow.name;
    blockSP2BC.name = 'signpost';
    blockSP2BC.materialname = 'inherit';
    blockSP2BC.x = '-0.05';
    blockSP2BC.y = '2';
    signChildren.push(blockSP2BC);

    let blockRowBC = this.defaultCSVRow();
    blockRowBC.asset = 'blockchild';
    blockRowBC.childtype = 'block';
    blockRowBC.parent = row.name;
    blockRowBC.name = blockRow.name;
    blockRowBC.x = '.1';
    blockRowBC.rz = '10deg';
    blockRowBC.ry = '180deg';

    return this.addCSVRowList(newObjects)
      .then(() => this.addCSVRowList(signChildren))
      .then(() => this.addCSVRow(blockRowBC));
  }
  static addCSVCamera(row) {
    let childCSVRows = [];
    let cameraBlock = this.defaultCSVRow();
    cameraBlock.asset = 'block';
    cameraBlock.name = row.name + '_followblock';
    cameraBlock.width = '1';
    cameraBlock.depth = '1';
    cameraBlock.height = '1';
    cameraBlock.introtime = row.introtime;
    cameraBlock.finishdelay = row.finishdelay;
    cameraBlock.runlength = row.runlength;
    childCSVRows.push(cameraBlock);

    let cameraBlockBC = this.defaultCSVRow();
    cameraBlockBC.asset = 'blockchild';
    cameraBlockBC.name = cameraBlock.name;
    cameraBlockBC.childtype = 'block';
    cameraBlockBC.parent = row.parent;
    cameraBlockBC.rx = row.startrx;
    cameraBlockBC.ry = row.startry;
    cameraBlockBC.rz = row.startrz;
    cameraBlockBC.x = row.startx;
    cameraBlockBC.y = row.starty;
    cameraBlockBC.z = row.startz;
    childCSVRows.push(cameraBlockBC);

    let cam = this.defaultCSVRow();
    cam.asset = 'blockchild';
    cam.cameraacceleration = row.cameraacceleration;
    cam.camerafov = row.camerafov;
    cam.cameraname = "demo";
    cam.cameraradius = row.cameraradius;
    cam.cameraheightoffset = row.cameraheightoffset;
    cam.camerarotationoffset = row.camerarotationoffset;
    cam.maxcameraspeed = row.maxcameraspeed;
    cam.cameratargetblock = "block:" + cameraBlock.name;
    cam.childtype = 'camera';
    cam.name = row.name;
    cam.parent = row.parent;
    cam.rx = row.rx;
    cam.ry = row.ry;
    cam.rz = row.rz;
    cam.x = row.x;
    cam.y = row.y;
    cam.z = row.z;
    cam.startx = row.startx;
    cam.starty = row.starty;
    cam.startz = row.startz;
    childCSVRows.push(cam);

    let introTime = GLOBALUTIL.getNumberOrDefault(row.introtime, 0.0);
    let finishTime = GLOBALUTIL.getNumberOrDefault(row.finishdelay, 0.0);
    let runTime = GLOBALUTIL.getNumberOrDefault(row.runlength, 60.0);

    let frameRows = [];
    let products = this.getProductList();
    let frameOrder = 20;
    let frameTime = introTime;
    let timeInc = (runTime - finishTime - introTime) / products.length;

    for (let c = 0, l = products.length; c < l; c++) {
      let p = products[c].origRow;
      let cameraBlockFrame = this.defaultCSVRow();
      cameraBlockFrame.asset = 'blockchildframe';
      cameraBlockFrame.name = cameraBlock.name;
      cameraBlockFrame.childtype = 'block';
      cameraBlockFrame.parent = row.parent;
      cameraBlockFrame.frameorder = frameOrder.toString();
      cameraBlockFrame.frametime = frameTime.toFixed(2) + 'scp500';
      cameraBlockFrame.x = p.x;
      cameraBlockFrame.y = p.y;
      cameraBlockFrame.z = p.z;
      cameraBlockFrame.rx = p.rx;
      cameraBlockFrame.ry = p.ry;
      cameraBlockFrame.rz = p.rz;
      cameraBlockFrame.sx = p.sx;
      cameraBlockFrame.sy = p.sy;
      cameraBlockFrame.sz = p.sz;

      frameOrder += 10;
      frameTime += timeInc;

      frameRows.push(cameraBlockFrame);
    }

    return this.addCSVRowList(childCSVRows)
      .then(() => this.addCSVRowList(frameRows));
  }
  static defaultCSVRow() {
    return {
      ambient: "",
      asset: "",
      bmppath: "",
      childtype: "",
      color: "",
      depth: "",
      diffuse: "",
      emissive: "",
      frametime: "",
      height: "",
      itemcount: "",
      itemdesc: "",
      itemid: "",
      productindex: "",
      itemprice: "",
      itemtitle: "",
      materialname: "",
      meshpath: "",
      name: "",
      parent: "",
      rx: "",
      ry: "",
      rz: "",
      scaleu: "",
      scalev: "",
      shapetype: "",
      sx: "",
      sy: "",
      sz: "",
      texturepath: "",
      visibility: "",
      width: "",
      x: "",
      y: "",
      z: ""
    };
  }
  static getProductList(row) {
    let children = gAPPP.a.modelSets['blockchild'].fireDataValuesByKey;
    let productBC = [];
    for (let i in children)
      if (children[i].productIndex)
        productBC.push(children[i]);

    productBC.sort((a, b) => {
      if (a.productIndex > b.productIndex)
        return 1;
      if (a.productIndex < b.productIndex)
        return -1;
      return 0;
    });

    return productBC;
  }
  static basketPosition(index) {
    let z = index % 2 * 3 - 1.5;
    let x = Math.floor(index % 4 / 2) * 3 - 1.5;
    let y = Math.floor(index / 4) * 2 + 1;

    return { x, y, z };
  }
  static addCSVBasketProducts(row) {
    let productInfo = this.initProducts();
    let basketInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'basket');
    let basketName = basketInfo.title;
    let promises = [];
    let products = productInfo.products;

    for (let c = 0, l = products.length; c < l; c++) {
      let pos = this.basketPosition(c);
      let row = {
        asset: 'blockchild',
        materialname: '',
        parent: basketName,
        childtype: 'block',
        name: products[c].blockRef.blockData.basketBlock,
        inheritmaterial: false,
        x: pos.x.toString(),
        y: pos.y.toString(),
        z: pos.z.toString(),
        rx: '',
        ry: '',
        rz: '',
        sx: '.45',
        sy: '.45',
        sz: '.45',
        visibility: ''
      };

      promises.push(GUTILImportCSV.addCSVRow(row));
    }

    return Promise.all(promises);
  }
  static initProducts() {
    let children = gAPPP.a.modelSets['blockchild'].fireDataValuesByKey;

    let productsBC = [];
    for (let i in children) {
      if (children[i].productIndex)
        productsBC.push(children[i]);
    }

    let sceneId = gAPPP.a.modelSets['block'].getIdByFieldLookup('blockFlag', 'scene');
    let products = [];
    let productsBySKU = {};
    for (let c = 0, l = productsBC.length; c < l; c++) {
      let pBC = productsBC[c];
      let obj = this.findMatchBlock(pBC.childType, pBC.childName, sceneId);
      let blockData = obj.blockData;

      let p = {
        blockRef: obj,
        itemId: blockData.itemId,
        title: blockData.itemTitle,
        itemCount: blockData.itemCount,
        desc: blockData.itemDesc,
        price: blockData.itemPrice,
        productIndex: blockData.productIndex,
        childName: pBC.childName,
        childType: pBC.childType
      };
      products.push(p);
      productsBySKU[p.itemId] = p;
    }

    products.sort((a, b) => {
      if (a.productIndex > b.productIndex)
        return 1;
      if (a.productIndex < b.productIndex)
        return -1;
      return 0;
    });

    return {
      products,
      productsBySKU,
      productsBC,
      sceneId
    }
  }
  static findMatchBlock(childType, childName, parentId) {
    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', parentId);

    for (let i in children) {
      if (children[i].childType === childType && children[i].childName === childName) {
        //console.log('ccc', children[i]);
          let blockData = gAPPP.a.modelSets[childType].getValuesByFieldLookup('title', childName);
          return {
            blockData,
            BC: children[i]
          }
      }

      let childResult = this.findMatchBlock(childType, childName, i);
      if (childResult)
        return childResult;
    }
    return null;
  }
}
