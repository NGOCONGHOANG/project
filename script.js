// --- START OF FILE script.js (UPDATED FOR IMAGES) ---

document.addEventListener('DOMContentLoaded', function() {
    fetch('content.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            populateArticle(data.article);
            populateSidebar(data.sidebar);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            const articleBody = document.getElementById('article-body');
            if(articleBody) {
                articleBody.innerHTML = `<p style="color: red; font-family: sans-serif;">Sorry, couldn't load the article content. Please try refreshing the page.</p>`;
                 console.error("Failed to fetch or parse content.json. Status:", error.message);
            }
        });
});

function populateArticle(articleData) {
    setTextContent('article-headline', articleData.headline);
    setTextContent('article-subheadline', articleData.subheadline);
    setTextContent('article-publish-date', articleData.publishDate);

    const mainImgElement = document.getElementById('article-image');
    if (mainImgElement && articleData.mainImageUrl) {
        mainImgElement.src = articleData.mainImageUrl;
        mainImgElement.alt = articleData.headline || "Main article image";
    } else if (mainImgElement) {
         mainImgElement.style.display = 'none';
    }
    setTextContent('article-image-caption', articleData.mainImageCaption);

    // Author logo is set in HTML, no need to handle here unless dynamic

    const articleBody = document.getElementById('article-body');
    if (!articleBody) return;
    articleBody.innerHTML = '';

    articleData.sections.forEach(section => {
        let element;
        switch (section.type) {
            case 'heading':
                element = document.createElement(`h${section.level || 2}`);
                element.textContent = section.text;
                break;
            case 'paragraph':
                element = document.createElement('p');
                // Replace **bold** markdown with <strong> tags
                element.innerHTML = section.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                break;
            case 'list':
                element = document.createElement('ul');
                section.items.forEach(item => {
                    // Ensure only strings are processed as list items here
                    // Image objects should be outside the 'items' array in JSON
                    if (typeof item === 'string') {
                         const listItem = document.createElement('li');
                         listItem.innerHTML = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                         element.appendChild(listItem);
                    }
                });
                break;
            case 'image': // Handle image type
                element = createFigureElement(section);
                break;
             case 'conclusion':
                 element = document.createElement('p');
                 // Wrap content in <em> for styling hook
                 element.innerHTML = `<em>${section.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</em>`;
                 break;
            default:
                console.warn('Unknown section type:', section.type);
                element = document.createElement('p');
                element.textContent = section.text || '';
        }
        if (element) {
            articleBody.appendChild(element);
        }
    });
}

// --- Helper function to create figure element for images ---
function createFigureElement(imageData) {
    const figure = document.createElement('figure');
    if (imageData.layout) {
        figure.classList.add(`image-layout-${imageData.layout}`);
    }

    const img = document.createElement('img');
    img.src = imageData.src;
    img.alt = imageData.alt || ""; // Provide empty alt if not specified

    figure.appendChild(img);

    if (imageData.caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = imageData.caption;
        figure.appendChild(figcaption);
    }
    return figure;
}


// --- Function to populate sidebar (unchanged) ---
function populateSidebar(sidebarData) {
    const relatedContainer = document.getElementById('sidebar-related');
    if (relatedContainer && sidebarData.relatedArticles) {
        relatedContainer.innerHTML = `<h2>${sidebarData.relatedTitle || 'Related'}</h2>`;
        sidebarData.relatedArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
            div.innerHTML = `
                <img class="sidebar-thumbnail" src="images/placeholder-thumb.png" alt="">
                <div class="sidebar-article-content">
                    <h3><a href="#">${article.title}</a></h3>
                    <p class="meta">${article.readTime}</p>
                </div>
            `;
            relatedContainer.appendChild(div);
        });
    }

     const opinionContainer = document.getElementById('sidebar-opinion');
    if (opinionContainer && sidebarData.opinionArticles) {
        opinionContainer.innerHTML = `<h2>${sidebarData.opinionTitle || 'Opinion'}</h2>`;
         sidebarData.opinionArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
            div.innerHTML = `
                <img class="sidebar-thumbnail" src="images/placeholder-thumb.png" alt="">
                <div class="sidebar-article-content">
                    <h3><a href="#">${article.title}</a></h3>
                    <p class="meta">By ${article.author} • ${article.readTime}</p>
                </div>
            `;
            opinionContainer.appendChild(div);
        });
    }
}

// Helper function to set text content safely
function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || '';
    }
}
// --- END OF FILE script.js (UPDATED FOR IMAGES) ---