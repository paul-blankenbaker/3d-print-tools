//
// Quick rendering that you can quickly print to double check your
// settings for nut, bolt heads and bolt holes used to build
// the IR + BandFilter + PI Camera casing
//

include <common.scad>;

// Creates a test hole using bolt settings from settings.scad
// Hole will have:
// - A counter sink for the bolt head
// - A bolt hole for the shaft of the bolt (will be bolt_depth long)
// - A counter sunk hex hole for the nut
module testHole(bolt_depth) {
    $fn = 64;
    difference() {
        cylinder(nut_depth + bolt_depth + bolt_head_depth, nut_r + 2, nut_r + 2);
        cylinder(nut_depth + bolt_depth + bolt_head_depth, bolt_hole_r, bolt_hole_r);
        translate([0, 0, nut_depth + bolt_depth]) cylinder(bolt_head_depth, bolt_head_r, bolt_head_r);
        hex_hole(nut_r, nut_depth);
    }
}

// Increase resolution
$fn = 64;
// Create small test hole to put bolt and nut in
testHole(2);
