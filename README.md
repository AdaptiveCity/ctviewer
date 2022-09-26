# Cameratransform viewer

Simple utility to help visualise the effect of different [cameratransform](https://github.com/rgerum/cameratransform) settings.

# Configuration

The beginning of `ct.js` can be edited

- `cturl`: change if you are putting `ct.py` in a different webspace or you wish to use the Huggingface backend (now default) or a different URL.

# Installation

Put the files `index.html`, `ct.py` and `styles.css` in a web-accessible folder somewhere that Python scripts can be CGI-executed and direct your browser to `index.html`.

Alternatively, run `ln -s . cgi-bin` and then you can use the python web server in the current directory. Set configuration parameter `cturl` to `cgi-bin/ct.py` and run `python3 -m http.server 8080` or whichever port you like.

# Usage

The interface is very simplistic and simply gives you a handle on many different parameters you can tweak for cameratransform. You can specify an image file to project the coordinates on. This image file IS NOT UPLOADED to the server! It is entirely client-side. The only data that goes to and from the server are numbers for the parameters and coordinates for the points. All drawing is done on the client-side.

The image may be specified also as a URL instead, if you would rather use a publicly-accessible image from the web.

Each of the numerical parameters is specified using a number spinner, so you can easily tab around and use up/down arrows to fiddle with the values. The webpage automatically updates the output when you stop changing things for a few hundred milliseconds, so if you hold down the arrow key and change the numbers fast it will wait until you are finished before updating.

The output shows the image with a grid of points (in red) projected onto it. This grid is the projection of a 2-D grid plotted on the X and Y axes (the ground, essentially). The grid is specified by `xmin,xmax,ymin,ymax` and the density of points by `xtickcount,ytickcount`.

You may also specify a 'detections' file. This is a JSON file with a certain format showing bounding boxes for detected features (e.g. faces) in the image. The expected format of the detections file is: `[{'x': ..., 'y':, ..., 'w': ..., 'h': ...}, ...]` specifying the (x,y)-coords with width and height, all in pixels relative to the image in question. See the [https://github.com/AdaptiveCity/room_count] tool for producing detections files.

These detections are sent to the server and transformed (reverse-projected). The resulting top-down view is shown below the image, showing where cameratransform thinks each detection is located in the image if it were possible to get a view from directly above.
