document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileUpload");
    const dragDropArea = document.getElementById("dragDropArea");

    let droppedFiles = [];

    fileInput.addEventListener("change", () => {
        displayFiles([...fileInput.files], 'fileList');
    });

    dragDropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragDropArea.classList.add("dragover");
    });

    dragDropArea.addEventListener("dragleave", () => {
        dragDropArea.classList.remove("dragover");
    });

    dragDropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dragDropArea.classList.remove("dragover");
        droppedFiles = [...e.dataTransfer.files];
        displayFiles(droppedFiles, 'dropFileList');
    });

    function displayFiles(files, targetId) {
        const fileList = document.getElementById(targetId);
        fileList.innerHTML = '';
        files.forEach(file => {
            const fileItem = document.createElement('p');
            fileItem.textContent = file.name;
            fileList.appendChild(fileItem);
        });
    }
});
