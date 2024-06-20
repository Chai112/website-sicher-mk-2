// NOTE: jquery required

function toggleLoginRegister() {
    let isRegisterMode = $("#loginForm").hasClass("hidden");
    if (isRegisterMode) {
        $("#registerForm").addClass("hidden"); 
        $("#loginForm").removeClass("hidden");
    } else {
        $("#registerForm").removeClass("hidden"); 
        $("#loginForm").addClass("hidden");
    }
}

$(document).ready(function(){
  
    // clear fields
    $("#name").text("");
    $("#email").text("");
    $("#password").text("");
    $("#loginForm").addClass("hidden");
    // hide all errors
    $(".error-text").each(function() {
        $(this).addClass("hidden");
    });
});
