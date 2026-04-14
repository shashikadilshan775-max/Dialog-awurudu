// ==================== CONFIGURATION ====================
const AD_LINKS = [
    'https://omg10.com/4/10873619',
    'https://omg10.com/4/10873618',
    'https://omg10.com/4/10873478',
    'https://omg10.com/4/10873629',
    'https://omg10.com/4/10873622',
    'https://omg10.com/4/10873623',
    'https://omg10.com/4/10873617',
    'https://omg10.com/4/10873626',
    'https://omg10.com/4/10873621',
    'https://omg10.com/4/10873480',
    'https://omg10.com/4/10873617',
    'https://omg10.com/4/10873626',
    'https://omg10.com/4/10873621',
    'https://omg10.com/4/10873479',
    'https://omg10.com/4/10873616',
    'https://omg10.com/4/10873620'
];

let adIndex = 0;

function getNextAdLink() {
    const link = AD_LINKS[adIndex % AD_LINKS.length];
    adIndex++;
    return link;
}

function openAdInNewTab() {
    window.open(getNextAdLink(), '_blank');
}

// ==================== STATE MANAGEMENT ====================
const STATE_KEY = 'nyDataRewards';

function getState() {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : getDefaultState();
    } catch {
        return getDefaultState();
    }
}

function getDefaultState() {
    return {
        phone: '',
        network: '',
        wonData: 0,
        shareCount: 0,
        scratchedCards: [],
        firstScratch: true,
        comments: [],
        referrals: [],
        gamesPlayed: {},
        userId: generateUserId()
    };
}

function saveState(state) {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
        // Storage full or unavailable
    }
}

function generateUserId() {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

let state = getState();

// ==================== PARTICLES ====================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['#FFD700', '#FF8C00', '#C41E3A', '#FF6B35', '#FFA500'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (5 + Math.random() * 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.width = (3 + Math.random() * 6) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ==================== TAB NAVIGATION ====================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabIndex = parseInt(btn.dataset.tab);
            switchTab(tabIndex);
        });
    });

    // Game navigation buttons
    document.querySelectorAll('.game-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabIndex = parseInt(btn.dataset.tab);
            switchTab(tabIndex);
        });
    });
}

