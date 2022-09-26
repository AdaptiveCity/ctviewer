# Cameratransform viewer

Simple utility to help visualise the effect of different [cameratransform](https://github.com/rgerum/cameratransform) settings.

# Configuration

The beginning of `ct.js` can be edited

- `cturl`: change if you are putting `ct.py` in a different webspace or you wish to use the Huggingface backend (now default) or a different URL.

# Installation

Put the files `index.html`, `ct.py` and `styles.css` in a web-accessible folder somewhere that Python scripts can be CGI-executed and direct your browser to `index.html`.

Alternatively, run `ln -s . cgi-bin` and then you can use the python web server in the current directory. Set configuration parameter `cturl` to `cgi-bin/ct.py` and run `python3 -m http.server localhost 8080` or whichever port you like.

# Usage

The interface is very simplistic and simply gives you a handle on many different parameters you can tweak for cameratransform. You can specify an image file to project the coordinates on. This image file IS NOT UPLOADED to the server! It is entirely client-side. The only data that goes to and from the server are numbers for the parameters and coordinates for the points. All drawing is done on the client-side.

You may also specify a 'detections' file. This is a JSON file with a certain format showing bounding boxes for detected features (e.g. faces) in the image. The expected format of the detections file is: `[{'x': ..., 'y':, ..., 'w': ..., 'h': ...}, ...]` specifying the (x,y)-coords with width and height, all in pixels relative to the image in question.

These detections are sent to the server and transformed. The resulting top-down view is shown below the image.
