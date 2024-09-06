const fileInput = document.getElementById("fileUpload");
const dragDropArea = document.getElementById("dragDropArea");
const output = document.getElementById("output");
let imageList = [];

// SDK initialization for ImageKit
const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY, 
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT, 
    authenticationEndpoint: "https://safah.netlify.app/.netlify/functions/imagekit-auth"
});

// Function to update image preview
function updateImagePreview() {
    output.innerHTML = "";
    imageList.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("img-container");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `Image ${index + 1}`;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.classList.add("remove-btn");
            removeBtn.addEventListener("click", () => {
                imageList.splice(index, 1);
                updateImagePreview();
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            output.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    });
}

// Event listeners for file input and drag-and-drop
fileInput.addEventListener("change", () => {
    Array.from(fileInput.files).forEach(file => {
        if (file.type.startsWith("image/")) {
            imageList.push(file);
            updateImagePreview();
        } else {
            alert("Only image files are allowed.");
        }
    });
});

dragDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dragDropArea.classList.add("dragover");
});

dragDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDropArea.classList.remove("dragover");

    Array.from(e.dataTransfer.files).forEach(file => {
        if (file.type.startsWith("image/")) {
            imageList.push(file);
            updateImagePreview();
        } else {
            alert("Only image files are allowed.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message || imageList.length === 0) {
            alert("Please fill in all fields and upload at least one image.");
            return;
        }

        try {
            for (let i = 0; i < imageList.length; i++) {
                const file = imageList[i];
                const fileName = `${name}_${file.name}`; // Creating a unique filename

                // Fetch authentication details from your serverless function
                const authResponse = await fetch(imagekit.authenticationEndpoint);
                if (!authResponse.ok) {
                    throw new Error("Failed to fetch auth details");
                }
                const authData = await authResponse.json();

                // Upload image to ImageKit
                await imagekit.upload({
                    file: file,
                    fileName: fileName,
                    folder: `/uploads/${email}`, // Creating a folder with the user's name
                    token: authData.token,
                    signature: authData.signature,
                    expire: authData.expire,
                });
            }

            // Send the user's information to your server
            const serverResponse = await fetch('https://safah.netlify.app/.netlify/functions/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                }),
            });

            if (serverResponse.ok) {
                alert('Form submitted successfully!');
            } else {
                const responseBody = await serverResponse.text();
                alert(`Failed to submit form: ${responseBody}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the images or submitting the form.');
        }
    });
});
