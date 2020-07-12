interface AllTime {
    animeTitle: string;
    songArtist: string;
    songTitle: string;
    songType: string;
    timesCorrect: number;
    timesWrong: number;
    wrongGuesses: string[];
}

interface RootObject {
    allTime: AllTime[];
}

function createTableCell(textContent: string, scope: string = ""): HTMLTableHeaderCellElement {
    const th = document.createElement("th") as HTMLTableHeaderCellElement;
    th.textContent = textContent;
    th.scope = scope
    return th;
}

const tableHeader = document.createElement("thead") as HTMLTableSectionElement;
tableHeader.appendChild(createTableCell("Song Name", "col"));
tableHeader.appendChild(createTableCell("Times Correct", "col"));
tableHeader.appendChild(createTableCell("Times Wrong", "col"));


function generateStatsTable(allTimeStats: RootObject): HTMLTableElement {
    const statsTable = document.createElement("table") as HTMLTableElement;
    statsTable.className = "table table-striped table-hover";

    statsTable.appendChild(tableHeader);
    statsTable.appendChild(document.createElement("tbody"));

    allTimeStats.allTime.forEach((song) => {
        statsTable.tBodies[0].appendChild(createTableRow(song));
    });

    return statsTable;
}

function createTableRow(allTime: AllTime): HTMLTableRowElement {
    const tableRowElement = document.createElement("tr") as HTMLTableRowElement;
    [
        createTableCell(allTime.songTitle),
        createTableCell(allTime.timesCorrect.toString()),
        createTableCell(allTime.timesCorrect.toString())
    ].forEach((th) => tableRowElement.appendChild(th));
    return tableRowElement;
}