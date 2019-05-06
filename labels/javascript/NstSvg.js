/**
 * NOTE: This module comes from the Network Security Toolkit project
 * (https://www.networksecuritytoolkit.org/ as has a GPLv2 license.
 */

/**
 * Class for working with dynamic SVG objects you create on the fly.
 *
 * This class is designed to facilitate the creation of SVG objects on the
 * fly. It allows you to:
 *
 * - Construct a SVG object.
 * - Create SVG components (lines, circles, groups, etc).
 * - Append SVG components.
 * 
 * You will find that many of the methods accepts a single parameter
 * of type "params". This is a associative array of attributes to
 * apply to each object at construction corresponding to the object
 * type being created. For example when creating a rectangle, you
 * would want to include the (x, y, width, and height) attributes in
 * your params and maybe some of the other optional parameters (like
 * id, rx, stroke, fill, etc). Refer to:
 * http://www.w3.org/TR/SVG/shapes.html for a list of parameters
 * recognized by each shape type.
 *
 *   params - Optional - An associative array SVG attributes.
 *
 *   svgroot - Optional - A preexisting SVG object.
 *
 * The following is a simple example of creating a circle and appending
 * it to the bottom of your document (cut/paste into NstConsole):

var drawing = new NstSvg({
  // Following allows us to set initial dimensions and drawing space
  width: "5in", height: "5in", viewBox: "-100 -100 200 200"
});

drawing.appendElement("circle", {
  cx: 0, cy: 0, r: 75,
  fill: "#a05050", stroke: "#5050a0", "stroke-width": 2
});

drawing.appendElement("rect", {
  x: -50, y: -50, width: 120, height: 60, rx: 10,
  fill: "#5050a0", stroke: "#50a050", "stroke-width": 4
});

// Show in NST Console or append to document
NstConsole.append(drawing.getWidget());
//document.body.appendChild(drawing.getWidget());

 * In addition to building through the process of using components, you
 * can use the createDrawing method to create SVG renderings using JSON like
 * definitions:

// Create a instance with dimensions/viewport settings
var drawing = new NstSvg({
  width: "6in",  height: "4in", viewBox: "0 0 1200 800"
});

var cparams = { cx: 50, cy: 50, r: 50,
  fill: "#a05050", stroke: "#5050a0", "stroke-width": 2 };

// A SVG drawing using JSON mark up
jsonDrawing = [
{
  e: "g",       // Required SVG element (g, circle, polyline, ...)
  a: { },       // Optional attributes for element 
  c: [          // Optional array of children for element
    { e: "circle", a: cparams },
    { e: "polyline",
      a: {
        stroke: "#008000", "stroke-width": 5,
        points: "50,375 150,375 150,325 250,325 250,375 350,375" +
          " 350,250 450,250 450,375 550,375 550,175 650,175 650,375 750,375" + 
          " 750,100 850,100 850,375 950,375 950,25 1050,25 1050,375 1150,375"
      }
    }
  ]
},
{
  // Second group translated from first
  e: "g",
  a: { transform: "translate(600, 400)" },
  c: [
    { e: "circle", a: cparams },
    { e: "polygon",
      a: {
        fill: "#f040f0", stroke: "#408000", "stroke-width": 5,
        points: "350,75  379,161 469,161 397,215" +
                " 423,301 350,250 277,301 303,215 231,161 321,161"
      }
    }
  ]
}
];

// Convert JSON drawing to SVG and append
drawing.appendDrawing(jsonDrawing);

// Show in NST Console or append to document
NstConsole.append(drawing.getWidget(), "#ffffff");
//document.body.appendChild(drawing.getWidget());

 *
 */

function NstSvg(params, svgroot) {
  this._Svg = svgroot ? svgroot : document.createElementNS(NstSvg.SVG_NAMESPACE, "svg:svg");
  this.applyAttributes(this._Svg, {
    version: "1.1"
  });
  this.applyAttributes(this._Svg, params);
}

// Constants
NstSvg.SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Returns the SVG widget that can be inserted into a DOM document.
 */

NstSvg.prototype.getWidget = function() {
  return this._Svg;
}

/**
 * Appends a SVG component to this SVG object.
 *
 * so - A SVG object typically generated using one of the "create" methods.
 */

NstSvg.prototype.appendChild = function(so) {
  this._Svg.appendChild(so);
}

/**
 * Inserts an SVG component to this SVG Document before a reference SVG object (element).
 *
 * so - A SVG object typically generated using one of the "create" methods.
 *
 * refso - The Reference SVG object to Insert this SVG object (so) Before.
 */

NstSvg.prototype.insertBefore = function(so, refso) {
  this._Svg.insertBefore(so, refso);
}

