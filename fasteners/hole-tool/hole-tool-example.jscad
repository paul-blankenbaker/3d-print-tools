// Constants related to making bolt holes
const DRILL_INFO_KEYS = [ "h", "sink", "slot" ];

// Static methods for making bolt holes given
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
//const m2_5_bolt_hole = { "r": 1.525 };
const m2_5_socket_hole = { "r": 2.6149999999999998, "h": 2.65 };
//const m2_5_nut_hole = { "r": 3.1617513459481286, "h": 2.15, "w": 5.476313972081441, "sides": 6 };
function m2_5_socket(drillInfo) {
  let boltInfo = { "bolt": m2_5_bolt_hole, "head": m2_5_socket_hole, "nut": m2_5_nut_hole };
  return copy_params(boltInfo, drillInfo, DRILL_INFO_KEYS);
}


// Main entry point into the program, needs to return an array of 3D objects
function main () {
    CSG.defaultResolution2D = 128;
    CSG.defaultResolution3D = 12;
    let s = undefined;
    
    const mode = 5;
    
    switch (mode) {
        case 0:
            s = bolt_hole_3d_test(10, m2_5_pan());
            break;
        case 1:
            s = bolt_hole_3d_test(8, m2_5_socket());
            break;
        case 3:
            s = bolt_hole_3d_test(10, m3_button());
            break;
        case 4:
            s = bolt_hole_3d_test(12, m4_button());
            break;
        case 5:
            s = bolt_hole_3d_test(16, m4_button());
            break;
        default:
            s = union(
                bolt_hole_3d_test(10, m2_5_pan()),
                bolt_hole_3d_test(8, m2_5_socket()).translate([0, 40, 0]),
                bolt_hole_3d_test(10, m3_button()).translate([-40, 0, 0]),
                bolt_hole_3d_test(12, m4_button()).translate([0, -40, 0]),
                bolt_hole_3d_test(16, m5_button()).translate([40, 0, 0])
            );
    }
    return s;
}
