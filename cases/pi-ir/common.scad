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

//------------------------------------------------------------------
/*

Methods related to creating a housing for RPi Camera Module V2.1
See: https://www.raspberrypi.org/documentation/hardware/camera/rpi-cam-v2_1-dimensions.pdf

*/
//------------------------------------------------------------------

// camera board
camera_board_x = 25;
camera_board_y = 23.9862;
camera_board_z = 0.95;
camera_hole_diameter = 2.2;
camera_hole_to_edge = 2;
camera_hole_x = 21;
camera_hole_y = 12.5;

// camera body
camera_body_x = 8.3;
camera_body_y = 8.3;
camera_body_y_ofs = 10.3;
camera_body_z0 = 2.2;
camera_body_z1 = 4.5;
camera_body_diameter = 7.1;

// camera cable
camera_cable_x = 16;
camera_cable_y = 30;
camera_cable_z = 0.1;

// camera connector
camera_connector_x = 20.8;
camera_connector_y = 5.5;
camera_connector_z = 2.7;

// camera housing
housing_hole_clearance = 0.2;
housing_board_clearance = 0.3;
housing_lid_clearance = 0.4;
housing_cable_clearance = 0.3;
housing_wall_t0 = 6; // thick wall in board cavity
housing_wall_t1 = 2; // thin wall in lid cavity
housing_sides = 10;
housing_rounding = 4;
housing_x = camera_board_x + 2 * (housing_board_clearance + housing_sides);
housing_y = camera_board_y + 2 * (housing_board_clearance + housing_wall_t0);
housing_z = 12;
backside_clearance = 3;
housing_post_z = max(camera_connector_z, backside_clearance);
housing_base_z = 2;

// camera lid
lid_x = housing_x - 2 * (housing_lid_clearance + housing_wall_t1);
lid_y = housing_y - 2 * (housing_lid_clearance + housing_wall_t1);
lid_z_camera = 3.0;
lid_z = lid_z_camera + 1.5;
lid_camera_clearance = 0.4;

// mounting holes
mount_hole_to_edge = 6;
mount_hole_diameter = bolt_hole_diameter;
mount_hole_x = housing_x - (2 * mount_hole_to_edge);
mount_hole_y = housing_y - (2 * mount_hole_to_edge);

//------------------------------------------------------------------
// utility functions

// scaling
pla_shrink = 1/0.999; //~0.1%
abs_shrink = 1/0.995; //~0.5%

// small tweak to avoid differencing artifacts
epsilon = 0.05;

// control the number of facets on cylinders
facet_epsilon = 0.03;
function facets(r) = 180 / acos(1 - (facet_epsilon / r));

// rounded/filleted edges
module inverse() {
  difference() {
    square(1e5, center=true);
    children(0);
  }
}
module rounded(r=1) {
  offset(r=r, $fn=facets(r)) offset(r=-r, $fn=facets(r)) children(0);
}
module filleted(r=1) {
  offset(r=-r, $fn=facets(r)) render() offset(r=r, $fn=facets(r)) children(0);
}

//------------------------------------------------------------------
// camera board

module camera_holes(r, h) {
  dx = camera_hole_x;
  dy = camera_hole_y;
  posn = [[0,0], [0,1], [1,0], [1,1]];
  for (x = posn) {
    translate([x[0] * dx, x[1] * dy, 0])
      cylinder(h=h, r=r, $fn=facets(r));
  }
}

module camera_pcb_holes() {
  r = camera_hole_diameter/2;
  h = camera_board_z + (2 * epsilon);
  x_ofs = camera_hole_to_edge;
  y_ofs = camera_hole_to_edge;
  translate([x_ofs,y_ofs,-epsilon])camera_holes(r,h);
}

module camera_pcb() {
  difference() {
    linear_extrude(height=camera_board_z)
      rounded(r=camera_hole_to_edge)
      square(size=[camera_board_x, camera_board_y]);
    camera_pcb_holes();
  }
}

module camera_body() {
  dx = (camera_board_x - camera_body_x)/2;
  translate([dx,camera_body_y_ofs,camera_board_z]) {
    r = camera_body_diameter/2;
    dx = camera_body_x/2;
    dy = camera_body_y/2;
    cube(size=[camera_body_x,camera_body_y,camera_body_z0]);
    translate([dx,dy,0]) cylinder(h=camera_body_z1, r=r, $fn=facets(r));
  }
}

module camera_cable() {
  x_ofs = (camera_board_x - camera_cable_x)/2;
  y_ofs = camera_board_y - (camera_connector_y/2);
  z_ofs = -camera_connector_z / 2;
  translate([x_ofs,y_ofs,z_ofs])
    cube(size=[camera_cable_x,camera_cable_y,camera_cable_z]);
}

