const MAX_FILES = 3;
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const fileList = document.getElementById('fileList');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const warningMessage = document.querySelector('.warning');
const fileBox = document.querySelector('.file-list');
let uploadInterval;
let currentFiles = new DataTransfer();
let pendingFiles = []; // Файлы, ожидающие отображения

fileInput.addEventListener('change', function (e) {
    const newFiles = Array.from(e.target.files);
    const availableSlots = MAX_FILES - currentFiles.items.length;

    // Проверка 1: Если места нет
    if (availableSlots <= 0) {
        // alert(`Максимальное количество файлов: ${MAX_FILES}!`);
        warningMessage.style.display = 'block'
        e.target.value = '';
        return;
    }

    // Проверка 2: Новых файлов больше доступных слотов
    if (newFiles.length > availableSlots) {
        // alert(`Можно добавить только ${availableSlots} файлов из ${newFiles.length}!`);
        warningMessage.style.display = 'block'
        e.target.value = '';
        return;
    }

    // Фильтрация дубликатов
    const uniqueNewFiles = newFiles.filter(newFile =>
        !Array.from(currentFiles.files).some(existingFile =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    ).slice(0, availableSlots);

    // Проверка 3: Все файлы - дубликаты
    if (uniqueNewFiles.length === 0) {
        alert('Все выбранные файлы уже добавлены!');
        e.target.value = '';
        return;
    }

    uniqueNewFiles.forEach(file => currentFiles.items.add(file));
    fileInput.files = currentFiles.files;
    pendingFiles = Array.from(fileInput.files);
    startProgress();
});

// Добавьте эту функцию для проверки
// function logCurrentFiles() {
//     console.log('Текущие файлы:', Array.from(fileInput.files).map(f => f.name));
//     console.log('Количество файлов:', fileInput.files.length);
// }


function startProgress() {
    fileBox.style.display = 'flex';
    warningMessage.style.display = 'none';
    let progress = 0;
    fileList.innerHTML = ''; // Очищаем список перед началом новой загрузки
    progressContainer.classList.remove('hidden');
    deleteAllBtn.classList.add('hidden');

    uploadInterval = setInterval(() => {
        progress += 5;
        progressText.textContent = `Загрузка файлов ${progress}%`;

        if (progress >= 100) {
            clearInterval(uploadInterval);
            progressContainer.classList.add('hidden');
            deleteAllBtn.classList.remove('hidden');
            renderFileList(); // Показываем файлы только после завершения прогресса
        }
    }, 50);
}

function renderFileList() {
    fileList.innerHTML = '';
    pendingFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
        <div>${file.name}</div>
      `;
        fileList.appendChild(item);
    });
}

function removeFile(index) {
    const newDataTransfer = new DataTransfer();
    pendingFiles.forEach((file, i) => {
        if (i !== index) newDataTransfer.items.add(file);
    });
    currentFiles = newDataTransfer;
    fileInput.files = currentFiles.files;
    pendingFiles = Array.from(fileInput.files);
    renderFileList();
}


function deleteAllFiles() {
    // Очищаем DataTransfer
    currentFiles = new DataTransfer();
    // Очищаем файлы в инпуте
    fileInput.files = currentFiles.files;
    // Очищаем список файлов
    pendingFiles = [];
    // Очищаем DOM-элемент со списком
    fileList.innerHTML = '';
    // Скрываем кнопку удаления
    deleteAllBtn.classList.add('hidden');

    warningMessage.style.display = 'none';
    fileBox.style.display = 'none';

    // Добавляем сброс значения инпута для полной очистки
    fileInput.value = '';

    // Очищаем прогресс если активен
    if (uploadInterval) {
        clearInterval(uploadInterval);
        progressContainer.classList.add('hidden');
    }
}
