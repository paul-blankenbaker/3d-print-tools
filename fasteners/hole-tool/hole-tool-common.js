class Util {
  static getParam(params, key, defVal) {
    if (params === undefined || key === undefined) {
      return defVal;
    }
    let val = params[key];
    if (val === undefined) {
      val = defVal;
    }
    return val;
  }
}

class BoltInfo {

  // Create information about a bolt head measurements
  //
  // name - Bolt type (like "M5")
  // type - Head type (like BoltInfo.BUTTON_TYPE)
  // size - Size of bolt (diameter). Like 5 for standard M5 bolt.
  // dkMin - Minimum diameter of head.
  // dkMax - Maximum diameter of head.
  // kMin - Minimum height of head above end of bolt.
  // kMax - Maximum height of head above end of bolt.
  constructor(name, type, size, dkMin, dkMax, kMin, kMax) {
    this.type = type;
    this.name = name;
    this.size = size;
    this.dkMin = dkMin;
    this.dkMax = dkMax;
    this.kMin = kMin;
    this.kMax = kMax;
    
    if (BoltInfo._Instance === undefined) {
      BoltInfo._Instance = new Array();
      BoltInfo._Types = { };
    }
    const key = BoltInfo.getKey(type, name);
    const headList = BoltInfo._Types[type];
    if (headList == undefined) {
      BoltInfo._Types[name] = [ { "type": name, "head": type, "size": size } ];
    } else {
      let add = true;
      let n = BoltInfo._Types.length;
      for (let i = 0; i < n; i++) {
        let head = BoltInfo._Types[i]["head"];
        if (head == type) {
          add = false;
          break;
        }
      }
      if (add) {
        headList.push(type);
      }
    }
    BoltInfo._Instance[key] = this;
  }

  // Returns name of bolt type (like "M5").
  getBoltType() {
    return this.name;
  }

  // Returns an array of all available bolt types (like: "M2", "M2.5", ...).
  static getBoltTypes() {
    let bt = BoltInfo._Types;
    let keys = Object.keys(bt).sort(function(a, b) {
      let asize = bt[a][0]["size"];
      let bsize = bt[b][0]["size"];
      let compare = asize - bsize;
      return compare;
    });
    return keys;
  }

  // Returns an array of all available head types for a particular bolt type.
  static getHeadTypes(boltType) {
    let btList = BoltInfo._Types[boltType];
    let headNames = [];
    let n = btList.length;
    for (let i = 0; i < n; i++) {
      headNames.push(btList[i]["head"]);
    }
    return headNames;
  }

  // Returns size of bolt (like 5.0 for "M5")
  getSize() {
    return this.size;
  }

  // Returns type of head (like "Button").
  getHeadType() {
    return this.type;
  }

  getDiameterMax() {
    return this.dkMax;
  }

  getDiameterMin() {
    return this.dkMin;
  }

  getHeightMax() {
    return this.kMax;
  }

  getHeightMin() {
    return this.kMin;
  }
  
  static getKey(name, type) {
    return name + " " + type;
  }

  static lookup(name, type) {
    const key = BoltInfo.getKey(type, name);
    return BoltInfo._Instance[key];
  }

  static add(params) {
    const size = parseFloat(Util.getParam(params, "size", 0));
    const boltName = Util.getParam(params, "boltName", "M" + size);
    const headName = Util.getParam(params,"headName", BoltInfo.BUTTON_TYPE);
    const dkMax = Util.getParam(params, "dkMax", size * 1.9);
    const dkMin = Util.getParam(params, "dkMin", dkMax);
    const kMax = Util.getParam(params, "kMax", size * 0.55);
    const kMin = Util.getParam(params, "kMin", dkMax);
    const bhi = new BoltInfo(boltName, headName, size, dkMin, dkMax, kMin, kMax);
  }

  static addMetric(size, headType, dkMin, dkMax, kMin, kMax) {
    const bhi = new BoltInfo("M" + size, headType, size, dkMin, dkMax, kMin, kMax);
    return bhi;
  }

