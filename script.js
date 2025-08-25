// Wrote by ThomasConway
// Imagination Roblox Group Website Script

class ImaginationWebsite {
    constructor() {
        this.groupId = '32858884';
        this.robloxApiBase = 'https://games.roblox.com/v2';
        this.thumbnailsApi = 'https://thumbnails.roblox.com/v1';
        this.groupsApi = 'https://groups.roblox.com/v1';
        this.economyApi = 'https://economy.roblox.com/v1';
        this.init();
    }

    init() {
        this.showLoading();
        this.loadGroupInfo();
        this.loadGames();
        this.loadEvents();
        this.loadMerchandise();
        this.setupAutoUpdate();
        this.updateLastUpdated();
    }

    showLoading() {
        const containers = ['games-container', 'events-container', 'merchandise-container'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading content...</p>
                </div>
            `;
        });
    }

    async loadGroupInfo() {
        try {
            const response = await fetch(`${this.groupsApi}/groups/${this.groupId}`);
            const data = await response.json();

            if (data) {
                document.getElementById('members-count').textContent = this.formatNumber(data.memberCount || 0);
            }
        } catch (error) {
            console.error('Error loading group info:', error);
            this.showError('members-count', 'Failed to load member count');
        }
    }

    async loadGames() {
        try {
            const response = await fetch(`${this.robloxApiBase}/groups/${this.groupId}/games?limit=20`);
            const data = await response.json();

            const gamesContainer = document.getElementById('games-container');
            gamesContainer.innerHTML = '';

            if (data.data && data.data.length > 0) {
                document.getElementById('games-count').textContent = data.data.length;

                let totalVisits = 0;
                for (const game of data.data) {
                    const gameCard = await this.createGameCard(game);
                    gamesContainer.appendChild(gameCard);
                    totalVisits += game.placeVisits || 0;
                }

                document.getElementById('visits-count').textContent = this.formatNumber(totalVisits);
            } else {
                this.showError('games-container', 'No games found');
                document.getElementById('games-count').textContent = '0';
                document.getElementById('visits-count').textContent = '0';
            }
        } catch (error) {
            console.error('Error loading games:', error);
            this.showError('games-container', 'Failed to load games');
            this.showError('games-count', '0');
            this.showError('visits-count', '0');
        }
    }

    async createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';

        const thumbnailUrl = await this.getGameThumbnail(game.id);
        const priceInfo = await this.getGamePrice(game.id);
        const description = this.truncateText(game.description || 'An amazing game created by Imagination!', 100);

        card.innerHTML = `
            <img src="${thumbnailUrl}" alt="${game.name}" onerror="this.src='${this.createPlaceholderImage('Game Image')}'">
            <div class="card-content">
                <h3>${this.escapeHtml(game.name)}</h3>
                <p>${this.escapeHtml(description)}</p>
                <div class="visits-info">👥 ${this.formatNumber(game.placeVisits || 0)} visits</div>
                ${priceInfo ? `<div class="price-info">${priceInfo}</div>` : ''}
                <a href="https://www.roblox.com/games/${game.id}" target="_blank" class="card-button">Play Game</a>
            </div>
        `;

        return card;
    }

    async getGameThumbnail(gameId) {
        try {
            const response = await fetch(`${this.thumbnailsApi}/games/icons?gameIds=${gameId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`);
            const data = await response.json();
            return data.data[0]?.imageUrl || this.createPlaceholderImage('Game Image');
        } catch (error) {
            console.error('Error fetching thumbnail:', error);
            return this.createPlaceholderImage('Game Image');
        }
    }

    async getGamePrice(gameId) {
        try {
            const response = await fetch(`${this.economyApi}/games/${gameId}/game-passes`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const pass = data.data[0];
                if (pass.price) {
                    return `💎 ${this.formatNumber(pass.price)} Robux`;
                }
            }

            const gameResponse = await fetch(`${this.robloxApiBase}/games/${gameId}`);
            const gameData = await gameResponse.json();
            if (gameData.price) {
                return `💎 ${this.formatNumber(gameData.price)} Robux`;
            }

            return null;
        } catch (error) {
            console.error('Error fetching game price:', error);
            return null;
        }
    }

    async loadEvents() {
        // Show error for events since we don't have real event data
        this.showError('events-container', 'Failed to load events');
    }

    async loadMerchandise() {
        // Show error for merchandise since we don't have real merchandise data
        this.showError('merchandise-container', 'Failed to load merchandise');
    }

    setupAutoUpdate() {
        // Update games every 5 minutes
        setInterval(() => {
            this.loadGames();
            this.updateLastUpdated();
        }, 5 * 60 * 1000);
    }

    updateLastUpdated() {
        const now = new Date();
        const formatted = now.toLocaleString();
        document.getElementById('last-updated').textContent = formatted;
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createPlaceholderImage(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, 300, 200);

        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 150, 100);

        return canvas.toDataURL();
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImaginationWebsite();
});

// Smooth scrolling for navigation
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
