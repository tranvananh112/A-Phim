// API Service for ophim17.cc and Backend
class MovieAPI {
    constructor() {
        this.useBackend = API_CONFIG.USE_BACKEND;
        this.backendURL = API_CONFIG.BACKEND_URL;
        this.ophimURL = API_CONFIG.OPHIM_URL;
        this.ophim17URL = API_CONFIG.OPHIM17_URL;
        this.useMultipleSources = API_CONFIG.USE_MULTIPLE_SOURCES;
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    // Fetch with auth header
    async fetchWithAuth(url, options = {}) {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = 'login.html';
            throw new Error('Phiên đăng nhập đã hết hạn');
        }

        return response;
    }

    // Fetch movie list with pagination
    async getMovieList(page = 1) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies?page=${page}&limit=20`);
                const data = await response.json();

                console.log('Backend response:', data);

                // Always return data if we got a response
                return data;
            } else {
                const response = await fetch(`${this.ophimURL}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
                    headers: { 'accept': 'application/json' }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching movie list:', error);
            return null;
        }
    }

    // Fetch movie detail by slug
    async getMovieDetail(slug) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies/${slug}`);
                const data = await response.json();

                console.log('Backend movie detail response:', data);

                // Always return data if we got a response
                // The backend should handle the format
                return data;
            } else {
                const response = await fetch(`${this.ophimURL}/phim/${slug}`, {
                    headers: { 'accept': 'application/json' }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching movie detail:', error);
            return null;
        }
    }

    // Search movies
    async searchMovies(keyword, page = 1) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies/search?q=${encodeURIComponent(keyword)}&page=${page}`);
                const data = await response.json();

                console.log('Backend search response:', data);

                // Check both success and status fields
                if (data.success || data.status === 'success') {
                    return data; // Return the whole response
                }
                return null;
            } else {
                const response = await fetch(`${this.ophimURL}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`, {
                    headers: { 'accept': 'application/json' }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error searching movies:', error);
            return null;
        }
    }

    // Get movies by category
    async getMoviesByCategory(categorySlug, page = 1) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies?category=${categorySlug}&page=${page}`);
                const data = await response.json();

                // Backend now returns Ophim-compatible format
                if (data.success) {
                    return {
                        status: 'success',
                        data: data.data
                    };
                }
                return null;
            } else {
                const response = await fetch(`${this.ophimURL}/the-loai/${categorySlug}?page=${page}`, {
                    headers: { 'accept': 'application/json' }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching category movies:', error);
            return null;
        }
    }

    // Get movies by country
    async getMoviesByCountry(countrySlug, page = 1) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies?country=${countrySlug}&page=${page}`);
                const data = await response.json();

                // Backend now returns Ophim-compatible format
                if (data.success) {
                    return {
                        status: 'success',
                        data: data.data
                    };
                }
                return null;
            } else {
                const response = await fetch(`${this.ophimURL}/quoc-gia/${countrySlug}?page=${page}`, {
                    headers: { 'accept': 'application/json' }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching country movies:', error);
            return null;
        }
    }

    // Get stream URL (requires authentication if using backend)
    async getStreamURL(slug, episodeSlug) {
        try {
            if (this.useBackend) {
                const response = await this.fetchWithAuth(`${this.backendURL}/movies/${slug}/stream/${episodeSlug}`);
                const data = await response.json();

                if (data.success) {
                    return data.data.streamURL;
                }
                throw new Error(data.message || 'Không thể lấy link phim');
            } else {
                // Direct Ophim - get from movie detail
                const movieData = await this.getMovieDetail(slug);
                if (movieData && movieData.data && movieData.data.item) {
                    const episodes = movieData.data.item.episodes;
                    for (const server of episodes) {
                        const episode = server.server_data?.find(ep => ep.slug === episodeSlug);
                        if (episode) {
                            return episode.link_m3u8;
                        }
                    }
                }
                throw new Error('Không tìm thấy link phim');
            }
        } catch (error) {
            console.error('Error getting stream URL:', error);
            throw error;
        }
    }

    // Get image URL
    getImageURL(imagePath) {
        if (!imagePath) return 'https://via.placeholder.com/400x600?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_CONFIG.IMAGE_BASE}${imagePath}`;
    }

    // Get list of categories
    async getCategories() {
        try {
            const response = await fetch(`${this.ophimURL}/the-loai`, {
                headers: { 'accept': 'application/json' }
            });
            const data = await response.json();

            console.log('Categories API response:', data);

            if (data.status === 'success' && data.data) {
                // Check if data.data.items exists (new format)
                if (data.data.items && Array.isArray(data.data.items)) {
                    console.log('Categories array from items:', data.data.items);
                    return data.data.items;
                }

                // Fallback to old format
                let categories = [];

                if (Array.isArray(data.data)) {
                    categories = data.data;
                } else if (typeof data.data === 'object') {
                    categories = Object.entries(data.data).map(([key, value]) => {
                        if (typeof value === 'object' && value.slug && value.name) {
                            return value;
                        } else if (typeof value === 'string') {
                            return { slug: key, name: value };
                        } else if (typeof value === 'object' && value.name) {
                            return { slug: key, name: value.name };
                        }
                        return { slug: key, name: key };
                    });
                }

                console.log('Categories converted to array:', categories);
                return categories;
            }
            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Get list of countries
    async getCountries() {
        // API /quoc-gia không trả về danh sách, dùng danh sách cố định
        return [
            { slug: 'viet-nam', name: 'Việt Nam' },
            { slug: 'trung-quoc', name: 'Trung Quốc' },
            { slug: 'han-quoc', name: 'Hàn Quốc' },
            { slug: 'nhat-ban', name: 'Nhật Bản' },
            { slug: 'thai-lan', name: 'Thái Lan' },
            { slug: 'au-my', name: 'Âu Mỹ' },
            { slug: 'dai-loan', name: 'Đài Loan' },
            { slug: 'hong-kong', name: 'Hồng Kông' },
            { slug: 'an-do', name: 'Ấn Độ' },
            { slug: 'anh', name: 'Anh' },
            { slug: 'phap', name: 'Pháp' },
            { slug: 'canada', name: 'Canada' },
            { slug: 'duc', name: 'Đức' },
            { slug: 'tay-ban-nha', name: 'Tây Ban Nha' },
            { slug: 'tho-nhi-ky', name: 'Thổ Nhĩ Kỳ' },
            { slug: 'ha-lan', name: 'Hà Lan' },
            { slug: 'indonesia', name: 'Indonesia' },
            { slug: 'nga', name: 'Nga' },
            { slug: 'mexico', name: 'Mexico' },
            { slug: 'ba-lan', name: 'Ba Lan' },
            { slug: 'uc', name: 'Úc' },
            { slug: 'thuy-dien', name: 'Thụy Điển' },
            { slug: 'malaysia', name: 'Malaysia' },
            { slug: 'brazil', name: 'Brazil' },
            { slug: 'philippines', name: 'Philippines' },
            { slug: 'bo-dao-nha', name: 'Bồ Đào Nha' },
            { slug: 'y', name: 'Ý' },
            { slug: 'dan-mach', name: 'Đan Mạch' },
            { slug: 'uae', name: 'UAE' },
            { slug: 'na-uy', name: 'Na Uy' },
            { slug: 'thuy-si', name: 'Thụy Sĩ' },
            { slug: 'chau-phi', name: 'Châu Phi' },
            { slug: 'nam-phi', name: 'Nam Phi' },
            { slug: 'ukraina', name: 'Ukraina' },
            { slug: 'a-rap-xe-ut', name: 'Ả Rập Xê Út' }
        ];
    }

    // Fetch from Ophim17 (secondary source)
    async getMovieListFromOphim17(page = 1) {
        try {
            const response = await fetch(`${this.ophim17URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
                headers: { 'accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching from Ophim17:', error);
            return null;
        }
    }

    async getMoviesByCategoryFromOphim17(categorySlug, page = 1) {
        try {
            const response = await fetch(`${this.ophim17URL}/v1/api/the-loai/${categorySlug}?page=${page}`, {
                headers: { 'accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching category from Ophim17:', error);
            return null;
        }
    }

    // Combine movies from multiple sources
    async getMoviesFromMultipleSources(page = 1, categorySlug = null) {
        if (!this.useMultipleSources) {
            // Use single source
            if (categorySlug) {
                return await this.getMoviesByCategory(categorySlug, page);
            }
            return await this.getMovieList(page);
        }

        try {
            // Fetch from both sources in parallel
            const promises = [];

            if (categorySlug) {
                promises.push(this.getMoviesByCategory(categorySlug, page));
                promises.push(this.getMoviesByCategoryFromOphim17(categorySlug, page));
            } else {
                promises.push(this.getMovieList(page));
                promises.push(this.getMovieListFromOphim17(page));
            }

            const results = await Promise.allSettled(promises);

            // Combine results
            let allMovies = [];
            let combinedData = {
                status: 'success',
                data: {
                    items: [],
                    params: null
                }
            };

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const data = result.value;
                    if (data.status === 'success' && data.data && data.data.items) {
                        allMovies = allMovies.concat(data.data.items);

                        // Use params from first source
                        if (!combinedData.data.params && data.data.params) {
                            combinedData.data.params = data.data.params;
                        }
                    }
                }
            });

            // Remove duplicates based on slug
            const uniqueMovies = [];
            const seenSlugs = new Set();

            allMovies.forEach(movie => {
                if (!seenSlugs.has(movie.slug)) {
                    seenSlugs.add(movie.slug);
                    uniqueMovies.push(movie);
                }
            });

            combinedData.data.items = uniqueMovies;

            console.log(`Combined ${uniqueMovies.length} unique movies from ${results.length} sources`);

            return combinedData;
        } catch (error) {
            console.error('Error combining multiple sources:', error);
            // Fallback to single source
            if (categorySlug) {
                return await this.getMoviesByCategory(categorySlug, page);
            }
            return await this.getMovieList(page);
        }
    }
}

// Initialize API
const movieAPI = new MovieAPI();