/**
 * Applies a associative array of attributes to a SVG elemenet.
 *
 * e - The SVG element to update the attributes on.
 *
 * a - Associative array of attributes to set (key/value
 * pairs). NOTE: A null value will be intrepretted as meaning you want
 * to remove a SVG attribute.
 *
 * ns - Name Space - Defaults to 'null' if ommitted.
 *
 * For example:
 *

var ns = new NstSvg({ width: "3in", height: "3in", viewBox: "0 0 20 20" });
var r = ns.appendElement("rect", { x: 0, y: 2, width: 10, height: 5, rx: 5 });
ns.applyAttributes(r, {
  fill: "red",  // Set fill color
  x: 2,         // shift left
  rx: null      // Remove rounded corners attribute
});
NstConsole.append(ns.getWidget());

*/

NstSvg.prototype.applyAttributes = function(e, a, ns) {
  if (a) {
    if (ns == undefined) {
      ns = null;
    }

    // Go through all attributes provided
    for (var attr in a) {
      var val = a[attr];

      if ((val == undefined) && (val == null)) {
	// If null/undefined value, remove attribute
	e.removeAttributeNS(ns, attr);
      } else {
	// Set new value for attribute
	e.setAttributeNS(ns, attr, val);
      }
    }
  }
}

/**
 * Creates a SVG object <svg:TYPE>.
 *
 * e - The SVG element type to create ("g", "circle", etc).
 * a - Optional set of attributes to apply to the element.
 *
 * return A SVG object which can be appended using NstSvg.appendChild().
 */

NstSvg.prototype.createElement = function(e, a) {
  // Create appropriate SVG element
  var so = document.createElementNS(NstSvg.SVG_NAMESPACE, "svg:" + e);
  // Apply any user provided attributes
  this.applyAttributes(so, a);
  return so;
}

/**
 * Creates and appends a new SVG object <svg:TYPE> to the current collection.
 *
 * e - The SVG element type to create ("g", "circle", etc).
 * a - Optional set of attributes to apply to the element.
 *
 * return A SVG object which was created and appended.
 */

NstSvg.prototype.appendElement = function(e, a) {
  var so = this.createElement(e, a);
  this.appendChild(so);
  return so;
}

/**
 * Creates a entire an SVG "drawing" using JSON mark up.
 *
 * This method accepts a single JavaScript object
 * having the following form:
 *
 * {
 *   e: "TYPE",         // Required: Type of SVG element ("g", "circle", ...)
 *   a: { ATTRIBUTES }, // Optional: Attributes for SVG element
 *   c: [ DRAWING ],    // Optional: Array of children (see createDrawing())
 * }
 *
 * See NstSvg class comment for cut/paste example.
 *
 * part - The JSON object having a "e" and optional "a" and
 * "c" attribute used to build the drawing (if "c" is
 * provided, your drawing can get pretty big - think XML).
 *
 * return A SVG object which can be appended using NstSvg.appendChild().
 */

NstSvg.prototype.createPart = function(part) {
  var so = this.createElement(part.e, part.a);
  if (part.c) {
    so.appendChild(this.createDrawing(part.c));
  }
  return so;
}

/**
 * Creates and appends an entire a SVG "drawing" using JSON mark up.
 *
 * This method is just like the createPart() method, except that
 * it automatically appends the part to the current drawing.
 *
 * See NstSvg class comment for cut/paste example.
 *
 * part - The JSON object having a "e" and optional "a" and
 * "c" attribute used to build the drawing (if "c" is
 * provided, your drawing can get pretty big - think XML).
 *
 * return A SVG object which was created and appended.
 */

NstSvg.prototype.appendPart = function(part) {
  var so = this.createPart(part);
  this.appendChild(so);
  return so;
}

/**
 * Creates a entire drawing from a array of JavaScript objects.
 *
 * This method allows you to define an array of JavaScript objects
 * where each entry has the form:
 *
 * {
 *   e: "TYPE",         // Required: Type of SVG element ("g", "circle", ...)
 *   a: { ATTRIBUTES }, // Optional: Attributes for SVG element
 *   c: [ DRAWING ],    // Optional: Array of children (see createDrawing())
 * }
 *
 * drawing - An array of 1 or more part elements.
 *
 * return A SVG element that was created and can be appended.
 */

NstSvg.prototype.createDrawing = function(drawing) {
  var n = drawing.length;
  if (n == 1) {
    return this.createPart(drawing);
  }

  var so = this.createElement("g");
  for (var i = 0; i < drawing.length; i++) {
    so.appendChild(this.createPart(drawing[i]));
  }
  return so;
}

/**
 * Create and append an entire drawing from a array of JavaScript objects.
 *
 * This method is just like the createDrawing() method except that it
 * automatically appends the resulting SVG object.
 *
 * drawing - An array of 1 or more part elements.
 */

NstSvg.prototype.appendDrawing = function(drawing) {
  for (var i = 0; i < drawing.length; i++) {
    this.appendChild(this.createPart(drawing[i]));
  }
}
