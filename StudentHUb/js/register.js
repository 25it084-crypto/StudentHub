// ==========================================================================
// PRACTICAL 5: Registration Form with Frontend Validation & Error Handling
// ==========================================================================

// --- DOM Element Selection ---
let form = document.getElementById("registrationForm");
let fullNameInput = document.getElementById("fullName");
let emailInput = document.getElementById("email");
let mobileInput = document.getElementById("mobile");
let passwordInput = document.getElementById("password");
let confirmPasswordInput = document.getElementById("confirmPassword");
let courseSelect = document.getElementById("courseSelect");
let yearSelect = document.getElementById("yearSelect");
let termsCheckbox = document.getElementById("termsCheckbox");
let captchaInput = document.getElementById("captchaInput");
let refreshCaptchaBtn = document.getElementById("refreshCaptchaBtn");
let strengthBar = document.getElementById("strengthBar");
let strengthText = document.getElementById("strengthText");
let formSuccessAlert = document.getElementById("formSuccessAlert");

// --- Regular Expressions for Validation ---
// 1. Name: 3 to 30 characters, letters and spaces only
let nameRegex = /^[a-zA-Z\s]{3,30}$/;

// 2. Email: standard email format (user@domain.ext)
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 3. Mobile: Exactly 10 digits starting with 6, 7, 8, or 9 (Indian mobile format)
let mobileRegex = /^[6-9]\d{9}$/;

// 4. Password: At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;


// ==========================================================================
// Helper Functions to Show and Clear Field Errors
// ==========================================================================
function setError(inputElement, errorElementId, message) {
    let errorSpan = document.getElementById(errorElementId);
    if (errorSpan) {
        errorSpan.textContent = message;
    }
    if (inputElement && inputElement.classList) {
        inputElement.classList.add("input-error");
        inputElement.classList.remove("input-success");
    }
}

function clearError(inputElement, errorElementId) {
    let errorSpan = document.getElementById(errorElementId);
    if (errorSpan) {
        errorSpan.textContent = "";
    }
    if (inputElement && inputElement.classList) {
        inputElement.classList.remove("input-error");
        inputElement.classList.add("input-success");
    }
}


// ==========================================================================
// Field-by-Field Validation Functions
// ==========================================================================

// 1. Validate Full Name
function validateName() {
    let value = fullNameInput.value.trim();
    if (value === "") {
        setError(fullNameInput, "nameError", "Full Name is required.");
        return false;
    } else if (!nameRegex.test(value)) {
        setError(fullNameInput, "nameError", "Name must contain 3-30 letters and spaces only.");
        return false;
    }
    clearError(fullNameInput, "nameError");
    return true;
}

// 2. Validate Email
function validateEmail() {
    let value = emailInput.value.trim();
    if (value === "") {
        setError(emailInput, "emailError", "Email address is required.");
        return false;
    } else if (!emailRegex.test(value)) {
        setError(emailInput, "emailError", "Please enter a valid email format (e.g. name@charusat.edu.in).");
        return false;
    }
    clearError(emailInput, "emailError");
    return true;
}

// 3. Validate Mobile Number
function validateMobile() {
    let value = mobileInput.value.trim();
    if (value === "") {
        setError(mobileInput, "mobileError", "Mobile number is required.");
        return false;
    } else if (!mobileRegex.test(value)) {
        setError(mobileInput, "mobileError", "Enter a valid 10-digit mobile number starting with 6-9.");
        return false;
    }
    clearError(mobileInput, "mobileError");
    return true;
}

// 4. Validate Password & Check Strength (Intermediate Extension)
function validatePassword() {
    let value = passwordInput.value;
    updatePasswordStrength(value);

    if (value === "") {
        setError(passwordInput, "passwordError", "Password is required.");
        return false;
    } else if (!passwordRegex.test(value)) {
        setError(passwordInput, "passwordError", "Min 8 chars, including 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.");
        return false;
    }
    clearError(passwordInput, "passwordError");
    return true;
}

