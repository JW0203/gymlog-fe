import {apiUrl} from "./config.js";
export function signUpForm() {
	document.getElementById('sign-up').addEventListener('click', function(){
	const contentDiv = document.getElementById('load-content');

	// load-content 내의 모든 기존 폼 제거
	while (contentDiv.firstChild) {
		contentDiv.removeChild(contentDiv.firstChild);
	}

	// 새로운 div 생성 및 회원가입 폼 추가
	const signUpDiv = document.createElement('div');
	signUpDiv.id = 'sign-up-form';
	signUpDiv.innerHTML = `
		<h2>회원가입</h2>
		<form id="sign-up-form">
			<label for="username">사용자 이름:</label>
			<input type="text" id="username" name="username" required>
			<span id="name-error" class="error-message"></span><br>

			<label for="email">이메일:</label>
			<input type="email" id="email" name="email" required>
			<span id="email-error" class="error-message"></span><br>

			<label for="password">비밀번호:</label>
			<input type="password" id="password" name="password" required>
			<span id="password-error" class="error-message"></span><br>

			<label for="confirm-password">비밀번호 확인:</label>
			<input type="password" id="confirm-password" name="confirm-password" required>
			<span id="confirm-password-error" class="error-message"></span><br>

			<button type="submit">가입하기</button>
		</form>
	`;

	// 새로운 div를 load-content에 추가
	contentDiv.appendChild(signUpDiv);

	// 폼 제출 시 유효성 검사
	const form = document.getElementById('sign-up-form');
	form.addEventListener('submit', async function(event) {
		// 오류 메시지 초기화
		document.getElementById('name-error').textContent = '';
		document.getElementById('email-error').textContent = '';
		document.getElementById('password-error').textContent = '';
		document.getElementById('confirm-password-error').textContent = '';

		// 유효성 검사 로직
		let hasError = false;

		// 이름 유효성 검사
		const username = document.getElementById('username').value;
		const usernamePattern = /^[가-힣a-zA-Z0-9]+$/;
		if (username.length < 2 || username.length > 15) {
			document.getElementById('name-error').textContent = '이름은 2자에서 15자 사이여야 합니다.';
			hasError = true;
		} else if (!usernamePattern.test(username)) {
			document.getElementById('name-error').textContent = '이름은 영문자와 숫자만 사용할 수 있습니다.';
			hasError = true;
		}

		// 이메일 유효성 검사
		const email = document.getElementById('email').value;
		const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
		if (!emailRegex.test(email)) {
			document.getElementById('email-error').textContent = '이메일 형식이 올바르지 않습니다.';
			hasError = true;
		}

		// 비밀번호 유효성 검사
		const password = document.getElementById('password').value;
		if (password.length < 8 || password.length > 1000) {
			document.getElementById('password-error').textContent = '비밀번호는 8자에서 1000자 사이여야 합니다.';
			hasError = true;
		} else if (/\s/.test(password)) {
			document.getElementById('password-error').textContent = '비밀번호는 공백을 포함할 수 없습니다.';
			hasError = true;
		}

		// 비밀번호 확인 검사
		const confirmPassword = document.getElementById('confirm-password').value;
		if (password !== confirmPassword) {
			document.getElementById('confirm-password-error').textContent = '비밀번호가 일치하지 않습니다.';
			hasError = true;
		}

		// 오류가 있으면 폼 제출 막기
		if (hasError) {
			event.preventDefault();
		}

		const signUpData = {
			name: username,
			email: email,
			password: password,
		};

		const url =`${apiUrl}/users`;
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(signUpData),
			});

			if (!response.ok) {
				throw new Error('회원가입 실패');
			}

			const result = await response.json();
			console.log('백엔드로부터 받은 응답:', result);

			// 성공 시 사용자에게 알림 또는 다른 동작 수행
			alert('회원가입이 성공적으로 완료되었습니다!');

		} catch (error) {
			console.error('회원가입 중 오류 발생:', error);
			event.preventDefault();
		}
	});
})
}


