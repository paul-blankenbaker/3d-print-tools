class HoleToolCalculator {

  constructor() {
    this.className = "holeTool";
  }

  createElement(type, cdata) {
    let widget = document.createElement(type);
    widget.className = this.className;
    if (cdata !== undefined) {
      widget.appendChild(document.createTextNode(cdata));
    }
    return widget;
  }

  createNumberInput(defVal, readOnly) {
    let widget = this.createElement("input");
    widget.type = "number";
    widget.defaultValue = defVal;
    widget.value = defVal;
    widget.readOnly = (readOnly === true);
    return widget;
  }

  formatNumber(mm) {
    let val = Number.parseFloat(mm);
    let fixed = 3;
    if (false) {
      // Convert to inches
      val /= 25.4;
      fixed = 5;
    }
    let text = val.toFixed(fixed);
    return text;
  }

  setNumberWidget(widget, val) {
    if (widget !== undefined) {
      widget.value = this.formatNumber(val);
    }
  }

  getSelectValue(sel, defVal) {
    let val = defVal;
    if (sel !== undefined && sel.selectedIndex >= 0) {
      val = sel.value;
    }
    return val;
  }

  setSelectValue(sel, val) {
    if (sel !== undefined) {
      sel.value = val;
    }
  }

  setSelectList(sel, list) {
    if (sel !== undefined && list !== undefined) {
      sel.size = 0;
      let n = list.length;
      for (let i = 0; i < n; i++) {
        sel.add(this.createElement("option", list[i]));
      }
    }
  }
  
  getBolt() {
    return this.getSelectValue(this.boltTypeSelect, undefined);
  }
  
  getHead() {
    return this.getSelectValue(this.boltHeadSelect, BoltInfo.BUTTON_TYPE);
  }
  
  getNut() {
    return this.getSelectValue(this.nutSelect, NutInfo.PLAIN_TYPE);
  }

  setBoltSize(bsize) {
    this.setNumberWidget(this.boltDia, bsize);
  }

  createWidget() {
    if (this.widget !== undefined) {
      return this.widget;
    }
    let self = this;
    // Pick known value for defaults
    let f = new Fastener();
    let nutInfo = f.getNutInfo();
    let headInfo = f.getHeadInfo();
    let clearInfo = f.getClearanceInfo();
    let tol = Tolerance.PRUSA_15;
    f.setTolerance(tol);
    
    let widget = this.createElement("div");

    widget.append(this.createElement("div", "Printer Tolerances"));

    widget.append(this.createElement("label", "Height/Depth"));
    let htol = this.depthTol = this.createNumberInput(tol.getHeight());
    widget.append(htol);

    widget.append(this.createElement("label", "Diameter"));
    let dtol = this.diameterTol = this.createNumberInput(tol.getDiameter());
    widget.append(dtol);

    widget.append(this.createElement("div", "Fastener Selector"));

    widget.append(this.createElement("label", "Bolt"));
    let bts = this.boltTypeSelect = this.createElement("select");
    widget.append(bts);

    widget.append(this.createElement("label", "Head"));
    let bhs = this.boltHeadSelect = this.createElement("select");
    widget.append(bhs);

    widget.append(this.createElement("label", "Nut"));
    let ns = this.nutSelect = this.createElement("select");
    widget.append(ns);

    widget.append(this.createElement("div", "Fastener Measurements"));
    
    widget.append(this.createElement("label", "Bolt (d)"));
    let bd = this.boltDia = this.createNumberInput(headInfo.getSize());
    widget.append(bd);

    widget.append(this.createElement("label", "Head (d)"));
    let hd = this.headDia = this.createNumberInput(headInfo.getDiameterMax());
    widget.append(hd);

    widget.append(this.createElement("label", "Head (h)"));
    let hh = this.headSize = this.createNumberInput(headInfo.getHeightMax());
    widget.append(hh);

    widget.append(this.createElement("label", "Nut (w)"));
    let nw = this.nutWidth = this.createNumberInput(nutInfo.getWidthMax());
    widget.append(nw);

    widget.append(this.createElement("label", "Nut (h)"));
    let nh = this.nutHeight = this.createNumberInput(nutInfo.getHeightMax());
    widget.append(nh);

    widget.append(this.createElement("div", "Clearances"));

    widget.append(this.createElement("label", "Diameter (d)"));
    let cld = this.clearDia = this.createNumberInput(clearInfo.getClearance());
    widget.append(cld);
    
    widget.append(this.createElement("label", "Enlarge"));
    let cle = this.clearEnlarged = this.createNumberInput(clearInfo.getEnlarged());
    cle.readOnly = true;
    widget.append(cle);

    widget.append(this.createElement("div", "Hole Information"));

    {
      let params = {
        parent: widget,
        label: "Bolt",
        r: f.getBoltHoleRadius(),
        h: f.getHeadHeight(),
        readOnly: true
      };
      this.boltDrillDia = this.appendDiameter(params);
      this.boltDrillRad = this.appendRadius(params);
    }

    {
      let params = {
        parent: widget,
        label: "Head",
        r: f.getBoltHeadRadius(),
        h: f.getHeadHeight(),
        readOnly: true
      };
      this.boltHeadDrillDia = this.appendDiameter(params);
      this.boltHeadDrillRad = this.appendRadius(params);
      this.boltHeadDrillDepth = this.appendDepth(params);
    }

    {
      let params = {
        parent: widget,
        label: "Nut",
        r: f.getNutRadius(),
        h: f.getNutHeight(),
        w: f.getNutWidth(),
        readOnly: true
      };
      this.nutDrillDia = this.appendDiameter(params);
      this.nutDrillRad = this.appendRadius(params);
      this.nutDrillWidth = this.appendWidth(params);
      this.nutDrillDepth = this.appendDepth(params);
    }
    
    
    let btList = BoltInfo.getBoltTypes();
    for (let i in btList) {
      let btName = btList[i];
      let e = this.createElement("option", btName);
      bts.add(e);
    }

    let btype = headInfo.getBoltType();
    bts.value = btype;
    this.setBoltType(btype);

    bts.addEventListener("change", function(src) {
      self.setBoltType(bts.value);
    });

    bhs.addEventListener("change", function(src) {
      self.setHeadType(bhs.value);
    });

    ns.addEventListener("change", function(src) {
      self.setNutType(ns.value);
    });
    
    this.widget = widget;
    return widget;
  }

  appendDiameter(params) {
    let p = params.parent;
    p.append(this.createElement("label", params.label + " (d)"));
    let widget = this.createNumberInput(this.formatNumber(params.r * 2));
    widget.readOnly = (params.readOnly === true);
    p.append(widget);
    return widget;
  }

  appendRadius(params) {
    let p = params.parent;
    p.append(this.createElement("label", params.label + " (r)"));
    let widget = this.createNumberInput(this.formatNumber(params.r));
    widget.readOnly = (params.readOnly === true);
    p.append(widget);
    return widget;
  }

  appendDepth(params) {
    let p = params.parent;
    p.append(this.createElement("label", params.label + " (h)"));
    let widget = this.createNumberInput(this.formatNumber(params.h));
    widget.readOnly = (params.readOnly === true);
    p.append(widget);
    return widget;
  }

  appendWidth(params) {
    let p = params.parent;
    p.append(this.createElement("label", params.label + " (w)"));
    let widget = this.createNumberInput(this.formatNumber(params.w));
    widget.readOnly = (params.readOnly === true);
    p.append(widget);
    return widget;
  }

  setBoltType(bt) {
    let ci = ClearanceInfo.lookup(bt);
    if (ci !== undefined) {
      let curHead = this.getHead();
      let curNut = this.getNut();
      let bsize = ci.getDiameter();
      this.setBoltSize(bsize);
      this.setSelectList(this.boltHeadSelect, BoltInfo.getHeadTypes(bt));
      this.setSelectList(this.nutSelect, NutInfo.typesForSize(bsize));
      this.setSelectValue(this.boltHeadSelect, curHead);
      this.setSelectValue(this.nutSelect, curNut);
      this.setHeadType(this.boltHeadSelect.value);
      this.setNutType(this.nutSelect.value);
    } else {
      alert("Sorry - we failed to find clearance info for " + bt + " bolts");
    }
  }

  setHeadType(headType) {
    let bi = BoltInfo.lookup(this.getBolt(), headType);
    if (bi !== undefined) {
      this.setNumberWidget(this.headDia, bi.getDiameterMax());
      this.setNumberWidget(this.headHeight, bi.getHeightMax());
    }
  }

  setNutType(nutType) {
    let ni = NutInfo.lookup(this.getBolt(), nutType);
    if (ni !== undefined) {
      this.setNumberWidget(this.nutWidth, ni.getWidthMax());
      this.setNumberWidget(this.nutHeight, ni.getHeightMax());
    }
  }

  /**
   * Computes clearance information based on current selection.
   */
  /*
  updateValues() {
    let bolt = this.getBolt();
    let head = this.getHead();
    let nut = this.getNut();
    let f = Fastener.create(bolt, head, nut);
    let ci = ClearanceInfo.lookup(bolt);
    if (f !== undefined && ci !== undefined) {
      let curHead = this.getHead();
      let curNut = this.getNut();
      let bsize = ci.getDiameter();
      this.setBoltSize(bsize);
      this.setSelectList(this.boltHeadSelect, BoltInfo.getHeadTypes(bt));
      this.setSelectList(this.nutSelect, NutInfo.typesForSize(bsize));
      this.setSelectValue(this.boltHeadSelect, curHead);
      this.setSelectValue(this.nutSelect, curNut);
      this.setHeadType(this.boltHeadSelect.value);
      this.setNutType(this.nutSelect.value);
    } else {
      alert("Sorry - we failed to find clearance info for " + bt + " bolts");
    }
  }
*/
  
  static create(id) {
    let c = new HoleToolCalculator();
    let node = document.getElementById(id);
    if (node != undefined) {
      node.appendChild(c.createWidget());
    }
    return c;
  }
}
