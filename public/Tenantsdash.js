// tenantsdash.js
async function fetchTenantInfo() {
    try {
        const response = await fetch('/dashboard'); // Fetch the user info

        if (response.ok) {
            const user = await response.json();

            // Dynamically update tenant information
            document.querySelector('.tenant-name').textContent = user.username;
            document.querySelector('#tenant-email').textContent = user.email;
            document.querySelector('#tenant-phone').textContent = user.phone;
            document.querySelector('#tenant-houseNumber').textContent = user.houseNumber;

        } else {
            console.error('Error fetching user data:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call fetchTenantInfo on page load
fetchTenantInfo();
