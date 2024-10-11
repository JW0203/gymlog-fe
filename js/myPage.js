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
        const response = await fetch(`${apiUrl}/users/my`, {
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
        const groupedWorkoutLogs = groupWorkoutDataByCategory(workoutLogs);

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
        `;

        const workoutTable = renderWorkoutLogsTable(groupedWorkoutLogs);
        userInfoDiv.appendChild(workoutTable);

        const deleteButton = document.createElement('button');
        deleteButton.id = 'delete-user-btn';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '유저 삭제';
        userInfoDiv.appendChild(deleteButton);

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

function groupWorkoutDataByCategory(responseData) {
    // 신체 부위별로 그룹화된 데이터를 저장할 객체
    const groupedData = {};

    // 신체 부위별로 데이터를 순회하여 연도별 및 월별 데이터를 그룹화
    responseData.uniqueBodyParts.forEach((bodyPart) => {
        groupedData[bodyPart] = {};

        // 연도별 및 월별 데이터 결합하여 그룹화
        Object.keys(responseData.aggregatedData.year).forEach((year) => {
            const exercisesInYear = responseData.aggregatedData.year[year][bodyPart];
            if (exercisesInYear) {
                Object.keys(exercisesInYear).forEach((exerciseName) => {
                    if (!groupedData[bodyPart][exerciseName]) {
                        groupedData[bodyPart][exerciseName] = {};
                    }
                    groupedData[bodyPart][exerciseName][year] = {
                        sets: exercisesInYear[exerciseName],
                        months: {}
                    };
                });
            }
        });

        // 월별 데이터 그룹화하여 연도와 결합
        Object.keys(responseData.aggregatedData.month).forEach((month) => {
            const exercisesInMonth = responseData.aggregatedData.month[month][bodyPart];
            if (exercisesInMonth) {
                Object.keys(exercisesInMonth).forEach((exerciseName) => {
                    // 연도와 월을 결합하여 저장
                    Object.keys(groupedData[bodyPart][exerciseName] || {}).forEach((year) => {
                        if (groupedData[bodyPart][exerciseName][year]) {
                            groupedData[bodyPart][exerciseName][year].months[month] = exercisesInMonth[exerciseName];
                        }
                    });
                });
            }
        });
    });

    return groupedData;
}

// 운동 기록을 표로 변환
function renderWorkoutLogsTable(groupedWorkoutLogs) {
    const table = document.createElement('table');
    table.className = 'my-page-workout-logs-table';

    // 테이블 헤더 추가
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.innerHTML = `
        <th>연도</th>
        <th>월</th>
        <th>신체 부위</th>
        <th>운동 이름</th>
        <th>세트/횟수</th>
    `;

    // 테이블 바디 생성
    const tbody = table.createTBody();

    // 신체 부위별로 데이터 순회
    Object.keys(groupedWorkoutLogs).forEach((bodyPart) => {
        const exercises = groupedWorkoutLogs[bodyPart];

        // 운동별로 순회
        Object.keys(exercises).forEach((exerciseName) => {
            const years = exercises[exerciseName];

            // 연도별로 순회
            Object.keys(years).forEach((year) => {
                const yearData = years[year];
                const sets = yearData.sets;

                // 월별 데이터가 있는 경우, 연도와 함께 출력
                if (Object.keys(yearData.months).length > 0) {
                    Object.keys(yearData.months).forEach((month) => {
                        const monthSets = yearData.months[month];
                        const row = tbody.insertRow();
                        row.innerHTML = `
                            <td>${year}</td>
                            <td>${month}</td>
                            <td>${bodyPart}</td>
                            <td>${exerciseName}</td>
                            <td>${monthSets.join(', ')}</td> <!-- 월별 세트 표시 -->
                        `;
                    });
                } else {
                    // 월 데이터가 없을 경우 연도만 표시
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${year}</td>
                        <td>-</td> <!-- 월 데이터가 없을 경우 -->
                        <td>${bodyPart}</td>
                        <td>${exerciseName}</td>
                        <td>${sets.join(', ')}</td> <!-- 세트/횟수 표시 -->
                    `;
                }
            });
        });
    });

    return table;
}