// Global variable to store the previous date
let previousDate = new Date().toLocaleDateString();


// Function to fetch and display student data
async function displayStudentData() {
    try {
        const response = await fetch('/students');
        if (!response.ok) {
            throw new Error('Failed to fetch student data');
        }
        const students = await response.json();
        console.log('Fetched student data:', students); // Log fetched student data
        const studentDataElement = document.getElementById('studentData');
        console.log('studentDataElement:', studentDataElement); // Log the studentDataElement
        studentDataElement.innerHTML = ''; // Clear previous data
        let presentCount = 0; // Initialize present count
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.first_name}</td>
                <td>${student.last_name}</td>
                <td>${student.email}</td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="present-${student.id}" name="attendance-${student.id}" value="present" ${student.attendanceStatus === 'present' ? 'checked' : ''}>
                        <label class="form-check-label" for="present-${student.id}">Present</label>
                    </div>
                </td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="absent-${student.id}" name="attendance-${student.id}" value="absent" ${student.attendanceStatus === 'absent' ? 'checked' : ''}>
                        <label class="form-check-label" for="absent-${student.id}">Absent</label>
                    </div>
                </td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="excused-${student.id}" name="attendance-${student.id}" value="excused" ${student.attendanceStatus === 'excused' ? 'checked' : ''}>
                        <label class="form-check-label" for="excused-${student.id}">Excused</label>
                    </div>
                </td>
                <td>${student.date || new Date().toLocaleDateString()}</td>
                <td>
                    <div class="form-status form-chek-inline">
                        <!-- Add an onclick event to call the editStudent function -->
                        <a href="edit.html?id=${student.id}&firstName=${student.first_name}&lastName=${student.last_name}&email=${student.email}&attendanceStatus=${student.attendanceStatus}" class="edit-link">Edit</a>
                        <a href="#" class="delete-link" onclick="deleteUser(${student.id})">Delete</a>
                    </div>
                </td>
            `;
            studentDataElement.appendChild(row);

            // Initialize previous attendance status for each student
            if (!student.previousAttendanceStatus) {
                student.previousAttendanceStatus = student.attendanceStatus;
            }

            if (student.attendanceStatus === 'present') {
                presentCount++; // Increment present count
            }

            // Event listeners for radio buttons
            const presentRadioButton = document.getElementById(`present-${student.id}`);
            presentRadioButton.addEventListener('change', async () => {
                if (presentRadioButton.checked) {
                    const response = await fetch(`/students/${student.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ attendanceStatus: 'present', date: new Date().toLocaleDateString() })
                    });
                    if (!response.ok) {
                        console.error('Failed to mark attendance as present');
                    } else {
                        if (student.previousAttendanceStatus === 'excused') {
                            presentCount--; // Decrement present count if changing from excused to present
                        }
                        if (student.previousAttendanceStatus === 'absent') {
                            presentCount++; // Increment present count if changing from absent to present
                        }
                        updateAttendancePercentage(presentCount, students.length);
                        // Update the student data after attendance update
                        displayStudentData();
                    }
                }
            });

            const absentRadioButton = document.getElementById(`absent-${student.id}`);
            absentRadioButton.addEventListener('change', async () => {
                if (absentRadioButton.checked) {
                    const response = await fetch(`/students/${student.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ attendanceStatus: 'absent', date: new Date().toLocaleDateString() })
                    });
                    if (!response.ok) {
                        console.error('Failed to mark attendance as absent');
                    } else {
                        if (student.previousAttendanceStatus === 'present') {
                            presentCount--; // Decrement present count if changing from present to absent
                        }
                        updateAttendancePercentage(presentCount, students.length);
                        // Update the student data after attendance update
                        displayStudentData();
                    }
                }
            });

            const excusedRadioButton = document.getElementById(`excused-${student.id}`);
            excusedRadioButton.addEventListener('change', async () => {
                if (excusedRadioButton.checked) {
                    const response = await fetch(`/students/${student.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ attendanceStatus: 'excused', date: new Date().toLocaleDateString() })
                    });
                    if (!response.ok) {
                        console.error('Failed to mark attendance as excused');
                    } else {
                        if (student.previousAttendanceStatus === 'present') {
                            presentCount--; // Decrement present count if changing from present to excused
                        }
                        if (student.previousAttendanceStatus === 'absent') {
                            presentCount++; // Increment present count if changing from absent to excused
                        }
                        updateAttendancePercentage(presentCount, students.length);
                        // Update the student data after attendance update
                        displayStudentData();
                    }
                }
            });
        });

        // Update the number of students in the class card
        const classCardUserCount = document.querySelector('.users .card:nth-child(1) .user-count');
        classCardUserCount.textContent = students.length;

        updateAttendancePercentage(presentCount, students.length);
    } catch (error) {
        console.error(error);
    }
}

