interface AmqSession {
    session: { string: Session }
}

interface Session {
    correct: number;
    occurrences: number;

}

interface AnilistApiResult {
    data: Data;
}
interface Data {
    Media: Media;
}
interface Media {
    title: Title;
    season: string;
    seasonYear: number;
    averageScore: number;
    genres?: (string)[] | null;
    popularity: number;
    episodes: number;
}
interface Title {
    romaji: string;
    english: string;
    native: string;
    userPreferred: string;
}

interface AmqResult {
    lastRound: AmqRound;
}

interface AmqRound {
    animeTitle: string;
    songTitle: string;
    songArtist: string;
    timesCorrect: number;
    timesWrong: number;
}

var chrome = window["chrome"];
var lr: AmqResult = undefined;

window.onload = () => {
    getLastRound();
    var downloadDataButton: HTMLElement = document.getElementById("download-data-button");
    var copyDataButton: HTMLElement = document.getElementById("copy-data-button");
    downloadDataButton.onclick = downloadData;
    copyDataButton.onclick = copyData;
};

function getLastRound(): AmqResult {
    var animeDiv: HTMLElement = document.getElementById("anime-name-div");
    var songNameDiv: HTMLElement = document.getElementById("song-name-div");
    var artistDiv: HTMLElement = document.getElementById("song-artist-div");
    var timesCorrectDiv: HTMLElement = document.getElementById("times-correct-div");
    var percentCorrectDiv: HTMLElement = document.getElementById("percent-correct-div");
    var timesWrongDiv: HTMLElement = document.getElementById("times-wrong-div");
    var percentWrongDiv: HTMLElement = document.getElementById("percent-wrong-div");
    var sessionRecordDiv: HTMLElement = document.getElementById("session-record-div");
    var newSessionButton: HTMLElement = document.getElementById("new-session-button");
    chrome.storage.local.get("lastRound", function (result: AmqResult) {
        console.log(result.lastRound);
        var round = result.lastRound;
        lr = result;

        animeDiv.textContent = round.animeTitle;
        songNameDiv.textContent = round.songTitle;
        artistDiv.textContent = round.songArtist;
        timesCorrectDiv.textContent = round.timesCorrect.toString();
        timesWrongDiv.textContent = round.timesWrong.toString();

        var totalOccurances = round.timesCorrect + round.timesWrong;
        var percentCorrect = (round.timesCorrect * 100 / totalOccurances)
        percentCorrectDiv.textContent = `${percentCorrect.toFixed(2)}%`
        percentWrongDiv.textContent = `${(100 - percentCorrect).toFixed(2)}%`

        var songKey = round.songTitle + round.songArtist;
        chrome.storage.local.get("session", function (result: AmqSession) {
            if (result && result.session && result.session[songKey]) {
                sessionRecordDiv.textContent = `${result.session[songKey].correct.toString()}/${result.session[songKey].occurrences.toString()}`;
            } else {
                sessionRecordDiv.textContent = "0/0";
            }
        })

        getInfoFromAnilist(animeDiv.textContent);
    });
    newSessionButton.onclick = function () {
        chrome.storage.local.set({ ["session"]: {} }, function () {
        });
        sessionRecordDiv.textContent = "0/0";
    }

    return lr;
}

var animeExceptions = {
    "TIGER X DRAGON": "TORADORA",
    ""
}

var anilistQuery = `
query ($animeName: String) {
    Media (search: $animeName, type: ANIME) {
        title {
            romaji
            english
            native
            userPreferred
        }
        season
        seasonYear
        averageScore
        genres
        popularity
        episodes
    }
}
`;

var anilistResponse: Response = null;
var anilistResult = null;

function getInfoFromAnilist(animeName: string) {
    animeName = animeName.toUpperCase();
    if (animeName in animeExceptions) {
        animeName = animeExceptions[animeName];
    }

    var anilistVariables = {
        animeName: animeName
    };

    var url = "https://graphql.anilist.co";
    var options = {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            query: anilistQuery,
            variables: anilistVariables
        })
    };

    fetch(url, options)
        .then(async function (response) {
            anilistResponse = response;
            const json = await response.json();
            return response.ok ? json : new Error(String(response.status));
        }).then(function (result) {
            anilistResult = result;
            handleAnilistResult(result);
        }).catch(function (error) {
            anilistResponse = error;
            console.log("Error from Anilist");
            console.log(error.Error);
        });
}

function handleAnilistResult(anilistResult: AnilistApiResult) {
    var animeYearDiv: HTMLElement = document.getElementById("anime-year-div");
    var animeScoreDiv: HTMLElement = document.getElementById("anime-score-div");
    var animeMembersDiv: HTMLElement = document.getElementById("anime-members-div");
    var animeEpisodesDiv: HTMLElement = document.getElementById("anime-episodes-div");
    var media = anilistResult.data.Media;
    animeYearDiv.textContent = `${media.season.toString()} ${media.seasonYear.toString()}`;
    animeScoreDiv.textContent = `${media.averageScore.toString()}/100`;
    animeMembersDiv.textContent = media.popularity.toString();
    animeEpisodesDiv.textContent = media.episodes.toString();
}


function getData(onDownload: (arg0: string) => void): void {
    chrome.storage.local.get(null, function (items: JSON) {
        var allTimeStats: JSON = items["allTime"];
        var allTimeList: JSON[] = [];

        for (var key in allTimeStats) {
            allTimeList.push(allTimeStats[key]);
        }

        var downloadJson = {
            "allTime": allTimeList
        };
        var jsonString = JSON.stringify(downloadJson).toString();
        onDownload(jsonString);
    });
}

function downloadData() {
    // chrome.storage.local.get(null, function (items: JSON) {
    //     var allTimeStats: JSON = items["allTime"];
    //     var allTimeList: JSON[] = [];

    //     for (var key in allTimeStats) {
    //         allTimeList.push(allTimeStats[key]);
    //     }

    //     var downloadJson = {
    //         "allTime": allTimeList
    //     };
    //     var blob = new Blob([JSON.stringify(downloadJson)], { type: "application/json" });
    //     var url = URL.createObjectURL(blob);
    //     chrome.downloads.download({
    //         url: url
    //     });
    // });
    getData(function (jsonString) {
        var blob = new Blob([jsonString], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url
        })
    });
}

function copyData() {
    getData(function (jsonString) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log(tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, jsonString);
        });
    });
}
