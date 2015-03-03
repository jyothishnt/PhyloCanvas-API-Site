
$(document).ready(function(){

	createOverviewTree();
	$('#accordion_menu li a').on('click', function(){
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

function show(div_id) {
	$('#'+div_id).show();
	$('#accordion_menu li a').removeClass('active');
	$('#accordion_menu li a[data-id="'+div_id+'"]').addClass('active');
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


$(document).on('click','.btn', {} ,function(e){
	phylocanvas.setTreeType(this.id);
})
