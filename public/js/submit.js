document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const amenitiesInput = document.getElementById('amenities');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('selected');

            // Get all selected buttons and update the Amenities input
            const selectedButtons = Array.from(toggleButtons).filter(btn => btn.classList.contains('selected'));
            const amenitiesText = selectedButtons.map(btn => btn.textContent).join(', ');

            amenitiesInput.value = amenitiesText;

            // Apply styling to selected buttons
            selectedButtons.forEach(selectedBtn => {
                selectedBtn.style.backgroundColor = '#d4edda'; // Light green background color
                selectedBtn.style.border = '1px solid #c3e6cb'; // Green border
            });

            // Reset styling for non-selected buttons
            toggleButtons.forEach(btn => {
                if (!btn.classList.contains('selected')) {
                    btn.style.backgroundColor = ''; // Reset background color
                    btn.style.border = ''; // Reset border
                }
            });

            // Log values to console for debugging
            console.log('Selected Buttons:', selectedButtons);
            console.log('Amenities Text:', amenitiesText);
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const uploadedFile = document.getElementById('uploadedFile');

    fileInput.addEventListener('change', function () {
        const fileName = this.value.split('\\').pop(); // Get the file name from the input
        uploadedFile.value = fileName; // Update the text input with the file name
    });
});

// submit.js

document.addEventListener('DOMContentLoaded', function () {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const amenitiesInput = document.getElementById('amenities');
    const form = document.getElementById('dataForm'); // เพิ่ม id 'dataForm' ให้ฟอร์ม

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            // โค้ดที่เดียวกับที่กำหนดในคำถาม

            // Log values to console for debugging
            console.log('Selected Buttons:', selectedButtons);
            console.log('Amenities Text:', amenitiesText);
        });
    });

    // ปรับแต่งฟังก์ชัน clearForm() เพื่อลบข้อความทั้งหมดในฟอร์ม
    document.getElementById('cancelButton').addEventListener('click', function () {
        clearForm();

        // ปรับแต่งสีปุ่มทุกปุ่ม
        toggleButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.style.backgroundColor = btn.classList.contains('selected') ? '#d4edda' : ''; // Set to light green if selected, otherwise reset
            btn.style.border = btn.classList.contains('selected') ? '1px solid #c3e6cb' : ''; // Set green border if selected, otherwise reset
        });
    });
});

function clearForm() {
    const formInputs = document.querySelectorAll('#dataForm input');
    formInputs.forEach(input => {
        input.value = ''; // ลบค่าใน input
    });
}


//up data
// Include this JavaScript code in your existing script or in a separate script file
function addRoom() {
    // Get values from the form fields
    var roomName = document.getElementsByName('name')[0].value;
    var building = document.getElementsByName('building')[0].value;
    var seatCapacity = document.getElementsByName('seatcapacity')[0].value;
    var amenities = document.getElementById('amenities').value;
  
    // File input handling (similar to your existing file upload code)
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
  
    // Create a FormData object to send data including files
    var formData = new FormData();
  
    // Append form data
    formData.append('roomName', roomName);
    formData.append('building', building);
    formData.append('seatCapacity', seatCapacity);
    formData.append('amenities', amenities);
    formData.append('file', file);
  
    // Make an AJAX request to send data to the server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/rooms', true);
  
    // Set up the onload function to handle the response from the server
    xhr.onload = function () {
      if (xhr.status === 200) {
        // Successful response, do something if needed
        console.log('Room added successfully!');
      } else {
        // Handle errors
        console.error('Error adding room:', xhr.statusText);
      }
    };
  
    // Send the FormData object to the server
    xhr.send(formData);
  }
  
//---------------ADD NEW PRODUCT-----------------
var action = 'add';

const formdata = document.querySelector('#dataForm');
function addProduct() {
    action = 'add';
    formdata.reset();
}


