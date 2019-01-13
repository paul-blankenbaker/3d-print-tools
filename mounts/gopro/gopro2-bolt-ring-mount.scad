//DBPower-4K//
//action-cam mount//
//camera case//
/*
translate([0, 0, 5,])
difference(){
difference(){
cube([66, 48, 13, ], center=true );
cube([46, 30, 13, ], center=true );
}
translate([0, 0, 3,])
cube([60, 41, 13, ], center=true );
//shutter button//
 translate([20.5, -18, 9,])
rotate([90, 0, 0]) {   
   cylinder(h=11, d=20, $fn=30 );}
   //side buttons//
   translate([33, 0, 3,])
cube([10, 36, 10, ], center=true );
}
*/

//hold in clip//
/*
difference(){
translate([0, -21, 20,])
difference(){
cube([22, 6, 19, ], center=true );
    translate([0, 2, -2,])
cube([22, 3, 15, ], center=true );
    
} 

translate([-11, -18, 28,])
rotate([0, 90, 0]) {   
   cylinder(h=22, d=6, $fn=3 );}
   
    translate([-11, -16, 25.5,]) 
  rotate([0, 0, 0]) { 
    cylinder(h=5, d=16, $fn=4 );}
}
*/

// How high (in mm) the bottom of the mounting
// plate ring should be from the goPro mount 
vertical_gap = 25;

// Diameter (in mm) of your custom mounting hardware (to attach your
// device to the ring). 3.0 works for 2.5M bolts (and probably #4).
bolt_diameter = 3;

// Radius (in mm) to place holes in mounting plate ring
// to attach your device to
bolt_hole_width = 33;
bolt_hole_height = 25;

// How thick (in mm) you want the mounting plate ring
plate_thickness = 3;

// What step size do you want for rotating camera (90 is
// max size and results in 4 mounting points
num_angles = 4;

//module borrowed from thingiverse//
$fn = 50;

//
goPro_thickness2 = 3;
goPro_thickness3 = 3.5;

// Hole for goPro bolt to pass through (mm)
goPro_bolt_hole_diameter = 5.5;

// How large the goPro mount outside diameter is (mm)
goPro_side_height = 15;

goPro_width2 = goPro_thickness2 * 2 + goPro_thickness3;

// For bolt hole spacing on circular plate
bolt_hole_space = sqrt(bolt_hole_width * bolt_hole_width / 4 + bolt_hole_height * bolt_hole_height / 4);
bolt_hole_r = bolt_diameter / 2;
plate_diameter = bolt_hole_r * 3 + bolt_hole_space;

// Offset of first rotation
rotation_ofs = 90 + atan(bolt_hole_height / bolt_hole_width);

module mount_plate() {
    r = plate_diameter;
    r_cutout = r - (bolt_hole_r * 6);
    numAngles = num_angles * 2; //360 / min(90, rotation_angle);
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


module GoPro_Connection() {
    h = 10;
    sh = goPro_side_height;
    sr = sh / 2;
    iThick = goPro_thickness2;
    br = goPro_bolt_hole_diameter / 2;
    
	translate([-goPro_width2 / 2, 0, 0])
	{
		difference()
		{
			// tabs
			union()
			{
                //tab1//
				cube([iThick,h,sh]);
				translate([0,h,sr]) rotate([90,0,90]) cylinder(iThick,sr,sr);
		
				// note: center tab is slightly larger the the other two tabs
                
				translate([6.5,0,0])
				{
					cube([iThick,h,sh]);
					translate([0,h,sr]) rotate([90,0,90]) cylinder(iThick,sr,sr);
				}
                
/*
				translate([12.8,0,0])
				{
					cube([3,10,10]);
					translate([0,10,5]) rotate([90,0,90]) cylinder(3,5,5);
				}
                */
                
                translate ([0, -plate_thickness, 0]) cube([goPro_width2, plate_thickness, sh]);
			}

			// bolt hole
			translate([-goPro_width2 * 2, h, sr]) rotate([0,90,0]) cylinder(goPro_width2 * 4, br, br);
		}
	}
}

union() {
translate([0, -(vertical_gap + plate_diameter), 0]) mount_plate();
GoPro_Connection();
}






