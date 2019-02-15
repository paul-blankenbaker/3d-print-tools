/**
 * This program is used to generate two sides of a housing for a 
 * US5881LUA Hall effect sensor purchase at https://www.adafruit.com/product/158.
 * There is room in the casing for the 10K ohm pull up resistor as well.
 * 
 * To use:
 * 
 * 1. Go to https://openjscad.org/
 * 2. Copy and paste this code into editor window.
 * 3. Change the value in the switch statement to select the top or bottom half.
 * 4. Render the STL file from the web interface.
 */

// Constants related to making bolt holes
const DRILL_INFO_KEYS = ["h", "sink", "slot"];

// Static methods for making bolt holes given
function regular_polygon_points(sides, radius) {
  const sideToRads = 2 * Math.PI / sides;
  let a = new Array(sides);

  for (let i = 0; i < sides; i++) {
    let ang = sideToRads * i;
    a[i] = [radius * Math.cos(ang), radius * Math.sin(ang)];
  }
  return a;
}
function regular_polygon(sides, radius) {
  let p = polygon(regular_polygon_points(sides, radius));
  return p;
}
function regular_prism(sides, radius, h) {
  let prism = linear_extrude({ height: h }, regular_polygon(sides, radius));
  return prism;
}
function hex_slot_points(r, l) {
  const ang = Math.PI / 6;
  const h = r * Math.cos(ang);
  const x1 = r * Math.sin(ang);
  const x2 = x1 - l;

  return [
    [r, 0], [x1, h], [x2, h], [x2, -h], [x1, -h]
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
  let bh = cylinder({ "r": r, "h": bl });
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
  let b = difference(cube({ "size": [w, w, depth], "center": [true, true, false] }), hole_for_bolt(params));
  // Bolt hole in cylinder
  let bz = difference(cylinder({ "r": r, "h": depth }), hole_for_bolt(params));

  // Lay down two square shaft bolt holes
  return union(
    rotate([90, 90, 0], b).translate([xshift, w, zlift]),
    rotate([90, 0, 90], b).translate([-xshift, -xshift, zlift]),
    rotate([0, 0, -45], bz)
  );
}

//
// M5 Button info
//
const m5_bolt_hole = { "r": 2.825 };
const m5_button_hole = { "r": 5.075, "h": 2.9 };
const m5_nut_hole = { "r": 4.943802153517006, "h": 4.9, "w": 8.562916512459886, "sides": 6 };
function m5_button(drillInfo) {
  let boltInfo = { "bolt": m5_bolt_hole, "head": m5_button_hole, "nut": m5_nut_hole };
  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
}

//
// M4 Button info
//
const m4_bolt_hole = { "r": 2.325 };
const m4_button_hole = { "r": 4.125, "h": 2.35 };
const m4_nut_hole = { "r": 4.36645188432738, "h": 3.4, "w": 7.562916512459885, "sides": 6 };
function m4_button(drillInfo) {
  let boltInfo = { "bolt": m4_bolt_hole, "head": m4_button_hole, "nut": m4_nut_hole };
  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
}

//
// M3 Button info
//
const m3_bolt_hole = { "r": 1.775 };
const m3_button_hole = { "r": 3.125, "h": 1.7999999999999998 };
const m3_nut_hole = { "r": 3.450426480542941, "h": 2.55, "w": 5.97631397208144, "sides": 6 };
function m3_button(drillInfo) {
  let boltInfo = { "bolt": m3_bolt_hole, "head": m3_button_hole, "nut": m3_nut_hole };
  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
}

//
// M2.5 Pan info
//
const m2_5_bolt_hole = { "r": 1.525 };
const m2_5_pan_hole = { "r": 2.775, "h": 2.27 };
const m2_5_nut_hole = { "r": 3.1617513459481286, "h": 2.15, "w": 5.476313972081441, "sides": 6 };
function m2_5_pan(drillInfo) {
  let boltInfo = { "bolt": m2_5_bolt_hole, "head": m2_5_pan_hole, "nut": m2_5_nut_hole };
  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
}

//
// M2.5 Socket info
//
// const m2_5_bolt_hole = { "r": 1.525 };
// const m2_5_socket_hole = { "r": 2.6149999999999998, "h": 2.65 };
// const m2_5_nut_hole = { "r": 3.1617513459481286, "h": 2.15, "w": 5.476313972081441, "sides": 6 };
// function m2_5_socket(drillInfo) {
//   let boltInfo = { "bolt": m2_5_bolt_hole, "head": m2_5_socket_hole, "nut": m2_5_nut_hole };
//   return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
// }


class HallThroughHole {

  /**
   * Construct a new instance of a Hall Effect sensor cut-out (slightly larger than the sensor).
   * 
   * <p>These parameters correspond to the measurements shown on page 10 of the US55881 data sheet.
   * (https://www.melexis.com/en/documents/documentation/datasheets/datasheet-mlx92211-axa).</p>
   * 
   * <p>Default values are provided to make cut-out big enough for component
   * to fit inside the 3D rendering.</p>
   * 
   * @param A - Height of head of sensor.
   * @param D - Width of sensor at bottom.
   * @param J - Width of sensor at top.
   * @param E - Total thickness of sensor.
   * @param S - Thickness of bottom portion before slope to J starts.
   * @param e1 - Distance between center of pins.
   * @param pinChannel - How big of a tunnel to cut for pin wires.
   */
  constructor(A = 3.5, D = 4.5, J = 3, E = 1.75, S = 1.0, e1 = 1.275, pinChannel = 0.9) {
    this.A = A;
    this.D = D;
    this.J = J;
    this.E = E;
    this.S = S;
    this.e1 = e1;
    this.pinChannel = 1.0;
  }

  render(pinChannelLen, pinChannelCenterLen) {
    const cenX = [true, false, false];

    const xw = this.D / 2;
    const xn = this.J / 2;
    const ys = this.S;
    const yt = this.E;
    const pts = [[-xw, 0], [-xw, ys], [-xn, yt], [xn, yt], [xw, ys], [xw, 0]];
    const prof = polygon({ "points": pts });

    const head = linear_extrude({ "height": this.A, "center": cenX }, prof).rotateX(90);

    const tD = this.pinChannel;
    const tLen = pinChannelLen;
    const pinTunnel = cube({ "size": [tD, tLen, Math.max(tD, this.S)], "center": cenX });
    const pinTunnelCenter = cube({ "size": [tD, pinChannelCenterLen, Math.max(tD, this.S)], "center": cenX });

    return union(
      head,
      pinTunnel.translate([-this.e1, 0, 0]),
      pinTunnelCenter,
      pinTunnel.translate([+this.e1, 0, 0])
    );
  }
}

function createResistorUSlot(len, width) {
  const rw = 2.75;
  const c = [true, false, false];
  const wireW = 1.0
  const resistor = cube({ "size": [width, rw, rw], "center": c });
  const leg = cube({ "size": [wireW, len, rw], "center": c });
  const legOfs = (width - wireW) / 2;
  return union(
    resistor,
    leg.translate([-legOfs, 0, 0]),
    leg.translate([+legOfs, 0, 0])
  );
}

function create3WireOutHoles(wd, l, midTrim) {
  const c = [true, false, false];
  const wireW = 1.0
  const leg = cube({ "size": [wd, l, wd], "center": c });
  const legMid = cube({ "size": [wd, l - midTrim, wd], "center": c });
  const gap = 1.0;
  const legOfs = gap + wd;
  return union(
    leg.translate([-legOfs, 0, 0]),
    legMid.translate([0, midTrim, 0]),
    leg.translate([+legOfs, 0, 0])
  );
}

function addMountTabs(obj, w, l, h) {
  const r = m5_bolt_hole.r;
  const rOut = r * 2.5;

  const withTabs = union(
    obj,
    cylinder({ "r": rOut, "h": h }).translate([-w / 2, l / 2, 0]),
    cylinder({ "r": rOut, "h": h }).translate([w / 2, l / 2, 0])
  );

  return difference(
    withTabs,
    cylinder({ "r": r, "h": h }).translate([-w / 2, l / 2, 0]),
    cylinder({ "r": r, "h": h }).translate([w / 2, l / 2, 0])
  );
}

function createCover(w, l, h) {
  const r = 1.5;
  const c = [true, false, false];
  const lid = cube({ "size": [w, l, h], "center": c });

  return addMountTabs(lid, w, l, h);
}

function createBottom(w, l, h) {
  const c = [true, false, false];
  const bot = cube({ "size": [w, l, h], "center": c });

  return addMountTabs(bot, w, l, h);
}

function layoutBolts(boltHole, w, l, yOfs, zOfs) {
  const bgap = 4;
  const bx = w / 2 - bgap;
  const by = l - bgap + yOfs;

  return union(
    boltHole.translate([bx, by, zOfs]),
    boltHole.translate([-bx, by, zOfs]),
    boltHole.translate([bx, bgap + yOfs, zOfs]),
    boltHole.translate([-bx, bgap + yOfs, zOfs])
  );
}

function createAlign(w, h, xofs, yofs, zofs) {
  const a = cube({ "size": [w, w, h], "center": [true, true, false] });
  return union(
    a.translate([xofs, yofs, zofs]),
    a.translate([-xofs, yofs, zofs])
  );
}

function main() {
  const cenX = [true, false, false];
  const len = 9;
  const wireOutLen = 12;

  const wg = 0.75;
  const wireGrab = cube({ "size": [10, 0.5, wg], "center": cenX });
  const boxW = 27;
  const boxL = 28;
  const boxT = 5.25;
  const topT = 2.0;
  const topOfs = 3.5;
  const boxZ = topOfs - boxT;
  const wgOfs = boxL - 10.5;
  const wgGap = 2.25;
  const boxOfs = -10;

  const headSink = 0;
  const nutSink = boxT - topT - 1;
  const boltParams = m2_5_pan({ "h": boxT + headSink, "sink": { "head": headSink, "nut": nutSink } });
  const boltHole = hole_for_bolt(boltParams);
  const boltHoles = layoutBolts(boltHole, boxW, boxL, boxOfs, boxZ);

  const sensor = new HallThroughHole().render(3, len).translate([0, 0, 1.0]);
  const resistorSlot = createResistorUSlot(len + 4, 12).translate([0, -7.5, 0]);
  const wireOutHoles = create3WireOutHoles(2.5, wireOutLen, 2).translate([0, 7, 0]);
  const sideChannel = cube({ "size": [4.5, 7, 2.75], "center": cenX });
  const alignHoles = createAlign(3.25, boxT, 9, 8.5, boxZ);
  const alignPegs = createAlign(3, boxT, 9, 8.5, boxZ);

  const cutout = union(
    sensor,
    resistorSlot,
    sideChannel.translate([-4.0, 1, 0]),
    sideChannel.translate([+4.0, 1, 0]),
    wireOutHoles
  );

  switch (1) {
    case 0:
      return cutout;
    case 1: {
      const cover = union(
        difference(
          createCover(boxW, boxL, topT).translate([0, boxOfs, topOfs - topT]),
          cutout,
          cube({ "size": [1, 1, boxT], "center": cenX }).translate([0, -2.0, boxT - topOfs]),
          boltHoles
        ),
        wireGrab.translate([0, wgOfs - wgGap, topOfs - wg - 0.75]),
        alignPegs
      );

      return cover;
    }
    case 2: {
      const lid = union(
        difference(
          createBottom(boxW, boxL, boxT - topT).translate([0, boxOfs, topOfs - boxT]),
          cutout,
          boltHoles,
          alignHoles
        ),
        wireGrab.translate([0, wgOfs - wgGap * 2, 0]),
        wireGrab.translate([0, wgOfs, 0])
      );
      // Trim off any wiregard that bumps into top cover
      const trimmed = difference(lid, createCover(boxW, boxL, topT).translate([0, boxOfs, topOfs - topT]));

      return trimmed;
    }
    case 3:
      return boltHole;
    case 4:
      return boltHoles;
    default: {
      return union(
        createCover(boxW, boxL, topT).translate([0, -10, topOfs - topT]),
        createBottom(boxW, boxL, boxT - topT).translate([0, -10, topOfs - boxT])
      );
    }
  }

}