//
//
// document.addEventListener('DOMContentLoaded', function() {
// 	const apiUrl = 'http://localhost:3000';
// 	document.getElementById('sign-up').addEventListener('click', function() {
// 		const contentDiv = document.getElementById('load-content');
//
// 		// load-content 내의 모든 기존 폼 제거
// 		while (contentDiv.firstChild) {
// 			contentDiv.removeChild(contentDiv.firstChild);
// 		}
//
//
// 		// 새로운 div 생성 및 회원가입 폼 추가
// 		const signUpDiv = document.createElement('div');
// 		signUpDiv.id = 'sign-up-form';
// 		signUpDiv.innerHTML = `
//             <h2>회원가입</h2>
//             <form id="sign-up-form-element">
//                 <label for="username">사용자 이름:</label>
//                 <input type="text" id="username" name="username" required>
//                 <span id="name-error" class="error-message"></span><br>
//
//                 <label for="email">이메일:</label>
//                 <input type="email" id="email" name="email" required>
//                 <span id="email-error" class="error-message"></span><br>
//
//                 <label for="password">비밀번호:</label>
//                 <input type="password" id="password" name="password" required>
//                 <span id="password-error" class="error-message"></span><br>
//
//                 <label for="confirm-password">비밀번호 확인:</label>
//                 <input type="password" id="confirm-password" name="confirm-password" required>
//                 <span id="confirm-password-error" class="error-message"></span><br>
//
//                 <button type="submit">가입하기</button>
//             </form>
//         `;
//
// 		// 새로운 div를 load-content에 추가
// 		contentDiv.appendChild(signUpDiv);
//
// 		// 폼 제출 시 유효성 검사
// 		const form = document.getElementById('sign-up-form-element');
// 		form.addEventListener('submit', async function(event) {
// 			// 오류 메시지 초기화
// 			document.getElementById('name-error').textContent = '';
// 			document.getElementById('email-error').textContent = '';
// 			document.getElementById('password-error').textContent = '';
// 			document.getElementById('confirm-password-error').textContent = '';
//
// 			// 유효성 검사 로직
// 			let hasError = false;
//
// 			// 이름 유효성 검사
// 			const username = document.getElementById('username').value;
// 			const usernamePattern = /^[가-힣a-zA-Z0-9]+$/;
// 			if (username.length < 2 || username.length > 15) {
// 				document.getElementById('name-error').textContent = '이름은 2자에서 15자 사이여야 합니다.';
// 				hasError = true;
// 			} else if (!usernamePattern.test(username)) {
// 				document.getElementById('name-error').textContent = '이름은 영문자와 숫자만 사용할 수 있습니다.';
// 				hasError = true;
// 			}
//
// 			// 이메일 유효성 검사 (기본 HTML5 email 필드로 처리 가능)
// 			const email = document.getElementById('email').value;
// 			const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
// 			const specialChars = /[!#$%&'*+/=?^_`{|}~-]/;
//
// 			let emailError = '';
// 			let localPart = '';
//
// 			if (!emailRegex.test(email)) {
// 				emailError = '이메일 형식이 올바르지 않습니다. 표준 이메일 형식(user@example.com)을 따라야 합니다.';
// 			} else {
// 				localPart = email.split('@')[0];
//
// 				// 첫 번째 또는 마지막 문자가 특수 문자인지 확인
// 				if (specialChars.test(localPart[0]) || specialChars.test(localPart[localPart.length - 1])) {
// 					emailError = '이메일이 유효하지 않습니다. 특수 문자는 이메일 주소의 첫 번째 또는 마지막 문자로 나타날 수 없습니다.';
// 				}
//
// 				// 연속된 특수 문자가 있는지 확인
// 				for (let i = 0; i < localPart.length - 1; i++) {
// 					if (specialChars.test(localPart[i]) && specialChars.test(localPart[i + 1])) {
// 						emailError = '이메일이 유효하지 않습니다. 특수 문자가 두 번 이상 연속해서 나타날 수 없습니다.';
// 						break;
// 					}
// 				}
// 			}
//
// 			if (emailError) {
// 				document.getElementById('email-error').textContent = emailError;
// 				hasError = true;
// 			}
//
// 			// 비밀번호 유효성 검사
// 			const password = document.getElementById('password').value;
// 			if (password.length < 8 || password.length > 1000) {
// 				document.getElementById('password-error').textContent = '비밀번호는 8자에서 1000자 사이여야 합니다.';
// 				hasError = true;
// 			} else if (/\s/.test(password)) {
// 				document.getElementById('password-error').textContent = '비밀번호는 공백을 포함할 수 없습니다.';
// 				hasError = true;
// 			}
//
// 			// 비밀번호 확인 검사
// 			const confirmPassword = document.getElementById('confirm-password').value;
// 			if (password !== confirmPassword) {
// 				document.getElementById('confirm-password-error').textContent = '비밀번호가 일치하지 않습니다.';
// 				hasError = true;
// 			}
//
// 			// 오류가 있으면 폼 제출 막기
// 			if (hasError) {
// 				event.preventDefault();
// 			}
//
// 			const signUpData = {
// 				name: username,
// 				email: email,
// 				password: password,
// 			};
//
// 			const url =`${apiUrl}/users`;
// 			console.log(signUpData);
// 			try {
// 				const response = await fetch(url, {
// 					method: 'POST',
// 					headers: {
// 						'Content-Type': 'application/json',
// 					},
// 					body: JSON.stringify(signUpData),
// 				});
//
// 				if (!response.ok) {
// 					throw new Error('회원가입 실패');
// 				}
//
// 				const result = await response.json();
// 				console.log('백엔드로부터 받은 응답:', result);
//
// 				// 성공 시 사용자에게 알림 또는 다른 동작 수행
// 				alert('회원가입이 성공적으로 완료되었습니다!');
//
// 			} catch (error) {
// 				console.error('회원가입 중 오류 발생:', error);
// 				// alert('회원가입에 실패했습니다.');
// 				event.preventDefault();
// 			}
// 		});
// 	});
// });
