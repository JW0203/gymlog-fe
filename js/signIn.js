import {signUpForm} from "./signUp.js";
import {clearContent, isAuthenticated} from "./common-functions.js";
import {apiUrl} from "./config.js";

export function signIn() {
	const contentDiv = document.getElementById('load-content');
	clearContent(contentDiv);  // 기존 컨텐츠 제거
	if (isAuthenticated()) {
		window.location.href = './index.html'; // 이미 로그인된 경우 메인 페이지로 이동
		return;
	}
	loadSignInForm(contentDiv);

	document.getElementById('sign-in-form').addEventListener('submit', (event) => handleSignInSubmit(event)); // 로그인 폼 제출
}

function loadSignInForm(contentDiv) {
	// 로그인 폼 생성
	const signInDiv = document.createElement('div');
	signInDiv.className = 'login-container';
	signInDiv.innerHTML = `
        <div class="sign-in-div">
            <h2>로그인</h2>
            <form id="sign-in-form">
                <label for="email">이메일:</label>
                <input type="email" id="email" name="email" required placeholder="이메일 입력">
                <span id="email-error" class="error-message"></span><br>

                <label for="password">비밀번호:</label>
                <input type="password" id="password" name="password" required placeholder="비밀번호 입력">
                <span id="password-error" class="error-message"></span><br>

                <span id="server-error" class="error-message"></span> <!-- 서버 오류 메시지 추가 -->
                <button type="submit" class="login-button">로그인</button>
            </form>
            <p>아직 계정이 없으신가요?</p>
            <button id="sign-up">회원가입</button> 
        </div>
    `;
	contentDiv.appendChild(signInDiv);

	// 스타일시트 로드
	// loadStylesheet('../css/styles-signIn.css');

	// 이벤트 리스너 등록// 회원가입 버튼
	document.getElementById('sign-in-form').addEventListener('submit',(event)=> handleSignInSubmit(event)); // 로그인 폼 제출

	document.getElementById('sign-up').addEventListener('click', function () { signUpForm(); });
}

async function handleSignInSubmit(event) {
	event.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	// 폼 유효성 검사
	if (!validateForm(email, password)) {
		return;
	}

	// 로그인 시도
	try {
		const result = await signInRequest(email, password);
		localStorage.setItem('accessToken', result.accessToken);
		alert('로그인 성공!');
		window.location.href = './index.html';

		// if (isAuthenticated()) {
		// 	window.location.href = './index.html'; // 이미 로그인된 경우 메인 페이지로 이동
		// }

	} catch (error) {
		document.getElementById('server-error').textContent = '로그인 실패: ' + error.message;
	}
}

function validateForm(email, password) {
	// 오류 메시지 초기화
	document.getElementById('email-error').textContent = '';
	document.getElementById('password-error').textContent = '';
	let isValid = true;

	// 이메일 유효성 검사
	const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
	if (!emailRegex.test(email)) {
		document.getElementById('email-error').textContent = '이메일 형식이 올바르지 않습니다.';
		isValid = false;
	}

	// 비밀번호 유효성 검사
	if (password.length < 8 || password.length > 1000 || /\s/.test(password)) {
		document.getElementById('password-error').textContent = '비밀번호는 8자에서 1000자 사이여야 하며 공백을 포함할 수 없습니다.';
		isValid = false;
	}

	return isValid;
}

async function signInRequest(email, password) {
	const url = `${apiUrl}/users/sign-in`;
	const signInData = { email, password };

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(signInData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || '로그인 실패');
	}

	return response.json();
}