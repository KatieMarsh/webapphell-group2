// สร้างวัตถุ Date
var currentDate = new Date();

// ดึงข้อมูลวันที่, เดือน, และปี
var day = currentDate.getDate();
var month = currentDate.toLocaleString('default', { month: 'long' });
var year = currentDate.getFullYear();

// นำข้อมูลไปแสดงใน <p> element
var currentDateElement = document.getElementById('currentDate');
currentDateElement.textContent = "Today : " +" "+ day + " " + month + " " + year;