module camera_connector() {
  x_ofs = (camera_board_x - camera_connector_x)/2;
  y_ofs = camera_board_y - camera_connector_y;
  z_ofs = -camera_connector_z;
  translate([x_ofs,y_ofs,z_ofs])
    cube(size=[camera_connector_x,camera_connector_y,camera_connector_z]);
}

module camera_board() {
  x_ofs = -camera_board_x/2;
  y_ofs = housing_board_clearance + housing_wall_t0;
  z_ofs = housing_base_z + housing_post_z;
  translate([x_ofs,y_ofs,z_ofs]) {
    color("DarkGreen") camera_pcb();
    color("DimGray") camera_body();
    color("LightBlue") camera_cable();
    color("SaddleBrown") camera_connector();
  }
}

//------------------------------------------------------------------

module housing_external() {
  linear_extrude(height=housing_z)
    rounded(r=housing_rounding)
    square(size=[housing_x, housing_y]);
}

module housing_cavity() {
  h = housing_z - housing_base_z + epsilon;
  x = camera_board_x + (2 * housing_board_clearance);
  y = camera_board_y + (2 * housing_board_clearance);
  x_ofs = (housing_x - x) / 2;
  y_ofs = (housing_y - y) / 2;
  r = camera_hole_to_edge + housing_board_clearance;
  translate([0,0,housing_base_z])
    linear_extrude(height=h)
    translate([x_ofs,y_ofs])
    rounded(r=r)
    square(size=[x, y]);
}

module supports() {
  r0 = camera_hole_to_edge;
  h0 = housing_post_z + epsilon;
  r1 = (camera_hole_diameter / 2) - housing_hole_clearance;
  h1 = h0 + camera_board_z - epsilon;
  x_ofs = (housing_x - camera_hole_x) / 2;
  y_ofs = housing_wall_t0 + housing_board_clearance + camera_hole_to_edge;
  z_ofs = housing_base_z - epsilon;
  translate([x_ofs,y_ofs,z_ofs]) {
    camera_holes(r0,h0);
    camera_holes(r1,h1);
  }
}

module lid_cavity() {
  h = lid_z + epsilon;
  z_ofs = housing_z - lid_z;
  translate([0,0,z_ofs]) linear_extrude(height=h) {
    x = lid_x + housing_lid_clearance;
    y = lid_y + housing_lid_clearance;
    x_ofs = (housing_x - x) / 2;
    y_ofs = (housing_y - y) / 2;
    r = housing_rounding - housing_wall_t1;
    translate([x_ofs,y_ofs])
      rounded(r=r)
      square(size=[x,y]);
  }
}

module cable_cavity() {
  x = camera_cable_x + (2 * housing_cable_clearance);
  y = ((housing_y - camera_board_y)/2) - housing_board_clearance + (2 * epsilon);
  x_ofs = (housing_x - x) / 2;
  y_ofs = housing_y - y + epsilon;
  z_ofs = housing_base_z + housing_post_z - (camera_connector_z / 2) - housing_cable_clearance;
  translate([x_ofs,y_ofs,z_ofs]) linear_extrude(height=housing_z) {
     square(size=[x,y]);
  }
}

module housing() {
  x_ofs = -housing_x / 2;
  translate([x_ofs, 0, 0]) {
    supports();
    difference() {
      union() {
        housing_external();
      }
      union() {
        housing_cavity();
        lid_cavity();
        cable_cavity();
      }
    }
  }
}

//------------------------------------------------------------------

module lid_top() {
  x = lid_x;
  y = lid_y;
  x_ofs = x / 2;
  y_ofs = (housing_y - y) / 2;
  z_ofs = housing_z - lid_z;
  r = housing_rounding - housing_wall_t1 - housing_lid_clearance;

  translate([-x_ofs,y_ofs,z_ofs]) linear_extrude(height=lid_z) {
    rounded(r=r)
     square(size=[x,y]);
  }
}

module lid_tab() {
  x = camera_cable_x + (2 * (housing_cable_clearance - housing_lid_clearance));
  y = housing_wall_t1 + (housing_wall_t0 / 2);
  z = housing_z - housing_base_z - housing_post_z + (camera_connector_z / 2) - housing_cable_clearance;
  x_ofs = -x/2;
  y_ofs = housing_y - y;
  z_ofs = housing_z - z;
  translate([x_ofs,y_ofs,z_ofs])
    cube(size=[x,y,z]);
}

module lid_rail() {
  x = camera_hole_diameter;
  y = camera_board_y;
  z = housing_z - lid_z - housing_base_z - housing_post_z - camera_board_z + epsilon;
  x_ofs = (camera_hole_x - camera_hole_to_edge) / 2;
  y_ofs = housing_board_clearance + housing_wall_t0;
  z_ofs = housing_base_z + housing_post_z + camera_board_z + epsilon;
  translate([x_ofs,y_ofs,z_ofs])
    cube(size=[x,y,z]);
}

