const API_URL = "https://openlibrary.org/subjects/education_technology.json?limit=50";
let chartInstance = null;
let allBooksData = [];

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

document.addEventListener('DOMContentLoaded', () => {
    fetchData(); 
    
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = '#333333';
});

function switchView(viewName) {
    document.getElementById('view-timeline').classList.add('hidden');
    document.getElementById('view-list').classList.add('hidden');
    
    document.getElementById(viewName).classList.remove('hidden');

    document.getElementById('nav-timeline').classList.remove('active');
    document.getElementById('nav-list').classList.remove('active');

    if (viewName === 'view-timeline') {
        document.getElementById('nav-timeline').classList.add('active');
    } else {
        document.getElementById('nav-list').classList.add('active');
    }

    if (viewName === 'view-list') {
        resetFilter();
    }
}

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        allBooksData = data.works;
        
        document.getElementById('result-count').innerText = allBooksData.length + " publications found.";

        renderList(allBooksData);
        renderTimeline(allBooksData);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('result-count').innerText = "Error loading data.";
    }
}

function renderList(booksToDisplay) {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = ''; 

    booksToDisplay.forEach(book => {
        const title = book.title;
        const author = book.authors ? book.authors[0].name : "Unknown Author";
        const year = book.first_publish_year || "N/A";
        const editionCount = book.edition_count || 1;

        const randomImageIndex = Math.floor(Math.random() * myBookImages.length);
        const imagePath = myBookImages[randomImageIndex];

        const cardHTML = `
            <div class="book-card">
                <img src="${imagePath}" class="book-cover" alt="Book Cover">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p>By ${author}</p>
                    <div style="margin-top:auto;">
                        <span class="tag">${year}</span>
                        <span class="tag">${editionCount} Editions</span>
                    </div>
                </div>
            </div>
        `;

        grid.innerHTML += cardHTML;
    });
}

function filterByYear(year) {
    const filteredBooks = allBooksData.filter(book => book.first_publish_year == year);

    const filterBox = document.getElementById('filter-container');
    filterBox.classList.remove('hidden');
    document.getElementById('filter-text').innerText = `Showing ${filteredBooks.length} books from ${year}`;

    renderList(filteredBooks);
    switchView('view-list');
}

function resetFilter() {
    document.getElementById('filter-container').classList.add('hidden');
    renderList(allBooksData);
}

function renderTimeline(books) {
    const yearCounts = {};
    books.forEach(book => {
        const year = book.first_publish_year;
        if (year) {
            if (yearCounts[year]) {
                yearCounts[year] += 1;
            } else {
                yearCounts[year] = 1;
            }
        }
    });

    const sortedYears = Object.keys(yearCounts).sort();
    const dataPoints = sortedYears.map(year => yearCounts[year]);

    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Books Published',
                data: dataPoints,
                borderColor: '#64b5f6',
                backgroundColor: 'rgba(100, 181, 246, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, activeElements) => {
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    const clickedYear = sortedYears[index];
                    filterByYear(clickedYear);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} Books (Click to filter)`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Books' } },
                x: { title: { display: true, text: 'Year' } }
            }
        }
    });
}