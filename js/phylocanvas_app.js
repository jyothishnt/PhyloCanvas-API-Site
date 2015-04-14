(function() {

  // output information
  function outputMessage(msg) {
    $("#messages").html(msg).effect("highlight", {color:'orange'}, 3000);
  }

  // file drag hover
  function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    // e.target.className = (e.type == "dragover" ? "hover" : "");
    if(e.type == "dragover") {
      $('body').addClass("hover");
      $('.centermiddle').children('i').addClass('fa-spin')
    }
    else {
      $('.centermiddle').children('i').removeClass('fa-spin')
      $('body').removeClass("hover");
    }
  }

  // file selection
  function FileSelectHandler(e) {
    // Cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;
    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      ParseFile(this, f);
    }
    $('body').removeClass("hover");
  }

  var metadata = {};

  // output file information
  function ParseFile(filedrag, file) {
    var fileType = /.*\.nwk|.*\.txt|.*\.tree|.*\.csv/i;

    if (file.name.match(fileType)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        if(checkIfTreeFile(reader.result)) {
          $('.slideDiv, #tools_li').show();
          // Clear canvas div before drawing new tree
          $(filedrag).find('#phylocanvas').children().remove();
          $('.centermiddle').remove();
          renderPhyloCanvas(reader.result);
          if(Object.keys(metadata).length > 0) {
            renderMetadata(metadata);
          }

        }
        else {
          metadata = csvToJson(reader.result);
          if(phylocanvas.root !== undefined) {
            renderMetadata(metadata);
          }
        }
      };

      reader.readAsText(file);
    }
     else {
      outputMessage("File not supported!");
    }
  }

  function renderMetadata(metadata) {
    $('#metadata_li').show();
    var datamap = {};
    phylocanvas.clearMetadata();
    for(var id in metadata.parsedData) {
      if(phylocanvas.branches[id]) {
        phylocanvas.branches[id]['data'] = metadata.parsedData[id];
      }
    }

    phylocanvas.viewMetadataColumns();
    openMetadataColumnWindow();
  }

  // click to open metadata column window
  function openMetadataColumnWindow() {
    //dialog options
    var dialogOptions = {
      "title" : "Metadata Columns",
      "width" : 250,
      "height" : 300,
      "modal" : false,
      "resizable" : true,
      "close" : function(){ $(this).remove(); }
    };

    // dialog-extend options
    var dialogExtendOptions = {
      "closable" : false,
      "maximizable" : false,
      "minimizable" : true,
      "dblclick" : 'minimize',
      "titlebar" : 'transparent'
    };
    // open dialog with column name buttons

    $("#metadataColumns").html('');
    createColumnCheckboxes(metadata.columnHeaders);
    // $("#metadataColumns").dialog(dialogOptions).dialogExtend(dialogExtendOptions);
  }

  function createColumnCheckboxes(columnHeaders) {
    var container = document.getElementById('metadataColumns');
    var div = document.createElement('div');
    var checkbox;
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'selectAll';
    checkbox.value = 'metadataColumnSelectAll';
    checkbox.id = 'metadataColumnSelectAllCheckbox';
    checkbox.checked = true;

    var label = document.createElement('label')
    label.htmlFor = 'Select All';
    label.appendChild(document.createTextNode('Select All'));

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);

    for (var i = 0; i < columnHeaders.length; i++) {
      div = document.createElement('div');
      checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.name = "metadata_columns_checkbox";
      checkbox.value = columnHeaders[i];
      checkbox.id = "metadata_columns_checkbox";
      checkbox.checked = true;

      var label = document.createElement('label')
      label.htmlFor = columnHeaders[i];
      label.appendChild(document.createTextNode(columnHeaders[i]));

      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    }
  }

  //Parse CSV file with headers
  function csvToJson(csv){
    var lines=csv.split("\n");
    var result = {};
    var headers=lines[0].split(",");
    for(var i=1;i<lines.length;i++){
      if (lines[i] == "") continue;
      var currentline=lines[i].split(",");
      result[currentline[0]] = {};
      for(var j=1;j<headers.length;j++){
        result[currentline[0]][headers[j]] = currentline[j];
      }
    }
    headers.shift();
    var hash = {
      'columnHeaders' : headers,
      'parsedData' : result
    }
    return hash; //JSON
  }
  function checkIfTreeFile(tree) {

    if (tree.match(/^#NEXUS[\s\n;\w\.\*\:(\),-=\[\]\/&]+$/i) || tree.match(/^[\w\.\*\:(\),-\/]+;\s?$/gi)) {
      return true;
    }
    else {
      return false;
    }

  }
  function renderPhyloCanvas(tree) {
    // Construct tree object
    phylocanvas = new PhyloCanvas.Tree('phylocanvas', {
      historyCollapsed : true
    });
    phylocanvas.setTreeType('rectangular');
    phylocanvas.nodeAlign = true;

    phylocanvas.addListener('loaded', function(){
      loadSlider(phylocanvas.textSize);
    });
    phylocanvas.addListener('subtree', function(){
      loadSlider(phylocanvas.textSize);
    });
    phylocanvas.addListener('typechanged', function(){
      loadSlider(phylocanvas.textSize);
    });

    phylocanvas.load(tree);
    window.phylocanvas = phylocanvas;
  }

  // initialize
  function Init() {

    $(document).ready(function(){
      // renderPhyloCanvas('((1:0.133,(2:0.24,3:0.44):0.189):0.415,(9:0.408,(1200:0.241,(8:0.13,(7:0.14,11:0.014):0.090):0.038):0.266):0.141):3.678);');
      // renderMetadata('label,data1,data2,data3\n1,1,0,0\n2,0,1,1\n3,1,0,1\n1200,1,1,1\n5,0,1,0');
    });

    var filedrag = document;
    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {

      // file drop
      filedrag.addEventListener("dragover", FileDragHover, false);
      filedrag.addEventListener("dragleave", FileDragHover, false);
      filedrag.addEventListener("drop", FileSelectHandler, false);
    }
  }

  // call initialization file
  if (window.File && window.FileList && window.FileReader) {
    Init();
  }

  function loadSlider(val) {
    $( ".slider_text" ).slider({
      value: val,
      min: val - 10,
      max: val + 10
    });
  }

})();


