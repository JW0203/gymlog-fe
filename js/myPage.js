import { signIn } from "./signIn.js";
import { clearContent, isAuthenticated } from "./common-functions.js";
import {apiUrl} from "./config.js";

// 마이 페이지 버튼 클릭 시 처리
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('my-page').addEventListener('click', async () => {
        const contentDiv = document.getElementById('load-content');
        clearContent(contentDiv);

        if (isAuthenticated()) {
            // 토큰이 있으면 바로 사용자 정보를 표시
            await showUserInfo();
        } else {
            // 토큰이 없으면 로그인 화면을 먼저 보여줌
            signIn();
        }
    });
})

// 사용자 정보를 보여주는 함수
async function showUserInfo() {
    const contentDiv = document.getElementById('load-content');
    clearContent(contentDiv);

    try {
        const response = await fetch(`${apiUrl}/users/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('사용자 정보를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        const workoutLogs = await getUsersAllWorkoutInfo();

        // 사용자 정보 및 운동 기록 화면 구성
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info-container';
        userInfoDiv.innerHTML = `
            <h2>마이 페이지</h2>
            <p><strong>이메일:</strong> ${data.email}</p>
            <p><strong>이름:</strong> ${data.name}</p>
            <p><strong>가입일:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            <p>-----------</p>
            <p><strong>운동기록:</strong></p>
            <pre>${JSON.stringify(workoutLogs, null, 2)}</pre>
            <button id="delete-user-btn" class="delete-button">유저 삭제</button>
        `;
        contentDiv.appendChild(userInfoDiv);

        // 계정 삭제 버튼 처리
        document.getElementById('delete-user-btn').addEventListener('click', deleteAccount);
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
    }
}

// 운동 기록 정보를 가져오는 함수
async function getUsersAllWorkoutInfo() {
    const response = await fetch(`${apiUrl}/workout-logs/user`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('운동 기록을 불러오는 데 실패했습니다.');
    }

    return await response.json();
}

// 계정 삭제 함수
async function deleteAccount() {
    try {
        const response = await fetch(`${apiUrl}/users/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 204) {
            localStorage.removeItem('accessToken');
            alert('계정이 삭제되었습니다.');
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('계정 삭제 중 에러가 발생했습니다.:', error);
    }
}


// import { signIn } from "./signIn.js";
// import {clearContent, isAuthenticated} from "./common-functions.js";  // signIn 함수를 불러옴
//
// const apiUrl = 'http://localhost:3000';
//
//
// // 마이 페이지 버튼 클릭 시 처리
// document.getElementById('my-page').addEventListener('click', async () => {
//     const contentDiv = document.getElementById('load-content');
//     clearContent(contentDiv);
//
//     if (isAuthenticated()) {
//         // 토큰이 있으면 바로 루틴 기록 화면을 보여줌
//         await showUserInfo();
//     } else {
//         // 토큰이 없으면 로그인 화면을 먼저 보여줌
//         await signIn(async () => {
//             // 로그인 성공 시 콜백으로 loadRoutineForm 호출
//             const newToken = localStorage.getItem('accessToken');
//             if (newToken) {
//                 console.log('토큰 확인:', newToken);
//                 clearContent(contentDiv);
//                 await showUserInfo();  // 로그인 성공 후 루틴 기록 화면 로딩
//             }
//             else{ console.log('no token')}
//         });
//     }
//     // const contentDiv = document.getElementById('load-content');
//     // clearContent(contentDiv);
//     //
//     // if (!isAuthenticated()) {
//     //     //토큰이 없으면 로그인 화면을 보여줌
//     //     signIn(async () => {
//     //         // 로그인 성공 시 콜백으로 showUserInfo 호출
//     //         const newToken = localStorage.getItem('accessToken');
//     //         if (newToken) {
//     //             clearContent(document.getElementById('load-content'));
//     //             await showUserInfo();
//     //         }
//     //     });
//     // } else {
//     //     // 토큰이 있으면 유저 정보를 보여줌
//     //     await showUserInfo();
//     // }
// });
//
// // document.addEventListener('loginSuccess', async () => {
// //     const contentDiv = document.getElementById('load-content');
// //
// //     // 기존 콘텐츠 제거
// //     while (contentDiv.firstChild) {
// //         contentDiv.removeChild(contentDiv.firstChild);
// //     }
// //
// //     if (localStorage.getItem('accessToken')) {
// //         await showUserInfo();  // 로그인 후 유저 정보 표시
// //     }
// // });
//
//
//
// // 계정 삭제 함수
// async function deleteAccount() {
//     try {
//     } catch (error) {
//         console.error('계정 삭제 중 에러가 발생했습니다.:', error);
//     }
// }
//
// // 유저의 운동 기록을 불러오는 함수
// async function getUsersAllWorkoutInfo() {
//     try {
//         const response = await fetch(`${apiUrl}/workout-logs/user`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//             },
//         });
//         if (!response.ok) {
//             throw new Error('운동 기록을 불러오는 데 실패했습니다.');
//         }
//         return await response.json();  // 운동 기록 데이터를 반환
//     } catch (error) {
//         console.error('유저의 운동기록을 검색하는 중 에러가 발생했습니다.:', error);
//         throw error;  // 에러가 발생하면 예외를 던짐
//     }
// }
//
//
// // 사용자 정보를 보여주는 함수
// async function showUserInfo() {
//     console.log('유저 정보 화면 로딩 시작');
//
//     const contentDiv = document.getElementById('load-content');
//     while (contentDiv.firstChild) {
//         contentDiv.removeChild(contentDiv.firstChild);
//     }
//     try {
//         const response = await fetch(`${apiUrl}/users/`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//
//         if (!response.ok) {
//             throw new Error('사용자 정보를 불러오는 데 실패했습니다.');
//         }
//
//         const data = await response.json();
//         const workoutLogs = await getUsersAllWorkoutInfo();  // 운동 기록을 가져옴
//
//         // 사용자 정보 및 운동 기록 화면 구성
//         const userInfoDiv = document.createElement('div');
//         userInfoDiv.className = 'user-info-container';
//         userInfoDiv.innerHTML = `
//             <h2>마이 페이지</h2>
//             <p><strong>이메일:</strong> ${data.email}</p>
//             <p><strong>이름:</strong> ${data.name}</p>
//             <p><strong>가입일:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
//             <p>-----------</p>
//             <p><strong>운동기록:</strong></p>
//             <pre>${JSON.stringify(workoutLogs, null, 2)}</pre>
//             <button id="delete-user-btn" class="delete-button">유저 삭제</button>
//         `;
//         contentDiv.appendChild(userInfoDiv);
//
//         // 계정 삭제 버튼 처리
//         document.getElementById('delete-user-btn').addEventListener('click', deleteAccount);
//     } catch (error) {
//         console.error('사용자 정보 로드 실패:', error);
//         alert('사용자 정보를 불러오는 데 실패했습니다.');
//     }
// }