  static addMetricPan(size, dkMin, dkMax, kMin, kMax) {
    BoltInfo.addMetric(size, BoltInfo.PAN_TYPE, dkMin, dkMax, kMin, kMax);
  }

  static addMetricSocket(size, dkMin, dkMax, kMin, kMax) {
    BoltInfo.addMetric(size, BoltInfo.SOCKET_TYPE, dkMin, dkMax, kMin, kMax);
  }

  static addMetricButton(size, dkMin, dkMax, kMin, kMax) {
    BoltInfo.addMetric(size, BoltInfo.BUTTON_TYPE, dkMin, dkMax, kMin, kMax);
  }
}

BoltInfo.BUTTON_TYPE = "Button";
BoltInfo.SOCKET_TYPE = "Socket";
BoltInfo.PAN_TYPE = "Pan";

// From: https://www.fastenal.com/content/product_specifications/M.BHSCS.73801.10.9.BO.00.pdf
{
  BoltInfo.addMetricButton(2.5, 4.45, 4.75, 1.15, 1.37);
  BoltInfo.addMetricButton(2,   3.50, 3.80, 0.88, 1.10);
  BoltInfo.addMetricButton(3,   5.40, 5.70, 1.40, 1.65);
  BoltInfo.addMetricButton(4,   7.24, 7.60, 1.95, 2.20);
  BoltInfo.addMetricButton(5,   9.14, 9.50, 2.50, 2.75);
  BoltInfo.addMetricButton(6,  10.07, 10.50, 3.00, 3.30);
  BoltInfo.addMetricButton(8,  13.57, 14.00, 4.10, 4.40);
  BoltInfo.addMetricButton(10, 17.07, 17.50, 5.20, 5.50);
  BoltInfo.addMetricButton(12, 20.48, 21.00, 6.24, 6.60);
  BoltInfo.addMetricButton(16, 27.48, 28.00, 8.44, 8.80);

  // Metric Pan Head (Philips) DIN 7985
  // From: http://www.fasteners.eu/standards/DIN/7985/
  BoltInfo.addMetricPan(1.6, 2.9, 3.2, 1.18, 1.42);
  BoltInfo.addMetricPan(2, 3.7, 4, 1.48, 1.72);
  BoltInfo.addMetricPan(2.5, 4.7, 5, 1.88, 2.12);
  BoltInfo.addMetricPan(3, 5.7, 6, 2.28, 2.52);
  BoltInfo.addMetricPan(3.5, 6.64, 7, 2.58, 2.82);
  BoltInfo.addMetricPan(4, 7.64, 8, 2.95, 3.25);
  BoltInfo.addMetricPan(5, 9.64, 10, 3.65, 3.95);
  BoltInfo.addMetricPan(6, 11.57, 12, 4.45, 4.75);
  BoltInfo.addMetricPan(8, 15.57, 16, 5.85, 6.15);
  BoltInfo.addMetricPan(10, 19.48, 20, 7.32, 7.68);
  
  // Metric Socket Grooved Head (Hex) DIN 912
  // From: http://www.fasteners.eu/standards/DIN/912/
  BoltInfo.addMetricSocket(1.6, 2.86, 3.14, 1.46, 1.60);
  BoltInfo.addMetricSocket(2, 3.62, 3.98, 1.86, 2.00);
  BoltInfo.addMetricSocket(2.5, 4.32, 4.68, 2.36, 2.5);
  BoltInfo.addMetricSocket(3, 5.32, 5.68, 2.36, 2.5);
  BoltInfo.addMetricSocket(4, 6.78, 7.22, 3.82, 4.0);
  BoltInfo.addMetricSocket(5, 8.28, 8.72, 4.82, 5.0);
  BoltInfo.addMetricSocket(6, 9.78, 10.22, 5.7, 6.0);
  BoltInfo.addMetricSocket(8, 12.73, 13.27, 7.64, 8.0);
  BoltInfo.addMetricSocket(10, 15.73, 16.27, 9.64, 10.0);
  BoltInfo.addMetricSocket(12, 17.73, 18.27, 11.57, 12.0);
  BoltInfo.addMetricSocket(14, 20.67, 21.33, 13.45, 14.0);
  BoltInfo.addMetricSocket(16, 23.67, 24.33, 15.57, 16.0);
}

