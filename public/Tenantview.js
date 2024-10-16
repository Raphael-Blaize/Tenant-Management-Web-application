async function fetchAllTenants() {
    try {
        const response = await fetch('/students'); // Update this route if necessary
        if (response.ok) {
            const tenants = await response.json();
            const studentData = document.getElementById("studentData");
            studentData.innerHTML = ''; // Clear previous data

            // Populate the table with tenant data
            tenants.forEach(tenant => {
                const row = `
    <tr>
        <td>${tenant.id}</td>
        <td>${tenant.first_name}</td>
        <td>${tenant.last_name}</td>
        <td>${tenant.email}</td>
       <td class="text-center">
    <div class="icon-group">
        <span class="icon-action" title="View" onclick="viewTenant('${tenant.id}')">
            <ion-icon name="eye-outline"></ion-icon>
        </span>
        <span class="icon-action" title="Edit" onclick="openEditModal(${tenant.id}, '${tenant.first_name}', '${tenant.last_name}', '${tenant.email}')">
            <ion-icon name="create-outline"></ion-icon>
        </span>
        <span class="icon-action" title="Delete" onclick="deleteTenant('${tenant.id}')">
            <ion-icon name="trash-outline"></ion-icon>
        </span>
    </div>
</td>
    </tr>
`;

                studentData.innerHTML += row; // Append the new row to the table body
            });
        } else {
            console.error('Error fetching tenant data:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to view tenant details
function viewTenant(id) {
    // Redirect to the view page or display details in a popup/modal
    const viewUrl = `view.html?id=${id}`; // Adjust this URL to your actual view page
    window.location.href = viewUrl;
}

// Function to open edit modal
function openEditModal(id, firstName, lastName, email) {
    document.getElementById("editFirstName").value = firstName;
    document.getElementById("editLastName").value = lastName;
    document.getElementById("editEmail").value = email;
    const saveChangesBtn = document.getElementById("saveChanges");
    saveChangesBtn.onclick = () => saveChanges(id);
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

// Function to save changes after editing
async function saveChanges(id) {
    const updatedTenant = {
        first_name: document.getElementById("editFirstName").value,
        last_name: document.getElementById("editLastName").value,
        email: document.getElementById("editEmail").value,
    };

    try {
        const response = await fetch(`/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTenant)
        });

        if (response.ok) {
            alert('Tenant updated successfully');
            fetchAllTenants(); // Refresh the tenants list
            const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            modal.hide();
        } else {
            console.error('Error updating tenant:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to delete tenant
async function deleteTenant(id) {
    if (confirm('Are you sure you want to delete this tenant?')) {
        try {
            const response = await fetch(`/students/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Tenant deleted successfully');
                fetchAllTenants(); // Refresh the tenants list
            } else {
                console.error('Error deleting tenant:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Call to fetch tenants on page load
fetchAllTenants();
