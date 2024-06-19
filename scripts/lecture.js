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
    const lectureData = JSON.parse(decodeURI(data.data[0].data));

    // training data
    $("#trainings-content").empty();
    if (lectureData.trainings !== undefined) {
        let includeNotes = false;
        for (let i = 0; i < lectureData.trainings.length; i++) {
            if (lectureData.trainings[i].notes !== "" && !lectureData.trainings[i].isCanceled) {
                includeNotes = true; 
                break;
            }
        }
        let html = `
        <table>
            <tr>
                <th>Date</th>
                <th>Venue</th> 
                <th>Province</th> 
                <th class="book-button-td"></th>
                ${includeNotes ? '<th>Notes</th>' : ''}
            </tr>`;

        let j = 0;
        for (let i = 0; i < lectureData.trainings.length; i++) {
            if (lectureData.trainings[i].isCanceled) continue;
            j++;
            html += `<tr ${(j % 2) === 1 ? 'class="alt-tr"' : ''}>
                <td>${lectureData.trainings[i].dateStart}</td>
                <td>${lectureData.trainings[i].venue}</td>
                <td>${lectureData.trainings[i].province}</td>
                <td class="book-button-td">
                    <button class="button" onclick="bookLecture()">Book</button>
                </td>
                ${includeNotes ? "<td>" + lectureData.trainings[i].notes + "</td>" : ""}
            </tr>`;
        };

        html += `</table>`;
        $('#trainings-content').append(html);
    }

    // syllabus data
    $("#lecture-content").empty();
    for (let i = 0; i < lectureData.data.length; i++) {
        const sectionName = lectureData.data[i].sectionName;
        const sectionDescription = lectureData.data[i].sectionDescription;

        const html = `<h1>${sectionName}</h1>
        <p>${sectionDescription}</p>
        `;
        $('#lecture-content').append(html);
    }

    // price data
    $('#price-content').html(`<h1>THB ${data.data[0].cost}</h1><h2>per person</h2>`);
}

function bookLecture(trainingId) {
    console.log("booking" + trainingId);
}

$(document).ready(function(){
    loadLecture();
});