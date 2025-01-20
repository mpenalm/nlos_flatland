# Looking Around Flatland #

## About ##

This system is an end-to-end simulation pipeline for 2D NLOS imaging.
The 2D setting allows for faster render and imaging times, which is useful for prototyping, and a more accessible way of understanding and interacting with multiple parameters.

It is based on the [Tantalum](https://github.com/tunabrain/tantalum) renderer and written in JavaScript and WebGL.

The [`article_scenes`](article_scenes) folder contains the configuration files to recreate the scenes shown in our publication "Looking Around Flatland: End-to-End 2D Real-Time NLOS Imaging".

## Use ##

The system is deployed at <https://mpenalm.github.io/nlos_flatland>.
It can also run locally. To launch it, open the [`index.html`](index.html) file on a browser.

In the left of the window, it shows the current scene being rendered, and scene and capture parameters that can be modified.
- The visualization shows fluence in the whole scene instead of radiance. That is, the amount of light passing through each point. There is no participating medium.
- You can move the emitter position and orientation by clicking and dragging over the scene or using the textboxes.
- The sensor always looks at the blue dots in the right of the scene, representing SPAD aperture.
- The scene is around 3.5 meters long in the horizontal (x) direction, and 2 meters long in the vertical (y) direction.

In the right of the window, it shows the image obtained by the NLOS imaging method, and its parameters.
- Confocal and Time-gated camera models can be evaluated at different instants with the time slider or Play/Pause button. 
- Please note that the Steady-state camera model is not affected by the Time slider but it's still recomputed, and it can take a couple of seconds.
- Note that the confocal virtual camera model only supports laser emitters. Results for other emitter types may give inconsistent results.