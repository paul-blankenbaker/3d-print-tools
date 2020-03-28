/**
 * Module to generate simple labels that are precisely sized and easy
 * to cut out.
 */

class Labels {
  static getOption(opts, key, defVal) {
    let val = undefined;
    if ((typeof(opts) === "object") && (key != undefined)) {
      val = opts[key];
    }
    if (val === undefined) {
      val = defVal;
    }
    return val;
  }

  static getNumber(opts, key, defVal) {
    let val = Labels.getOption(opts, key, defVal);
    if (typeof(val) !== "number") {
      val = defVal;
    }
    return val;
  }

  static getBoolean(opts, key, defVal) {
    let val = Labels.getOption(opts, key, defVal);
    if (typeof(val) !== "boolean") {
      val = defVal;
    }
    return val;
  }

  static createElement(type, textContent, className) {
    const widget = document.createElement(type);
    if (textContent !== undefined) {
      widget.appendChild(document.createTextNode(textContent.toString()));
    }
    widget.classList.add((className == undefined) ? "Labels" : className);
    return widget;
  }

  static createCheckBox(defVal) {
    const widget = Labels.createElement("input");
    widget.type = "checkbox";
    widget.checked = (defVal == true);
    return widget;
  }

  static createFloatInput(defVal, minVal, maxVal) {
    const widget = Labels.createElement("input");
    if (defVal != undefined) {
      widget.value = defVal;
    }
    widget.type = "number";
    widget.min = parseInt(minVal);
    widget.max = parseInt(maxVal);

    if (isNaN(widget.min)) {
      widget.min = Number.MIN_VALUE;
    }
    if (isNaN(widget.max)) {
      widget.max = Number.MAX_VALUE;
    }

    widget.addEventListener("input", function() {
      const strVal = widget.value;
      let good = !isNaN(strVal);
      if (good) {
        let val = parseFloat(strVal);
        // If min/max is NaN (not set), comparison returns false
        if (val < widget.min || val > widget.max) {
          good = false;
        }
      }
      if (good) {
        widget.classList.remove("bad");
      } else {
        widget.classList.add("bad");
      }
    });
    return widget;
  }

  static createIntegerInput(defVal, minVal, maxVal) {
    const widget = Labels.createElement("input");
    if (defVal != undefined) {
      widget.value = defVal;
    }
    widget.type = "number";
    widget._MinVal = parseInt(minVal);
    widget._MaxVal = parseInt(maxVal);

    if (isNaN(widget._MinVal)) {
      widget._MinVal = Number.MIN_SAFE_INTEGER;
    }
    if (isNaN(widget._MaxVal)) {
      widget._MaxVal = Number.MIN_SAFE_INTEGER;
    }

    widget.addEventListener("input", function() {
      const strVal = widget.value;
      let good = !isNaN(strVal);
      if (good) {
        let val = parseFloat(strVal);
        good = Number.isInteger(parseFloat);
        // If min/max is NaN (not set), comparison returns false
        if (val < widget._MinVal || val > widget._MaxVal) {
          good = false;
        }
      }
      if (good) {
        widget.classList.remove("bad");
      } else {
        widget.classList.add("bad");
      }
    });
    return widget;
  }

  static createInputRow(fields) {
    const tr = Labels.createElement("tr");
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if ("object" == typeof field) {
        let td = Labels.createElement("td", undefined, "Input");
        tr.appendChild(td);
        td.appendChild(field);
      } else {
        let th = Labels.createElement("th", field.toString());
        tr.appendChild(th);
      }
    }
    return tr;
  }

  static createSelect(labels) {
    const select = Labels.createElement("select");
    for (let i in labels) {
      let label = labels[i];
      const opt = Labels.createElement("option", label.toString());
      select.appendChild(opt);
    }
    return select;
  }
}

class QuickFill {
  constructor(label, choices) {
    this.label = label;
    this.choices = choices;
  }

  toString() {
    return this.label;
  }

  getChoices() {
    return this.choices;
  }

  static getByLabel(label, qfa) {
    for (let i in qfa) {
      let label = qfa[i];
      if (label == qf.toString()) {
        return qf;
      }
      return null;
    }
  }
}

class ResistorLabels extends Labels {

