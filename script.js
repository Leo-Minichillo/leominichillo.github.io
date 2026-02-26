// ============================================
// Leo Minichillo — Site Interactions
// ============================================

(function () {
    'use strict';

    // ---- Ticker Bar (Live Asset Prices) ----
    (function setupTicker() {
        var tickerTrack = document.getElementById('tickerTrack');
        var tickerBar = document.getElementById('tickerBar');
        if (!tickerTrack || !tickerBar) return;

        var tickerAssets = [
            { symbol: 'BTC', name: 'Bitcoin', price: null, change: null, type: 'crypto', id: 'bitcoin' },
            { symbol: 'ETH', name: 'Ethereum', price: null, change: null, type: 'crypto', id: 'ethereum' },
            { symbol: 'SOL', name: 'Solana', price: null, change: null, type: 'crypto', id: 'solana' },
            { symbol: 'HBAR', name: 'Hedera', price: null, change: null, type: 'crypto', id: 'hedera-hashgraph' },
            { symbol: 'GOOGL', name: 'Google', price: null, change: null, type: 'stock' },
            { symbol: 'TSM', name: 'TSMC', price: null, change: null, type: 'stock' },
            { symbol: 'CAVA', name: 'Cava', price: null, change: null, type: 'stock' }
        ];

        // Fallback values if APIs fail
        var fallbackData = {
            'BTC':   { price: 96000, change: 1.2 },
            'ETH':   { price: 2700,  change: -0.5 },
            'SOL':   { price: 170,   change: 2.3 },
            'HBAR':  { price: 0.22,  change: 3.1 },
            'GOOGL': { price: 182,   change: 0.8 },
            'TSM':   { price: 205,   change: 1.1 },
            'CAVA':  { price: 110,   change: -1.4 }
        };

        function formatPrice(price) {
            if (price === null) return '--';
            if (price >= 1000) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 0 });
            if (price >= 1) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return '$' + price.toFixed(4);
        }

        function formatChange(change) {
            if (change === null || change === undefined) return '';
            var sign = change >= 0 ? '+' : '';
            return sign + change.toFixed(2) + '%';
        }

        // Generate a deterministic mini sparkline from price
        function generateSparkline(seed, isPositive) {
            var points = [];
            var s = Math.abs(seed || 1);
            for (var i = 0; i < 7; i++) {
                s = (s * 9301 + 49297) % 233280;
                points.push(1 + (s / 233280) * 8);
            }
            if (isPositive) {
                points[points.length - 1] = Math.min(points[points.length - 1] + 2, 10);
                points[0] = Math.max(points[0] - 2, 1);
            } else {
                points[0] = Math.min(points[0] + 2, 10);
                points[points.length - 1] = Math.max(points[points.length - 1] - 2, 1);
            }
            var step = 36 / (points.length - 1);
            var coords = points.map(function (y, i) { return Math.round(i * step) + ',' + y.toFixed(1); }).join(' ');
            var color = isPositive ? '#10b981' : '#ef4444';
            return '<svg class="ticker-spark" viewBox="0 0 36 12"><polyline points="' + coords + '" fill="none" stroke="' + color + '" stroke-width="1.2" stroke-linecap="round"/></svg>';
        }

        function renderTicker() {
            var html = '';
            for (var i = 0; i < tickerAssets.length; i++) {
                var a = tickerAssets[i];
                var fb = fallbackData[a.symbol];
                var price = a.price !== null ? a.price : (fb ? fb.price : null);
                var change = a.change !== null ? a.change : (fb ? fb.change : null);
                var isPositive = change !== null ? change >= 0 : true;
                var changeClass = isPositive ? 'positive' : 'negative';

                html += '<span class="ticker-item">';
                html += '<span class="ticker-symbol">' + a.symbol + '</span>';
                html += '<span class="ticker-price">' + formatPrice(price) + '</span>';
                if (change !== null) {
                    html += '<span class="ticker-change ' + changeClass + '">' + formatChange(change) + '</span>';
                }
                html += generateSparkline(price, isPositive);
                html += '</span>';
                if (i < tickerAssets.length - 1) {
                    html += '<span class="ticker-sep">\u00b7</span>';
                }
            }
            // Duplicate for seamless loop
            tickerTrack.innerHTML = html + '<span class="ticker-sep">\u00b7</span>' + html;
        }

        // ---- Cache helpers (max 1 API call per hour per source) ----
        var CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

        function getCached(key) {
            try {
                var raw = localStorage.getItem(key);
                if (!raw) return null;
                var cached = JSON.parse(raw);
                if (Date.now() - cached.ts < CACHE_TTL) return cached.data;
            } catch (e) {}
            return null;
        }

        function setCache(key, data) {
            try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
        }

        // Apply fetched/cached crypto data
        function applyCryptoData(data) {
            data.forEach(function (coin) {
                var asset = tickerAssets.find(function (a) { return a.id === coin.id; });
                if (!asset) return;
                asset.price = coin.current_price;
                asset.change = coin.price_change_percentage_24h || null;
            });
            renderTicker();
        }

        function applyStockData(stockResults) {
            stockResults.forEach(function (item) {
                var asset = tickerAssets.find(function (a) { return a.symbol === item.symbol; });
                if (asset) {
                    asset.price = item.price;
                    asset.change = item.change;
                }
            });
            renderTicker();
        }

        // Initial render with fallbacks
        renderTicker();

        // Fetch crypto from CoinGecko /coins/markets (24h change)
        function fetchCrypto() {
            var cached = getCached('ticker_crypto');
            if (cached) { applyCryptoData(cached); return; }

            var ids = tickerAssets.filter(function (a) { return a.type === 'crypto'; }).map(function (a) { return a.id; }).join(',');
            fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + ids)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (Array.isArray(data) && data.length > 0) {
                        setCache('ticker_crypto', data);
                        applyCryptoData(data);
                    }
                })
                .catch(function () { /* keep fallback values */ });
        }

        // Fetch stock prices from Finnhub (free tier, 24h change only)
        var FINNHUB_API_KEY = 'd6fndhpr01qqnmbpau5gd6fndhpr01qqnmbpau60';

        function fetchStocks() {
            var cached = getCached('ticker_stocks');
            if (cached) { applyStockData(cached); return; }

            var stocks = tickerAssets.filter(function (a) { return a.type === 'stock'; });
            var results = [];
            var done = 0;

            stocks.forEach(function (asset) {
                fetch('https://finnhub.io/api/v1/quote?symbol=' + asset.symbol + '&token=' + FINNHUB_API_KEY)
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data && data.c && data.c > 0) {
                            results.push({ symbol: asset.symbol, price: data.c, change: data.dp });
                        }
                    })
                    .catch(function () {})
                    .finally(function () {
                        done++;
                        if (done === stocks.length) {
                            if (results.length > 0) {
                                setCache('ticker_stocks', results);
                                applyStockData(results);
                            }
                        }
                    });
            });
        }

        fetchCrypto();
        fetchStocks();
    })();

    // ---- Polymarket Live Positions ----
    (function setupPolymarket() {
        var WALLET = '0xc42e3Ad86BD9233631b5d494D29eA8aCaa25EdBd';
        var CACHE_KEY = 'poly_data';
        var CACHE_TTL = 60 * 60 * 1000;
        var BASE = 'https://data-api.polymarket.com';
        var posEl = document.getElementById('polyPositions');
        var lifetimePnlEl = document.getElementById('polyLifetimePnlValue');
        var heroPnlEl = document.getElementById('heroPolyPnl');
        if (!posEl) return;

        function getCached(key) {
            try {
                var raw = localStorage.getItem(key);
                if (!raw) return null;
                var cached = JSON.parse(raw);
                if (Date.now() - cached.ts < CACHE_TTL) return cached.data;
            } catch (e) {}
            return null;
        }

        function setCache(key, data) {
            try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
        }

        function fmtUSD(val) {
            var abs = Math.abs(val);
            var str = abs >= 1000
                ? '$' + abs.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : '$' + abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (val >= 0 ? '+' : '-') + str;
        }

        function fmtHeroPnl(val) {
            var abs = Math.abs(val);
            if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'k';
            return '$' + abs.toFixed(0);
        }

        function updatePnl(val) {
            if (lifetimePnlEl) {
                lifetimePnlEl.textContent = fmtUSD(val);
                lifetimePnlEl.className = 'polymarket-value ' + (val >= 0 ? 'positive' : 'negative');
            }
            if (heroPnlEl) {
                heroPnlEl.textContent = fmtHeroPnl(val);
            }
        }

        function renderPositions(openPositions) {
            var top3 = openPositions.filter(function (p) { return (p.currentValue || 0) > 0; }).slice(0, 3);
            if (top3.length === 0) { posEl.innerHTML = ''; return; }

            var html = '';
            top3.forEach(function (pos) {
                var outcome = (pos.outcome || '').toLowerCase();
                var isYes = outcome === 'yes';
                var outcomeClass = isYes ? 'yes' : 'no';
                var outcomeLabel = isYes ? 'YES' : 'NO';
                var title = pos.title || 'Unknown market';
                var curVal = pos.currentValue || 0;
                var pnl = pos.cashPnl || 0;
                var pnlClass = pnl >= 0 ? 'positive' : 'negative';
                var slug = pos.slug || pos.eventSlug || '';
                var href = slug ? 'https://polymarket.com/event/' + slug : 'https://polymarket.com/profile/' + WALLET;

                html += '<a href="' + href + '" target="_blank" rel="noopener" class="poly-pos">';
                html += '<span class="poly-pos-outcome ' + outcomeClass + '">' + outcomeLabel + '</span>';
                html += '<span class="poly-pos-title">' + title + '</span>';
                html += '<span class="poly-pos-value">$' + curVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</span>';
                html += '<span class="poly-pos-pnl ' + pnlClass + '">' + fmtUSD(pnl) + '</span>';
                html += '</a>';
            });
            posEl.innerHTML = html;
        }

        function render(data) {
            // Lifetime P&L = open cashPnl + closed cashPnl
            var lifetimePnl = 0;
            (data.open || []).forEach(function (p) { lifetimePnl += (p.cashPnl || 0); });
            (data.closed || []).forEach(function (p) { lifetimePnl += (p.realizedPnl || 0); });
            updatePnl(lifetimePnl);
            renderPositions(data.open || []);
        }

        function fallback() {
            updatePnl(7500);
            posEl.innerHTML = '';
        }

        function fetchData() {
            var cached = getCached(CACHE_KEY);
            if (cached) { render(cached); return; }

            posEl.innerHTML = '<span class="poly-loading">Loading positions\u2026</span>';

            var openUrl = BASE + '/positions?user=' + WALLET + '&sortBy=CURRENT&sortDirection=DESC&limit=50&sizeThreshold=1';
            var closedUrl = BASE + '/closed-positions?user=' + WALLET;

            Promise.all([
                fetch(openUrl).then(function (r) { return r.json(); }),
                fetch(closedUrl).then(function (r) { return r.json(); })
            ])
            .then(function (results) {
                var open = Array.isArray(results[0]) ? results[0] : [];
                var closed = Array.isArray(results[1]) ? results[1] : [];
                if (open.length === 0 && closed.length === 0) { fallback(); return; }
                var data = { open: open, closed: closed };
                setCache(CACHE_KEY, data);
                render(data);
            })
            .catch(function () {
                fallback();
            });
        }

        fetchData();
    })();

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    var resultsInView = false;

    function handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;

        // Scroll-driven result bar animation
        if (resultsInView) {
            handleResultsParallax();
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ---- Mobile menu toggle ----
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
            navToggle.classList.toggle('active');
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }

    // ---- Intersection Observer for fade-in ----
    var fadeTargets = document.querySelectorAll(
        '.section-header, .about-lead, .timeline-item, .about-interests, ' +
        '.career-card, .results-overview, .result-card, .polymarket-card, ' +
        '.project-card, .game-wrapper'
    );

    fadeTargets.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeTargets.forEach(function (el) {
        fadeObserver.observe(el);
    });

    // ---- Animated counter for hero stat ----
    function animateCounter(element, target, prefix, suffix) {
        var start = 0;
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(start + (target - start) * eased);
            element.textContent = prefix + current + 'k' + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // Observe the hero stat to trigger animation
    var heroStat = document.querySelector('.stat-value[data-target]');
    if (heroStat) {
        var target = parseInt(heroStat.getAttribute('data-target'), 10);
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target, target, '$', '');
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statObserver.observe(heroStat);
    }

    // ---- Scroll-driven result bar animation + parallax ----
    var resultCards = document.querySelectorAll('.result-card');
    var resultsSection = document.getElementById('results');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function handleResultsParallax() {
        var vh = window.innerHeight;
        resultCards.forEach(function (card) {
            var rect = card.getBoundingClientRect();
            var bar = card.querySelector('.result-bar-fill');
            if (!bar) return;

            var fillTarget = parseFloat(bar.style.getPropertyValue('--fill-width')) || 0;

            // Progress: 0 when card bottom edge enters viewport, 1 when card is fully in view
            var progress = (vh - rect.top) / (vh * 0.6);
            progress = Math.max(0, Math.min(1, progress));

            // Ease the progress for a smoother feel
            var eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            bar.style.width = (eased * fillTarget) + '%';

            // Subtle parallax: cards shift slightly based on distance from viewport center
            if (!prefersReducedMotion) {
                var centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
                card.style.transform = 'translateY(' + (centerOffset * 12).toFixed(1) + 'px)';
            }
        });
    }

    if (resultsSection) {
        // Initialize bar widths to 0 and store target in CSS var
        resultCards.forEach(function (card) {
            var bar = card.querySelector('.result-bar-fill');
            if (bar) bar.style.width = '0%';
        });

        if (prefersReducedMotion) {
            // Fallback: one-shot animation for reduced motion
            var barObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var bar = entry.target.querySelector('.result-bar-fill');
                        if (bar) {
                            bar.style.transition = 'width 1s ease';
                            bar.style.width = bar.style.getPropertyValue('--fill-width');
                        }
                        barObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            resultCards.forEach(function (card) { barObserver.observe(card); });
        } else {
            // Scroll-driven: toggle resultsInView flag
            var resultsObserver = new IntersectionObserver(function (entries) {
                resultsInView = entries[0].isIntersecting;
                if (resultsInView) handleResultsParallax();
            }, { threshold: 0 });
            resultsObserver.observe(resultsSection);
        }
    }

    // ---- Smooth scroll for nav links ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- How to Play toggle ----
    var explainerToggle = document.getElementById('explainerToggle');
    var explainerContent = document.getElementById('explainerContent');
    var explainerArrow = document.getElementById('explainerArrow');

    if (explainerToggle) {
        explainerToggle.addEventListener('click', function () {
            explainerContent.classList.toggle('open');
            explainerArrow.classList.toggle('open');
        });
    }

    // ---- Beat the Spread Game ----
    // 2025-26 NFL team data: nfelo ratings + EPA per play (offense & defense)
    // Spread model blends Elo margin (60%) with EPA matchup margin (40%) + home-field advantage
    // Score simulation uses bivariate normal around EPA-derived team means
    var teamData = {
        'Seahawks':    { nfelo: 1731.02, offEPA:  0.0895, defEPA: -0.1428 },
        'Rams':        { nfelo: 1660.29, offEPA:  0.1344, defEPA: -0.0305 },
        'Bills':       { nfelo: 1634.73, offEPA:  0.1487, defEPA:  0.0388 },
        'Patriots':    { nfelo: 1621.17, offEPA:  0.0901, defEPA: -0.094  },
        '49ers':       { nfelo: 1609.42, offEPA:  0.0872, defEPA:  0.0462 },
        'Texans':      { nfelo: 1603.33, offEPA: -0.0226, defEPA: -0.1693 },
        'Lions':       { nfelo: 1602.05, offEPA:  0.0902, defEPA:  0.0203 },
        'Jaguars':     { nfelo: 1599.65, offEPA:  0.073,  defEPA: -0.0636 },
        'Eagles':      { nfelo: 1572.2,  offEPA:  0.0133, defEPA: -0.0403 },
        'Bears':       { nfelo: 1566.14, offEPA:  0.0689, defEPA:  0.0422 },
        'Ravens':      { nfelo: 1557.3,  offEPA:  0.0596, defEPA:  0.0342 },
        'Broncos':     { nfelo: 1534.56, offEPA:  0.0221, defEPA: -0.0507 },
        'Bengals':     { nfelo: 1508.87, offEPA:  0.0428, defEPA:  0.1282 },
        'Steelers':    { nfelo: 1503.93, offEPA:  0.0203, defEPA:  0.0327 },
        'Packers':     { nfelo: 1492.8,  offEPA:  0.119,  defEPA:  0.0786 },
        'Falcons':     { nfelo: 1489.71, offEPA: -0.0223, defEPA:  0.0305 },
        'Cowboys':     { nfelo: 1485.49, offEPA:  0.1319, defEPA:  0.1845 },
        'Vikings':     { nfelo: 1478.4,  offEPA: -0.0945, defEPA: -0.0977 },
        'Chargers':    { nfelo: 1456.61, offEPA: -0.0301, defEPA: -0.0488 },
        'Buccaneers':  { nfelo: 1438.76, offEPA: -0.0025, defEPA:  0.027  },
        'Giants':      { nfelo: 1428.52, offEPA:  0.0346, defEPA:  0.0914 },
        'Chiefs':      { nfelo: 1428.39, offEPA:  0.0498, defEPA:  0.0157 },
        'Saints':      { nfelo: 1418.04, offEPA: -0.1245, defEPA: -0.035  },
        'Panthers':    { nfelo: 1400.67, offEPA: -0.017,  defEPA:  0.0664 },
        'Colts':       { nfelo: 1392.11, offEPA:  0.1117, defEPA:  0.0405 },
        'Browns':      { nfelo: 1386.42, offEPA: -0.2101, defEPA: -0.0959 },
        'Dolphins':    { nfelo: 1356.64, offEPA:  0.0094, defEPA:  0.0902 },
        'Cardinals':   { nfelo: 1335.27, offEPA: -0.0274, defEPA:  0.1169 },
        'Titans':      { nfelo: 1334.42, offEPA: -0.1422, defEPA:  0.0865 },
        'Commanders':  { nfelo: 1318.4,  offEPA:  0.0323, defEPA:  0.1383 },
        'Raiders':     { nfelo: 1285.34, offEPA: -0.2042, defEPA:  0.0318 },
        'Jets':        { nfelo: 1226.52, offEPA: -0.0706, defEPA:  0.1569 }
    };

    // Standard deviation of the game margin (for win probability)
    // sigma = sqrt(2 * sd^2 * (1 - rho)) where sd=10.5, rho=0.10
    var sigmaMargin = Math.sqrt(2 * 10.5 * 10.5 * 0.9); // ~14.09

    function normalCDF(x) {
        if (x < -8) return 0;
        if (x > 8) return 1;
        var t = 1 / (1 + 0.2316419 * Math.abs(x));
        var d = 0.3989422804014327;
        var p = d * Math.exp(-x * x / 2) * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
        return x > 0 ? 1 - p : p;
    }

    // Load best run from localStorage
    var savedBest = null;
    try { savedBest = JSON.parse(localStorage.getItem('btsbestrun')); } catch (e) {}

    var gameState = {
        bankroll: 1000,
        wins: 0,
        losses: 0,
        pushes: 0,
        gamesPlayed: 0,
        totalWagered: 0,
        awayTeam: '',
        homeTeam: '',
        spread: 0,      // posted line (biased from fair value)
        trueSpread: 0,  // fair value from nfelo + EPA blend
        muHome: 22,
        muAway: 22,
        wager: 100,
        locked: false,
        bestRun: savedBest || { peak: 0, games: 0 }
    };

    // Bet history for PnL chart: [{actualPnl, expectedPnl}]
    var betHistory = [{ actualPnl: 0, expectedPnl: 0 }];

    function pickTwo() {
        var teamNames = Object.keys(teamData);
        var i1 = Math.floor(Math.random() * teamNames.length);
        var i2;
        do { i2 = Math.floor(Math.random() * teamNames.length); } while (i2 === i1);
        return [teamNames[i1], teamNames[i2]];
    }

    // Fair-value spread using nfelo + EPA (home perspective: positive = home favored)
    // Returns { spread (unbiased true spread), muHome, muAway }
    function calculateSpread(homeTeam, awayTeam) {
        var home = teamData[homeTeam];
        var away = teamData[awayTeam];
        if (!home || !away) return { spread: 0, muHome: 22, muAway: 22 };

        var basePts = 22.0;
        var plays = 62;
        var alpha = 0.35;
        var eloPerPoint = 26;
        var wElo = 0.60;
        var wEpa = 0.40;
        var hfa = 1.7;

        // EPA matchup points (home offense vs away defense, and vice versa)
        var epaMatchupHome = home.offEPA + away.defEPA;
        var epaMatchupAway = away.offEPA + home.defEPA;
        var muHomeEpa = basePts + alpha * plays * epaMatchupHome;
        var muAwayEpa = basePts + alpha * plays * epaMatchupAway;

        // Blended spread: 60% Elo + 40% EPA + home-field advantage
        var marginEpa = muHomeEpa - muAwayEpa;
        var marginElo = (home.nfelo - away.nfelo) / eloPerPoint;
        var spread = wEpa * marginEpa + wElo * marginElo + hfa;

        // Final team means (keep EPA total, inject blended spread)
        var total = muHomeEpa + muAwayEpa;
        var muHome = (total + spread) / 2;
        var muAway = (total - spread) / 2;

        return { spread: spread, muHome: muHome, muAway: muAway };
    }

    function formatSpread(val) {
        if (val === 0) return 'PK';
        var str = val % 1 === 0 ? Math.abs(val).toFixed(0) : Math.abs(val).toFixed(1);
        return (val > 0 ? '+' : '-') + str;
    }

    function boxMuller() {
        var u1, u2;
        do { u1 = Math.random(); } while (u1 === 0);
        u2 = Math.random();
        var z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        var z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        return [z0, z1];
    }

    function simulateScores(muHome, muAway) {
        var sd = 10.5;
        var rho = 0.10;
        var z = boxMuller();
        var scoreHome = muHome + sd * z[0];
        var scoreAway = muAway + sd * (rho * z[0] + Math.sqrt(1 - rho * rho) * z[1]);
        return {
            home: Math.max(0, Math.round(scoreHome)),
            away: Math.max(0, Math.round(scoreAway))
        };
    }

    function drawChart() {
        var canvas = document.getElementById('pnlChart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        var w = rect.width;
        var h = rect.height;

        var pad = { top: 16, right: 16, bottom: 24, left: 48 };
        var plotW = w - pad.left - pad.right;
        var plotH = h - pad.top - pad.bottom;

        ctx.clearRect(0, 0, w, h);

        var n = betHistory.length;
        if (n < 2) {
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Place a bet to start tracking P&L', w / 2, h / 2);
            return;
        }

        // Find y range
        var yMin = 0, yMax = 0;
        for (var i = 0; i < n; i++) {
            yMin = Math.min(yMin, betHistory[i].actualPnl, betHistory[i].expectedPnl);
            yMax = Math.max(yMax, betHistory[i].actualPnl, betHistory[i].expectedPnl);
        }
        var yPad = Math.max(50, (yMax - yMin) * 0.15);
        yMin -= yPad;
        yMax += yPad;

        function xScale(idx) { return pad.left + (idx / (n - 1)) * plotW; }
        function yScale(v) { return pad.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH; }

        // Gridlines
        var step = niceStep(yMax - yMin, 4);
        var gridStart = Math.ceil(yMin / step) * step;
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        for (var g = gridStart; g <= yMax; g += step) {
            var gy = yScale(g);
            ctx.beginPath();
            ctx.moveTo(pad.left, gy);
            ctx.lineTo(pad.left + plotW, gy);
            if (g === 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.lineWidth = 1;
            }
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('$' + g, pad.left - 6, gy + 3);
        }

        // Expected PnL line (yellow dashed)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        for (var i = 0; i < n; i++) {
            if (i === 0) ctx.moveTo(xScale(i), yScale(betHistory[i].expectedPnl));
            else ctx.lineTo(xScale(i), yScale(betHistory[i].expectedPnl));
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Actual PnL line (green solid)
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        for (var i = 0; i < n; i++) {
            if (i === 0) ctx.moveTo(xScale(i), yScale(betHistory[i].actualPnl));
            else ctx.lineTo(xScale(i), yScale(betHistory[i].actualPnl));
        }
        ctx.stroke();

        // Dots on latest point
        var last = n - 1;
        ctx.beginPath();
        ctx.arc(xScale(last), yScale(betHistory[last].actualPnl), 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xScale(last), yScale(betHistory[last].expectedPnl), 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.fill();

        // X axis label
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.font = '10px monospace';
        ctx.fillText('Bet #' + (n - 1), pad.left + plotW / 2, h - 4);
    }

    function niceStep(range, targetSteps) {
        var rough = range / targetSteps;
        var mag = Math.pow(10, Math.floor(Math.log10(rough)));
        var norm = rough / mag;
        if (norm < 1.5) return mag;
        if (norm < 3) return 2 * mag;
        if (norm < 7) return 5 * mag;
        return 10 * mag;
    }

    var bankrollEl = document.getElementById('gameBankroll');
    var recordEl = document.getElementById('gameRecord');
    var winRateEl = document.getElementById('gameWinRate');
    var roiEl = document.getElementById('gameROI');
    var bestRunEl = document.getElementById('gameBestRun');
    var matchupHeaderEl = document.getElementById('matchupHeader');
    var awayNameEl = document.getElementById('awayName');
    var homeNameEl = document.getElementById('homeName');
    var awaySpreadEl = document.getElementById('awaySpread');
    var homeSpreadEl = document.getElementById('homeSpread');
    var awayBtn = document.getElementById('awayTeam');
    var homeBtn = document.getElementById('homeTeam');
    var resultEl = document.getElementById('gameResult');
    var newBtn = document.getElementById('gameNewBtn');
    var wagerInput = document.getElementById('wagerInput');
    var wagerPresets = document.querySelectorAll('.wager-preset');

    function updateBestRunDisplay() {
        if (gameState.bestRun.peak > 0) {
            bestRunEl.textContent = '$' + gameState.bestRun.peak.toLocaleString() + ' (' + gameState.bestRun.games + ' bets)';
        } else {
            bestRunEl.textContent = '--';
        }
    }

    function saveBestRun() {
        if (gameState.bankroll > gameState.bestRun.peak) {
            gameState.bestRun.peak = gameState.bankroll;
            gameState.bestRun.games = gameState.gamesPlayed;
            try { localStorage.setItem('btsbestrun', JSON.stringify(gameState.bestRun)); } catch (e) {}
            updateBestRunDisplay();
        }
    }

    updateBestRunDisplay();

    function getWager() {
        var val = parseInt(wagerInput.value, 10);
        if (isNaN(val) || val < 1) return 1;
        return Math.min(val, gameState.bankroll);
    }

    function updateWagerPresets() {
        var current = parseInt(wagerInput.value, 10);
        wagerPresets.forEach(function (btn) {
            var amt = parseInt(btn.getAttribute('data-amount'), 10);
            if (amt === current) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function newMatchup() {
        gameState.locked = false;
        var teams = pickTwo();
        gameState.awayTeam = teams[0];
        gameState.homeTeam = teams[1];

        var result = calculateSpread(gameState.homeTeam, gameState.awayTeam);
        gameState.trueSpread = result.spread;  // unbiased fair value
        gameState.muHome = result.muHome;
        gameState.muAway = result.muAway;

        // Posted line: fair value + intentional bias up to ±4 pts (the misprice to find)
        var bias  = (Math.random() - 0.5) * 8;
        var noise = (Math.random() - 0.5) * 1;
        gameState.spread = Math.round((result.spread + bias + noise) * 2) / 2;

        matchupHeaderEl.textContent = gameState.awayTeam + ' @ ' + gameState.homeTeam;
        awayNameEl.textContent = gameState.awayTeam;
        homeNameEl.textContent = gameState.homeTeam;
        // spread > 0: home favored; spread < 0: away favored
        homeSpreadEl.textContent = formatSpread(-gameState.spread);
        awaySpreadEl.textContent = formatSpread(gameState.spread);

        awayBtn.className = 'game-team';
        homeBtn.className = 'game-team';
        awayBtn.disabled = false;
        homeBtn.disabled = false;
        resultEl.innerHTML = '';

        // Cap wager input to current bankroll
        if (parseInt(wagerInput.value, 10) > gameState.bankroll) {
            wagerInput.value = gameState.bankroll;
        }
        updateWagerPresets();
    }

    function placeBet(side) {
        if (gameState.locked) return;
        var wager = getWager();
        if (wager > gameState.bankroll || gameState.bankroll <= 0) return;
        gameState.wager = wager;
        gameState.locked = true;

        awayBtn.disabled = true;
        homeBtn.disabled = true;

        if (side === 'away') {
            awayBtn.classList.add('selected');
        } else {
            homeBtn.classList.add('selected');
        }

        setTimeout(function () {
            var scores = simulateScores(gameState.muHome, gameState.muAway);
            var margin = scores.home - scores.away;

            // ATS result: positive coverMargin = home covers
            var coverMargin = margin - gameState.spread;

            var userWon;
            var isPush = false;
            if (side === 'home') {
                if (coverMargin > 0) userWon = true;
                else if (coverMargin === 0) isPush = true;
                else userWon = false;
            } else {
                if (coverMargin < 0) userWon = true;
                else if (coverMargin === 0) isPush = true;
                else userWon = false;
            }

            // Update bankroll
            gameState.gamesPlayed++;
            gameState.totalWagered += gameState.wager;
            if (isPush) {
                gameState.pushes++;
            } else if (userWon) {
                gameState.bankroll += gameState.wager;
                gameState.wins++;
            } else {
                gameState.bankroll -= gameState.wager;
                gameState.losses++;
            }

            bankrollEl.textContent = '$' + gameState.bankroll.toLocaleString();
            bankrollEl.className = 'game-bankroll-value' + (gameState.bankroll < 1000 ? ' negative' : '');
            recordEl.textContent = gameState.wins + '-' + gameState.losses + (gameState.pushes > 0 ? '-' + gameState.pushes : '');
            saveBestRun();

            // Win rate + ROI
            var resolvedBets = gameState.wins + gameState.losses;
            if (resolvedBets > 0) {
                var winRate = gameState.wins / resolvedBets * 100;
                winRateEl.textContent = winRate.toFixed(1) + '%';
            }
            if (gameState.totalWagered > 0) {
                var roi = (gameState.bankroll - 1000) / gameState.totalWagered * 100;
                roiEl.textContent = (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%';
                roiEl.className = 'game-stat-value' + (roi > 0 ? ' positive' : roi < 0 ? ' negative' : '');
            }

            // Show who covered (ATS result)
            if (coverMargin > 0) {
                homeBtn.classList.add('winner');
                awayBtn.classList.add('loser');
            } else if (coverMargin < 0) {
                awayBtn.classList.add('winner');
                homeBtn.classList.add('loser');
            }

            // Track PnL for chart
            var trueSpreadForProb = gameState.muHome - gameState.muAway;
            var z = (gameState.spread - trueSpreadForProb) / sigmaMargin;
            var pHomeCover = 1 - normalCDF(z);
            var ev = (side === 'home')
                ? gameState.wager * (2 * pHomeCover - 1)
                : gameState.wager * (1 - 2 * pHomeCover);
            var prev = betHistory[betHistory.length - 1];
            var actualDelta = isPush ? 0 : (userWon ? gameState.wager : -gameState.wager);
            betHistory.push({
                actualPnl: prev.actualPnl + actualDelta,
                expectedPnl: prev.expectedPnl + ev
            });
            drawChart();

            var wagerStr = '$' + gameState.wager.toLocaleString();
            var outcomeClass = isPush ? 'push' : (userWon ? 'win' : 'loss');
            var outcomeText = isPush ? 'PUSH — ' + wagerStr + ' returned' : (userWon ? 'WIN +' + wagerStr : 'LOSS -' + wagerStr);

            // Fair value comparison: show what the line should have been
            var trueSpr   = gameState.trueSpread; // positive = home favored
            var postedSpr = gameState.spread;
            var edge      = trueSpr - postedSpr;  // positive = home undervalued
            var edgePts   = Math.abs(edge).toFixed(1);
            var edgeSide  = edge > 0 ? gameState.homeTeam : gameState.awayTeam;
            var fairRounded = Math.round(-trueSpr * 10) / 10; // 1 decimal precision
            var fairStr   = Math.abs(fairRounded) < 0.05 ? 'PK' : (fairRounded > 0 ? '+' : '-') + Math.abs(fairRounded).toFixed(1);
            var postedStr = formatSpread(-postedSpr); // already rounded to 0.5
            var fairValueHTML =
                '<span class="game-fair-value">' +
                'Fair Value: ' + gameState.homeTeam + ' ' + fairStr +
                ' &nbsp;·&nbsp; Posted: ' + postedStr +
                ' &nbsp;·&nbsp; <span class="fv-edge">' + edgePts + ' pt edge — ' + edgeSide + ' side</span>' +
                '</span>';

            // Flavor text based on user's edge
            var userEdge = (side === 'home') ? edge : -edge;
            var flavorText;
            if (userEdge >= 3) {
                flavorText = 'Sharp play \u2014 big misprice.';
            } else if (userEdge >= 1.5) {
                flavorText = 'Solid edge.';
            } else if (userEdge >= 0) {
                flavorText = 'Thin edge \u2014 coin flip territory.';
            } else {
                flavorText = 'You were on the wrong side of this one.';
            }
            var flavorHTML = '<span class="game-flavor">' + flavorText + '</span>';

            resultEl.innerHTML =
                '<span class="game-result-score">' + gameState.awayTeam + ' ' + scores.away + '  —  ' + scores.home + ' ' + gameState.homeTeam + '</span>' +
                '<span class="game-result-outcome ' + outcomeClass + '">' + outcomeText + '</span>' +
                fairValueHTML +
                flavorHTML;

            if (gameState.bankroll <= 0) {
                setTimeout(function () {
                    resultEl.innerHTML += '<span style="color: var(--text-muted); font-size: 0.8rem; margin-top: 8px;">Bankroll busted! Click "New Matchup" to reset.</span>';
                }, 500);
            }
        }, 600);
    }

    if (awayBtn && homeBtn && newBtn) {
        awayBtn.addEventListener('click', function () { placeBet('away'); });
        homeBtn.addEventListener('click', function () { placeBet('home'); });

        // Wager presets
        wagerPresets.forEach(function (btn) {
            btn.addEventListener('click', function () {
                wagerInput.value = btn.getAttribute('data-amount');
                updateWagerPresets();
            });
        });

        wagerInput.addEventListener('input', updateWagerPresets);

        newBtn.addEventListener('click', function () {
            if (gameState.bankroll <= 0) {
                gameState.bankroll = 1000;
                gameState.wins = 0;
                gameState.losses = 0;
                gameState.pushes = 0;
                gameState.gamesPlayed = 0;
                gameState.totalWagered = 0;
                bankrollEl.textContent = '$1,000';
                bankrollEl.className = 'game-bankroll-value';
                recordEl.textContent = '0-0';
                winRateEl.textContent = '--%';
                roiEl.textContent = '--%';
                roiEl.className = 'game-stat-value';
                wagerInput.value = 100;
                betHistory = [{ actualPnl: 0, expectedPnl: 0 }];
                drawChart();
            }
            newMatchup();
        });

        newMatchup();
        drawChart();
    }

})();