class NutInfo {

  // Create information about a nut measurements
  //
  // name - Bolt type that nut screws on (like "M5")
  // type - Nut type (like NutInfo.PLAIN_TYPE)
  // size - Size of bolt nut fits on (diameter). Like 5 for standard M5 nut.
  // wMin - Minimum width between sides of nut.
  // wMax - Maximum width between sides of nut.
  // kMin - Minimum height of head above end of nut.
  // kMax - Maximum height of head above end of nut.
  constructor(name, type, size, wMin, wMax, kMin, kMax) {
    this.type = type;
    this.name = name;
    this.size = size;
    this.wMin = wMin;
    this.wMax = wMax;
    this.kMin = kMin;
    this.kMax = kMax;

    const cos30 = Math.cos(30 * Math.PI / 180);
    this.rMin = (wMin / 2) / cos30;
    this.rMax = (wMax / 2) / cos30;
    
    if (NutInfo._Instance === undefined) {
      NutInfo._Instance = new Array();
    }
    const key = NutInfo.getKey(type, name);
    NutInfo._Instance[key] = this;
  }

  // Returns a list of all nut types that are available for the
  // specified bolt size.
  static typesForSize(size) {
    size = Number.parseFloat(size);
    let list = [];
    for (let key in NutInfo._Instance) {
      let ni = NutInfo._Instance[key];
      if (Math.abs(ni.getSize() - size) < 1e-3) {
        list.push(ni.getNutType());
      }
    }
    list.sort();
    return list;
  }

  // Returns name of nut type (like "M5").
  getBoltType() {
    return this.name;
  }

  // Returns size of nut (like 5.0 for "M5")
  getSize() {
    return this.size;
  }

  // Returns type of head (like "Button").
  getNutType() {
    return this.type;
  }

  // Maximum radius of nut as measured from center to corner point.
  getRadiusMax() {
    return this.rMax;
  }

  // Minimum radius of nut as measured from center to corner point.
  getRadiusMin() {
    return this.rMin;
  }

  // Maximum width of nut as measured between opposite flat sides.
  getWidthMax() {
    return this.wMax;
  }

  // Minimum width of nut as measured between opposite flat sides.
  getWidthMin() {
    return this.wMin;
  }

  getHeightMax() {
    return this.kMax;
  }

  getHeightMin() {
    return this.kMin;
  }
  
  static getKey(name, type) {
    return name + " " + type;
  }

  static lookup(name, type) {
    const key = NutInfo.getKey(type, name);
    return NutInfo._Instance[key];
  }

  static addMetric(size, wMax, wMin, kMax, kMin) {
    const info = new NutInfo("M" + size, NutInfo.PLAIN_TYPE, size, wMin, wMax, kMin, kMax);
    return info;
  }
}

NutInfo.PLAIN_TYPE = "Plain";

