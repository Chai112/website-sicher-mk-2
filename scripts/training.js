import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs'

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

let globalLectureData = [];

async function getLectures() {
    const data = await fetchServer({action: "sicher_getLectures"});
    globalLectureData = data.data;
    populateLectureList(globalLectureData);
}

async function updateLectureList() {
    const searchTerm = $("#searchbar").val();
    if (searchTerm === "") {
        populateLectureList(globalLectureData);
        return;
    } 

    const fuse = new Fuse(globalLectureData, {
        keys: ['lectureName', 'instructors', 'dateHeld', 'data']
    })
    let lectureData = [];
    const output = fuse.search(searchTerm);
    for (let i = 0; i < output.length; i++) {
        lectureData.push(output[i].item);
    }
    populateLectureList(lectureData);
}

function populateLectureList (lectureData) {
    $("#lecture-list").empty();
    for (let i = 0; i < lectureData.length; i++) {
        const listHtml = `
        <div class="col">
            <div class="tile news-tile shadow" id="lecture-list-${i}">
                <h2>${decodeURI(lectureData[i].lectureName)}</h2>
                <p>${decodeURI(lectureData[i].data)}...</p>
                <span class="material-symbols-outlined">
                arrow_forward
                </span>
            </div>
        </div>`;
        $('#lecture-list').append(listHtml);
        $(`#lecture-list-${i}`).click(function () {
            goToLecture(lectureData[i].sicherLectureId);
        });
    }
    for (let i = lectureData.length % 3; i < 3 && i != 0; i++) {
        const listHtml = `
        <div class="col">
        <div></div>
        </div>`;
        $('#lecture-list').append(listHtml);
    }
}

$(document).ready(function(){
    getLectures();
});

$('#searchbar').on('input',function(e){
    updateLectureList();
});