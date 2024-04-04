async function fetchServer(data) {
    const response = await fetch("https://server-singapore.scholarity.io/", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

async function goToLecture(sicherLectureId) {
    window.location.href = `/lecture.html?id=${sicherLectureId}`;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function populateLectureList () {

    const data = await fetchServer({action: "sicher_getLectures"});

    $("#lecture-list").empty();
    for (let i = 0; i < data.data.length; i++) {
        const listHtml = `
        <div class="col">
            <div class="tile news-tile shadow" id="lecture-list-${i}">
                <h2>${decodeURI(data.data[i].lectureName)}</h2>
                <p>${decodeURI(data.data[i].data)}...</p>
                <span class="material-symbols-outlined">
                arrow_forward
                </span>
            </div>
        </div>`;
        $('#lecture-list').append(listHtml);
        $(`#lecture-list-${i}`).click(function () {
            goToLecture(data.data[i].sicherLectureId);
        });
    }
    for (let i = data.data.length % 3; i < 3; i++) {
        const listHtml = `
        <div class="col">
        <div></div>
        </div>`;
        console.log(i);
        $('#lecture-list').append(listHtml);
    }
}

$(document).ready(function(){
    populateLectureList();
});