{
  // From: https://www.fastenal.com/content/product_specifications/M.934.8.P.pdf
  NutInfo.addMetric(1, 2.5, 2.4, 0.8, 0.55);
  NutInfo.addMetric(1.2, 3.0, 2.9, 1.0, 0.75);
  NutInfo.addMetric(1.6, 3.2, 3.02, 1.3, 1.05);
  NutInfo.addMetric(2, 4.0, 3.82, 1.6, 1.35);
  NutInfo.addMetric(2.5, 5.0, 4.82, 2.0, 1.75);
  NutInfo.addMetric(3, 5.5, 5.32, 2.4, 2.15);
  NutInfo.addMetric(4, 7, 6.78, 3.2, 2.9);
  NutInfo.addMetric(5, 8, 7.78, 4, 3.7);
  NutInfo.addMetric(6, 10, 9.78, 5, 4.7);
  NutInfo.addMetric(7, 11, 10.73, 5.5, 5.2);
  NutInfo.addMetric(8, 13, 12.73, 6.5, 6.14);
  NutInfo.addMetric(10, 17, 16.73, 8, 7.64);
  NutInfo.addMetric(12, 19, 18.67, 10, 9.64);
  NutInfo.addMetric(14, 22, 21.67, 11, 10.3);
  NutInfo.addMetric(16, 24, 23.67, 13, 12.3);
  NutInfo.addMetric(18, 27, 26.16, 15, 14.3);
  NutInfo.addMetric(20, 30, 29.16, 16, 14.9);
  NutInfo.addMetric(22, 32, 31, 18, 16.9);
  NutInfo.addMetric(24, 36, 35, 19, 17.7);
  NutInfo.addMetric(27, 40, 41, 22, 20.7);
  NutInfo.addMetric(30, 46, 45, 24, 22.7);
  NutInfo.addMetric(33, 50, 49, 26, 24.7);
  NutInfo.addMetric(36, 55, 53.8, 29, 27.4);
  NutInfo.addMetric(39, 60, 58.8, 31, 29.4);
  NutInfo.addMetric(42, 65, 63.1, 34, 32.4);
  NutInfo.addMetric(45, 70, 68.1, 36, 34.4);
  NutInfo.addMetric(48, 75, 73.1, 38, 36.4);
  NutInfo.addMetric(56, 85, 82.8, 45, 43.4);
  NutInfo.addMetric(64, 95, 92.8, 51, 49.1);
  NutInfo.addMetric(80, 115, 112.8, 64, 62.1);
}

{
  // From https://www.amazon.com/VIGRUE-S02-Socket-Washers-Assortment/dp/B07HVRJW5J
  // VIGRUE 570 pieces of M5, M4, M3 button head bolts, nuts and washers
  NutInfo.VIGRUE_TYPE = "Vigrue";
  // Note range is guessed at by adding/subtracting a bit from caliper
  // measurements
  new NutInfo("M5", NutInfo.VIGRUE_TYPE, 5, 7.75, 8, 4.5, 4.75);
  new NutInfo("M4", NutInfo.VIGRUE_TYPE, 4, 6.75, 7, 3.0, 3.25);
  new NutInfo("M3", NutInfo.VIGRUE_TYPE, 3, 5.4, 5.5, 2.3, 2.4);
}

class ClearanceInfo {

  constructor(name, size, pitch, clearance, tap) {
    this.name = name;
    this.size = size;
    this.pitch = pitch;
    this.clearance = clearance;
    this.tap = tap;
    
    if (ClearanceInfo._Instance === undefined) {
      ClearanceInfo._Instance = new Array();
    }
    ClearanceInfo._Instance[name] = this;
    ClearanceInfo._Instance[size] = this;
  }

  /**
   * The diameter of the bolt.
   */
  getDiameter() {
    return this.size;
  }

  /**
   * The diameter of the clearance hole to drill to allow the bolt to drop in.
   */
  getClearance() {
    return this.clearance;
  }

  /**
   * The diameter of the tap hole to drill if you want to tap the hole.
   */
  getTap() {
    return this.tap;
  }

  /**
   * How much lager the clearance hole is compared to the desired bolt size.
   */
  getEnlarged() {
    return this.getClearance() - this.getDiameter();
  }

  static lookup(name) {
    return ClearanceInfo._Instance[name];
  }
}

