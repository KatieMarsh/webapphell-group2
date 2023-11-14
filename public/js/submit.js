function submitForm() {
    var firstName = document.getElementById("firstName").value;
    var locationRoom = document.getElementById("locationRoom").value;
    var seatCapacity = document.getElementById("seatCapacity").value;

    // ทำสิ่งที่คุณต้องการกับข้อมูลที่ดึงมา
    console.log("Name:", firstName);
    console.log("Building:", locationRoom);
    console.log("Seat Capacity:", seatCapacity);

    // สามารถทำการส่งข้อมูลไปยังเซิร์ฟเวอร์หรือทำอย่างอื่นต่อไปได้
}

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

