// Элементы интерфейса
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const deleteButton = document.getElementById('delete-button');
const createFolderButton = document.getElementById('create-folder-button');
const foldersContainer = document.getElementById('custom-folders-container');
const imageFolder = document.getElementById('image-folder');
const imageContainer = document.getElementById('image-container');

let allImages = [];
let folderCounter = 1; // Счетчик для уникальных идентификаторов папок
let draggedImg = null;

// Ключи для localStorage
const STORAGE_KEY = 'saved_images';
const FOLDERS_STORAGE_KEY = 'saved_folders';
const FOLDER_COUNTER_KEY = 'folder_counter';

// Загружаем сохраненные изображения и папки при загрузке страницы
window.addEventListener('load', () => {
    const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    allImages = savedImages;
    savedImages.forEach(image => {
        loadImage({ src: image.src, alt: image.alt }, true);
    });

    // Восстанавливаем значение folderCounter из localStorage
    folderCounter = parseInt(localStorage.getItem(FOLDER_COUNTER_KEY)) || 1;
    loadFoldersFromStorage();
});

// Функция для загрузки одной картинки
function loadImage(fileOrUrl, isFromStorage = false) {
    const img = document.createElement('img');
    img.src = isFromStorage ? fileOrUrl.src : URL.createObjectURL(fileOrUrl);
    img.alt = isFromStorage ? fileOrUrl.alt : fileOrUrl.name;
    img.dataset.name = isFromStorage ? fileOrUrl.alt : fileOrUrl.name;
    img.setAttribute('draggable', true);
    img.dataset.source = 'asana';

    img.addEventListener('click', () => {
        img.classList.toggle('selected');
        updateDeleteButtonVisibility();
    });

    img.addEventListener('dragstart', (e) => {
        draggedImg = img;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', img.src);
        e.dataTransfer.setData('image/alt', img.alt);
        e.dataTransfer.setData('image/source', img.dataset.source);
    });

    img.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    img.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedImg !== img) {
            const draggedSrc = draggedImg.src;
            const draggedAlt = draggedImg.alt;

            draggedImg.src = img.src;
            draggedImg.alt = img.alt;

            img.src = draggedSrc;
            img.alt = draggedAlt;
        }
    });

    imageContainer.appendChild(img);
    if (!isFromStorage) {
        convertFileToBase64(fileOrUrl).then(base64 => {
            allImages.push({ src: base64, alt: fileOrUrl.name });
            saveImagesToStorage();
        });
    }
}

// Преобразуем файл в Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

// Сохраняем изображения в localStorage
function saveImagesToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allImages));
}

// Удаляем изображение из localStorage и DOM
function deleteImage(image) {
    allImages = allImages.filter(img => img.src !== image.src);
    saveImagesToStorage();
    image.remove();
}

// Обработчик для загрузки изображений
uploadButton.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            loadImage(files[i]);
        }
    }
});

// Обработчик для кнопки "Удалить"
deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const selectedImages = Array.from(imageContainer.querySelectorAll('img.selected'));
    selectedImages.forEach(img => {
        deleteImage(img);
    });
    updateDeleteButtonVisibility();
});

// Обновляем видимость кнопки "Удалить"
function updateDeleteButtonVisibility() {
    const selectedImages = Array.from(imageContainer.querySelectorAll('img.selected'));
    if (selectedImages.length > 0) {
        deleteButton.classList.remove('hidden');
    } else {
        deleteButton.classList.add('hidden');
    }
}

// Обработчик для кнопки "Создать папку"
createFolderButton.addEventListener('click', () => {
    const folderName = prompt('Введите название папки:');
    if (folderName) {
        createNewFolder(folderName);
    }
});

