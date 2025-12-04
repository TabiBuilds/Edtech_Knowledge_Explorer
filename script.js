// API Endpoint for "Education Technology" subjects
const API_URL = "https://openlibrary.org/subjects/education_technology.json?limit=15";

// Async Function to Fetch Data
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Process data for Chart.js
        processChartData(data.works);
        
        // Process data for Book Grid
        renderBookGrid(data.works);

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('book-grid').innerHTML = "<p>Error loading data.</p>";
    }
}

// Function to Render Chart
function processChartData(books) {
    // We will map "First Publish Year" vs "Book Title"
    // Sort books by year first
    const sortedBooks = books.sort((a, b) => a.first_publish_year - b.first_publish_year);

    const labels = sortedBooks.map(book => book.title.substring(0, 15) + "..."); // Shorten titles
    const years = sortedBooks.map(book => book.first_publish_year);

    const ctx = document.getElementById('myChart').getContext('2d');
    
    // ... inside processChartData(books) ...

    new Chart(ctx, {
        type: 'bar', // CHANGED to 'bar' for a cleaner look comparing years
        data: {
            labels: labels,
            datasets: [{
                label: 'First Publish Year',
                data: years,
                // Custom Colors (Array of colors for each bar)
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: false, 
                    title: { display: true, text: 'Publication Year' } 
                }
            },
            plugins: {
                legend: { display: false } // Hides the legend box since we have labels
            }
        }
    });
}

// Function to Render Book Grid (DOM Manipulation)
// Function to Render Book Grid (With Accessibility)
function renderBookGrid(books) {
    const gridContainer = document.getElementById('book-grid');
    gridContainer.innerHTML = ""; 
    
    // Add semantic role for the container
    gridContainer.setAttribute('role', 'list');

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // ACCESSIBILITY: Define this as a list item
        card.setAttribute('role', 'listitem');
        card.setAttribute('tabindex', '0'); // Allows keyboard users to tab to this card

        const title = document.createElement('h3');
        title.textContent = book.title;

        const authorName = book.authors && book.authors.length > 0 ? book.authors[0].name : 'Unknown Author';
        const author = document.createElement('p');
        author.textContent = `By: ${authorName}`;

        // ACCESSIBILITY: Add a detailed label for screen readers
        // This reads out the full context when a user focuses on the card
        card.setAttribute('aria-label', `Book titled ${book.title}, written by ${authorName}. First published in ${book.first_publish_year}.`);

        card.appendChild(title);
        card.appendChild(author);
        gridContainer.appendChild(card);
    });
}

// Init
fetchData();