// NOTE: jquery required

async function fetchServer(data) {
    return await fetch("https://server-singapore.scholarity.io/", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function isAuthenticated() {
    const token = localStorage.getItem("scholauth-token");
    const userData = await fetchServer({action: "getUserFromToken", token: token});
    if (userData.status === 403) {
        console.log(403)
        localStorage.setItem("scholauth-token", undefined);
        return false;
    }
    if (token !== undefined) {
        return true;
    }
    return false;
}

function authenticate(token) {
    localStorage.setItem("scholauth-token", token);
}

async function checkout() {
    gotoScholauthPage("checkout");
    // TODO change this function
    // this is specific to the type of thing you use the scholauth for
    const trainingId = new URLSearchParams(window.location.search).get("trainingId");
    const token = localStorage.getItem("scholauth-token");
    const response = await fetchServer({
        action: "sicher_createBooking",
        sicherTrainingId: trainingId,
        token: token,
    });
    const responseBody = await response.json();
    const bookingId = responseBody.data;
    window.location.href = `reserved.html?bookingId=${bookingId}`;
}

function showError(idName, value) {
    if (value !== "") {
        $(`#${idName}`).text(value);
        $(`#${idName}`).removeClass("hidden");
        $(`#${idName}`).addClass("shake");
    } else {
        $(`#${idName}`).addClass("hidden");
        $(`#${idName}`).removeClass("shake");
    }
}

function toggleLoginRegister() {
    let isRegisterMode = $("#login-page").hasClass("hidden");
    if (isRegisterMode) {
        gotoScholauthPage("login");
    } else {
        gotoScholauthPage("register");
    }
}

function setButtonLoading(isLoading) {
    if (isLoading) {
        $("#loader").removeClass("hidden");
        $(".scholauth-button-container").each(function() {
            $(this).addClass("hidden");
        });
    } else {
        $("#loader").addClass("hidden");
        $(".scholauth-button-container").each(function() {
            $(this).removeClass("hidden");
        });
    }
}

async function login() {
    const email = $("#login-email").val();
    const password = $("#login-password").val();

    // clear errors
    showError('login-error-email', "");
    showError('login-error-password', "");

    setButtonLoading(true);
    try {
        let response = await fetchServer({
            action: "login",
            username: email,
            password: password,
            organizationId: 0,
        });

        let responseBody = await response.json();
        if (response.status === 200) {
            // successful register
            authenticate(responseBody.token);
            await checkout();
        } else {
            const errorData = responseBody.errorData;
            switch (errorData.authErrorType) {
                case "email":
                case "general":
                    showError('login-error-email', errorData.message);
                    break;
                case "password":
                    showError('login-error-password', errorData.message);
                    break;
                default:
                    alert("Something went wrong.");
                    showError('login-error-email', "Something went wrong.");
            }
            setButtonLoading(false);
            return;
        }
        
    } catch (e) {
        alert("Something went wrong.");
        alert(e);
        showError('login-error-email', "Something went wrong.");
        setButtonLoading(false);
        return;
    }
}

async function register() {
    const name = $("#register-name").val();
    const email = $("#register-email").val();
    const password = $("#register-password").val();

    // clear errors
    showError('register-error-name', "");
    showError('register-error-email', "");
    showError('register-error-password', "");

    // parse the names
    const names = name.split(' ');
    let firstName = "", lastName = "";
    if (names.length > 1) {
        firstName = names[0];
        // last names are all the names after the first one.
        for (let i = 1; i < names.length; i++) {
            lastName += `${names[i]} `;
        }
        lastName = lastName.substring(0, lastName.length - 1);
    } else {
        firstName = name;
    }

    setButtonLoading(true);
    try {
        let response = await fetchServer({
            action: "register",
            username: email,
            password: password,
            email: email,
            firstName: firstName,
            lastName: lastName,
            organizationId: 0,
        });

        let responseBody = await response.json();
        if (response.status === 200) {
            // successful register
            authenticate(responseBody.token);
            await checkout();
        } else {
            const errorData = responseBody.errorData;
            switch (errorData.authErrorType) {
                case "name":
                case "general":
                    showError('register-error-name', errorData.message);
                    break;
                case "email":
                    showError('register-error-email', errorData.message);
                    break;
                case "password":
                    showError('register-error-password', errorData.message);
                    break;
                default:
                    alert("Something went wrong.");
                    showError('register-error-name', "Something went wrong.");
            }
            setButtonLoading(false);
            return;
        }
        
    } catch (e) {
        alert("Something went wrong.");
        alert(e);
        _showError('register-error-email', "Something went wrong.");
        setButtonLoading(false);
        return;
    }
}

function gotoScholauthPage(page) {
    $("#init-page").addClass("hidden");
    $("#register-page").addClass("hidden");
    $("#login-page").addClass("hidden");
    $("#checkout-page").addClass("hidden");
    switch (page) {
        case "init":
            $("#init-page").removeClass("hidden");
            break;
        case "login":
            $("#login-page").removeClass("hidden");
            break;
        case "register":
            $("#register-page").removeClass("hidden");
            break;
        case "checkout":
            $("#checkout-page").removeClass("hidden");
            break;
    }
}

$(document).ready(async function(){
    gotoScholauthPage("init");
    try {
        if (await isAuthenticated()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await checkout();
            return;
        }

    } catch (e) {
        $("#init-error").removeClass("hidden");
        $("#init-error").text(`Failed to connect to Scholarity
Please email contact@scholarity.io
Error: ${e}`);
        $("#init-page").addClass("hidden");
        return;
    }
    gotoScholauthPage("register");
  
    // clear fields
    $("#register-name").val("");
    $("#register-email").val("");
    $("#register-password").val("");
    $("#login-email").val("");
    $("#login-password").val("");

    // hide all errors
    $(".error-text").each(function() {
        $(this).addClass("hidden");
    });
    $("#register-password").on("focus", () => {
        console.log("a")
        $("#register-password-hints").removeClass("hidden");
    });
});
