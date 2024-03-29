let data = {action: "sicher_getLectures"}
async function getLectures() {
    await fetch("https://server-singapore.scholarity.io/", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    data = {
        d: [
            {
                FirstName: "a",
                Age: 2
            },
            {
                FirstName: "a",
                Age: 2
            }
        ]
    }
    $('#lectureTable tr').not(':first').not(':last').remove();
    var html = '';
    for (var i = 0; i < data.d.length; i++) {
        html += '<tr><td>' + data.d[i].FirstName + 
                '</td><td>' + data.d[i].Age + '</td></tr>';
    }
    $('#lectureTable tr').first().after(html);
}
$(document).ready(function(){
    getLectures();
    $("#createLectureButton").click(function () {
        alert("cli");
    });
});