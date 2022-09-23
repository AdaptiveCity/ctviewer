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
distparams = {}
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

check_key("distortion_k1", distparams)
check_key("distortion_k2", distparams)
check_key("distortion_k3", distparams)

check_key("xmin", ptsparams)
check_key("xmax", ptsparams)
check_key("xtickcount", ptsparams, int)
check_key("ymin", ptsparams)
check_key("ymax", ptsparams)
check_key("ytickcount", ptsparams, int)

result['projection_params']=projparams
result['spatial_params']=spatparams
result['distortion_params']=distparams
result['points_params']=ptsparams
result['detections']=json.loads(form.getfirst('detections', '[]'))
result['image_points']=[]

if result['success']:
    if distparams['distortion_k1'] and \
        (distparams['distortion_k1'] != 0 or distparams['distortion_k2'] != 0 or distparams['distortion_k3'] != 0):
        dis = ct.BrownLensDistortion(distparams['distortion_k1'], distparams['distortion_k2'], distparams['distortion_k3']) 
    else:
        dis = None

    cam = ct.Camera(ct.RectilinearProjection(**projparams),
                    ct.SpatialOrientation(**spatparams),
                    dis)
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
    for det in result['detections']:
        bottomCentre = np.array([det['x'] + det['w']/2, det['y'] + det['h']])
        td = cam.spaceFromImage(bottomCentre)[:2]
        det['td_x']=td[0]
        det['td_y']=td[1]


sys.stdout.write(json.dumps(result,indent=1))
sys.stdout.write('\n')
sys.stdout.close()
