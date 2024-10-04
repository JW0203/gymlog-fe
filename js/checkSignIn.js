import {signIn} from "./signIn.js";

document.addEventListener("DOMContentLoaded", () => {
    // localStorage 에서 accessToken 확인
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        // 로그인된 상태라면 홈 콘텐츠를 로드
        loadHomeContent();
    } else {
        // 로그인되지 않은 상태면 로그인 화면을 띄움
        signIn();
    }

});

// 홈 콘텐츠 로드 함수
function loadHomeContent() {
    const contentDiv = document.getElementById('load-content');
    contentDiv.innerHTML = `
        <h2>홈 화면</h2>
        <p>환영합니다! 운동 기록을 시작하세요.</p>
        <button id="logout">로그아웃</button>
    `;

    // 로그아웃 처리
    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken'); // 토큰 제거
        window.location.reload(); // 페이지 새로고침으로 로그인 화면 표시
    });
}