$(document).ready(function(){

  /******** Metadata column checkbox functions ***************/

  $(document).on('change','#metadataColumnSelectAllCheckbox', {} ,function(e){
    var checked = this.checked;
    $('input[name="metadata_columns_checkbox"').each(function() {
      this.checked = checked;
    });
    $('#metadata_columns_checkbox').change();
  });
  $(document).on('change','#metadata_columns_checkbox', {} ,function(e){
    var view_col_array = [];
    $('#metadata_columns_checkbox:checked').each(function() {
      view_col_array.push($(this).val());
    });
    if (view_col_array.length > 0) {
      phylocanvas.viewMetadataColumns(view_col_array);
    }
    else {
      phylocanvas.showMetadata = false;
    }
    phylocanvas.draw();
  });


  /******* Slide Menu *************/
  var defaultHideLeft = '-180px';
  $('.slideDiv').css('left', defaultHideLeft);

  var slideElementsHash = {};
  $('.slideUl li').on('click', function(e) {
    if($(this).hasClass('btn-warning')) {
      defaultHideLeft = '-180px';
      highlightSlideButton(this,false);
    }
    else {
      defaultHideLeft = '0px';
      highlightSlideButton(this,true);
    }

    $('.slideDiv').animate({
      'left': defaultHideLeft
    });

    $('.slideDivContent').hide();
    var ele = document.getElementById($(this).attr('data-toggle-id'));
    $(ele).show();
  });

  var highlightSlideButton = function(ele, bool) {
    if (bool) {
      $('.slideUl li').removeClass('btn-warning');
      $('.slideUl li').addClass('btn-default');
      $(ele).removeClass('btn-default');
      $(ele).addClass('btn-warning');
      $('.slideUl li').css({
        'width': '35px'
      });
      $(ele).animate({
        'width': '100px'
      });
    }
    else {
      $('.slideUl li').removeClass('btn-warning');
      $('.slideUl li').addClass('btn-default');
      $('.slideUl li').css({
        'width': '35px'
      });
    }
  };

  /**********  Tools Menu  *****************/
  $(document).on('click','.pc-buttons .btn', {} ,function(e){

    if(phylocanvas.root) {
      $('.pc-buttons .btn').removeClass('btn-info');
      $('.pc-buttons .btn').addClass('btn-default');
      $(this).addClass('btn-info');
      if(this.id == "rectangular" || this.id == "circular" || this.id == "diagonal" || this.id == "hierarchy" || this.id == "radial" )
        phylocanvas.setTreeType(this.id);
      else if(this.id == "hide")
        phylocanvas.hideLabels();
      else if(this.id == "align")
        phylocanvas.nodeAlign = !phylocanvas.nodeAlign;
      else if(this.id == "metadata")
        phylocanvas.showMetadata = !phylocanvas.showMetadata;
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
        phylocanvas.setNodeSize(ui.value);
      }
  });

  $(".slider_text").slider({
      range: "min",
      value: 1,
      min: 5,
      max: 10,
      slide: function(event, ui) {
        if(ui.value <= 0)
          ui.value = 1;
        phylocanvas.setTextSize(ui.value);
      }
  });

  $('#searchbox').keyup(function(){
    if(phylocanvas.root) {
      if(this.value != "")
        phylocanvas.findBranch(this.value);
      else {
        phylocanvas.root.setSelected(false, true);
        phylocanvas.draw();
      }
    }
  });

});