  static AMAZON_PACK = [
    // Miscellaneous
    "dRd", "ddR", "dddR", "dKd", "ddK", "dddK", "dMd", "ddM", "", "",
    "0R", // SMD only
    "1R", "4R7", "7R5", "", "", "", "", "", "",
    // "22R", "39R", "47R", "68R", // SMD only
    "10R", "18R", "24R", "30R", "36R", "43R", "51R", "62R", "75R", "91R",
    // "", "", "", "", "", "", "", "",
    // "100R", "150R", "220R", "330R", "680R", // SMD only
    "120R", "270R", "300R", "390R", "470R", "510R", "620R", "750R", "", "",
    // "1K8", "3K3", "3K9", "4K7", "5K6", // SMD only
    "1K", "1K5", "2K2", "3K", "3K6", "4K3", "5K1", "6K8", "8K2", "",
    // "12K", "22K", "33K", "39K", "47K", "56K", "68K", // SMD only
    "10K", "15K", "20K", "30K", "36K", "43K", "51K", "62K", "75K", "",
    // "120K", "180K", "220K", "270K", "330K", "390K", "470K", "560K", "680K", // SMD only
    "100K", "150K", "200K", "240K", "300K", "360K", "430K", "510K", "620K", "750K",
    // "2.2M", "3.3M", "4.7M", "10M", // SMD only
    "1M", "", "", "", "", "", "", "", "", ""
  ];

/*
  static quickFills = [
    new QuickFill("E12 Shorthand", ResistorLabels.getE12SeriesShorthand({
      "precision": this.resistorBands,
      "startPow": 0,
      "endPow": 9,
      "includeEnd": true,
      "includeZero": true
    })),
    new QuickFill("Amazon Pack", );
  ];
*/
  
  static quickFills = [
    "E12 Shorthand",
    "E12 Decimal",
    "Amazon Pack"
  ];

  constructor() {
    super();
    /** Width of entire draw area in mm. */
    this.width = 182;
    /** Height of entire draw area in mm. */
    this.height = 220;
    /** Single label height in mm. */
    this.labelHeight = 12;
    /** Single label width in mm. */
    this.labelWidth = 17;
    /** Style to use on labels. */
    this.labelStyle = "font-weight: bold; font-size: 1.25mm; font-family: sans-serif";

    /** Set to true to wrap around and fill entire area. */
    this.fill = true;

    /** Set to true to draw resitor with colored bands above label.
     * NOTE: If you set this to true, it only works if your on lables
     * having the form: "I[.I]E" or "IEI" (like: 2.2K, 120R, 4K7,
     * 20.0M). */
    this.resistorShow = true;
    
    /** The number of bands to draw in the resistor.
     * NOTE: If you set this to true, it only works if your on lables
     * having the form: "I[.I]E" or "IEI" (like: 2.2K, 120R, 4K7,
     * 20.0M). */
    this.resistorBands = 3;

    /** Total width of resistor image in mm (if drawn). */
    this.resistorWidth = 12;
    /** Total height of resistor image in mm (if drawn). */
    this.resistorHeight = 3.5;

    /** The text to appear on labels. Duplicates will appear as needed
     * to fill the entire draw area. */
    this.labels = ResistorLabels.AMAZON_PACK;

/*    
    this.labels = [
      // Miscellaneous
      "dRd", "ddR", "dddR", "dKd", "ddK", "dddK", "dMd", "ddM", "", "",
      "0R", // SMD only
      "1R", "4R7", "7R5", "", "", "", "", "", "",
      // "22R", "39R", "47R", "68R", // SMD only
      "10R", "18R", "24R", "30R", "36R", "43R", "51R", "62R", "75R", "91R",
      // "", "", "", "", "", "", "", "",
      // "100R", "150R", "220R", "330R", "680R", // SMD only
      "120R", "270R", "300R", "390R", "470R", "510R", "620R", "750R", "", "",
      // "1K8", "3K3", "3K9", "4K7", "5K6", // SMD only
      "1K", "1K5", "2K2", "3K", "3K6", "4K3", "5K1", "6K8", "8K2", "",
      // "12K", "22K", "33K", "39K", "47K", "56K", "68K", // SMD only
      "10K", "15K", "20K", "30K", "36K", "43K", "51K", "62K", "75K", "",
      // "120K", "180K", "220K", "270K", "330K", "390K", "470K", "560K", "680K", // SMD only
      "100K", "150K", "200K", "240K", "300K", "360K", "430K", "510K", "620K", "750K",
      // "2.2M", "3.3M", "4.7M", "10M", // SMD only
      "1M", "", "", "", "", "", "", "", "", ""
    ];
*/
    /*
    this.labels = ResistorLabels.getE12SeriesShorthand({
      "precision": this.resistorBands,
      "startPow": 0,
      "endPow": 9,
      "includeEnd": true,
      "includeZero": true
    });
    */

  }

