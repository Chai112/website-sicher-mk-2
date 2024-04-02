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

async function createLecture() {
    await fetchServer({
        action: "sicher_createLecture", 
        sicherAdminToken: "dasani",
        lectureName: "Untitled",
        cost: 0,
        dateHeld: (new Date()).toLocaleString(),
        venue: "",
        instructors: "",
        data: JSON.stringify({})
    });
}

async function changeLecture() {
    let lectureData = getLectureFormData();
    let sicherLectureId = new URLSearchParams(window.location.search).get("sicherLectureId");
    await fetchServer({
        action: "sicher_changeLecture", 
        sicherLectureId: sicherLectureId,
        sicherAdminToken: "dasani",
        lectureName: $("#lectureEditorForm_lectureName").val(),
        cost:  $("#lectureEditorForm_cost").val(),
        dateHeld:  $("#lectureEditorForm_dateHeld").val(),
        venue:  $("#lectureEditorForm_venue").val(),
        instructors:  $("#lectureEditorForm_instructors").val(),
        data: JSON.stringify(lectureData),
    });
    window.location.href = "/admin.html";
}

async function getLectures() {
    let data = await fetchServer({action: "sicher_getLectures"});

    $('#lectureTable tr').not(':first').not(':last').remove();
    var html = '';
    for (var i = 0; i < 3; i++) {
        html += '<tr>' +
                '<td><button onclick="' + 
                    `editLecture(${data.data[i].sicherLectureId});` +
                '">Edit</button></td>' +
                '<td><button onclick="' + 
                    `removeLecture(${data.data[i].sicherLectureId}, '${data.data[i].lectureName}');` +
                '">Remove</button></td>' +
                '<td>' + data.data[i].sicherLectureId + '</td>' + 
                '<td>' + decodeURI(data.data[i].lectureName) + '</td>' + 
                '<td>' + data.data[i].cost+ '</td>' +
                '<td>' + decodeURI(data.data[i].dateHeld) + '</td>' +
                '<td>' + decodeURI(data.data[i].venue) + '</td>' +
                '<td>' + decodeURI(data.data[i].instructors) + '</td>' +
                '</tr>';
    }
    $('#lectureTable tr').first().after(html);
}

// linked with admin's edit lecture button
async function editLecture (sicherLectureId) {
    window.location.href = `/admin-lectureEditor.html?sicherLectureId=${sicherLectureId}`;
}

// linked with admin's remove lecture button
async function removeLecture (sicherLectureId, lectureName) {
    if (confirm(`Are you sure you want to remove id: ${sicherLectureId}, ${lectureName}?`)) {
        await fetchServer({
            action: "sicher_removeLecture", 
            sicherAdminToken: "dasani",
            sicherLectureId: sicherLectureId,
        });
        location.reload();
    }
}

async function initLectureEditorForm() {
    let sicherLectureId = new URLSearchParams(window.location.search).get("sicherLectureId");
    let data = await fetchServer({action: "sicher_getLecture", sicherLectureId: sicherLectureId});
    ``
    $("#lectureEditorForm_lectureName").val(decodeURI(data.data[0].lectureName))
    $("#lectureEditorForm_cost").val(data.data[0].cost)
    $("#lectureEditorForm_dateHeld").val(decodeURI(data.data[0].dateHeld))
    $("#lectureEditorForm_venue").val(decodeURI(data.data[0].venue))
    $("#lectureEditorForm_instructors").val(decodeURI(data.data[0].instructors))
    
    let lectureData = {}
    try {
        lectureData = JSON.parse(decodeURI(data.data[0].data));
    } catch (_) {}

    if (Object.keys(lectureData).length == 0) {
        lectureData = {
            data: [
                {
                    sectionName: "Overview",
                    sectionDescription: "placeholder description."
                },
                {
                    sectionName: "Syllabus",
                    sectionDescription: "placeholder description."
                },
            ]
        }
    }
    updateLectureFormData(lectureData);

    $( "#lectureEditorForm" ).on( "submit", function( event ) {
        changeLecture();
        event.preventDefault();
    });
}

function updateLectureFormData(lectureData) {
    $('#lectureEditorForm_dataBox').empty(); // clear all children
    for (let i = 0; i < lectureData.data.length; i++) {
        const sectionName = lectureData.data[i].sectionName;
        const sectionDescription = lectureData.data[i].sectionDescription;

        const html = `<div class="box">
            <label for="lectureEditorForm_sectionName${i}">Section Name</label><br>
            <input type="text" id="lectureEditorForm_sectionName${i}" name="lectureEditorForm_sectionName${i}" value="${sectionName}"><br>

            <label for="lectureEditorForm_sectionDescription${i}">Section Data</label><br>
            <textarea id="lectureEditorForm_sectionDescription${i}" name="lectureEditorForm_sectionDescription${i}" cols="70" oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"'>${sectionDescription}</textarea><br><br>
            <button type='button' onclick="addAboveLectureSection(${i})">Add above</button>
            <button type='button' onclick="addBelowLectureSection(${i})">Add below</button>
            <button type='button' onclick="removeLectureSection(${i})">Remove</button>
        </div>`;
        $('#lectureEditorForm_dataBox').append(html);
        $(`#lectureEditorForm_sectionDescription${i}`).css("height", 
            $(`#lectureEditorForm_sectionDescription${i}`).prop('scrollHeight') + "px"
        );
    }
}

function getLectureFormData() {
    let lectureData = {data: []};
    for (let i = 0; i < $("#lectureEditorForm_dataBox").children().length; i++) {
        lectureData.data.push({
            sectionName: $(`#lectureEditorForm_sectionName${i}`).val(),
            sectionDescription: $(`#lectureEditorForm_sectionDescription${i}`).val(),
        });
    }
    return lectureData;
}

function addBelowLectureSection(i) {
    let lectureData = getLectureFormData();
    lectureData.data.splice(i + 1, 0, {sectionName: "", sectionDescription: ""}); // insert element at i, deleting 0 elemenst
    updateLectureFormData(lectureData);
}

function addAboveLectureSection(i) {
    let lectureData = getLectureFormData();
    lectureData.data.splice(i, 0, {sectionName: "", sectionDescription: ""}); // insert element at i, deleting 0 elemenst
    updateLectureFormData(lectureData);
}

function removeLectureSection(i) {
    let lectureData = getLectureFormData();
    if (lectureData.data.length == 1) {
        alert("Can't have 0 sections! Add a new section before deleting this one.")
        return;
    }
    lectureData.data.splice(i, 1); // insert element at i, deleting 0 elemenst
    updateLectureFormData(lectureData);
}

$(document).ready(function(){
    getLectures();
    $("#createLectureButton").click(async function () {
        try {
            await createLecture();
            location.reload();
        } catch (err) {
            alert(`Error creating lecture. Error: ${err}`);
        }
    });

    initLectureEditorForm();
});