// Функция для создания новой папки
function createNewFolder(folderName) {
    const newFolder = document.createElement('div');
    newFolder.className = 'folder';
    newFolder.id = `folder-${folderCounter}`;

    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';

    const deleteFolderButton = document.createElement('button');
    deleteFolderButton.textContent = '🗑️';
    deleteFolderButton.className = 'delete-folder-button';
    deleteFolderButton.title = 'Удалить папку';
    folderHeader.appendChild(deleteFolderButton);

    const folderText = document.createElement('span');
    folderText.className = 'folder-text';
    folderText.textContent = `${folderName}`;
    folderHeader.appendChild(folderText);

    const renameButtonInFolder = document.createElement('button');
    renameButtonInFolder.textContent = '✏️';
    renameButtonInFolder.className = 'rename-in-folder-button';
    renameButtonInFolder.title = 'Переименовать папку';
    folderHeader.appendChild(renameButtonInFolder);

    newFolder.appendChild(folderHeader);

    const folderContent = document.createElement('div');
    folderContent.className = 'folder-content hidden';
    newFolder.appendChild(folderContent);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-wrapper';
    folderContent.appendChild(imageWrapper);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    folderContent.appendChild(buttonsContainer);

    const deleteButtonInFolder = document.createElement('button');
    deleteButtonInFolder.textContent = 'Удалить';
    deleteButtonInFolder.className = 'delete-in-folder-button hidden';
    buttonsContainer.appendChild(deleteButtonInFolder);

    const saveButtonInFolder = document.createElement('button');
    saveButtonInFolder.textContent = 'Сохранить';
    saveButtonInFolder.className = 'save-in-folder-button';
    buttonsContainer.appendChild(saveButtonInFolder);

    deleteButtonInFolder.addEventListener('click', () => {
        const selectedImages = Array.from(imageWrapper.querySelectorAll('img.selected'));
        selectedImages.forEach(img => {
            imageWrapper.removeChild(img);
        });
        alert('Выбранные картинки удалены из папки!');
        updateDeleteButtonInFolderVisibility(imageWrapper, deleteButtonInFolder);
        updateFolderInStorage(newFolder.id, folderName, imageWrapper); // Обновляем данные папки
    });

    saveButtonInFolder.addEventListener('click', () => {
        const selectedImages = Array.from(imageContainer.querySelectorAll('img.selected'));
        if (selectedImages.length > 0) {
            selectedImages.forEach(img => {
                const newImg = document.createElement('img');
                newImg.src = img.src;
                newImg.alt = img.alt;

                newImg.addEventListener('click', () => {
                    newImg.classList.toggle('selected');
                    updateDeleteButtonInFolderVisibility(imageWrapper, deleteButtonInFolder);
                });

                // Добавляем обработчики для перетаскивания
                newImg.setAttribute('draggable', true);
                newImg.addEventListener('dragstart', (e) => {
                    draggedImg = newImg;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', newImg.src);
                    e.dataTransfer.setData('image/alt', newImg.alt);
                });

                newImg.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                newImg.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (draggedImg !== newImg) {
                        const draggedSrc = draggedImg.src;
                        const draggedAlt = draggedImg.alt;

                        draggedImg.src = newImg.src;
                        draggedImg.alt = newImg.alt;

                        newImg.src = draggedSrc;
                        newImg.alt = draggedAlt;
                    }
                });

                imageWrapper.appendChild(newImg);
            });
            alert('Выбранные картинки сохранены в папку!');
            updateFolderInStorage(newFolder.id, folderName, imageWrapper); // Обновляем данные папки
        } else {
            alert('Нет выделенных картинок для сохранения.');
        }
    });

    renameButtonInFolder.addEventListener('click', () => {
        const newName = prompt('Введите новое название папки:', folderName);
        if (newName) {
            folderText.textContent = `${newName}`;
            alert(`Папка переименована в "${newName}"`);
            updateFolderInStorage(newFolder.id, newName, imageWrapper);
        }
    });

    deleteFolderButton.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить папку?')) {
            foldersContainer.removeChild(newFolder);
            removeFolderFromStorage(newFolder.id);
            alert('Папка удалена!');
        }
    });

    newFolder.style.border = '2px solid transparent';
    newFolder.addEventListener('mouseenter', () => {
        newFolder.style.border = '2px solid #cbd3c4';
    });
    newFolder.addEventListener('mouseleave', () => {
        newFolder.style.border = '2px solid transparent';
    });

    // Открываем/закрываем папку при нажатии на заголовок
    folderHeader.addEventListener('click', (e) => {
        // Открываем/закрываем папку при любом клике на заголовок
        folderContent.classList.toggle('hidden');
    });

    if (foldersContainer) {
        foldersContainer.insertBefore(newFolder, foldersContainer.firstChild);
        saveFolderToStorage(newFolder.id, folderName, imageWrapper);
        folderCounter++;
        localStorage.setItem(FOLDER_COUNTER_KEY, folderCounter.toString()); // Сохраняем обновленный счетчик
    } else {
        console.error('Элемент с id="custom-folders-container" не найден!');
    }
}

