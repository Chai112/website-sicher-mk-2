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

async function populateLectureList () {
    let data = await fetchServer({action: "sicher_getTopLectures"});

    for (let i = 0; i < data.data.length; i++) {
        const listHtml = `
        <div class="col">
            <div class="tile news-tile shadow animation-up" id="news-3">
                <h2>${decodeURI(data.data[i].lectureName)}</h2>
                <p>${decodeURI(data.data[i].data)}...</p>
                <span class="material-symbols-outlined">
                arrow_forward
                </span>
            </div>
        </div>`;
        $('#lecture-list').append(listHtml);
        const carouselHtml = `
        <div class="client carousel-item${i === 0 ? " active" : ""}">
            <div class="inner">
                <div class="tile news-tile shadow animation-up" id="news-3">
                    <h2>${decodeURI(data.data[i].lectureName)}</h2>
                    <p>${decodeURI(data.data[i].data)}...</p>
                    <span class="material-symbols-outlined">
                    arrow_forward
                    </span>
                </div>
            </div>
        </div>`;
        $('#lecture-carousel-list').append(carouselHtml);
    }
}

$(document).ready(function(){
    populateLectureList();
});