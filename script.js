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

    // ---- Beat the Spread Game ----
    var nflTeams = [
        'Cardinals', 'Falcons', 'Ravens', 'Bills', 'Panthers', 'Bears',
        'Bengals', 'Browns', 'Cowboys', 'Broncos', 'Lions', 'Packers',
        'Texans', 'Colts', 'Jaguars', 'Chiefs', 'Raiders', 'Chargers',
        'Rams', 'Dolphins', 'Vikings', 'Patriots', 'Saints', 'Giants',
        'Jets', 'Eagles', 'Steelers', '49ers', 'Seahawks', 'Buccaneers',
        'Titans', 'Commanders'
    ];

    // 2025-26 NFL power ratings derived from final DVOA rankings (FTN Fantasy)
    // Values are points above/below league average on a neutral field.
    // Spread formula: home_rating - away_rating + home_field_advantage (2.5 pts)
    // Source: ftnfantasy.com/nfl/final-2025-dvoa-ratings
    var teamRatings = {
        'Seahawks':   7.75,  // DVOA #1  — historically elite (7th best DVOA ever)
        'Rams':       7.25,  // DVOA #2  — historically elite (8th best DVOA ever)
        'Lions':      6.75,  // DVOA #3
        'Texans':     6.25,  // DVOA #4
        'Colts':      5.75,  // DVOA #5
        'Jaguars':    5.25,  // DVOA #6
        'Broncos':    4.75,  // DVOA #7
        'Bills':      4.25,  // DVOA #8
        'Patriots':   3.75,  // DVOA #9
        '49ers':      3.25,  // DVOA #10
        'Packers':    2.75,  // DVOA #11
        'Steelers':   2.25,  // DVOA #12
        'Eagles':     1.75,  // DVOA #13
        'Ravens':     1.25,  // DVOA #14
        'Chiefs':     0.75,  // DVOA #15
        'Bears':      0.25,  // DVOA #16
        'Chargers':  -0.25,  // DVOA #17
        'Vikings':   -0.75,  // DVOA #18
        'Falcons':   -1.25,  // DVOA #19
        'Buccaneers':-1.75,  // DVOA #20
        'Bengals':   -2.25,  // DVOA #21
        'Cowboys':   -2.75,  // DVOA #22 — 4th-worst defense in DVOA history
        'Commanders':-3.25,  // DVOA #23
        'Dolphins':  -3.75,  // DVOA #24
        'Panthers':  -4.25,  // DVOA #25
        'Giants':    -4.75,  // DVOA #26
        'Cardinals': -5.25,  // DVOA #27
        'Saints':    -5.75,  // DVOA #28
        'Titans':    -6.25,  // DVOA #29
        'Raiders':   -6.75,  // DVOA #30 — historically bad run offense
        'Browns':    -7.25,  // DVOA #31
        'Jets':      -7.75   // DVOA #32 — 2nd-worst pass defense in DVOA history
    };

    var gameState = {
        bankroll: 1000,
        wins: 0,
        losses: 0,
        pushes: 0,
        awayTeam: '',
        homeTeam: '',
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

    function calculateSpread(homeTeam, awayTeam) {
        var homeRating = teamRatings[homeTeam] !== undefined ? teamRatings[homeTeam] : 0;
        var awayRating = teamRatings[awayTeam] !== undefined ? teamRatings[awayTeam] : 0;
        var homeFieldAdv = 2.5;
        var rawSpread = (homeRating - awayRating) + homeFieldAdv;
        // Round to nearest 0.5
        return Math.round(rawSpread * 2) / 2;
    }

    function formatSpread(val) {
        return val > 0 ? '+' + val.toFixed(1) : val.toFixed(1);
    }

    function simulateGame(spread) {
        // Home team is favored by -spread
        // Generate a margin relative to the spread with some noise
        // margin > 0 means home won by that many points
        var homeEdge = spread; // positive spread means home is favored
        var noise = 0;
        for (var i = 0; i < 6; i++) {
            noise += Math.random();
        }
        noise = (noise - 3) * 8; // normal-ish, std dev ~8 points
        var margin = homeEdge + noise;
        return Math.round(margin);
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
            var margin = simulateGame(gameState.spread);
            var scores = generateScores(margin);

            // Determine ATS result
            // If you picked home (spread is -X), home needs to win by more than spread
            // If you picked away (spread is +X), away needs to cover
            var coverMargin; // positive = home covers
            coverMargin = margin - gameState.spread; // margin relative to spread

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

            // Show winner/loser styling
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
                '<span class="game-result-score">' + gameState.awayTeam + ' ' + scores.away + ' — ' + scores.home + ' ' + gameState.homeTeam + '</span>' +
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
