$(document).ready(function () {
    let contactForm = document.getElementById("contactForm");
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let email = document.getElementById("email");
        let name = document.getElementById("name");
        let message = document.getElementById("message");


        let data = {
            email: email.value,
            name: name.value,
            message: message.value,
        }

        fetch('https://server-singapore.scholarity.io/submit-contact-form?contactFormData=' + JSON.stringify(data)).then(async function (res) {
            if (res.status === 403) {
                let data = await res.json();
                alert(data.message);
                return;
            } else if (res.status === 200) {
                let contactFormSuccessMessage = document.getElementById("contactFormSuccessMessage");
                contactForm.classList.add("hidden");
                contactFormSuccessMessage.classList.remove("hidden");
                return;
            } else {
                alert("Unknown server error. Please send an email to contact@scholarity.io.")
                return;
            }
        });
    });
});