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
	const contentDiv = document.getElementById('load-content');

	// load-content 내의 기존 콘텐츠를 모두 제거
	clearContent(contentDiv);

	// 새로운 div 생성 및 운동 기록 화면 추가
	const workoutLogsDiv = document.createElement('div');
	workoutLogsDiv.className = 'container';
	workoutLogsDiv.innerHTML=`
		<div class="workout-container">
			<div class="workout-header">
				<div class="editable-title">
					<span class="workout-number">1</span>
					<label for="body-part">운동 부위:</label>
					<select class="body-part editable-input" name="body-part">
						<option value="Chest">가슴</option>
						<option value="Abs">배</option>
						<option value="Shoulders">어깨</option>
						<option value="Back">등</option>
						<option value="Legs">하체</option>
					</select>
					<span> | </span>
					<label for="workout-machine">운동 이름:</label>
					<input type="text" class="workout-machine editable-input" placeholder="운동 이름">
				</div>
			</div>
			<div class="workout-content">
				<div class="set-details">
					<div class="set-item">
						<span class="set-number">1</span>
<!--						<label for="kg-input">무게 (kg):</label>-->
						<input type="number" class="kg-input" placeholder="kg">
<!--						<label for="reps-input">횟수:</label>-->
						<input type="number" class="reps-input" placeholder="회">
						<input type="checkbox" class="complete-checkbox"> 완료
					</div>
				</div>
				<div class="set-actions">
					<button class="remove-set">- 세트 삭제</button>
					<button class="add-set">＋ 세트 추가</button>
				</div>
			</div>
		</div>
		<div class="workout-footer">
			<button class="footer-button" id="add-workout">운동 추가</button>
			<button class="footer-button" id="remove-workout">운동 삭제</button>
			<button class="footer-button" id="save-workout">운동 저장</button>
		</div>
	`;
	// workoutLogsDiv.innerHTML = `
	// 	<div id="workout-container" class="workout-container">
	// 		<div class="workout-header">
	// 			<div class="editable-title">
	// 				<span id="workout-number">1</span>
	// 				<select id="body-part" name="body-part" class="editable-input">
	// 					<option value="Chest">가슴</option>
	// 					<option value="Abs">배</option>
	// 					<option value="Shoulders">어깨</option>
	// 					<option value="Back">등</option>
	// 					<option value="Legs">하체</option>
	// 				</select>
	// 				<span> | </span>
	// 				<input type="text" id="workout-machine" placeholder="운동 이름" class="editable-input">
	// 			</div>
	// 		</div>
	// 		<div id="workout-content" class="workout-content">
	// 			<div id="set-details" class="set-details">
	// 				<div class="set-item">
	// 					<span class="set-number">1</span>
	// 					<input type="number" class="kg-input" placeholder="kg">
	// 					<input type="number" class="reps-input" placeholder="회">
	// 					<input type="checkbox" class="complete-checkbox">
	// 				</div>
	// 			</div>
	// 			<div class="set-actions">
	// 				<button class="remove-set">- 세트삭제</button>
	// 				<button class="add-set">＋ 세트추가</button>
	// 			</div>
	// 		</div>
	// 	</div>
	// 	<div class="workout-footer">
	// 		<button class="footer-button" id="add-workout">운동 추가</button>
	// 		<button class="footer-button" id="remove-workout">운동 삭제</button>
	// 		<button class="footer-button" id="save-workout">운동 저장</button>
	// 	</div>
    // `;

	// load-content에 workoutLogsDiv 추가
	contentDiv.appendChild(workoutLogsDiv);

	// 운동 추가 버튼 클릭 이벤트
	document.getElementById('add-workout').addEventListener('click', function() {
		const workoutContainer = document.querySelector('.workout-container');
		const newWorkout = document.createElement('div');
		newWorkout.className = 'workout-container';
		newWorkout.innerHTML = `
            <div class="workout-header">
                <div class="editable-title">
                    <span class="workout-number">${document.querySelectorAll('.workout-container').length + 1}</span>
                    <select id="body-part" name="body-part" class="editable-input">
                        <option value="Chest">가슴</option>
                        <option value="Abs">배</option>
                        <option value="Shoulders">어깨</option>
                        <option value="Back">등</option>
                        <option value="Legs">하체</option>
                    </select>
                    <span> | </span>
                    <input type="text" placeholder="운동 이름" class="editable-input">
                </div>
            </div>
            <div class="workout-content">
                <div class="set-details">
                    <div class="set-item">
                        <span class="set-number">1</span>
                        <input type="number" class="kg-input" placeholder="kg">
                        <input type="number" class="reps-input" placeholder="회">
                        <input type="checkbox" class="complete-checkbox">
                    </div>
                </div>
                <div class="set-actions">
                    <button class="remove-set">- 세트삭제</button>
                    <button class="add-set">＋ 세트추가</button>
                </div>
            </div>
        `;
		workoutContainer.appendChild(newWorkout);
	});

	// 운동 삭제 버튼 클릭 이벤트
	document.getElementById('remove-workout').addEventListener('click', function() {
		const workoutContainers = document.querySelectorAll('.workout-container');
		if (workoutContainers.length > 1) {
			workoutContainers[workoutContainers.length - 1].remove();
		}
	});

	// 세트 추가/삭제 버튼 이벤트 처리
	contentDiv.addEventListener('click', function(event) {
		if (event.target.classList.contains('add-set')) {
			const setDetails = event.target.closest('.workout-content').querySelector('.set-details');
			const newSet = document.createElement('div');
			newSet.className = 'set-item';
			newSet.innerHTML = `
                <span class="set-number">${setDetails.children.length + 1}</span>
                <input type="number" class="kg-input" placeholder="kg">
                <input type="number" class="reps-input" placeholder="회">
                <input type="checkbox" class="complete-checkbox">
            `;
			setDetails.appendChild(newSet);
		}

		if (event.target.classList.contains('remove-set')) {
			const setDetails = event.target.closest('.workout-content').querySelector('.set-details');
			if (setDetails.children.length > 1) {
				setDetails.removeChild(setDetails.lastChild);
			}
		}
	});

	// 운동 저장 버튼 클릭 시 데이터 백엔드 전송
	document.getElementById('save-workout').addEventListener('click', async function() {
		const workoutLogs = [];
		const exercises = [];
		const workoutContainers = document.querySelectorAll('.workout-container');

		// 각 운동에 대한 데이터 수집
		workoutContainers.forEach((workoutContainer) => {
			const bodyPart = workoutContainer.querySelector('.editable-input').value;
			const exerciseName = workoutContainer.querySelectorAll('.editable-input')[1].value;

			const sets = workoutContainer.querySelectorAll('.set-item');
			sets.forEach((set, setIndex) => {
				const weight = set.querySelector('.kg-input').value;
				const repeatCount = set.querySelector('.reps-input').value;

				workoutLogs.push({
					setCount: setIndex + 1,
					weight: Number(weight),
					repeatCount: Number(repeatCount),
					bodyPart: bodyPart,
					exerciseName: exerciseName
				});
			});

			exercises.push({
				bodyPart: bodyPart,
				exerciseName: exerciseName
			});
		});

		const requestData = {
			workoutLogs: workoutLogs,
			exercises: exercises
		};

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
				throw new Error('운동 기록 저장 실패');
			}

			const result = await response.json();
			console.log('백엔드로부터 받은 응답:', result);
			alert('운동 기록이 성공적으로 저장되었습니다!');
		} catch (error) {
			console.error('운동 기록 저장 중 오류 발생:', error);
			alert('운동 기록 저장에 실패했습니다.');
		}
	});
}