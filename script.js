// Set today's date by default
document.getElementById('date').valueAsDate = new Date();

// Remove any RTL direction settings since we're using English (LTR)
document.documentElement.removeAttribute('dir');

// Handle file input
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');

photoInput.addEventListener('change', function(e) {
    displayPhotoPreview(this.files[0]);
});

// Drag and drop functionality
const fileInputArea = document.querySelector('.file-input-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileInputArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileInputArea.addEventListener(eventName, () => {
        fileInputArea.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(26, 26, 26, 0.15) 100%)';
        fileInputArea.style.borderColor = '#1a1a1a';
    });
});

['dragleave', 'drop'].forEach(eventName => {
    fileInputArea.addEventListener(eventName, () => {
        fileInputArea.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(26, 26, 26, 0.05) 100%)';
        fileInputArea.style.borderColor = '#d4af37';
    });
});

fileInputArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    photoInput.files = files;
    if (files.length > 0) {
        displayPhotoPreview(files[0]);
    }
});

function displayPhotoPreview(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// Handle form submission
document.getElementById('trainingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        // If Formspree endpoint is configured (window.FORMSPREE_ENDPOINT), submit using FormData
        const formspreeEndpoint = window.FORMSPREE_ENDPOINT || document.getElementById('trainingForm').dataset.formspreeEndpoint || null;
        if (formspreeEndpoint) {
            // show badge
            const badge = document.getElementById('formspreeBadge');
            if (badge) badge.style.display = 'inline-flex';

            const formData = new FormData(this);

            const resp = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                },
                redirect: 'follow'
            });

            // Treat 2xx and 3xx responses as success for Formspree (it may redirect to /thanks)
            if (resp.status >= 200 && resp.status < 400) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';
                this.reset();
                photoPreview.innerHTML = '';
                document.getElementById('date').valueAsDate = new Date();
                setTimeout(() => { document.getElementById('successMessage').style.display = 'none'; }, 5000);
            } else {
                // Try to read JSON error if available
                let body = {};
                try {
                    const contentType = resp.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        body = await resp.json();
                    }
                } catch (e) {
                    // ignore parse errors
                }
                throw new Error(body.error || `Formspree error: ${resp.status}`);
            }
        } else {
            // Fallback: use Netlify function (existing behavior)
            // Prepare form data and optionally convert photo to data URL
            const fd = new FormData(this);
            const payload = {};
            fd.forEach((v, k) => payload[k] = v);

            // If there's a photo file, convert to data URL
            const fileInput = document.getElementById('photo');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                payload.photo = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            // Send to Netlify Function which will forward via SMTP
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok && result.ok) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';
                this.reset();
                photoPreview.innerHTML = '';
                document.getElementById('date').valueAsDate = new Date();
                setTimeout(() => { document.getElementById('successMessage').style.display = 'none'; }, 5000);
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';

        // Hide error message after 5 seconds
        setTimeout(() => {
            document.getElementById('errorMessage').style.display = 'none';
        }, 5000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
});

// Real-time validation
const requiredInputs = document.querySelectorAll('input[required], textarea[required]');

requiredInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#f44336';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '#d4af37';
    });
});
