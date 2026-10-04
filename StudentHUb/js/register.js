// ==========================================================================
// PRACTICAL 5: Student Registration Form Validation
// Simple, clean beginner-friendly DOM validation
// ==========================================================================

// Form and Input Elements
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
let formSuccessAlert = document.getElementById("formSuccessAlert");

// Regular Expressions
let nameRegex = /^[a-zA-Z\s]{3,30}$/;                          // Letters and spaces only (3-30 chars)
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email format
let mobileRegex = /^[6-9]\d{9}$/;                              // 10 digits starting with 6, 7, 8, 9

// Helper to show field error
function setError(inputElement, errorId, message) {
    let errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = message;
    if (inputElement) {
        inputElement.classList.add("input-error");
        inputElement.classList.remove("input-success");
    }
}

// Helper to clear field error
function clearError(inputElement, errorId) {
    let errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = "";
    if (inputElement) {
        inputElement.classList.remove("input-error");
        inputElement.classList.add("input-success");
    }
}

// 1. Full Name Validation
function validateName() {
    let value = fullNameInput.value.trim();
    if (value === "") {
        setError(fullNameInput, "nameError", "Full Name is required.");
        return false;
    } else if (!nameRegex.test(value)) {
        setError(fullNameInput, "nameError", "Name must contain letters only (3-30 characters).");
        return false;
    }
    clearError(fullNameInput, "nameError");
    return true;
}

// 2. Email Validation
function validateEmail() {
    let value = emailInput.value.trim();
    if (value === "") {
        setError(emailInput, "emailError", "Email is required.");
        return false;
    } else if (!emailRegex.test(value)) {
        setError(emailInput, "emailError", "Please enter a valid email address.");
        return false;
    }
    clearError(emailInput, "emailError");
    return true;
}

// 3. Mobile Number Validation
function validateMobile() {
    let value = mobileInput.value.trim();
    if (value === "") {
        setError(mobileInput, "mobileError", "Mobile number is required.");
        return false;
    } else if (!mobileRegex.test(value)) {
        setError(mobileInput, "mobileError", "Enter a valid 10-digit mobile number.");
        return false;
    }
    clearError(mobileInput, "mobileError");
    return true;
}

// 4. Password Validation (Simple: required & minimum 6 characters)
function validatePassword() {
    let value = passwordInput.value;
    if (value === "") {
        setError(passwordInput, "passwordError", "Password is required.");
        return false;
    } else if (value.length < 6) {
        setError(passwordInput, "passwordError", "Password must be at least 6 characters.");
        return false;
    }
    clearError(passwordInput, "passwordError");
    return true;
}

// 5. Confirm Password Validation
function validateConfirmPassword() {
    let pass = passwordInput.value;
    let confirmPass = confirmPasswordInput.value;
    if (confirmPass === "") {
        setError(confirmPasswordInput, "confirmPasswordError", "Please confirm your password.");
        return false;
    } else if (confirmPass !== pass) {
        setError(confirmPasswordInput, "confirmPasswordError", "Passwords do not match.");
        return false;
    }
    clearError(confirmPasswordInput, "confirmPasswordError");
    return true;
}

// 6. Course Selection Validation
function validateCourse() {
    if (courseSelect.value === "") {
        setError(courseSelect, "courseError", "Please select your course.");
        return false;
    }
    clearError(courseSelect, "courseError");
    return true;
}

// 7. Year Selection Validation
function validateYear() {
    if (yearSelect.value === "") {
        setError(yearSelect, "yearError", "Please select your year.");
        return false;
    }
    clearError(yearSelect, "yearError");
    return true;
}

// 8. Gender Validation
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

// 9. Terms Acceptance Checkbox
function validateTerms() {
    let errorSpan = document.getElementById("termsError");
    if (!termsCheckbox.checked) {
        if (errorSpan) errorSpan.textContent = "You must agree to the Terms & Conditions.";
        return false;
    }
    if (errorSpan) errorSpan.textContent = "";
    return true;
}

// 10. Simple Canvas CAPTCHA
let currentCaptcha = "";

function generateCaptcha() {
    let canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f1f3f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    currentCaptcha = "";
    for (let i = 0; i < 4; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#0d6efd";
    ctx.fillText(currentCaptcha, 25, 27);
}

function validateCaptcha() {
    let value = captchaInput.value.trim().toUpperCase();
    if (value === "") {
        setError(captchaInput, "captchaError", "Please enter the CAPTCHA.");
        return false;
    } else if (value !== currentCaptcha) {
        setError(captchaInput, "captchaError", "Incorrect CAPTCHA. Please try again.");
        generateCaptcha();
        return false;
    }
    clearError(captchaInput, "captchaError");
    return true;
}

if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener("click", function() {
        generateCaptcha();
        if (captchaInput) captchaInput.value = "";
        clearError(captchaInput, "captchaError");
    });
}

// Real-Time Event Listeners (Validate on input / change)
if (fullNameInput) fullNameInput.addEventListener("input", validateName);
if (emailInput) emailInput.addEventListener("input", validateEmail);
if (mobileInput) mobileInput.addEventListener("input", validateMobile);
if (passwordInput) passwordInput.addEventListener("input", validatePassword);
if (confirmPasswordInput) confirmPasswordInput.addEventListener("input", validateConfirmPassword);
if (courseSelect) courseSelect.addEventListener("change", validateCourse);
if (yearSelect) yearSelect.addEventListener("change", validateYear);
document.querySelectorAll('input[name="gender"]').forEach(function(radio) {
    radio.addEventListener("change", validateGender);
});
if (termsCheckbox) termsCheckbox.addEventListener("change", validateTerms);
if (captchaInput) captchaInput.addEventListener("input", validateCaptcha);

// Form Submit Handler
if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Stop default form submit

        let isNameValid = validateName();
        let isEmailValid = validateEmail();
        let isMobileValid = validateMobile();
        let isPassValid = validatePassword();
        let isConfirmValid = validateConfirmPassword();
        let isCourseValid = validateCourse();
        let isYearValid = validateYear();
        let isGenderValid = validateGender();
        let isCaptchaValid = validateCaptcha();
        let isTermsValid = validateTerms();

        let isFormValid = isNameValid && isEmailValid && isMobileValid && isPassValid &&
                           isConfirmValid && isCourseValid && isYearValid && isGenderValid &&
                           isCaptchaValid && isTermsValid;

        if (isFormValid) {
            if (formSuccessAlert) {
                formSuccessAlert.style.display = "block";
                formSuccessAlert.scrollIntoView({ behavior: "smooth" });
            }
            alert("Registration Successful!");
            form.reset();
            generateCaptcha();
            document.querySelectorAll(".input-success").forEach(function(el) {
                el.classList.remove("input-success");
            });
        } else {
            if (formSuccessAlert) formSuccessAlert.style.display = "none";
            let firstErr = document.querySelector(".input-error");
            if (firstErr) firstErr.focus();
        }
    });

    let resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", function() {
            setTimeout(function() {
                document.querySelectorAll(".error-msg").forEach(function(s) { s.textContent = ""; });
                document.querySelectorAll(".input-error, .input-success").forEach(function(e) {
                    e.classList.remove("input-error", "input-success");
                });
                if (formSuccessAlert) formSuccessAlert.style.display = "none";
                generateCaptcha();
            }, 10);
        });
    }
}

// Generate CAPTCHA on page load
window.addEventListener("DOMContentLoaded", generateCaptcha);
