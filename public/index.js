document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", async () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        const formData = {
            name: name,
            email: email,
            message: message
        };

        try {
            const response = await fetch('https://safah.netlify.app/.netlify/functions/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Log the response status and text for debugging
            console.log(`Response status: ${response.status}`);
            const responseBody = await response.text();
            console.log(`Response body: ${responseBody}`);

            if (response.ok) {
                alert('Form submitted successfully!');
            } else {
                alert(`Failed to submit form: ${responseBody}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
});
