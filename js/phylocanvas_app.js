/*
filedrag.js - HTML5 File Drag & Drop demonstration
Featured on SitePoint.com
Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
*/
(function() {

  // getElementById
  function $id(id) {
    return document.getElementById(id);
  }


  // output information
  function outputMessage(msg) {
    var m = $id("messages");
    m.innerHTML = msg + "<br>" + m.innerHTML;
  }


  // file drag hover
  function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
  }


  // file selection
  function FileSelectHandler(e) {
    console.log(this)
    // cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      ParseFile(this, f);
    }

  }


  // output file information
  function ParseFile(filedrag, file) {
    var textType = /\*.nwk/;

    if (file.type.match(textType) || 1) {
      var reader = new FileReader();

      reader.onload = function(e) {
        if(checkIfTreeFile(reader.result)) {
          // Clear canvas div before drawing new tree
          $(filedrag).find('canvas').remove();
          renderPhyloCanvas(reader.result);
        }
        else {
          renderMetadata(reader.result);
        }
      };

      reader.readAsText(file);
    } else {
      outputMessage("File not supported!");
    }
  }

  function checkIfTreeFile(tree) {
    if (tree.match(/^#NEXUS[\s\n;\w\.\*\:(\),-=\[\]\/&]+$/i) || tree.match(/^[\w\.\*\:(\),-\/]+;\s?$/gi)) {
      return true;
    } else {
      return false;
    }

  }
  function renderPhyloCanvas(tree) {
    // Construct tree object
    phylocanvas = new PhyloCanvas.Tree('phylocanvas', { historyCollapsed : true });
    phylocanvas.setTreeType('rectangular');
    phylocanvas.load(tree);
    window.phylocanvas = phylocanvas;
  }

  // initialize
  function Init() {

    // var fileselect = $id("fileselect"),
      var filedrag = $id("filedrag");
      // submitbutton = $id("submitbutton");

    // file select
    // fileselect.addEventListener("change", FileSelectHandler, false);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {

      // file drop
      filedrag.addEventListener("dragover", FileDragHover, false);
      filedrag.addEventListener("dragleave", FileDragHover, false);
      filedrag.addEventListener("drop", FileSelectHandler, false);
      filedrag.style.display = "block";

      // remove submit button
      // submitbutton.style.display = "none";
    }

  }

  // call initialization file
  if (window.File && window.FileList && window.FileReader) {
    Init();
  }


})();



$(document).ready(function(){

  $(document).on('click','.toggle', {} ,function(e){
    if($('.pc-buttons').hasClass('collapsed')) {
      $('.pc-buttons').removeClass('collapsed');
      $('.pc-buttons').addClass('expand');
      $(this).html('<');
      $('.pc-buttons .buttons').show();
    }
    else {
      $('.pc-buttons').removeClass('expand');
      $('.pc-buttons').addClass('collapsed');
      $(this).html('>');
      $('.pc-buttons .buttons').hide();
    }
  });
  $(document).on('click','.pc-buttons .btn', {} ,function(e){

    if(phylocanvas.root) {
      $('.pc-buttons .btn').removeClass('btn-info');
      $('.pc-buttons .btn').addClass('btn-default');
      $(this).addClass('btn-info');
      if(this.id == "rectangular" || this.id == "circular" || this.id == "diagonal" || this.id == "hierarchy" || this.id == "radial" )
        phylocanvas.setTreeType(this.id);
      else if(this.id == "hide")
        phylocanvas.hideLabels();
      else if(this.id == "show")
        phylocanvas.displayLabels();
      else if(this.id == "toggle")
        phylocanvas.toggleLabels();
      else if(this.id == "redraw") {
        phylocanvas.branches['pcn5'].redrawTreeFromBranch();
      }
      else if(this.id == "revert_redraw") {
        phylocanvas.origRoot.redrawTreeFromBranch();
      }
      else if(this.id == "nodeColorTrue") {
        phylocanvas.backColour = false;
        phylocanvas.setNodeColourAndShape("1,2,3", 'orange', 'o', 5);
      }
      else if(this.id == "nodeColorFalse") {
        phylocanvas.backColour = false;
        phylocanvas.setNodeColourAndShape("1,2,3", 'black', 'o', 1);
      }
      else if(this.id == "branchColorTrue") {
        phylocanvas.backColour = true;
        phylocanvas.setNodeColourAndShape('1', "rgb(20,120,250)", "x", 5);
        phylocanvas.setNodeColourAndShape('2', "rgb(250,120,20)", "t", 5);
        phylocanvas.setNodeColourAndShape('9', "rgb(120,20,250)", "s", 5);
      }
      else if(this.id == "branchColorFalse") {
        phylocanvas.backColour = false;
        phylocanvas.setNodeColourAndShape('1', "black", "o", 1);
        phylocanvas.setNodeColourAndShape('2', "black", "o", 1);
        phylocanvas.setNodeColourAndShape('9', "black", "o", 1);
      }
      else if(this.id == "rotate") {
        phylocanvas.branches['pcn5'].rotate(event);
      }
      else if(this.id == "collapse") {
        phylocanvas.branches['pcn5'].collapsed = true;
      }
      else if(this.id == "expand") {
        phylocanvas.branches['pcn5'].collapsed = false;
      }

      phylocanvas.draw();
    }
    else {
      $( ".info" ).effect("highlight", {color:'lightblue'}, 3000);
    }
  });

  $(".slider_node").slider({
      range: "min",
      value: 1,
      min: 1,
      max: 10,
      slide: function(event, ui) {
        if(phylocanvas.root)
          phylocanvas.setNodeSize(ui.value);
      }
  });

  $(".slider_text").slider({
      range: "min",
      value: 1,
      min: 1,
      max: 10,
      slide: function(event, ui) {
        if(phylocanvas.root)
          phylocanvas.setTextSize(ui.value + 10);
      }
  });

  $(".slider_both").slider({
      range: "min",
      value: 1,
      min: 1,
      max: 10,
      slide: function(event, ui) {
        if(phylocanvas.root) {
          phylocanvas.setNodeSize(ui.value);
          phylocanvas.setTextSize(ui.value + 10);
        }
      }
  });


  $('#searchbox').keyup(function(){
    if(phylocanvas.root)
      if(this.value != "")
        phylocanvas.findBranch(this.value);
      else {
        phylocanvas.root.setSelected(false, true);
        phylocanvas.draw();
      }
  });

});