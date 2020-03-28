#!/usr/bin/python3
#
# See show_help() below for information and usage.

import os
import sys

def show_help():
    m="""
Python 3 script that uses 3 command line arguments (BOT_TEMP,
TOP_TEMP, STEP) and 3 template input files to generate two output
files required to print a "temperature tower" on a 3D printer (tested
on Prusa i3 MK3).

Files Produced:

  temperature-tower-BOT_TEMP-TOP_TEMP-STEP.stl
    Printable model of full temperature tower. Stack of blocks with
    temperature label on each block based on your parameters.

  temperature-tower-BOT_TEMP-TOP_TEMP-STEP.gcode.txt
    Gcode instructions to be added to slicer instructing the slicer
    when to change temperature based on layer height.

Tested on Fedora 28 and Prusa i3 MK3, will likely run elsewhere, but
you mileage may vary and you may need to modify the Python code or
template files for your environment.


Usage:

  python3 temperature-tower.py [--help|-h] BOT_TEMP TOP_TEMP TEMP_STEP

Where:

  BOT_TEMP
    Temperature (C) to use for bottom block of tower.
  TOP_TEMP
    Temperature (C) to use for top block of tower.
  TEMP_STEP
    Degrees to step between blocks (we will take care of sign)

Requirements:

  Python3  - https://www.python.org/
  OpenSCAD - http://www.openscad.org/

  NOTE: You must be able to run openscad from the command line in
  order for this utility to work. To test, try running:

    openscad --help

  Requires 4 files in same directory to run:
    temperature-tower.py           - This python script
    temperature-tower-base.stl     - Base plate to build tower on
    temperature-tower-block.stl    - One tower block
    temperature-tower.openscad.txt - OpenSCAD template instructions

Thanks To:

   Zolee Gaa (https://www.thingiverse.com/thing:2729076/files)
      Creation of original STL file parts.

   Pertti Tolonen (https://www.thingiverse.com/thing:2825709)
      Creation of original OpenSCAD instructions to dynamically
      build custom tower from STL parts.

Examples:

   python3 temperature-tower.py --help

   python3 temperature-tower.py 250 230 5

      Generates 4 temperature blocks with 250 on bottom, 245, 240,
      235 and 230 on top.

   python3 temperature-tower.py 235 245 1

      Generates 10 temperature blocks with 235 on bottom, then 236,
      237, 238, 239, 240, 241, 242, 243, 244 and 245 on top.
"""
    print(m)
    
def exit_error(msg):
    print(msg)
    show_help()
    exit(1)

def signedStep(bot, top, step):
    if bot < top:
        # Increasing temperature as we go up, make sure step is positive
        step = abs(step)
    else:
        # Decreasing temperature as we go up, make sure step is negative
        step = -abs(step)
    return step
    
def createGcode(bot, top, step):
    # Get step with correct sign to move from bottom to top temperature
    # by addition
    step = signedStep(bot, top, step)
    
    fileName = "temperature-tower-{0}-{1}-{2}.gcode.txt".format(bot, top, abs(step))
    print("Creating: {0}".format(fileName))
    f = open(fileName, 'w')

    # Height in mm above base (where bottom block starts printing)
    z = 1.4
    floor = 1
    cond = "if"
    f.write("""; Copy/paste below to BEFORE_LAYER change area.
;
; On slic3r-prusa3d, look for 'Before layer change G-code' under
; 'Printer Settings', 'Custom G-code' panel
""");
    for t in range(bot, top + step, step):
        gcode = "{{{0} layer_z>={1} and layer_z<{2}}}\n; T tower block {3} - {4}C\nM104 S{4}\n"
        out = gcode.format(cond, z, z + 10, floor, t);
        f.write(out)
        floor += 1
        z += 10
        cond = "elsif"
    f.write("{endif}\n")
    f.close()

    
def createOpenscad(bot, top, step, tdir):
    # Get step with correct sign to move from bottom to top temperature
    # by addition
    step = signedStep(bot, top, step)
    
    fileName = "temperature-tower-{0}-{1}-{2}.openscad.txt".format(bot, top, abs(step))
    print("Creating: {0}".format(fileName))
    f = open(fileName, 'w')

    # Read contents of openscad template file into list of strings
    tfile = os.path.join(tdir, 'temperature-tower.openscad.txt')
    template = open(tfile, 'r');
    lines = list(template)
    template.close()

    baseStl = os.path.join(tdir, 'temperature-tower-base.stl')
    blockStl = os.path.join(tdir, 'temperature-tower-block.stl')
    
    for line in lines:
        start = line[0:4]
        if start == "TMIN":
            line = "tmin={0};\n".format(bot)
        elif start == "TMAX":
            line = "tmax={0};\n".format(top)
        elif start == "STEP":
            line = "tstep={0};\n".format(step)
        elif start == "BASE":
            line = 'import("{0}");'.format(baseStl)
        elif start == "BLOK":
            line = 'import("{0}");'.format(blockStl)
        f.write(line)

    f.close()
    return fileName

def createStl(bot, top, step, tdir):
    inFile = createOpenscad(bot, top, step, tdir)
    outFile = "temperature-tower-{0}-{1}-{2}.stl".format(bot, top, abs(step))
    print("Creating: {0}".format(outFile))
    cmd = "openscad -o {0} {1}".format(outFile, inFile)
    os.system(cmd)
    os.remove(inFile)

if (len(sys.argv) < 2) or (sys.argv[1] == '-h') or (sys.argv[1] == '--help'):
    show_help()
    exit(0)
    
if len(sys.argv) != 4:
    exit_error("""***ERROR*** Command requires 3 arguments""")

# Get command line arguments
botTemp = int(sys.argv[1])
topTemp = int(sys.argv[2])
stepTemp = int(sys.argv[3])
templateDir = os.path.dirname(sys.argv[0])

# Create gcode file with layer change instructions for
# 3D printer to change temperature as Z-level increases
createGcode(botTemp, topTemp, stepTemp)
createStl(botTemp, topTemp, stepTemp, templateDir)
