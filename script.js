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
    // Positive = above average, negative = below average
    var nflTeams = [
        { name: 'Seahawks',    rating:  10.5 },  // DVOA #1
        { name: 'Rams',        rating:   9.5 },  // DVOA #2
        { name: 'Lions',       rating:   7.0 },  // DVOA #3
        { name: 'Texans',      rating:   5.5 },  // DVOA #4
        { name: 'Colts',       rating:   5.0 },  // DVOA #5
        { name: 'Jaguars',     rating:   4.5 },  // DVOA #6
        { name: 'Broncos',     rating:   4.0 },  // DVOA #7
        { name: 'Bills',       rating:   3.5 },  // DVOA #8
        { name: 'Patriots',    rating:   3.0 },  // DVOA #9
        { name: '49ers',       rating:   2.5 },  // DVOA #10
        { name: 'Packers',     rating:   2.0 },  // DVOA #11
        { name: 'Steelers',    rating:   1.5 },  // DVOA #12
        { name: 'Eagles',      rating:   1.0 },  // DVOA #13
        { name: 'Ravens',      rating:   0.5 },  // DVOA #14
        { name: 'Chiefs',      rating:   0.0 },  // DVOA #15
        { name: 'Bears',       rating:  -0.5 },  // DVOA #16
        { name: 'Chargers',    rating:  -1.0 },  // DVOA #17
        { name: 'Vikings',     rating:  -1.5 },  // DVOA #18
        { name: 'Falcons',     rating:  -2.0 },  // DVOA #19
        { name: 'Buccaneers',  rating:  -2.5 },  // DVOA #20
        { name: 'Bengals',     rating:  -3.0 },  // DVOA #21
        { name: 'Cowboys',     rating:  -3.5 },  // DVOA #22
        { name: 'Commanders',  rating:  -4.0 },  // DVOA #23
        { name: 'Dolphins',    rating:  -4.5 },  // DVOA #24
        { name: 'Panthers',    rating:  -5.0 },  // DVOA #25
        { name: 'Giants',      rating:  -5.5 },  // DVOA #26
        { name: 'Cardinals',   rating:  -6.0 },  // DVOA #27
        { name: 'Saints',      rating:  -6.5 },  // DVOA #28
        { name: 'Titans',      rating:  -7.0 },  // DVOA #29
        { name: 'Raiders',     rating:  -8.0 },  // DVOA #30
        { name: 'Browns',      rating:  -9.0 },  // DVOA #31
        { name: 'Jets',        rating: -10.0 }   // DVOA #32
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
        locked: false
    };

    var bankrollEl = document.getElementById('gameBankroll');
    var recordEl = document.getElementById('gameRecord');
    var awayNameEl = document.getElementById('awayName');
    var homeNameEl = document.getElementById('homeName');
    var awaySpreadEl = document.getElementById('awaySpread');
    var homeSpreadEl = document.getElementById('homeSpread');
    var awayBtn = document.getElementById('awayTeam');
    var homeBtn = document.getElementById('homeTeam');
    var resultEl = document.getElementById('gameResult');
    var newBtn = document.getElementById('gameNewBtn');

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
        // Spread from home perspective: positive = home favored
        var rawSpread = home.rating - away.rating + HFA;
        // Add slight market noise (±1.5 pts)
        var noise = (Math.random() - 0.5) * 3;
        return Math.round((rawSpread + noise) * 2) / 2; // nearest 0.5
    }

    function formatSpread(val) {
        if (val === 0) return 'PK';
        var str = val % 1 === 0 ? Math.abs(val).toFixed(0) : Math.abs(val).toFixed(1);
        return (val > 0 ? '+' : '-') + str;
    }

    function simulateGame(home, away) {
        // Expected margin based on true team skill + home field
        var expectedMargin = home.rating - away.rating + HFA;
        // Normal-ish noise (~13 pt std dev, realistic NFL variance)
        var noise = 0;
        for (var i = 0; i < 12; i++) {
            noise += Math.random();
        }
        noise = (noise - 6) * 5.3; // ~13 pt std dev
        return Math.round(expectedMargin + noise);
    }

    function generateScores(margin) {
        // Generate realistic-ish NFL scores
        var base = Math.floor(Math.random() * 14) + 14; // loser scores 14-27
        var winner = base + Math.abs(margin);
        if (margin >= 0) {
            return { home: winner, away: base };
        } else {
            return { home: base, away: winner };
        }
    }

    function newMatchup() {
        gameState.locked = false;
        var teams = pickTwo();
        gameState.awayTeam = teams[0];
        gameState.homeTeam = teams[1];
        gameState.spread = calculateSpread(gameState.homeTeam, gameState.awayTeam);

        awayNameEl.textContent = gameState.awayTeam.name;
        homeNameEl.textContent = gameState.homeTeam.name;
        // Spread display: home gets inverse, away gets spread value
        homeSpreadEl.textContent = formatSpread(-gameState.spread);
        awaySpreadEl.textContent = formatSpread(gameState.spread);

        awayBtn.className = 'game-team';
        homeBtn.className = 'game-team';
        awayBtn.disabled = false;
        homeBtn.disabled = false;
        resultEl.innerHTML = '';
    }

    function placeBet(side) {
        if (gameState.locked) return;
        if (gameState.bankroll < 100) return;
        gameState.locked = true;

        awayBtn.disabled = true;
        homeBtn.disabled = true;

        if (side === 'away') {
            awayBtn.classList.add('selected');
        } else {
            homeBtn.classList.add('selected');
        }

        // Simulate after a short delay for suspense
        setTimeout(function () {
            var margin = simulateGame(gameState.homeTeam, gameState.awayTeam);
            var scores = generateScores(margin);

            // Determine ATS result
            var coverMargin = margin - gameState.spread; // positive = home covers

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
                gameState.bankroll += 100;
                gameState.wins++;
            } else {
                gameState.bankroll -= 100;
                gameState.losses++;
            }

            // Update display
            bankrollEl.textContent = '$' + gameState.bankroll.toLocaleString();
            bankrollEl.className = 'game-bankroll-value' + (gameState.bankroll < 1000 ? ' negative' : '');
            recordEl.textContent = gameState.wins + '-' + gameState.losses + (gameState.pushes > 0 ? '-' + gameState.pushes : '');

            // Show winner/loser styling (based on who won the game)
            if (margin > 0) {
                homeBtn.classList.add('winner');
                awayBtn.classList.add('loser');
            } else if (margin < 0) {
                awayBtn.classList.add('winner');
                homeBtn.classList.add('loser');
            }

            // Show result
            var outcomeClass = isPush ? 'push' : (userWon ? 'win' : 'loss');
            var outcomeText = isPush ? 'PUSH — $100 returned' : (userWon ? 'WIN +$100' : 'LOSS -$100');
            resultEl.innerHTML =
                '<span class="game-result-score">' + gameState.awayTeam.name + ' ' + scores.away + ' — ' + scores.home + ' ' + gameState.homeTeam.name + '</span>' +
                '<span class="game-result-outcome ' + outcomeClass + '">' + outcomeText + '</span>';

            // If bankroll is 0
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

        newBtn.addEventListener('click', function () {
            if (gameState.bankroll <= 0) {
                gameState.bankroll = 1000;
                gameState.wins = 0;
                gameState.losses = 0;
                gameState.pushes = 0;
                bankrollEl.textContent = '$1,000';
                bankrollEl.className = 'game-bankroll-value';
                recordEl.textContent = '0-0';
            }
            newMatchup();
        });

        // Initialize first matchup
        newMatchup();
    }

})();
