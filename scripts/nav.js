var showingNavcover = false;

$(document).ready(function(){
    checkShowTop();
    window.onscroll = function() {
        checkShowTop();
    }
    var forceAtTop = false;
    function checkShowTop () {
        var currentScrollPos = window.pageYOffset;
        if (currentScrollPos < (screen.height / 2) - 110) {
            document.getElementById("navbar").classList.add("at-top");
            document.getElementById("navbar").classList.remove("shadow-sm");
            $("body").css("background-color", "#A33035");
        } else {
            if (!forceAtTop) {
                document.getElementById("navbar").classList.remove("at-top");
                document.getElementById("navbar").classList.add("shadow-sm");
                $("body").css("background-color", "white");
            }
        }
    }
    $("#navcover-section").css("display", "none");
    $("#services").click(function() {
        if (!showingNavcover) {
            $("#services").addClass("force-on");
            $("#main-navigation").removeClass("show");
            $("#navcover-section").css("display", "block");
            $("#navcover-col-1").removeClass("col-2-shown");
            setTimeout(
            function() 
            {
                $("#navcover").css("opacity", "100%");
            }, 10);
            $('html, body').css({
                overflow: 'hidden',
                height: '100%'
            });
            document.getElementById("navbar").classList.add("at-top");
            document.getElementById("navbar").classList.remove("shadow-sm");
            $("body").css("background-color", "#A33035");
            forceAtTop = true; 
            showingNavcover = true;
        } else {
            hideNavCover();
        }
    });
    $("#navcover").click(function() {
        setTimeout(
        function() 
        {
            if (!hasElementOnNavCoverBeenClicked) {
                hideNavCover();
            }
            hasElementOnNavCoverBeenClicked = false;
        }, 10);
    });

    function hideNavCover() {
        showingNavcover = !showingNavcover;
        $("#services").removeClass("force-on");
        $("#navcover").css("opacity", "0%");
        setTimeout(
        function() 
        {
            $("#navcover-section").css("display", "none");
        }, 500);
        $('html, body').css({
            overflow: 'auto',
            height: 'auto'
        });
        forceAtTop = false;
        showingNavcover = false;
    }

    var hasElementOnNavCoverBeenClicked = false;

    // show first column
    for (let i = 0; i < navdata.items.length; i++) {
        var name = navdata.items[i].name;
        var idName = `navcover-item-col-1-${i}`;
        var element = `<div class="navcover-item" id="${idName}">` +
            '<div class="row">' +
                `<div class="col">${name}` +
                '</div>';
        if (navdata.items[i].items.length !== 0) {
            element = element + '<div class="col col-lg-2 left-tri"></div>';
        }
        element = element + '</div>' +
        '</div>';

        $("#navcover-col-1").append(element);

        // handle first column click
        $(`#${idName}`).click( function () {
            hasElementOnNavCoverBeenClicked = true;
            $("#navcover-col-1").addClass("col-2-shown");

            // if has no children,
            // jump to href
            if (navdata.items[i].items.length == 0) {
                window.location.href = navdata.items[i].link;
            }

            // handle force-on class on all first rows
            for (let j = 0; j < navdata.items.length; j++) {
                var name = navdata.items[j].name;
                var idName = `navcover-item-col-1-${j}`;

                // is this class the same as my class?
                if (j == i) {
                    // yes, add force-on to the current first row
                    $(`#${idName}`).addClass("force-on");
                } else {
                    // no, remove force-on if there is already force-on
                    if ($(`#${idName}`).hasClass("force-on")) {
                        $(`#${idName}`).removeClass("force-on");
                    } 
                }
            }

            // show second column
            $("#navcover-col-2").html("");
            for (let j = 0; j < navdata.items[i].items.length; j++) {
                var name = navdata.items[i].items[j].name;
                let idName = `navcover-item-col-2-${j}`;
                $("#navcover-col-2").append(
                    `<div class="navcover-item" id="${idName}">` +
                        '<div class="row">' +
                            `<div class="col">${name}` +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                $(`#${idName}`).css("opacity", "0%");
                setTimeout(
                function() 
                {
                    $(`#${idName}`).css("opacity", "100%");
                }, 10);

                // handle second column click
                $(`#${idName}`).click( function () {
                    hasElementOnNavCoverBeenClicked = true;
                    // jump to href
                    window.location.href = navdata.items[i].items[j].link;
                });
            }
        });
    }
});

const navdata = 
{
    "items": [
        {
            "name": "Process Safety Management",
            "items": [
                {"name": "Overview", "link": "psm.html"},
                {"name": "Process Safety Training", "link": "psm.html"},
                {"name": "Process Safety Consulting", "link": "psm.html"},
                {"name": "Process Safety Auditing", "link": "psm.html"},
            ]
        },
        {
            "name": "Construction Safety Management Consulting",
            "link": "csmc.html",
            "items": [
            ]
        },
        {
            "name": "EHS Software and Technological Solutions",
            "link": "ehss.html",
            "items": [
            ]
        },
        {
            "name": "Energy Management",
            "items": [
                {"name": "Solar Panels", "link": "em.html"},
                {"name": "Energy Storage", "link": "em.html"},
                {"name": "EV Charging", "link": "em.html"},
                {"name": "Wind Turbines", "link": "em.html"},
            ]
        },
        /*
        {
            "name": "Behaviour Based Safety",
            "link": "bbs.html",
            "items": [
            ]
        },
        */
        {
            "name": "Maintenance and Inspection",
            "items": [
                {"name": "Training", "link": "mis.html"},
                {"name": "Non-Destructive Testing", "link": "mis.html"},
                {"name": "Mechanical, Electrical and Plumbing (MEP)", "link": "mis.html"},
            ]
        },
    ]
};