  static getE12Series() {
    return [
      1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2
    ];
  }

  static formatSeries(opts, series, format) {
    let startPower = Labels.getNumber(opts, "startPow", 0);
    let endPower = Labels.getNumber(opts, "endPow", 9);
    let capEnd = Labels.getBoolean(opts, "includeEnd", true);
    let addZero = Labels.getBoolean(opts, "includeZero", true);
    let precision = Labels.getNumber(opts, "precision", 2);
    let a = new Array();
    let n = series.length;
    
    for (let p = startPower; p < endPower; p++) {
      let mult = Math.pow(10, p);
      for (let i = 0; i < n; i++) {
        let rval = mult * series[i];
        let rvalStr = format(rval, precision);
        a.push(rvalStr);
      }
    }

    if (capEnd) {
      // Add final power of 10 if "capEnd" is enabled
      a.push(format(Math.pow(10, endPower), precision))
    }

    if (addZero) {
      a.push(format("0", precision));
    }
    
    return a;
  }

  static formatDecimalOhms(rval, precision) {
    let labels = [ "\u2126", "K\u2126", "M\u2126", "G\u2126" ];
    return ResistorLabels.formatDecimal(rval, precision, labels);
  }

  static formatDecimalPlain(rval, precision) {
    let labels = [ "", "K", "M", "G" ];
    return ResistorLabels.formatDecimal(rval, precision, labels);
  }

  static formatDecimal(rval, precision, labels) {
    let label = labels[0];
    let rvalLabeled = rval;
    
    for (let i = 1; (i < labels.length) && (rvalLabeled >= 1000); i++) {
      label = labels[i];
      rvalLabeled /= 1000.0;
    }

    let p = Math.floor(Math.log10(rvalLabeled));
    let rvalStr = Math.round(rvalLabeled * 100000).toString();
    let formattedVal = "";
    let needsDecimalPt = false;
    
    for (let i = 0; i < precision; i++) {
      if (needsDecimalPt) {
        let allZero = true;
        for (let j = i; j < precision; j++) {
          if (rvalStr.charAt(j) != "0") {
            allZero = false;
            break;
          }
        }
        // If remaining digits after decimal point are
        // all zero's, then done
        if (allZero) {
          break;
        }
        formattedVal += ".";
      }
        
      let nc = rvalStr.charAt(i);
      formattedVal += nc;
      needsDecimalPt = (i == p);
    }

    return formattedVal + label;
  }

  static formatShorthand(rval, precision) {
    let labels = [ "R", "K", "M", "G" ];
    let label = labels[0];
    let rvalLabeled = rval;
    
    for (let i = 1; (i < labels.length) && (rvalLabeled >= 1000); i++) {
      label = labels[i];
      rvalLabeled /= 1000.0;
    }

    let rvalInt = Math.floor(rvalLabeled);
    let leadingDigits = rvalInt.toString();
    let trailingDigits = "";
    let trailingLength = (precision - leadingDigits.length);
    if (trailingLength > 0) {
      let rvalEnd = Math.round((rvalLabeled - rvalInt) * Math.pow(10, trailingLength));
      if (rvalEnd > 0) {
        trailingDigits = rvalEnd.toString();
        // Handle rare case like "1.02" to precision 3 ("02" comes out to "2"
        // when formatted above and we need to put back the leading digits)
        while (trailingDigits.length < trailingLength) {
          trailingDigits = "0" + trailingDigits;
        }
        for (let i = trailingDigits.length - 1; i > 0; i--) {
          if (trailingDigits.charAt(i) == "0") {
            trailingDigits = trailingDigits.substring(0, i);
          }
        }
      }
    }

    return leadingDigits + label + trailingDigits;
  }
  
