// --- CONFIGURATION ---
const API_URL = "https://openlibrary.org/subjects/education_technology.json?limit=50";
let chartInstance = null;
let allBooksData = []; // Global variable to store the fetched data

// --- CUSTOM IMAGE ARRAY ---
const myBookImages = [
    "images/book1.jpg",
    "images/book2.jpg",
    "images/book11.jpg",
    "images/book12.jpg",
    "images/book13.jpg",
    "images/book14.jpg",
    "images/book16.jpg",
    "images/book17.jpg",
    "images/book18.jpg",
    "images/book19.jpg",
    "images/book20.jpg"
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    fetchData(); 
});

// --- NAVIGATION (TAB SWITCHING) ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // FIX: If the user clicks "Resource List" manually, reset the filter to show all books
            if (target === 'view-list') {
                renderList(allBooksData);
                updateResultCount(allBooksData.length, "Open Library API");
            }

            switchView(target);
        });
    });
}

// Helper function to switch views programmatically
function switchView(targetId) {
    // 1. Update Sidebar UI
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if(nav.getAttribute('data-target') === targetId) {
            nav.classList.add('active');
        }
    });

    // 2. Switch Section Views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(targetId);
    targetSection.classList.remove('hidden');
    targetSection.classList.add('active');
}

// --- DATA FETCHING (Open Library) ---
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allBooksData = data.works; // Store globally for filtering later

        // Update UI with count
        updateResultCount(allBooksData.length, "Open Library API");
        
        // Render initial views
        renderList(allBooksData);
        renderTimeline(allBooksData);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('result-count').textContent = "Error loading data. Please refresh.";
    }
}

function updateResultCount(count, source) {
    document.getElementById('result-count').textContent = `${count} publications found via ${source}`;
}

// --- VIEW 1: RESOURCE LIST RENDER ---
function renderList(books, filterYear = null) {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = '';

    // FIX: Add Navigation/Reset controls when a filter is active
    if (filterYear) {
        const filterControls = document.createElement('div');
        filterControls.style.gridColumn = '1 / -1'; // Span full width of grid
        filterControls.style.marginBottom = '15px';
        filterControls.style.padding = '10px';
        filterControls.style.background = '#e6efff';
        filterControls.style.borderRadius = '8px';
        filterControls.style.display = 'flex';
        filterControls.style.alignItems = 'center';
        filterControls.style.justifyContent = 'space-between';
        
        filterControls.innerHTML = `
            <span>
                <i class="fa-solid fa-filter" style="color:#4a90e2"></i> 
                Showing ${books.length} books from <strong>${filterYear}</strong>
            </span>
            <div>
                <button id="btn-show-all" style="cursor:pointer; border:1px solid #4a90e2; background:white; color:#4a90e2; padding:5px 10px; border-radius:4px; margin-right:10px;">
                    Show All
                </button>
                <button id="btn-back-timeline" style="cursor:pointer; border:none; background:#4a90e2; color:white; padding:5px 10px; border-radius:4px;">
                    <i class="fa-solid fa-arrow-left"></i> Back to Timeline
                </button>
            </div>
        `;
        grid.appendChild(filterControls);

        // Add event listeners for the new buttons
        setTimeout(() => {
            document.getElementById('btn-show-all').onclick = () => {
                renderList(allBooksData);
                updateResultCount(allBooksData.length, "Open Library API");
            };
            document.getElementById('btn-back-timeline').onclick = () => {
                switchView('view-timeline');
            };
        }, 0);
    }

    if (books.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.gridColumn = '1 / -1';
        emptyMsg.style.color = '#666';
        emptyMsg.textContent = 'No books found for this selection.';
        grid.appendChild(emptyMsg);
        return;
    }

    books.forEach(book => {
        const title = book.title;
        const author = book.authors ? book.authors[0].name : "Unknown Author";
        const year = book.first_publish_year || "N/A";
        
        // NEW: Get Edition Count
        const editionCount = book.edition_count || 1; 

        // LOGIC: Pick a random image from YOUR custom array
        const randomImage = myBookImages[Math.floor(Math.random() * myBookImages.length)];
        
        // Use the IMG tag with the random source
        const imageHTML = `<img src="${randomImage}" alt="Cover of ${title}" class="book-cover" loading="lazy">`;
        
        const cardHTML = `
            <div class="book-card" role="listitem" tabindex="0" aria-label="Book titled ${title} by ${author}, published in ${year}, ${editionCount} editions">
                ${imageHTML}
                <div class="card-content">
                    <h3>${title}</h3>
                    <p><i class="fa-regular fa-user"></i> ${author}</p>
                    <div style="margin-top:auto; display:flex; gap:5px; flex-wrap:wrap;">
                        <span class="tag">Published: ${year}</span>
                        <span class="tag" style="background:#eafaf1; color:#27ae60;">${editionCount} Editions</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        grid.appendChild(tempDiv.firstElementChild);
    });
}

// --- VIEW 2: TIMELINE RENDER (Chart.js) ---
function renderTimeline(books) {
    const years = books.map(b => b.first_publish_year).filter(y => y !== undefined);
    
    const yearCounts = {};
    years.forEach(year => {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const sortedYears = Object.keys(yearCounts).sort();
    const dataPoints = sortedYears.map(y => yearCounts[y]);

    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(74, 144, 226, 0.5)'); 
    gradient.addColorStop(1, 'rgba(74, 144, 226, 0.0)');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Publications',
                data: dataPoints,
                borderColor: '#4a90e2',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // --- NEW INTERACTION SETTINGS ---
            onClick: (e, activeElements) => {
                if (activeElements.length > 0) {
                    // 1. Get the clicked year
                    const index = activeElements[0].index;
                    const selectedYear = sortedYears[index];

                    // 2. Filter the books
                    const filteredBooks = allBooksData.filter(b => b.first_publish_year == selectedYear);

                    // 3. Update the List View with filter context
                    renderList(filteredBooks, selectedYear); 
                    updateResultCount(filteredBooks.length, `Year ${selectedYear}`);

                    // 4. Automatically switch to List View
                    switchView('view-list');
                }
            },
            onHover: (event, chartElement) => {
                // Change cursor to pointer when hovering over a point
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
            // -------------------------------
            scales: {
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Number of Books' },
                    ticks: { stepSize: 1 }
                },
                x: {
                    title: { display: true, text: 'First Publish Year' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} Publications (Click to view)`;
                        }
                    }
                }
            }
        }
    });
}