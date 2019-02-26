/**
 * Generates a mount for a cylinderical proximity sensor that has a nut
 * on both sides. You can specify multiple mounting holes and multiple
 * bolt/zip tie holes to allow for adjusting the positioning.
 * 
 * To use:
 * 
 * 1. Go to https://openjscad.org/
 * 2. Copy and paste this code into editor window.
 * 3. Change the value in the switch statement to select the top or bottom half.
 * 4. Render the STL file from the web interface for 3D printing.
 * 
 * NOTE: Numbers chosen below are specified in mm. This simplifies life
 * when generating STL files intended for 3D printing.
 * 
 * This was created for the Coretechs Robotics Team (FRC 5511) for the 2019
 * robot. We used it with the following sensor:
 * 
 * https://www.amazon.com/gp/product/B0753Z5R3W/ref=ox_sc_act_title_1?smid=A3WSD51PE9OSV&psc=1
 * 
 * Side note, sensors we received had following pin outs:
 * 
 * Ground - Blue wire
 * 5 V    - Brown wire
 * Signal - Black wire
 */

// Set to item that you want to render
// 0 - Single piece elevated proximity mount with side rails
// 1 - Flat proximity mount to bolt onto L bracket
// 2 - Sinle L-bracket to bolt flat plate to.
// 3 - Two joined L-brackets to bolt flat plate to.
// 4 - Single piece side mount (mounting holes perpendicular to sensor)
const render = 4;

// Use calipers to measure outside diameter of proximity
// sensor that needs to pass through the hole and add
// a bit.
const proximitySensorDiameter = 18.5;

// Use calipers to measure outside diameter of mounting
// bolts and add a bit for clearance.
const mountHoleDiameter = 2 * 1.525; // M2.5
//const mountHoleDiameter = 2 * 1.775; // M3
// const mountHoleDiameter = 2 * 2.325; // M4
// const mountHoleDiameter = 2 * 2.825; // M5

// How many holes and spacing between hole centers for proximity sensor
const proximitySensorHoles = 1;

// How many mount holes for bolts/zip ties on outside
const mountingHoles = 4;

// Use these to set hole spacing and offset from end
const proximitySensorSpacing = 20;
const proximityEndMargin = (25 - proximitySensorDiameter) / 2;

// NOTE: If you make it such that the mounting hole
// spacing is not an even multiple of the proximity
// sensor spacing, this will give you more combinations
// of sensor placement
const mountingHoleSpacing = 7.5;
const mountingHoleEndMargin = 2;

// Width and thickness of plate in middle that proximity sensors goes through
// (make sure it is wide enough for the clamping nut to fit in)
const proximityPlateWidth = 25;
const proximityPlateThick = 4;

// Width and thickness of edge rails that bolts pass through.
// The top of the proximity mounting plate lines up with this,
// so make sure the thickness will leave enough of a gap
// for the sensor to poke through
const boltRailWidth = Math.ceil(mountHoleDiameter * 2) + 1;

// Set rail thickness more than the proximity plate thickness
// if you want the riser printed. Set it equal to the proximity
// plate thickness if you want a flat mounting plate.
//const boltRailThick = proximityPlateThick;
const boltRailThick = 19;

// If you want to cut out holes for the nuts on top, set
// nutSink to a positive number (0 disables).
const nutSink = 0;
// const nutSink = 10;

// If you do want counter sunk nuts, you can
// use calipers to measure the width of a nut between
// two flat sides and then add a bit to control
// the size of the hole with the nutWidth parameter.
const nutWidth = 5.476313972081441; // M2.5
const nutHeight = 2.15; // M2.5
//const nutWidth = 5.97631397208144; // M3
//const nutHeight = 2.55; // M3
//const nutWidth = 7.562916512459885; // M4
//const nutHeight = 3.4; // M4
//const nutWidth = 8.562916512459886; // M5
//const nutHeight = 4.9; // M5

// Compute nut radius based on width between sides
const nutR = (nutWidth / 2) / Math.cos(30 * Math.PI / 180.0);

// Variables for L-bracket set mount hole diameter to non-zero
// to enable rendering.
// const lMountHoleDiameter = 2 * 1.525; // M2.5
// const lMountHoleDiameter = 2 * 1.775; // M3
// const lMountHoleDiameter = 2 * 2.325; // M4
const lMountHoleDiameter = 2 * 2.825; // M5
const lMountHoleSpacing = Math.floor(lMountHoleDiameter * 1.5 + 1);
const lLength = proximitySensorSpacing + 2 * proximityEndMargin;
const lThick = 3;
const lWidth = Math.floor(lMountHoleDiameter * 2.5 + 1);
// How far below top surface to cut out slot for nut
const lSlotSink = 4;

