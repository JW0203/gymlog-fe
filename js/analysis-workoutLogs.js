import { signIn } from "./signIn.js";
import { clearContent, isAuthenticated } from "./common-functions.js";
import {apiUrl} from "./config.js";


// 페이지 로드 후 기능 실행
document.addEventListener('DOMContentLoaded', function () {
	// 운동 기록 분석 버튼 클릭 시 UI 주입 및 CSS 파일 추가
	document.getElementById('analysis-workout-logs').addEventListener('click', async function () {
		// loadStylesheet('./css/styles-analysis-workoutlogs.css');  // CSS 파일 추가

		if (isAuthenticated()) {
			// 토큰이 있으면 운동 기록 분석 UI 주입
			await injectAnalysisUI();
		} else {
			// 토큰이 없으면 로그인 화면을 먼저 보여줌
			signIn();
		}
	});

	// 홈 버튼 클릭 시 스타일 제거 및 콘텐츠 초기화
	// document.getElementById('home').addEventListener('click', function () {
	// 	// removeStylesheet('./css/styles-analysis-workoutlogs.css');  // CSS 파일 제거
	// 	document.getElementById('load-content').innerHTML = ''; // 콘텐츠 초기화
	// });
});


// 오늘 날짜를 가져오는 함수
function isToday(date) {
	const today = new Date();
	return date.toDateString() === today.toDateString();
}

// 선택한 날짜의 주를 계산하여 배열로 반환하는 함수
function getWeekDates(selectedDate) {
	const currentDay = selectedDate.getDay();
	const startOfWeek = new Date(selectedDate);
	const dayDifference = currentDay === 0 ? 6 : currentDay - 1;
	startOfWeek.setDate(selectedDate.getDate() - dayDifference);

	const week = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date(startOfWeek);
		date.setDate(startOfWeek.getDate() + i);
		week.push(date);
	}
	return week;
}

// 선택한 날짜의 달을 계산하여 배열로 반환하는 함수
function getMonthDates(selectedDate) {
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const monthDates = [];

	for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
		monthDates.push(new Date(year, month, day));
	}

	return monthDates;
}

// 날짜 형식 변환 (예: 9월 5일 목요일)
function formatDate(date) {
	return date.toLocaleDateString('ko-KR', {
		month: 'long',
		day: 'numeric',
		weekday: 'long'
	});
}

