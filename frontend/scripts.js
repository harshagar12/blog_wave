document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded');

    function safeSelect(selector) {
        return document.querySelector(selector);
    }

    // Function to update authentication UI based on the presence of a token
    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const loginSignupElements = document.querySelectorAll('.btn-login, .btn-signup');
        const authProtectedElements = document.querySelectorAll('a[href="create-post.html"], a[href="profile.html"]');
    
        if (token) {
            // User is logged in
            authProtectedElements.forEach(el => {
                if (el) el.style.display = 'block';
            });
        } else {
            // User is not logged in
            authProtectedElements.forEach(el => {
                if (el) el.style.display = 'none';
            });
        }
    
        // Always show login and signup buttons
        loginSignupElements.forEach(el => {
            if (el) el.style.display = 'block';
        });
    }

    // Login Form Handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', async (e) => {
            console.log('Login form submitted');
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Email and password are required');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    alert('Login successful!');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // Signup Form Handling
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        console.log('Signup form found');
        signupForm.addEventListener('submit', async (e) => {
            console.log('Signup form submitted');
            e.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!username || !email || !password) {
                alert('All fields are required');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred during signup');
            }
        });
    }

    // File Upload Handling
    const dropzone = document.querySelector('.file-upload');
    const fileInput = document.getElementById('featured-image');
    
    if (dropzone && fileInput) {
        const uploadUI = dropzone.querySelector('.upload-ui');

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            dropzone.classList.add('highlight');
        }

        function unhighlight() {
            dropzone.classList.remove('highlight');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            files = files.target ? files.target.files : files;
            if (files.length > 0) {
                const file = files[0];
                if (file.size > 5 * 1024 * 1024) {
                    alert('File is too large. Maximum size is 5MB.');
                    return;
                }

                const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    alert('Invalid file type. Please upload JPG, PNG, or GIF.');
                    return;
                }

                updateDropzoneUI(file);
            }
        }

        function updateDropzoneUI(file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadUI.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" class="file-preview">
                        <p>${file.name}</p>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                uploadUI.innerHTML = `
                    <i class="fas fa-file"></i>
                    <p>${file.name}</p>
                `;
            }
            dropzone.classList.add('file-selected');
        }

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });

        dropzone.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFiles, false);
        uploadUI.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Create Post Form Handling
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const category = document.getElementById('category').value;
            const featuredImage = document.getElementById('featured-image').files[0];
            const token = localStorage.getItem('token');

            if (!token) {
                alert('You must be logged in to create a post.');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            if (featuredImage) {
                formData.append('featured-image', featuredImage);
            }

            try {
                const response = await fetch('http://localhost:3000/posts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                let data;
                try {
                    data = await response.json();
                } catch (error) {
                    data = { error: 'Unexpected response from the server' };
                }

                if (response.ok) {
                    alert(data.message || 'Post created successfully!');
                    postForm.reset();
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Failed to create post');
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('Failed to create post. Please try again.');
            }
        });
    }

    // Fetch and Display Posts by Category
    const categoryPostsContainer = document.getElementById('category-posts-container');
    if (categoryPostsContainer) {
        console.log('Category posts container found, preparing to fetch posts');

        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        async function fetchCategoryPosts() {
            try {
                const response = await fetch(`http://localhost:3000/posts?category=${category}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Posts fetch response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const posts = await response.json();
                console.log('Posts received:', posts);

                categoryPostsContainer.innerHTML = posts.length 
                    ? posts.map(post => `
                        <div class="post">
                            ${post.image_url ? `<img src="http://localhost:3000/${post.image_url}" alt="${post.title}" class="post-image">` : ''}
                            <h3>${post.title}</h3>
                            <p>${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                            <div class="post-meta">
                                <span>Category: ${post.category}</span>
                                <br>
                                <span>By: ${post.username}</span>
                            </div>
                        </div>
                    `).join('')
                    : '<p>No posts available in this category.</p>';
            } catch (error) {
                console.error('Fetch posts error:', error);
                categoryPostsContainer.innerHTML = `<p>Error fetching posts: ${error.message}</p>`;
            }
        }

        // Fetch posts by category
        fetchCategoryPosts();
    }

    // Fetch and Display All Posts for the Main Page
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        console.log('Posts container found, preparing to fetch posts');

        async function fetchPosts() {
            try {
                const response = await fetch('http://localhost:3000/posts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Posts fetch response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const posts = await response.json();
                console.log('Posts received:', posts);

                postsContainer.innerHTML = posts.length 
                    ? posts.map(post => `
                        <div class="post">
                            ${post.image_url ? `<img src="http://localhost:3000/${post.image_url}" alt="${post.title}" class="post-image">` : ''}
                            <h3>${post.title}</h3>
                            <p>${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                            <div class="post-meta">
                                <span>Category: ${post.category}</span>
                                <br>
                                <span>By: ${post.username}</span>
                            </div>
                        </div>
                    `).join('')
                    : '<p>No posts available.</p>';
            } catch (error) {
                console.error('Fetch posts error:', error);
                postsContainer.innerHTML = `<p>Error fetching posts: ${error.message}</p>`;
            }
        }

        // Fetch all posts for the main page
        fetchPosts();
    }

    // Logout Functionality
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Update authentication UI on page load
    updateAuthUI();
});