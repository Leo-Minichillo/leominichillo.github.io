// ============================================
// Leo Minichillo — Site Interactions
// ============================================

(function () {
    'use strict';

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
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

    // ---- Result bar animation ----
    var resultBars = document.querySelectorAll('.result-bar-fill');
    var barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.style.getPropertyValue('--fill-width');
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    resultBars.forEach(function (bar) {
        var targetWidth = bar.style.getPropertyValue('--fill-width');
        bar.style.width = '0%';
        barObserver.observe(bar);
    });

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

    // ---- Beat the Spread Game (2025 DVOA Ratings) ----
    // Point ratings derived from final 2025 FTN DVOA rankings
    // These represent true team skill — the simulation uses these directly
    var nflTeams = [
        { name: 'Seahawks',    rating:  10.5 },
        { name: 'Rams',        rating:   9.5 },
        { name: 'Lions',       rating:   7.0 },
        { name: 'Texans',      rating:   5.5 },
        { name: 'Colts',       rating:   5.0 },
        { name: 'Jaguars',     rating:   4.5 },
        { name: 'Broncos',     rating:   4.0 },
        { name: 'Bills',       rating:   3.5 },
        { name: 'Patriots',    rating:   3.0 },
        { name: '49ers',       rating:   2.5 },
        { name: 'Packers',     rating:   2.0 },
        { name: 'Steelers',    rating:   1.5 },
        { name: 'Eagles',      rating:   1.0 },
        { name: 'Ravens',      rating:   0.5 },
        { name: 'Chiefs',      rating:   0.0 },
        { name: 'Bears',       rating:  -0.5 },
        { name: 'Chargers',    rating:  -1.0 },
        { name: 'Vikings',     rating:  -1.5 },
        { name: 'Falcons',     rating:  -2.0 },
        { name: 'Buccaneers',  rating:  -2.5 },
        { name: 'Bengals',     rating:  -3.0 },
        { name: 'Cowboys',     rating:  -3.5 },
        { name: 'Commanders',  rating:  -4.0 },
        { name: 'Dolphins',    rating:  -4.5 },
        { name: 'Panthers',    rating:  -5.0 },
        { name: 'Giants',      rating:  -5.5 },
        { name: 'Cardinals',   rating:  -6.0 },
        { name: 'Saints',      rating:  -6.5 },
        { name: 'Titans',      rating:  -7.0 },
        { name: 'Raiders',     rating:  -8.0 },
        { name: 'Browns',      rating:  -9.0 },
        { name: 'Jets',        rating: -10.0 }
    ];

    var HFA = 2.5; // home field advantage in points

    var gameState = {
        bankroll: 1000,
        wins: 0,
        losses: 0,
        pushes: 0,
        awayTeam: null,
        homeTeam: null,
        spread: 0,
        wager: 100,
        locked: false
    };

    var bankrollEl = document.getElementById('gameBankroll');
    var recordEl = document.getElementById('gameRecord');
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

    function pickTwo() {
        var shuffled = nflTeams.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return [shuffled[0], shuffled[1]];
    }

    function calculateSpread(home, away) {
        // True median spread from DVOA + home field advantage
        var trueSpread = home.rating - away.rating + HFA;
        // Bias: the posted line can be off by up to ±4 points
        // This creates mispriced lines the user should identify
        var bias = (Math.random() - 0.5) * 8;
        // Small additional market noise ±0.5
        var noise = (Math.random() - 0.5) * 1;
        return Math.round((trueSpread + bias + noise) * 2) / 2; // nearest 0.5
    }

    function formatSpread(val) {
        if (val === 0) return 'PK';
        var str = val % 1 === 0 ? Math.abs(val).toFixed(0) : Math.abs(val).toFixed(1);
        return (val > 0 ? '+' : '-') + str;
    }

    function simulateGame(home, away) {
        // True expected margin based on DVOA skill + home field
        var expectedMargin = home.rating - away.rating + HFA;
        // Box-Muller for proper normal distribution (~13 pt std dev)
        var u1 = Math.random();
        var u2 = Math.random();
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        var noise = z * 13.5;
        return Math.round(expectedMargin + noise);
    }

    function generateScores(margin) {
        // Generate realistic NFL scores
        var base = Math.floor(Math.random() * 14) + 14;
        var winner = base + Math.abs(margin);
        if (margin >= 0) {
            return { home: winner, away: base };
        } else {
            return { home: base, away: winner };
        }
    }

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
        gameState.spread = calculateSpread(gameState.homeTeam, gameState.awayTeam);

        // Away @ Home header
        matchupHeaderEl.textContent = gameState.awayTeam.name + ' @ ' + gameState.homeTeam.name;
        awayNameEl.textContent = gameState.awayTeam.name;
        homeNameEl.textContent = gameState.homeTeam.name;
        // Spread display: negative = favored
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
            var margin = simulateGame(gameState.homeTeam, gameState.awayTeam);
            var scores = generateScores(margin);

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

            // Color code by who covered
            if (coverMargin > 0) {
                homeBtn.classList.add('winner');
                awayBtn.classList.add('loser');
            } else if (coverMargin < 0) {
                awayBtn.classList.add('winner');
                homeBtn.classList.add('loser');
            }

            var wagerStr = '$' + gameState.wager.toLocaleString();
            var outcomeClass = isPush ? 'push' : (userWon ? 'win' : 'loss');
            var outcomeText = isPush ? 'PUSH — ' + wagerStr + ' returned' : (userWon ? 'WIN +' + wagerStr : 'LOSS -' + wagerStr);
            resultEl.innerHTML =
                '<span class="game-result-score">' + gameState.awayTeam.name + ' ' + scores.away + '  —  ' + scores.home + ' ' + gameState.homeTeam.name + '</span>' +
                '<span class="game-result-outcome ' + outcomeClass + '">' + outcomeText + '</span>';

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
                bankrollEl.textContent = '$1,000';
                bankrollEl.className = 'game-bankroll-value';
                recordEl.textContent = '0-0';
                wagerInput.value = 100;
            }
            newMatchup();
        });

        newMatchup();
    }

})();
