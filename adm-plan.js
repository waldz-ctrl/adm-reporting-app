document.addEventListener('DOMContentLoaded', () => {
    const user = protectPage();
    if (!user) return; // Stop execution if no user

    // Page elements
    const schoolNameHeader = document.getElementById('school-name-header');
    const plansTableBody = document.getElementById('plans-table-body');
    const formMessage = document.getElementById('form-message');

    // Modal elements
    const modal = document.getElementById('plan-modal');
    const addPlanBtn = document.getElementById('add-plan-btn');
    const closeBtn = document.querySelector('.close-button');
    const admPlanForm = document.getElementById('adm-plan-form');
    
    // Form fields
    const recoveryPlanSelect = document.getElementById('recovery-plan');
    const planDetailsSection = document.getElementById('plan-details-section');

    schoolNameHeader.textContent = user.schoolName;

    // --- Modal Logic ---
    addPlanBtn.onclick = () => { modal.style.display = 'flex'; };
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- Dynamic Form Logic ---
    recoveryPlanSelect.addEventListener('change', () => {
        planDetailsSection.innerHTML = ''; // Clear previous options
        planDetailsSection.classList.remove('hidden');

        const selectedPlan = recoveryPlanSelect.value;
        if (selectedPlan === 'Modular') {
            planDetailsSection.innerHTML = `
                <label>Learning Resources (Multiple Selection)</label>
                <label><input type="checkbox" name="modular-details" value="SLMs"> SLMs</label>
                <label><input type="checkbox" name="modular-details" value="DLP-LAS"> DLP-LAS</label>
                <label><input type="checkbox" name="modular-details" value="LEs"> LEs</label>
                <label><input type="checkbox" name="modular-details" value="WSs"> WSs</label>
            `;
        } else if (selectedPlan === 'Saturday Class') {
            planDetailsSection.innerHTML = `
                <label for="saturday-date">Date of Saturday Class</label>
                <input type="datetime-local" id="saturday-date" required>
            `;
        } else if (selectedPlan === 'Extension Class') {
             planDetailsSection.innerHTML = `
                <label for="extension-dates">Date(s) of Extension Class</label>
                <input type="text" id="extension-dates" placeholder="e.g., Oct 2-4, 2025" required>
            `;
        } else {
             planDetailsSection.classList.add('hidden');
        }
    });
    
    // --- Form Submission ---
    admPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Collect form data
        const levelsAffected = Array.from(document.querySelectorAll('input[name="levels"]:checked')).map(el => el.value);
        const recoveryPlan = document.getElementById('recovery-plan').value;

        let planDetails = {};
        if (recoveryPlan === 'Modular') {
            planDetails.resources = Array.from(document.querySelectorAll('input[name="modular-details"]:checked')).map(el => el.value);
        } else if (recoveryPlan === 'Saturday Class') {
            planDetails.date = document.getElementById('saturday-date').value;
        } else if (recoveryPlan === 'Extension Class') {
            planDetails.dates = document.getElementById('extension-dates').value;
        }

        const payload = {
            action: 'addPlan',
            payload: {
                schoolName: user.schoolName,
                suspensionDate: document.getElementById('suspension-date').value,
                reason: document.getElementById('reason').value,
                levelsAffected: levelsAffected,
                recoveryPlan: recoveryPlan,
                planDetails: planDetails,
            }
        };

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                showMessage('Plan saved successfully!', 'success');
                admPlanForm.reset();
                modal.style.display = 'none';
                fetchPlans(); // Refresh the table
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`, 'error');
        }
    });

    // --- Fetch and Display Previous Plans ---
    async function fetchPlans() {
        plansTableBody.innerHTML = '<tr><td colspan="4">Loading plans...</td></tr>';
        const payload = {
            action: 'fetchPlans',
            payload: { schoolName: user.schoolName }
        };
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.status === 'success' && result.data.length > 0) {
                plansTableBody.innerHTML = '';
                result.data.forEach(plan => {
                    const row = `<tr>
                        <td>${plan.suspensionDate}</td>
                        <td>${plan.reason}</td>
                        <td>${plan.levels}</td>
                        <td>${plan.plan}</td>
                    </tr>`;
                    plansTableBody.innerHTML += row;
                });
            } else {
                plansTableBody.innerHTML = '<tr><td colspan="4">No plans found.</td></tr>';
            }
        } catch (error) {
            plansTableBody.innerHTML = `<tr><td colspan="4">Error loading plans: ${error.message}</td></tr>`;
        }
    }

    // --- Helper for showing messages ---
    function showMessage(msg, type) {
        formMessage.textContent = msg;
        formMessage.className = type === 'success' ? 'message-success' : 'message-error';
        formMessage.style.display = 'block';
        setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
    }

    // Initial fetch of plans when page loads
    fetchPlans();
});