// Password Strength Meter Logic
function updatePasswordStrength(password) {
    if (!strengthBar || !strengthText) return;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#^]/.test(password)) score++;

    if (password.length === 0) {
        strengthBar.style.width = "0%";
        strengthBar.style.backgroundColor = "#e0e0e0";
        strengthText.textContent = "Password Strength: None";
        strengthText.style.color = "#666";
    } else if (score <= 1) {
        strengthBar.style.width = "30%";
        strengthBar.style.backgroundColor = "#dc3545"; // Red
        strengthText.textContent = "Password Strength: Weak";
        strengthText.style.color = "#dc3545";
    } else if (score <= 3) {
        strengthBar.style.width = "65%";
        strengthBar.style.backgroundColor = "#ffc107"; // Yellow
        strengthText.textContent = "Password Strength: Medium";
        strengthText.style.color = "#d39e00";
    } else {
        strengthBar.style.width = "100%";
        strengthBar.style.backgroundColor = "#198754"; // Green
        strengthText.textContent = "Password Strength: Strong";
        strengthText.style.color = "#198754";
    }
}

// 5. Validate Confirm Password
function validateConfirmPassword() {
    let passwordValue = passwordInput.value;
    let confirmValue = confirmPasswordInput.value;

    if (confirmValue === "") {
        setError(confirmPasswordInput, "confirmPasswordError", "Please confirm your password.");
        return false;
    } else if (confirmValue !== passwordValue) {
        setError(confirmPasswordInput, "confirmPasswordError", "Passwords do not match.");
        return false;
    }
    clearError(confirmPasswordInput, "confirmPasswordError");
    return true;
}

// 6. Validate Course Selection
function validateCourse() {
    if (courseSelect.value === "") {
        setError(courseSelect, "courseError", "Please select your course.");
        return false;
    }
    clearError(courseSelect, "courseError");
    return true;
}

// 7. Validate Year Selection
function validateYear() {
    if (yearSelect.value === "") {
        setError(yearSelect, "yearError", "Please select your year of study.");
        return false;
    }
    clearError(yearSelect, "yearError");
    return true;
}

// 8. Validate Gender (Radio buttons)
function validateGender() {
    let selectedGender = document.querySelector('input[name="gender"]:checked');
    let errorSpan = document.getElementById("genderError");
    if (!selectedGender) {
        if (errorSpan) errorSpan.textContent = "Please select your gender.";
        return false;
    }
    if (errorSpan) errorSpan.textContent = "";
    return true;
}

// 9. Validate Terms Acceptance Checkbox
function validateTerms() {
    let errorSpan = document.getElementById("termsError");
    if (!termsCheckbox.checked) {
        if (errorSpan) errorSpan.textContent = "You must agree to the Terms and Conditions.";
        return false;
    }
    if (errorSpan) errorSpan.textContent = "";
    return true;
}


// ==========================================================================
// Advanced Extension: Custom Canvas CAPTCHA
// ==========================================================================
let currentCaptcha = "";

function generateCaptcha() {
    let canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;
    let ctx = canvas.getContext("2d");

    // Clear previous canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = "#f1f3f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate random 5-character string
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    currentCaptcha = "";
    for (let i = 0; i < 5; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Draw random strike lines to simulate security distortion
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = "#bbb";
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Draw characters with slight rotation
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillStyle = "#0d6efd";
    ctx.textBaseline = "middle";

    for (let i = 0; i < currentCaptcha.length; i++) {
        let x = 15 + i * 22;
        let y = 20 + (Math.random() * 6 - 3);
        ctx.fillText(currentCaptcha[i], x, y);
    }
}

// Validate CAPTCHA
function validateCaptcha() {
    let userCaptcha = captchaInput.value.trim();
    if (userCaptcha === "") {
        setError(captchaInput, "captchaError", "Please enter the CAPTCHA code.");
        return false;
    } else if (userCaptcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
        setError(captchaInput, "captchaError", "CAPTCHA is incorrect. Try again.");
        generateCaptcha();
        return false;
    }
    clearError(captchaInput, "captchaError");
    return true;
}

// Refresh CAPTCHA on button click
if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener("click", function() {
        generateCaptcha();
        if (captchaInput) captchaInput.value = "";
        clearError(captchaInput, "captchaError");
    });
}


