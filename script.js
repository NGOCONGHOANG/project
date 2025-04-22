// --- START OF FILE script.js (MODIFIED FOR ARTICLE PAGES) ---

document.addEventListener('DOMContentLoaded', function() {
    const contentFileName = document.body.dataset.contentFile;

    if (!contentFileName) {
        console.error('Error: Body tag missing data-content-file attribute.');
        const articleBody = document.getElementById('article-body');
         if(articleBody) {
            articleBody.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Page configuration missing.</p>`;
         }
        return;
    }

    fetch(contentFileName)
        .then(response => {
            if (!response.ok) {
                 const statusText = response.status === 404 ? `(${contentFileName} not found)` : `(status: ${response.status})`;
                throw new Error(`HTTP error! ${statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.article) {
                populateArticle(data.article);
                 if (data.sidebar) {
                     populateSidebar(data.sidebar);
                 } else {
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

function populateArticle(articleData) {
    document.title = articleData.headline ? `${articleData.headline} - FPT SAY HI` : "FPT SAY HI";
    setTextContent('article-headline', articleData.headline);
    setTextContent('article-subheadline', articleData.subheadline);
    setTextContent('article-publish-date', articleData.publishDate);

    const mainImgElement = document.getElementById('article-image');
    if (mainImgElement && articleData.mainImageUrl) {
        mainImgElement.src = articleData.mainImageUrl;
        mainImgElement.alt = articleData.headline || "Main article image";
        mainImgElement.style.display = '';
    } else if (mainImgElement) {
         mainImgElement.style.display = 'none';
    }
    setTextContent('article-image-caption', articleData.mainImageCaption);

    const authorNameSpan = document.getElementById('article-author');
    if(authorNameSpan && articleData.author) {
         authorNameSpan.textContent = articleData.author;
    }

    const articleBody = document.getElementById('article-body');
    if (!articleBody) {
         console.error("Element with ID 'article-body' not found!");
         return;
     }
    articleBody.innerHTML = '';

    if (!articleData.sections || !Array.isArray(articleData.sections)) {
        console.error("Invalid or missing 'sections' array in article data.");
        articleBody.innerHTML = "<p style='color:orange;'>Article content is missing or formatted incorrectly.</p>";
        return;
    }

    articleData.sections.forEach(section => {
        let element;
        if (typeof section !== 'object' || !section.type) {
             console.warn("Skipping invalid section:", section);
             return;
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
    img.src = imageData.src || '';
    img.alt = imageData.alt || "";
     img.onerror = () => {
         console.warn(`Failed to load image: ${img.src}`);
         img.alt = `Failed to load image: ${imageData.alt || imageData.src}`;
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
         relatedContainer.style.display = '';
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
        relatedContainer.style.display = 'none';
    }

     const opinionContainer = document.getElementById('sidebar-opinion');
    if (opinionContainer && sidebarData.opinionArticles && sidebarData.opinionArticles.length > 0) {
         opinionContainer.style.display = '';
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
         opinionContainer.style.display = 'none';
     }
}

function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || '';
    }
}
// --- END OF FILE script.js (MODIFIED FOR ARTICLE PAGES) ---