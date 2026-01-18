/**
 * YouTube RSS Link Collector - background.js
 * 브라우저 액션(아이콘 클릭) 이벤트를 처리합니다.
 */

chrome.action.onClicked.addListener((tab) => {
    console.log('[RSS-Extension] 아이콘 클릭됨. 탭 ID:', tab.id);

    // 현재 탭이 유튜브 페이지인지 확인
    if (tab.url && tab.url.includes('youtube.com')) {
        // content.js에 'copy_rss' 명령 전송
        chrome.tabs.sendMessage(tab.id, { action: 'copy_rss' }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('[RSS-Extension] 메시지 전송 실패 (콘텐츠 스크립트 미로드):', chrome.runtime.lastError.message);
            } else {
                console.log('[RSS-Extension] 콘텐츠 스크립트 응답:', response);
            }
        });
    } else {
        console.log('[RSS-Extension] 유튜브 페이지가 아닙니다.');
    }
});