module lid_between_rail_cutout() {
  x = (camera_hole_x - camera_hole_to_edge);
  y = camera_board_y;
  z = lid_z - lid_z_camera;
  x_ofs = - (x / 2);
  y_ofs = housing_board_clearance + housing_wall_t0;
  z_ofs = housing_z - lid_z;
  translate([x_ofs,y_ofs,z_ofs])
    cube(size=[x,y,z]);
}

module lid_rails() {
  lid_rail();
  mirror([1,0,0]) lid_rail();
}

module lid_camera_hole() {
  h = lid_z + (2 * epsilon);
  r = (camera_body_diameter / 2) + lid_camera_clearance;
  y_ofs = housing_wall_t0 + housing_board_clearance + camera_body_y_ofs + (camera_body_y/2);
  z_ofs = housing_z - lid_z - epsilon;
  translate([0,y_ofs,z_ofs])
    cylinder(h=h, r=r, $fn=facets(r));
}

module lid() {
  difference() {
    union() {
      lid_top();
      lid_tab();
      lid_rails();
    }
    lid_between_rail_cutout();
    lid_camera_hole();
  }
}

//------------------------------------------------------------------

module mount_hole_posn(r, h) {
  dx = mount_hole_x;
  dy = mount_hole_y;
  posn = [[0,0], [0,1], [1,0], [1,1]];
  for (x = posn) {
    translate([x[0] * dx, x[1] * dy, 0])
      cylinder(h=h, r=r, $fn=facets(r));
  }
}

module mount_hex_hole_posn(r, h) {
  dx = mount_hole_x;
  dy = mount_hole_y;
  posn = [[0,0], [0,1], [1,0], [1,1]];
  for (x = posn) {
    translate([x[0] * dx, x[1] * dy, 0])
      hex_hole(r, h);
  }
}

module mount_holes() {
  r = mount_hole_diameter / 2;
  h = housing_z + (2 * epsilon);
  x_ofs = mount_hole_x / 2;
  y_ofs = (housing_y - mount_hole_y) / 2;
  translate([-x_ofs,y_ofs,-epsilon])
  mount_hole_posn(r=r, h=h);
  translate([-x_ofs,y_ofs, housing_z - lid_z + plate_thickness])
  mount_hole_posn(r=bolt_head_r, h = lid_z - plate_thickness + epsilon);
  translate([-x_ofs, y_ofs, -epsilon])
  mount_hex_hole_posn(nut_r, (housing_z - lid_z) - plate_thickness);
}

//------------------------------------------------------------------

module back_side() {
    difference() {
        housing();
        mount_holes();
    }
}

module cover() {
    difference() {
        lid();
        mount_holes();
    }
}

module everything() {
  back_side();
  camera_board();
  cover();
}

// How much to raise the 3 prong goPro mount above the base plate (mm).
Extra_Mount_Depth = 3;

// Modules for creating goPro mounts.
//
// Thanks to
// https://www.thingiverse.com/thing:3088912 for providing the building
// blocks of building custom goPro mounts. You can use an 20 mm M5 bolt
// (or longer) and nut for the goPro hinge. You can customize the holes
// in the mounting plate based on the hardware you have.

// Used to create nut hole for M5 nut in 3 prong goPro mount prong.
module nut_hole() {
  rotate([90, 90, 0])
  for(i = [0:(360 / 3):359]) {
    rotate([0, 0, i])
    cube([4.6765, 8.1, 5], center = true);
  }
}

// Single flap (prong) in goPro mount connector.
module flap(Width) {
  rotate([90, 0, 0])
  union()	{
    translate([3.5, (-7.5), 0])
    cube([4 + Extra_Mount_Depth, 15, Width]);

    translate([0, (-7.5), 0])
    cube([7.5 + Extra_Mount_Depth, 4, Width]);

    translate([0, 3.5, 0])
    cube([7.5 + Extra_Mount_Depth, 4, Width]);

    difference() {
      cylinder(h = Width, d = 15);

      translate([0, 0, (-1)])
      cylinder(h = Width + 2, d = 6);
    }
  }
}

// Creates 2 narrow mounting tabs.
module mount2() {
  union() {
    translate([0, 4, 0])
    flap(3);

    translate([0, 10.5, 0])
    flap(3);
  }
}

// Creates full 3 prong connector with hex nut cut out.
module mount3() {
  union() {
    difference() {
      translate([0, (-2.5), 0])
      flap(8);

      translate([0, (-8.5), 0])
      nut_hole();
    }

    mount2();
  }
}

//------------------------------------------------------------------

//everything();
//mount_holes();
//back_side();
//camera_board();
//cover();
//lid_rails();
//lid_between_rail_cutout();
