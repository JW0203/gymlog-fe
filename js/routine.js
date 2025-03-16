import { signIn } from "./signIn.js";
import { clearContent, isAuthenticated } from "./common-functions.js";
import {apiUrl} from "./config.js";

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('routine').addEventListener('click', async function () {
		if (isAuthenticated()) {
			// 토큰이 있으면 바로 루틴 기록 화면을 보여줌
			await loadRoutineForm();
		} else {
			// 토큰이 없으면 로그인 화면을 먼저 보여줌
			signIn();
		}
	});
});

// 루틴 기록 화면을 로드하는 함수
async function loadRoutineForm() {
	const contentDiv = document.getElementById('load-content');
	clearContent(contentDiv);

	// 루틴 목록 불러오기
	let routines = [];
	try {
		routines = await getAllRoutines(apiUrl);  // 유저의 저장된 루틴 목록을 가져옵니다.
	} catch (error) {
		console.error('루틴 목록을 불러오는 중 오류 발생:', error);
	}

	contentDiv.innerHTML = `
        <h2>루틴 기록</h2>
        <div id="saved-routines">
            <label for="saved-routine-select">저장된 루틴 선택:</label>
            <select id="saved-routine-select">
                <option value="">--루틴 선택--</option>
                ${routines.map((routine, index) => `<option value="${index}">${routine.name}</option>`).join('')}
            </select>
        </div>
        <form id="routineForm">
            <label for="routine-name">루틴 이름:</label>
            <input type="text" id="routine-name" name="routine-name" required placeholder="루틴 이름 입력">
            <span id="routine-name-error" class="error-message"></span><br>

            <div id="exercise-container">
                <div class="exercise-item">
                    <label for="body-part-routine">부위 선택:</label>
                    <select id="body-part" name="body-part">
                        <option value="Back">등</option>
						<option value="Chest">가슴</option>
						<option value="Legs">다리</option>
						<option value="Arm">팔</option>
						<option value="Shoulders">어깨</option>
						<option value="Abs">배</option>
                    </select>

                    <label for="exercise-name">운동 이름:</label>
                    <input type="text" id="exercise-name" name="exercise-name" required placeholder="운동 이름 입력">
                    <span class="exercise-name-error error-message"></span>
                </div>
            </div>

            <button type="button" id="add-exercise">운동 추가</button>
            <button id="save-routine">루틴 저장</button>
        </form>
    `;

	// 루틴 선택 시 정보를 폼에 채우는 이벤트 리스너 추가
	document.getElementById('saved-routine-select').addEventListener('change', async function () {
		const selectedRoutineIndex = this.value;
		if (selectedRoutineIndex !== "") {
			const selectedRoutine = routines[selectedRoutineIndex];
			fillRoutineForm(selectedRoutine);
		} else {
			clearRoutineForm();  // 루틴 선택을 취소하면 폼 초기화
		}
	});

	// 운동 추가 버튼 클릭 시 새로운 운동 입력 필드 추가
	document.getElementById('add-exercise').addEventListener('click', function () {
		const exerciseContainer = document.getElementById('exercise-container');
		const newExercise = document.createElement('div');
		newExercise.className = 'exercise-item';
		newExercise.innerHTML = `
            <label for="body-part">부위 선택:</label>
            <select id="body-part" name="body-part">
                <option value="Back">등</option>
				<option value="Chest">가슴</option>
				<option value="Legs">다리</option>
				<option value="Arm">팔</option>
				<option value="Shoulders">어깨</option>
				<option value="Abs">배</option>
            </select>

            <label for="exercise-name">운동 이름:</label>
            <input type="text" name="exercise-name" required placeholder="운동 이름 입력">
            <button type="button" class="remove-exercise">운동 삭제</button>
        `;
		exerciseContainer.appendChild(newExercise);

		// 새로 추가된 운동 항목에도 삭제 버튼 리스너 추가
		attachRemoveExerciseEvent(newExercise);
	});

	// 루틴 저장 시 유효성 검사 및 데이터 전송
	document.getElementById('save-routine').addEventListener('click', async  ()=> saveRoutine());
}

