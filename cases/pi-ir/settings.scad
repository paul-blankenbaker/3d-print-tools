// Shared OpenScad configuration for building a stacked mounting adapter
// that packages the following devices:
//
// * Top: A IR LED ring light
// * Mid: A IR BandPass filter that allows light through
// * Bot: A Raspberry Pi NoIR camera v2.1 that allows IR light through to sensor
//
// This file contains settings for the mounting hardware

// Diameter (in mm) of your custom mounting hardware (to attach your
// devices together). 3.0 mm works for 2.5M bolts (and probably #4).
bolt_hole_diameter = 3.0;

// The diameter for any counter sunk holes for bolt heads
bolt_head_diameter = 5.25;

// The depth to counter sink holes for bolt heads
bolt_head_depth = 2.5;

// The width measured using calipers across two flat edges plus
// some room depending on your printer (maybe 0.25 to 0.5)
nut_width = 5.25;

// The minimum depth to counter sink a hex hole for a nut
nut_depth = 2.25;


plate_diameter = 78;
plate_holes = 24;
plate_holes_diameter = 70;

// The minimum acceptable plate thickness (in mm) you want
// when two plates come together to be bolted.
plate_thickness = 1.5;

// How many rotated positions do you want for your mounting holes (integer).
num_angles = 4;

// Detail to use when drawing circles/arcs (higher values look more like
// circles but take longer to render)
$fn = 16;
