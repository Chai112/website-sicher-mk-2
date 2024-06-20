const stripe = Stripe('pk_live_51LrrbQHO7q6kHiMakvEMwZxFwAqWM3083hjYhIL4GevwYVHdnUq40lfaOOGbWd5f6szIBcEFFEeOzM8iO2a1a2aJ00glv7loBX');
let elements;
let paymentElement;
let g_token = null;

function _showError(idName, value) {
    if (value !== "") {
        document.getElementById(idName).innerHTML = value;
        document.getElementById(idName).classList.remove("hidden");
        document.getElementById(idName).classList.add("shake");
    } else {
        document.getElementById(idName).classList.add("hidden");
        document.getElementById(idName).classList.remove("shake");
    }
}

async function _setRegisterLoading(isLoading) {
    if (isLoading) {
        document.getElementById("register-loader").classList.remove("hidden");
        document.getElementById("register-button").classList.add("hidden");
    } else {
        document.getElementById("register-loader").classList.add("hidden");
        document.getElementById("register-button").classList.remove("hidden");
    }
}

async function _setPaymentLoading(isLoading) {
    if (isLoading) {
        document.getElementById("payment-loader").classList.remove("hidden");
        document.getElementById("payment-button").classList.add("hidden");
    } else {
        document.getElementById("payment-loader").classList.add("hidden");
        document.getElementById("payment-button").classList.remove("hidden");
    }
}

async function _setQuestionnaireLoading(isLoading) {
    if (isLoading) {
        document.getElementById("questionnaire-loader").classList.remove("hidden");
        document.getElementById("questionnaire-button").classList.add("hidden");
    } else {
        document.getElementById("questionnaire-loader").classList.add("hidden");
        document.getElementById("questionnaire-button").classList.remove("hidden");
    }
}