// 운동 삭제 기능 추가
function attachRemoveExerciseEvent(exerciseItem) {
	exerciseItem.querySelector('.remove-exercise').addEventListener('click', function () {
		exerciseItem.remove(); // 해당 운동 항목 삭제
	});
}

// 유효성 검사 및 데이터 전송 함수
async function saveRoutine() {
	const routineName = document.getElementById('routine-name').value;


	const exerciseNames = document.querySelectorAll('[name="exercise-name"]');
	const bodyParts = document.querySelectorAll('[name="body-part"]');

	const routines = [];
	exerciseNames.forEach((exerciseName, index) => {
		routines.push({
			routineName: routineName,
			bodyPart: bodyParts[index].value,
			exerciseName: exerciseName.value
		});
	});

	const requestData = {
		routines: routines,
	};

	// 백엔드로 데이터 전송
	try {
		const response = await fetch(`${apiUrl}/routines`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
			},
			body: JSON.stringify(requestData),
		});

		if (!response.ok) {
			throw new Error('루틴 저장 실패');
		}

		alert('루틴이 성공적으로 저장되었습니다!');
	} catch (error) {
		console.error('루틴 저장 중 오류 발생:', error);
		alert('루틴 저장에 실패했습니다.');
	}
}

async function getAllRoutines(apiUrl) {
	try {
		const response = await fetch(`${apiUrl}/routines/all`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
			},
		});

		if (!response.ok) {
			// HTTP 상태 코드와 상태 텍스트 추가
			const errorMessage = `Error ${response.status}: ${response.statusText}`;
			const errorDetails = await response.text(); // 응답 본문을 텍스트로 읽음
			console.error('루틴 목록을 불러오는 중 오류 발생:', errorMessage, 'Details:', errorDetails);
			throw new Error('루틴 목록을 불러오는 데 실패했습니다.');
		}

		return await response.json();  // 유저의 저장된 루틴 목록 반환
	} catch (error) {
		console.error('예외 발생:', error.message, error);  // 추가적인 예외 정보 출력
		throw error;  // 예외를 다시 던짐
	}
}

async function updateRoutine() {
	// 수정된 운동 목록 가져오기
	const routineName = String(document.getElementById('routine-name').value);
	const exerciseItems = document.querySelectorAll('.exercise-item');

	const exercisesMap = new Map();
	const updatedExercises = [];
	exerciseItems.forEach((exerciseItem) => {
		const bodyPart = exerciseItem.querySelector('[name="body-part"]').value;
		const exerciseName = exerciseItem.querySelector('[name="exercise-name"]').value;
		const routineId = parseInt(exerciseItem.querySelector('[name="routine-id"]').value, 10);

		updatedExercises.push({
			id:routineId,
			routineName,
			bodyPart: bodyPart,
			exerciseName: exerciseName,
		});
		if (!exercisesMap.has(exerciseName)) {
			exercisesMap.set(exerciseName, bodyPart);
		}
	});

	// 요청 데이터 생성
	const exercises = Array.from(exercisesMap, ([exerciseName, bodyPart]) => ({ exerciseName, bodyPart }));
	const requestData = {
		updateData: updatedExercises,
	};
	console.log(requestData)
	try{
		const response = await fetch(`${apiUrl}/routines`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
			},
			body: JSON.stringify(requestData)
		});

		if(!response.ok) {
			const errorMessage = await response.json();
			throw new Error(errorMessage.message);
		}
	}catch(error){
		console.error('루틴 저장 중 오류 발생:', error);
		alert('루틴 저장에 실패했습니다.');
	}
}

