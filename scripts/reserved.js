async function fetchServer(data) {
    const response = await fetch("https://server-singapore.scholarity.io/", {
        method: "POST", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (response.status !== 200) {
        throw new Error("server error");
    }
    return response.json();
}

async function init() {
    const trainingId = new URLSearchParams(window.location.search).get("trainingId");
    const token = localStorage.getItem("scholauth-token");
    if (token === undefined || trainingId === undefined) {
        console.log("Error: either token or trainingId is undefined.");
    }

    const sicherLectureId = trainingId.substring(0, trainingId.length - 3);
    try {
        const lectureData = await fetchServer({action: "sicher_getLecture", sicherLectureId: sicherLectureId});
        const trainingData = JSON.parse(decodeURI(lectureData.data[0].data)).trainings;
        let foundTraining = false;
        for (let i = 0; i < trainingData.length; i++) {
            const training = trainingData[i];
            if (training.trainingId === trainingId) {
                if (!training.isCanceled) {
                    $("#course-date").text(training.dateStart);
                    $("#course-name").text(decodeURI(lectureData.data[0].lectureName));
                    $("#course-venue").text(training.venue);
                    $("#course-province").text(training.province);
                } else {
                    $("#course-date").text("CANCELED");
                    $("#course-name").text("CANCELED");
                    $("#course-venue").text("CANCELED");
                    $("#course-province").text("CANCELED");
                }
                foundTraining = true;
                break;
            }
        }
        if (!foundTraining) {
            alert("Error: TrainingId is invalid.");
        }
    } catch (e) {
        alert(`error: acquiring lectureData/trainingData: ${e}`);
        return;
    }

    try {
        const userData = await fetchServer({action: "getUserFromToken", token: token});
        $("#user-name").text(`${userData.firstName} ${userData.lastName}`);
        $("#user-email").text(userData.email);
    } catch (e) {
        alert(`error: acquiring userData: ${e}`);
        return;
    }
}

$(document).ready(function(){
    init();
});