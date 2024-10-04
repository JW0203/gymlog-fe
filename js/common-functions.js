
export function clearContent(contentDiv) {
    // load-content 내의 모든 기존 폼 제거
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
}

export function isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken != null;
}

export function loadStylesheet(href) {
    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = href;
    document.head.appendChild(styleSheet);
}