  static getE12SeriesDecimalOhms(opts) {
    let series = ResistorLabels.getE12Series();
    return ResistorLabels.formatSeries(opts, series, ResistorLabels.formatDecimalOhms);
  }
  
  static getE12SeriesDecimalPlain(opts) {
    let series = ResistorLabels.getE12Series();
    return ResistorLabels.formatSeries(opts, series, ResistorLabels.formatDecimalPlain);
  }

  static getE12SeriesShorthand(opts) {
    let series = ResistorLabels.getE12Series();
    return ResistorLabels.formatSeries(opts, series, ResistorLabels.formatShorthand);
  }

  static getResistorValue(r) {
    let rval = 0;
    let rexp = /[RKM\u2126]+/;
    let parts = r.split(rexp);
    let expa = null;
    
    if ((parts.length == 1) && !isNaN(parts[0])) {
      // Simple numeric value (no multiplier assume R)
      expa = "R";
    } else {
      if (parts.length != 2) {
        return NaN;
      }
      expa = r.match(rexp);
      if (expa == null) {
        return NaN;
      }
    }

    if ((parts.length == 1) || (parts[1].length == 0)) {
      // Second part is missing, assume D[.D]E notation.
      // (like 2.2K for 2200 ohm).
      rval = parseFloat(parts[0]);
    } else {
      // Assume shorthand notation DED (like 2K2 for 2200 ohm).
      rval = parseFloat(parts[0] + "." + parts[1]);
    }

    let notation = expa[0].charAt(0);
    if ("K" == notation) {
      rval *= 1000;
    } else if ("M" == notation) {
      rval *= 1000000;
    } else if ("G" == notation) {
      rval *= 1000000000;
    }

    return rval;
  }

  static getResistorIndexes(r, precision) {
    if (precision == undefined) {
      precision = 2;
    }
    
    // Initialize array to zero
    let indexes = new Array(precision + 1);
    for (let i = 0; i < indexes.length; i++) {
      indexes[i] = 0;
    }

    // Get resistor value plus extra digits
    let rval = parseFloat(r);
    if (Math.abs(rval) < 1.0e-3) {
      // Special value for 0 ohm resistors (single black band)
      return indexes;
    }
    
    let rstr = Math.floor(parseFloat(r) * 1000).toString();
    let power = rstr.length - 3 - precision;

    // Go through leading digits in string to fill
    // in start of index array
    let n = Math.min(rstr.length, precision);
    for (let i = 0; i < n; i++) {
      indexes[i] = parseInt(rstr.charAt(i));
    }
    
    // Add power to end of index array
    indexes[indexes.length - 1] = power;

    return indexes;
  }

  createResistorSvg(drawing, xofs, yofs, rindexes, rw, rh) {
    // Total number of digits (including expononent)
    let nDigits = rindexes.length;
    let bigGap = 0.75;
    let smallGap = bigGap / 2;
    let line = 0.1;
    // Width of single band (big gap on both ends and between val and exp)
    let bandW = (rw - (bigGap * 3) - ((nDigits - 2) * smallGap)) / nDigits;
    let bandH = rh - (smallGap * 2);
    // Color codes for integer values [-3, -2, -1, 0, ... 9 ]
    let colorCodes = [
      // Pink 10e-3, Silver 10e-2, Gold 10e-1 (expononent only)
      "#ff69b4", "#c0c0c0", "#cfb53b",
      "#000000", "#964b00", "#ff0000", "#ffa500", "#ffff00",
      "#9Acd32", "#6495ed", "#9400d3", "#a0a0a0", "#ffffff"
    ];

    // Start with rounded rectangle for resistor outline
    let g = drawing.createElement("g", {
      "transform": "translate(" + xofs + ", " + yofs + ")"
    });

    let outline = drawing.createElement("rect", {
      "width": rw,
      "height": rh,
      "rx": 1,
      "stroke": "#808080",
      "fill": "#D2B48C",
      "fill-opacity": 0.25,
      "stroke-width": smallGap
    });
    g.appendChild(outline);

    let zeroOhm = true;
    for (let i = 0; i < (nDigits - 1); i++) {
      if (rindexes[i] !== 0) {
        zeroOhm = false;
        break;
      }
    }
    
    // Add color coding bands
    let bofs = bigGap;
    for (let i = 0; i < nDigits; i++) {
      let band = drawing.createElement("rect", {
        "x": bofs,
        "y": smallGap,
        "width": bandW,
        "height": (rh - (2 * smallGap)),
        "rx": 0,
        "stroke": "#C0C0C0",
        "fill": colorCodes[rindexes[i] + 3],
        "stroke-width": (smallGap * 0.75)
      });
      g.appendChild(band);

      // Special case for zero-ohm resistors that are displayed
      // as single black band
      if (zeroOhm) {
        break;
      }

      // Add small gap until separator for exponent
      if (i == (nDigits - 2)) {
        bofs += bigGap + bandW;
      } else {
        bofs += smallGap + bandW;
      }
    }
    
    return g;
  }

