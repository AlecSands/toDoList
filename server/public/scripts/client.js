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

});

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
