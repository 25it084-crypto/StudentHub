console.log("StudentHub JS Loaded Successfully");
console.log("Welcome to Student Hub");
console.log("P-4 JAVASCRIPT: DOM Manipulation and Event Handling");

// --- Basic Practice: Variables & Data Types ---
let studentName = "nik";
let course = "it";
let semester = 5;
console.log("Student Name:", studentName);
console.log("Course:", course);
console.log("Semester:", semester);

let college = "charusat";
let year = 2026;
let isStudent = true;
console.log("College:", college);
console.log("Year:", year);
console.log("Is Student:", isStudent);

// --- Basic Functions ---
function welcomeMessage() {
    console.log("Welcome to StudentHub Portal!");
}
welcomeMessage();

function welcomeStudent(name) {
    console.log("Welcome, " + name);
}
welcomeStudent("nik");
welcomeStudent("harsh");
welcomeStudent("kavo");


// ============================================
// 1. NOTIFICATION BANNER (Close on Click)
// ============================================
let notification = document.getElementById("notification");
let closeButton = document.getElementById("closeBtn");

if (closeButton && notification) {
    closeButton.addEventListener("click", function() {
        notification.style.display = "none";
    });
}


// ============================================
// 2. LIGHT / DARK THEME SWITCHER (with localStorage)
// ============================================
let themeBtn = document.getElementById("theameBtn");

// Check saved theme in localStorage on page load
let savedTheme = localStorage.getItem("studenthub-theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeBtn) themeBtn.textContent = "☀️ Light Mode";
} else {
    document.body.classList.remove("dark-mode");
    if (themeBtn) themeBtn.textContent = "🌙 Dark Mode";
}

// Toggle theme on button click
if (themeBtn) {
    themeBtn.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            themeBtn.textContent = "☀️ Light Mode";
            localStorage.setItem("studenthub-theme", "dark");
        } else {
            themeBtn.textContent = "🌙 Dark Mode";
            localStorage.setItem("studenthub-theme", "light");
        }
    });
}

let hamburgerBtn = document.getElementById("hamburgerBtn");
let navMenu = document.getElementById("navMenu");

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", function() {
        if (navMenu.style.display === "flex") {
            navMenu.style.display = "none";
        } else {
            navMenu.style.display = "flex";
        }
    });
}

let slides = document.querySelectorAll(".slide");
let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let slideIndicator = document.getElementById("slideIndicator");
let currentSlideIndex = 0;

function showSlide(index) {
    if (slides.length === 0) return;

    // Remove active class from all slides
    slides.forEach(function(slide) {
        slide.classList.remove("active");
    });

    // Handle circular index bounds
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    // Show current slide
    slides[currentSlideIndex].classList.add("active");

    // Update indicator text
    if (slideIndicator) {
        slideIndicator.textContent = "Slide " + (currentSlideIndex + 1) + " of " + slides.length;
    }
}

if (nextBtn) {
    nextBtn.addEventListener("click", function() {
        showSlide(currentSlideIndex + 1);
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", function() {
        showSlide(currentSlideIndex - 1);
    });
}


// ============================================
// 5. COLLAPSIBLE FAQ (Accordion)
// ============================================
let faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function(questionButton) {
    questionButton.addEventListener("click", function() {
        let answer = this.nextElementSibling;
        let icon = this.querySelector(".faq-icon");

        // Toggle answer visibility
        if (answer.classList.contains("show")) {
            answer.classList.remove("show");
            if (icon) icon.textContent = "+";
        } else {
            answer.classList.add("show");
            if (icon) icon.textContent = "-";
        }
    });
});


// ============================================
// 6. MODAL POPUP (Open & Close Popup Box)
// ============================================
let openModalBtn = document.getElementById("openModalBtn");
let closeModalBtn = document.getElementById("closeModalBtn");
let registerModal = document.getElementById("registerModal");

// Open modal
if (openModalBtn && registerModal) {
    openModalBtn.addEventListener("click", function() {
        registerModal.style.display = "flex";
    });
}

// Close modal when 'X' is clicked
if (closeModalBtn && registerModal) {
    closeModalBtn.addEventListener("click", function() {
        registerModal.style.display = "none";
    });
}

// Close modal when user clicks outside modal content box
window.addEventListener("click", function(event) {
    if (event.target === registerModal) {
        registerModal.style.display = "none";
    }
});
