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
  static getProductColors() {
    let colors = [
      'decolor: 1,0,0',
      'decolor: 0,1,0',
      'decolor: 0,0,1',
      'decolor: 1,1,0'
    ];
    let buttonColors = [
      'rgb(255,0,0)',
      'rgb(0,255,0)',
      'rgb(0,0,255)',
      'rgb(255,255,0)'
    ];
    let buttonForeColors = [
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(255,255,255)',
      'rgb(0,0,0)'
    ];
    return {
      colors,
      buttonColors,
      buttonForeColors
    }
  }
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
      blockData.itemImage = row.texturepath;
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

    if (row.displayindex) {
      blockChildData.displayIndex = row.displayindex;
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
      case 'productsigns':
        return this.addCSVProductSigns(row);
      case 'cameratextposition':
        return this.addCSVCameraTextPosition(row);
    }

    console.log('type not found', row);
    return Promise.resolve();
  }
  static addCSVCameraTextPosition(row) {
    let ele = gAPPP.a.modelSets['block'].getValuesByFieldLookup('title', row.parent);
    let key = gAPPP.a.modelSets['block'].lastKeyLookup;

    if (!ele) {
      console.log(row.parent, ' - block not found');
      return Promise.resolve();
    }

    let cameraBlock = this.defaultCSVRow();
    cameraBlock.asset = 'textplane';
    cameraBlock.name = row.name;
    cameraBlock.width = row.width;
    cameraBlock.depth = row.depth;
    cameraBlock.height = row.height;
    cameraBlock.textfontfamily = row.textfontfamily;
    cameraBlock.textfontcolor = row.textfontcolor;
    cameraBlock.texturetext = row.texturetext;
    cameraBlock.texturetext2 = row.texturetext2;
    cameraBlock.textfontsize = row.textfontsize;
    cameraBlock.texturetextrendersize = row.texturetextrendersize;
    cameraBlock.textfontweight = row.textfontweight;

    let cameraBlockBC = this.defaultCSVRow();
    cameraBlockBC.asset = 'blockchild';
    cameraBlockBC.name = row.name;
    cameraBlockBC.childtype = 'shape';
    cameraBlockBC.parent = row.parent;
    cameraBlockBC.rx = row.rx;
    cameraBlockBC.ry = row.ry;
    cameraBlockBC.rz = row.rz;
    cameraBlockBC.x = row.x;
    cameraBlockBC.y = row.y;
    cameraBlockBC.z = row.z;
    cameraBlockBC.displayindex = row.displayindex;

    return Promise.all([
      this.addCSVRow(cameraBlock),
      this.addCSVRow(cameraBlockBC)
    ]);
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

    if (!row.texturetext)
      row.texturetext = '';
    if (!row.texturetext2)
      row.texturetext2 = '';

    let textureData = {
      textFontFamily: row.textfontfamily,
      hasAlpha: true,
      isText: true,
      textFontColor: row.textfontcolor,
      textureText: row.texturetext,
      textureText2: row.texturetext2,
      url: '',
      title: row.name
    };
    textureData.textFontSize = GLOBALUTIL.getNumberOrDefault(row.textfontsize, 100).toString();
    textureData.textureTextRenderSize = GLOBALUTIL.getNumberOrDefault(row.texturetextrendersize, 512).toString();
    textureData.textFontWeight = row.textfontweight ? row.textfontweight : '';
    textureData.isFittedText = true;

    promises.push(gAPPP.a.modelSets['texture'].createWithBlobString(textureData));

    let materialData = {
      title: row.name,
      ambientColor: '',
      ambientTextureName: row.name,
      backFaceCulling: true,
      diffuseColor: '',
      diffuseTextureName: row.name,
      emissiveColor: '',
      emissiveTextureName: row.name
    };
    promises.push(gAPPP.a.modelSets['material'].createWithBlobString(materialData));

    return Promise.all(promises);
  }
  static __addSignPost(product, productData) {
    let newObjects = [];
    let blockRow = this.defaultCSVRow();
    blockRow.asset = 'block';
    blockRow.height = '1';
    blockRow.width = '2';
    blockRow.depth = '2';
    blockRow.materialname = this.getProductColors().colors[product.colorIndex];
    blockRow.name = product.childName + '_signpost';
    newObjects.push(blockRow);

    let textPlane = this.defaultCSVRow();
    textPlane.asset = 'textplane';
    textPlane.hasalpha = true;
    textPlane.istext = true;
    textPlane.textfontcolor = '0,0,0';
    textPlane.texturetext = product.title;
    textPlane.texturetext2 = product.desc;
    textPlane.width = '10';
    textPlane.height = '10';
    textPlane.depth = '10';
    textPlane.textfontfamily = 'Geneva';
    textPlane.name = product.childName + '_pricedesc';
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
    blockImageShape.materialname = product.childName + '_signpostimage';
    blockImageShape.name = product.childName + '_signpostimage';
    blockImageShape.scaleu = '1';
    blockImageShape.scalev = '1';
    blockImageShape.shapetype = 'plane';
    blockImageShape.texturepath = product.itemImage;
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
    blockSP2BC.y = '1.5';
    signChildren.push(blockSP2BC);

    let blockRowBC = this.defaultCSVRow();
    blockRowBC.asset = 'blockchild';
    blockRowBC.childtype = 'block';
    blockRowBC.parent = product.childName;
    blockRowBC.name = blockRow.name;
    blockRowBC.x = '.1';
    blockRowBC.rz = '10deg';
    blockRowBC.ry = '180deg';
    blockRowBC.y = '-50';

    return this.addCSVRowList(newObjects)
      .then(() => this.addCSVRowList(signChildren))
      .then(() => this.addCSVRow(blockRowBC))
      .then(result => {
          let showFrame = this.defaultCSVRow();
          showFrame.asset = 'blockchildframe';
          showFrame.name = blockRow.name;
          showFrame.childtype = 'block';
          showFrame.parent = product.childName;
          showFrame.frameorder = '20';
          showFrame.frametime = (product.startShowTime * 1000).toFixed(0) + 'cp700';
          showFrame.y = '2';

          let hideFrame = this.defaultCSVRow();
          hideFrame.asset = 'blockchildframe';
          hideFrame.name = blockRow.name;
          hideFrame.childtype = 'block';
          hideFrame.parent = product.childName;
          hideFrame.frameorder = '30';
          hideFrame.frametime = (product.endShowTime * 1000).toFixed(0) + 'cp700';
          hideFrame.y = '-50';

          let endFrame = this.defaultCSVRow();
          endFrame.asset = 'blockchildframe';
          endFrame.name = blockRow.name;
          endFrame.childtype = 'block';
          endFrame.parent = product.childName;
          endFrame.frameorder = '40';
          endFrame.frametime = (productData.runLength * 1000).toFixed(0);
          endFrame.y = '-50';

          return Promise.all([
            this.addCSVRow(showFrame),
            this.addCSVRow(hideFrame),
            this.addCSVRow(endFrame)
          ]);
      })
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

    let productData = this.initCSVProducts(row);
    let frameRows = [];

    let frameOrder = 20;
    let frameTime = productData.introTime;

    for (let c = 0, l = productData.products.length; c <= l; c++) {

      let cameraBlockFrame = this.defaultCSVRow();

      cameraBlockFrame.asset = 'blockchildframe';
      cameraBlockFrame.name = cameraBlock.name;
      cameraBlockFrame.childtype = 'block';
      cameraBlockFrame.parent = row.parent;
      cameraBlockFrame.frameorder = frameOrder.toString();

      if (c !== l) {
        let p = productData.productsBC[c].origRow;
        cameraBlockFrame.x = p.x;
        cameraBlockFrame.y = (GLOBALUTIL.getNumberOrDefault(p.y, 0) + 2).toString();
        cameraBlockFrame.z = p.z;
        cameraBlockFrame.rx = p.rx;
        cameraBlockFrame.ry = p.ry;
        cameraBlockFrame.rz = p.rz;
        cameraBlockFrame.sx = p.sx;
        cameraBlockFrame.sy = p.sy;
        cameraBlockFrame.sz = p.sz;
        cameraBlockFrame.frametime = (frameTime * 1000).toFixed(0) + 'cp400';
      } else {
        cameraBlockFrame.x = row.x;
        cameraBlockFrame.y = row.y;
        cameraBlockFrame.z = row.z;
        cameraBlockFrame.rx = row.rx;
        cameraBlockFrame.ry = row.ry;
        cameraBlockFrame.rz = row.rz;
        cameraBlockFrame.sx = row.sx;
        cameraBlockFrame.sy = row.sy;
        cameraBlockFrame.sz = row.sz;
        cameraBlockFrame.frametime = (productData.runLength * 1000).toFixed(0);
      }

      frameOrder += 10;
      frameTime += productData.incLength;

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
      displayIndex: "",
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
  static basketPosition(index) {
    let z = index % 2 * 3 - 1.5;
    let x = Math.floor(index % 4 / 2) * 3 - 1.5;
    let y = Math.floor(index / 4) * 2 + 1;

    return { x, y, z };
  }
  static addCSVBasketProducts(row) {
    let productInfo = this.initCSVProducts();
    let basketInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'basket');
    let basketName = basketInfo.title;
    let promises = [];
    let products = productInfo.products;

    let positionIndex = 0;
    for (let c = 0, l = products.length; c < l; c++) {

      if (! products[c].itemId)
        continue;

      let pos = this.basketPosition(positionIndex);
      positionIndex++;
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
  static addCSVProductSigns(row) {
    let pInfo = this.initCSVProducts();

    let promises = [];
    for (let c = 0, l = pInfo.products.length; c < l; c++)
      if (pInfo.products[c].itemId)
        promises.push(this.__addSignPost(pInfo.products[c], pInfo));

    return Promise.all(promises);
  }
  static initCSVProducts(cameraData = null) {
    let children = gAPPP.a.modelSets['blockchild'].fireDataValuesByKey;

    let productsBC = [];
    for (let i in children) {
      if (children[i].displayIndex)
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
        itemImage: blockData.itemImage,
        desc: blockData.itemDesc,
        price: blockData.itemPrice,
        image: blockData.texturePath,
        displayIndex: blockData.displayIndex,
        childName: pBC.childName,
        childType: pBC.childType
      };
      products.push(p);
      productsBySKU[p.itemId] = p;
    }

    products.sort((a, b) => {
      if (a.displayIndex > b.displayIndex)
        return 1;
      if (a.displayIndex < b.displayIndex)
        return -1;
      return 0;
    });
    console.log(products);
    if (!cameraData) {
      let cameraFollowBlockName = 'FollowCamera_followblock';
      let cameraFollowBlocks = gAPPP.a.modelSets['block'].queryCache('title', cameraFollowBlockName);
      for (let i in cameraFollowBlocks)
        cameraData = cameraFollowBlocks[i];
    }

    let finishDelay = 0, introTime = 0, runLength = 60;
    if (cameraData) {
      finishDelay = GLOBALUTIL.getNumberOrDefault(cameraData.finishdelay, 0);
      introTime = GLOBALUTIL.getNumberOrDefault(cameraData.introtime, 0);
      runLength = GLOBALUTIL.getNumberOrDefault(cameraData.runlength, 60);
    }

    let productCount = products.length;
    let productsShownAtOnce = 3;
    let numberOfButtons = 4;
    let productRunTime = runLength - introTime - finishDelay;
    let incLength = productRunTime / productCount;
    for (let postC = 0, postL = products.length; postC < postL; postC++) {
      products[postC].colorIndex = postC % 4;
      products[postC].startShowTime = postC * incLength + introTime;
      products[postC].startEnlargeTime = products[postC].startShowTime;
      products[postC].endShowTime = productsShownAtOnce * incLength + products[postC].startShowTime;
      products[postC].endEnlargeTime = incLength + products[postC].startShowTime;
    }

    return {
      products,
      productsBySKU,
      productsBC,
      sceneId,
      productsShownAtOnce,
      numberOfButtons,
      runLength,
      incLength,
      productRunTime,
      introTime,
      finishDelay
    }
  }
  static findMatchBlock(childType, childName, parentId) {
    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', parentId);

    for (let i in children) {
      if (children[i].childType === childType && children[i].childName === childName) {
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