// 선택된 루틴 정보를 폼에 채우는 함수
function fillRoutineForm(routine) {
	document.getElementById('routine-name').value = routine.name;

	const exerciseContainer = document.getElementById('exercise-container');
	exerciseContainer.innerHTML = '';  // 기존 운동 목록을 초기화
	routine.exercises.forEach(exercise => {
		const exerciseItem = document.createElement('div');
		exerciseItem.className = 'exercise-item';
		exerciseItem.innerHTML = `
            <label for="body-part">Select Body Part:</label>
            <select id="body-part" name="body-part" disabled>
                <option value="Back" ${exercise.bodyPart === 'Back' ? 'selected' : ''}>Back</option>
                <option value="Chest" ${exercise.bodyPart === 'Chest' ? 'selected' : ''}>Chest</option>
                <option value="Legs" ${exercise.bodyPart === 'Legs' ? 'selected' : ''}>Legs</option>
                <option value="Arm" ${exercise.bodyPart === 'Arm' ? 'selected' : ''}>Arm</option>
                <option value="Shoulders" ${exercise.bodyPart === 'Shoulders' ? 'selected' : ''}>Shoulders</option>
                <option value="Abs" ${exercise.bodyPart === 'Abs' ? 'selected' : ''}>Abs</option>
            </select>
            <label for="exercise-name">Exercise Name:</label>
            <input type="text" name="exercise-name" value="${exercise.exerciseName}" required placeholder="Enter exercise name" readonly>
            <input type="hidden" name="routine-id" value="${exercise.id}">
        `;
		exerciseContainer.appendChild(exerciseItem);
	});

	const editButton = document.createElement('button');
	editButton.type = 'button';
	editButton.id = 'edit-routine';
	editButton.className = 'edit-button';
	editButton.textContent = '수정';
	exerciseContainer.appendChild(editButton);

	editButton.addEventListener('click', function () {
		enableRoutineEditing();
	});

	const deleteButton = document.createElement('button');
	deleteButton.type = 'button';
	deleteButton.id = 'delete-routine';
	deleteButton.className = 'delete-button';
	deleteButton.textContent = '삭제';
	exerciseContainer.appendChild(deleteButton);

	deleteButton.addEventListener('click', async function () {
		await deleteRoutine();
		await loadRoutineForm();
	});

	const updateButton = document.createElement('button');
	updateButton.type = 'button';
	updateButton.id = 'update-routine';
	updateButton.textContent = '수정한 내용 저장';
	updateButton.style.display = 'none';
	exerciseContainer.appendChild(updateButton);

	updateButton.addEventListener('click', async function () {
		await updateRoutine();
	});

	// 루틴 저장 버튼 숨기기
	const saveButton = document.querySelector('.submit-button');
	if (saveButton) {
		saveButton.style.display = 'none';
	}
}

// Function to enable routine editing
function enableRoutineEditing() {
	document.getElementById('routine-name').removeAttribute('readonly');
	const exerciseItems = document.querySelectorAll('#exercise-container .exercise-item');
	exerciseItems.forEach(item => {
		item.querySelector('select[name="body-part"]').removeAttribute('disabled');
		item.querySelector('input[name="exercise-name"]').removeAttribute('readonly');
	});
	document.getElementById('edit-routine').style.display = 'none';
	document.getElementById('update-routine').style.display = 'inline';
}


// 루틴 폼을 초기화하는 함수 (루틴 선택 취소 시)
function clearRoutineForm() {
	document.getElementById('routine-name').value = '';
	document.getElementById('exercise-container').innerHTML = `
        <div class="exercise-item">
            <label for="body-part">부위 선택:</label>
            <select id="body-part" name="body-part">
                <option value="Back">등</option>
				<option value="Chest">가슴</option>
				<option value="Legs">다리</option>
				<option value="Arm">팔</option>
				<option value="Shoulders">어깨</option>
				<option value="Abs">배</option>
            </select>

            <label for="exercise-name">운동 이름:</label>
            <input type="text" id="exercise-name" name="exercise-name" required placeholder="운동 이름 입력">
            <button type="button" class="remove-exercise">운동 삭제</button>
        </div>
    `;
}

async function deleteRoutine() {
	const ids =[];
	const exerciseItems = document.querySelectorAll('.exercise-item');
	exerciseItems.forEach((exerciseItem) => {
		const routineId = parseInt(exerciseItem.querySelector('[name="routine-id"]').value, 10);
		ids.push(routineId);
	});

	try{
		const response = await fetch(`${apiUrl}/routines`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
			},
			body: JSON.stringify({ids})
		});

		if(!response.ok) {
			const errorMessage = await response.json();
			throw new Error(errorMessage.message);
		}
		alert('루틴 삭제에 성공했습니다.');
	}catch(error){
		console.error('루틴 삭제 중 오류 발생:', error);
		alert('루틴 삭제에 실패했습니다.');
	}

}