function switchTab(index) {
    // If tab 8 (comments) is clicked, redirect to tab 2 and scroll to comments
    if (index === 8) {
        switchTab(2);
        setTimeout(() => {
            const commentsSection = document.querySelector('.comments-section-inline');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        return;
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    const targetBtn = document.querySelector(`.tab-btn[data-tab="${index}"]`);
    const targetContent = document.getElementById(`tab${index}`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    // Scroll tab button into view
    if (targetBtn) {
        targetBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // Scroll to top of page when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== TAB 0: START ====================
function initStartPage() {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        openAdInNewTab();
        setTimeout(() => {
            if (state.phone) {
                switchTab(2);
            } else {
                switchTab(1);
            }
        }, 1500);
    });
}

// ==================== TAB 1: PHONE ENTRY ====================
function initPhonePage() {
    const phoneSubmitBtn = document.getElementById('phoneSubmitBtn');
    const phoneInput = document.getElementById('phoneInput');
    const networkSelect = document.getElementById('networkSelect');

    if (!phoneSubmitBtn) return;

    phoneSubmitBtn.addEventListener('click', () => {
        const phone = phoneInput.value.trim();
        const network = networkSelect.value;

        if (!phone || phone.length < 9) {
            showPopup('⚠️', 'දෝෂයකි!', 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.');
            return;
        }
        if (!network) {
            showPopup('⚠️', 'දෝෂයකි!', 'කරුණාකර ඔබේ ජාලය තෝරන්න.');
            return;
        }

        state.phone = phone;
        state.network = network;
        saveState(state);

        // Track referral
        trackReferral();

        switchTab(2);
    });

    // Auto-format phone number
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Restore saved values
    if (state.phone && phoneInput) {
        phoneInput.value = state.phone;
    }
    if (state.network && networkSelect) {
        networkSelect.value = state.network;
    }
}

// ==================== TAB 2: SCRATCH CARDS ====================
function initScratchCards() {
    const overlays = document.querySelectorAll('.scratch-overlay');
    const prizes = [100, 50, 200, 150];

    // Shuffle prizes
    for (let i = prizes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
    }

    // Set prize values
    const prizeElements = document.querySelectorAll('.prize-value');
    prizeElements.forEach((el, i) => {
        el.textContent = prizes[i] + ' MB';
    });

    // Restore scratched cards
    state.scratchedCards.forEach(index => {
        const overlay = document.querySelector(`.scratch-overlay[data-index="${index}"]`);
        if (overlay) overlay.classList.add('scratched');
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            const index = parseInt(overlay.dataset.index);
            if (state.scratchedCards.includes(index)) return;

            // Only allow first scratch
            if (state.scratchedCards.length > 0) {
                showPopup('ℹ️', 'දැනටමත් සූරා ඇත!', 'ඔබට එක් කාඩ්පතක් පමණක් සූරන්න පුළුවන්. Share කර අමතර data ලබාගන්න!');
                return;
            }

            overlay.classList.add('scratched');
            state.scratchedCards.push(index);

            const prize = prizes[index];
            state.wonData += prize;
            saveState(state);

            // Open ad
            openAdInNewTab();

            // Show win
            setTimeout(() => {
                updateStats();
                showWinMessage(prize);
                showPopup('🎉', 'සුභ පැතුම්!', `ඔබ ${prize} MB දිනුවා! අමතර 500 MB ලබාගන්න share කරන්න!`);
            }, 1000);
        });
    });

    updateStats();
    if (state.scratchedCards.length > 0) {
        showWinMessage(state.wonData);
    }
}

function showWinMessage(prize) {
    const winMessage = document.getElementById('winMessage');
    const winAmount = document.getElementById('winAmount');
    if (!winMessage) return;

    winMessage.classList.remove('hidden');
    if (winAmount) winAmount.textContent = prize + ' MB';

    // Set share link
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        const baseUrl = window.location.href.split('?')[0];
        shareLink.value = baseUrl + '?ref=' + state.userId;
    }
}

function updateStats() {
    const wonDataEl = document.getElementById('wonData');
    const shareCountEl = document.getElementById('shareCount');
    if (wonDataEl) wonDataEl.textContent = state.wonData + ' MB';
    if (shareCountEl) shareCountEl.textContent = state.shareCount + '/15';
}

function initShareButtons() {
    const shareLink = document.getElementById('shareLink');
    const baseUrl = window.location.href.split('?')[0];
    const refUrl = baseUrl + '?ref=' + state.userId;

    if (shareLink) shareLink.value = refUrl;

    const shareText = '🎉 සිංහල හින්දු අළුත් අවුරුදු Data Rewards! ක්‍රීඩා කර MB 500+ දිනන්න! 🎁';

    // Copy Link
    const copyBtn = document.getElementById('copyLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(refUrl).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
                state.shareCount++;
                saveState(state);
                updateStats();
                openAdInNewTab();
            }).catch(() => {
                // Fallback
                if (shareLink) {
                    shareLink.select();
                    document.execCommand('copy');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                }
                state.shareCount++;
                saveState(state);
                updateStats();
                openAdInNewTab();
            });
        });
    }

    // WhatsApp
    const whatsappBtn = document.getElementById('shareWhatsApp');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + refUrl)}`, '_blank');
            state.shareCount++;
            saveState(state);
            updateStats();
        });
    }

    // Facebook
    const fbBtn = document.getElementById('shareFacebook');
    if (fbBtn) {
        fbBtn.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refUrl)}`, '_blank');
            state.shareCount++;
            saveState(state);
            updateStats();
        });
    }

    // Telegram
    const tgBtn = document.getElementById('shareTelegram');
    if (tgBtn) {
        tgBtn.addEventListener('click', () => {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
            state.shareCount++;
            saveState(state);
            updateStats();
        });
    }

    // Twitter
    const twBtn = document.getElementById('shareTwitter');
    if (twBtn) {
        twBtn.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(refUrl)}`, '_blank');
            state.shareCount++;
            saveState(state);
            updateStats();
        });
    }
}

// ==================== TAB 3: DICE GAME ====================
function initDiceGame() {
    const rollBtn = document.getElementById('rollDiceBtn');
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const result = document.getElementById('diceResult');

    if (!rollBtn) return;

    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    rollBtn.addEventListener('click', () => {
        rollBtn.disabled = true;
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        // Open ad
        openAdInNewTab();

        let rolls = 0;
        const rollInterval = setInterval(() => {
            dice1.textContent = diceFaces[Math.floor(Math.random() * 6)];
            dice2.textContent = diceFaces[Math.floor(Math.random() * 6)];
            rolls++;
            if (rolls > 10) {
                clearInterval(rollInterval);
                const val1 = Math.floor(Math.random() * 6) + 1;
                const val2 = Math.floor(Math.random() * 6) + 1;
                dice1.textContent = diceFaces[val1 - 1];
                dice2.textContent = diceFaces[val2 - 1];
                dice1.classList.remove('rolling');
                dice2.classList.remove('rolling');

                const total = val1 + val2;
                if (total >= 7) {
                    const prize = total * 10;
                    state.wonData += prize;
                    saveState(state);
                    result.innerHTML = `🎉 එකතුව: ${total} | ඔබ <strong>${prize} MB</strong> දිනුවා!`;
                    result.classList.remove('hidden');
                    showPopup('🎲', 'සුභ පැතුම්!', `ඔබ ${prize} MB දිනුවා!`);
                } else {
                    result.innerHTML = `😔 එකතුව: ${total} | මෙවර වාසනාව නැත. නැවත උත්සාහ කරන්න!`;
                    result.classList.remove('hidden');
                }
                updateStats();
                rollBtn.disabled = false;
            }
        }, 100);
    });
}

// ==================== TAB 4: SPIN WHEEL ====================
function initSpinWheel() {
    const spinBtn = document.getElementById('spinBtn');
    const wheel = document.getElementById('spinWheel');
    const result = document.getElementById('spinResult');

    if (!spinBtn || !wheel) return;

    const prizes = [50, 100, 25, 200, 75, 150];
    let isSpinning = false;

    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;

        openAdInNewTab();

        const randomDeg = 1800 + Math.floor(Math.random() * 360);
        wheel.style.transform = `rotate(${randomDeg}deg)`;

        setTimeout(() => {
            const finalDeg = randomDeg % 360;
            const prizeIndex = Math.floor(finalDeg / 60) % prizes.length;
            const prize = prizes[prizeIndex];

            state.wonData += prize;
            saveState(state);
            updateStats();

            result.innerHTML = `🎉 ඔබ <strong>${prize} MB</strong> දිනුවා!`;
            result.classList.remove('hidden');
            showPopup('🎡', 'සුභ පැතුම්!', `ඔබ ${prize} MB දිනුවා!`);

            isSpinning = false;
            spinBtn.disabled = false;
        }, 4500);
    });
}

// ==================== TAB 5: MEMORY GAME ====================
function initMemoryGame() {
    const grid = document.getElementById('memoryGrid');
    const resetBtn = document.getElementById('resetMemoryBtn');
    const result = document.getElementById('memoryResult');

    if (!grid) return;

    const emojis = ['🎁', '🏮', '🪔', '🎊', '🎉', '🌺', '🪷', '🎆'];
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;

    function createBoard() {
        grid.innerHTML = '';
        const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        canFlip = true;

        shuffled.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = i;
            card.textContent = '❓';
            card.addEventListener('click', () => flipCard(card));
            grid.appendChild(card);
            cards.push(card);
        });

        if (result) result.classList.add('hidden');
    }

    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            canFlip = false;
            const [c1, c2] = flippedCards;

            if (c1.dataset.emoji === c2.dataset.emoji) {
                c1.classList.add('matched');
                c2.classList.add('matched');
                matchedPairs++;
                flippedCards = [];
                canFlip = true;

                if (matchedPairs === emojis.length) {
                    const prize = 100;
                    state.wonData += prize;
                    saveState(state);
                    updateStats();
                    openAdInNewTab();
                    if (result) {
                        result.innerHTML = `🎉 සියලුම යුගල සොයාගත්තා! ඔබ <strong>${prize} MB</strong> දිනුවා!`;
                        result.classList.remove('hidden');
                    }
                    showPopup('🧠', 'විශිෂ්ටයි!', `ඔබ ${prize} MB දිනුවා!`);
                }
            } else {
                setTimeout(() => {
                    c1.classList.remove('flipped');
                    c2.classList.remove('flipped');
                    c1.textContent = '❓';
                    c2.textContent = '❓';
                    flippedCards = [];
                    canFlip = true;
                }, 800);
            }
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', createBoard);
    }

    createBoard();
}

// ==================== TAB 6: NUMBER GUESS ====================
function initGuessGame() {
    const display = document.getElementById('guessDisplay');
    const buttons = document.querySelectorAll('.guess-btn');
    const result = document.getElementById('guessResult');

    if (!display) return;

    let secretNumber = Math.floor(Math.random() * 10) + 1;
    let attempts = 0;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const guess = parseInt(btn.dataset.num);
            attempts++;

            if (guess === secretNumber) {
                btn.classList.add('correct');
                display.textContent = secretNumber;
                const prize = Math.max(10, 100 - (attempts * 10));
                state.wonData += prize;
                saveState(state);
                updateStats();
                openAdInNewTab();

                if (result) {
                    result.innerHTML = `🎉 නිවැරදියි! ${attempts} වන උත්සාහයෙන්! ඔබ <strong>${prize} MB</strong> දිනුවා!`;
                    result.classList.remove('hidden');
                }
                showPopup('🔢', 'නිවැරදියි!', `ඔබ ${prize} MB දිනුවා!`);

                // Reset after delay
                setTimeout(() => {
                    secretNumber = Math.floor(Math.random() * 10) + 1;
                    attempts = 0;
                    display.textContent = '?';
                    buttons.forEach(b => {
                        b.classList.remove('correct', 'wrong');
                    });
                    if (result) result.classList.add('hidden');
                }, 3000);
            } else {
                btn.classList.add('wrong');
                if (guess < secretNumber) {
                    display.textContent = '⬆️';
                } else {
                    display.textContent = '⬇️';
                }
            }
        });
    });
}

// ==================== TAB 7: COIN FLIP ====================
function initCoinGame() {
    const coin = document.getElementById('coinDisplay');
    const headsBtn = document.getElementById('headsBtn');
    const tailsBtn = document.getElementById('tailsBtn');
    const result = document.getElementById('coinResult');

    if (!coin || !headsBtn || !tailsBtn) return;

    function flipCoin(choice) {
        coin.classList.add('flipping');
        headsBtn.disabled = true;
        tailsBtn.disabled = true;

        openAdInNewTab();

        setTimeout(() => {
            const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
            coin.textContent = outcome === 'heads' ? '🌞' : '🌙';
            coin.classList.remove('flipping');

            if (choice === outcome) {
                const prize = 50;
                state.wonData += prize;
                saveState(state);
                updateStats();
                if (result) {
                    result.innerHTML = `🎉 ${outcome === 'heads' ? 'හෙඩ්ස්' : 'ටේල්ස්'}! ඔබ <strong>${prize} MB</strong> දිනුවා!`;
                    result.classList.remove('hidden');
                }
                showPopup('🪙', 'සුභ පැතුම්!', `ඔබ ${prize} MB දිනුවා!`);
            } else {
                if (result) {
                    result.innerHTML = `😔 ${outcome === 'heads' ? 'හෙඩ්ස්' : 'ටේල්ස්'}! මෙවර වාසනාව නැත. නැවත උත්සාහ කරන්න!`;
                    result.classList.remove('hidden');
                }
            }

            headsBtn.disabled = false;
            tailsBtn.disabled = false;

            setTimeout(() => {
                coin.textContent = '🪙';
            }, 2000);
        }, 1200);
    }

    headsBtn.addEventListener('click', () => flipCoin('heads'));
    tailsBtn.addEventListener('click', () => flipCoin('tails'));
}

// ==================== TAB 8: COMMENTS ====================
function initComments() {
    const commentInput = document.getElementById('commentInput');
    const sendBtn = document.getElementById('sendCommentBtn');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImgBtn = document.getElementById('removeImgBtn');
    const commentsList = document.getElementById('commentsList');

    let selectedImage = null;

    if (!sendBtn) return;

    // Image upload
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    selectedImage = ev.target.result;
                    if (previewImg) previewImg.src = selectedImage;
                    if (imagePreview) imagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImgBtn) {
        removeImgBtn.addEventListener('click', () => {
            selectedImage = null;
            if (imagePreview) imagePreview.classList.add('hidden');
            if (imageUpload) imageUpload.value = '';
        });
    }

    // Send comment
    sendBtn.addEventListener('click', () => {
        const text = commentInput ? commentInput.value.trim() : '';
        if (!text && !selectedImage) {
            showPopup('ℹ️', 'පණිවිඩයක් ලියන්න', 'කරුණාකර පණිවිඩයක් ලියන්න හෝ පින්තූරයක් එකතු කරන්න.');
            return;
        }

        const comment = {
            id: Date.now(),
            phone: state.phone || 'නොදන්නා',
            network: state.network || '',
            text: text,
            image: selectedImage,
            wonData: state.wonData,
            timestamp: new Date().toLocaleString('si-LK')
        };

        state.comments.unshift(comment);
        if (state.comments.length > 100) state.comments = state.comments.slice(0, 100);
        saveState(state);

        renderComments();

        if (commentInput) commentInput.value = '';
        selectedImage = null;
        if (imagePreview) imagePreview.classList.add('hidden');
        if (imageUpload) imageUpload.value = '';
    });

    renderComments();
}

function renderComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    commentsList.innerHTML = '';

    state.comments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'comment-item';

        const maskedPhone = comment.phone ? 
            comment.phone.substring(0, 3) + '****' + comment.phone.substring(comment.phone.length - 2) : 
            'නොදන්නා';

        const networkEmoji = {
            'dialog': '📡 Dialog',
            'mobitel': '📡 Mobitel',
            'hutch': '📡 Hutch',
            'airtel': '📡 Airtel'
        };

        item.innerHTML = `
            <div class="comment-header">
                <div class="comment-user">
                    <div class="comment-avatar">${comment.phone ? comment.phone.charAt(0) : '?'}</div>
                    <div>
                        <div class="comment-name">${maskedPhone} ${networkEmoji[comment.network] || ''}</div>
                        <div class="comment-time">${comment.timestamp}</div>
                    </div>
                </div>
                <div class="comment-data-badge">🏆 ${comment.wonData} MB දිනා ඇත</div>
            </div>
            ${comment.text ? `<div class="comment-text">${escapeHtml(comment.text)}</div>` : ''}
            ${comment.image ? `<img src="${comment.image}" class="comment-image" alt="uploaded image">` : ''}
        `;

        commentsList.appendChild(item);
    });

    if (state.comments.length === 0) {
        commentsList.innerHTML = '<p style="text-align:center; color:rgba(255,248,231,0.5); padding:20px;">තවම අදහස් නැත. පළමුවැන්නා වන්න! 🎉</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== TAB 9: REFERRALS ====================
function initReferrals() {
    const refLink = document.getElementById('refLink');
    const copyRefBtn = document.getElementById('copyRefBtn');
    const totalReferrals = document.getElementById('totalReferrals');
    const bonusData = document.getElementById('bonusData');

    const baseUrl = window.location.href.split('?')[0];
    const refUrl = baseUrl + '?ref=' + state.userId;

    if (refLink) refLink.value = refUrl;

    if (copyRefBtn) {
        copyRefBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(refUrl).then(() => {
                copyRefBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyRefBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
                openAdInNewTab();
            }).catch(() => {
                if (refLink) {
                    refLink.select();
                    document.execCommand('copy');
                }
            });
        });
    }

    if (totalReferrals) totalReferrals.textContent = state.referrals.length;
    if (bonusData) bonusData.textContent = (state.referrals.length * 20) + ' MB';

    renderReferrals();
}

function renderReferrals() {
    const referralList = document.getElementById('referralList');
    if (!referralList) return;

    let html = '<h3>පැමිණි මිතුරන්:</h3>';

    if (state.referrals.length === 0) {
        html += '<p style="text-align:center; color:rgba(255,248,231,0.5); padding:15px;">තවම යොමු නැත. ඔබේ link එක share කරන්න!</p>';
    } else {
        state.referrals.forEach(ref => {
            html += `
                <div class="referral-entry">
                    <span class="ref-phone">${ref.phone || 'නොදන්නා'}</span>
                    <span class="ref-time">${ref.time || ''}</span>
                </div>
            `;
        });
    }

    referralList.innerHTML = html;
}

function trackReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');

    if (refId && refId !== state.userId) {
        // Store that this user came from a referral
        const refData = {
            phone: state.phone,
            time: new Date().toLocaleString('si-LK'),
            referredBy: refId
        };

        // Save to referrer's data (simplified - in real app this would be server-side)
        const referrerKey = STATE_KEY + '_ref_' + refId;
        try {
            let referrerRefs = JSON.parse(localStorage.getItem(referrerKey) || '[]');
            referrerRefs.push(refData);
            localStorage.setItem(referrerKey, JSON.stringify(referrerRefs));
        } catch {
            // Storage unavailable
        }
    }

    // Load own referrals
    const myRefKey = STATE_KEY + '_ref_' + state.userId;
    try {
        state.referrals = JSON.parse(localStorage.getItem(myRefKey) || '[]');
    } catch {
        state.referrals = [];
    }
}

// ==================== POPUP ====================
function showPopup(icon, title, message) {
    const overlay = document.getElementById('popupOverlay');
    const popupIcon = document.querySelector('.popup-icon');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const closeBtn = document.getElementById('popupCloseBtn');

    if (!overlay) return;

    if (popupIcon) popupIcon.textContent = icon;
    if (popupTitle) popupTitle.textContent = title;
    if (popupMessage) popupMessage.textContent = message;

    overlay.classList.remove('hidden');

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
        };
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initTabs();
    initStartPage();
    initPhonePage();
    initScratchCards();
    initShareButtons();
    initDiceGame();
    initSpinWheel();
    initMemoryGame();
    initGuessGame();
    initCoinGame();
    initComments();
    initReferrals();

    // Check for referral parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref')) {
        // User came from a referral link
        if (!state.phone) {
            switchTab(1);
        }
    }

    // Add some sample comments for demo
    if (state.comments.length === 0) {
        state.comments = [
            {
                id: 1,
                phone: '0771234567',
                network: 'dialog',
                text: '🎉 සුභ අළුත් අවුරුද්දක් වේවා! මම MB 200ක් දිනුවා!',
                image: null,
                wonData: 200,
                timestamp: '2026/04/13 10:30'
            },
            {
                id: 2,
                phone: '0769876543',
                network: 'mobitel',
                text: 'මේක නියමයි! Scratch card එකෙන් MB 100ක් ලැබුණා! 🎊',
                image: null,
                wonData: 150,
                timestamp: '2026/04/13 11:15'
            },
            {
                id: 3,
                phone: '0789991234',
                network: 'hutch',
                text: 'අළුත් අවුරුදු සුභ පැතුම්! සියලුම දෙනාට! 🪔🌺',
                image: null,
                wonData: 100,
                timestamp: '2026/04/13 12:00'
            }
        ];
        saveState(state);
    }
});