// Сохраняем папку в localStorage
function saveFolderToStorage(folderId, folderName, imageWrapper) {
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY)) || {};
    folders[folderId] = {
        name: folderName,
        images: Array.from(imageWrapper.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt
        }))
    };
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
}

// Обновляем папку в localStorage
function updateFolderInStorage(folderId, folderName, imageWrapper) {
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY)) || {};
    if (folders[folderId]) {
        folders[folderId].name = folderName;
        folders[folderId].images = Array.from(imageWrapper.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt
        }));
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    }
}

// Удаляем папку из localStorage
function removeFolderFromStorage(folderId) {
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY)) || {};
    delete folders[folderId];
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
}

// Загружаем папки из localStorage при загрузке страницы
function loadFoldersFromStorage() {
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY)) || {};
    for (const folderId in folders) {
        const folderData = folders[folderId];
        const newFolder = document.createElement('div');
        newFolder.className = 'folder';
        newFolder.id = folderId;

        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';

        const deleteFolderButton = document.createElement('button');
        deleteFolderButton.textContent = '🗑️';
        deleteFolderButton.className = 'delete-folder-button';
        deleteFolderButton.title = 'Удалить папку';
        folderHeader.appendChild(deleteFolderButton);

        const folderText = document.createElement('span');
        folderText.className = 'folder-text';
        folderText.textContent = folderData.name;
        folderHeader.appendChild(folderText);

        const renameButtonInFolder = document.createElement('button');
        renameButtonInFolder.textContent = '✏️';
        renameButtonInFolder.className = 'rename-in-folder-button';
        renameButtonInFolder.title = 'Переименовать папку';
        folderHeader.appendChild(renameButtonInFolder);

        newFolder.appendChild(folderHeader);

        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content hidden';
        newFolder.appendChild(folderContent);

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';
        folderContent.appendChild(imageWrapper);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        folderContent.appendChild(buttonsContainer);

        const deleteButtonInFolder = document.createElement('button');
        deleteButtonInFolder.textContent = 'Удалить';
        deleteButtonInFolder.className = 'delete-in-folder-button hidden';
        buttonsContainer.appendChild(deleteButtonInFolder);

        const saveButtonInFolder = document.createElement('button');
        saveButtonInFolder.textContent = 'Сохранить';
        saveButtonInFolder.className = 'save-in-folder-button';
        buttonsContainer.appendChild(saveButtonInFolder);

        deleteButtonInFolder.addEventListener('click', () => {
            const selectedImages = Array.from(imageWrapper.querySelectorAll('img.selected'));
            selectedImages.forEach(img => {
                imageWrapper.removeChild(img);
            });
            alert('Выбранные картинки удалены из папки!');
            updateDeleteButtonInFolderVisibility(imageWrapper, deleteButtonInFolder);
            updateFolderInStorage(newFolder.id, folderData.name, imageWrapper); // Обновляем данные папки
        });

        saveButtonInFolder.addEventListener('click', () => {
            const selectedImages = Array.from(imageContainer.querySelectorAll('img.selected'));
            if (selectedImages.length > 0) {
                selectedImages.forEach(img => {
                    const newImg = document.createElement('img');
                    newImg.src = img.src;
                    newImg.alt = img.alt;

                    newImg.addEventListener('click', () => {
                        newImg.classList.toggle('selected');
                        updateDeleteButtonInFolderVisibility(imageWrapper, deleteButtonInFolder);
                    });

                    // Добавляем обработчики для перетаскивания
                    newImg.setAttribute('draggable', true);
                    newImg.addEventListener('dragstart', (e) => {
                        draggedImg = newImg;
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', newImg.src);
                        e.dataTransfer.setData('image/alt', newImg.alt);
                    });

                    newImg.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    });

                    newImg.addEventListener('drop', (e) => {
                        e.preventDefault();
                        if (draggedImg !== newImg) {
                            const draggedSrc = draggedImg.src;
                            const draggedAlt = draggedImg.alt;

                            draggedImg.src = newImg.src;
                            draggedImg.alt = newImg.alt;

                            newImg.src = draggedSrc;
                            newImg.alt = draggedAlt;
                        }
                    });

                    imageWrapper.appendChild(newImg);
                });
                alert('Выбранные картинки сохранены в папку!');
                updateFolderInStorage(newFolder.id, folderData.name, imageWrapper); // Обновляем данные папки
            } else {
                alert('Нет выделенных картинок для сохранения.');
            }
        });

        renameButtonInFolder.addEventListener('click', () => {
            const newName = prompt('Введите новое название папки:', folderData.name);
            if (newName) {
                folderText.textContent = `${newName}`;
                alert(`Папка переименована в "${newName}"`);
                updateFolderInStorage(newFolder.id, newName, imageWrapper);
            }
        });

        deleteFolderButton.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить папку?')) {
                foldersContainer.removeChild(newFolder);
                removeFolderFromStorage(newFolder.id);
                alert('Папка удалена!');
            }
        });

        newFolder.style.border = '2px solid transparent';
        newFolder.addEventListener('mouseenter', () => {
            newFolder.style.border = '2px solid #cbd3c4';
        });
        newFolder.addEventListener('mouseleave', () => {
            newFolder.style.border = '2px solid transparent';
        });

        // Открываем/закрываем папку при нажатии на заголовок
        folderHeader.addEventListener('click', (e) => {
            // Открываем/закрываем папку при любом клике на заголовок
            folderContent.classList.toggle('hidden');
        });

        foldersContainer.insertBefore(newFolder, foldersContainer.firstChild);

        // Загружаем картинки в папку
        folderData.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;

            img.addEventListener('click', () => {
                img.classList.toggle('selected');
                updateDeleteButtonInFolderVisibility(imageWrapper, deleteButtonInFolder);
            });

            // Добавляем обработчики для перетаскивания
            img.setAttribute('draggable', true);
            img.addEventListener('dragstart', (e) => {
                draggedImg = img;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', img.src);
                e.dataTransfer.setData('image/alt', img.alt);
            });

            img.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            img.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedImg !== img) {
                    const draggedSrc = draggedImg.src;
                    const draggedAlt = draggedImg.alt;

                    draggedImg.src = img.src;
                    draggedImg.alt = img.alt;

                    img.src = draggedSrc;
                    img.alt = draggedAlt;
                }
            });

            imageWrapper.appendChild(img);
        });
    }
}

