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
        <option value="back">등</option>
        <option value="chest">가슴</option>
        <option value="legs">다리</option>
        <option value="arms">팔</option>
        <option value="shoulders">어깨</option>
      </select>

      <div class="spacer"></div>

      <input type="text" id="exercise-name-${workoutCount}" placeholder="운동 이름 및 머신">
    </div>

    <ul class="set-list" id="set-list-${workoutCount}">
      <!-- 추가된 세트가 여기에 표시됩니다 -->
    </ul>

    <button onclick="addSet(${workoutCount})">세트 추가</button>
    <button onclick="deleteWorkout(${workoutCount})">운동 삭제</button>
  `;

	workoutContainerArea.appendChild(newWorkoutContainer);
}

// 운동 삭제 함수
function deleteWorkout(workoutId) {
	const workoutElement = document.getElementById(`workout-${workoutId}`);
	workoutElement.remove();

	// 운동 번호 재정렬
	const workouts = document.querySelectorAll('.workout-container');
	workouts.forEach((workout, index) => {
		workout.setAttribute('id', `workout-${index + 1}`);
		const selectElement = workout.querySelector('select');
		const inputElement = workout.querySelector('input');
		const setList = workout.querySelector('.set-list');

		selectElement.setAttribute('id', `body-part-${index + 1}`);
		inputElement.setAttribute('id', `exercise-name-${index + 1}`);
		setList.setAttribute('id', `set-list-${index + 1}`);

		const addSetButton = workout.querySelector('button[onclick^="addSet"]');
		addSetButton.setAttribute('onclick', `addSet(${index + 1})`);

		const deleteWorkoutButton = workout.querySelector('button[onclick^="deleteWorkout"]');
		deleteWorkoutButton.setAttribute('onclick', `deleteWorkout(${index + 1})`);
	});
}

// 세트 추가 기능
function addSet(workoutId) {
	const setList = document.getElementById(`set-list-${workoutId}`);
	const setCount = setList.childElementCount + 1; // 현재 세트 번호

	const newSet = document.createElement("li");

	newSet.innerHTML = `
    <span>${setCount}</span>
    <input type="number" placeholder="kg" min="0">
    <input type="number" placeholder="횟수" min="0">
    <button onclick="deleteSet(this, ${workoutId})">삭제</button>
  `;

	setList.appendChild(newSet);
}

// 세트 삭제 기능
function deleteSet(element, workoutId) {
	const setList = document.getElementById(`set-list-${workoutId}`);
	element.parentElement.remove();

	// 세트 번호 재정렬
	const sets = setList.querySelectorAll('li');
	let newSetCount = 1;
	sets.forEach(set => {
		const setSpan = set.querySelector('span');
		setSpan.textContent = `세트 ${newSetCount}`;
		newSetCount++;
	});
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

	// // workoutLogsDiv.innerHTML = `
	// // 	<div id="workout-container" class="workout-container">
	// // 		<div class="workout-header">
	// // 			<div class="editable-title">
	// // 				<span id="workout-number">1</span>
	// // 				<select id="body-part" name="body-part" class="editable-input">
	// // 					<option value="Chest">가슴</option>
	// // 					<option value="Abs">배</option>
	// // 					<option value="Shoulders">어깨</option>
	// // 					<option value="Back">등</option>
	// // 					<option value="Legs">하체</option>
	// // 				</select>
	// // 				<span> | </span>
	// // 				<input type="text" id="workout-machine" placeholder="운동 이름" class="editable-input">
	// // 			</div>
	// // 		</div>
	// // 		<div id="workout-content" class="workout-content">
	// // 			<div id="set-details" class="set-details">
	// // 				<div class="set-item">
	// // 					<span class="set-number">1</span>
	// // 					<input type="number" class="kg-input" placeholder="kg">
	// // 					<input type="number" class="reps-input" placeholder="회">
	// // 					<input type="checkbox" class="complete-checkbox">
	// // 				</div>
	// // 			</div>
	// // 			<div class="set-actions">
	// // 				<button class="remove-set">- 세트삭제</button>
	// // 				<button class="add-set">＋ 세트추가</button>
	// // 			</div>
	// // 		</div>
	// // 	</div>
	// // 	<div class="workout-footer">
	// // 		<button class="footer-button" id="add-workout">운동 추가</button>
	// // 		<button class="footer-button" id="remove-workout">운동 삭제</button>
	// // 		<button class="footer-button" id="save-workout">운동 저장</button>
	// // 	</div>
    // // `;
	//
	// // load-content에 workoutLogsDiv 추가
	// contentDiv.appendChild(workoutLogsDiv);
	//
	// // 운동 추가 버튼 클릭 이벤트
	// document.getElementById('add-workout').addEventListener('click', function() {
	// 	// 운동들을 감싸는 상위 컨테이너 선택
	// 	const workoutsContainer = document.querySelector('.workouts-container'); // 상위 컨테이너로 변경
	// 	const newWorkout = document.createElement('div');
	// 	newWorkout.className = 'workout-container'; // id가 아닌 class로 사용
	//
	// 	// 새로운 운동 추가 시 기본 값을 초기화하여 중복되지 않도록 처리
	// 	newWorkout.innerHTML = `
    //     <div class="workout-header">
    //         <div class="editable-title">
    //             <span class="workout-number">${document.querySelectorAll('.workout-container').length + 1}</span>
    //             <select name="body-part" class="editable-input">
    //                 <option value="">부위 선택</option>
    //                 <option value="Chest">가슴</option>
    //                 <option value="Abs">배</option>
    //                 <option value="Shoulders">어깨</option>
    //                 <option value="Back">등</option>
    //                 <option value="Legs">하체</option>
    //             </select>
    //             <span> | </span>
    //             <input type="text" placeholder="운동 이름" class="editable-input" value="">
    //         </div>
    //     </div>
    //     <div class="workout-content">
    //         <div class="set-details">
    //             <div class="set-item">
    //                 <span class="set-number">1</span>
    //                 <input type="number" class="kg-input" placeholder="kg">
    //                 <input type="number" class="reps-input" placeholder="회">
    //                 <input type="checkbox" class="complete-checkbox">
    //             </div>
    //         </div>
    //         <div class="set-actions">
    //             <button class="remove-set">- 세트삭제</button>
    //             <button class="add-set">＋ 세트추가</button>
    //         </div>
    //     </div>
    // `;
	//
	// 	// 상위 컨테이너에 새 운동 추가
	// 	workoutsContainer.appendChild(newWorkout);
	// });
	// 운동 추가 버튼 클릭 이벤트
	// document.getElementById('add-workout').addEventListener('click', function() {
	// 	const workoutContainer = document.querySelector('.workout-container');
	// 	const newWorkout = document.createElement('div');
	// 	newWorkout.className = 'workout-container';
	// 	newWorkout.innerHTML = `
    //         <div class="workout-header">
    //             <div class="editable-title">
    //                 <span class="workout-number">${document.querySelectorAll('.workout-container').length + 1}</span>
    //                 <select id="body-part" name="body-part" class="editable-input">
    //                     <option value="Chest">가슴</option>
    //                     <option value="Abs">배</option>
    //                     <option value="Shoulders">어깨</option>
    //                     <option value="Back">등</option>
    //                     <option value="Legs">하체</option>
    //                 </select>
    //                 <span> | </span>
    //                 <input type="text" placeholder="운동 이름" class="editable-input">
    //             </div>
    //         </div>
    //         <div class="workout-content">
    //             <div class="set-details">
    //                 <div class="set-item">
    //                     <span class="set-number">1</span>
    //                     <input type="number" class="kg-input" placeholder="kg">
    //                     <input type="number" class="reps-input" placeholder="회">
    //                     <input type="checkbox" class="complete-checkbox">
    //                 </div>
    //             </div>
    //             <div class="set-actions">
    //                 <button class="remove-set">- 세트삭제</button>
    //                 <button class="add-set">＋ 세트추가</button>
    //             </div>
    //         </div>
    //     `;
	// 	workoutContainer.appendChild(newWorkout);
	// });
