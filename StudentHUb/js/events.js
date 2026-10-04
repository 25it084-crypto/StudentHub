// ==========================================================================
// PRACTICAL 6: Rendering External JSON Data using Fetch API, Search & Filter
// ==========================================================================

// Global state variables
let allEvents = [];           // Raw fetched JSON data
let filteredEvents = [];      // Data after search, filter, and sort
let currentPage = 1;          // Current active page
const itemsPerPage = 6;       // 6 cards per page

// DOM Element references
const eventsContainer = document.getElementById("eventsContainer");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const resultsCount = document.getElementById("resultsCount");
const cacheBadge = document.getElementById("cacheBadge");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumbersContainer = document.getElementById("pageNumbersContainer");

// Dependent Dropdown elements (Intermediate Extension)
const stateSelect = document.getElementById("stateSelect");
const citySelect = document.getElementById("citySelect");
const selectedLocationText = document.getElementById("selectedLocationText");


// ==========================================================================
// 1. Fetch JSON Data with Error Handling & Offline LocalStorage Cache
// ==========================================================================
function fetchEventsData() {
    // Show loading state
    if (loadingIndicator) loadingIndicator.style.display = "block";
    if (errorMessage) errorMessage.style.display = "none";
    if (eventsContainer) eventsContainer.innerHTML = "";

    const jsonPath = "../data/events.json";

    fetch(jsonPath)
        .then(function(response) {
            // Check HTTP status code
            if (!response.ok) {
                throw new Error("HTTP error! Status: " + response.status);
            }
            return response.json(); // Parse JSON response
        })
        .then(function(data) {
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = "none";

            allEvents = data;

            // Advanced Extension: Cache successful response in localStorage
            localStorage.setItem("studenthub_cached_events", JSON.stringify(data));
            if (cacheBadge) cacheBadge.style.display = "none";

            // Initial render
            applyFiltersAndRender();
        })
        .catch(function(error) {
            console.error("Fetch error:", error);

            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = "none";

            // Advanced Extension: Attempt to load from offline cache in localStorage
            const cachedData = localStorage.getItem("studenthub_cached_events");
            if (cachedData) {
                console.log("Loading events from offline cache...");
                allEvents = JSON.parse(cachedData);
                if (cacheBadge) cacheBadge.style.display = "inline-block";
                applyFiltersAndRender();
            } else {
                // Show error state if no cache is available
                if (errorMessage) errorMessage.style.display = "block";
                if (resultsCount) resultsCount.textContent = "Failed to load events.";
            }
        });
}

// Retry button listener
if (retryBtn) {
    retryBtn.addEventListener("click", fetchEventsData);
}


// ==========================================================================
// 2. Search, Filter & Sort Logic using Array Methods (filter, sort, slice)
// ==========================================================================
function applyFiltersAndRender() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";
    const selectedSort = sortSelect ? sortSelect.value : "date-asc";

    // Step A: Search & Category Filter using Array.prototype.filter()
    filteredEvents = allEvents.filter(function(event) {
        // Match Search Query (Title, Description, Venue, or Organizer)
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.venue.toLowerCase().includes(searchTerm) ||
            event.organizer.toLowerCase().includes(searchTerm);

        // Match Category
        const matchesCategory = (selectedCategory === "all") || (event.category === selectedCategory);

        return matchesSearch && matchesCategory;
    });

    // Step B: Sort using Array.prototype.sort()
    filteredEvents.sort(function(a, b) {
        if (selectedSort === "name-asc") {
            return a.title.localeCompare(b.title);
        } else if (selectedSort === "name-desc") {
            return b.title.localeCompare(a.title);
        } else if (selectedSort === "date-desc") {
            return new Date(b.date) - new Date(a.date);
        } else {
            // Default: date-asc
            return new Date(a.date) - new Date(b.date);
        }
    });

    // Reset to page 1 whenever search/filter criteria change
    currentPage = 1;

    // Render page items & pagination controls
    renderEvents();
    renderPaginationControls();
}


