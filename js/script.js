function init(){
//add your javascript between these two lines of code
 var button = document.getElementById('calculate');
 
 function textAlert(){
     var sleep = document.getElementById('sleep');
	 var classes = document.getElementById('classes');
     var homework = document.getElementById('homework');
     var fitness = document.getElementById('fitness');
     var travel = document.getElementById('travel');
     var freeTime = (168 - (sleep.value * 7) - classes.value - homework.value - fitness.value - travel.value)
    document.getElementById('textoutput').innerHTML = "Free Time Hours Left: "+ freeTime;

 }
 
 button.addEventListener('click', textAlert)
}

window.addEventListener('load', init);

