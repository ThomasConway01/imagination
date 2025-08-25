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
        // Try CORS proxy first, fallback to mock data
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://groups.roblox.com/v1/groups/${this.groupId}`)}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.contents) {
                const groupData = JSON.parse(data.contents);
                document.getElementById('members-count').textContent = this.formatNumber(groupData.memberCount || 0);
            } else {
                throw new Error('Invalid proxy response');
            }
        } catch (error) {
            console.log('Proxy failed, using mock data:', error);
            // Fallback to mock data
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockData = { memberCount: 15420 };
            document.getElementById('members-count').textContent = this.formatNumber(mockData.memberCount);
        }
    }

    async loadGames() {
        // Try CORS proxy first, fallback to mock data
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://games.roblox.com/v2/groups/${this.groupId}/games?limit=20`)}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();

            const gamesContainer = document.getElementById('games-container');
            gamesContainer.innerHTML = '';

            if (data.contents) {
                const gamesData = JSON.parse(data.contents);

                if (gamesData.data && gamesData.data.length > 0) {
                    document.getElementById('games-count').textContent = gamesData.data.length;

                    let totalVisits = 0;
                    for (const game of gamesData.data) {
                        const gameCard = await this.createGameCard(game);
                        gamesContainer.appendChild(gameCard);
                        totalVisits += game.placeVisits || 0;
                    }

                    document.getElementById('visits-count').textContent = this.formatNumber(totalVisits);
                } else {
                    throw new Error('No games found');
                }
            } else {
                throw new Error('Invalid proxy response');
            }
        } catch (error) {
            console.log('Proxy failed, using mock data:', error);
            // Fallback to mock data
            await new Promise(resolve => setTimeout(resolve, 800));

            const gamesContainer = document.getElementById('games-container');
            gamesContainer.innerHTML = '';

            const mockGames = [
                {
                    id: 1,
                    name: "Imagination Tower Defense",
                    description: "Epic tower defense game with amazing graphics and challenging levels!",
                    placeVisits: 125000,
                    price: null
                },
                {
                    id: 2,
                    name: "Imagination Racing",
                    description: "High-speed racing with customizable cars and stunning tracks!",
                    placeVisits: 89000,
                    price: null
                },
                {
                    id: 3,
                    name: "Imagination Adventure",
                    description: "Explore vast worlds and embark on incredible quests!",
                    placeVisits: 156000,
                    price: null
                }
            ];

            document.getElementById('games-count').textContent = mockGames.length;

            let totalVisits = 0;
            for (const game of mockGames) {
                const gameCard = await this.createGameCard(game);
                gamesContainer.appendChild(gameCard);
                totalVisits += game.placeVisits || 0;
            }

            document.getElementById('visits-count').textContent = this.formatNumber(totalVisits);
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
        // Use mock data for events
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const eventsContainer = document.getElementById('events-container');
            eventsContainer.innerHTML = '';

            const mockEvents = [
                {
                    title: "Summer Building Contest",
                    date: "2024-08-25",
                    description: "Show off your building skills in our summer contest! Create amazing structures and win exclusive rewards.",
                    image: this.createPlaceholderImage("Building Contest"),
                    type: "Contest"
                },
                {
                    title: "Community Meetup",
                    date: "2024-08-30",
                    description: "Join us for a fun community meetup event. Meet other members and participate in mini-games!",
                    image: this.createPlaceholderImage("Community Meetup"),
                    type: "Social"
                },
                {
                    title: "Game Development Workshop",
                    date: "2024-09-05",
                    description: "Learn advanced game development techniques from our experienced developers.",
                    image: this.createPlaceholderImage("Workshop"),
                    type: "Educational"
                }
            ];

            mockEvents.forEach(event => {
                const eventCard = this.createEventCard(event);
                eventsContainer.appendChild(eventCard);
            });
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('events-container', 'Failed to load events');
        }
    }

    async loadMerchandise() {
        // Use mock data for merchandise
        try {
            await new Promise(resolve => setTimeout(resolve, 700));

            const merchandiseContainer = document.getElementById('merchandise-container');
            merchandiseContainer.innerHTML = '';

            const mockMerchandise = [
                {
                    title: "Imagination T-Shirt",
                    price: "299",
                    description: "Show your Imagination pride with our official t-shirt! High-quality fabric with our logo.",
                    image: this.createPlaceholderImage("T-Shirt"),
                    category: "Clothing"
                },
                {
                    title: "Logo Hoodie",
                    price: "599",
                    description: "Stay warm and stylish with our premium logo hoodie. Perfect for gaming sessions!",
                    image: this.createPlaceholderImage("Hoodie"),
                    category: "Clothing"
                },
                {
                    title: "Gaming Mouse Pad",
                    price: "199",
                    description: "Enhance your gaming setup with our custom mouse pad featuring the Imagination logo.",
                    image: this.createPlaceholderImage("Mouse Pad"),
                    category: "Accessories"
                },
                {
                    title: "Developer Badge",
                    price: "99",
                    description: "Show off your developer status with this exclusive Imagination developer badge.",
                    image: this.createPlaceholderImage("Badge"),
                    category: "Digital"
                }
            ];

            mockMerchandise.forEach(item => {
                const merchCard = this.createMerchandiseCard(item);
                merchandiseContainer.appendChild(merchCard);
            });
        } catch (error) {
            console.error('Error loading merchandise:', error);
            this.showError('merchandise-container', 'Failed to load merchandise');
        }
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