// 선택한 날짜를 마크하고 해당 날짜의 운동 기록을 표시하는 함수
async function selectDay(selectedDate, dayDiv) {
	const accessToken = localStorage.getItem('accessToken');
	if (!accessToken) {
		alert('로그인이 필요합니다.');
		return;
	}

	const formattedDate = selectedDate.toISOString().split('T')[0];  // YYYY-MM-DD 형식

	// 기존 선택된 날짜의 마크 제거
	document.querySelectorAll('#calendar-content .day').forEach(day => {
		day.style.fontWeight = 'normal';
		day.style.color = 'black';
	});

	// 선택된 날짜에 스타일 추가
	dayDiv.style.fontWeight = 'bold';
	dayDiv.style.color = 'blue';
	try {
		// 백엔드로 요청 보내기
		const response = await fetch(`${apiUrl}/workout-logs?date=${formattedDate}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,  // 인증 토큰 추가
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error('운동 기록을 불러오지 못했습니다.');
		}

		const workoutData = await response.json();
		renderWorkoutRecords(workoutData, formattedDate);
	} catch (error) {
		console.error('운동 기록 조회 중 오류 발생:', error);
		alert('운동 기록을 불러오는 중 오류가 발생했습니다.');
	}
}

// 주별 날짜를 렌더링하는 함수
function renderWeek(selectedDate){
	const calendarContent = document.getElementById('calendar-content');
	const recordsDiv = document.getElementById('exercise-records');
	calendarContent.innerHTML = '';  // 기존 콘텐츠 제거
	recordsDiv.innerHTML = '';  // 기존 기록 초기화
	calendarContent.classList.add('week-grid');  // 주간 그리드 적용

	const weekDates = getWeekDates(selectedDate);

	weekDates.forEach(date => {
		const dayDiv = document.createElement('div');
		dayDiv.classList.add('day');
		dayDiv.textContent = formatDate(date);  // 9월 5일 목요일 형식

		if (isToday(date)) {
			dayDiv.classList.add('today');
		}

		dayDiv.addEventListener('click', () => {
			selectDay(date, dayDiv);
		});

		calendarContent.appendChild(dayDiv);
	});
}

// 월별 달력을 렌더링하는 함수
function renderMonth(selectedDate){
	const calendarHeader = document.getElementById('calendar-header');
	const calendarContent = document.getElementById('calendar-content');
	const recordsDiv = document.getElementById('exercise-records');

	// 먼저 달을 헤더에 표시
	const year = selectedDate.getFullYear();
	const month = selectedDate.toLocaleString('ko-KR', { month: 'long' });
	calendarHeader.innerHTML = `<h3>${year}년 ${month}</h3>`;

	calendarContent.innerHTML = '';  // 기존 콘텐츠 제거
	recordsDiv.innerHTML = '';  // 기존 기록 초기화
	calendarContent.classList.add('month-grid');  // 월간 그리드 적용

	const monthDates = getMonthDates(selectedDate);
	const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();  // 해당 달의 첫 번째 날의 요일

	// 해당 월의 첫 번째 날의 요일 전까지 빈 칸 추가
	for (let i = 0; i < firstDayOfMonth; i++) {
		const emptyDiv = document.createElement('div');
		calendarContent.appendChild(emptyDiv);
	}
	// 각 날짜 렌더링
	monthDates.forEach(date => {
		const dayDiv = document.createElement('div');
		dayDiv.classList.add('day');
		dayDiv.textContent = date.getDate();  // 1, 2, 3, ... 형식으로 날짜만 표시

		if (isToday(date)) {
			dayDiv.classList.add('today');
		}

		dayDiv.addEventListener('click', () => {
			selectDay(date, dayDiv);
		});

		calendarContent.appendChild(dayDiv);
	});
}

// 운동 기록 분석 UI를 주입하는 함수
function injectAnalysisUI() {
	const contentDiv = document.getElementById('load-content');
	clearContent(contentDiv);
	contentDiv.innerHTML = `
        <h2>운동 기록 분석</h2>
        <label for="view-select">보기 옵션:</label>
        <select id="view-select" style="margin-bottom: 20px; padding: 10px; font-size: 1.1em; border: 1px solid #ccc; border-radius: 4px; width: 150px;">
            <option value="week">주</option>
            <option value="month">달</option>
        </select>
        
        <!-- 달 선택 드롭다운 기본적으로 숨김 -->
        <div id="month-select-container" style="display: none;">
            <label for="month-select">달 선택:</label>
            <select id="month-select" style="margin-left: 10px; padding: 10px; font-size: 1.1em; border: 1px solid #ccc; border-radius: 4px; width: 150px;">
                <option value="0">1월</option>
                <option value="1">2월</option>
                <option value="2">3월</option>
                <option value="3">4월</option>
                <option value="4">5월</option>
                <option value="5">6월</option>
                <option value="6">7월</option>
                <option value="7">8월</option>
                <option value="8">9월</option>
                <option value="9">10월</option>
                <option value="10">11월</option>
                <option value="11">12월</option>
            </select>
        </div>
        
        <div id="calendar-header"></div>
        <div id="calendar-content" class="calendar"></div>
        <div id="exercise-records" class="exercise-records"></div>
    `;

	const selectedDate = new Date();  // 오늘 날짜
	const workoutLogs = {
		'2024-09-29': '상체 운동 - 벤치프레스, 덤벨 플라이',
		'2024-09-30': '하체 운동 - 스쿼트, 레그 프레스',
		'2024-10-01': '상체 운동 - 풀업, 덤벨 숄더 프레스',
	};  // 날짜별 운동 기록 예시 데이터

	// 디폴트로 오늘에 해당하는 달을 선택
	const monthSelect = document.getElementById('month-select');
	monthSelect.value = selectedDate.getMonth();

	// 옵션 선택 시 주/달 렌더링과 달 선택 UI 보이기/숨기기
	const viewSelect = document.getElementById('view-select');
	viewSelect.addEventListener('change', () => {
		if (viewSelect.value === 'week') {
			document.getElementById('month-select-container').style.display = 'none';  // 달 선택 숨김
			renderWeek(selectedDate, workoutLogs);
		} else if (viewSelect.value === 'month') {
			document.getElementById('month-select-container').style.display = 'block';  // 달 선택 표시
			renderMonth(selectedDate, workoutLogs);  // 선택된 달 렌더링
		}
	});

	// 달 선택 시 선택된 달을 렌더링
	monthSelect.addEventListener('change', () => {
		const selectedMonth = parseInt(monthSelect.value, 10);
		selectedDate.setMonth(selectedMonth);  // 선택된 달로 날짜 업데이트
		renderMonth(selectedDate, workoutLogs);  // 선택된 달 렌더링
	});

	// 기본적으로 주 렌더링
	renderWeek(selectedDate, workoutLogs);
}

function renderWorkoutRecords(workoutData, date) {
	const recordsDiv = document.getElementById('exercise-records');
	recordsDiv.innerHTML = `<h3>${date} 운동 기록</h3>`;

	if (workoutData.length === 0) {
		recordsDiv.innerHTML += '<p>기록된 운동이 없습니다.</p>';
		return;
	}

	// 운동 기록을 렌더링하면서 체크박스 추가
	workoutData.forEach(record => {
		const recordDiv = document.createElement('div');
		recordDiv.classList.add('workout-record');

		// 운동 기록 표시 및 체크박스 추가
		recordDiv.innerHTML = `
            <input type="checkbox" class="delete-checkbox" data-id="${record.id}"> <!-- 체크박스 추가 -->
            <p><strong>부위:</strong> ${record.exercise.bodyPart}</p>
            <p><strong>운동이름:</strong> ${record.exercise.exerciseName}</p>
            <p><strong>세트 수:</strong> ${record.setCount}</p>
            <p><strong>무게:</strong> ${record.weight} kg</p>
            <p><strong>반복 횟수:</strong> ${record.repeatCount} 회</p>
            <p>---------------</p>
        `;

		recordsDiv.appendChild(recordDiv); // 기록을 화면에 추가
	});

	// 삭제 버튼 추가
	const deleteButton = document.createElement('button');
	deleteButton.textContent = '선택한 운동 삭제';
	deleteButton.addEventListener('click', async () => handleDeleteSelectedWorkouts(workoutData, date));
	recordsDiv.appendChild(deleteButton);
}

async function handleDeleteSelectedWorkouts(workoutData, date) {
	// 체크된 체크박스에서 선택된 운동의 id 수집
	const selectedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
	const selectedIds = Array.from(selectedCheckboxes).map(checkbox => parseInt(checkbox.getAttribute('data-id'), 10));

	if (selectedIds.length > 0) {
		await deleteWorkout(selectedIds, workoutData, date);  // 선택된 id 리스트를 삭제 함수로 전달
	} else {
		alert('삭제할 운동을 선택하세요.');
	}
}

async function deleteWorkout(selectedIds, workoutData, date) {
	try {
		// 백엔드로 요청 보내기
		const response = await fetch(`${apiUrl}/workout-logs`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,  // 인증 토큰 추가
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ids:selectedIds}),
		});

		if (!response.ok) {
			const errorMessage = await response.json();
			throw new Error(`운동 기록을 삭제하지 못했습니다: ${errorMessage.message || '알 수 없는 오류'}`);
		}

		const updatedData = workoutData.filter(record => !selectedIds.includes(record.id));
		console.log(updatedData);
		// 삭제 후, 기록을 다시 렌더링
		await renderWorkoutRecords(updatedData, date);

	} catch (error) {
		console.error('운동 기록 삭제 중 오류 발생:', error);
		alert('운동 기록을 삭제하는 중 오류가 발생했습니다.');
	}
}