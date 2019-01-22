//
// Quick rendering that you can quickly print to double check your
// settings for nut, bolt heads and bolt holes used to build
// the IR + BandFilter + PI Camera casing
//

include <common.scad>;

//
// Create a cylinder with a hole drilled through it
// and a cylinder cutout for the head and hex cut out for the nut.
//
// h - Height of cylinder to create
// br - Bolt radius (to drill through hole)
// bhr - Bolt head radius for counter-sinking bolt head
// bhd - Depth of counter sink for bolt head
// nr - Radius of nut (to corner of hex cut out)
// nd - Depth to counter sink nut
module testHole(h, br, bhr, bhd, nr, nd) {
    out_r = max(nr, bhr) + 2;
    difference() {
        cylinder(h, out_r, out_r);
        cylinder(h, br, br);
        translate([0, 0, h - bhd]) cylinder(bhd, bhr, bhr);
        hex_hole(nr, nd);
    }
}

// Creates a test hole using bolt settings from settings.scad
// Hole will have:
// - A counter sink for the bolt head
// - A bolt hole for the shaft of the bolt (will be bolt_depth long)
// - A counter sunk hex hole for the nut
/*
module testHole(bolt_depth) {
    $fn = 64;
    difference() {
        cylinder(nut_depth + bolt_depth + bolt_head_depth, nut_r + 2, nut_r + 2);
        cylinder(nut_depth + bolt_depth + bolt_head_depth, bolt_hole_r, bolt_hole_r);
        translate([0, 0, nut_depth + bolt_depth]) cylinder(bolt_head_depth, bolt_head_r, bolt_head_r);
        hex_hole(nut_r, nut_depth);
    }
}
*/

// Increase resolution
$fn = 64;
// Create small test hole to put bolt and nut in
//h = nut_depth + bolt_head_depth + 2.5;
//testHole(h, bolt_hole_r, bolt_head_r, bolt_head_depth, nut_r, nut_depth);

m5_hole_diameter = 5.5;
m5_head_diameter = 10.2;
m5_head_depth = 3.5;
m5_nut_size = 8.4;
m5_nut_depth = 5;

m5_hole_r = m5_hole_diameter / 2;
m5_head_r = m5_head_diameter / 2;
m5_nut_r = (m5_nut_size / 2) / cos(30);

h = m5_nut_depth + m5_head_depth + 2.5;
testHole(h, m5_hole_r, m5_head_r, m5_head_depth, m5_nut_r, m5_nut_depth);
