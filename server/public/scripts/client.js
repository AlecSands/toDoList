console.log('javascript sourced');

// Begin document ready
$('document').ready(function(){
  console.log('jquery sourced');

  // Loads the persistent data from the database and appends it to the DOM
  refreshTasks();

  // Event listener for submit on the HTML form element
  $("#newTaskForm").on("submit", function(e) {
    // Prevents the default behaviour of form elements on submit
    e.preventDefault();

    // Retrieve values from the DOM and store them in the object 'newTask'
    // I used the submit button type, but I don't think it is providing any
    // additional functionality.  I will use button next time.
    var newTask = {};
    newTask.description = $("#newTaskDesc").val();
    newTask.status = 'n';
    // Converting this string to lowercase so that it matches formatting
    // in the database and doesn't mess up the d3 object.
    newTask.location = $('input:radio[name=location]:checked').val().toLowerCase();

    // Send AJAX POST request to the server with the object 'newTask'
    $.ajax({
      url: "/tasks",
      type: "POST",
      data: newTask,
      success: function(response) {
        console.log('ajax response: ', response);
        // Refresh the data so that it reflects the most current database
        refreshTasks();
      }
    }); // end of AJAX POST
  }); // end of submit button listener

  // Add event listener to task complete button
  $("#viewTasks").on('click', '.completeBtn', function(){
    // Select the object that was stored in the data for this task.
    // It includes all of the data that was sent from the database for this row.
    var thisTaskData = $(this).parent().parent().data().task;

    // Set the completion status for the is task to 'y' for 'yes it is complete'
    thisTaskData.task_complete = 'y';

    // Send AJAX PUT request to update the database with the new completion status
    $.ajax({
       url: '/tasks',
       type: 'PUT',
       data: thisTaskData,
       success: function(response) {
         console.log('tasks updated');
         // Refresh the data so that it reflects the most current database
         refreshTasks();
       }
    }); // end of AJAX PUT

  }); // end of complete button listener

  // Add event listener for click on delete button
  $("#viewTasks").on('click', '.deleteBtn', function(){
    // Select the object that was stored in the data for this task.
    // It includes all of the data that was sent from the database for this row.
    var thisTaskData = $(this).parent().parent().data().task;

    // Send AJAX DELETE request to delete a row from the database
    $.ajax({
       url: '/tasks/' + thisTaskData.user_id,
       type: 'DELETE',
       success: function(response) {
         console.log('tasks deleted');
         refreshTasks();
       }
    });

  });

}); // End of document ready

// Updates the most current tasks to the DOM
function refreshTasks() {
  // Clears out the previous tasks from the table element
  $('#viewTasks').empty();

  // Sends a GET request for the most current tasks in the database.
  $.ajax({
    url: '/tasks',
    type: 'GET',
    success: function(response){
      console.log(response);
      var tasks = response.tasks;
      for (i=0; i<tasks.length; i++) {
        var task = tasks[i];
        $tr = $('<tr class="' + task.task_complete + '"></tr>');
        $tr.data('task', task);
        $tr.append('<td>' + task.description + '</td>');
        $tr.append('<td>' + task.location + '</td>');
        $tr.append('<td>' + task.task_complete + '</td>');
        $tr.append('<td><button type="button" class="completeBtn">complete</button></td>');
        $tr.append('<td><button type="button" class="deleteBtn">delete</button></td>');
        $('#viewTasks').append($tr);
      }
      refreshGraph();
    }
  });
}

// Creates a force directed graph (FDG) using the d3.js library
function refreshGraph () {
  var width = window.innerWidth;
  var height = 400;

  // Clears all elements nested in the svg element
  $('#canvasContainer').empty();

  // Selects the svg element on the DOM and stores it in a variable
  var svg = d3.select("#canvasContainer").append("svg").attr("width", width).attr("height", height);

  //  Sets the color scale to be used when coloring svg elements
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  // Sets the parameters that control the characteristics of the FDG
  var simulation = d3.forceSimulation()
      //
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      // Sets the strength of the force which pushes dots apart
      .force("charge", d3.forceManyBody().strength(-250))
      // Sets the center of gravity for the graph
      .force("center", d3.forceCenter(width / 2, height / 2));

  // This function calls the server with a GET request and returns an object into
  // the graph parameter
  d3.json('tasks/d3data', function(error, graph) {

    if (error) throw error;

    // Appends a group to the svg with all of the links as line elements,
    // using data from graph.links
    var link = svg.append("g")
        // sets a class for the g element to 'links'
        .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
        // Adds a class to each node
        .attr("class", function(d) {return '"' + d.group + '"'; })
        // Sets the radius of each node
        .attr("r", 5)
        // Sets the color of each node based on its group
        .attr("fill", function(d) { if (d.group == 'complete') {
          return "#d3d3d3";
        } if (d.group == 'notComplete') {
          return "red";
        } else {return color(d.group);} })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  });
}
