$(document).ready(function(){
    var nameToHeight = [];
    $(".row h1").each(function (i, obj) {
        //alert($(this).text());
        $("#bookmark").append(
            `<p>${$(this).text()}</p>`
        )
        nameToHeight.push({"name": $(this).text(), "height": this.getBoundingClientRect().top});
    });
    $(".bookmark-tile p").click(function () {
        for (let i = 0; i < nameToHeight.length; i++) {
            if (nameToHeight[i].name === $(this).text()) {
                $('html, body').animate({
                    scrollTop: nameToHeight[i].height - 20
                }, 800, function(){});
            }
        }
    })
});