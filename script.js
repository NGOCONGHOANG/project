// --- START OF FILE script.js (ENHANCED) ---

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
            populateSidebar(data.sidebar); // Gọi hàm populateSidebar
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
    // Tên tác giả giờ đã cố định trong HTML, chỉ cần điền ngày publish
    // setTextContent('article-author', articleData.author); // Bỏ dòng này đi hoặc comment lại
    setTextContent('article-publish-date', articleData.publishDate);

    const imgElement = document.getElementById('article-image');
    if (imgElement && articleData.mainImageUrl) {
        imgElement.src = articleData.mainImageUrl;
        imgElement.alt = articleData.headline || "Main article image"; // Thêm fallback alt text
    } else if (imgElement) {
         imgElement.alt = "Main image not available";
         imgElement.style.display = 'none'; // Ẩn luôn nếu không có ảnh
    }
    setTextContent('article-image-caption', articleData.mainImageCaption);

    // Cập nhật logo tác giả (nếu có trong JSON, nếu không thì giữ nguyên src từ HTML)
    // const authorLogoElement = document.getElementById('author-logo');
    // if (authorLogoElement && articleData.authorLogoUrl) { // Giả sử bạn thêm authorLogoUrl vào JSON
    //     authorLogoElement.src = articleData.authorLogoUrl;
    // } else if (authorLogoElement) {
        // Giữ nguyên src từ HTML hoặc ẩn đi nếu không có ảnh
        // authorLogoElement.style.display = 'none'; // Bỏ comment nếu muốn ẩn khi ko có logo group
    // }


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
                element.innerHTML = section.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                break;
            case 'list':
                element = document.createElement('ul');
                section.items.forEach(itemText => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    element.appendChild(listItem);
                });
                break;
             case 'conclusion':
                 element = document.createElement('p');
                 // Bọc nội dung bằng <em> để CSS nhận diện
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

// Hàm cập nhật sidebar để thêm thumbnail
function populateSidebar(sidebarData) {
    const relatedContainer = document.getElementById('sidebar-related');
    if (relatedContainer && sidebarData.relatedArticles) {
        relatedContainer.innerHTML = `<h2>${sidebarData.relatedTitle || 'Related'}</h2>`;
        sidebarData.relatedArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
            // Thêm ảnh thumbnail và div bọc content
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
            // Thêm ảnh thumbnail và div bọc content
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


function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || '';
    }
}
// --- END OF FILE script.js (ENHANCED) ---