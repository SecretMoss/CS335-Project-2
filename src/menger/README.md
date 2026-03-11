CS 335 - Project 2
OpenGL Menger Sponge Fractal

By: Alex Nguyen, Gregory James


How to run:

Ensure that you have npm installed:
'npm install'

Install the TypeScript compiler and HTTP server:
'npm install -g typescript'
'npm install -g http-server'

Install setuptools:
'pip install setuptools'

Compile the code:
'python make-menger.py'

Launch server:
'http-server dist -c-1'

Open a web browser and navigate to:
http://127.0.0.1:8080


For this project, we developed a program that would generate a
Menger sponge fractal with varying degrees of depth. When ran, a scene 
will be generated displaying a checkerboard patterned floor, and the
generate Menger sponge in the middle of the screen. 

You can use the arrow keys and the wasd keys to maneuver the camera, and number 
keys 1-4 to set varying levels of depth.


Here are some descriptions of the various systems:


Fractal Generation: 

To generate the Menger sponge, we first generate
a 3D cube that has 24 vertices (4 per face). This is the base case, and we use 
a recursion algorithm to iterate into further degrees of depth. To do this,
we divide up the current cube into 27 subcubes, and then iterate through 
local grid coordinates to find which subcubes are inner subcubes, and then skip
rendering them.


Camera System: 

To determine the orientation of the camera we look at its 3 vectors:
Look (forward), Up, and Right. Up and Right are constantly being updated to 
keep all of the vectors perpendicular to each other. When the screen is clicked
and dragged, we determine the direction of the mouse movement and spin the camera
about an invisible "axis".


Graphics Pipeline:

To render the scene, each point is passed through 3 matrices. The Model Matrix,
the View Matrix, and the Projection Matrix.
Model Matrix: Positions geometry in the 3D space.
View Matrix: Shifts the 3D space around the position and orientation of the camera.
Projection Matrix: Applies perspective and sizes the scene to fit the browser window.


Shading:

We determine the color of a face by checking the normal of that face, and applying a color 
depending on the direction it is facing. If it is facing down the x-axis, it is colored red.
The y-axis is green, and the z-axis is blue. The lighting is calculated by taking the dot
product of the face and the light source. Faces that are looking directly at the light are
fully illuminated, and as the face becomes tilted further away from the light it gets
dimmer. There is also a small amount of ambient light.



When setting up our dev environments for this project, we ran into trouble
while trying to use the provided make-menger.py script. Turns out that the
disutils package no longer automatically comes with newer version of python,
and we had to download it.