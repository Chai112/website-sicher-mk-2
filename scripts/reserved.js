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
    const bookingId = new URLSearchParams(window.location.search).get("bookingId");
    const token = localStorage.getItem("scholauth-token");
    if (token === undefined || bookingId === undefined) {
        alert("Error: either token or bookingId is undefined.");
    }
    const booking = (await fetchServer({
        action: "sicher_getBooking",
        sicherBookingId: bookingId
    })).data;

    const lectureData = booking.sicherLectureData
    const bookingData = booking.bookingData

    const trainingId = bookingData.sicherTrainingId
    try {
        const trainingData = JSON.parse(decodeURI(lectureData.data)).trainings;
        let foundTraining = false;
        $("#booking-id").text(bookingId);
        for (let i = 0; i < trainingData.length; i++) {
            const training = trainingData[i];
            if (training.trainingId.toString() === trainingId.toString()) {
                if (!training.isCanceled) {
                    $("#course-date").text(training.dateStart);
                    $("#course-name").text(decodeURI(lectureData.lectureName));
                    $("#course-venue").text(decodeURI(training.venue));
                    $("#course-province").text(decodeURI(training.province));
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
        $("#user-name").text(`${decodeURI(booking.userName)}`);
        $("#user-email").text(decodeURI(booking.userEmail));
    } catch (e) {
        alert(`error: acquiring userData: ${e}`);
        return;
    }
}

$(document).ready(function(){
    init();
});