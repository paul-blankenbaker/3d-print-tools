
//translate([10, 10, 0]) boltHole();
boltHoles(num = 8, r = 10, z= 0, boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15);

//boltHoles(num = 4, r = 5, z= 0, boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15);

/*
translate([2, 2, 0]) cylinder(20, 0.5);
translate([5, 5, 0]) boltHole(boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.0);

translate([5, -5, 0]) boltHole(boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.075);

translate([-5, -5, 0]) boltHole(boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15);

translate([-5, 5, 0]) boltHole(boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.225);
*/

// Simple list comprehension for creating N-gon vertices (from
// built-in FreeCad examples
function ngon(num, r) = 
  [for (i=[0:num-1], a=i*360/num) [ r*cos(a), r*sin(a) ]];

module boltHole(boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15) {
  holeRadius = boltDiameter / 2;
  headRadius = 2 * holeRadius;
  nutRadius = 2 * holeRadius / cos(30);
      
  nutDrill = nutRadius + accuracy / 2;
  linear_extrude(height = nutSink) translate([0,0,0]) polygon(ngon(6, nutDrill));

  holeDrill = holeRadius + accuracy / 2;
  translate([0,0, nutSink]) { cylinder(h = gap, r1 = holeDrill, r2 = holeDrill, center = false); }

  headDrill = headRadius + accuracy / 2;
  translate([0,0,nutSink + gap]) { cylinder(h = headSink, r1 = headDrill, r2 = headDrill, center = false); }

}

module boltHoles(num = 1, r = 0, z= 0, boltDiameter = 2.5, nutSink = 3, gap = 4, headSink = 10, accuracy = 0.15) {
    for (i=[0:num-1], a=i*360/(num + 2 / num)) {
        translate([r * cos(a), r * sin(a), z]) boltHole(boltDiameter, nutSink, gap, headSink, accuracy);
    }
}

