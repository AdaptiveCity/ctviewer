#!/usr/bin/python3
import sys
import json
import numpy as np
import itertools
import cameratransform as ct
import cgi
import cgitb
cgitb.enable()

form = cgi.FieldStorage()

sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")

projparams = {}
spatparams = {}
ptsparams = {}

result = {}
result['success']=True
result['errormsgs']=[]

def check_key(key, destdict, caster=float):
    if key not in form:
        result['success'] = False
        result['errormsgs'].append('{} is missing'.format(key))
    else:
        destdict[key] = caster(form.getvalue(key))


check_key("focallength_mm", projparams)
check_key("sensor_width_mm", projparams)
check_key("sensor_height_mm", projparams)
check_key("image_width_px", projparams, int)
check_key("image_height_px", projparams, int)

check_key("elevation_m", spatparams)
check_key("pos_x_m", spatparams)
check_key("pos_y_m", spatparams)
check_key("tilt_deg", spatparams)
check_key("heading_deg", spatparams)
check_key("roll_deg", spatparams)

check_key("xmin", ptsparams)
check_key("xmax", ptsparams)
check_key("xtickcount", ptsparams, int)
check_key("ymin", ptsparams)
check_key("ymax", ptsparams)
check_key("ytickcount", ptsparams, int)

result['projection_params']=projparams
result['spatial_params']=spatparams
result['points_params']=ptsparams
result['image_points']=[]

if result['success']:
    cam = ct.Camera(ct.RectilinearProjection(**projparams),
                    ct.SpatialOrientation(**spatparams))
    fakepts=list(itertools.product(np.linspace(ptsparams['xmin'],ptsparams['xmax'],ptsparams['xtickcount']),
                                   np.linspace(ptsparams['ymin'],ptsparams['ymax'],ptsparams['ytickcount'])))
    for worldpt in fakepts:
        campt=cam.imageFromSpace((worldpt[0], worldpt[1], 0))
        if np.isnan(campt).any(): continue
        campt_uint=campt.astype(np.int32)
        #print("worldpt={} campt={} _uint={}".format(worldpt,campt,campt_uint))
        x, y = (int(campt_uint[0]), int(campt_uint[1]))
        if 0 <= x and x < projparams['image_width_px'] and\
           0 <= y and y < projparams['image_height_px']:
           result['image_points'].append([x,y])


sys.stdout.write(json.dumps(result,indent=1))
sys.stdout.write('\n')
sys.stdout.close()
