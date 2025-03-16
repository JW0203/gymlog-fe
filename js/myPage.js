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
            alert('사용자 정보를 불러오는 데 실패했습니다.');
            throw new Error('사용자 정보를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        const workoutLogs = await getUsersAllWorkoutInfo();
        // const groupedWorkoutLogs = groupWorkoutDataByCategory(workoutLogs);

        // 사용자 정보 및 운동 기록 화면 구성
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info-container';
        userInfoDiv.innerHTML = `
            <h2>마이 페이지</h2>
            <p><strong>이메일:</strong> ${data.email}</p>
            <p><strong>닉네임:</strong> ${data.nickName}</p>
            <p><strong>가입일:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            <p><strong>운동기록:</strong></p>
        `;

        // const workoutTable = renderWorkoutLogsTable(groupedWorkoutLogs);
        const workoutTable = renderWorkoutLogsTable(workoutLogs);
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

// 운동 기록을 표로 변환
function renderWorkoutLogsTable(workoutLogs) {
    const aggregatedData = workoutLogs.aggregatedData;
    // 테이블 생성
    const table = document.createElement("table");
    table.classList.add("analysis-workoutLogs");
    table.style.borderCollapse = "collapse";
    table.style.textAlign = "center";

    // 헤더 행 추가
    const headerRow = document.createElement("tr");
    ["Year", "Month", "Body Part", "Exercise Name", "Max Weight", "Total set"].forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.padding = "8px";
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 각 계층별로 반복 처리
    for (const year in aggregatedData) {
        const months = aggregatedData[year];

        // 현재 연도에 해당하는 전체 행 수 계산 (하위 Exercise 단위)
        let yearRowSpan = 0;
        for (const month in months) {
            const bodyParts = months[month];
            for (const bodyPart in bodyParts) {
                const exercises = bodyParts[bodyPart];
                for (const exercise in exercises) {
                    yearRowSpan++;
                }
            }
        }
        let isYearFirstRow = true;

        // Month 반복
        for (const month in months) {
            const bodyParts = months[month];

            // 현재 월에 해당하는 전체 행 수 계산
            let monthRowSpan = 0;
            for (const bodyPart in bodyParts) {
                const exercises = bodyParts[bodyPart];
                for (const exercise in exercises) {
                    monthRowSpan++;
                }
            }
            let isMonthFirstRow = true;

            // Body Part 반복
            for (const bodyPart in bodyParts) {
                const exercises = bodyParts[bodyPart];
                // 각 운동 반복
                for (const exercise in exercises) {
                    const { maxWeight, totalSet } = exercises[exercise];
                    const row = document.createElement("tr");

                    // 연도 셀 (첫 행에만 추가, rowspan 사용)
                    if (isYearFirstRow) {
                        const tdYear = document.createElement("td");
                        tdYear.textContent = year;
                        tdYear.rowSpan = yearRowSpan;
                        tdYear.style.padding = "8px";
                        row.appendChild(tdYear);
                        isYearFirstRow = false;
                    }

                    // 월 셀 (해당 월의 첫 행에만 추가, rowspan 사용)
                    if (isMonthFirstRow) {
                        const tdMonth = document.createElement("td");
                        tdMonth.textContent = month;
                        tdMonth.rowSpan = monthRowSpan;
                        tdMonth.style.padding = "8px";
                        row.appendChild(tdMonth);
                        isMonthFirstRow = false;
                    }

                    // Body Part 셀
                    const tdBodyPart = document.createElement("td");
                    tdBodyPart.textContent = bodyPart;
                    tdBodyPart.style.padding = "8px";
                    row.appendChild(tdBodyPart);

                    // Exercise Name 셀
                    const tdExercise = document.createElement("td");
                    tdExercise.textContent = exercise;
                    tdExercise.style.padding = "8px";
                    row.appendChild(tdExercise);

                    // Max Weight 셀
                    const tdMaxWeight = document.createElement("td");
                    tdMaxWeight.textContent = maxWeight;
                    tdMaxWeight.style.padding = "8px";
                    row.appendChild(tdMaxWeight);

                    // Total set 셀
                    const tdTotalSet = document.createElement("td");
                    tdTotalSet.textContent = totalSet;
                    tdTotalSet.style.padding = "8px";
                    row.appendChild(tdTotalSet);

                    table.appendChild(row);
                }
            }
        }
    }

    return table;
}