//
// 	// 운동 삭제 버튼 클릭 이벤트
// 	document.getElementById('remove-workout').addEventListener('click', function() {
// 		const workoutContainers = document.querySelectorAll('.workout-container');
// 		if (workoutContainers.length > 1) {
// 			workoutContainers[workoutContainers.length - 1].remove();
// 		}
// 	});
//
// 	// 세트 추가/삭제 버튼 이벤트 처리
// 	contentDiv.addEventListener('click', function(event) {
// 		if (event.target.classList.contains('add-set')) {
// 			const setDetails = event.target.closest('.workout-content').querySelector('.set-details');
// 			const newSet = document.createElement('div');
// 			newSet.className = 'set-item';
// 			newSet.innerHTML = `
//                 <span class="set-number">${setDetails.children.length + 1}</span>
//                 <input type="number" class="kg-input" placeholder="kg">
//                 <input type="number" class="reps-input" placeholder="회">
//                 <input type="checkbox" class="complete-checkbox">
//             `;
// 			setDetails.appendChild(newSet);
// 		}
//
// 		if (event.target.classList.contains('remove-set')) {
// 			const setDetails = event.target.closest('.workout-content').querySelector('.set-details');
// 			if (setDetails.children.length > 1) {
// 				setDetails.removeChild(setDetails.lastChild);
// 			}
// 		}
// 	});
//
// 	// 운동 저장 버튼 클릭 시 데이터 백엔드 전송
// 	document.getElementById('save-workout').addEventListener('click', async function() {
// 		const workoutLogs = [];
// 		const exercises = [];
// 		const workoutContainers = document.querySelectorAll('.workout-container');
//
// 		// 각 운동에 대한 데이터 수집
// 		let cnt = 0
// 		workoutContainers.forEach((workoutContainer) => {
// 			const bodyPart = workoutContainer.querySelector('.editable-input').value;
// 			const exerciseName = workoutContainer.querySelectorAll('.editable-input')[1].value;
//
// 			const sets = workoutContainer.querySelectorAll('.set-item');
// 			console.log(cnt)
// 			console.log(sets)
// 			cnt += 1
// 			sets.forEach((set, setIndex) => {
// 				const weight = set.querySelector('.kg-input').value;
// 				const repeatCount = set.querySelector('.reps-input').value;
//
// 				workoutLogs.push({
// 					setCount: setIndex + 1,
// 					weight: Number(weight),
// 					repeatCount: Number(repeatCount),
// 					bodyPart: bodyPart,
// 					exerciseName: exerciseName
// 				});
// 			});
//
// 			exercises.push({
// 				bodyPart: bodyPart,
// 				exerciseName: exerciseName
// 			});
// 		});
//
// 		const requestData = {
// 			workoutLogs: workoutLogs,
// 			exercises: exercises
// 		};
// 		console.log(requestData);
// 		try {
// 			const response = await fetch(`${apiUrl}/workout-logs`, {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
// 				},
// 				body: JSON.stringify(requestData),
// 			});
//
// 			if (!response.ok) {
// 				throw new Error('운동 기록 저장 실패');
// 			}
//
// 			const result = await response.json();
// 			console.log('백엔드로부터 받은 응답:', result);
// 			alert('운동 기록이 성공적으로 저장되었습니다!');
// 		} catch (error) {
// 			console.error('운동 기록 저장 중 오류 발생:', error);
// 			alert('운동 기록 저장에 실패했습니다.');
// 		}
// 	});
// }