class BadgeDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadBadges();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('addBadgeForm');
        if (form) {
            console.log('✅ Form found, adding event listener');
            form.addEventListener('submit', (e) => {
                console.log('🚀 Form submitted!');
                e.preventDefault();
                this.handleAddBadge();
            });
        } else {
            console.error('❌ Form with ID "addBadgeForm" not found!');
        }

        // File upload change
        document.getElementById('imageFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                document.getElementById('badgeUrl').value = '';
                document.getElementById('badgeUrl').disabled = true;
            } else {
                document.getElementById('badgeUrl').disabled = false;
            }
        });

        // URL input change
        document.getElementById('badgeUrl').addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                document.getElementById('imageFile').disabled = true;
            } else {
                document.getElementById('imageFile').disabled = false;
            }
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        // Modal events
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal' || e.target.classList.contains('close')) {
                this.closeModal();
            }
        });

        // Delete modal events
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-modal-overlay') || 
                e.target.classList.contains('delete-modal-close')) {
                this.closeDeleteModal();
            }
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDeleteBadge();
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDeleteModal();
            }
        });
    }

    async handleAddBadge() {
        console.log('🔄 handleAddBadge called');
        
        const form = document.getElementById('addBadgeForm');
        if (!form) {
            console.error('❌ Form not found in handleAddBadge');
            return;
        }
        
        const formData = new FormData(form);
        
        const userId = formData.get('userId')?.trim() || '';
        const tooltip = formData.get('tooltip')?.trim() || '';
        let badgeUrl = formData.get('badgeUrl')?.trim() || '';
        const imageFile = formData.get('imageFile');
        
        console.log('📝 Form data:', { userId, tooltip, badgeUrl, imageFile: imageFile?.name || 'none' });

        // Validation
        if (!userId || !tooltip) {
            console.log('❌ Validation failed: missing required fields');
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!badgeUrl && (!imageFile || imageFile.size === 0)) {
            console.log('❌ Validation failed: no badge URL or image file');
            this.showToast('Please provide either a badge URL or upload an image', 'error');
            return;
        }
        
        console.log('✅ Validation passed, proceeding with badge addition');
        
        // Add loading state to button
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Adding Badge...';
        submitButton.classList.add('loading');

        try {
            // If image file is provided, upload it first
            if (imageFile && imageFile.size > 0) {
                this.showUploadProgress(true);
                badgeUrl = await this.uploadImage(imageFile);
                this.showUploadProgress(false);
            }

            // Add badge
            const response = await fetch('/api/badges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    tooltip,
                    badge: badgeUrl
                })
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Badge added successfully');
                this.showToast('Badge added successfully!', 'success');
                form.reset();
                document.getElementById('badgeUrl').disabled = false;
                document.getElementById('imageFile').disabled = false;
                this.loadBadges();
            } else {
                console.log('❌ Server error:', result.error);
                this.showToast(result.error || 'Failed to add badge', 'error');
            }
        } catch (error) {
            console.error('❌ Network error adding badge:', error);
            this.showToast('Failed to add badge: ' + error.message, 'error');
            this.showUploadProgress(false);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.classList.remove('loading');
        }
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return result.url;
        } else {
            throw new Error(result.error || 'Failed to upload image');
        }
    }

    showUploadProgress(show) {
        const progressDiv = document.getElementById('uploadProgress');
        if (show) {
            progressDiv.style.display = 'block';
            progressDiv.querySelector('.progress-bar').style.width = '100%';
        } else {
            progressDiv.style.display = 'none';
            progressDiv.querySelector('.progress-bar').style.width = '0%';
        }
    }

    async loadBadges() {
        try {
            const response = await fetch('/api/badges');
            const badges = await response.json();
            this.allBadges = badges; // Store all badges for search functionality
            this.renderBadges(badges);
        } catch (error) {
            console.error('Error loading badges:', error);
            this.showToast('Failed to load badges', 'error');
        }
    }

    handleSearch(searchTerm) {
        const clearButton = document.getElementById('clearSearch');
        
        if (searchTerm.trim()) {
            clearButton.style.display = 'block';
            this.filterBadges(searchTerm.trim());
        } else {
            clearButton.style.display = 'none';
            this.renderBadges(this.allBadges);
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearButton = document.getElementById('clearSearch');
        
        searchInput.value = '';
        clearButton.style.display = 'none';
        this.renderBadges(this.allBadges);
    }

    filterBadges(searchTerm) {
        if (!this.allBadges) return;
        
        const filteredBadges = {};
        const searchLower = searchTerm.toLowerCase();
        
        Object.entries(this.allBadges).forEach(([userId, userBadges]) => {
            if (userId.toLowerCase().includes(searchLower)) {
                filteredBadges[userId] = userBadges;
            }
        });
        
        this.renderBadges(filteredBadges, searchTerm);
    }

    renderBadges(badges, searchTerm = '') {
        const container = document.getElementById('badgesContainer');
        
        if (Object.keys(badges).length === 0) {
            const isSearching = searchTerm.length > 0;
            container.innerHTML = `
                <div class="${isSearching ? 'no-results' : 'empty-state'}">
                    <h3>${isSearching ? 'No results found' : 'No badges yet'}</h3>
                    <p>${isSearching ? `No badges found for "${this.escapeHtml(searchTerm)}"` : 'Add your first badge using the form on the left'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        Object.entries(badges).forEach(([userId, userBadges]) => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-badges';
            
            // Add highlight class if this user matches search
            if (searchTerm && userId.toLowerCase().includes(searchTerm.toLowerCase())) {
                userDiv.classList.add('search-highlight');
            }
            
            userDiv.innerHTML = `
                <div class="user-id">User ID: ${userId}</div>
                <div class="badge-list">
                    ${userBadges.map((badge, index) => `
                        <div class="badge-item">
                            <img src="${badge.badge}" alt="${badge.tooltip}" class="badge-image" 
                                 onclick="badgeDashboard.showImageModal('${badge.badge}')" 
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiNBMEFEQjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjEgMjFMMjcgMjciIHN0cm9rZT0iI0EwQURCOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHA+dGggZD0iTTI3IDIxTDIxIDI3IiBzdHJva2U9IiNBMEFEQjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo='">
                            <div class="badge-info">
                                <div class="badge-tooltip">${this.escapeHtml(badge.tooltip)}</div>
                                <div class="badge-url">${badge.badge}</div>
                            </div>
                            <div class="badge-actions">
                                <button class="btn btn-danger" onclick="badgeDashboard.showDeleteModal('${userId}', ${index}, '${this.escapeHtml(badge.tooltip)}', '${badge.badge}')">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(userDiv);
        });
    }

    showDeleteModal(userId, index, tooltip, badgeUrl) {
        this.pendingDelete = { userId, index };
        
        // Populate modal with badge info
        document.getElementById('deletePreviewImage').src = badgeUrl;
        document.querySelector('.delete-preview-tooltip').textContent = tooltip;
        document.querySelector('.delete-preview-userid').textContent = `User ID: ${userId}`;
        
        // Show modal
        const modal = document.getElementById('deleteModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.pendingDelete = null;
    }

    async confirmDeleteBadge() {
        if (!this.pendingDelete) return;
        
        const { userId, index } = this.pendingDelete;
        
        try {
            const response = await fetch(`/api/badges/${userId}/${index}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast('Badge deleted successfully!', 'success');
                this.loadBadges();
                this.closeDeleteModal();
            } else {
                this.showToast(result.error || 'Failed to delete badge', 'error');
            }
        } catch (error) {
            console.error('Error deleting badge:', error);
            this.showToast('Failed to delete badge', 'error');
        }
    }

    showImageModal(imageSrc) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the dashboard when the page loads
let badgeDashboard;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing BadgeDashboard');
    badgeDashboard = new BadgeDashboard();
    // Make badgeDashboard globally accessible for onclick handlers
    window.badgeDashboard = badgeDashboard;
    console.log('✅ BadgeDashboard initialized and set globally');
});