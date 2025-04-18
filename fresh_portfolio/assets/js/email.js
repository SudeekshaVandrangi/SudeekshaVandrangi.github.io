// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name.trim()) {
        errors.push('Name is required');
    }
    
    if (!formData.email.trim()) {
        errors.push('Email is required');
    } else if (!validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.subject.trim()) {
        errors.push('Subject is required');
    }
    
    if (!formData.message.trim()) {
        errors.push('Message is required');
    } else if (formData.message.length < 10) {
        errors.push('Message should be at least 10 characters long');
    }
    
    return errors;
}

// Show error messages
function showErrors(errors) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    
    const form = document.querySelector('.contact-form form');
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    form.insertBefore(errorContainer, form.firstChild);
}

// Show success message
function showSuccess() {
    const form = document.querySelector('.contact-form form');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Thank you for your message! I will get back to you soon.';
    
    const existingMessage = form.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    form.insertBefore(successMessage, form.firstChild);
}

// Show loading state
function showLoading() {
    const submitButton = document.querySelector('.contact-form button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
}

// Hide loading state
function hideLoading() {
    const submitButton = document.querySelector('.contact-form button[type="submit"]');
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.querySelector('.contact-form input[type="text"]').value,
        email: document.querySelector('.contact-form input[type="email"]').value,
        subject: document.querySelector('.contact-form input[placeholder="Subject"]').value,
        message: document.querySelector('.contact-form textarea').value
    };
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showErrors(errors);
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Send email using EmailJS
        await emailjs.send('service_gz4d5cf', 'template_zbr6v5f', {
            to_name: 'Sudeeksha',
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            reply_to: formData.email
        });
        
        // Show success message
        showSuccess();
        e.target.reset();
    } catch (error) {
        showErrors(['Failed to send message. Please try again later.']);
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// Initialize EmailJS
document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with your public key
    emailjs.init('EKwe4ryYxACbZJgud');
    
    // Add form submission handler
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}); 