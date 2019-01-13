
bolt_diameter = 2.5;
printer_resolution = 0.2;
enlarge_radius = 1;

// Length of bolt/screw that typically extends into material
// (threaded rod below head - except on pan heads in which
// case it is the entire lenth).
bolt_length = 10;
// Radius of the bolt (half the diameter)
bolt_radius = bolt_diameter / 2;
// Radius of circle that contains the corners of the nut
// (typically bolt_radius * 1.8)
nut_radius = 1.8 * bolt_diameter / 2;
nut_height = 0.8 * bolt_diameter;
head_radius = bolt_diameter;
head_height = 0.6 * bolt_diameter;

//translate([10, 10, 10]) rotate([0, 90, 0 ]) boltHole();
boltHoles();

// Simple list comprehension for creating N-gon vertices (from
// built-in FreeCad examples
function ngon(num, r) = 
  [for (i=[0:num-1], a=i*360/num) [ r*cos(a), r*sin(a) ]];

function roundPrinter(size, resCnts) = (floor(size / printer_resolution + resCnts) * printer_resolution);

module boltHole() {
  $fn = 100;
  nutRadius = roundPrinter(nut_radius, 2);
  nutDrill = roundPrinter(nut_height, 1);
  linear_extrude(height = nutDrill) translate([0,0,0]) polygon(ngon(6,   nutRadius));

  holeRadius = roundPrinter(bolt_radius, 2);
  echo(holeRadius);
  holeDrill = roundPrinter(bolt_length - nut_height, 0);
  translate([0, 0, nutDrill]) { cylinder(h = holeDrill, r1 = holeRadius, r2 = holeRadius, center = false); }

  headRadius = roundPrinter(head_radius, 2);
  headDrill = roundPrinter(head_height, 1);
  translate([0,0,nutDrill + holeDrill]) { cylinder(h = headDrill, r1 = headRadius, r2 = headRadius, center = false); }

}

module boltHoles() {
    size = roundPrinter(head_height + bolt_length, 1);
    s25 = roundPrinter(size * .333, 1);
    s75 = roundPrinter(size * .667, 1);
    
    difference() {
        cube(size, center = false);
        translate([s25, s25, 0]) boltHole();
        translate([0, s75, s75]) rotate([0, 90, 0 ]) boltHole();
        translate([s75, 0, s25]) rotate([-90, 0, 0 ]) boltHole();
    }
}

/*
module boltHoles(num = 1, r = 0, z= 0, boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15) {
    for (i=[0:num-1], a=i*360/(num + 2 / num)) {
        translate([r * cos(a), r * sin(a), z]) boltHole(boltDiameter, nutSink, gap, headSink, accuracy);
    }
}
*/
