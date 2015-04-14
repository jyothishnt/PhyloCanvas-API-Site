/********* JS for PhyloCanvas API Site **************/

$(document).ready(function(){
  $('[data-toggle="leftMenuToggle"]').click(function () {
    $('#leftmenu').toggleClass('hidden-xs')
  });

	$('#accordion_menu li a').on('click', function(){
        if($(this).attr('data-id') === 'play') {
            return;
        }
		loadTemplate(this);
		// $('#content section').hide();
		// $('#content section#'+$(this).attr('data-id')).show();
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

  var fragment = (window.location.hash)? window.location.hash.substring(1) : 'overview';
  show(fragment);
});

// To cache data loaded from the server
var html_data = {};
/***** Function to load content on menu click *****/
var loadTemplate = function(ele) {
    var url = '';
    if(!$(ele).length) {
        url= ele + '.html';
        //alert(url);
        $('#content').load(url);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return;
    }

    var _id = $(ele).attr('data-id');
    url= _id + '.html';

    if(_id === 'play') {
        return;
    }

    window.location = window.location.href.split('#')[0] + '#' + _id;

    if(html_data[_id]) {
    	$('#content').html('');
    	$('#content').append(html_data[_id]);
        if(phylocanvas)
            phylocanvas.resizeToContainer();
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
};
function show(div_id) {
	$('#accordion_menu li').find("[data-id="+div_id+"]").click();
}

var phylocanvas;
function createOverviewTree() {
    // Construct tree object
    phylocanvas = new PhyloCanvas.Tree('phylocanvas', { historyCollapsed : true });
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

function colour(response) {
    var colours = ['teal', '#762a83', '#777'];

    var data = JSON.parse(response.response);

    phylocanvas.setNodeColourAndShape(data.positive, colours[0], 'x');
    phylocanvas.setNodeColourAndShape(data.negative, colours[1], 'o');

    phylocanvas.backColour = function(node){
        if(node.children.length) {
            var child_cols = node.getChildColours();
            if(child_cols.length === 1) {
                return child_cols[0];
            }
            else {
                return colours[2];
            }
        }
        else {
            return node.colour;
        }
    };
}

$(document).on('click','#pc-buttons .btn', {} ,function(e){
    $('#pc-buttons .btn').removeClass('btn-info');
    $('#pc-buttons .btn').addClass('btn-default');
    $(this).addClass('btn-info');
	phylocanvas.setTreeType(this.id);
});

$(document).on('click','.showExample', {}, function(e){
    if($(this).html() == "View live") {
      console.log($(this).next('#jsbin_example').length);
        $(this).next('#jsbin_example').show();
        if($(this).next('#jsbin_example').length <= 0) {
            var ifr = document.createElement('iframe');
            ifr.width = "100%";
            ifr.height = $(this).attr('data-height');
            ifr.src = $(this).attr('data-href');
            var div = document.createElement('div');
            div.id = "jsbin_example";
            div.appendChild(ifr);
            $(div).insertAfter($(this));
        }
        else {
          $(this).next('#jsbin_example').show();
        }
        $(this).html('Hide');
    }
    else {
      $(this).next('#jsbin_example').hide();
      $(this).html('View live');
    }
});

function setIframeHeight(ifrm) {
    var doc = ifrm.contentWindow || ifrm.contentDocument.parentWindow;
    ifrm.style.visibility = 'hidden';
    ifrm.style.height = "10px"; // reset to minimal height ...
    // IE opt. for bing/msn needs a bit added or scrollbar appears
    ifrm.style.height = getDocHeight( doc ) + 4 + "px";
    ifrm.style.visibility = 'visible';
}

function getDocHeight(doc) {
    doc = doc || document;
    // stackoverflow.com/questions/1145850/
    var body = doc.body, html = doc.documentElement;
    var height = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    return height;
}


