
$(document).ready(function(){
	$('#accordion_menu li a').on('click', function(){
		loadTemplate(this);
		$('#content section').hide();
		$('#content section#'+$(this).attr('data-id')).show();
		$('#accordion_menu li a').removeClass('active');
		$(this).addClass('active');
		
		if($(this).children('ul').length) {
			$(this).children('ul').slideDown();
		}
	});	

	/**** For github fork stick on scroll ****/

	var s = $("#fork");
	var pos = s.position();					   
	$(window).scroll(function() {
		var windowpos = $(window).scrollTop();
		if (windowpos >= pos.top) {
			s.addClass("stick");
		} else {
			s.removeClass("stick");	
		}
	});

	$('#content section').hide();
	show('overview');
})

var html_data = {};
/***** Function to load content on menu click *****/
var loadTemplate = function(ele) {
    if(!$(ele).length) {
        var url= ele + '.html';
        //alert(url);
        $('#content').load(url);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return;
    }
  
    var _id = $(ele).attr('data-id');
    var url= _id + '.html';

    if(html_data[_id]) {
    	$('#content').html('');
    	$('#content').append(html_data[_id]);
        // phylocanvas.resizeToContainer();
    }
    else {
	    $('#content').load(url, function (responseText, textStatus, req) {
	        if (textStatus == "error") {
	          $('#content').html('<h2><i class="fa fa-thumbs-o-down oblue"></i>This page is currently not available. Please try after some time</h2>');
	          return;
	        }

		    if(_id == "overview") {
				createOverviewTree();
		    }

		    html_data[_id] = $('#content section');
	    });
	}
    
}
function show(div_id) {
	$('#accordion_menu li').find("[data-id="+div_id+"]").click();

	// $('#'+div_id).show();
	// $('#accordion_menu li a').removeClass('active');
	// $('#accordion_menu li a[data-id="'+div_id+'"]').addClass('active');
}

var phylocanvas;
function createOverviewTree() {
    // Construct tree object
    phylocanvas = new PhyloCanvas.Tree('phylocanvas', { history_collapsed : true });
    phylocanvas.showLabels = true;
    phylocanvas.hoverLabel = true;
    phylocanvas.setTreeType('circular');
    // phylocanvas.nodeAlign = false;
    // phylocanvas.setTreeType('rectangular');
    phylocanvas.addListener('loaded', getData);
    phylocanvas.addListener('error', function(evt){
        alert(evt.message);
    });

    // load tree via AJAX and render using default params
    phylocanvas.load('data/tree.nwk');
}


function getData()
{
    phylocanvas.AJAX('data/mrsa.json', 'GET', '', colour);
}

function colour(response){
    var colours = ['teal', '#762a83', '#777'];

    var data = JSON.parse(response.response);

    phylocanvas.setNodeColourAndShape(data.positive, colours[0], 'x');
    phylocanvas.setNodeColourAndShape(data.negative, colours[1], 'o');

    phylocanvas.backColour = function(node)
    {
        if(node.children.length)
        {
            var child_cols = node.getChildColours();
            if(child_cols.length === 1)
            {
                return child_cols[0];
            }
            else
            {
                return colours[2];
            }
        }
        else
        {
            return node.colour;
        }
    };
}


$(document).on('click','#pc-buttons .btn', {} ,function(e){
    $('#pc-buttons .btn').removeClass('btn-info');
    $('#pc-buttons .btn').addClass('btn-default');
    $(this).addClass('btn-info');
	phylocanvas.setTreeType(this.id);
})
