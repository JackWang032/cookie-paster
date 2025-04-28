document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');

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

  // 复制当前网站的cookies
  copyBtn.addEventListener('click', async () => {
    try {
      const currentTab = await getCurrentTab();
      const url = new URL(currentTab.url);
      const domain = url.hostname;

      // 获取当前网站的所有cookies
      const cookies = await chrome.cookies.getAll({ domain });

      if (cookies.length === 0) {
        showStatus('当前网站没有可复制的cookies', true);
        return;
      }

      // 存储cookies到本地
      await chrome.storage.local.set({ 
        savedCookies: cookies,
        sourceDomain: domain 
      });

      showStatus(`成功复制 ${cookies.length} 个cookies`);
    } catch (error) {
      console.error('复制cookies失败:', error);
      showStatus(`复制失败: ${error.message}`, true);
    }
  });

  // 粘贴cookies到当前网站
  pasteBtn.addEventListener('click', async () => {
    try {
      // 获取保存的cookies
      const { savedCookies, sourceDomain } = await chrome.storage.local.get(['savedCookies', 'sourceDomain']);
      
      if (!savedCookies || savedCookies.length === 0) {
        showStatus('没有可粘贴的cookies', true);
        return;
      }

      const currentTab = await getCurrentTab();
      const url = new URL(currentTab.url);
      const targetDomain = url.hostname;

      // 检查是否粘贴到同一网站
      if (targetDomain === sourceDomain) {
        showStatus('无需在相同网站间粘贴cookies', true);
        return;
      }

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
    } catch (error) {
      console.error('粘贴cookies失败:', error);
      showStatus(`粘贴失败: ${error.message}`, true);
    }
  });
}); 