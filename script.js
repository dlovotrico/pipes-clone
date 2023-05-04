$(document).ready(function () {
    jsPlumb.setContainer($('#grid'));

    var filterEndpointOptions = {
        endpoint: "Rectangle",
        paintStyle: {
            width: 20,
            height: 20,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2
        },
        isSource: true,
        connector: ["Flowchart", { curviness: 20 }],
        connectorStyle: {
            stroke: 'black',
            strokeWidth: 2
        },
        isTarget: true,
        dropOptions: { hoverClass: "hover" }
    };

    var decisionEndpointOptions = {
        endpoint: "Dot",
        paintStyle: {
            radius: 10,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2
        },
        isSource: true,
        connector: ["Flowchart", { curviness: 20 }],
        connectorStyle: {
            stroke: 'black',
            strokeWidth: 2
        },
        isTarget: true,
        dropOptions: { hoverClass: "hover" }
    };

    $('.filter-draggable').draggable({
        helper: 'clone',
        appendTo: 'body',
        zIndex: 100,
        stack: 'body',
        start: function (event, ui) {
            ui.helper.removeClass("filter-draggable");
            ui.helper.addClass("filter-dragging");
        },
        stop: function (event, ui) {
            ui.helper.removeClass("filter-dragging");
            ui.helper.addClass("filter-dropped");

            var id = ui.helper.text().replace(/\s/g, '') + '-' + new Date().getTime();
            var filter = $('<div>').attr('id', id).addClass('filter').html(ui.helper.text());
            $('#grid').append(filter);
            filter.css('left', ui.position.left - $('#grid').offset().left);
            filter.css('top', ui.position.top - $('#grid').offset().top);

            jsPlumb.addEndpoint(filter, { anchor: 'Top' }, filterEndpointOptions);
            jsPlumb.addEndpoint(filter, { anchor: 'Right' }, filterEndpointOptions);
            jsPlumb.addEndpoint(filter, { anchor: 'Bottom' }, filterEndpointOptions);
            jsPlumb.addEndpoint(filter, { anchor: 'Left' }, filterEndpointOptions);
        }
    });

    $('.decision-draggable').draggable({
        helper: 'clone',
        appendTo: 'body',
        zIndex: 100,
        stack: 'body',
        start: function (event, ui) {
            ui.helper.removeClass("decision-draggable");
            ui.helper.addClass("decision-dragging");
        },
        stop: function (event, ui) {
            ui.helper.removeClass("decision-dragging");
            ui.helper.addClass("decision-dropped");
        }
    
            var id = ui.helper.text().replace(/\s/g, '') + '-' + new Date().getTime();
            var decision = $('<div>').attr('id', id).addClass('decision').html(ui.helper.text());
            $('#grid').append(decision);
            decision.css('left', ui.position.left - $('#grid').offset().left);
            decision.css('top', ui.position.top - $('#grid').offset().top);

            jsPlumb.addEndpoint(decision, { anchor: 'Top' }, decisionEndpointOptions);
            jsPlumb.addEndpoint(decision, { anchor: 'Right' }, decisionEndpointOptions);
            jsPlumb.addEndpoint(decision, { anchor: 'Bottom' }, decisionEndpointOptions);
            jsPlumb.addEndpoint(decision, { anchor: 'Left' }, decisionEndpointOptions);
            jsPlumb.addEndpoint(decision, { anchor: 'Right' }, decisionEndpointOptions);
            jsPlumb.addEndpoint(decision, { anchor: 'Bottom' }, decisionEndpointOptions);
            jsPlumb.draggable(decision, { containment: 'parent' });
            
            // When a filter or decision is dropped, add it to the global array and update the pipeline object
            $('.filter, .decision').on('mouseup', function() {
              // Get the position and dimensions of the dropped item
              var id = $(this).attr('id');
              var type = $(this).hasClass('filter') ? 'filter' : 'decision';
              var top = parseInt($(this).css('top'));
              var left = parseInt($(this).css('left'));
              var width = $(this).width();
              var height = $(this).height();
            
              // Update the pipeline object
              pipeline.items[id] = { type: type, top: top, left: left, width: width, height: height };
            
              // Save the pipeline object to localStorage
              localStorage.setItem('pipeline', JSON.stringify(pipeline));
            });
            
            // When a pipe is dropped, update the pipeline object
            $('.pipe').on('mouseup', function() {
              // Get the source and target ids of the pipe
              var sourceId = $(this).data('source');
              var targetId = $(this).data('target');
            
              // Update the pipeline object
              pipeline.pipes.push({ source: sourceId, target: targetId });
            
              // Save the pipeline object to localStorage
              localStorage.setItem('pipeline', JSON.stringify(pipeline));
            });
            
            // Load the saved pipeline object from localStorage and render the items and pipes
            var savedPipeline = localStorage.getItem('pipeline');
            if (savedPipeline) {
              pipeline = JSON.parse(savedPipeline);
            
              // Render the items
              $.each(pipeline.items, function(id, item) {
                var itemHtml = '<div id="' + id + '" class="' + item.type + '" style="top: ' + item.top + 'px; left: ' + item.left + 'px; width: ' + item.width + 'px; height: ' + item.height + 'px;">';
                if (item.type == 'filter') {
                  itemHtml += '<h3>Filter</h3><p>This is a filter</p>';
                } else {
                  itemHtml += '<h3>Decision</h3><p>This is a decision</p>';
                }
                itemHtml += '</div>';
                $('.building-area').append(itemHtml);
                jsPlumb.makeSource(id, { anchor: 'Right' }, sourceEndpointOptions);
                jsPlumb.makeTarget(id, { anchor: 'Left' }, targetEndpointOptions);
                jsPlumb.makeTarget(id, { anchor: 'Right' }, targetEndpointOptions);
                jsPlumb.makeTarget(id, { anchor: 'Bottom' }, targetEndpointOptions);
                jsPlumb.draggable(id, { containment: 'parent' });
              });
            
              // Render the pipes
              $.each(pipeline.pipes, function(index, pipe) {
                var sourceId = pipe.source;
                var targetId = pipe.target;
                var pipeHtml = '<div class="pipe" data-source="' + sourceId + '" data-target="' + targetId + '"></div>';
                jsPlumb.connect({
                  source: sourceId,
                  target: targetId,
                  endpoint: pipeEndpointOptions,
                  paintStyle: pipePaintStyle
                });
                $('.building-area').append(pipeHtml);
              });
            }

    // When the connection is established, add the connection to the connections array
    instance.bind('connection', function (info, originalEvent) {
        connections.push(info.connection);
      });
  
      // When a connection is detached, remove it from the connections array
      instance.bind('connectionDetached', function (info, originalEvent) {
        var idx = connections.indexOf(info.connection);
        if (idx !== -1) {
          connections.splice(idx, 1);
        }
      });
  
      // When a connection is deleted, remove it from the connections array
      instance.bind('connectionDeleted', function (info, originalEvent) {
        var idx = connections.indexOf(info.connection);
        if (idx !== -1) {
          connections.splice(idx, 1);
        }
      });
  
      // Save the current state of the flowchart
      $('#save').on('click', function () {
        var nodes = [],
          edges = [];
  
        // Loop through all the boxes and add them to the nodes array
        $('.window').each(function () {
          var node = $(this);
          nodes.push({
            id: node.attr('id'),
            left: parseInt(node.css('left'), 10),
            top: parseInt(node.css('top'), 10),
            label: node.find('.title').text(),
            type: node.hasClass('decision') ? 'decision' : 'filter',
          });
        });
  
        // Loop through all the connections and add them to the edges array
        $.each(connections, function (idx, connection) {
          edges.push({
            source: connection.sourceId,
            target: connection.targetId,
          });
        });
  
        // Save the state to local storage
        localStorage.setItem('nodes', JSON.stringify(nodes));
        localStorage.setItem('edges', JSON.stringify(edges));
      });
  
      // Load the previous state of the flowchart, if any
      $('#load').on('click', function () {
        // Retrieve the state from local storage
        var nodes = JSON.parse(localStorage.getItem('nodes')),
          edges = JSON.parse(localStorage.getItem('edges'));
  
        // Remove all existing nodes and connections
        jsPlumb.deleteEveryEndpoint();
        jsPlumb.deleteEveryConnection();
  
        // Add the nodes to the flowchart
        $.each(nodes, function (idx, node) {
          var html = node.type === 'decision' ? decisionHtml : filterHtml;
          html = html.replace('{{title}}', node.label);
          var newNode = $(html);
          newNode.attr('id', node.id);
          newNode.css({
            left: node.left + 'px',
            top: node.top + 'px',
          });
          $chart.append(newNode);
          jsPlumb.addEndpoint(node.id, { anchor: 'Top' }, endpointOptions);
          jsPlumb.addEndpoint(node.id, { anchor: 'Right' }, endpointOptions);
          jsPlumb.addEndpoint(node.id, { anchor: 'Bottom' }, endpointOptions);
          jsPlumb.addEndpoint(node.id, { anchor: 'Left' }, node.type === 'decision' ? decisionEndpointOptions : filterEndpointOptions);
        });
  
        // Add the connections to the flowchart
        $.each(edges, function (idx, edge) {
          jsPlumb.connect({
            source: edge.source,
            target: edge.target,
          });
        });
      });
    });
  })(jQuery);
  
            
