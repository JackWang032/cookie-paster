document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');
  const cookieInfoDiv = document.getElementById('cookieInfo');

  // 获取当前标签页信息
  const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  };

  // 显示状态信息
  const showStatus = (message, isError = false) => {
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'status error' : 'status success';
  };

  // 显示cookie信息
  const showCookieInfo = (sourceUrl, cookieCount) => {
    if (cookieInfoDiv) {
      cookieInfoDiv.innerHTML = `
        <p><strong>来源地址:</strong> ${sourceUrl}</p>
        <p><strong>Cookie数量:</strong> ${cookieCount}</p>
      `;
      cookieInfoDiv.style.display = 'block';
    }
  };

  // 清除cookie信息显示
  const clearCookieInfo = () => {
    if (cookieInfoDiv) {
      cookieInfoDiv.innerHTML = '';
      cookieInfoDiv.style.display = 'none';
    }
  };

  // 检查cookie域名是否匹配当前访问的域名
  // 1. 精确匹配当前域名
  // 2. cookie域名是以点开头的当前域名（如 .example.com 匹配 example.com）
  // 3. 当前域名是cookie域名的子域名（如 sub.example.com 访问时匹配 .example.com）
  const isCookieDomainMatch = (cookieDomain, currentDomain) => {
    // 移除cookie域名开头的点
    if (cookieDomain.startsWith('.')) {
      cookieDomain = cookieDomain.substring(1);
    }

    // 精确匹配
    if (cookieDomain === currentDomain) return true;
    
    // 当前域名是cookie域名的子域名
    if (currentDomain.endsWith('.' + cookieDomain)) return true;
    
    return false;
  };

  // 复制当前网站的cookies
  copyBtn.addEventListener('click', async () => {
    try {
      const currentTab = await getCurrentTab();
      const url = new URL(currentTab.url);
      const currentDomain = url.hostname;
      const sourceUrl = currentTab.url;

      // 获取所有与当前域名相关的cookies
      const allCookies = await chrome.cookies.getAll({});
      
      // 只保留当前访问域名的cookies，排除其他子域名的cookies
      const cookies = allCookies.filter(cookie => isCookieDomainMatch(cookie.domain, currentDomain));

      if (cookies.length === 0) {
        showStatus('当前网站没有可复制的cookies', true);
        clearCookieInfo();
        return;
      }

      // 存储cookies到本地，并记录来源URL
      await chrome.storage.local.set({ 
        savedCookies: cookies,
        sourceDomain: currentDomain,
        sourceUrl: sourceUrl
      });

      showStatus(`成功复制 ${cookies.length} 个cookies（仅当前域名）`);
      showCookieInfo(sourceUrl, cookies.length);
    } catch (error) {
      console.error('复制cookies失败:', error);
      showStatus(`复制失败: ${error.message}`, true);
      clearCookieInfo();
    }
  });

  // 粘贴cookies到当前网站
  pasteBtn.addEventListener('click', async () => {
    try {
      // 获取保存的cookies
      const { savedCookies, sourceDomain, sourceUrl } = await chrome.storage.local.get([
        'savedCookies', 'sourceDomain', 'sourceUrl'
      ]);
      
      if (!savedCookies || savedCookies.length === 0) {
        showStatus('没有可粘贴的cookies', true);
        clearCookieInfo();
        return;
      }

      const currentTab = await getCurrentTab();
      const url = new URL(currentTab.url);
      const targetDomain = url.hostname;

      // 计算成功和失败的cookie数量
      let successCount = 0;
      let failCount = 0;

      // 逐个设置cookie
      for (const cookie of savedCookies) {
        try {
          // 使用background.js处理cookie设置
          await chrome.runtime.sendMessage({
            action: 'setCookie',
            cookie: cookie,
            targetDomain: targetDomain,
            targetUrl: currentTab.url
          });
          successCount++;
        } catch (err) {
          console.error(`设置cookie ${cookie.name} 失败:`, err);
          failCount++;
        }
      }

      if (failCount === 0) {
        showStatus(`成功粘贴 ${successCount} 个cookies`);
      } else {
        showStatus(`粘贴完成: ${successCount} 成功, ${failCount} 失败`);
      }
      
      // 显示cookie来源信息
      if (sourceUrl) {
        showCookieInfo(sourceUrl, successCount);
      }
    } catch (error) {
      console.error('粘贴cookies失败:', error);
      showStatus(`粘贴失败: ${error.message}`, true);
      clearCookieInfo();
    }
  });

  // 初始化时检查是否有保存的cookie信息
  const initCookieInfo = async () => {
    const { savedCookies, sourceUrl } = await chrome.storage.local.get(['savedCookies', 'sourceUrl']);
    if (savedCookies && savedCookies.length > 0 && sourceUrl) {
      showCookieInfo(sourceUrl, savedCookies.length);
    } else {
      clearCookieInfo();
    }
  };

  // 初始化cookie信息显示
  initCookieInfo();
}); 