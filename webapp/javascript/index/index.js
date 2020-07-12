var dropZone = document.getElementById("drop-zone");
var dropForm = document.getElementById("drop-form");
dropZone.ondrop = function (ev) {
    ev.preventDefault();
};
dropZone.ondragover = function (ev) {
    dropZone.style.borderStyle = "dashed";
    dropZone.style.borderWidth = "3px";
    dropZone.style.borderColor = "black";
    ev.preventDefault();
};
dropZone.ondragleave = function (ev) {
    dropZone.style.border = "";
};
dropZone.ondrop = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log(ev.dataTransfer.files);
    dropZone.style.border = "";
    var analyzeDiv = document.getElementById("analyze-div");
    var analyzeButton = document.getElementById("analyze-button");
    analyzeDiv.hidden = false;
    analyzeButton.textContent = ev.dataTransfer.files[0].name;
    dropZone.hidden = true;
    showFile(ev.dataTransfer.files[0]);
};
function showFile(file) {
    var fileCard = document.getElementById("file-card");
    var fileName = document.getElementById("file-name-header");
    var fileContents = document.getElementById("file-contents");
    var fileLength = document.getElementById("file-contents");
    fileCard.hidden = false;
    "s";
    fileName.textContent = file.name;
    fileLength.textContent = file.size.toString();
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (ev) {
        fileContents.appendChild(generateStatsTable(JSON.parse(ev.target.result.toString())));
    };
}
function parseAmqExtensionJsonFile(amqJson) {
    var newJson = { 0: [] };
    for (var key in amqJson) {
        var obj = amqJson[key];
        newJson[0].push({
            animeTitle: obj.animeTitle
        });
    }
    return JSON.stringify(newJson);
}
