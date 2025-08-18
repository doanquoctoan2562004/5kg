// ==UserScript==
// @name         Bypass Link Tool
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypass website funlink của thằng dev ngu lồn
// @author       DQT and Claude
// @match        https://funlink.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // CSS Styles
    const styles = `
        .bypass-overlay {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 1px solid #0f3460;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #ffffff;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }

        .bypass-header {
            background: linear-gradient(45deg, #0f3460, #533483);
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }

        .bypass-title {
            font-size: 14px;
            font-weight: 600;
            margin: 0;
        }

        .bypass-toggle {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        .bypass-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .bypass-content {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }

        .bypass-content.collapsed {
            display: none;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #a0a0a0;
        }

        .form-select, .form-input {
            width: 100%;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #ffffff;
            font-size: 11px;
            box-sizing: border-box;
            transition: all 0.2s ease;
        }

        .form-select:focus, .form-input:focus {
            outline: none;
            border-color: #0f3460;
            background: rgba(255, 255, 255, 0.08);
        }

        .form-select option {
            background: #1a1a2e;
            color: #ffffff;
        }

        .btn {
            width: 100%;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 8px;
        }

        .btn-primary {
            background: linear-gradient(45deg, #0f3460, #533483);
            color: #ffffff;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(15, 52, 96, 0.3);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-success {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: #ffffff;
        }

        .btn-success:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .status-text {
            font-size: 12px;
            text-align: center;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .status-processing {
            background: rgba(255, 193, 7, 0.1);
            color: #ffc107;
            border: 1px solid rgba(255, 193, 7, 0.2);
        }

        .status-success {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
            border: 1px solid rgba(40, 167, 69, 0.2);
        }

        .status-error {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border: 1px solid rgba(220, 53, 69, 0.2);
        }

        .code-result {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            min-height: 20px;
        }
    `;

    // Inject CSS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Task configurations
    const tasks = {
        '188bet': {
            name: 'https://88bet.hiphop - 188bet',
            origin: 'https://88bet.hiphop',
            referer: 'https://88bet.hiphop/',
            href: 'https://88bet.hiphop/cach-tinh-tien-bat-ty-so-bong-da/',
            hostname: 'https://88bet.hiphop'
        },
        'fun88': {
            name: 'https://fun88kyc.com - fun88',
            origin: 'https://fun88kyc.com',
            referer: 'https://fun88kyc.com/',
            href: 'https://fun88kyc.com/',
            hostname: 'https://fun88kyc.com'
        },
        'w88': {
            name: 'https://w88vt.com - w88',
            origin: 'https://w88vt.com',
            referer: 'https://w88vt.com/',
            href: 'https://w88vt.com/',
            hostname: 'https://w88vt.com'
        },
        'kubetvina': {
            name: 'https://kubetvina.net - kubet vina',
            origin: 'https://kubetvina.net',
            referer: 'https://kubetvina.net/',
            href: 'https://kubetvina.net/',
            hostname: 'https://kubetvina.net'
        },
        'kubet1': {
            name: 'https://tramadolhcl.us.org - kubet',
            origin: 'https://tramadolhcl.us.org',
            referer: 'https://tramadolhcl.us.org/',
            href: 'https://tramadolhcl.us.org/',
            hostname: 'https://tramadolhcl.us.org'
        },
        'kubet2': {
            name: 'https://tcc.eu.com - kubet',
            origin: 'https://tcc.eu.com',
            referer: 'https://tcc.eu.com/',
            href: 'https://tcc.eu.com/',
            hostname: 'https://tcc.eu.com'
        },
        'ae888': {
            name: 'https://ael1.com - ae888',
            origin: 'https://ael1.com',
            referer: 'https://ael1.com/',
            href: 'https://ael1.com/',
            hostname: 'https://ael1.com'
        },
        'go88': {
            name: 'https://verano.eu.com - go88 laperle.eu.com',
            origin: 'https://verano.eu.com',
            referer: 'https://verano.eu.com/',
            href: 'https://verano.eu.com/',
            hostname: 'https://verano.eu.com'
        },
        'daga_thomo': {
            name: 'https://savethe100club.co.uk - đá gà trực tiếp thomo',
            origin: 'https://savethe100club.co.uk',
            referer: 'https://savethe100club.co.uk/',
            href: 'https://savethe100club.co.uk/',
            hostname: 'https://savethe100club.co.uk'
        },
        'caraworld': {
            name: 'https://caraworldcamranh.land - caraworld cam ranh',
            origin: 'https://caraworldcamranh.land',
            referer: 'https://caraworldcamranh.land/',
            href: 'https://caraworldcamranh.land/',
            hostname: 'https://caraworldcamranh.land'
        },
        '8xbet': {
            name: 'https://criptomonedas.eu.com - 8xbet',
            origin: 'https://criptomonedas.eu.com',
            referer: 'https://criptomonedas.eu.com/',
            href: 'https://criptomonedas.eu.com/',
            hostname: 'https://criptomonedas.eu.com'
        },
        'sunwin': {
            name: 'https://www.tvcs.uk.net - sunwin',
            origin: 'https://www.tvcs.uk.net',
            referer: 'https://www.tvcs.uk.net/',
            href: 'https://www.tvcs.uk.net/',
            hostname: 'https://www.tvcs.uk.net'
        },
        'm88lu': {
            name: 'https://m88lu.io - m88lu',
            origin: 'https://m88lu.io',
            referer: 'https://m88lu.io/',
            href: 'https://m88lu.io/',
            hostname: 'https://m88lu.io'
        },
        'keo_fund': {
            name: 'https://aivn.co - kèo nhà cái fund',
            origin: 'https://aivn.co',
            referer: 'https://aivn.co/',
            href: 'https://aivn.co/',
            hostname: 'https://aivn.co'
        },
        'keo_nha_cai': {
            name: 'https://dancetouringpartnership.co.uk - kèo nhà cái',
            origin: 'https://dancetouringpartnership.co.uk',
            referer: 'https://dancetouringpartnership.co.uk/',
            href: 'https://dancetouringpartnership.co.uk/',
            hostname: 'https://dancetouringpartnership.co.uk'
        },
        'daga_truc_tiep': {
            name: 'https://hawkeandhunter.co.uk - đá gà trực tiếp',
            origin: 'https://hawkeandhunter.co.uk',
            referer: 'https://hawkeandhunter.co.uk/',
            href: 'https://hawkeandhunter.co.uk/',
            hostname: 'https://hawkeandhunter.co.uk'
        },
        'hello88': {
            name: 'https://tenerife.us.com - hello88',
            origin: 'https://tenerife.us.com',
            referer: 'https://tenerife.us.com/',
            href: 'https://tenerife.us.com/',
            hostname: 'https://tenerife.us.com'
        },
        'ca_do_bong_da': {
            name: 'https://chisholmunitedfc.com - trang cá độ bóng đá uy tín',
            origin: 'https://chisholmunitedfc.com',
            referer: 'https://chisholmunitedfc.com/',
            href: 'https://chisholmunitedfc.com/',
            hostname: 'https://chisholmunitedfc.com'
        }
    };

    // Create overlay UI
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'bypass-overlay';
        overlay.innerHTML = `
            <div class="bypass-header">
                <h3 class="bypass-title">CON CHÓ NGU DEV FUNLINK</h3>
                <button class="bypass-toggle" id="toggleBtn">−</button>
            </div>
            <div class="bypass-content" id="bypassContent">
                <div class="form-group">
                    <label class="form-label">Chọn nhiệm vụ:</label>
                    <select class="form-select" id="taskSelect">
                        <option value="">-- Chọn task --</option>
                        ${Object.entries(tasks).map(([key, task]) =>
                            `<option value="${key}">${task.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <button class="btn btn-primary" id="bypassBtn" disabled>
                        🔓 Bắt đầu bypass
                    </button>
                </div>

                <div id="statusContainer" style="display: none;">
                    <div class="status-text" id="statusText"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">Mã kết quả:</label>
                    <div class="code-result" id="codeResult">Chờ bypass...</div>
                </div>

                <div class="form-group">
                    <button class="btn btn-success" id="copyBtn" disabled>
                        📋 Copy Code
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }

    // Generate random ID
    function generateRandomId() {
        return Math.floor(Math.random() * 900000) + 100000;
    }

    // Make OPTIONS request
    function makeOptionsRequest(task) {
        return new Promise((resolve, reject) => {
            const rid = generateRandomId().toString();

            GM_xmlhttpRequest({
                method: 'OPTIONS',
                url: 'https://public.funlink.io/api/code/ch',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'max-age=0',
                    'origin': task.origin,
                    'priority': 'u=1, i',
                    'referer': task.referer,
                    'rid': rid,
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
                },
                onload: function(response) {
                    if (response.status === 200) {
                        resolve(rid);
                    } else {
                        reject(new Error(`OPTIONS request failed: ${response.status}`));
                    }
                },
                onerror: function(error) {
                    reject(new Error('OPTIONS request error: ' + error));
                }
            });
        });
    }

    // Make POST request to get code
    function getBypassCode(task, rid) {
        return new Promise((resolve, reject) => {
            const jsonData = {
                'screen': '1000 x 800',
                'browser_name': 'Safari',
                'browser_version': '100.0.0.0',
                'browser_major_version': '137',
                'is_mobile': false,
                'os_name': 'skibidiOS',
                'os_version': '10000000',
                'is_cookies': true,
                'href': task.href,
                'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
                'hostname': task.hostname
            };

            GM_xmlhttpRequest({
                method: 'POST',
                url: 'https://public.funlink.io/api/code/code',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'cache-control': 'max-age=0',
                    'content-type': 'application/json',
                    'origin': task.origin,
                    'priority': 'u=1, i',
                    'referer': task.referer,
                    'rid': rid,
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
                },
                data: JSON.stringify(jsonData),
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            resolve(data.code);
                        } catch (e) {
                            reject(new Error('Failed to parse response: ' + e.message));
                        }
                    } else {
                        reject(new Error(`POST request failed: ${response.status}`));
                    }
                },
                onerror: function(error) {
                    reject(new Error('POST request error: ' + error));
                }
            });
        });
    }

    // Update countdown
    function startCountdown(seconds, callback) {
        const statusText = document.getElementById('statusText');
        const statusContainer = document.getElementById('statusContainer');

        statusContainer.style.display = 'block';
        statusText.className = 'status-text status-processing';

        let remaining = seconds;

        const updateCountdown = () => {
            statusText.textContent = `⏳ Đang xử lý... (${remaining}s)`;

            if (remaining <= 0) {
                callback();
                return;
            }

            remaining--;
            setTimeout(updateCountdown, 1000);
        };

        updateCountdown();
    }

    // Bypass function
    async function performBypass(taskKey) {
        const task = tasks[taskKey];
        const bypassBtn = document.getElementById('bypassBtn');
        const codeResult = document.getElementById('codeResult');
        const copyBtn = document.getElementById('copyBtn');
        const statusContainer = document.getElementById('statusContainer');
        const statusText = document.getElementById('statusText');

        try {
            // Disable button
            bypassBtn.disabled = true;
            bypassBtn.textContent = '🔄 Đang xử lý...';
            codeResult.textContent = 'Đang bypass...';
            copyBtn.disabled = true;

            // Step 1: OPTIONS request
            statusContainer.style.display = 'block';
            statusText.className = 'status-text status-processing';
            statusText.textContent = '🔍 Đang khởi tạo request...';

            const rid = await makeOptionsRequest(task);

            // Step 2: Wait 60 seconds with countdown
            startCountdown(60, async () => {
                try {
                    // Step 3: Get bypass code
                    statusText.textContent = '🔓 Đang lấy mã bypass...';
                    const code = await getBypassCode(task, rid);

                    // Success
                    statusText.className = 'status-text status-success';
                    statusText.textContent = '✅ Bypass thành công!';
                    codeResult.textContent = code;
                    copyBtn.disabled = false;

                    // Re-enable button
                    bypassBtn.disabled = false;
                    bypassBtn.textContent = '🔓 Bắt đầu bypass';

                } catch (error) {
                    // Error in step 3
                    statusText.className = 'status-text status-error';
                    statusText.textContent = '❌ Lỗi: ' + error.message;
                    codeResult.textContent = 'Bypass thất bại!';

                    bypassBtn.disabled = false;
                    bypassBtn.textContent = '🔓 Bắt đầu bypass';
                }
            });

        } catch (error) {
            // Error in step 1
            statusContainer.style.display = 'block';
            statusText.className = 'status-text status-error';
            statusText.textContent = '❌ Lỗi: ' + error.message;
            codeResult.textContent = 'Bypass thất bại!';

            bypassBtn.disabled = false;
            bypassBtn.textContent = '🔓 Bắt đầu bypass';
        }
    }

    // Initialize overlay
    const overlay = createOverlay();

    // Make overlay draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    const header = overlay.querySelector('.bypass-header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'toggleBtn') return;
        isDragging = true;
        dragOffset.x = e.clientX - overlay.offsetLeft;
        dragOffset.y = e.clientY - overlay.offsetTop;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    });

    function handleDrag(e) {
        if (isDragging) {
            overlay.style.left = (e.clientX - dragOffset.x) + 'px';
            overlay.style.top = (e.clientY - dragOffset.y) + 'px';
            overlay.style.right = 'auto';
        }
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Event listeners
    document.getElementById('toggleBtn').addEventListener('click', () => {
        const content = document.getElementById('bypassContent');
        const toggleBtn = document.getElementById('toggleBtn');

        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggleBtn.textContent = '−';
        } else {
            content.classList.add('collapsed');
            toggleBtn.textContent = '+';
        }
    });

    document.getElementById('taskSelect').addEventListener('change', (e) => {
        const bypassBtn = document.getElementById('bypassBtn');
        bypassBtn.disabled = !e.target.value;
    });

    document.getElementById('bypassBtn').addEventListener('click', () => {
        const taskKey = document.getElementById('taskSelect').value;
        if (taskKey) {
            performBypass(taskKey);
        }
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const codeResult = document.getElementById('codeResult').textContent;
        if (codeResult && codeResult !== 'Chờ bypass...' && codeResult !== 'Bypass thất bại!') {
            GM_setClipboard(codeResult);

            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Đã copy!';
            copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            }, 2000);
        }
    });

})();
