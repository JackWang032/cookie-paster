// 监听来自popup.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setCookie') {
    setCookie(message.cookie, message.targetDomain, message.targetUrl)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // 返回true表示将异步发送响应
    return true;
  }
});

// 设置cookie到目标域名
async function setCookie(sourceCookie, targetDomain, targetUrl) {
  try {
    // 从URL提取相关信息
    const url = new URL(targetUrl);
    const protocol = url.protocol.includes('https') ? 'https' : 'http';
    
    // 准备新的cookie对象
    const newCookie = {
      url: targetUrl,
      name: sourceCookie.name,
      value: sourceCookie.value,
      domain: targetDomain,
      path: sourceCookie.path || '/',
      secure: protocol === 'https',
      httpOnly: sourceCookie.httpOnly,
      sameSite: sourceCookie.sameSite,
      // 一些字段在set时不能指定
      // storeId不能直接传递
      // hostOnly不能设置
    };

    // 如果有过期时间，也设置它
    if (sourceCookie.expirationDate) {
      newCookie.expirationDate = sourceCookie.expirationDate;
    }

    // 设置新cookie
    const result = await chrome.cookies.set(newCookie);
    
    if (!result) {
      throw new Error(`无法设置cookie: ${sourceCookie.name}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('设置cookie失败:', error);
    throw error;
  }
} 