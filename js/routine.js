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
	const userId = localStorage.getItem('userId');  // 유저 ID를 로컬스토리지에서 가져옵니다.
	let routines = [];
	try {
		routines = await getAllRoutines(apiUrl, userId);  // 유저의 저장된 루틴 목록을 가져옵니다.
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
                        <option value="Chest">가슴</option>
                        <option value="Abs">배</option>
                        <option value="Shoulders">어깨</option>
                        <option value="Back">등</option>
                        <option value="Legs">하체</option>
                    </select>

                    <label for="exercise-name">운동 이름:</label>
                    <input type="text" id="exercise-name" name="exercise-name" required placeholder="운동 이름 입력">
                    <span class="exercise-name-error error-message"></span>
                </div>
            </div>

            <button type="button" id="add-exercise">운동 추가</button>
            <button type="submit" class="submit-button">루틴 저장</button>
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
                <option value="Chest">가슴</option>
                <option value="Abs">배</option>
                <option value="Shoulders">어깨</option>
                <option value="Back">등</option>
                <option value="Legs">하체</option>
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
	const form = document.getElementById('routineForm');
	form.addEventListener('submit', async function (event) {
		event.preventDefault(); // 기본 폼 제출 방지

		const routineName = document.getElementById('routine-name').value;
		const routineNameError = document.getElementById('routine-name-error');
		if (routineName.trim() === "") {
			routineNameError.textContent = '루틴 이름을 입력하세요.';
			return;
		} else {
			routineNameError.textContent = '';
		}

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
			routineName: routineName,
			routines: routines
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
	});

	// 운동 삭제 기능 추가
	function attachRemoveExerciseEvent(exerciseItem) {
		exerciseItem.querySelector('.remove-exercise').addEventListener('click', function () {
			exerciseItem.remove(); // 해당 운동 항목 삭제
		});
	}
}

async function getAllRoutines(apiUrl, userId) {
	try {
		const response = await fetch(`${apiUrl}/routines/all?userId=${userId}`, {
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

// 선택된 루틴 정보를 폼에 채우는 함수
function fillRoutineForm(routine) {
	document.getElementById('routine-name').value = routine.name;

	const exerciseContainer = document.getElementById('exercise-container');
	exerciseContainer.innerHTML = '';  // 기존 운동 목록을 초기화
	routine.exercises.forEach(exercise => {
		const exerciseItem = document.createElement('div');
		exerciseItem.className = 'exercise-item';
		exerciseItem.innerHTML = `
            <label for="body-part">부위 선택:</label>
            <select id="body-part" name="body-part">
                <option value="Chest" ${exercise.bodyPart === 'Chest' ? 'selected' : ''}>가슴</option>
                <option value="Abs" ${exercise.bodyPart === 'Abs' ? 'selected' : ''}>배</option>
                <option value="Shoulders" ${exercise.bodyPart === 'Shoulders' ? 'selected' : ''}>어깨</option>
                <option value="Back" ${exercise.bodyPart === 'Back' ? 'selected' : ''}>등</option>
                <option value="Legs" ${exercise.bodyPart === 'Legs' ? 'selected' : ''}>하체</option>
            </select>

            <label for="exercise-name">운동 이름:</label>
            <input type="text" name="exercise-name" value="${exercise.exerciseName}" required placeholder="운동 이름 입력">
            <button type="button" class="remove-exercise">운동 삭제</button>
        `;
		exerciseContainer.appendChild(exerciseItem);
	});
}

// 루틴 폼을 초기화하는 함수 (루틴 선택 취소 시)
function clearRoutineForm() {
	document.getElementById('routine-name').value = '';
	document.getElementById('exercise-container').innerHTML = `
        <div class="exercise-item">
            <label for="body-part">부위 선택:</label>
            <select id="body-part" name="body-part">
                <option value="Chest">가슴</option>
                <option value="Abs">배</option>
                <option value="Shoulders">어깨</option>
                <option value="Back">등</option>
                <option value="Legs">하체</option>
            </select>

            <label for="exercise-name">운동 이름:</label>
            <input type="text" id="exercise-name" name="exercise-name" required placeholder="운동 이름 입력">
            <button type="button" class="remove-exercise">운동 삭제</button>
        </div>
    `;
}