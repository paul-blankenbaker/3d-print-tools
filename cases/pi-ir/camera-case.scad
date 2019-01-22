//
// The back side of the camera enclosure.
//

include <common.scad>;

r_out = plate_diameter / 2;
r_in = r_out - (bolt_head_diameter * 1.5);
cable_hole_width = camera_cable_x + 1; //((housing_y - camera_board_y)/2); // - housing_board_clearance + (2 * epsilon);
cable_hole_z = 1;

m5_hole = 5.5;
mount_tab_thick = 3;
mount_tab_in_r = r_out;
mount_tab_out_r = mount_tab_in_r + m5_hole * 2;


module ring_holes() {
  hole_r = bolt_hole_diameter / 2;
  head_r = bolt_head_diameter / 2;
  depth = housing_z;
  join_r = plate_holes_diameter / 2;
  countersink = depth - plate_thickness;

  union() {
    holes(plate_holes, join_r, hole_r, depth);
    holes(12, join_r, head_r, countersink);
  }
}

module ring_mount() {
  ring(r_out, r_in, housing_z);
}

module flat_fill() {
    cut_x = housing_x - housing_sides / 2;
    cut_y = housing_y - housing_sides / 2;
    difference() {
        cylinder(housing_base_z, r_in, r_in);
        cube([cut_x, cut_y, housing_z], center=true);
    }
}

module mount_tabs() {
    difference() {
      ring(mount_tab_out_r, mount_tab_in_r, mount_tab_thick);
      holes(24, mount_tab_in_r + m5_hole, m5_hole / 2, mount_tab_thick);
    }
}

module cable_hole() {
    cube([cable_hole_width, plate_diameter * 0.3, cable_hole_z]);
}

module goPro_mount() {
   gusset_len = 7.5;
   gusset_w = 3 * 2 + 3.5;
   gusset_h = 15 - mount_tab_thick;
   translate([-gusset_w / 2, 0, mount_tab_thick]) rotate([0, -90, 180]) gusset(gusset_h, gusset_w);
   translate([-(4 + 3.5 / 2), Extra_Mount_Depth + gusset_len, 7.5]) rotate([0, 0, -90]) mount2();
   translate([-gusset_w / 2, -(gusset_w + Extra_Mount_Depth), 0]) cube([gusset_w, gusset_w + Extra_Mount_Depth, housing_z * 0.75], center=false);
}

module assembly() {
difference() {
  union() {
    translate([0, -housing_y / 2, 0]) back_side();
    flat_fill();
    ring_mount();
    mount_tabs();
    translate([0, mount_tab_out_r, 0]) goPro_mount();
  }
  translate([- (cable_hole_width / 2), housing_y / 2, housing_z - cable_hole_z]) cable_hole();
  ring_holes();
}
}
//* GoPro Mount - 3 flap w/nut hole
//translate([0, 0, 7.5 + Extra_Mount_Depth]) rotate([0, 90, 0]) mount2();
//goPro_mount();
$fn = 64;
assembly();
