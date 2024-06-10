# Looking Around Flatland #

## About ##

This system is an end-to-end simulation pipeline for 2D NLOS imaging.
The 2D setting allows for faster render and imaging times, which is useful for prototyping, and a more accessible way of understanding and interacting with multiple parameters.

It is based on the [Tantalum](https://github.com/tunabrain/tantalum) renderer and written in JavaScript and WebGL.

## Use ##

The system can run locally. To launch it, open the [`nlos_flatland.html`](nlos_flatland.html) file on a browser.

In the left of the window, it shows the current scene being rendered, and scene and capture parameters that can be modified.
- The visualization shows fluence in the whole scene instead of radiance. That is, the amount of light passing through each point. There is no participating medium.
- You can move the emitter position and orientation by clicking and dragging over the scene or using the textboxes.
- The sensor always looks at the blue dots in the right of the scene, representing SPAD aperture.
- We didn't have time to add a scale ruler yet: the scene is around 3.5 meters long in the horizontal (x) direction, and 2 meters long in the vertical (y) direction.

In the right of the window, it shows the image obtained by the NLOS imaging method, and its parameters.
- Confocal and Transient camera models can be evaluated at different instants with the time slider or Play/Pause button. 
- Please note that the Steady-state camera model is not affected by the Time slider but it's still recomputed, and it can take a couple of seconds.