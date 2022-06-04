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

$(document).ready(function() {
    $('#image_filename').change(changed_imagefile)
    $('#focallength_mm').spinner({ step: 0.1, spin: trigger });
    $('#focallength_mm').spinner('value', 7);
	$('#sensor_width_mm').spinner({ step: 0.1, spin: trigger });
	$('#sensor_width_mm').spinner('value', 6.7);
	$('#sensor_height_mm').spinner({ step: 0.1, spin: trigger });
	$('#sensor_height_mm').spinner('value', 5.6);
	$('#image_width_px').spinner({ step: 1, spin: trigger });
	$('#image_width_px').spinner('value', $('#background').prop('width'));
	$('#image_height_px').spinner({ step: 1, spin: trigger });
	$('#image_height_px').spinner('value', $('#background').prop('height'));
	$('#elevation_m').spinner({ step: 0.1, spin: trigger });
	$('#elevation_m').spinner('value', 1.8);
	$('#pos_x_m').spinner({ step: 0.5, spin: trigger });
	$('#pos_x_m').spinner('value', 0);
	$('#pos_y_m').spinner({ step: 0.5, spin: trigger });
	$('#pos_y_m').spinner('value', 0);
	$('#tilt_deg').spinner({ step: 1, spin: trigger });
	$('#tilt_deg').spinner('value', 0);
	$('#heading_deg').spinner({ step: 1, spin: trigger });
	$('#heading_deg').spinner('value', 0);
	$('#roll_deg').spinner({ step: 1, spin: trigger });
	$('#roll_deg').spinner('value', 0);
	$('#xmin').spinner({ step: 1, spin: trigger });
	$('#xmin').spinner('value', -10);
	$('#xmax').spinner({ step: 1, spin: trigger });
	$('#xmax').spinner('value', 10);
	$('#xtickcount').spinner({ step: 1, spin: trigger });
	$('#xtickcount').spinner('value', 31);
	$('#ymin').spinner({ step: 1, spin: trigger });
	$('#ymin').spinner('value', 0);
	$('#ymax').spinner({ step: 1, spin: trigger });
	$('#ymax').spinner('value', 20);
	$('#ytickcount').spinner({ step: 1, spin: trigger });
	$('#ytickcount').spinner('value', 31);
    $('#background').hide();
    trigger();
});
