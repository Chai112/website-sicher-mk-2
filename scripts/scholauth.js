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

async function pingServer() {
    try {
        const res = await fetchServer({});
        //await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    } catch (e) {
        $("#init-error").removeClass("hidden");
        $("#init-error").text(`Failed to connect to Scholarity
Please email contact@scholarity.io
Error: ${e}`);
        $("#init-page").addClass("hidden");
        return false;
    }
}

function isAuthenticated() {
    const token = localStorage.getItem("scholauth-token");
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.href = "reserved.html";
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

    if (email === "") {
        showError('login-error-email', "Please enter your email.");
        return;
    }
    if (password === "") {
        showError('login-error-password', "Please enter your password.");
        return;
    }

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
            switch (responseBody.message) {
                case "no user exists":
                    showError('login-error-email', "Username cannot be found.");
                    break;
                case "passwords do not match":
                    showError('login-error-password', "Password is incorrect.");
                    break;
                default:
                    alert("Something went wrong.");
                    showError('login-error-email', "Something went wrong.");
                    break;
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

    if (name === "") {
        showError('register-error-name', "Please enter your name.");
        return;
    }
    if (email === "") {
        showError('register-error-email', "Please enter your email.");
        return;
    }
    var validRegex = /^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+/;
    if (!email.match(validRegex)) {
        showError('register-error-email', "Please enter a valid email.");
        return;
    }
    if (password === "") {
        showError('register-error-password', "Please enter your password.");
        return;
    }

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

    // extra policies
    if (password.length < 8) {
        showError('register-error-password', "Password is too short.");
        return
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
            if (responseBody.message === "user already exists") {
                showError('register-error-email', "Email already exists - Please login instead");
            } else {
                alert("Something went wrong.");
                showError('register-error-email', "Something went wrong.");
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
    /*
    if (isAuthenticated()) {
        await checkout();
        return;
    }
        */

    gotoScholauthPage("init");
    await pingServer();
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
});
