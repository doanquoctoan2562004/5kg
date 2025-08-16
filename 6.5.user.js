// ==UserScript==
// @name         Laymanet Bypass Tool
// @namespace    http://tampermonkey.net/
// @version      6.5
// @description  Công cụ bypass Laymanet với giao diện tối ưu và thông báo notification
// @author       DiQiTi & Claude
// @match        https://layma.net/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.layma.net
// @connect      js.hcaptcha.com
// @connect      hcaptcha.com
// @connect      api.hcaptcha.com
// @connect      suamatzenmilk.com
// @connect      china-airline.net
// @connect      big-league.cn.com
// @connect      ruouphongthuy.net
// @connect      suckhoehiendai.com
// @connect      balosieudep.com
// @connect      yensaocangioanhthu.com
// @connect      keonhacai.lu
// @connect      keonhacai.ro
// @connect      keonhacai.st
// @connect      enzymevietnam.com
// @connect      bamivapharma.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const styles = `
        @media (max-width: 768px) {
            #overlay-tool {
                width: 95vw !important;
                max-width: 350px !important;
                top: 10px !important;
                right: 2.5vw !important;
                left: 2.5vw !important;
                font-size: 13px !important;
            }
            .tool-content { padding: 15px !important; }
            .toggle-btn {
                width: 45px !important;
                height: 45px !important;
                font-size: 16px !important;
                top: 15px !important;
                right: 15px !important;
            }
            .action-btn { font-size: 13px !important; padding: 10px 15px !important; }
            .form-select, .form-input { padding: 8px !important; font-size: 13px !important; }
            .checkbox-group { padding: 10px !important; }
            .result-area { min-height: 80px !important; font-size: 11px !important; }
        }

        @media (max-width: 480px) {
            #overlay-tool {
                width: 98vw !important;
                max-width: none !important;
                left: 1vw !important;
                right: 1vw !important;
                top: 5px !important;
            }
            .tool-title { font-size: 14px !important; }
            .button-group { flex-direction: column !important; }
            .button-group .action-btn { width: 100% !important; margin-bottom: 5px !important; }
        }

        #overlay-tool {
            position: fixed; top: 20px; right: 20px; width: 380px;
            background: rgba(20, 20, 30, 0.95); border: 1px solid #333;
            border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            z-index: 10000; font-family: Arial, sans-serif; color: #fff;
            display: none; backdrop-filter: blur(10px);
        }
        .tool-header {
            background: linear-gradient(45deg, #6366f1, #8b5cf6);
            padding: 15px 20px; border-radius: 15px 15px 0 0;
            display: flex; justify-content: space-between; align-items: center;
            cursor: move;
        }
        .tool-title { margin: 0; font-size: 16px; font-weight: bold; }
        .close-btn {
            background: rgba(255,255,255,0.2); border: none; color: #fff;
            width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
            font-size: 18px; line-height: 1;
        }
        .close-btn:hover { background: rgba(255,255,255,0.3); }
        .tool-content { padding: 20px; }
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; margin-bottom: 5px; font-size: 13px; color: #ccc; }
        .form-select, .form-input {
            width: 100%; padding: 10px; border: 1px solid #444;
            border-radius: 8px;  background: rgba(40, 40, 50, 0.9) !important;
            color: #fff !important; font-size: 14px; box-sizing: border-box;
        }
        .form-select:focus, .form-input:focus {
            outline: none; border-color: #6366f1; background: rgba(50, 50, 60, 0.95) !important;
        }
        .checkbox-group {
            display: flex; align-items: center; gap: 10px;
            background: rgba(99,102,241,0.2); padding: 12px;
            border-radius: 8px; cursor: pointer; margin-bottom: 10px;
        }
        .checkbox-group.auto-run {
            background: rgba(239,68,68,0.2);
        }
        .checkbox-group input { width: 18px; height: 18px; cursor: pointer; }
        .action-btn {
            padding: 12px 20px; border: none; border-radius: 8px;
            color: #fff; font-size: 14px; font-weight: bold; cursor: pointer;
            transition: all 0.3s ease;
        }
        .action-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .action-btn:disabled { background: #666 !important; cursor: not-allowed; }
        #process-btn {
            width: 100%; background: linear-gradient(45deg, #ef4444, #dc2626);
            margin-bottom: 15px;
        }
        .button-group { display: flex; gap: 10px; }
        .button-group .action-btn { flex: 1; }
        #copy-btn { background: linear-gradient(45deg, #06b6d4, #0891b2); }
        #clear-btn { background: linear-gradient(45deg, #6b7280, #4b5563); }
        .result-area {
            background: rgba(0,0,0,0.5); border: 1px solid #444;
            border-radius: 8px; padding: 15px; min-height: 100px; max-height: 200px;
            overflow-y: auto; font-size: 12px; line-height: 1.5;
            white-space: pre-wrap; font-family: Consolas, monospace; color: #e0e0e0;
            text-align: center; display: flex; align-items: center; justify-content: center;
        }
        .toggle-btn {
            position: fixed; top: 20px; right: 20px; width: 50px; height: 50px;
            background: linear-gradient(45deg, #6366f1, #8b5cf6); border: none;
            border-radius: 50%; color: #fff; font-size: 18px; cursor: pointer;
            z-index: 9999; box-shadow: 0 5px 15px rgba(99,102,241,0.4);
        }
        .toggle-btn:hover { transform: scale(1.1); }
        .loading { display: inline-block; width: 16px; height: 16px;
            border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
            border-top-color: #fff; animation: spin 1s linear infinite; margin-right: 5px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .result-success { color: #10b981; }
        .result-error { color: #ef4444; }
        .result-info { color: #3b82f6; }
        .result-warning { color: #f59e0b; }

        .popup-modal {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            background: rgba(0,0,0,0.8) !important; z-index: 999999 !important;
            display: flex !important; justify-content: center !important;
            align-items: center !important; backdrop-filter: blur(5px) !important;
        }
        .popup-content {
            background: linear-gradient(135deg, rgba(30,30,40,0.98), rgba(40,40,50,0.98)) !important;
            padding: 25px !important; border-radius: 15px !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8) !important;
            max-width: 500px !important; width: 90% !important; text-align: center !important;
            border: 1px solid rgba(255,255,255,0.1) !important; color: #fff !important;
        }
        .popup-title {
            margin: 0 0 20px 0 !important; font-size: 20px !important; font-weight: bold !important;
        }
        .popup-info {
            background: rgba(59,130,246,0.1) !important; border: 1px solid rgba(59,130,246,0.3) !important;
            padding: 15px !important; border-radius: 8px !important; margin: 15px 0 !important;
            color: #3b82f6 !important; font-size: 14px !important; line-height: 1.6 !important;
        }
        .popup-verify-btn {
            background: linear-gradient(45deg, #10b981, #059669) !important; color: #fff !important;
            border: none !important; padding: 15px 30px !important; border-radius: 10px !important;
            font-size: 16px !important; font-weight: bold !important; cursor: pointer !important;
            margin-top: 20px !important; width: 100% !important;
        }
        .popup-verify-btn:hover:not(:disabled) {
            transform: translateY(-2px) !important; box-shadow: 0 5px 15px rgba(16,185,129,0.4) !important;
        }
        .popup-verify-btn:disabled {
            background: rgba(107,114,128,0.5) !important; cursor: not-allowed !important;
        }
        .popup-close-btn {
            background: rgba(107,114,128,0.8) !important; color: #fff !important;
            border: none !important; padding: 10px 20px !important; border-radius: 8px !important;
            cursor: pointer !important; margin-top: 10px !important;
        }
        .auto-run-status {
            background: rgba(34,197,94,0.2) !important;
            border: 1px solid rgba(34,197,94,0.3) !important;
            color: #22c55e !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            font-size: 11px !important;
            margin-top: 10px !important;
            text-align: center !important;
        }

        .notification {
            position: fixed !important;
            top: 20px !important;
            left: 20px !important;
            z-index: 999999 !important;
            background: rgba(20, 20, 30, 0.95) !important;
            color: #fff !important;
            padding: 12px 20px !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid #333 !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            min-width: 200px !important;
            max-width: 400px !important;
            word-wrap: break-word !important;
            transform: translateX(-100%) !important;
            opacity: 0 !important;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
            pointer-events: auto !important;
        }

        .notification.show {
            transform: translateX(0) !important;
            opacity: 1 !important;
        }

        .notification.success {
            border-left: 4px solid #10b981 !important;
            background: rgba(16, 185, 129, 0.15) !important;
        }

        .notification.error {
            border-left: 4px solid #ef4444 !important;
            background: rgba(239, 68, 68, 0.15) !important;
        }

        .notification.info {
            border-left: 4px solid #3b82f6 !important;
            background: rgba(59, 130, 246, 0.15) !important;
        }

        .notification.warning {
            border-left: 4px solid #f59e0b !important;
            background: rgba(245, 158, 11, 0.15) !important;
        }

        @media (max-width: 768px) {
            .notification {
                left: 10px !important;
                right: 10px !important;
                max-width: calc(100vw - 20px) !important;
                font-size: 13px !important;
                padding: 10px 15px !important;
                transform: translateY(-100%) !important;
            }

            .notification.show {
                transform: translateY(0) !important;
            }
        }

        @media (max-width: 480px) {
            .notification {
                left: 5px !important;
                right: 5px !important;
                max-width: calc(100vw - 10px) !important;
                font-size: 12px !important;
            }
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const overlayHTML = `
        <button id="toggle-btn" class="toggle-btn">⚡</button>
        <div id="overlay-tool">
            <div class="tool-header">
                <h3 class="tool-title">TOOL DÀNH CHO CỤT THỦ 🐧 MAKE BY DQT</h3>
                <button class="close-btn">×</button>
            </div>
            <div class="tool-content">
                <div class="form-group">
                    <label class="form-label">URL Nhiệm Vụ</label>
                    <select id="url-select" class="form-select">
                        <option value="suamatzenmilk.com">suamatzenmilk.com</option>
                        <option value="yensaocangioanhthu.com">yensaocangioanhthu.com</option>
                        <option value="keonhacai.lu">keonhacai.lu</option>
                        <option value="keonhacai.ro">keonhacai.ro</option>
                        <option value="keonhacai.st">keonhacai.st</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nền Tảng</label>
                    <select id="platform-select" class="form-select">
                        <option value="facebook">Facebook</option>
                        <option value="google">Google</option>
                    </select>
                </div>
                <div class="form-group checkbox-group" id="auto-fill-group">
                    <input type="checkbox" id="auto-fill-checkbox">
                    <label>🤖 Tự Động Điền</label>
                </div>
                <div class="form-group checkbox-group auto-run" id="auto-run-group">
                    <input type="checkbox" id="auto-run-checkbox">
                    <label>🚀 Tự Động Chạy Bypass</label>
                </div>
                <div id="auto-run-status" class="auto-run-status" style="display: none;">
                    🟢 Chế độ tự động đang hoạt động
                </div>
                <button id="process-btn" class="action-btn">BẮT ĐẦU BYPASS</button>
                <div class="form-group">
                    <label class="form-label">Kết Quả</label>
                    <div id="result-area" class="result-area">Sẵn sàng bắt đầu...</div>
                </div>
                <div class="button-group">
                    <button id="copy-btn" class="action-btn" disabled>Sao Chép</button>
                    <button id="clear-btn" class="action-btn">Xóa</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    const overlay = document.getElementById('overlay-tool');
    const toggleBtn = document.getElementById('toggle-btn');
    const closeBtn = document.querySelector('.close-btn');
    const processBtn = document.getElementById('process-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultArea = document.getElementById('result-area');
    const urlSelect = document.getElementById('url-select');
    const platformSelect = document.getElementById('platform-select');
    const autoFillCheckbox = document.getElementById('auto-fill-checkbox');
    const autoRunCheckbox = document.getElementById('auto-run-checkbox');
    const autoFillGroup = document.getElementById('auto-fill-group');
    const autoRunGroup = document.getElementById('auto-run-group');
    const autoRunStatus = document.getElementById('auto-run-status');
    const header = document.querySelector('.tool-header');

    let isProcessing = false;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let autoRunEnabled = false;
    let autoFillEnabled = false;
    let isAutoRunCheckActive = false;
    let currentCode = '';
    let notificationQueue = [];
    let isShowingNotification = false;

    function showNotification(message, type = 'info', duration = 3000) {
        notificationQueue.push({ message, type, duration });
        processNotificationQueue();
    }

    function processNotificationQueue() {
        if (isShowingNotification || notificationQueue.length === 0) {
            return;
        }

        isShowingNotification = true;
        const { message, type, duration } = notificationQueue.shift();

        document.querySelectorAll('.notification').forEach(notif => {
            notif.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                isShowingNotification = false;

                if (notificationQueue.length > 0) {
                    setTimeout(() => processNotificationQueue(), 100);
                }
            }, 400);
        }, duration);
    }

    function restoreCheckboxStates() {
        try {
            const savedAutoFill = GM_getValue('laymanet_auto_fill', false);
            const savedAutoRun = GM_getValue('laymanet_auto_run', false);

            autoFillCheckbox.checked = savedAutoFill;
            autoFillEnabled = savedAutoFill;

            autoRunCheckbox.checked = savedAutoRun;
            autoRunEnabled = savedAutoRun;

            updateAutoRunStatus();

        } catch (error) {
            showNotification('Lỗi khôi phục trạng thái: ' + error.message, 'error');
        }
    }

    function saveCheckboxState(type, value) {
        try {
            const key = `laymanet_${type}`;
            GM_setValue(key, value);
        } catch (error) {
            console.warn('Không thể lưu trạng thái:', error);
        }
    }

    function updateAutoRunStatus() {
        if (autoRunEnabled) {
            autoRunStatus.style.display = 'block';
            autoRunStatus.textContent = '🟢 Chế độ tự động đang hoạt động';
        } else {
            autoRunStatus.style.display = 'none';
        }
    }

    function toggleAutoFill() {
        autoFillCheckbox.checked = !autoFillCheckbox.checked;
        autoFillEnabled = autoFillCheckbox.checked;
        saveCheckboxState('auto_fill', autoFillEnabled);
        showNotification(`Tự động điền: ${autoFillEnabled ? 'BẬT' : 'TẮT'}`, 'info');
    }

    function toggleAutoRun() {
        autoRunCheckbox.checked = !autoRunCheckbox.checked;
        autoRunEnabled = autoRunCheckbox.checked;
        saveCheckboxState('auto_run', autoRunEnabled);
        updateAutoRunStatus();

        showNotification(`Tự động chạy: ${autoRunEnabled ? 'BẬT' : 'TẮT'}`, autoRunEnabled ? 'warning' : 'info');

        if (autoRunEnabled && !isAutoRunCheckActive) {
            setTimeout(() => {
                checkAndRunAutoBypass();
            }, 500);
        }
    }

    function updateResult(text, showInResult = false) {
        if (showInResult) {
            resultArea.textContent = text;
            if (text && text.length > 5 && !text.includes('Sẵn sàng') && !text.includes('Đang') && !text.includes('Lỗi')) {
                currentCode = text;
                copyBtn.disabled = false;
            }
        }
    }

    function clearResult() {
        resultArea.textContent = 'Sẵn sàng bắt đầu...';
        currentCode = '';
        copyBtn.disabled = true;
    }

    function detectImagePattern() {
        try {
            const allImages = document.querySelectorAll('img[src*="api.layma.net"]');

            for (const img of allImages) {
                const src = img.getAttribute('src');
                if (src) {
                    if (src.includes('IMG_1568.jpeg')) {
                        return 'yến';
                    }
                    if (src.includes('yến.png')) {
                        return 'yến';
                    }
                    if (src.includes('lu.png')) {
                        return 'lu';
                    }
                    if (src.includes('ro.png')) {
                        return 'ro';
                    }
                    if (src.includes('st.png')) {
                        return 'st';
                    }
                    if (src.includes('sua.png')) {
                        return 'sua';
                    }
                    if (src.includes('a1.png')) {
                        return 'sua';
                    }

                    const matchWithFolder = src.match(/\/(\d+\/)?([a-zA-Z]+)\.png$/);
                    if (matchWithFolder) {
                        const pattern = matchWithFolder[2].toLowerCase();
                        return pattern;
                    }
                }
            }
            return null;
        } catch (error) {
            showNotification('Lỗi phát hiện pattern: ' + error.message, 'error');
            return null;
        }
    }

    function getTaskUrlByPattern(pattern) {
        const mappings = {
            'st': 'keonhacai.st',
            'ro': 'keonhacai.ro',
            'lu': 'keonhacai.lu',
            'sua': 'suamatzenmilk.com',
            'yến': 'yensaocangioanhthu.com'
        };
        return mappings[pattern] || null;
    }

    async function checkAndRunAutoBypass() {
        if (!autoRunEnabled || isProcessing || isAutoRunCheckActive) {
            return;
        }

        isAutoRunCheckActive = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            const pattern = detectImagePattern();
            if (!pattern) {
                return;
            }

            const taskUrl = getTaskUrlByPattern(pattern);
            if (!taskUrl) {
                return;
            }

            showNotification(`Auto run phát hiện: ${taskUrl}`, 'success');

            await new Promise(resolve => setTimeout(resolve, 300));

            urlSelect.value = taskUrl;
            platformSelect.value = 'facebook';

            await new Promise(resolve => setTimeout(resolve, 500));

            await handleProcess();

        } catch (error) {
            showNotification('Lỗi auto run: ' + error.message, 'error');
        } finally {
            isAutoRunCheckActive = false;
        }
    }

    toggleBtn.addEventListener('click', () => {
        overlay.style.display = 'block';
        toggleBtn.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        toggleBtn.style.display = 'block';
    });

    processBtn.addEventListener('click', handleProcess);
    clearBtn.addEventListener('click', clearResult);
    copyBtn.addEventListener('click', handleCopy);

    autoFillGroup.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAutoFill();
    });

    autoRunGroup.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAutoRun();
    });

    autoFillCheckbox.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    autoRunCheckbox.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    function startDrag(e) {
        if (e.target.classList.contains('close-btn')) return;
        isDragging = true;
        const rect = overlay.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        overlay.style.left = `${Math.max(0, Math.min(x, window.innerWidth - overlay.offsetWidth))}px`;
        overlay.style.top = `${Math.max(0, Math.min(y, window.innerHeight - overlay.offsetHeight))}px`;
        overlay.style.right = 'auto';
    }

    function stopDrag() {
        isDragging = false;
    }

    async function handleCopy() {
        if (copyBtn.disabled || !currentCode) return;

        await navigator.clipboard.writeText(currentCode);
        copyBtn.innerHTML = '✓ Đã Sao Chép';
        setTimeout(() => copyBtn.innerHTML = 'Sao Chép', 2000);
        showNotification('Đã sao chép mã thành công!', 'success');
    }

    function createPopupWindow(sitekey, targetHost) {
        return new Promise((resolve, reject) => {
            const popupHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác Thực Bảo Mật - ${targetHost}</title>
    <script>
        const originalLocation = window.location;
        const originalDocument = document;

        try {
            Object.defineProperty(window.location, 'hostname', {
                get: function() { return '${targetHost}'; },
                configurable: true
            });
            Object.defineProperty(window.location, 'host', {
                get: function() { return '${targetHost}'; },
                configurable: true
            });
            Object.defineProperty(window.location, 'origin', {
                get: function() { return 'https://${targetHost}'; },
                configurable: true
            });
        } catch (e) {
            console.warn('Không thể ghi đè thuộc tính location:', e);
        }
    </script>
    <style>
        body {
            margin: 0; padding: 20px; background: #f5f5f5;
            font-family: Arial, sans-serif; display: flex;
            flex-direction: column; justify-content: center;
            align-items: center; min-height: 100vh;
        }
        .container {
            background: white; padding: 30px; border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center;
            max-width: 400px; width: 100%;
        }
        .title {
            margin: 0 0 20px 0; color: #333; font-size: 24px; font-weight: bold;
        }
        .info {
            background: #e8f5e8; color: #2d5a2d; padding: 15px;
            border-radius: 8px; margin: 20px 0; font-size: 14px;
            font-family: Consolas, monospace;
        }
        .hcaptcha-container {
            margin: 25px 0; min-height: 80px;
        }
        .status {
            color: #666; font-size: 14px; margin: 15px 0;
        }
        .btn {
            background: #10b981; color: white; border: none;
            padding: 12px 25px; border-radius: 8px; font-size: 16px;
            font-weight: bold; cursor: pointer; margin: 10px 5px;
        }
        .btn:hover { background: #059669; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .btn-close { background: #6b7280; }
        .btn-close:hover { background: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">Xác Thực Bảo Mật</h1>
        <div class="info">
            📖 <strong>Hướng dẫn sử dụng:</strong><br><br>
                    1️⃣ Hoàn thành xác thực hCaptcha<br>
                    2️⃣ Click "Tiếp tục với token" để tiếp tục bypass<br><br>
                    💡 <em>Popup sẽ tự động đóng sau khi hoàn thành</em>
        </div>
        <div id="hcaptcha-container" class="hcaptcha-container">
            <div class="status">Đang khởi tạo hCaptcha...</div>
        </div>
        <button id="verify-btn" class="btn" disabled>⏳ Vui lòng hoàn thành xác thực</button>
        <button id="close-btn" class="btn btn-close">❌ Hủy</button>
    </div>

    <script src="https://js.hcaptcha.com/1/api.js?onload=onHCaptchaLoad&render=explicit" async defer></script>
    <script>
        let hcaptchaToken = null;
        let hcaptchaId = null;
        let parentWindow = window.opener;
        let isInitialized = false;

        window.hcaptchaSuccess = function(token) {
            hcaptchaToken = token;

            const statusEl = document.querySelector('.status');
            const verifyBtn = document.getElementById('verify-btn');

            if (statusEl) statusEl.textContent = 'Xác thực hoàn thành thành công!';
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.textContent = '✅ Tiếp tục với token';
                verifyBtn.style.background = '#10b981';
                verifyBtn.style.cursor = 'pointer';
            }
        };

        window.hcaptchaExpired = function() {
            hcaptchaToken = null;

            const statusEl = document.querySelector('.status');
            const verifyBtn = document.getElementById('verify-btn');

            if (statusEl) statusEl.textContent = 'Xác thực đã hết hạn. Vui lòng thử lại.';
            if (verifyBtn) {
                verifyBtn.disabled = true;
                verifyBtn.textContent = '⏰ Đã hết hạn - Thử lại';
                verifyBtn.style.background = '#ccc';
            }
        };

        window.hcaptchaError = function(error) {
            hcaptchaToken = null;

            const statusEl = document.querySelector('.status');
            const verifyBtn = document.getElementById('verify-btn');

            if (statusEl) statusEl.textContent = 'Lỗi: ' + error;
            if (verifyBtn) {
                verifyBtn.disabled = true;
                verifyBtn.textContent = '❌ Đã xảy ra lỗi';
                verifyBtn.style.background = '#ef4444';
            }
        };

        window.hcaptchaOpen = function() {
            console.log('🎯 Thách thức hCaptcha đã mở');
        };

        window.hcaptchaClose = function() {
            console.log('🔒 Thách thức hCaptcha đã đóng');
        };

        window.onHCaptchaLoad = function() {
            initHCaptcha();
        };

        function initHCaptcha() {
            if (isInitialized) {
                return;
            }

            if (!window.hcaptcha) {
                setTimeout(initHCaptcha, 500);
                return;
            }

            const container = document.getElementById('hcaptcha-container');
            if (!container) {
                return;
            }

            container.innerHTML = '';
            isInitialized = true;

            try {
                hcaptchaId = window.hcaptcha.render(container, {
                    sitekey: '${sitekey}',
                    theme: 'light',
                    size: 'normal',
                    callback: 'hcaptchaSuccess',
                    'expired-callback': 'hcaptchaExpired',
                    'error-callback': 'hcaptchaError',
                    'open-callback': 'hcaptchaOpen',
                    'close-callback': 'hcaptchaClose'
                });

                const statusEl = document.querySelector('.status');
                if (statusEl) statusEl.textContent = 'Vui lòng hoàn thành xác thực bên dưới';

            } catch (error) {
                const statusEl = document.querySelector('.status');
                if (statusEl) statusEl.textContent = 'Khởi tạo thất bại: ' + error.message;
                isInitialized = false;
            }
        }

        document.getElementById('verify-btn').addEventListener('click', function() {
            if (!hcaptchaToken) {
                alert('Vui lòng hoàn thành xác thực hCaptcha trước!');
                return;
            }

            if (hcaptchaToken && parentWindow && !parentWindow.closed) {
                try {
                    parentWindow.postMessage({
                        type: 'hcaptcha_popup_success',
                        token: hcaptchaToken,
                        targetHost: '${targetHost}',
                        method: 'popup_window'
                    }, '*');

                    setTimeout(() => {
                        window.close();
                    }, 100);
                } catch (e) {
                    alert('Lỗi giao tiếp với cửa sổ cha');
                }
            } else {
                alert('Không thể giao tiếp với cửa sổ cha');
            }
        });

        document.getElementById('close-btn').addEventListener('click', function() {
            if (parentWindow && !parentWindow.closed) {
                try {
                    parentWindow.postMessage({
                        type: 'hcaptcha_popup_cancelled',
                        targetHost: '${targetHost}'
                    }, '*');
                } catch (e) {
                    console.warn('⚠️ Không thể thông báo cho cửa sổ cha về việc hủy:', e);
                }
            }
            window.close();
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (!isInitialized) {
                    setTimeout(initHCaptcha, 200);
                }
            });
        } else {
            setTimeout(function() {
                if (!isInitialized) {
                    initHCaptcha();
                }
            }, 100);
        }

        setTimeout(function() {
            if (!isInitialized) {
                initHCaptcha();
            }
        }, 2000);
    </script>
</body>
</html>`;

            const popup = window.open('', '_blank',
                'width=500,height=600,resizable=yes,scrollbars=yes,status=yes,location=no,toolbar=no,menubar=no'
            );

            if (!popup) {
                reject(new Error('Popup bị chặn. Vui lòng cho phép popup cho trang này.'));
                return;
            }

            popup.document.open();
            popup.document.write(popupHtml);
            popup.document.close();

            function handlePopupMessage(event) {
                if (event.source !== popup) return;

                const data = event.data;

                switch (data.type) {
                    case 'hcaptcha_popup_success':
                        window.removeEventListener('message', handlePopupMessage);
                        resolve(data.token);
                        break;

                    case 'hcaptcha_popup_cancelled':
                        window.removeEventListener('message', handlePopupMessage);
                        reject(new Error('Người dùng đã hủy xác thực'));
                        break;
                }
            }

            window.addEventListener('message', handlePopupMessage);

            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', handlePopupMessage);
                    reject(new Error('Cửa sổ popup đã bị đóng'));
                }
            }, 1000);
        });
    }

    function showHCaptchaModal(campaignData, config) {
        return new Promise((resolve, reject) => {
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'popup-modal';

            const modalContent = document.createElement('div');
            modalContent.className = 'popup-content';

            modalContent.innerHTML = `
                <h3 class="popup-title">🛡️ Xác Thực Bảo Mật</h3>
                <p>Vui lòng mở cửa sổ popup để hoàn thành xác thực hCaptcha</p>
                <div class="popup-info">
                    📖 <strong>Hướng dẫn sử dụng:</strong><br><br>
                    1️⃣ Click "Mở Popup Xác Thực" bên dưới<br>
                    2️⃣ Hoàn thành xác thực hCaptcha trong popup<br>
                    3️⃣ Click "Tiếp tục với token" để lấy mã bypass<br><br>
                    💡 <em>Popup sẽ tự động đóng sau khi hoàn thành</em>
                </div>
                <button class="popup-verify-btn" id="popup-start">🚀 Mở Popup Xác Thực</button>
                <button class="popup-close-btn" id="popup-cancel">❌ Hủy</button>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            document.getElementById('popup-start').addEventListener('click', async () => {
                try {
                    showNotification('Đang mở popup xác thực...', 'info');
                    const token = await createPopupWindow(config.hcaptchaSitekey, config.host);

                    document.body.removeChild(modalOverlay);
                    showNotification('Xác thực hCaptcha thành công!', 'success');
                    resolve(token);

                } catch (error) {
                    showNotification('Lỗi popup: ' + error.message, 'error');
                    document.body.removeChild(modalOverlay);
                    reject(error);
                }
            });

            document.getElementById('popup-cancel').addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
                reject(new Error('Người dùng đã hủy'));
            });

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    document.body.removeChild(modalOverlay);
                    reject(new Error('Người dùng đã hủy'));
                }
            });
        });
    }

    function getUrlConfig(eurl) {
        const configs = {
            'suamatzenmilk.com': {
                hurl: 'https://suamatzenmilk.com/',
                code: 'viyjUHvaj',
                host: 'suamatzenmilk.com',
                eurl: 'suamatzenmilk.com',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'china-airline.net': {
                hurl: 'https://enzymevietnam.com/',
                code: 'oTedsZr2m',
                host: 'china-airline.net',
                eurl: 'china-airline.net',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'big-league.cn.com': {
                hurl: 'https://bamivapharma.com/',
                code: 'e9VJokISt',
                host: 'big-league.cn.com',
                eurl: 'big-league.cn.com',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'ruouphongthuy.net': {
                hurl: 'https://bamivapharma.com/',
                code: 'e9VJokISt',
                host: 'ruouphongthuy.net',
                eurl: 'ruouphongthuy.net',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'suckhoehiendai.com': {
                hurl: 'https://bamivapharma.com/',
                code: 'e9VJokISt',
                host: 'suckhoehiendai.com',
                eurl: 'suckhoehiendai.com',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'balosieudep.com': {
                hurl: 'https://bamivapharma.com/',
                code: 'e9VJokISt',
                host: 'balosieudep.com',
                eurl: 'balosieudep.com',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'yensaocangioanhthu.com': {
                hurl: 'https://yensaocangioanhthu.com/',
                code: 'e9VJokISt',
                host: 'yensaocangioanhthu.com',
                eurl: 'yensaocangioanhthu.com',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'keonhacai.lu': {
                hurl: 'https://bamivapharma.com/',
                code: 'uNQKWXku1',
                host: 'keonhacai.lu',
                eurl: 'keonhacai.lu',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'keonhacai.ro': {
                hurl: 'https://bamivapharma.com/',
                code: 'eGX9IbORa',
                host: 'keonhacai.ro',
                eurl: 'keonhacai.ro',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            },
            'keonhacai.st': {
                hurl: 'https://bamivapharma.com/',
                code: '7J7JEcJSx',
                host: 'keonhacai.st',
                eurl: 'keonhacai.st',
                hcaptchaSitekey: '52ca8278-7b4e-47aa-882e-73f4b9ce4cc6'
            }
        };
        return configs[eurl] || null;
    }

    function makeRequest(options) {
        return new Promise((resolve, reject) => {
            options.onload = res => {
                if (res.status >= 200 && res.status < 300) {
                    resolve(res);
                } else {
                    reject(new Error(`HTTP ${res.status}: ${res.statusText}`));
                }
            };
            options.onerror = () => reject(new Error('Lỗi mạng'));
            options.ontimeout = () => reject(new Error('Yêu cầu hết thời gian'));
            options.timeout = 30000;
            GM_xmlhttpRequest(options);
        });
    }

    function generateVisitorInfo() {
        return {
            uuid: generateUUID(),
            browser: 'Chrome',
            browserVersion: '131.0.0.0',
            browserMajorVersion: 131,
            cookies: true,
            mobile: false,
            os: 'Windows',
            osVersion: '10',
            screen: '1920 x 1080'
        };
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function simulateUserActions(code) {
        try {
            showNotification('Đang tự động điền form...', 'info');
            await new Promise(res => setTimeout(res, 300));

            const codeInput = document.querySelector('#codeInput') ||
                             document.querySelector('input[placeholder*="Nhập mã"]') ||
                             document.querySelector('input[name*="code"]') ||
                             document.querySelector('input[type="text"]');

            if (!codeInput) {
                showNotification('Không tìm thấy ô nhập mã', 'error');
                return;
            }

            codeInput.focus();
            codeInput.value = '';
            codeInput.value = code;
            codeInput.dispatchEvent(new Event('input', { bubbles: true }));
            codeInput.dispatchEvent(new Event('change', { bubbles: true }));

            showNotification('Đã điền mã: ' + code, 'success');
            await new Promise(res => setTimeout(res, 300));

            const recaptchaFrame = document.querySelector('iframe[src*="recaptcha"]') ||
                                  document.querySelector('div.g-recaptcha iframe') ||
                                  document.querySelector('.rc-anchor-container') ||
                                  document.querySelector('#rc-anchor-container');

            if (recaptchaFrame) {
                showNotification('Đang xử lý reCaptcha...', 'info');

                const recaptchaContainer = recaptchaFrame.closest('.g-recaptcha') ||
                                         recaptchaFrame.parentElement ||
                                         document.querySelector('.g-recaptcha');

                if (recaptchaContainer) {
                    recaptchaContainer.click();
                } else {
                    recaptchaFrame.click();
                }

                await new Promise(res => setTimeout(res, 300));

                try {
                    if (recaptchaFrame.contentDocument) {
                        const checkbox = recaptchaFrame.contentDocument.querySelector('.rc-anchor-checkbox');
                        if (checkbox) {
                            checkbox.click();
                        }
                    }
                } catch (e) {
                    console.warn('Không thể truy cập trực tiếp vào reCaptcha iframe');
                }
            }

            await new Promise(res => setTimeout(res, 300));

            const submitButton = document.querySelector('#btn-xac-nhan') ||
                               document.querySelector('button[type="submit"]') ||
                               document.querySelector('.btn-submit') ||
                               document.querySelector('input[type="submit"]') ||
                               Array.from(document.querySelectorAll('button')).find(btn =>
                                   btn.textContent.toLowerCase().includes('xác nhận') ||
                                   btn.textContent.toLowerCase().includes('submit') ||
                                   btn.textContent.toLowerCase().includes('gửi')
                               );

            if (submitButton && !submitButton.disabled) {
                submitButton.click();
                showNotification('Đã gửi form thành công!', 'success');
            } else {
                showNotification('Không tìm thấy nút xác nhận', 'warning');
            }

        } catch (error) {
            showNotification('Lỗi tự động điền: ' + error.message, 'error');
        }
    }

    async function performBypass(eurl, platform) {
        const config = getUrlConfig(eurl);
        if (!config) throw new Error(`URL "${eurl}" không được hỗ trợ`);

        const { hurl, code, host, hcaptchaSitekey } = config;

        showNotification(`Đang xử lý ${eurl} trên ${platform}...`, 'info');

        try {
            showNotification('Đang gửi yêu cầu traffic...', 'info');
            const trafficResponse = await makeRequest({
                method: 'GET',
                url: `https://layma.net/Traffic/Index/${code}`,
                headers: {
                    'Referer': hurl,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Host': 'layma.net'
                }
            });

            showNotification('Đang lấy dữ liệu campaign...', 'info');
            const campaignResponse = await makeRequest({
                method: 'GET',
                url: `https://api.layma.net/api/admin/campain?keytoken=${code}&flatform=${platform}`,
                headers: {
                    'Origin': hurl,
                    'Referer': hurl,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Host': 'api.layma.net'
                }
            });

            const campaignData = JSON.parse(campaignResponse.responseText);

            if (!campaignData?.id) {
                throw new Error("Không thể lấy ID campaign từ máy chủ");
            }

            showNotification('Đang mở popup hCaptcha...', 'info');
            const hCaptchaToken = await showHCaptchaModal(campaignData, config);

            showNotification('Đang tạo mã bypass...', 'info');
            const visitorInfo = generateVisitorInfo();
            const codePayload = {
                ...visitorInfo,
                referrer: hurl,
                trafficId: campaignData.id,
                solution: '1',
                hCaptchaToken: hCaptchaToken
            };

            const codeResponse = await makeRequest({
                method: 'POST',
                url: 'https://api.layma.net/api/admin/codemanager/getcode',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': hurl,
                    'Referer': hurl,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Host': 'api.layma.net'
                },
                data: JSON.stringify(codePayload)
            });

            const finalData = JSON.parse(codeResponse.responseText);

            if (finalData.success && finalData.html) {
                return finalData.html;
            } else {
                throw new Error(finalData.message || 'Không thể tạo mã bypass');
            }

        } catch (error) {
            throw error;
        }
    }

    async function handleProcess() {
        if (isProcessing) return;

        isProcessing = true;
        processBtn.disabled = true;
        processBtn.innerHTML = '<span class="loading"></span> Đang xử lý...';
        urlSelect.disabled = true;
        platformSelect.disabled = true;
        updateResult('Đang xử lý...', true);

        const selectedUrl = urlSelect.value;
        const selectedPlatform = platformSelect.value;
        const isAutoFillEnabled = autoFillCheckbox.checked;

        try {
            const result = await performBypass(selectedUrl, selectedPlatform);

            if (result && result !== 'Không tìm thấy mã trong kết quả trả về.') {
                updateResult(result, true);
                showNotification('Bypass thành công!', 'success', 5000);

                if (isAutoFillEnabled) {
                    await new Promise(res => setTimeout(res, 300));
                    await simulateUserActions(result);
                }
            } else {
                updateResult('Không thể tạo mã bypass', true);
                showNotification('Không thể tạo mã bypass', 'error');
            }

        } catch (error) {
            updateResult('Lỗi: ' + error.message, true);
            showNotification('Lỗi bypass: ' + error.message, 'error');
        } finally {
            isProcessing = false;
            processBtn.disabled = false;
            processBtn.innerHTML = 'BẮT ĐẦU BYPASS';
            urlSelect.disabled = false;
            platformSelect.disabled = false;
        }
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
            e.preventDefault();
            if (overlay.style.display === 'none' || !overlay.style.display) {
                overlay.style.display = 'block';
                toggleBtn.style.display = 'none';
            } else {
                overlay.style.display = 'none';
                toggleBtn.style.display = 'block';
            }
        }

        if (e.key === 'Escape' && overlay.style.display === 'block') {
            overlay.style.display = 'none';
            toggleBtn.style.display = 'block';
        }
    });

    function createPageObserver() {
        if (!autoRunEnabled) return null;

        const observer = new MutationObserver((mutations) => {
            if (isProcessing || isAutoRunCheckActive) return;

            let hasNewImages = false;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'IMG' || node.querySelector('img')) {
                            hasNewImages = true;
                        }
                    }
                });
            });

            if (hasNewImages) {
                setTimeout(() => {
                    if (autoRunEnabled && !isAutoRunCheckActive) {
                        checkAndRunAutoBypass();
                    }
                }, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    let pageObserver = null;

    function initialize() {
        clearResult();
        restoreCheckboxStates();

        if (autoRunEnabled) {
            pageObserver = createPageObserver();
        }

        if (autoRunEnabled) {
            setTimeout(() => {
                if (autoRunEnabled && !isAutoRunCheckActive) {
                    checkAndRunAutoBypass();
                }
            }, 2000);
        }

        showNotification('Tool Bypass Laymanet v6.5đã sẵn sàng!', 'success');
    }

    window.addEventListener('beforeunload', () => {
        if (pageObserver) {
            pageObserver.disconnect();
        }
    });

    const originalToggleAutoRun = toggleAutoRun;
    toggleAutoRun = function() {
        const wasEnabled = autoRunEnabled;
        originalToggleAutoRun();

        if (autoRunEnabled && !wasEnabled) {
            if (pageObserver) pageObserver.disconnect();
            pageObserver = createPageObserver();

            setTimeout(() => {
                if (autoRunEnabled && !isAutoRunCheckActive) {
                    checkAndRunAutoBypass();
                }
            }, 500);

        } else if (!autoRunEnabled && wasEnabled) {
            if (pageObserver) {
                pageObserver.disconnect();
                pageObserver = null;
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialize, 100);
        });
    } else {
        setTimeout(initialize, 200);
    }

    setTimeout(() => {
        if (!resultArea.textContent.includes('Sẵn sàng bắt đầu')) {
            initialize();
        }
    }, 3000);

})();