async function _postToServer(data) {
    return await fetch("https://server-singapore.scholarity.io/", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function _register(plan, currency) {
    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    // clear errors
    _showError('error-name', "");
    _showError('error-email', "");
    _showError('error-password', "");

    if (name.value === "") {
        _showError('error-name', "Please enter your name.");
        return;
    }
    if (email.value === "") {
        _showError('error-email', "Please enter your email.");
        return;
    }
    var validRegex = /^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+/;
    if (!email.value.match(validRegex)) {
        _showError('error-email', "Please enter a valid email.");
        return;
    }
    if (password.value === "") {
        _showError( 'error-password', "Please enter your password.");
        return;
    }

    // parse the names
    let names = name.value.split(' ');
    let firstName = "", lastName = "";
    if (names.length > 1) {
        firstName = names[0];
        // last names are all the names after the first one.
        for (let i = 1; i < names.length; i++) {
            lastName += `${names[i]} `;
        }
        lastName = lastName.substring(0, lastName.length - 1);
    } else {
        firstName = name.value;
    }

    _setRegisterLoading(true);
    try {
        let response = await _postToServer({
            action: "register",
            username: email.value,
            password: password.value,
            email: email.value,
            firstName: firstName,
            lastName: lastName,
            organizationId: 0,
        });

        let responseBody = await response.json();
        if (response.status === 200) {
            // successful register
            await _postRegister(responseBody.token, plan, currency, name.value);
            _setRegisterLoading(false);
        } else {
            if (responseBody.message === "user already exists") {
                _showError('error-email', "Email already exists - Please login instead");
                window.location.assign("https://scholarity.io/app/#/login")
            } else {
                alert("Something went wrong.");
                _showError('error-email', "Something went wrong.");
            }
            _setRegisterLoading(false);
            return;
        }
        
    } catch (e) {
        alert("Something went wrong.");
        alert(e);
        _showError('error-email', "Something went wrong.");
        _setRegisterLoading(false);
        return;
    }
}

// executed on succesful register
async function _postRegister(token, plan, currency, orgName) {
    // create an organization for that user
    let orgResponse = await _postToServer({
        action: "createOrganization",
        token: token,
        organizationName: orgName,
    });
    let orgResponseBody = await orgResponse.json();
    let organizationId = orgResponseBody.organizationId;

    // create subscription based off organization
    let subscriptionReponse = await _postToServer({
        action: "createStripeSubscription",
        token: token,
        organizationId: organizationId,
        currency: currency,
        plan: plan,
    });
    let subscriptionResponseBody = await subscriptionReponse.json();

    // if free tier, we skip this and proceed to log in.
    if (plan === 0) {
        g_token = token;
        document.getElementById('checkout-stage-1').classList.add("hidden");
        document.getElementById('checkout-stage-3').classList.remove("hidden");
        return;
    }

    const options = {
        clientSecret: subscriptionResponseBody.data.clientSecret,
        // Fully customizable with appearance API.
        appearance: {/*...*/},
        layout: {
            type: 'tabs',
            defaultCollapsed: false,
        }
    };

    // Create and mount the Payment Element
    elements = stripe.elements(options);
    paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    document.getElementById('checkout-stage-1').classList.add("hidden");
    document.getElementById('checkout-stage-2').classList.remove("hidden");
}

async function _submitQuestionnaire(country, isMobile) {
    let profession = document.getElementById("profession");
    let busWork = document.getElementById("bus-work");
    let busSize = document.getElementById("bus-size");

    // clear errors
    _showError('error-profession', "");
    _showError('error-bus-work', "");
    _showError('error-bus-size', "");

    if (profession.value === "") {
        _showError('error-profession', "This field is required.");
        return;
    }
    if (busWork.value === "please-select") {
        _showError('error-bus-work', "This field is required.");
        return;
    }
    if (busSize.value === "please-select") {
        _showError( 'error-bus-size', "This field is required.");
        return;
    }
    let questionnaireData = {
        profession: profession.value,
        busWork: busWork.value,
        busSize: busSize.value,
        country: country,
        isMobile: isMobile,
    };

    // go to portal
    if (g_token !== null) {
        _setQuestionnaireLoading(true);
        await _postToServer({
            action: "reportAnalyticsForm",
            token: g_token,
            analyticsFormType: 0,
            analyticsFormData: questionnaireData,
        });

        window.location.assign("https://scholarity.io/app/#/portal?token=" + g_token);
    } else {
        alert("Something went wrong.");
    }
}

$(document).ready(function(){
    let country = "unknown";
    let isMobile = "unknown";
    $.get("https://ipinfo.io?token=1ecc7586d05e43", function (response) {
        country = response.country;
        console.log("country:" + country);
        console.log("isMobile: " + isMobile);
    }, "jsonp");
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        isMobile = "mobile";
      }else{
        isMobile = "desktop";
      }
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const plan = parseInt(urlParams.get('plan'));
    if (plan !== 0 && plan !== 1 && plan !== 2) {
        alert("invalid plan!");
    }
    const planElement = document.getElementById('plan-' + plan);
    planElement.classList.remove("hidden");
  
    // clear fields
    document.getElementById('name').innerHTML = "";
    document.getElementById('email').innerHTML = "";
    document.getElementById('password').innerHTML = "";
    // hide all errors
    var divsToHide = document.getElementsByClassName("error-text");
    for (var i = 0; i < divsToHide.length; i++) {
        divsToHide[i].classList.add("hidden");
    }

    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        _register(plan, 'inr');
    });

    const questionnaireForm = document.getElementById("questionnaireForm");
    questionnaireForm.addEventListener("submit", (e) => {
        e.preventDefault();
        _submitQuestionnaire(country, isMobile);
    });

    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', async (event) => {
        _setPaymentLoading(true);
        event.preventDefault();

        const {error} = await stripe.confirmSetup({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
            return_url: "https://scholarity.io/app/#/login",
            }
        });

        if (error) {
            _setPaymentLoading(false);
            // This point will only be reached if there is an immediate error when
            // confirming the payment. Show error to your customer (for example, payment
            // details incomplete)
            const messageContainer = document.querySelector('#error-message');
            messageContainer.textContent = error.message;
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    });
});
