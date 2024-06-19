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

async function loadLecture() {
    const sicherLectureId = new URLSearchParams(window.location.search).get("id");
    const data = await fetchServer({
        action: "sicher_getLecture",
        sicherLectureId: sicherLectureId,
    });
    $("#lecture-title").text(decodeURI(data.data[0].lectureName));
    $("#lecture-content").empty();
    const lectureData = JSON.parse(decodeURI(data.data[0].data));

    let includeNotes = false;
    for (let i = 0; i < lectureData.trainings.length; i++) {
        if (lectureData.trainings[i].notes !== "") {
            includeNotes = true; 
            break;
        }
    }
    // training data
    let html = `<table>
        <tr>
            <th>Date</th>
            <th>Venue</th> 
            <th class="book-button-td"></th>
            ${includeNotes ? '<th>Notes</th>' : ''}
        </tr>`;

    for (let i = 0; i < lectureData.trainings.length; i++) {
        html += `<tr>
            <td>${lectureData.trainings[i].dateStart}</td>
            <td>${lectureData.trainings[i].venue}</td>
            <td class="book-button-td">
                <button class="button" onclick="window.location.href='/training.html'">Book</button>
            </td>
            ${includeNotes ? "<td>" + lectureData.trainings[i].notes + "</td>" : ""}
        </tr>`;
    };

    html += `</table>`;
    $('#lecture-content').append(html);

    // syllabus data
    for (let i = 0; i < lectureData.data.length; i++) {
        const sectionName = lectureData.data[i].sectionName;
        const sectionDescription = lectureData.data[i].sectionDescription;

        const html = `<h1>${sectionName}</h1>
        <p>${sectionDescription}</p>
        `;
        $('#lecture-content').append(html);
    }
}

$(document).ready(function(){
    loadLecture();
});