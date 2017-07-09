console.log('javascript sourced');

$('document').ready(function(){
  console.log('jquery sourced');

  refreshTasks();

  $("#newTaskForm").on("submit", function(e) {
    e.preventDefault();

    var newTask = {};
    newTask.description = $("#newTaskDesc").val();
    newTask.status = 'n';
    newTask.location = $('input:radio[name=location]:checked').val().toLowerCase();
    console.log("sending task to server: ", newTask);

    $.ajax({
      url: "/tasks",
      type: "POST",
      data: newTask,
      success: function(response) {
        console.log('ajax response: ', response);
        refreshTasks();
      }
    });
  });

  $("#viewTasks").on('click', '.completeBtn', function(){
    var thisTaskData = $(this).parent().parent().data().task;
    console.log(thisTaskData);
    thisTaskData.task_complete = 'y';
    console.log(thisTaskData);

    $.ajax({
       url: '/tasks',
       type: 'PUT',
       data: thisTaskData,
       success: function(response) {
         console.log('tasks updated');
         refreshTasks();
       }
    });

  });

  $("#viewTasks").on('click', '.deleteBtn', function(){
    var thisTaskData = $(this).parent().parent().data().task;

    $.ajax({
       url: '/tasks/' + thisTaskData.user_id,
       type: 'DELETE',
       success: function(response) {
         console.log('tasks deleted');
         refreshTasks();
       }
    });

  });

  // Begin d3 for Force Directed Graph

  var svg = d3.select("svg"),
      width = 600,
      height = 600;

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2));

  d3.json('tasks/d3data', function(error, graph) {
    console.log(graph);
    if (error) throw error;

    var link = svg.append("g")
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
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
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
  });

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

  //End of d3

}); // End of document ready

function refreshTasks() {
  $('#viewTasks').empty();
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
    }
  });
}
