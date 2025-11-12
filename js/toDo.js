function init(){
 var button = document.getElementById("add_button")

 function newTask(){
   const newTaskItem = document.createElement('li');
   var task = document.getElementById('task_name');
   newTaskItem.textContent = task.value;
   tasks.appendChild(newTaskItem);
 }
 button.addEventListener('click', newTask);
}

window.addEventListener('load', init);

