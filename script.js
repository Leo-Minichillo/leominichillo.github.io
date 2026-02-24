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

    var gameState = {
        bankroll: 1000,
        wins: 0,
        losses: 0,
        pushes: 0,
        awayTeam: '',
        homeTeam: '',
        spread: 0,
        muHome: 22,
        muAway: 22,
        locked: false
    };

    // Bet history for PnL chart: [{actualPnl, expectedPnl}]
    var betHistory = [{ actualPnl: 0, expectedPnl: 0 }];

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
        var home = teamData[homeTeam];
        var away = teamData[awayTeam];
        if (!home || !away) return { spread: 0, muHome: 22, muAway: 22 };

        // Model constants
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

        // Round spread to nearest 0.5
        spread = Math.round(spread * 2) / 2;

        return { spread: spread, muHome: muHome, muAway: muAway };
    }

    function formatSpread(val) {
        return val > 0 ? '+' + val.toFixed(1) : val.toFixed(1);
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

    function newMatchup() {
        gameState.locked = false;
        var teams = pickTwo();
        gameState.awayTeam = teams[0];
        gameState.homeTeam = teams[1];
        var result = calculateSpread(gameState.homeTeam, gameState.awayTeam);
        gameState.spread = result.spread;
        gameState.muHome = result.muHome;
        gameState.muAway = result.muAway;

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
            var scores = simulateScores(gameState.muHome, gameState.muAway);
            var margin = scores.home - scores.away;

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

            // Track PnL for chart
            var trueSpread = gameState.muHome - gameState.muAway;
            var z = (gameState.spread - trueSpread) / sigmaMargin;
            var pHomeCover = 1 - normalCDF(z);
            var ev = (side === 'home')
                ? 100 * (2 * pHomeCover - 1)
                : -100 * (2 * pHomeCover - 1);
            var prev = betHistory[betHistory.length - 1];
            var actualDelta = isPush ? 0 : (userWon ? 100 : -100);
            betHistory.push({
                actualPnl: prev.actualPnl + actualDelta,
                expectedPnl: prev.expectedPnl + ev
            });
            drawChart();

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
                betHistory = [{ actualPnl: 0, expectedPnl: 0 }];
                drawChart();
            }
            newMatchup();
        });

        // Initialize first matchup
        newMatchup();
        drawChart();
    }

})();