// Функция для обновления видимости кнопки "Удалить" в папке
function updateDeleteButtonInFolderVisibility(imageWrapper, deleteButton) {
    const selectedImages = Array.from(imageWrapper.querySelectorAll('img.selected'));
    if (selectedImages.length > 0) {
        deleteButton.classList.remove('hidden');
    } else {
        deleteButton.classList.add('hidden');
    }
}

// Обработчик для папки "Асаны"
const folderHeader = imageFolder.querySelector('.folder-header');
const folderContent = imageFolder.querySelector('.folder-content');

folderHeader.addEventListener('click', (e) => {
    folderContent.classList.toggle('hidden');
});

// Обработчики для перетаскивания картинок в новые папки
foldersContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

foldersContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const folder = e.target.closest('.folder');
    if (folder) {
        const imageSrc = e.dataTransfer.getData('text/plain');
        const imageAlt = e.dataTransfer.getData('image/alt');
        const imageSource = e.dataTransfer.getData('image/source');

        if (imageSource === 'asana') {
            const imageWrapper = folder.querySelector('.image-wrapper');
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = imageAlt;

            img.addEventListener('click', () => {
                img.classList.toggle('selected');
                updateDeleteButtonInFolderVisibility(imageWrapper, folder.querySelector('.delete-in-folder-button'));
            });

            // Добавляем обработчики для перетаскивания
            img.setAttribute('draggable', true);
            img.addEventListener('dragstart', (e) => {
                draggedImg = img;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', img.src);
                e.dataTransfer.setData('image/alt', img.alt);
            });

            img.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            img.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedImg !== img) {
                    const draggedSrc = draggedImg.src;
                    const draggedAlt = draggedImg.alt;

                    draggedImg.src = img.src;
                    draggedImg.alt = img.alt;

                    img.src = draggedSrc;
                    img.alt = draggedAlt;
                }
            });

            imageWrapper.appendChild(img);

            // Обновляем данные папки в localStorage
            updateFolderInStorage(folder.id, folder.querySelector('.folder-text').textContent, imageWrapper);
        }
    }
});
