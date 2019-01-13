$fa = 2;
$fs = 0.25;
Extra_Mount_Depth = 3;


bolt_hole_diameter = 3;
bolt_hole_cnt = 24;
plate_thick = 3;

bolt_hole_radius = 18;
plate_radius = bolt_hole_radius + bolt_hole_diameter * 1.5;
bolt_hole_r = bolt_hole_diameter / 2;

module base_plate() {
    r = plate_radius;
    numAngles = bolt_hole_cnt; //360 / min(90, rotation_angle);
    angles=[ for (i = [0:numAngles]) i*(360/numAngles) ];
    rotation_ofs = 0;
    
    translate([0, 0, -plate_thick]) difference() {
        union() {
          cylinder(plate_thick, r, r);
        }
        for (a = angles) {
          x = sin(a + rotation_ofs) * bolt_hole_radius;
          y = cos(a + rotation_ofs) * bolt_hole_radius;
          translate([x, y, 0])
          cylinder(plate_thick, bolt_hole_r, bolt_hole_r);
        }
    }  
}

module nut_hole()
{
	rotate([0, 90, 0]) // (Un)comment to rotate nut hole
	rotate([90, 0, 0])
		for(i = [0:(360 / 3):359])
		{
			rotate([0, 0, i])
				cube([4.6765, 8.1, 5], center = true);
		}
}

module flap(Width)
{
	rotate([90, 0, 0])
	union()
	{
		translate([3.5, (-7.5), 0])
			cube([4 + Extra_Mount_Depth, 15, Width]);


		translate([0, (-7.5), 0])
			cube([7.5 + Extra_Mount_Depth, 4, Width]);

		translate([0, 3.5, 0])
			cube([7.5 + Extra_Mount_Depth, 4, Width]);

		difference()
		{
			cylinder(h = Width, d = 15);

			translate([0, 0, (-1)])
				cylinder(h = Width + 2, d = 6);
		}
	}
}

module mount2()
{
	union()
	{

			translate([0, 4, 0])
		flap(3);

		translate([0, 10.5, 0])
		flap(3);
	}
}

module mount3()
{
	union()
	{
		difference()
		{
			translate([0, (-2.5), 0])
				flap(8);

			translate([0, (-8.5), 0])
				nut_hole();
		}

		mount2();
	}
}

/* GoPro Mount - 2 flap no nut hole
translate([0, 0, 10.5])
	rotate([0, 90, 0])
		mount2();
// */

//* GoPro Mount - 3 flap w/nut hole
translate([0, 0, 10.5])
	rotate([0, 90, 0])
		mount3();
base_plate();
// */