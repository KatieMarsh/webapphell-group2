

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
function addRoom() {
    // Gather data from the form
    const name = document.getElementById('name').value;
    const building = document.getElementById('building').value;
    const seatcapacity = document.getElementById('seatcapacity').value;
    const uploadedFile = document.getElementById('uploadedFile').value;

    // Create a JavaScript object with the data
    const newRoom = {
        name: name,
        building: building,
        seatcapacity: seatcapacity,
        uploadedFile: uploadedFile
    };

    // Make an AJAX request to send the data to the server
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/rooms', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Request was successful, handle the response if needed
                console.log(xhr.responseText);
            } else {
                // Request failed, handle the error if needed
                console.error(xhr.statusText);
            }
        }
    };

    // Convert the JavaScript object to a JSON string and send it in the request body
    xhr.send(JSON.stringify(newRoom));
}


