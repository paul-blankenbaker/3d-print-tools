// Adapter that allows you to bolt a case with 4 holes to a flat ring
// with a goPro adapter at the other end. Defaults are for a Raspberry Pi
// camera case (https://www.thingiverse.com/thing:1707484).

// How high (in mm) the bottom of the mounting
// plate ring should be from the goPro mount.
vertical_gap = 25; // [0:300]

// Diameter (in mm) of your custom mounting hardware (to attach your
// device to the ring). 3.0 mm works for 2.5M bolts (and probably #4).
bolt_diameter = 3.0;

// The width between mounting holes in the object you will attach to the ring (in mm).
bolt_hole_width = 33;

// The height between mounting holes in the object you will attach to the ring (in mm).
bolt_hole_height = 25;

// How thick (in mm) you want the mounting plate ring.
plate_thickness = 3;

// How many rotated positions do you want for your mounting holes (integer).
num_angles = 4;

// Detail to module borrowed from thingiverse//
$fn = 50;

// Thickness of goPro fingers (in mm). You should not need to change from 3.0.
goPro_thickness2 = 3;

// Thickness of gap between each goPro finger (3.5 mm).
goPro_thickness3 = 3.5;

// Hole for goPro bolt to pass through (mm)
goPro_bolt_hole_diameter = 5.5;

// How large the goPro mount outside diameter is (mm).
goPro_side_height = 15;

// Total width of the goPro finger extension.
goPro_width2 = goPro_thickness2 * 2 + goPro_thickness3;

// For bolt hole spacing on circular plate
bolt_hole_space = sqrt(bolt_hole_width * bolt_hole_width / 4 + bolt_hole_height * bolt_hole_height / 4);
bolt_hole_r = bolt_diameter / 2;
plate_diameter = bolt_hole_r * 3 + bolt_hole_space;

// Offset of first rotation
rotation_ofs = 90 + atan(bolt_hole_height / bolt_hole_width);

// Used to create a triangular gusset
module gusset(w, t) {
  sideView = polygon([[0, 0], [w, 0], [0, w]]);
  linear_extrude(height = t, center = false) polygon(points = [[0, 0], [w, 0], [0, w]]);
}

// Creates the circular mounting plate with 4 mouting holes and an extension.
module mount_plate() {
  r = plate_diameter;
  r_cutout = r - (bolt_hole_r * 6);
  numAngles = num_angles * 2;
  angles=[ for (i = [0:numAngles]) i*(360/numAngles) ];
    
  difference() {
    union() {
      cylinder(plate_thickness, r, r);
      translate([ -goPro_width2 / 2, r / 2, 0]) cube([goPro_width2, vertical_gap + r / 2, plate_thickness ]);
    }
    cylinder(plate_thickness, r_cutout, r_cutout);
    for (a = angles) {
      x = sin(a + rotation_ofs) * bolt_hole_space;
      y = cos(a + rotation_ofs) * bolt_hole_space;
      translate([x, y, 0])
      cylinder(plate_thickness, bolt_hole_r, bolt_hole_r);
      translate([x, -y, 0])
      cylinder(plate_thickness, bolt_hole_r, bolt_hole_r);
    }
  }
}

// 2 Prong goPro connector
module GoPro_Connection() {
  h = 10;
  sh = goPro_side_height;
  sr = sh / 2;
  iThick = goPro_thickness2;
  br = goPro_bolt_hole_diameter / 2;
  
  gt = goPro_thickness2 * 2 + goPro_thickness3;
  gw = max(0, min(sh - iThick, vertical_gap - iThick));
  
  translate([-goPro_width2 / 2, 0, 0]) {
    difference() {
      // tabs
      union()	{
        // tab1
	cube([iThick,h,sh]);
	translate([0,h,sr]) rotate([90,0,90]) cylinder(iThick,sr,sr);
	
	// gap between two tabs
	translate([6.5,0,0]) {
          // tab2
	  cube([iThick,h,sh]);
	  translate([0,h,sr]) rotate([90,0,90]) cylinder(iThick,sr,sr);
	}
        
        // top plate
        translate ([0, -plate_thickness, 0]) cube([goPro_width2, plate_thickness, sh]);

        // gusset
        translate([ gt, -iThick, iThick]) rotate([90,0,270]) gusset(gw, gt);
      }

      // bolt hole
      translate([-goPro_width2 * 2, h, sr]) rotate([0,90,0]) cylinder(goPro_width2 * 4, br, br);
    }
  }
}

// Join mounting plate with goPro connector
union() {
  translate([0, -(vertical_gap + plate_diameter), 0]) mount_plate();
  GoPro_Connection();
}