// ==========================================================================
// Intermediate Extension: Real-Time Validation on Keyup / Input / Change
// ==========================================================================
if (fullNameInput) fullNameInput.addEventListener("input", validateName);
if (emailInput) emailInput.addEventListener("input", validateEmail);
if (mobileInput) mobileInput.addEventListener("input", validateMobile);
if (passwordInput) {
    passwordInput.addEventListener("input", function() {
        validatePassword();
        if (confirmPasswordInput.value !== "") {
            validateConfirmPassword();
        }
    });
}
if (confirmPasswordInput) confirmPasswordInput.addEventListener("input", validateConfirmPassword);
if (courseSelect) courseSelect.addEventListener("change", validateCourse);
if (yearSelect) yearSelect.addEventListener("change", validateYear);
document.querySelectorAll('input[name="gender"]').forEach(function(radio) {
    radio.addEventListener("change", validateGender);
});
if (termsCheckbox) termsCheckbox.addEventListener("change", validateTerms);
if (captchaInput) captchaInput.addEventListener("input", validateCaptcha);


// ==========================================================================
// Form Submission Handler
// ==========================================================================
if (form) {
    form.addEventListener("submit", function(event) {
        // Prevent default browser form submission
        event.preventDefault();

        // Run all field validations
        let isNameValid = validateName();
        let isEmailValid = validateEmail();
        let isMobileValid = validateMobile();
        let isPasswordValid = validatePassword();
        let isConfirmValid = validateConfirmPassword();
        let isCourseValid = validateCourse();
        let isYearValid = validateYear();
        let isGenderValid = validateGender();
        let isCaptchaValid = validateCaptcha();
        let isTermsValid = validateTerms();

        // Check overall form validity
        let isFormValid = isNameValid &&
                           isEmailValid &&
                           isMobileValid &&
                           isPasswordValid &&
                           isConfirmValid &&
                           isCourseValid &&
                           isYearValid &&
                           isGenderValid &&
                           isCaptchaValid &&
                           isTermsValid;

        if (isFormValid) {
            // Show success alert
            if (formSuccessAlert) {
                formSuccessAlert.style.display = "block";
                formSuccessAlert.scrollIntoView({ behavior: "smooth" });
            }

            console.log("--- Student Registration Data Submitted ---");
            console.log("Full Name:", fullNameInput.value.trim());
            console.log("Email:", emailInput.value.trim());
            console.log("Mobile:", mobileInput.value.trim());
            console.log("Course:", courseSelect.value);
            console.log("Year:", yearSelect.value);
            console.log("Gender:", document.querySelector('input[name="gender"]:checked').value);

            // Reset form fields after 2 seconds
            setTimeout(function() {
                form.reset();
                updatePasswordStrength("");
                generateCaptcha();
                document.querySelectorAll(".input-success").forEach(function(el) {
                    el.classList.remove("input-success");
                });
            }, 2000);

        } else {
            // Hide success alert if previously shown
            if (formSuccessAlert) {
                formSuccessAlert.style.display = "none";
            }

            // Focus on the first element with an error
            let firstInvalid = document.querySelector(".input-error");
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });

    // Reset button handler
    let resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", function() {
            setTimeout(function() {
                document.querySelectorAll(".error-msg").forEach(function(span) {
                    span.textContent = "";
                });
                document.querySelectorAll(".input-error, .input-success").forEach(function(el) {
                    el.classList.remove("input-error", "input-success");
                });
                if (formSuccessAlert) formSuccessAlert.style.display = "none";
                updatePasswordStrength("");
                generateCaptcha();
            }, 10);
        });
    }
}

// Generate initial CAPTCHA on page load
window.addEventListener("DOMContentLoaded", function() {
    generateCaptcha();
});
