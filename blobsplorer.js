
// some globals to play with

// these must match the size of the canvas div 
// TODO pick up these automatically from the div directly
var paper_height = 1000;
var paper_width = 1000;
var list_of_ranks = ['superfamily', 'genus', 'order', 'kingdom', 'family', 'phylum'];

var colours = ['#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#34495E', '#F39C12', '#D35400', '#C0392B'];
var point_radius = 2;
var point_opacity = 1;

// function to grab all the points that lie inside the current ellipse
get_points_inside_ellipse = function(){
    var points = {};
    for (var h=0;h<window.all_ellipses.length;h++){
        var ellipse = window.all_ellipses[h];
        var ellipsetheta = Math.radians(ellipse.myRotation);
        var ellipsex = ellipse.attrs.cx;
        var ellipsey = ellipse.attrs.cy;
        var ellipserx = ellipse.attrs.rx;
        var ellipsery = ellipse.attrs.ry;
        for (var i=0;i<window.points.length; i++){
            var point = window.points[i];
            if (!(point.contig_id in points)){

                var pointx = ((point.attrs.cx - ellipsex)* Math.cos(ellipsetheta)) + ((point.attrs.cy - ellipsey) * Math.sin(ellipsetheta)) + ellipsex;
                var pointy = ((point.attrs.cy - ellipsey) * Math.cos(ellipsetheta)) - ((point.attrs.cx - ellipsex)* Math.sin(ellipsetheta)) + ellipsey;

                //scary math to calculate if the point lies within the elipse
                if ((Math.pow((pointx - ellipsex), 2) / Math.pow(ellipserx, 2)) + (Math.pow((pointy - ellipsey), 2) / Math.pow(ellipsery, 2)) < 1){
                    points[point.contig_id] = true;
                }
            }
        }
    }
    return points;
}

show_selected = function(e){
    var selected_ids = get_points_inside_ellipse();
    for (var i=0;i<window.points.length; i++){
        var point = window.points[i];
        if (point.contig_id in selected_ids){
            point.attr('fill', 'red');
        }
        else{
            point.attr('fill', 'blue');
        }
    }
}

download_selected = function(e){
    var selected_ids = Object.keys(get_points_inside_ellipse());
    window.open('data:application/octet-stream;charset=utf-8,' + selected_ids.join(','), '_blank');
    //$('#download_ids').attr('HREF', 'DATA:TEXT/PLAIN;CHARSET=UTF-8,' + SELECTed_ids.join(','));
    //$('#download_ids').show();
}

hide_others = function(rank, name){
   for (var i=0;i<window.points.length;i++){
       var point = window.points[i];
       console.log(point.taxonomic_data[rank]);
       if (point.taxonomic_data[rank] !=name){
              point.attr('fill-opacity', '0.1');
       }
   }
}

show_all = function(){
   for (var i=0;i<window.points.length;i++){
       var point = window.points[i];
       point.attr('fill-opacity', point_opacity);
   }
}

// function to switch between colourings
change_colour = function(rank){
    console.log('switching to ' + rank);
    $('#key').empty();
    var heading = $('<h2>').text('Colour key');
    $('#key').append(heading);
    var assigned_count = 0;
    for (var i=0;i<Math.min(7, window.tax_colours[rank]['counts'].length); i++){
        var name = window.tax_colours[rank]['counts'][i][0];
        var count = window.tax_colours[rank]['counts'][i][1];
        var item = $('<h5 class="btn">')
            .css('background-color', window.tax_colours[rank]['counts'][i][2])
            .css('color',  'black')
            .css('text-transform',  'none')
            .css('text-align',  'center')
            .text(name + ' (n=' + count + ')');
        item.hover(
            function(x,y){return function(){hide_others(x,y)};}(rank,name),
            show_all
            );
        $('#key').append(item);
        assigned_count = assigned_count + count;
    }
    var  other = $('<h5 class="btn">')
        .css('background-color',  '#7F8C8D')
        .css('text-transform',  'none')
        .css('color',  'black')
        .css('text-align',  'center')
        .text('unclassified/other' + '(n=' + (window.points.length - assigned_count) + ')');
    $('#key').append(other);

    for (var i=0;i<window.points.length;i++){
        var point = window.points[i];
        var new_colour = '#7F8C8D';
        if (typeof point.taxonomic_data[rank] != "undefined"){
            new_colour = window.tax_colours[rank]['name2colour'][point.taxonomic_data[rank]];
        }
        point.attr('fill', new_colour);
    }

    // move all unclassified points to the back
    var unclassified = window.points.filter(function(point){return point.attrs.fill == "#7F8C8D"});
   for (var i=0;i<unclassified.length;i++){unclassified[i].toBack()};
}

