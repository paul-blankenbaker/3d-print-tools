//include <settings.scad>;
include <common.scad>;

ir_inner_diameter = 18;
ir_inner_protrusions_diameter = 23.5;
ir_outer_protrusions_diameter = 54.5;
ir_outer_diameter = 61.5;
ir_mount_holes_diameter = ir_outer_diameter + 1 - nut_r * 2;

ir_protrusion_protect = 1;
ir_protrusions = 2;
ir_outer_edge = 2;

module ir_base_block() {
  union() {
    ring(plate_diameter / 2, ir_inner_diameter / 2, ir_protrusion_protect);
    translate([0, 0, ir_protrusion_protect]) ring(ir_inner_protrusions_diameter / 2, ir_inner_diameter / 2, ir_protrusions);
    translate([0, 0, ir_protrusion_protect]) ring(plate_diameter / 2, ir_outer_protrusions_diameter / 2, ir_protrusions);
    translate([0, 0, ir_protrusion_protect + ir_protrusions]) ring(plate_diameter / 2, ir_outer_diameter / 2, ir_outer_edge);
  }
}

module ir_holes() {
  hole_r = bolt_hole_diameter / 2;
  head_r = bolt_head_diameter / 2;
  depth = ir_protrusion_protect + ir_protrusions + ir_outer_edge;
  join_r = plate_holes_diameter / 2;

  union() {
    holes(8, ir_mount_holes_diameter / 2, hole_r, depth);
    holes(8, ir_mount_holes_diameter / 2, head_r, bolt_head_depth);
    holes(plate_holes, join_r, hole_r, depth);
    translate([0, 0, 2]) hex_holes(24, join_r, nut_r, depth - plate_thickness);
  }
}

//ir_base_block();
//ir_holes();

$fn = 64;

difference() {
  ir_base_block();
  ir_holes();
}
