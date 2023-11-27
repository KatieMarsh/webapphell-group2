
var currentDate = new Date();


var day = currentDate.getDate();
var month = currentDate.toLocaleString('default', { month: 'long' });
var year = currentDate.getFullYear();

var currentDateElement = document.getElementById('currentDate');
currentDateElement.textContent = "Today : " +" "+ day + " " + month + " " + year;