{
  // From: https://www.engineeringtoolbox.com/metric-threads-d_777.html
  // (Metric coarse pitch)
  const mCoarse = [
    [ 1.6, 0.35, 1.8, 1.25 ],
    [ 2, 0.40, 2.4, 1.60 ],
    [ 2.5, 0.45, 2.90, 2.00 ],
    [ 3, 0.50, 3.40, 2.50 ],
    [ 3.5, 0.60, 3.90, 2.90 ],
    [ 4, 0.70, 4.50, 3.30 ],
    [ 5, 0.80, 5.50, 4.20 ],
    [ 6, 1.00, 6.60, 5.00 ],
    [ 8, 1.25, 9.00, 6.80 ],
    [ 10, 1.50, 12.00, 8.50 ],
    [ 12, 1.75, 14.00, 10.20 ],
    [ 14, 2.00, 16.00, 12.00 ],
    [ 16, 2.00, 18.00, 14.00 ],
    [ 20, 2.50, 22.00, 17.50 ],
    [ 22, 2.50, 25.00, 19.50 ],
    [ 24, 3.00, 27.00, 21.00 ],
    [ 27, 3.00, 30.00, 24.00 ],
    [ 30, 3.50, 33.00, 26.50 ],
    [ 36, 4.00, 40.00, 32.00 ],
    [ 42, 4.50, 46.00, 37.50 ],
    [ 48, 5.00, 53.00, 43.00 ],
    [ 56, 5.50, 62.00, 50.50 ],
    [ 64, 6.00, 70.00, 58.00 ],
    [ 68, 6.00, 74.00, 62.00 ]
  ];
  for (let i in mCoarse) {
    let row = mCoarse[i];
    let name = "M" + row[0];
    new ClearanceInfo(name, row[0], row[1], row[2], row[3]);
  }
}

class Tolerance {
  constructor(diameterTol, heightTol) {
    this.diameterTol = diameterTol;
    this.heightTol = heightTol;
  }

  getHeight() {
    return this.heightTol;
  }

  getDiameter() {
    return this.diameterTol;
  }
}

Tolerance.PERFECT = new Tolerance(0, 0);
Tolerance.PRUSA_15 = new Tolerance(0.15, 0.15);

function regular_polygon_points(sides, radius) {
  const sideToRads = 2 * Math.PI / sides;
  let a = new Array(sides);
  
  for (let i = 0; i < sides; i++) {
    let ang = sideToRads * i;
    a[i] = [ radius * Math.cos(ang), radius * Math.sin(ang) ];
  }
  return a;
}

function regular_polygon(sides, radius) {
  let p = polygon(regular_polygon_points(sides, radius));
  return p;
}

function regular_prism(sides, radius, h) {
  let prism = linear_extrude( {height: h }, regular_polygon(sides, radius));
  return prism;
}

function hex_slot_points(r, l) {
  const ang = Math.PI / 6;
  const h = r * Math.cos(ang);
  const x1 = r * Math.sin(ang);
  const x2 = x1 - l;
  
  return [
    [ r, 0 ], [ x1, h ], [ x2, h ], [ x2, -h ], [ x1, -h ]
  ];
}

function hex_slot(r, l, h) {
  let p = polygon(hex_slot_points(r, l));
  let volume = linear_extrude({ height: h }, p);
  return volume;
}

function copy_params(dst, src, keys) {
  if (dst === undefined || src === undefined || keys === undefined) {
    return dst;
  }
  let n = keys.length;
  for (let i = 0; i < n; i++) {
    let key = keys[i];
    let val = src[key];
    if (val !== undefined) {
      dst[key] = val;
    }
  }
  return dst;
}

function get_param(params, key, def) {
  if (params === undefined) {
    return def;
  }
  let val = params[key];
  if (val === undefined) {
    return def;
  }
  return val;
}

function hole_for_bolt(params) {
  let z = 0;
  let r = params.bolt.r;
  let h = params.head;
  let n = params.nut;
  let depth = params.h;
  let sinks = params.sink;
  let headSink = get_param(sinks, "head", 0);
  let nutSink = get_param(sinks, "nut", 0);
  let slot = get_param(params, "slot", undefined);
  let slotHt = get_param(slot, "z", 0);
  let slotExt = get_param(slot, "l", 0);
  
  let holes = [];
  
  if (headSink == -1) {
    headSink = h.h;
  }
  
  if (nutSink == -1) {
    nutSink = n.h;
  }

  // Hole for nut
  if (nutSink > 0) {
    let sides = n.sides;
    if (sides === undefined) {
      sides = 6;
    }
    holes.push(regular_prism(sides, n.r, nutSink));
    z += nutSink;
  }

  // Slot for nut (can be at bottom
  if (slotExt > 0) {
    let s = hex_slot(n.r, slotExt, n.h);
    if (slotHt > 0) {
      s = s.translate([0, 0, slotHt]);
    }
    holes.push(s);
  }

  // Hole for bolt between head and nut
  let bl = depth - z - headSink;
  let bh = cylinder({ "r": r, "h": bl});
  if (z > 0) {
    bh = bh.translate([0, 0, z]);
  }
  holes.push(bh);
  z += bl;

  // Hole for bolt head (if any)
  if (headSink > 0) {
    holes.push(cylinder({ "r": h.r, "h": headSink }).translate([0, 0, z]));
  }
  
  if (holes.length == 1) {
    return holes[0];
  }
  return union(holes);
}

