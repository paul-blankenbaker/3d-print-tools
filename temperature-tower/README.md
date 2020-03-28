A program to generate custom temperature tower STL files and the corresponding G-code to make temperature changes as the Z layer changes.

This Python 3 script takes 3 command line arguments (BOT_TEMP, TOP_TEMP, STEP) and 3 template input files to generate two output files required to print a "temperature tower" on a 3D printer (tested on Prusa i3 MK3).

WARNING: If you are not comfortable with running commands from the command line, this tool may not be for you.

Example Invocations
----------------------------

To display usage:

    python3 temperature-tower.py --help

To generate 5 temperature blocks with 250 on bottom, 245, 240, 235 and 230 on top.

    python3 temperature-tower.py 250 230 5

To generate 10 temperature blocks with 235 on bottom, then 236, 237, 238, 239, 240, 241, 242, 243, 244 and 245 on top.

   python3 temperature-tower.py 235 245 1

Usage
---------

    python3 temperature-tower.py [--help|-h] BOT_TEMP TOP_TEMP TEMP_STEP

Where:

*BOT_TEMP* - Temperature (C) to use for bottom block of tower.

*TOP_TEMP* - Temperature (C) to use for top block of tower.

*TEMP_STEP* - Degrees to step between blocks (positive number, code will figure out if it needs to be negated).

Requirements
-------------------

* Python3  - https://www.python.org/
* OpenSCAD - http://www.openscad.org/

NOTE: You must be able to run *both* Python3 and openscad from the command line in order for this utility to work. To verify that your system is capable, make sure you can run the following two commands from the command line:

    python3 --version
    openscad --help

Requires 4 files in same directory to run:

1. temperature-tower.py - This python script
2. temperature-tower-base.stl - Base plate to build tower on
3. temperature-tower-block.stl - One tower block
4. temperature-tower.openscad.txt - OpenSCAD template instructions

Files Produced
--------------------

Two files will be produced when the command completes successfully:

**temperature-tower-BOT_TEMP-TOP_TEMP-STEP.stl**

Printable model of the temperature tower. Stack of blocks with
temperature label on each block based on your parameters.

**temperature-tower-BOT_TEMP-TOP_TEMP-STEP.gcode.txt**

Gcode instructions to be added to slicer instructing the slicer when to change temperature based on layer height.

Tested on Fedora 28 and Prusa i3 MK3, will likely run elsewhere, but your mileage may vary and you may need to modify the Python code or template files for your environment.

Thanks To
--------------

*  Zolee Gaa (https://www.thingiverse.com/thing:2729076/files) - Creation of original STL file parts.

* Pertti Tolonen (https://www.thingiverse.com/thing:2825709) - Creation of original OpenSCAD instructions to dynamically build custom tower from STL parts.