// utility functions for trig
// Converts from degrees to radians.
Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
  };

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

function log10(val) {
      return Math.log(val) / Math.LN10;
}

// functions for drawing an ellipse
// start, move, and up are the drag functions
start = function() {
    // storing original coordinates
    this.ox = this.attr("x");
    this.oy = this.attr("y");
    this.attr({
        opacity: 1
    });
    if (this.attr("y") < 60 && this.attr("x") < 60) this.attr({
        fill: "#000"
    });
    }, 
move = function(dx, dy) {

    // move will be called with dx and dy
    if (this.attr("y") > 200 || this.attr("x") > 300) this.attr({
        x: this.ox + dx,
        y: this.oy + dy
    });
    else {
        nowX = Math.min(300, this.ox + dx);
        nowY = Math.min(200, this.oy + dy);
        nowX = Math.max(0, nowX);
        nowY = Math.max(0, nowY);
        this.attr({
            x: nowX,
            y: nowY
        });
        if (this.attr("fill") != "#000") this.attr({
            fill: "#000"
        });
    }

    }, 
up = function() {
    // restoring state
    this.attr({
        opacity: .5
    });
    if (this.attr("y") < 60 && this.attr("x") < 60) this.attr({
        fill: "#AEAEAE"
    });
    
};

function draw_ellipse(x, y, w, h) {

    var element = window.paper.ellipse(x, y, w, h);
    element.attr({
        fill: "gray",
        'fill-opacity': 0,
        stroke: "#000"
    });
    $(element.node).attr('id', 'rct' + x + y);
    console.log(element.attr('x'));

    element.drag(move, start, up);
    element.click(function(e) {

        elemClicked = $(element.node).attr('id');

    });

    return element;
}
function setRotation(e){

    console.log('setting rotation');
    // Prevent text edit cursor while dragging in webkit browsers
    e.originalEvent.preventDefault();

    var offset = $("#canvas").offset();
    mouseDownX = e.pageX - offset.left;
    mouseDownY = e.pageY - offset.top;


    $("#canvas").unbind("mousemove");
    $("#canvas").unbind("click");
    $("#canvas").click(setCentre);
  
    window.all_ellipses.push(window.ellipse);
    $('#download_ids').show();
}

function setCentre(e){

    console.log('setting centre');
    // Prevent text edit cursor while dragging in webkit browsers
    e.originalEvent.preventDefault();
    var offset = $("#canvas").offset();
    mouseDownX = e.pageX - offset.left;
    mouseDownY = e.pageY - offset.top;
    window.ellipse = draw_ellipse(mouseDownX, mouseDownY, 0, 0);
    $("#canvas").mousemove(function(e) {
        var offset = $("#canvas").offset();
        var upX = e.pageX - offset.left;
        var upY = e.pageY - offset.top;

        var width = upX - mouseDownX;
        var height = upY - mouseDownY;

        window.ellipse.attr( { "rx": width > 0 ? width : 0,
            "ry": height > 0 ? height : 0 } );
        });
    $("#canvas").unbind("click");
    $("#canvas").click(setSize);
  
}

