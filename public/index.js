document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileUpload");
    const dragDropArea = document.getElementById("dragDropArea");
    const submitBtn = document.getElementById("submitBtn");

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

    submitBtn.addEventListener("click", async () => {
        const inputFiles = fileInput.files;
        const files = [...inputFiles, ...droppedFiles];
    
        if (files.length === 0) {
            alert("Please select or drag and drop images to upload.");
            return;
        }
    
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('message', document.getElementById('message').value);
    
        try {
            const response = await fetch('https://safah.netlify.app.netlify/functions/submit', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                alert('Images uploaded successfully!');
            } else {
                const errorText = await response.text();
                alert(`Failed to upload images: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading images.');
        }
    });
    
});