function bolt_hole_test(l, bolt, head, nut) {
  let depth = l + head.h;
  let slotH = (l - nut.h) / 2 + (nut.h / 2);
  let r = Math.max(nut.r, head.r) + 3;
  
  let params = {
    "h": depth, "bolt": bolt, "head": head, "nut": nut,
    "sink": { "head": head.h, "nut": nut.h },
    "slot": { "z": slotH, "l": (r * 2) }
  };
  return difference(cylinder({ "r": r, "h": depth }), hole_for_bolt(params));
}

function bolt_hole_3d_test(l, fastener) {
  const { bolt, head, nut } = fastener;
  let depth = l + head.h;
  let slotH = (l - nut.h) / 2 + (nut.h / 2);
  let r = Math.max(nut.r, head.r) * 1.05 + 1.5;
  
  let params = {
    "h": depth, "bolt": bolt, "head": head, "nut": nut,
    "sink": { "head": head.h, "nut": nut.h },
    "slot": { "z": slotH, "l": (r * 2) }
  };
  let w = r * 2;
  let zlift = w / 2;
  let xshift = w * 0.95;

  // Bolt hole in square shaft
  let b = difference(cube({ "size": [ w, w, depth ], "center": [ true, true, false ]}), hole_for_bolt(params));
  // Bolt hole in cylinder
  let bz = difference(cylinder({ "r": r, "h": depth }), hole_for_bolt(params));

  // Lay down two square shaft bolt holes
  return union(
    rotate([90, 90, 0], b).translate([xshift, w, zlift]),
    rotate([90, 0, 90], b).translate([-xshift, -xshift, zlift]),
    rotate([0, 0, -45], bz)
  );
}

class Fastener {
  constructor() {
    this.tolerance = Tolerance.PERFECT;
    this.nutInfo = undefined;
    this.length = 10;
    this.depth = 10;
    this.slotDepth = this.slotExtend = 0;
    this.headSink = this.nutSink = 0;
    const hinfo = BoltInfo.lookup("M5", BoltInfo.BUTTON_TYPE);
    this.setHeadInfo(hinfo);
  }

  static create(boltType, headType, nutType) {
    let f = new Fastener();
    f.setHeadInfo(BoltInfo.lookup(boltType, headType));
    if (nutType !== undefined) {
      f.setNutInfo(NutInfo.lookup(boltType, nutType));
    }
    return f;
  }

  setClearanceInfo(clearanceInfo) {
    this.clearanceInfo = clearanceInfo;
  }

  getClearanceInfo() {
    return this.clearanceInfo;
  }

  setHeadInfo(headInfo) {
    this.headInfo = headInfo;
    const btype = headInfo.getBoltType();
    this.clearanceInfo = ClearanceInfo.lookup(btype);
    if (this.nutInfo == undefined || btype != this.nutInfo.getBoltType()) {
      this.nutInfo = NutInfo.lookup(btype, NutInfo.PLAIN_TYPE);
    }
  }

  getHeadInfo() {
    return this.headInfo;
  }

  setNutInfo(nutInfo) {
    this.nutInfo = nutInfo;
  }

  getNutInfo() {
    return this.nutInfo;
  }
  
  setTolerance(tol) {
    this.tolerance = tol;
  }

  // Set the length of the bolt (not necessarily how deep to drill)
  setBoltLength(len) {
    this.boltLength = len;
  }

