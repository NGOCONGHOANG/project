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
            // Cập nhật ngày hiện tại (ví dụ)
            // document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            // Hoặc giữ nguyên ngày từ HTML/CSS nếu muốn ngày cố định
        })
        .catch(error => {
            console.error('Error loading content:', error);
            // Hiển thị thông báo lỗi cho người dùng nếu cần
            const articleBody = document.getElementById('article-body');
            if(articleBody) {
                articleBody.innerHTML = `<p style="color: red;">Sorry, couldn't load the article content. Please try refreshing the page.</p>`;
            }
        });
});

function populateArticle(articleData) {
    // --- Điền thông tin cơ bản ---
    setTextContent('article-headline', articleData.headline);
    setTextContent('article-subheadline', articleData.subheadline);
    setTextContent('article-author', articleData.author);
    setTextContent('article-publish-date', articleData.publishDate);

    const imgElement = document.getElementById('article-image');
    if (imgElement) {
        imgElement.src = articleData.mainImageUrl;
        imgElement.alt = articleData.headline; // Alt text tốt cho SEO và accessibility
    }
    setTextContent('article-image-caption', articleData.mainImageCaption);

    // --- Xử lý nội dung bài báo ---
    const articleBody = document.getElementById('article-body');
    if (!articleBody) return; // Thoát nếu không tìm thấy body

    articleBody.innerHTML = ''; // Xóa nội dung cũ (nếu có)

    articleData.sections.forEach(section => {
        let element;
        switch (section.type) {
            case 'heading':
                element = document.createElement(`h${section.level || 2}`); // Mặc định là h2 nếu không có level
                element.textContent = section.text;
                break;
            case 'paragraph':
                element = document.createElement('p');
                element.innerHTML = section.text; // Dùng innerHTML để diễn giải **bold** nếu có (mặc dù nên tránh)
                break;
            case 'list':
                element = document.createElement('ul');
                section.items.forEach(itemText => {
                    const listItem = document.createElement('li');
                    // Xử lý **bold** đơn giản - Cần cẩn thận với XSS nếu nội dung từ nguồn không tin cậy
                    listItem.innerHTML = itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    element.appendChild(listItem);
                });
                break;
             case 'conclusion': // Thêm kiểu dáng đặc biệt nếu muốn
                 element = document.createElement('p');
                 element.innerHTML = `<em>${section.text}</em>`; // Ví dụ: in nghiêng phần kết luận
                 element.style.borderTop = '1px solid #ccc'; // Thêm đường kẻ
                 element.style.paddingTop = '1em';
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

function populateSidebar(sidebarData) {
    const relatedContainer = document.getElementById('sidebar-related');
    if (relatedContainer && sidebarData.relatedArticles) {
        relatedContainer.innerHTML = `<h2>${sidebarData.relatedTitle || 'Related'}</h2>`; // Tiêu đề section
        sidebarData.relatedArticles.forEach(article => {
            const div = document.createElement('div');
            div.classList.add('sidebar-article');
            div.innerHTML = `
                <h3><a href="#">${article.title}</a></h3>
                <p class="meta">${article.readTime}</p>
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
                <h3><a href="#">${article.title}</a></h3>
                <p class="meta">By ${article.author} • ${article.readTime}</p>
            `;
            opinionContainer.appendChild(div);
        });
    }
}


// Hàm trợ giúp để đặt textContent an toàn
function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with ID '${id}' not found.`);
    }
}