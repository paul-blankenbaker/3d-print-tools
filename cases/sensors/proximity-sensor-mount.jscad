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
 */

// Use calipers to measure outside diameter of proximity
// sensor that needs to pass through the hole and add
// a bit.
const proximitySensorDiameter = 15;

// Use calipers to measure outside diameter of mounting
// bolts and add a bit for clearance.
// const mountHoleDiameter = 2 * 1.525; // M2.5
const mountHoleDiameter = 2 * 1.775; // M3
// const mountHoleDiameter = 2 * 2.325; // M4
// const mountHoleDiameter = 2 * 2.825; // M5

// How many holes and spacing between hole centers for proximity sensor
const proximitySensorHoles = 3;

// How many mount holes for bolts/zip ties on outside
const mountingHoles = 7;

// Use these to set hole spacing and offset from end
const proximitySensorSpacing = 20;
const proximityEndMargin = 5;

// NOTE: If you make it such that the mounting hole
// spacing is not an even multiple of the proximity
// sensor spacing, this will give you more combinations
// of sensor placement
const mountingHoleSpacing = 9;
const mountingHoleEndMargin = 3;

// Width and thickness of plate in middle that proximity sensors goes through
// (make sure it is wide enough for the clamping nut to fit in)
const proximityPlateWidth = 20;
const proximityPlateThick = 3;

// Width and thickness of edge rails that bolts pass through.
// The top of the proximity mounting plate lines up with this,
// so make sure the thickness will leave enough of a gap
// for the sensor to poke through
const boltRailWidth = Math.ceil(mountHoleDiameter * 2) + 1;
const boltRailThick = 12;

// If you want to cut out holes for the nuts on top, set
// nutSink to a positive number (0 disables).
const nutSink = 8;
// const nutSink = 4;

// If you do want counter sunk nuts, you can
// use calipers to measure the width of a nut between
// two flat sides and then add a bit to control
// the size of the hole with the nutWidth parameter.
//const nutWidth = 5.476313972081441; // M2.5
const nutWidth = 5.97631397208144; // M3
//const nutWidth = 7.562916512459885; // M4
//const nutWidth = 8.562916512459886; // M5

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

/**
 * Main entry point to create the mount.
 */
function main() {
  // Total length of mount
  const totalLength = proximitySensorSpacing * (proximitySensorHoles - 1) + proximitySensorDiameter + 2 * proximityEndMargin;
  const cenX = [ true, false, false ];
  const cenXY = [ true, true, false ];
  const plateZ = boltRailThick - proximityPlateThick;
  const railX = (proximityPlateWidth + boltRailWidth) / 2.0;

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

  // Create rail for mounting bolts/zip ties
  let boltRail = cube({ "size": [boltRailWidth, totalLength, boltRailThick], "center": cenX });

  // Cut out hole(s) for mounting bolts/zip ties
  for (let i = 0; i < mountingHoles; i++) {
    const r = mountHoleDiameter / 2.0;
    const h = boltRailThick;
    const yOfs = mountingHoleEndMargin + r + (i * mountingHoleSpacing);
    const boltHole = cylinder({ "r": r, "h": h, "center": cenXY }).translate([0, yOfs, 0]);
    if (nutSink > 0) {
      const nutZ = boltRailThick - nutSink;
      const r = (nutWidth / 2) / Math.cos(30 * Math.PI / 180.0);
      const nutHole = regular_prism(6, r, nutSink).translate([0, yOfs, nutZ]);
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
