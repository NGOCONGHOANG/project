// --- START OF FILE index-script.js ---

document.addEventListener('DOMContentLoaded', function() {
    fetch('articles-index.json') // Fetch the list of articles
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(articles => {
            // Sort articles by publishDate, newest first
            articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            displayArticleList(articles); // Display the sorted list
        })
        .catch(error => {
            console.error('Error loading article list:', error);
            const container = document.getElementById('article-list-container');
            if (container) {
                container.innerHTML = '<p style="color: red;">Could not load article list.</p>';
            }
        });
});

function displayArticleList(articles) {
    const container = document.getElementById('article-list-container');
    if (!container) return;

    container.innerHTML = ''; // Clear loading message

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article-preview'); // Add class for styling

        const titleLink = document.createElement('a');
        titleLink.href = article.pageUrl; // Link to the specific article HTML page

        const title = document.createElement('h2');
        title.textContent = article.title;
        titleLink.appendChild(title); // Put title inside link

        const description = document.createElement('p');
        description.textContent = article.description;

        const readMoreLink = document.createElement('a');
        readMoreLink.href = article.pageUrl;
        readMoreLink.textContent = 'Read More →';
        readMoreLink.classList.add('read-more');

        articleDiv.appendChild(titleLink);
        articleDiv.appendChild(description);
        articleDiv.appendChild(readMoreLink); // Add read more link

        container.appendChild(articleDiv);
    });
}

// --- END OF FILE index-script.js ---