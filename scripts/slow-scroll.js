$(document).ready(function(){
    function reveal() {
        $(".slow-scroll").css(
            "margin-top",
            (window.scrollY * 0.05) + "vh"
        );
        $(".slow-scroll-2").css(
            "margin-top",
            (window.scrollY * 0.02) + "vh"
        );
    }
    window.addEventListener("scroll", reveal);

    // To check the scroll position on page load
    reveal();
});