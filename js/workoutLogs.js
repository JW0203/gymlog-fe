import { signIn } from "./signIn.js";
import { isAuthenticated, clearContent } from "./common-functions.js";
import {apiUrl} from "./config.js";

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('recording-workout-logs').addEventListener('click', async function() {
		if (isAuthenticated()) {
			// 토큰이 있으면 운동 기록 화면을 보여줌
			await loadWorkoutLogsForm();
		} else {
			// 토큰이 없으면 로그인 화면을 먼저 보여줌
			signIn();
		}
	});
});

// 운동 기록 화면을 로드하는 함수
function loadWorkoutLogsForm() {
	const loadContent = document.getElementById('load-content');
	clearContent(loadContent);

	loadContent.innerHTML = `
      <div class="container-recording-workout-logs">
<!--        <h2>운동 기록</h2>-->

        <div id="workout-container-area">
          <!-- 새로운 운동 컨테이너가 여기에 추가됩니다 -->
        </div>

        <button id="add-workout">운동 추가</button>
        <button id="save-workout">운동 저장</button>
      </div>
    `;
	document.getElementById("add-workout").addEventListener("click", addWorkout);
	document.getElementById("save-workout").addEventListener("click", saveWorkout);

}


// 운동 추가 함수
function addWorkout() {
	const workoutContainerArea = document.getElementById("workout-container-area");
	const workoutCount = workoutContainerArea.childElementCount + 1; // 운동 번호

	// 새로운 운동 컨테이너 생성
	const newWorkoutContainer = document.createElement("div");
	newWorkoutContainer.classList.add("workout-container");
	newWorkoutContainer.setAttribute("id", `workout-${workoutCount}`);

	newWorkoutContainer.innerHTML = `
    <div class="inline-inputs">
      <select id="body-part-${workoutCount}">
        <option value="Back">등</option>
        <option value="Chest">가슴</option>
        <option value="Legs">다리</option>
        <option value="Arm">팔</option>
        <option value="Shoulders">어깨</option>
        <option value="Abs">배</option>
      </select>

      <div class="spacer"></div>

      <input type="text" id="exercise-name-${workoutCount}" placeholder="운동 이름 및 머신">
    </div>

    <ul class="set-list" id="set-list-${workoutCount}">
      <!-- 추가된 세트가 여기에 표시됩니다 -->
    </ul>

    <button class="add-set">세트 추가</button>
    <button class="delete-workout">운동 삭제</button>
  `;

	workoutContainerArea.appendChild(newWorkoutContainer);

	newWorkoutContainer.querySelector('.add-set').addEventListener('click', () => addSet(workoutCount));
	newWorkoutContainer.querySelector('.delete-workout').addEventListener('click', () => deleteWorkout(workoutCount));
}

// 운동 삭제 함수
// 운동 삭제 함수
function deleteWorkout(workoutId) {
	const workoutElement = document.getElementById(`workout-${workoutId}`);
	workoutElement.remove();

	// 운동 번호 재정렬
	const workouts = document.querySelectorAll('.workout-container');
	workouts.forEach((workout, index) => {
		// 운동 ID를 재설정
		workout.setAttribute('id', `workout-${index + 1}`);
		const selectElement = workout.querySelector('select');
		const inputElement = workout.querySelector('input');
		const setList = workout.querySelector('.set-list');

		// null 값 확인 후 setAttribute 실행
		if (selectElement) selectElement.setAttribute('id', `body-part-${index + 1}`);
		if (inputElement) inputElement.setAttribute('id', `exercise-name-${index + 1}`);
		if (setList) setList.setAttribute('id', `set-list-${index + 1}`);

		const addSetButton = workout.querySelector('.add-set');
		if (addSetButton) addSetButton.addEventListener('click', () => addSet(index + 1));

		const deleteWorkoutButton = workout.querySelector('.delete-workout');
		if (deleteWorkoutButton) deleteWorkoutButton.addEventListener('click', () => deleteWorkout(index + 1));
	});
}
//
// function deleteWorkout(workoutId) {
// 	const workoutElement = document.getElementById(`workout-${workoutId}`);
// 	workoutElement.remove();
//
// 	// 운동 번호 재정렬
// 	const workouts = document.querySelectorAll('.workout-container');
// 	workouts.forEach((workout, index) => {
// 		workout.setAttribute('id', `workout-${index + 1}`);
// 		const selectElement = workout.querySelector('select');
// 		const inputElement = workout.querySelector('input');
// 		const setList = workout.querySelector('.set-list');
//
// 		selectElement.setAttribute('id', `body-part-${index + 1}`);
// 		inputElement.setAttribute('id', `exercise-name-${index + 1}`);
// 		setList.setAttribute('id', `set-list-${index + 1}`);
//
// 		const addSetButton = workout.querySelector('button[onclick^="addSet"]');
// 		addSetButton.setAttribute('onclick', `addSet(${index + 1})`);
//
// 		const deleteWorkoutButton = workout.querySelector('button[onclick^="deleteWorkout"]');
// 		deleteWorkoutButton.setAttribute('onclick', `deleteWorkout(${index + 1})`);
// 	});
// }

// 세트 추가 기능
function addSet(workoutId) {
	const setList = document.getElementById(`set-list-${workoutId}`);
	const setCount = setList.childElementCount + 1; // 현재 세트 번호

	const newSet = document.createElement("li");

	newSet.innerHTML = `
    <span>${setCount}</span>
    <input type="number" placeholder="kg" min="0">
    <input type="number" placeholder="횟수" min="0">
    <button class="delete-set">삭제</button>
  `;

	setList.appendChild(newSet);
	newSet.querySelector('.delete-set').addEventListener('click', (e) => deleteSet(e.target, workoutId));
}

// 세트 삭제 기능
function deleteSet(element, workoutId) {
	const setList = document.getElementById(`set-list-${workoutId}`);
	element.parentElement.remove();
}

async function saveWorkout() {
	const workoutLogs = [];
	const exercises = [];

	const workoutContainers = document.querySelectorAll('.workout-container');
	workoutContainers.forEach((container, workoutIndex) => {
		const bodyPart = container.querySelector(`select[id^=body-part]`).value;
		const exerciseName = container.querySelector(`input[id^=exercise-name]`).value;
		const setList = container.querySelectorAll('.set-list li');

		// 운동 세트 정보 수집
		setList.forEach((set, setIndex) => {
			const weight = set.querySelector('input[placeholder="kg"]').value;
			const repeatCount = set.querySelector('input[placeholder="횟수"]').value;

			workoutLogs.push({
				setCount: setIndex + 1,
				weight: Number(weight),
				repeatCount: Number(repeatCount),
				bodyPart: bodyPart,
				exerciseName: exerciseName
			});
		});

		// 운동 정보 수집
		exercises.push({
			bodyPart: bodyPart,
			exerciseName: exerciseName
		});
	});

	// 수집된 데이터를 requestData에 담음
	const requestData = {
		workoutLogs: workoutLogs,
		exercises: exercises
	};

	console.log('Request Data:', requestData);
	await requestSaveWorkoutLogs(requestData)// 콘솔에서 데이터를 확인할 수 있도록

}

async function requestSaveWorkoutLogs(requestData) {
	try {
		const response = await fetch(`${apiUrl}/workout-logs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Error occurred:', errorData);

		}

		const result = await response.json();
		console.log('백엔드로부터 받은 응답:', result);
		alert('운동 기록이 성공적으로 저장되었습니다!');
	} catch (error) {
		console.error('운동 기록 저장 중 오류 발생:', error);
		alert('운동 기록 저장에 실패했습니다.');
	}

}