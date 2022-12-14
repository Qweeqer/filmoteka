import getRefs from './getRefs.js';
import { MovieAPI } from './movieAPI';
import { renderModalMarkup } from './renderModalMarkup';
import Notiflix, { Notify } from 'notiflix';
// import lsData from './localeStorageService';
const movieAPI = new MovieAPI();
let currentResult = {};
let watchedMoviesArr = [];
const LOCAL_STORAGE_WATCHED = 'WATCHED';
let queueMoviesArr = [];
const LOCAL_STORAGE_QUEUE = 'QUEUE';

getRefs().containerListRef.addEventListener('click', onFilmCardClickHandle);
function onFilmCardClickHandle(evt) {
  let id = evt.target.closest('.film-card__item').dataset.id;
  if (evt.target === evt.currentTarget) {
    return;
  }
  getRefs().modal.classList.remove('is-hidden');
  document.addEventListener('keydown', onEscapeCloseHandle);
  getRefs().modalContainer.addEventListener(
    'click',
    onModalContainerClickHandle
  );
  movieAPI
    .getFilms(id)
    .then(result => {
      const markup = renderModalMarkup(result);

      getRefs().modalFilm.innerHTML = markup;
      getRefs().modal.style.backgroundImage = `linear-gradient(to right, rgba(47, 48, 58, 0.9), rgba(47, 48, 58, 0.9)),
		url(https://image.tmdb.org/t/p/w500/${result.backdrop_path})`;
      getRefs().modal.style.backgroundSize = 'cover';
      getRefs().html.style.overflow = 'hidden';
      getRefs().backToTop.style.display = 'none';

      onAddButtonsFunctinal(result);
    })
    // Adding functioning for buttons

    .catch(error => console.log(error))
    .finally(() => {
      getRefs().loaderModal.classList.add('visually-hidden');
    });
}

getRefs().modalCloseBtnRef.addEventListener('click', onModalCloseBtnHandle);

function onModalCloseBtnHandle() {
  getRefs().modal.classList.add('is-hidden');
  document.removeEventListener('keydown', onEscapeCloseHandle);
  getRefs().modalContainer.removeEventListener(
    'click',
    onModalContainerClickHandle
  );
  getRefs().html.style.overflow = 'visible';
  getRefs().backToTop.style.display = 'block';
}

function onModalContainerClickHandle(evt) {
  if (evt.target === evt.currentTarget) {
    onModalCloseBtnHandle();
    console.log('click');
  }
}

function onEscapeCloseHandle(evt) {
  if (evt.key === 'Escape') {
    onModalCloseBtnHandle();
    console.log('escape');
  }
}
// -----------------------------------------------------------
function onAddButtonsFunctinal(result) {
  currentResult = result;
  const addToWatchedBtnRef = document.querySelector('.js-btn-watched');
  addToWatchedBtnRef.addEventListener('click', onAddToWatchedHandle);
  if (localStorage.getItem(LOCAL_STORAGE_WATCHED) !== null) {
    watchedMoviesArr = [
      ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_WATCHED)),
    ];
  }

  if (watchedMoviesArr.some(({ id }) => id === result.id)) {
    addToWatchedBtnRef.textContent = 'Remove from watched';
  }
  // --------------?????? ?????? ???????????? ????????
  if (localStorage.getItem(LOCAL_STORAGE_QUEUE) !== null) {
    queueMoviesArr = [...JSON.parse(localStorage.getItem(LOCAL_STORAGE_QUEUE))];
  }
  const addToQueueBtnRef = document.querySelector('.js-btn-queue');
  addToQueueBtnRef.addEventListener('click', onAddToQueueHandle);
  if (queueMoviesArr.some(({ id }) => id === result.id)) {
    addToQueueBtnRef.textContent = 'Remove from queue';
  }
}
// -----------------------------------------------------------------

const onAddToWatchedHandle = evt => {
  let filmObject = currentResult;
  // let id = filmObject.id;
  const addToWatchedBtnRef = document.querySelector('.js-btn-watched');
  if (localStorage.getItem(LOCAL_STORAGE_WATCHED) !== null) {
    watchedMoviesArr = [
      ...JSON.parse(localStorage.getItem(LOCAL_STORAGE_WATCHED)),
    ];
  }
  // check for unique value(id)

  if (watchedMoviesArr.leng === 0) {
    watchedMoviesArr.push(filmObject);
    Notify.success('Film add to watched');
    addToWatchedBtnRef.textContent = 'Remove from watched';
  } else if (!watchedMoviesArr.some(({ id }) => id === filmObject.id)) {
    watchedMoviesArr.push(filmObject);
    Notify.success('Film add to watched');
    addToWatchedBtnRef.textContent = 'Remove from watched';
  } else {
    watchedMoviesArr = watchedMoviesArr.filter(
      film => Number(film) !== filmObject.id
    );
    Notify.warning('Film Remove from watched');
    let index = watchedMoviesArr.findIndex(({ id }) => id === filmObject.id);
    watchedMoviesArr.splice(index, 1);
    addToWatchedBtnRef.textContent = 'Add to watched';
  }

  try {
    const serializedState = JSON.stringify(watchedMoviesArr);
    localStorage.setItem(LOCAL_STORAGE_WATCHED, serializedState);
  } catch (error) {
    console.error('Set state error: ', error.message);
  }
};
// --------------onAddToQueueHandle
const onAddToQueueHandle = evt => {
  let filmObject = currentResult;
  const addToQueueBtnRef = document.querySelector('.js-btn-queue');
  if (localStorage.getItem(LOCAL_STORAGE_QUEUE) !== null) {
    queueMoviesArr = [...JSON.parse(localStorage.getItem(LOCAL_STORAGE_QUEUE))];
  }
  // check for unique value(id)
  if (queueMoviesArr.lenght === 0) {
    queueMoviesArr.push(filmObject);
    Notify.success('Film added to queue');
    addToQueueBtnRef.textContent = 'Remove from queue';
  } else if (!queueMoviesArr.some(({ id }) => id === filmObject.id)) {
    queueMoviesArr.push(filmObject);
    Notify.success('Film added to queue');
    addToQueueBtnRef.textContent = 'Remove from queue';
  } else {
    queueMoviesArr = queueMoviesArr.filter(
      film => Number(film) !== filmObject.id
    );
    Notify.warning('Film Removed from queue');
    let index = queueMoviesArr.findIndex(({ id }) => id === filmObject.id);
    queueMoviesArr.splice(index, 1);
    addToQueueBtnRef.textContent = 'Add to queue';
  }
  try {
    const serializedState = JSON.stringify(queueMoviesArr);
    localStorage.setItem(LOCAL_STORAGE_QUEUE, serializedState);
  } catch (error) {
    console.error('Set state error: ', error.message);
  }
};