  // Set the depth to drill through (the entire thickness of the material). 
  setDrillDepth(depth) {
    this.depth = depth;
    this.length = this.depth - this.nutSink - this.headSink;
  }

  setHeadSink(depth) {
    // Give back any previous head sink to length
    this.headSink = depth;
    this.length = this.depth - depth - this.nutSink;
  }
  
  setHeadFlush() {
    this.setHeadSink(this.getHeadHeight());
  }

  setNutSink(depth) {
    if (this.nutInfo == undefined) {
      depth = 0;
    }
    // Give back any previous head sink to length
    this.nutSink = depth;
    this.length = this.depth - depth - this.headSink;
  }

  // Create a "slot" to allow sliding a nut in from the side.
  //
  // belowHead - how far below the head for the top of the nut
  //
  // extend - How far do you need to extend the slot out from the
  // center (set to 0 to disable)
  setNutSlot(belowHead, extend) {
    this.slotDepth = belowHead;
    this.slotExtend = extend;
  }

  setNutFlush() {
    this.setNutSink(this.getNutHeight());
  }

  // Set up so that both the head and nut (if present) are counter sunk
  // into the material (will not protrude).
  makeFlush(length) {
    this.length = length;
    this.setDrillDepth(length + this.getHeadHeight());
    this.setHeadFlush();
    this.setNutFlush();
  }

  // Depth to drill out for head of bolt to be flush (or just under)
  // of material surface.
  getHeadHeight() {
    return this.headInfo.getHeightMax() + this.tolerance.getHeight();
  }
  
  // Depth to drill out for nut to be flush (or just under)
  // of material surface (0 if no nut set).
  getNutHeight() {
    if (this.nutInfo !== undefined) {
      return this.nutInfo.getHeightMax() + this.tolerance.getHeight();
    }
    return 0;
  }
  
  getRadiusClearance() {
    return this.getBoltHoleRadius() - (this.headInfo.getSize() / 2);
  }

  getBoltHoleRadius() {
    return (this.clearanceInfo.getClearance() + this.tolerance.getDiameter()) / 2;
  }

  getBoltHeadRadius() {
    return this.headInfo.getDiameterMax() / 2 + this.getRadiusClearance();
  }

  getNutRadius() {
    if (this.nutInfo == undefined) {
      return 0;
    }
    return this.nutInfo.getRadiusMax() + this.getRadiusClearance();
  }

  getNutWidth() {
    let r = this.getNutRadius();
    let w = r * Math.cos(Math.PI / 6) * 2;
    return w;
  }

  getMaxRadius() {
    let r = Math.max(this.getBoltHoleRadius(), this.getBoltHeadRadius(), this.getNutRadius());
    return r;
  }

  createJsCadShared() {
    let code = "// Constants related to making bolt holes\n"
        + "const DRILL_INFO_KEYS = [ \"h\", \"sink\", \"slot\" ];\n\n"
        + "// Static methods for making bolt holes given\n"
        + regular_polygon_points.toString() + "\n"
        + regular_polygon.toString() + "\n"
        + regular_prism.toString() + "\n"
        + hex_slot_points.toString() + "\n"
        + hex_slot.toString() + "\n"
        + copy_params.toString() + "\n"
        + get_param.toString() + "\n"
        + hole_for_bolt.toString() + "\n"
        + bolt_hole_test.toString() + "\n"
        + bolt_hole_3d_test.toString() + "\n";
    return code;
  }
  
