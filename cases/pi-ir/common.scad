// Shared OpenScad code for building a stacked mounting adapter
// that packages the following devices:
//
// * Top: A IR LED ring light
// * Mid: A IR BandPass filter that allows light through
// * Bot: A Raspberry Pi NoIR camera v2.1 that allows IR light through to sensor

include <settings.scad>;

bolt_hole_r = bolt_hole_diameter / 2;
bolt_head_r = bolt_head_diameter / 2;
nut_r = (nut_width / 2) / cos(30);

// Used to create a triangular gusset
module gusset(w, t) {
  sideView = polygon([[0, 0], [w, 0], [0, w]]);
  linear_extrude(height = t, center = false) polygon(points = [[0, 0], [w, 0], [0, w]]);
}

module ring(out_radius, in_radius, thick) {
  difference() {
    cylinder(thick, out_radius, out_radius);
    cylinder(thick, in_radius, in_radius);
  }
}

module hex_hole(holeRadius, thick) {
  r = holeRadius;
  big = r * cos(30);
  small = r * sin(30);

  linear_extrude(height = thick, center = false) polygon(points = [[big, small], [0, r], [-big, small], [-big, -small], [0, -r], [big, -small]]);
}

module hex_holes(numAngles, ringRadius, holeRadius, thick) {
  angles=[ for (i = [0:numAngles]) i*(360/numAngles) ];
  for (a = angles) {
    x = sin(a) * ringRadius;
    y = cos(a) * ringRadius;
    translate([x, y, 0]) rotate([0, 0, a]) hex_hole(holeRadius, thick);
  }
}

module holes(numAngles, ringRadius, holeRadius, thick) {
  angles=[ for (i = [0:numAngles]) i*(360/numAngles) ];
  for (a = angles) {
    x = sin(a) * ringRadius;
    y = cos(a) * ringRadius;
    translate([x, y, 0])
    cylinder(thick, holeRadius, holeRadius);
  }
}