function setSize(e){
    console.log("setting size");                   
    $("#canvas").unbind("mousemove");
    var BBox = window.ellipse.getBBox();
    if (BBox.width==0 && BBox.height==0) window.ellipse.remove();
    $("#canvas").unbind("mousemove");
    $("#canvas").mousemove(function(e) {
        var offset = $("#canvas").offset();
        var upX = e.pageX - offset.left;
        var upY = e.pageY - offset.top;

        var width = upX - mouseDownX;
        var height = upY - mouseDownY;

        console.log(height);
        window.ellipse.transform("r" + height);
        window.ellipse.myRotation = height;

    var ellipsetheta = Math.radians(- window.ellipse.myRotation);
    for (var i=0;i<window.points.length; i++){
        var point = window.points[i];
        var ellipsex = window.ellipse.attrs.cx;
        var ellipsey = window.ellipse.attrs.cy;
        var ellipserx = window.ellipse.attrs.rx;
        var ellipsery = window.ellipse.attrs.ry;


    }

    });
    $("#canvas").unbind("click");
    $("#canvas").click(setRotation);
}

// big function to read data from the file and transform it into an array of points
// also to calculate the colours for display taxonomic annotation
read_in_data = function(e){
   
    var file = $('#myfile')[0].files[0];
    console.log(file);
    var reader = new FileReader();

    window.paper = Raphael("canvas", paper_height, paper_width);
    
    reader.onprogress = function(e){
        var percentLoaded = Math.round((e.loaded / e.total) * 100);
        console.log(percentLoaded + '%');
    }

    var sample_every = parseFloat($('#sample_every').val());


    function get_data(cols)  {

        var result = {};
        result.length = parseFloat(cols[2]);
        result.coverage = log10(parseFloat(cols[3]));
        result.gc = parseFloat(cols[4]);
        result.id = cols[1];
        result.taxonomic_data={};
        //now process taxonomic information
        for (var j=5;j<cols.length;j++){
            if (list_of_ranks.indexOf(cols[j]) > -1){
                result.taxonomic_data[cols[j]] = cols[j+1];
            }
        }
        return result;

    }

    reader.onload = function(thefile){
        var start = new Date();
        window.points = new Array();
        var data = thefile.target.result.split('\n');
        window.data = data;
        var tax_table = {};
        for (var h=0;h<list_of_ranks.length;h++){
            tax_table[list_of_ranks[h]] = {};
        }

        window.max_length=0;
        window.max_coverage=0;
        window.max_gc=0;
        window.min_gc=1;
        //process the file data once to calculate the max and the colours for taxonomic annotation
        for (var i=0; i<data.length; i++){
            
            if (i % 1000 == 0){
                console.log('processed' + i);
            }

            if (data[i] != '' && i % sample_every == 0){
                var cols = data[i].split('\t');
                var row_data = get_data(cols);
                window.max_length = Math.max(window.max_length, row_data.length);
                window.max_coverage = Math.max(window.max_coverage, row_data.coverage);
                window.max_gc = Math.max(window.max_gc, row_data.gc);
                window.min_gc = Math.min(window.min_gc, row_data.gc);

                // if this row has taxonomic info, add it to the count
                for (var h=0;h<list_of_ranks.length;h++){
                    var rank_name = list_of_ranks[h];
                    var this_rows_id = row_data.taxonomic_data[rank_name];
                    if (typeof this_rows_id != "undefined"){
                        var current_count_for_id = tax_table[rank_name][this_rows_id];
                        if (typeof current_count_for_id === "undefined"){
                            current_count_for_id = 0;
                        }
                        tax_table[rank_name][this_rows_id] = current_count_for_id + 1;
                    }
                }
            }
        }


        // now we have a completed taxon count we can set up the colors
        window.tax_colours = {};
        for (var h=0;h<list_of_ranks.length;h++){
            var rank_name = list_of_ranks[h];
            window.tax_colours[rank_name] = {};
            var rank_counts = tax_table[rank_name];
            var sortable = [];
            var name2colour = {};
            for (var rank in rank_counts){
                sortable.push([rank, rank_counts[rank]]);
            }
            sortable.sort(function(a, b) {return b[1] - a[1]})
            for (var i=0;i<sortable.length;i++){
                if (i < 7){
                    sortable[i].push(colours[i]);
                    name2colour[sortable[i][0]] = colours[i];
                } 
                else{
                    sortable[i].push('#7F8C8D');
                    name2colour[sortable[i][0]] = '#7F8C8D';
                }
            }
            window.tax_colours[rank_name]['counts'] = sortable;
            window.tax_colours[rank_name]['name2colour'] = name2colour;
        }


        // plot some axes
        for (var i=0;i<Math.ceil(window.max_coverage);i++){
            var tick_y_pos = paper_height - ( (i / window.max_coverage) * paper_height ); 
            var tick = window.paper.rect(0, tick_y_pos+7, paper_width,1);
            tick.attr("fill", "lightgrey");
            tick.attr("stroke-width",0);
            var label = window.paper.text(20, tick_y_pos, '10^' + i);
            label.attr("font-size", 14);

        }



        for (var i=0;i<Math.ceil(window.max_gc - window.min_gc);i = i+0.1){
            var tick_x_pos =  (((i-window.min_gc)/(window.max_gc - window.min_gc)) * paper_width);
            var tick = window.paper.rect(tick_x_pos,0 , 1,paper.height);
            tick.attr("fill", "lightgrey");
            tick.attr("stroke-width",0);
            var label = window.paper.text(tick_x_pos, 10, i.toFixed(1));
            label.attr("font-size", 14);

        }


        //now add the actual points
        for (var i=0; i<data.length; i++){
            if (i % 1000 == 0){
                console.log('created' + i);
            }
            if (data[i] != '' && i % sample_every == 0){
                var cols = data[i].split('\t');
                var row_data = get_data(cols);
                var point_x_pos =  (((row_data.gc-window.min_gc)/(window.max_gc - window.min_gc)) * paper_width);
                var point_y_pos = paper_height - ( (row_data.coverage / window.max_coverage) * paper_height ); 
                var point = window.paper.circle(point_x_pos, point_y_pos, point_radius);
                point.attr("fill", "red");
                point.attr("stroke-width",0);
                point.attr("fill-opacity",point_opacity);
                point.taxonomic_data = row_data.taxonomic_data;
                point.contig_id = row_data.id;

                window.points.push(point);
            }
        }
        var end = new Date();
        change_colour('phylum')
        console.log('rendered in ' + (end - start));
    }
    reader.readAsText(file);
   

}

enableLoadButton = function(){
    $('#load').removeClass('disabled');
    $('#load').addClass('btn-success');
}
 disableLoadButton= function(){
    $('#load').addClass('disabled');
    $('#load').removeClass('btn-success');
}

$(document).ready(function() {

            var mouseDownX = 0;
            var mouseDownY = 0;
            var elemClicked;

            window.all_ellipses = new Array();

            // first click sets the centre
            $("#canvas").click(setCentre);

            // clicking go grabs the points inside the ellipse
            $("#download_ids").click(download_selected);

            // clicking load loads the data
            $('#load').click(read_in_data);

            // show selected points
            $('#show_selected').click(show_selected);

            // disable the load button until we have selected a file
            disableLoadButton();

            // show the load button when we change filename
            $('#myfile').change(function(){enableLoadButton();$('#top_tooltip').hide();})

            // selector to switch color - we need to do this instead of relying on change events because
            // bootstrap hides the actual select
            $('#dk_container_colour_by  li').click(function(e){change_colour($(e.target).attr('data-dk-dropdown-value'))});

            $('#download_ids').hide();
            $('#help_button').click(function(){$('body').chardinJs('toggle')});
        });


