/* [Basic] */
//width of label
width = 10;
//length of label
length = 20;
//thickness of label
height = 1.0;
//number of labels
num_labels = 15;

// Size of hole
hole_r = 2.5;

//rounded corners
roundedCorners = 1; //[0:No,1:Yes]

// Width of bottom bar to "grab" the numbers
bottomBar = 4;

//tags split by "~" character
textTags = "6~12~18~24~30~36~42~48~54~60~66~72~78~84~90";
//you can select font name from here https://www.google.com/fonts
textFont = "Open Sans";
textStyle = "Bold";
textSize = 5;
//text extrusion
textHeight = height + 0.5;

/* [Advanced] */
//right border radius
fillet_radius=2;
//distance between labels
textDistance = 5;

border = 2;

/* [Hidden] */
$fn=50;

//Version optimized for Thingiverse customizer
//that does not support array of strings.
//Credits to jepler for string split function!
//https://www.thingiverse.com/groups/openscad/topic:10294
function substr(s, st, en, p="") =
    (st >= en || st >= len(s))
        ? p
        : substr(s, st+1, en, str(p, s[st]));

function split(h, s, p=[]) =
    let(x = search(h, s)) 
    x == []
        ? concat(p, s)
        : let(i=x[0], l=substr(s, 0, i), r=substr(s, i+1, len(s)))
                split(h, r, concat(p, l));
             
	
numColumns = ceil(sqrt(num_labels));
numRows = ceil(num_labels/numColumns);
//echo (numColumns);
//echo (numRows);
for (y=[1:numRows])
    for (x=[1:numColumns])
        if (((y-1)*numColumns + x)<= num_labels) {
            //echo (y); echo (x);
            translate([(x-1)*(length+textDistance),-(y-1)*(width+textDistance),0]) {
                difference() {
                    label();
                    translate([border + hole_r - length / 2, 0, -0.5]) cylinder(height + 1, hole_r, hole_r);
                    translate([(border + hole_r) * 2 - length / 2, -bottomBar/2, -0.5]) cube([length, width, height + 1]);
                };
                translate([length / 2 - border / 2, 0, 0 ]) tag(((y-1)*numColumns + x)-1);
            }
        }


module label()
{
	linear_extrude(height)
	hull()
	if (roundedCorners == 1) {
	    // place circles into corners
	
	    translate([(length/2)-(fillet_radius), (-width/2)+(fillet_radius), 0])
	    circle(r=fillet_radius);
	
	    translate([(length/2)-(fillet_radius), (width/2)-(fillet_radius), 0])
	    circle(r=fillet_radius);
        
        translate([(-length/2)+(fillet_radius), (-width/2)+(fillet_radius), 0])
	    circle(r=fillet_radius);
	
	    translate([(-length/2)+(fillet_radius), (width/2)-(fillet_radius), 0])
	    circle(r=fillet_radius);
	}
    else {
        square(size=[length, width], center=true);
    }
}
splitTextTags = split("~",textTags);
//echo (splitTextTags);
module tag(tagNumber) {
    translate([0, 0, 0 /*height-0.01 */])
        linear_extrude (height=textHeight)
             text(text=splitTextTags[tagNumber], font=str(textFont,":style=",textStyle), size=textSize, halign=             "right", valign="center");
}