// How far from robot center of sensor should be on a side mount
const sideMountCenter = 30;

// For centering on X or X/Y axis
const cenX = [ true, false, false ];
const cenXY = [ true, true, false ];

// Static methods for normal polygons and prisms of N sides
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

// Creates a long triangular gusset
function createGusset(l, h) {
  let p = [ [ 0, 0], [ 0, h ], [ h, 0 ] ];
  return linear_extrude({ height: l }, polygon(p));
}

/**
 * Returns single side rail that can be bolted to the robot as a single
 * piece that will then allow you to bolt a flat plate proximity
 * sensor mount to (but only support on one side).
 */
function createL() {
  let rail = cube({ "size": [boltRailWidth, lLength, boltRailThick], "center": cenX });
  
  const fitHoles = Math.floor((lLength - mountHoleDiameter) / mountingHoleSpacing) + 1;
  const numHoles = Math.max(mountingHoles, fitHoles);

  // Cut out hole(s) for mounting proximity plate to L
  for (let i = 0; i < numHoles; i++) {
    const r = mountHoleDiameter / 2.0;
    const h = boltRailThick;
    const yOfs = mountingHoleEndMargin + r + (i * mountingHoleSpacing);
    const nutZ = h - lSlotSink - nutHeight;
    const boltHole = cylinder({ "r": r, "h": h, "center": cenXY }).translate([0, yOfs, 0]);
    
    const nutSlot = hex_slot(nutR, boltRailWidth, nutHeight).translate([0, yOfs, nutZ]);

    rail = difference(rail, boltHole, nutSlot);
  }

  let plate = cube({ "size": [lWidth, lLength, lThick], "center": cenX });

  // Cut out hole(s) for mounting L bracket to robot
  const n = Math.floor((lLength - lMountHoleDiameter) / lMountHoleSpacing + 0.5);
  const lOfs = (lLength - ((n - 1) * lMountHoleSpacing + lMountHoleDiameter)) / 2;

  for (let i = 0; i < n; i++) {
    const r = lMountHoleDiameter / 2.0;
    const h = lThick;
    const yOfs = lOfs + r + (i * lMountHoleSpacing);
    const boltHole = cylinder({ "r": r, "h": h, "center": cenXY }).translate([0, yOfs, 0]);
    
    plate = difference(plate, boltHole);
  }

  return union(rail, plate.translate([(boltRailWidth + lWidth) * .5, 0, 0]));
}

/**
 * Returns two side rails that can be bolted to the robot as a single
 * piece that will then allow you to bolt a flat plate proximity
 * sensor mount to.
 */
function createBasePlate() {
  const cenX = [ true, false, false ];
  const cw = proximityPlateWidth;
  const cd = proximityEndMargin;
  const cxOfs = -(cw + boltRailWidth) / 2;
  const ch = Math.max(lThick, boltRailThick - lSlotSink - nutHeight - 1);
  let connector = cube({ "size": [cw, lThick, ch], "center": cenX });
  return union(
    createL(),
    createL().rotateZ(180).translate([-(boltRailWidth + proximityPlateWidth), lLength, 0]),
    connector.translate([cxOfs, 0, 0]),
    connector.translate([cxOfs, lLength - lThick, 0])
    );
}

/**
 * Returns a flat piece with hole(s) cut out that proximity sensor
 * will attached to.
 */
function createProximityPlate() {
  // Total length of mount
  const totalLength = proximitySensorSpacing * (proximitySensorHoles - 1) + proximitySensorDiameter + 2 * proximityEndMargin;

  // Create plate for attaching proximity sensor
  let proximityPlate = cube({ "size": [proximityPlateWidth, totalLength, proximityPlateThick], "center": cenX });

  // Cut out hole(s) for proximity sensors
  for (let i = 0; i < proximitySensorHoles; i++) {
    const r = proximitySensorDiameter / 2.0;
    const h = proximityPlateThick;
    const yOfs = proximityEndMargin + r + (i * proximitySensorSpacing);
    const hole = cylinder({ "r": r, "h": h, "center": cenXY });
    proximityPlate = difference(proximityPlate, hole.translate([0, yOfs, 0]))
  }

  return proximityPlate;
}