// ==========================================================================
// 3. Dynamic DOM Card Rendering (Pagination Slice & map/forEach)
// ==========================================================================
function renderEvents() {
    if (!eventsContainer) return;
    eventsContainer.innerHTML = "";

    // Update results count label
    if (resultsCount) {
        resultsCount.textContent = "Found " + filteredEvents.length + " events";
    }

    // Handle Empty Search Results State
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-state">
                <p>🔍 No events found matching your criteria.</p>
                <button class="primary-btn" onclick="document.getElementById('searchInput').value=''; document.getElementById('categoryFilter').value='all'; applyFiltersAndRender();">Reset Filters</button>
            </div>
        `;
        return;
    }

    // Step C: Pagination Slice logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredEvents.slice(startIndex, endIndex);

    // Dynamic Card Creation
    pageItems.forEach(function(event) {
        const card = document.createElement("div");
        card.className = "event-card";

        // Assign badge color class based on category
        let badgeClass = "badge-default";
        if (event.category === "Technical") badgeClass = "badge-tech";
        else if (event.category === "Workshop") badgeClass = "badge-workshop";
        else if (event.category === "Seminar") badgeClass = "badge-seminar";
        else if (event.category === "Sports") badgeClass = "badge-sports";
        else if (event.category === "Cultural") badgeClass = "badge-cultural";

        card.innerHTML = `
            <div class="card-header">
                <span class="event-badge ${badgeClass}">${event.category}</span>
                <span class="event-date">📅 ${event.date}</span>
            </div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-desc">${event.description}</p>
            <div class="event-meta">
                <p><strong>📍 Venue:</strong> ${event.venue}</p>
                <p><strong>👥 Seats:</strong> ${event.seats} available</p>
                <p><strong>🏛️ By:</strong> ${event.organizer}</p>
            </div>
            <button class="register-card-btn" onclick="alert('Proceeding to register for: ${event.title}'); window.location.href='register.html';">
                Register for Event
            </button>
        `;

        eventsContainer.appendChild(card);
    });
}


// ==========================================================================
// 4. Pagination Controls Logic
// ==========================================================================
function renderPaginationControls() {
    if (!pageNumbersContainer) return;
    pageNumbersContainer.innerHTML = "";

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

    // Disable / Enable Prev and Next buttons
    if (prevPageBtn) prevPageBtn.disabled = (currentPage === 1);
    if (nextPageBtn) nextPageBtn.disabled = (currentPage === totalPages || totalPages === 0);

    // Generate numeric page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "page-number-btn" + (i === currentPage ? " active" : "");
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", function() {
            currentPage = i;
            renderEvents();
            renderPaginationControls();
            window.scrollTo({ top: 150, behavior: "smooth" });
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
}

// Previous & Next Button Listeners
if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            renderEvents();
            renderPaginationControls();
            window.scrollTo({ top: 150, behavior: "smooth" });
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function() {
        const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderEvents();
            renderPaginationControls();
            window.scrollTo({ top: 150, behavior: "smooth" });
        }
    });
}


// ==========================================================================
// 5. Real-Time Search & Filter Event Listeners
// ==========================================================================
if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
if (categoryFilter) categoryFilter.addEventListener("change", applyFiltersAndRender);
if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);


// ==========================================================================
// 6. Intermediate Extension: Dependent Dropdown (State -> City)
// ==========================================================================
const locationData = {
    Gujarat: ["Ahmedabad", "Vadodara", "Surat", "Anand", "Rajkot"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"]
};

if (stateSelect && citySelect) {
    stateSelect.addEventListener("change", function() {
        const selectedState = stateSelect.value;

        // Reset city select
        citySelect.innerHTML = '<option value="">-- Choose City --</option>';

        if (selectedState && locationData[selectedState]) {
            citySelect.disabled = false;
            locationData[selectedState].forEach(function(cityName) {
                const opt = document.createElement("option");
                opt.value = cityName;
                opt.textContent = cityName;
                citySelect.appendChild(opt);
            });
            if (selectedLocationText) {
                selectedLocationText.textContent = "Location: " + selectedState;
            }
        } else {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">-- Select a State first --</option>';
            if (selectedLocationText) {
                selectedLocationText.textContent = "Location: All Locations";
            }
        }
    });

    citySelect.addEventListener("change", function() {
        if (selectedLocationText && citySelect.value) {
            selectedLocationText.textContent = "Location: " + citySelect.value + ", " + stateSelect.value;
        }
    });
}


// ==========================================================================
// Initial Load Execution
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    fetchEventsData();
});
