function createTableCell(textContent, scope) {
    if (scope === void 0) { scope = ""; }
    var th = document.createElement("th");
    th.textContent = textContent;
    th.scope = scope;
    return th;
}
var tableHeader = document.createElement("thead");
tableHeader.appendChild(createTableCell("Song Name", "col"));
tableHeader.appendChild(createTableCell("Times Correct", "col"));
tableHeader.appendChild(createTableCell("Times Wrong", "col"));
function generateStatsTable(allTimeStats) {
    var statsTable = document.createElement("table");
    statsTable.className = "table table-striped table-hover";
    statsTable.appendChild(tableHeader);
    statsTable.appendChild(document.createElement("tbody"));
    allTimeStats.allTime.forEach(function (song) {
        statsTable.tBodies[0].appendChild(createTableRow(song));
    });
    return statsTable;
}
function createTableRow(allTime) {
    var tableRowElement = document.createElement("tr");
    [
        createTableCell(allTime.songTitle),
        createTableCell(allTime.timesCorrect.toString()),
        createTableCell(allTime.timesCorrect.toString())
    ].forEach(function (th) { return tableRowElement.appendChild(th); });
    return tableRowElement;
}
