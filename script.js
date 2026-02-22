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

    function generateSpread() {
        // Spreads from 1 to 14 in 0.5 increments
        var raw = Math.floor(Math.random() * 27) + 2; // 2-28
        return raw / 2; // 1.0 to 14.0
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
        gameState.spread = generateSpread();

        awayNameEl.textContent = gameState.awayTeam;
        homeNameEl.textContent = gameState.homeTeam;
        // Home team is favored (negative spread)
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
