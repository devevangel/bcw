const startWorkoutButton = document.querySelector('.startWorkoutButton');
const exerciseNameInput = document.querySelector('#exerciseName');
const exerciseDurationInput = document.querySelector('#exerciseDuration');
const exerciseGuideInput = document.querySelector('#exerciseGuide');
const restDurationInput = document.querySelector('#restDuration');
const addExerciseButton = document.querySelector('.addExerciseButton');
const addRestButton = document.querySelector('.addRestButton');
const popupTemplate = document.querySelector('#popupTemplate');
const exerciseCardTemplate = document.querySelector('#exerciseCardTemplate');
const workoutSessionTemplate = document.querySelector('#workoutSessionTemplate');
const appContainer = document.querySelector('.workoutApp');
const workoutListContainer = document.querySelector('.exercisesContainer');

let timerInterval;
let currentWorkoutIndex = 0;
let currentWorkout = {};
let workoutList = [];
let started = false;
let paused = false;

function clearFormInputs() {
  exerciseNameInput.value = '';
  exerciseDurationInput.value = 1;
  exerciseGuideInput.value = '';
  restDurationInput.value = 1;
}

function addExercise(event) {
  event.preventDefault();
  const name = exerciseNameInput.value;
  const duration = Number(exerciseDurationInput.value) * 60000;
  const guide = exerciseGuideInput.value;

  if (name.length === 0 || duration <= 0 || guide.length === 0) {
    return showInfo('Warning', 'An exercises requires a name, minimum duration of 1 minute and a simple guide.');
  }

  const newExercise = {
    id: Date.now(),
    name,
    duration,
    guide,
  };

  workoutList.push(newExercise);
  clearFormInputs();
  showWorkouts();
}

function addRest(event) {
  event.preventDefault();
  const name = 'Rest';
  const duration = Number(restDurationInput.value) * 60000;
  const guide = `Take out ${restDurationInput.value} minute(s) to rest.`;

  if (duration <= 0) {
    return showInfo('Warning', 'Rest requires a valid duration in minutes.');
  }

  const newRest = {
    id: Date.now(),
    name,
    duration,
    guide,
  };

  workoutList.push(newRest);
  clearFormInputs();
  showWorkouts();
}

function showInfo(title, msg) {
  const clonedPopup = popupTemplate.content.cloneNode(true).firstElementChild;
  const infoTitle = clonedPopup.querySelector('.popupTitle');
  const message = clonedPopup.querySelector('.popupText');
  const closePopupButton = clonedPopup.querySelector('.closePopupButton');

  infoTitle.textContent = title;
  message.textContent = msg;

  closePopupButton.addEventListener('click', function () {
    clonedPopup.remove();
  });

  appContainer.append(clonedPopup);
}

function clearClones() {
  const clones = document.querySelectorAll('.temp');
  clones.forEach(function (clone) {
    clone.remove();
  });
}

function removeWorkoutFromList(id) {
  workoutList = workoutList.filter((workout) => workout.id !== id);
}

function showWorkouts() {
  clearClones();
  workoutList.forEach(function (workout) {
    const clonedExerciseCard = exerciseCardTemplate.content.cloneNode(true).firstElementChild;
    const name = clonedExerciseCard.querySelector('.exerciseNameText');
    const guide = clonedExerciseCard.querySelector('.exerciseGuideText');
    const duration = clonedExerciseCard.querySelector('.exerciseDurationText');
    const deleteButton = clonedExerciseCard.querySelector('.deleteExerciseButton');

    name.textContent = workout.name;
    guide.textContent = workout.guide;
    duration.textContent = `Last for ${workout.duration / 60000} minute(s)`;

    deleteButton.addEventListener('click', function () {
      clonedExerciseCard.remove();
      removeWorkoutFromList(workout.id);
      showWorkouts();
    });

    workoutListContainer.append(clonedExerciseCard);
  });
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format minutes and seconds to always have two digits
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

function stopSession(session) {
  clearInterval(timerInterval);
  currentWorkoutIndex = 0;
  currentWorkout = {};
  workoutList = [];
  started = false;
  paused = false;
  clearClones();
  session.remove();
}

function moveToNextWorkout(sessionWidget, session) {
  currentWorkoutIndex = currentWorkoutIndex + 1;
  currentWorkout = workoutList[currentWorkoutIndex];

  if (!currentWorkout) {
    sessionWidget.timer.textContent = '00:00';
    clearInterval(timerInterval);
    stopSession(session);
    showInfo('Workout Complete', 'Amazing! workout session complete.');
  }
}


function startNewTimer(sessionWidget, session) {
  sessionWidget.timer.textContent = formatTime(currentWorkout.duration);
  sessionWidget.guide.textContent = currentWorkout.guide;
  sessionWidget.exerciseDoing.textContent = `Exercise: ${currentWorkout.name}`;
  currentWorkout = {
    ...currentWorkout,
    duration: currentWorkout.duration - 1000,
  };

  if (currentWorkout.duration <= 0) {
    moveToNextWorkout(sessionWidget, session);
  }
}

function startTimerSavedTime(sessionWidget, session) {
  sessionWidget.timer.textContent = formatTime(currentWorkout.duration);
  sessionWidget.guide.textContent = currentWorkout.guide;
  sessionWidget.exerciseDoing.textContent = `Exercise: ${currentWorkout.name}`;
  currentWorkout = {
    ...currentWorkout,
    duration: currentWorkout.duration - 1000,
  };

  if (currentWorkout.duration <= 0) {
    moveToNextWorkout(sessionWidget, session);
  }
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}


function setupWorkoutView() {
  if (workoutList.length <= 0) {
    return showInfo('Warning', 'To start a workout you need to add exercises.');
  }

  const clonedWorkoutSession = workoutSessionTemplate.content.cloneNode(true).firstElementChild;
  const timer = clonedWorkoutSession.querySelector('.timerText');
  const exerciseDoing = clonedWorkoutSession.querySelector('.exerciseNameTimerText');
  const startTimerButton = clonedWorkoutSession.querySelector('.startTimerButton');
  const pauseTimerButton = clonedWorkoutSession.querySelector('.pauseTimerButton');
  const exitTimerButton = clonedWorkoutSession.querySelector('.exitTimerButton');
  const guide = clonedWorkoutSession.querySelector('.exerciseGuideTextMain');

  timer.textContent = formatTime(workoutList[0].duration);
  exerciseDoing.textContent = `Exercise: ${workoutList[0].name}`;
  guide.textContent = workoutList[0].guide;

  const sessionWidget = {
    timer,
    exerciseDoing,
    guide,
  };

  startTimerButton.addEventListener('click', function () {
    if (started === false && paused === false) {
      started = true;
      paused = false;
      currentWorkout = workoutList[currentWorkoutIndex];
      timerInterval = setInterval(startNewTimer, 100, sessionWidget, clonedWorkoutSession);
    }

    if (started && paused) {
      paused = false;
      timerInterval = setInterval(startTimerSavedTime, 100, sessionWidget, clonedWorkoutSession);
    }
  });

  pauseTimerButton.addEventListener('click', function () {
    if (started && paused === false) {
      paused = true;
      pauseTimer();
    }
  });

  exitTimerButton.addEventListener('click', function () {
    stopSession(clonedWorkoutSession);
  });

  appContainer.append(clonedWorkoutSession);
}

addRestButton.addEventListener('click', addRest);
addExerciseButton.addEventListener('click', addExercise);
startWorkoutButton.addEventListener('click', setupWorkoutView);