  addLabel(drawing, labelText, xofs, yofs) {
    let lw = this.labelWidth;
    let lh = this.labelHeight;
    const rval = ResistorLabels.getResistorValue(labelText);
    const rvalValid = !isNaN(rval);
    const drawResistor = this.resistorShow && rvalValid;
    
    let g = drawing.appendElement("g", {
      "transform": "translate(" + xofs + ", " + yofs + ")"
    });
    drawing.appendChild(g);
 
    let r = drawing.createElement('rect', {
      width: lw, height: lh, rx: 1,
      fill: '#ffffff', stroke: '#202020', 'stroke-width': 1
    });
    g.appendChild(r);
    let y = (lh / 2);
    if (drawResistor) {
      y = y + (this.resistorHeight * 0.5);
    }
    
    let text = drawing.createElement("text", {
      "class": "label",
      "x": (lw / 2), "y": y,
      "alignment-baseline": "middle",
      "text-anchor": "middle"
    });
    text.appendChild(document.createTextNode(labelText));
    g.appendChild(text);

    if (drawResistor) {
      let rindexes = ResistorLabels.getResistorIndexes(rval, this.resistorBands - 1);
      let rw = this.resistorWidth;
      let rh = this.resistorHeight;
      let xofs = ((lw - rw) / 2);
      let yofs = 1;
      let gres = this.createResistorSvg(drawing, xofs, yofs, rindexes, rw, rh);
      g.appendChild(gres);
    }
    /*
    drawing.appendElement('circle', {
      cx: xofs + lw / 2, cy: yofs + lh / 2, r: lh / 4,
      fill: '#a05050', stroke: '#5050a0', 'stroke-width': 2
    });
*/
  }
/*

  var cparams = { cx: 50, cy: 50, r: 50,
    fill: '#a05050', stroke: '#5050a0', 'stroke-width': 2
  };

  // A SVG drawing using JSON mark up
  jsonDrawing = [
  {
    e: 'g',       // Required SVG element (g, circle, polyline, ...)
    a: { },       // Optional attributes for element 
    c: [          // Optional array of children for element
      { e: 'circle', a: cparams },
      { e: 'polyline',
        a: {
          stroke: '#008000', 'stroke-width': 5,
          points: '50,375 150,375 150,325 250,325 250,375 350,375' +
            ' 350,250 450,250 450,375 550,375 550,175 650,175 650,375 750,375' + 
            ' 750,100 850,100 850,375 950,375 950,25 1050,25 1050,375 1150,375'
        }
      }
    ]
  },
  {
    // Second group translated from first
    e: 'g',
    a: { transform: 'translate(600, 400)' },
    c: [
      { e: 'circle', a: cparams },
      { e: 'polygon',
        a: {
          fill: '#f040f0', stroke: '#408000', 'stroke-width': 5,
          points: '350,75  379,161 469,161 397,215' +
                  ' 423,301 350,250 277,301 303,215 231,161 321,161'
        }
      }
    ]
  }
  ];

  // Convert JSON drawing to SVG and append
  drawing.appendDrawing(jsonDrawing);
*/
  
