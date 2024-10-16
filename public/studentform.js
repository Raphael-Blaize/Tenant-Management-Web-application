async function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Fetch form data
    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const id = document.getElementById("id").value.trim();
    const email = document.getElementById("email").value.trim();
    const emergency_phone = document.getElementById("emergency_phone").value.trim(); // Adjusted to match your input field

    const studentData = {
        first_name,
        last_name,
        id,
        email,
        emergency_phone // Include emergency phone in the data
    };

    try {
        // Send data to server
        const response = await fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Tenant registered successfully!');
            alert(data.message); // Optional: Show success message
            // Redirect to tenant view page with tenant ID in the URL
            window.location.href = `tenantview.html?id=${data.tenant.id}`;
        } else {
            const errorText = await response.text();
            console.error('Error registering tenant:', errorText);
            alert('Error: ' + errorText); // Optional: Show error message
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
