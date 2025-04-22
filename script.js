// --- START OF FILE script.js (MODIFIED FOR ARTICLE PAGES) ---

document.addEventListener('DOMContentLoaded', function() {
    // --- Get the content file name from the body's data attribute ---
    const contentFileName = document.body.dataset.contentFile;

    if (!contentFileName) {
        console.error('Error: Body tag missing data-content-file attribute.');
        const articleBody = document.getElementById('article-body');
         if(articleBody) {
            articleBody.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Page configuration missing.</p>`;
         }
        return; // Stop if the attribute is missing
    }
    // --- -------------------------------------------------------- ---

    // Use the dynamic file name in fetch
    fetch(contentFileName)
        .then(response => {
            if (!response.ok) {
                 // Provide more specific error if file not found
                 const statusText = response.status === 404 ? `(${contentFileName} not found)` : `(status: ${response.status})`;
                throw new Error(`HTTP error! ${statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if data has the expected 'article' structure
            if (data && data.article) {
                populateArticle(data.article);
                 // Only populate sidebar if sidebar data exists
                 if (data.sidebar) {
                     populateSidebar(data.sidebar);
                 } else {
                     // Optionally hide sidebar area if no data
                     const sidebar = document.querySelector('.sidebar-column');
                     if(sidebar) sidebar.style.display = 'none';
                 }
            } else {
                 throw new Error(`Invalid content structure in ${contentFileName}`);
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
            const articleBody = document.getElementById('article-body');
            if(articleBody) {
                articleBody.innerHTML = `<p style="color: red; font-family: sans-serif;">Sorry, couldn't load the article content. ${error.message}</p>`;
            }
        });
});

// --- Functions populateArticle, createFigureElement, populateSidebar, setTextContent remain the same as the previous version ---
function populateArticle(articleData) {
    // Set page title dynamically from article headline
    document.title = articleData.headline ? `${articleData.headline} - FPT SAY HI` : "FPT SAY HI";

    setTextContent('article-headline', articleData.headline);
    setTextContent('article-subheadline', articleData.subheadline);
    setTextContent('article-publish-date', articleData.publishDate); // Ensure publish date element exists if used

    const mainImgElement = document.getElementById('article-image');
    if (mainImgElement && articleData.mainImageUrl) {
        mainImgElement.src = articleData.mainImageUrl;
        mainImgElement.alt = articleData.headline || "Main article image";
        mainImgElement.style.display = ''; // Ensure it's visible
    } else if (mainImgElement) {
         mainImgElement.style.display = 'none'; // Hide if no image URL
    }
    setTextContent('article-image-caption', articleData.mainImageCaption);

    // Handle Author - Assuming 'article-author' span is for the name part
    const authorNameSpan = document.getElementById('article-author');
    if(authorNameSpan && articleData.author) {
         authorNameSpan.textContent = articleData.author;
    }


    const articleBody = document.getElementById('article-body');
    if (!articleBody) {
         console.error("Element with ID 'article-body' not found!");
         return;
     }
    articleBody.innerHTML = ''; // Clear any previous content or error messages

    if (!articleData.sections || !Array.isArray(articleData.sections)) {
        console.error("Invalid or missing 'sections' array in article data.");
        articleBody.innerHTML = "<p style='color:orange;'>Article content is missing or formatted incorrectly.</p>";
        return;
    }


    articleData.sections.forEach(section => {
        let element;
        // Ensure section is an object and has a type
        if (typeof section !== 'object' || !section.type) {
             console.warn("Skipping invalid section:", section);
             return; // Skip this iteration
         }

        switch (section.type) {
            case 'heading':
                element = document.createElement(`h${section.level || 2}`);
                element.textContent = section.text || '';
                break;
            case 'paragraph':
                element = document.createElement('p');
                element.innerHTML = (section.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                break;
            case 'list':
                 element = document.createElement('ul');
                 if (section.items && Array.isArray(section.items)) {
                     section.items.forEach(item => {
                         if (typeof item === 'string') {
                              const listItem = document.createElement('li');
                              listItem.innerHTML = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              element.appendChild(listItem);
                          }
                     });
                 }
                break;
            case 'image':
                element = createFigureElement(section);
                break;
             case 'conclusion':
                 element = document.createElement('p');
                 element.innerHTML = `<em>${(section.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</em>`;
                 break;
            default:
                console.warn('Unknown section type:', section.type);
        }
        if (element) {
            articleBody.appendChild(element);
        }
    });
}

function createFigureElement(imageData) {
    const figure = document.createElement('figure');
    if (imageData.layout) {
        figure.classList.add(`image-layout-${imageData.layout}`);
    }

    const img = document.createElement('img');
    img.src = imageData.src || ''; // Use empty src if missing
    img.alt = imageData.alt || "";

    // Add error handling for image loading
     img.onerror = () => {
         console.warn(`Failed to load image: ${img.src}`);
         img.alt = `Failed to load image: ${imageData.alt || imageData.src}`;
         // Optionally add a class to style broken images
         img.parentElement.classList.add('image-load-error');
     };


    figure.appendChild(img);

    if (imageData.caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = imageData.caption;
        figure.appendChild(figcaption);
    }
    return figure;
}

function populateSidebar(sidebarData) {
    const relatedContainer = document.getElementById('sidebar-related');
    if (relatedContainer && sidebarData.relatedArticles && sidebarData.relatedArticles.length > 0) {
         relatedContainer.style.display = ''; // Ensure visible
        relatedContainer.innerHTML = `<h2>${sidebarData.relatedTitle || 'Related'}</h2>`;
        sidebarData.relatedArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
            const imgSrc = 'images/placeholder-thumb.png';
            div.innerHTML = `
                <img class="sidebar-thumbnail" src="${imgSrc}" alt="">
                <div class="sidebar-article-content">
                    <h3><a href="#">${article.title || 'Untitled'}</a></h3>
                    <p class="meta">${article.readTime || ''}</p>
                </div>
            `;
            relatedContainer.appendChild(div);
        });
    } else if (relatedContainer) {
        relatedContainer.style.display = 'none'; // Hide section if no data
    }


     const opinionContainer = document.getElementById('sidebar-opinion');
    if (opinionContainer && sidebarData.opinionArticles && sidebarData.opinionArticles.length > 0) {
         opinionContainer.style.display = ''; // Ensure visible
        opinionContainer.innerHTML = `<h2>${sidebarData.opinionTitle || 'Opinion'}</h2>`;
         sidebarData.opinionArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
             const imgSrc = 'images/placeholder-thumb.png';
             div.innerHTML = `
                <img class="sidebar-thumbnail" src="${imgSrc}" alt="">
                <div class="sidebar-article-content">
                    <h3><a href="#">${article.title || 'Untitled'}</a></h3>
                    <p class="meta">By ${article.author || 'Unknown'} • ${article.readTime || ''}</p>
                </div>
            `;
            opinionContainer.appendChild(div);
        });
    } else if (opinionContainer) {
         opinionContainer.style.display = 'none'; // Hide section if no data
     }
}

function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || '';
    }
}
// --- END OF FILE script.js (MODIFIED FOR ARTICLE PAGES) ---