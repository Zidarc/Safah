document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const files = document.getElementById('fileUpload').files;

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        // Collect file URLs
        const fileUrls = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadResponse = await fetch('/', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const responseData = await uploadResponse.json();
                    const fileUrl = responseData.url; // Assuming Netlify returns a JSON with the file URL
                    fileUrls.push(fileUrl);
                } else {
                    alert(`Failed to upload file: ${file.name}`);
                    return;
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('An error occurred while uploading files.');
                return;
            }
        }

        const formData = {
            name: name,
            email: email,
            message: message,
            fileUrls: fileUrls // Send file URLs to the serverless function
        };

        try {
            const response = await fetch('https://safah.netlify.app/.netlify/functions/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Form submitted successfully!');
            } else {
                const responseBody = await response.text();
                alert(`Failed to submit form: ${responseBody}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
});
