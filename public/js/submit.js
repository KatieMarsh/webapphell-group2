// Get the input field
var amenitiesInput = document.getElementById("amenities");

// Get all checkboxes
var checkboxes = document.querySelectorAll(".form-check-input");

// Add event listener to each checkbox
checkboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", function () {
    // Clear the input field
    amenitiesInput.value = "";

    // Loop through checkboxes to find checked ones and update the input field
    checkboxes.forEach(function (cb) {
      if (cb.checked) {
        amenitiesInput.value += cb.labels[0].innerText + ", ";
      }
    });

    // Remove trailing comma and space
    amenitiesInput.value = amenitiesInput.value.replace(/,\s*$/, "");
  });
});
function addRoom() {
  const room_name = formProduct.elements['room_name'].value;
  const status = formProduct.elements['status'].value;
  // ... (get other form data)

  let url = '/rooms';
  let httpMethod = 'POST';
  let bodyContent = JSON.stringify({
      "room_name": room_name,
      "status": status,
      // ... (include other form data)
  });

  fetch(url, {
      method: httpMethod,
      headers: { "Content-Type": "application/json" },
      body: bodyContent
  })
  .then(function (response) {
      if (response.ok) {
          formProduct.reset();
          Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Add Room successfully'
          })
          .then(function (result) {
              getRooms(); // assuming you have a getRooms() function to refresh the room list
          });
      } else {
          throw Error('Bad response');
      }
  })
  .catch(function (err) {
      console.error(err);
      alert(err);
  });
}

