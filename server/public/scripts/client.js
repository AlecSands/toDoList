console.log('javascript sourced');

$('document').ready(function(){
  console.log('jquery sourced');

  refreshTasks();

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
        $tr = $('<tr></tr>');
        $tr.data('task', task);
        $tr.append('<td>' + task.description + '</td>');
        $tr.append('<td>' + task.location + '</td>');
        $tr.append('<td>' + task.task_complete + '</td>');
        $('#viewTasks').append($tr);
      }
    }
  });
}
