const cturl = "ct.py";
var spin_timeout_ms = 300;

const keys =
   ['focallength_mm',
    'sensor_width_mm',
    'sensor_height_mm',
    'image_width_px',
    'image_height_px',
    'elevation_m',
    'pos_x_m',
    'pos_y_m',
    'tilt_deg',
    'heading_deg',
    'roll_deg',
    'xmin',
    'xmax',
    'xtickcount',
    'ymin',
    'ymax',
    'ytickcount'];

function draw_grid(pts) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const bkgd = document.getElementById('background');
    let w = $('#image_width_px').spinner('value');
    let h = $('#image_height_px').spinner('value');
    let new_w = 640; //FIXME: make configurable
    let new_h = h/w*new_w;
    let ratio_w = new_w/w;
    let ratio_h = new_h/h;
    // resize preview to something sane
    $('#canvas').prop('width', new_w);
    $('#canvas').prop('height', new_h);
    ctx.drawImage(bkgd, 0, 0, new_w, new_h);
    pts.forEach(pt => {
        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ff0000';
        ctx.arc(pt[0]*ratio_w, pt[1]*ratio_h, 2, 0, 2 * Math.PI);
        ctx.fill();
    });

}

function query_ct() {
    params = {};
    keys.forEach(key => params[key] = $('#'+key).spinner('value'));
    var res = $.get(cturl, params);

    res.done(function (data) {
        //console.log('received data')
        if(!data.success) {
            $('#status').html(data.errormsgs.join('<br/>'));
        } else {
            $('#status').text(JSON.stringify(data, null, 2));
            pts = data.image_points;
            draw_grid(data.image_points);
        }
    });
    return res;
}

var current_timeoutID = null;

function trigger(event, ui) {
    if (event && event.target && ui) {
        const url = new URL(window.location);
        url.searchParams.set(event.target.name, ui.value);
        window.history.replaceState({}, '', url);
    }
    if (current_timeoutID != null)
        clearTimeout(current_timeoutID);
    current_timeoutID = setTimeout(query_ct, spin_timeout_ms);
}

function changed_imagefile() {
    var files = $('#image_filename').prop('files');
    console.log('changed_imagefile' + files);
    if(files && files[0]) {
        var reader = new FileReader();
        $('#background').hide();
        reader.onload = function (e) {
            $('#background').ready(function () {
                // when image is fully loaded get width/height
                let w = $('#background').prop('width');
                let h = $('#background').prop('height');
                // set image_width/height_px
                $('#image_width_px').spinner('value', w);
                $('#image_width_px').spinner('disable');
                $('#image_height_px').spinner('value', h);
                $('#image_height_px').spinner('disable');
                trigger(null, null);
            });
            $('#background').attr('src', e.target.result);
        };
        reader.readAsDataURL(files[0]);
    }
}

function get_query_params() {
    return location.search ? location.search.substr(1).split`&`.reduce((qd, item) => {let [k,v] = item.split`=`; v = v && decodeURIComponent(v); (qd[k] = qd[k] || []).push(v); return qd}, {}) : {}
}

var qp;

function init_spinner(name, step, defaultv) {
    if(name in qp)
        v = Number(qp[name]);
    else
        v = defaultv;
    $('#'+name).spinner({ step: step, spin: trigger });
    $('#'+name).spinner('value', v);
}

$(document).ready(function() {
    qp = get_query_params();
    $('#image_filename').change(changed_imagefile)
    init_spinner('focallength_mm', 0.1, 7);
	init_spinner('sensor_width_mm', 0.1, 6.7);
	init_spinner('sensor_height_mm', 0.1, 5.6);
	init_spinner('image_width_px', 1, $('#background').prop('width'));
	init_spinner('image_height_px', 1, $('#background').prop('height'));
	init_spinner('elevation_m', 0.1, 1.8);
	init_spinner('pos_x_m', 0.5, 0);
	init_spinner('pos_y_m', 0.5, 0);
	init_spinner('tilt_deg', 1, 0);
	init_spinner('heading_deg', 1, 0);
	init_spinner('roll_deg', 1, 0);
	init_spinner('xmin', 1, -10);
	init_spinner('xmax', 1, 10);
	init_spinner('xtickcount', 1, 31);
	init_spinner('ymin', 1, 0);
	init_spinner('ymax', 1, 20);
	init_spinner('ytickcount', 1, 31);
    $('#background').hide();
    trigger();
});
