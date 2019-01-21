//include <settings.scad>;
include <common.scad>;

filter_lens_hole_diameter = 30;
filter_outer_diameter = 55.25;

filter_protect = 1;
filter_depth = 6.75;

module band_filter_base_block() {
  union() {
    ring(plate_diameter / 2, filter_lens_hole_diameter / 2, filter_protect);
    translate([0, 0, filter_protect]) ring(plate_diameter / 2,filter_outer_diameter / 2, filter_depth);
  }
}

module band_filter_holes() {
  hole_r = bolt_hole_diameter / 2;
  head_r = bolt_head_diameter / 2;
  depth = filter_protect + filter_depth;
  join_r = plate_holes_diameter / 2;
  countersink = depth - plate_thickness;

  union() {
    holes(plate_holes, join_r, hole_r, depth);
    holes(12, join_r, head_r, countersink);
  }
}

$fn = 64;

difference() {
  band_filter_base_block();
  band_filter_holes();
}