  createJsCadFunc(name) {
    const hinfo = this.headInfo;
    const tol = this.tolerance;
    const hTol = tol.getHeight();
    const rHead = this.getBoltHeadRadius();
    const rBolt = this.getBoltHoleRadius();
    const rNut = this.getNutRadius();
    const sHead = this.getHeadHeight();
    const sNut = this.getNutHeight();
    const tBolt = hinfo.getBoltType().toLowerCase().replace('.', '_');
    const tHead = hinfo.getHeadType().toLowerCase();
    
    if (name == undefined) {
      name = tBolt + "_" + tHead;
    }
    let unionStart = "";
    let unionEnd = "";
    if (sHead > 0 || sNut > 0) {
      unionStart = "union(\n    ";
      unionEnd = "\n  )";
    }

    let f = "//\n// " + hinfo.getBoltType() + " " + hinfo.getHeadType()
        + " info\n//\n";
    
    f += "const " + tBolt + "_bolt_hole = { \"r\": " + rBolt + " };\n"
    f += "const " + tBolt + "_" + tHead + "_hole = { \"r\": " + rHead
      + ", \"h\": " + sHead + " };\n"

    if (sNut > 0) {
      f += "const " + tBolt + "_nut_hole = { \"r\": " + rNut
        + ", \"h\": " + sNut
        + ", \"w\": " + (rNut * 2 * Math.cos(Math.PI / 6))
        + ", \"sides\": " + 6 + " };\n";
    }
    
    f += "function " + tBolt + "_" + tHead + "(drillInfo) {\n"
      + "  let boltInfo = { \"bolt\": " + tBolt + "_bolt_hole, \"head\": "
      + tBolt + "_" + tHead + "_hole";
    if (sNut > 0) {
      f += ", \"nut\": " + tBolt + "_nut_hole";
    }
    f += " };\n"
      + "  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);\n}\n";
/*    
    f += "\n\nfunction " + name + "_hole() {\n  const hole = " + unionStart
      + "cylinder({ r: " + rBolt + ", h: " + this.length + " })";
    
    if (this.nutSink > 0) {
     
      f += ".translate([0, 0, " + this.nutSink + "]),\n"
        + "    regular_prism(6, " + rNut + ", " + this.nutSink + ")";
    }
    
    if (this.headSink > 0) {
      const headOfs = this.depth - this.headSink;
      f += ",\n    cylinder({ r: " + rHead + ", h: " + this.headSink + " }).translate([0, 0, " + headOfs + "])";
    }

    if (this.slotExtend > 0) {
      const slotOfs = this.depth - this.headSink - this.slotDepth - sNut;
      f += ",\n    hex_slot(" + rNut + ", " + this.slotExtend + ", " + sNut + ").translate([0, 0, " + slotOfs + "])";
    }

    let r = this.getMaxRadius() + 2;
    f += unionEnd + ";\n  return hole;\n}\n\nfunction " + name + "_hole_test() {\n  return difference(cylinder({ r: " + r + ", h: " + this.depth + "}), " + name + "_hole());\n}\n";
*/
    return f;
  }
}


const m5 = Fastener.create("M5", BoltInfo.BUTTON_TYPE, NutInfo.VIGRUE_TYPE);
m5.setTolerance(Tolerance.PRUSA_15);
//m5.makeFlush(16);
//m5.setNutSlot(3, 10);
//console.log(m5.getNutRadius());
//console.log(m5.getRadiusClearance());
console.log(m5.createJsCadShared());
console.log(m5.createJsCadFunc());

const m4 = Fastener.create("M4", BoltInfo.BUTTON_TYPE, NutInfo.VIGRUE_TYPE);
m4.setTolerance(Tolerance.PRUSA_15);
//m4.makeFlush(12);
//m4.setNutSlot(2.5, 10);
console.log(m4.createJsCadFunc());

const m3 = Fastener.create("M3", BoltInfo.BUTTON_TYPE, NutInfo.VIGRUE_TYPE);
m3.setTolerance(Tolerance.PRUSA_15);
//m3.makeFlush(10);
//m3.setNutSlot(2, 10);
console.log(m3.createJsCadFunc());

const m25 = Fastener.create("M2.5", BoltInfo.PAN_TYPE);
m25.setTolerance(Tolerance.PRUSA_15);
//m25.makeFlush(10);
//m25.setNutSlot(2, 10);
console.log(m25.createJsCadFunc());

const m25s = Fastener.create("M2.5", BoltInfo.SOCKET_TYPE);
m25s.setTolerance(Tolerance.PRUSA_15);
//m25s.makeFlush(10);
//m25s.setNutSlot(2, 10);
console.log(m25s.createJsCadFunc());
