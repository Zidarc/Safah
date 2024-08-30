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

            if (response.ok) {
                alert('Form submitted successfully!');
            } else {
                const errorText = await response.text();
                alert(`Failed to submit form: ${errorText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
});