/**
 * Returns a proximity mount with side rails that lift the sensor
 * up off the ground.
 * 
 * @param raise Total height of mount. Pass proximityPlateThick to create
 * a flat mounting plate instead of a raised one.
 */
function createProximityMount(raise) {
  // Total length of mount
  const totalLength = proximitySensorSpacing * (proximitySensorHoles - 1) + proximitySensorDiameter + 2 * proximityEndMargin;
  const plateZ = raise - proximityPlateThick;
  const railX = (proximityPlateWidth + boltRailWidth) / 2.0;

  // Create plate for attaching proximity sensor
  let proximityPlate = createProximityPlate();

  // Create rail for mounting bolts/zip ties
  let boltRail = cube({ "size": [boltRailWidth, totalLength, raise], "center": cenX });

  // Cut out hole(s) for mounting bolts/zip ties
  for (let i = 0; i < mountingHoles; i++) {
    const r = mountHoleDiameter / 2.0;
    const h = raise;
    const yOfs = mountingHoleEndMargin + r + (i * mountingHoleSpacing);
    const boltHole = cylinder({ "r": r, "h": h, "center": cenXY }).translate([0, yOfs, 0]);
    if (nutSink > 0) {
      const nutZ = raise - nutSink;
      const nutHole = regular_prism(6, nutR, nutSink).translate([0, yOfs, nutZ]);
      boltRail = difference(boltRail, boltHole, nutHole);
    } else {
      boltRail = difference(boltRail, boltHole);
    }
  }
  
  const mount = union(
    boltRail.translate([-railX, 0, 0]),
    proximityPlate.translate([0, 0, plateZ]),
    boltRail.translate([railX, 0, 0])
  );
  return mount;
}

/**
 * Returns a single piece L-bracket mount that orients the mounting
 * bolts perpendicular to the proximity sensor.
 */
function createSideMount() {
  // Total length of mount
  const totalLength = proximitySensorSpacing * (proximitySensorHoles - 1) + proximitySensorDiameter + 2 * proximityEndMargin;
  let railX = (proximityPlateWidth / 2.0) + lThick;

  // Create plate for attaching proximity sensor
  let proximityPlate = createProximityPlate();

  // Create side rail for mounting bolts/zip ties
  const sideH = lWidth + lThick;
  let boltRail = cube({ "size": [lThick, totalLength, sideH]});

  // Cut out hole(s) for mounting L bracket to robot
  const n = Math.floor((lLength - lMountHoleDiameter) / lMountHoleSpacing + 0.5);
  const zOfs = sideH - mountHoleDiameter - mountingHoleEndMargin;
  const lOfs = (lLength - ((n - 1) * lMountHoleSpacing + lMountHoleDiameter)) / 2;

  for (let i = 0; i < n; i++) {
    const r = lMountHoleDiameter / 2.0;
    const h = lThick;
    const yOfs = lOfs + r + (i * lMountHoleSpacing);
    const boltHole = cylinder({ "r": r, "h": h, "center": cenX }).rotateY(90).translate([0, yOfs, zOfs]);
    boltRail = difference(boltRail, boltHole);
  }

  const gusset = createGusset(totalLength, lThick).rotateX(90).translate([lThick, totalLength, proximityPlateThick]);

  // See if we need to extend the sensor out farther
  const sideMountExtend = sideMountCenter - railX;
  if (sideMountExtend > 0) {
    railX += sideMountExtend;
    // See if hole is extended from side
    let extension = cube({ "size": [ sideMountExtend, totalLength, proximityPlateThick] }); //, "center": cenX });
    const mount = union(
      boltRail,
      gusset,
      extension.translate([lThick, 0, 0]),
      proximityPlate.translate([railX, 0, 0])
    );
    return mount;
  }
  
  const mount = union(
    boltRail,
    gusset,
    proximityPlate.translate([railX, 0, 0])
  );
  return mount;
}

/**
 * Main entry point to create the mount.
 */
function main() {

  switch (render) {
    case 0:
      return createProximityMount(boltRailThick);
    case 1:
      return createProximityMount(proximityPlateThick);
    case 2:
      return createL();
    case 3:
      return createBasePlate();
    case 4:
      return createSideMount();
    default:
      return createProximityMount(proximityPlateThick);
  }

}