// Function to update attendance percentage
function updateAttendancePercentage(presentCount, totalStudents) {
    const attendancePercentage = ((presentCount / totalStudents) * 100).toFixed(2);
    const attendancePercentageElement = document.querySelector('.users .card:nth-child(2) .user-count');
    attendancePercentageElement.textContent = `${attendancePercentage}%`;
}

// Function to delete a user
async function deleteUser(userId) {
    try {
        const response = await fetch(`/students/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        // Reload student data after deletion
        displayStudentData();
    } catch (error) {
        console.error(error);
    }
}

function clearRadioButtons() {
    console.log("clear radio buttons");
    // Get all radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    // Loop through each radio button and uncheck it
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
}

// Get the date input field
const dateInput = document.getElementById('selectedDate');

// Add an event listener to the date input field
dateInput.addEventListener('change', () => {
    // Call the clearRadioButtons function when the date changes
    clearRadioButtons();
});


// Function to reset attendance data for the new date
async function resetAttendanceData() {
    console.log("Resetting attendance data for the new date...");
    const selectedDate = document.getElementById('selectedDate').value;
    try {
        const response = await fetch('/resetAttendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: selectedDate }) // Pass the selected date to reset
        });
        if (!response.ok) {
            throw new Error('Failed to reset attendance data');
        }
        // Clear radio buttons
        clearRadioButtons();
        // Reload student data after resetting attendance data
        loadAttendanceData(); // Call loadAttendanceData to fetch and display updated attendance data
    } catch (error) {
        console.error(error);
    }
}



// Function to load attendance data for selected date
async function loadAttendanceData() {
    const selectedDate = document.getElementById('selectedDate').value;
    try {
        // Parse the selected date using Date constructor
        const dateParts = selectedDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Zero-indexed months
        const day = parseInt(dateParts[2]);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error('Invalid date format');
        }

        // Create a new Date object with parsed date parts
        const selectedDateObj = new Date(year, month, day);

        // Convert the date to ISO format
        const isoDate = selectedDateObj.toISOString().split('T')[0];

        // Fetch attendance data using the ISO formatted date
        const response = await fetch(`/students?date=${isoDate}`);
        if (!response.ok) {
            throw new Error('Failed to fetch attendance data');
        }

        const students = await response.json();
        // Clear previous data
        const studentDataElement = document.getElementById('studentData');
        studentDataElement.innerHTML = '';
        // Display the fetched student data
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.first_name}</td>
                <td>${student.last_name}</td>
                <td>${student.email}</td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="present-${student.id}" name="attendance-${student.id}" value="present" ${student.attendanceStatus === 'present' ? 'checked' : ''}>
                        <label class="form-check-label" for="present-${student.id}">Present</label>
                    </div>
                </td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="absent-${student.id}" name="attendance-${student.id}" value="absent" ${student.attendanceStatus === 'absent' ? 'checked' : ''}>
                        <label class="form-check-label" for="absent-${student.id}">Absent</label>
                    </div>
                </td>
                <td>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id="excused-${student.id}" name="attendance-${student.id}" value="excused" ${student.attendanceStatus === 'excused' ? 'checked' : ''}>
                        <label class="form-check-label" for="excused-${student.id}">Excused</label>
                    </div>
                </td>
                <td>${student.date || new Date().toLocaleDateString()}</td>
                <td>
                    <div class="form-status form-chek-inline">
                        <!-- Add an onclick event to call the editStudent function -->
                        <a href="edit.html?id=${student.id}&firstName=${student.first_name}&lastName=${student.last_name}&email=${student.email}&attendanceStatus=${student.attendanceStatus}" class="edit-link">Edit</a>
                        <a href="#" class="delete-link" onclick="deleteUser(${student.id})">Delete</a>
                    </div>
                </td>
            `;
            studentDataElement.appendChild(row);
        });
    } catch (error) {
        console.error(error);
    }
}
async function updateAttendance(userId) {
    const attendanceStatus = document.getElementById('attendanceStatus').value;
    const selectedDate = document.getElementById('selectedDate').value;
    try {
        const response = await fetch(`/students/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ attendanceStatus, date: selectedDate })
        });
        if (!response.ok) {
            throw new Error('Failed to update attendance for selected date');
        }
        loadAttendanceData(); // Reload student data after updating attendance
    } catch (error) {
        console.error(error);
    }
}


// Call the displayStudentData function when the page loads
window.addEventListener('DOMContentLoaded', displayStudentData);

//Call the loadAttendanceData() function when the page loads to fetch and display the attendance data.
window.addEventListener('DOMContentLoaded', () => {
    loadAttendanceData();
});
