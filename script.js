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
    // nfelo ratings from nfeloapp.com; DVOA from Football Outsiders (2024-25 season)
    // nfelo: Elo-style rating (avg ~1500); spread ≈ (homeNfelo − awayNfelo + 65) / 25
    // offDVOA/defDVOA: % above avg — negative defDVOA = better defense
    var nflTeams = [
        { name: 'Eagles',     nfelo: 1582, offDVOA:  20.8, defDVOA:  -7.2, totalDVOA:  25.4 },
        { name: 'Chiefs',     nfelo: 1577, offDVOA:  17.2, defDVOA:  -6.1, totalDVOA:  22.1 },
        { name: 'Lions',      nfelo: 1571, offDVOA:  22.4, defDVOA:  -2.1, totalDVOA:  23.8 },
        { name: 'Bills',      nfelo: 1562, offDVOA:  15.8, defDVOA:  -7.4, totalDVOA:  21.2 },
        { name: 'Ravens',     nfelo: 1558, offDVOA:  14.2, defDVOA:  -6.8, totalDVOA:  19.6 },
        { name: 'Commanders', nfelo: 1531, offDVOA:  12.4, defDVOA:  -4.8, totalDVOA:  15.2 },
        { name: 'Rams',       nfelo: 1527, offDVOA:  11.2, defDVOA:  -3.2, totalDVOA:  10.8 },
        { name: 'Texans',     nfelo: 1521, offDVOA:   9.8, defDVOA:  -2.4, totalDVOA:   9.5 },
        { name: 'Packers',    nfelo: 1516, offDVOA:   8.6, defDVOA:  -4.8, totalDVOA:  12.1 },
        { name: 'Vikings',    nfelo: 1512, offDVOA:  10.2, defDVOA:   1.4, totalDVOA:   8.3 },
        { name: 'Seahawks',   nfelo: 1507, offDVOA:   7.4, defDVOA:  -1.2, totalDVOA:   7.1 },
        { name: 'Falcons',    nfelo: 1503, offDVOA:   6.8, defDVOA:   1.2, totalDVOA:   5.4 },
        { name: '49ers',      nfelo: 1499, offDVOA:   8.2, defDVOA:   2.8, totalDVOA:   4.2 },
        { name: 'Steelers',   nfelo: 1494, offDVOA:   2.4, defDVOA:  -3.6, totalDVOA:   3.8 },
        { name: 'Broncos',    nfelo: 1488, offDVOA:   1.8, defDVOA:   0.4, totalDVOA:   2.1 },
        { name: 'Buccaneers', nfelo: 1483, offDVOA:   3.2, defDVOA:   2.4, totalDVOA:   1.5 },
        { name: 'Cowboys',    nfelo: 1476, offDVOA:  -1.4, defDVOA:   1.2, totalDVOA:  -1.2 },
        { name: 'Chargers',   nfelo: 1472, offDVOA:   0.8, defDVOA:   4.2, totalDVOA:  -2.8 },
        { name: 'Bears',      nfelo: 1466, offDVOA:  -2.8, defDVOA:   2.4, totalDVOA:  -3.4 },
        { name: 'Colts',      nfelo: 1461, offDVOA:  -3.2, defDVOA:   2.6, totalDVOA:  -4.1 },
        { name: 'Dolphins',   nfelo: 1456, offDVOA:  -3.8, defDVOA:   3.2, totalDVOA:  -5.6 },
        { name: 'Bengals',    nfelo: 1451, offDVOA:  -4.2, defDVOA:   4.4, totalDVOA:  -6.3 },
        { name: 'Jaguars',    nfelo: 1445, offDVOA:  -5.8, defDVOA:   4.2, totalDVOA:  -7.8 },
        { name: 'Saints',     nfelo: 1440, offDVOA:  -6.4, defDVOA:   4.8, totalDVOA:  -9.2 },
        { name: 'Titans',     nfelo: 1435, offDVOA:  -7.2, defDVOA:   5.4, totalDVOA: -10.4 },
        { name: 'Raiders',    nfelo: 1430, offDVOA:  -8.6, defDVOA:   6.2, totalDVOA: -12.1 },
        { name: 'Browns',     nfelo: 1424, offDVOA: -10.4, defDVOA:   7.2, totalDVOA: -14.5 },
        { name: 'Cardinals',  nfelo: 1418, offDVOA: -11.2, defDVOA:   7.8, totalDVOA: -15.8 },
        { name: 'Panthers',   nfelo: 1413, offDVOA: -12.4, defDVOA:   8.6, totalDVOA: -17.2 },
        { name: 'Patriots',   nfelo: 1408, offDVOA: -13.8, defDVOA:   8.4, totalDVOA: -18.6 },
        { name: 'Giants',     nfelo: 1403, offDVOA: -14.6, defDVOA:   9.2, totalDVOA: -20.1 },
        { name: 'Jets',       nfelo: 1397, offDVOA: -15.8, defDVOA:  10.2, totalDVOA: -21.4 }
    ];

    // Historical NFL team score distribution (score → relative frequency weight)
    // Scores cluster at multiples of 3 and 7 — the key numbers in football betting
    var NFL_SCORES = [
        {s:  0, w:  2}, {s:  2, w:  1}, {s:  3, w:  5}, {s:  6, w:  5},
        {s:  7, w:  9}, {s:  9, w:  3}, {s: 10, w: 12}, {s: 13, w: 10},
        {s: 14, w: 12}, {s: 16, w:  6}, {s: 17, w: 20}, {s: 20, w: 16},
        {s: 21, w: 14}, {s: 23, w:  8}, {s: 24, w: 16}, {s: 27, w: 13},
        {s: 28, w: 13}, {s: 30, w:  7}, {s: 31, w:  8}, {s: 34, w: 10},
        {s: 35, w:  8}, {s: 37, w:  5}, {s: 38, w:  6}, {s: 41, w:  4},
        {s: 42, w:  4}, {s: 44, w:  2}, {s: 45, w:  2}, {s: 48, w:  1},
        {s: 49, w:  1}
    ];
    // Build lookup: score → weight (for O(1) membership check)
    var NFL_SCORE_SET = {};
    NFL_SCORES.forEach(function(item) { NFL_SCORE_SET[item.s] = item.w; });

    var HFA_ELO = 65; // nfelo home field advantage in Elo points (~2.6 pts on spread)

    // Load best run from localStorage
    var savedBest = null;
    try { savedBest = JSON.parse(localStorage.getItem('btsbestrun')); } catch (e) {}

    var gameState = {
        bankroll: 1000,
        wins: 0,
        losses: 0,
        pushes: 0,
        gamesPlayed: 0,
        peakBankroll: 1000,
        awayTeam: null,
        homeTeam: null,
        spread: 0,      // posted line (biased from fair value)
        trueSpread: 0,  // fair value from nfelo + DVOA
        wager: 100,
        locked: false,
        bestRun: savedBest || { peak: 0, games: 0 }
    };

    var bankrollEl = document.getElementById('gameBankroll');
    var recordEl = document.getElementById('gameRecord');
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

    // Fair value spread using nfelo + DVOA (home perspective: positive = home favored)
    function getTrueSpread(home, away) {
        // Primary: nfelo Elo differential → point spread
        var nfeloSpread = (home.nfelo - away.nfelo + HFA_ELO) / 25;
        // Secondary: DVOA matchup refinement — how each offense exploits the opponent's defense
        var homeEdge = (home.offDVOA - away.defDVOA) * 0.04;
        var awayEdge = (away.offDVOA - home.defDVOA) * 0.04;
        var dvoaAdj  = (homeEdge - awayEdge) * 0.25;
        return nfeloSpread + dvoaAdj;
    }

    // Posted line: fair value + intentional bias up to ±4 pts (the misprice to find)
    function calculateSpread(home, away) {
        var trueSpread = getTrueSpread(home, away);
        var bias  = (Math.random() - 0.5) * 8;
        var noise = (Math.random() - 0.5) * 1;
        return Math.round((trueSpread + bias + noise) * 2) / 2; // nearest 0.5
    }

    function formatSpread(val) {
        if (val === 0) return 'PK';
        var str = val % 1 === 0 ? Math.abs(val).toFixed(0) : Math.abs(val).toFixed(1);
        return (val > 0 ? '+' : '-') + str;
    }

    // Expected combined total based on DVOA (offense boosts scoring, defense limits it)
    function getExpectedTotal(home, away) {
        var adj = (home.offDVOA + away.offDVOA - home.defDVOA - away.defDVOA) * 0.08;
        return 45.5 + adj;
    }

    function simulateGame(home, away) {
        var trueMargin = getTrueSpread(home, away);
        var u1 = Math.random();
        var u2 = Math.random();
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return Math.round(trueMargin + z * 13.5);
    }

    // Generate realistic NFL scores that land on key numbers (3s and 7s)
    // by only picking from historically valid team score totals
    function generateScores(margin, home, away) {
        var absMargin = Math.abs(margin);
        var expectedTotal = getExpectedTotal(home, away);

        // Find all valid NFL score pairs where winner − loser = absMargin
        var validPairs = [];
        NFL_SCORES.forEach(function(loserItem) {
            var winnerScore = loserItem.s + absMargin;
            if (NFL_SCORE_SET[winnerScore] !== undefined) {
                validPairs.push({
                    loser:  loserItem.s,
                    winner: winnerScore,
                    total:  loserItem.s + winnerScore
                });
            }
        });

        var loser, winner;
        if (validPairs.length === 0) {
            // Fallback for extreme margins: snap loser to nearest valid score
            var rawLoser = Math.max(0, Math.round((expectedTotal - absMargin) / 2));
            var nearestLoser = NFL_SCORES.reduce(function(best, item) {
                return Math.abs(item.s - rawLoser) < Math.abs(best.s - rawLoser) ? item : best;
            }).s;
            loser  = nearestLoser;
            winner = loser + absMargin;
        } else {
            // Weight each pair by: historical frequency of both scores × proximity to expected total
            var totalWeight = 0;
            var weights = validPairs.map(function(pair) {
                var freqW = (NFL_SCORE_SET[pair.loser] || 1) * (NFL_SCORE_SET[pair.winner] || 1);
                var distW = Math.exp(-Math.pow(pair.total - expectedTotal, 2) / 150);
                var w = freqW * distW;
                totalWeight += w;
                return w;
            });
            var rand = Math.random() * totalWeight;
            var cumW = 0;
            var chosen = validPairs[0];
            for (var i = 0; i < validPairs.length; i++) {
                cumW += weights[i];
                if (rand <= cumW) { chosen = validPairs[i]; break; }
            }
            loser  = chosen.loser;
            winner = chosen.winner;
        }

        return margin >= 0
            ? { home: winner, away: loser }
            : { home: loser,  away: winner };
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
        gameState.awayTeam  = teams[0];
        gameState.homeTeam  = teams[1];
        gameState.trueSpread = getTrueSpread(gameState.homeTeam, gameState.awayTeam);
        gameState.spread     = calculateSpread(gameState.homeTeam, gameState.awayTeam);

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
            var scores = generateScores(margin, gameState.homeTeam, gameState.awayTeam);

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

            // Fair value comparison: show what the line should have been
            var trueSpr   = gameState.trueSpread; // positive = home favored
            var postedSpr = gameState.spread;
            var edge      = trueSpr - postedSpr;  // positive = home undervalued
            var edgePts   = Math.abs(edge).toFixed(1);
            var edgeSide  = edge > 0 ? gameState.homeTeam.name : gameState.awayTeam.name;
            var fairStr   = formatSpread(Math.round(-trueSpr   * 2) / 2); // home team's fair spread
            var postedStr = formatSpread(Math.round(-postedSpr * 2) / 2); // home team's posted spread
            var fairValueHTML =
                '<span class="game-fair-value">' +
                'Fair Value: ' + gameState.homeTeam.name + ' ' + fairStr +
                ' &nbsp;·&nbsp; Posted: ' + postedStr +
                ' &nbsp;·&nbsp; <span class="fv-edge">' + edgePts + ' pt edge — ' + edgeSide + ' side</span>' +
                '</span>';

            resultEl.innerHTML =
                '<span class="game-result-score">' + gameState.awayTeam.name + ' ' + scores.away + '  —  ' + scores.home + ' ' + gameState.homeTeam.name + '</span>' +
                '<span class="game-result-outcome ' + outcomeClass + '">' + outcomeText + '</span>' +
                fairValueHTML;

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
