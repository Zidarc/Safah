const fileInput = document.getElementById("fileUpload");
const dragDropArea = document.getElementById("dragDropArea");
const output = document.getElementById("output");

let imageList = [];

const imagekit = new ImageKit({
    publicKey: "public_XT2xiMLSDVPDCVgXODwralEaBso=",
    urlEndpoint: "https://ik.imagekit.io/hmlgaiv6o",
    authenticationEndpoint: "https://safah.netlify.app/.netlify/functions/imagekit-auth"
});

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

dragDropArea.addEventListener("dragleave", () => {
    dragDropArea.classList.remove("dragover");
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

        const folderName = `Home/${name}_${email}`;

        try {
            // Fetch authentication details once
            console.log('Fetching authentication details...');
            const authResponse = await fetch("https://safah.netlify.app/.netlify/functions/imagekit-auth");
            if (!authResponse.ok) {
                throw new Error("Failed to fetch auth details");
            }
            const authData = await authResponse.json();
            console.log('Authentication details fetched successfully:', authData);

            // Upload each image using the same auth details
            for (let i = 0; i < imageList.length; i++) {
                const file = imageList[i];
                const fileName = `${name}_${file.name}`;

                console.log(`Uploading image ${i + 1}: ${fileName}...`);
                const uploadResponse = await imagekit.upload({
                    file: file,
                    fileName: fileName,
                    token: authData.token,
                    signature: authData.signature,
                    expire: authData.expire,
                });

                if (!uploadResponse || uploadResponse.error) {
                    throw new Error("Failed to upload image to ImageKit");
                }
                console.log(`Image ${i + 1} uploaded successfully:`, uploadResponse);
            }

            console.log('Submitting form data...');
            const serverResponse = await fetch('https://safah.netlify.app/.netlify/functions/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            if (serverResponse.ok) {
                console.log('Form submitted successfully!');
                alert('Form submitted successfully!');
                // Clear form and images
                document.querySelector('form').reset();
                imageList = [];
                updateImagePreview();
            } else {
                const responseBody = await serverResponse.text();
                console.error('Failed to submit form:', responseBody);
                alert(`Failed to submit form: ${responseBody}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the images or submitting the form.');
        }

    });
});