  addLabels(drawing) {
    let lw = this.labelWidth;
    let lh = this.labelHeight;
    let idx = 0;
    
    for (let yofs = 0; (yofs + lh) <= this.height; yofs += lh) {
      for (let xofs = 0; (xofs + lw) <= this.width; xofs += lw) {
        let labelText = this.labels[idx];
        this.addLabel(drawing, labelText, xofs, yofs);

        if (this.fill) {
          idx = (idx + 1) % this.labels.length;
        } else {
          idx++;
          if (idx >= this.labels.length) {
            // Force early termination
            yofs = this.height * 2;
            xofs = this.width * 2;
            break;
          }
        }
      }
    }
  }

  createWidget() {
    let w = this.width;
    let h = this.height;
    let drawing = new NstSvg({
      // Following allows us to set initial dimensions and drawing space
      width: w + "mm",
      height: h + "mm",
      viewBox: '0 0 ' + w + ' ' + h
    });

    let style = drawing.createElement("style");
    let labelStyle = ".label { " + this.labelStyle + "}";
    style.appendChild(document.createTextNode(labelStyle));
    drawing.appendChild(style);

    this.addLabels(drawing);
    return drawing.getWidget();
  }

  applyEditorValues() {
    let editor = this.getEditor();

    this.width = parseFloat(this.widthWidget.value);
    this.height = parseFloat(this.heightWidget.value);
    this.labelWidth = parseFloat(this.labelWidthWidget.value);
    this.labelHeight = parseFloat(this.labelHeightWidget.value);
    
    const list = editor.childNodes;
    for (let i = list.length - 1; i > 1; i--) {
      editor.removeChild(list[i]);
    }

    editor.appendChild(this.createWidget());
  }

  getEditor(tag) {
    if (this.editor != undefined) {
      return this.editor;
    }
    const div = Labels.createElement("div");
    this.editor = div;
    this.editor.id = tag;
    
    const table = Labels.createElement("table");
    table.classList.add("noprint");
    div.appendChild(table);

    const tbody = Labels.createElement("tbody");
    table.appendChild(tbody);

    const self = this;
    const updateSvg = function() {
      self.applyEditorValues();
    }
    
    this.widthWidget = Labels.createFloatInput(this.width, 0);
    this.widthWidget.addEventListener("input", updateSvg);
    
    this.heightWidget = Labels.createFloatInput(this.height, 0);
    this.labelWidthWidget = Labels.createFloatInput(this.labelWidth, 0);
    this.labelHeightWidget = Labels.createFloatInput(this.labelHeight, 0);
    this.resistorShowWidget = Labels.createCheckBox(this.resistorShow, 0);
    this.resistorBandsWidget = Labels.createIntegerInput(this.resistorBands, 3, 3, 5);
    this.resistorWidthWidget = Labels.createFloatInput(this.resistorWidth, 0);
    this.resistorHeightWidget = Labels.createFloatInput(this.resistorHeight, 0);

    this.quickFill = Labels.createSelect(ResistorLabels.quickFills);
    
    tbody.appendChild(Labels.createInputRow([
      "Total Width (mm)", this.widthWidget,
      "Total Height (mm)", this.heightWidget
    ]));

    tbody.appendChild(Labels.createInputRow([
      "Label Width (mm)", this.labelWidthWidget,
      "Label Height (mm)", this.labelHeightWidget
    ]));

    tbody.appendChild(Labels.createInputRow([
      "Show Resistor", this.resistorShowWidget,
      "Resistor Bands", this.resistorBandsWidget
    ]));

    tbody.appendChild(Labels.createInputRow([
      "Resistor Width (mm)", this.resistorWidthWidget,
      "Resistor Height (mm)", this.resistorHeightWidget
    ]));

    tbody.appendChild(Labels.createInputRow([
      "Quick Sets", this.quickFill
    ]));

    let defLabels = ResistorLabels.getE12SeriesShorthand({
      "precision": this.resistorBands,
      "startPow": 0,
      "endPow": 9,
      "includeEnd": true,
      "includeZero": true
    });
    this.labelsWidget = Labels.createElement("textarea", JSON.stringify(defLabels));
    this.labelsWidget.classList.add("noprint");
    this.labelsWidget.rows = 8;
    this.labelsWidget.cols = 50;
    this.editor.appendChild(this.labelsWidget);

    this.applyEditorValues();
    return this.editor;
  }
}
