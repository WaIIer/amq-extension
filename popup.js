var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var chrome = window["chrome"];
var lr = undefined;
window.onload = function () {
    getLastRound();
    var downloadDataButton = document.getElementById("download-data-button");
    var copyDataButton = document.getElementById("copy-data-button");
    downloadDataButton.onclick = downloadData;
    copyDataButton.onclick = copyData;
};
function getLastRound() {
    var animeDiv = document.getElementById("anime-name-div");
    var songNameDiv = document.getElementById("song-name-div");
    var artistDiv = document.getElementById("song-artist-div");
    var timesCorrectDiv = document.getElementById("times-correct-div");
    var percentCorrectDiv = document.getElementById("percent-correct-div");
    var timesWrongDiv = document.getElementById("times-wrong-div");
    var percentWrongDiv = document.getElementById("percent-wrong-div");
    var sessionRecordDiv = document.getElementById("session-record-div");
    var newSessionButton = document.getElementById("new-session-button");
    chrome.storage.local.get("lastRound", function (result) {
        console.log(result.lastRound);
        var round = result.lastRound;
        lr = result;
        animeDiv.textContent = round.animeTitle;
        songNameDiv.textContent = round.songTitle;
        artistDiv.textContent = round.songArtist;
        timesCorrectDiv.textContent = round.timesCorrect.toString();
        timesWrongDiv.textContent = round.timesWrong.toString();
        var totalOccurances = round.timesCorrect + round.timesWrong;
        var percentCorrect = (round.timesCorrect * 100 / totalOccurances);
        percentCorrectDiv.textContent = percentCorrect.toFixed(2) + "%";
        percentWrongDiv.textContent = (100 - percentCorrect).toFixed(2) + "%";
        var songKey = round.songTitle + round.songArtist;
        chrome.storage.local.get("session", function (result) {
            if (result && result.session && result.session[songKey]) {
                sessionRecordDiv.textContent = result.session[songKey].correct.toString() + "/" + result.session[songKey].occurrences.toString();
            }
            else {
                sessionRecordDiv.textContent = "0/0";
            }
        });
        getInfoFromAnilist(animeDiv.textContent);
    });
    newSessionButton.onclick = function () {
        var _a;
        chrome.storage.local.set((_a = {}, _a["session"] = {}, _a), function () {
        });
        sessionRecordDiv.textContent = "0/0";
    };
    return lr;
}
var animeExceptions = {
    "TIGER X DRAGON": "TORADORA"
};
var anilistQuery = "\nquery ($animeName: String) {\n    Media (search: $animeName, type: ANIME) {\n        title {\n            romaji\n            english\n            native\n            userPreferred\n        }\n        season\n        seasonYear\n        averageScore\n        genres\n        popularity\n        episodes\n    }\n}\n";
var anilistResponse = null;
var anilistResult = null;
function getInfoFromAnilist(animeName) {
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
            "Accept": "application/json"
        },
        body: JSON.stringify({
            query: anilistQuery,
            variables: anilistVariables
        })
    };
    fetch(url, options)
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        anilistResponse = response;
                        return [4 /*yield*/, response.json()];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, response.ok ? json : new Error(String(response.status))];
                }
            });
        });
    }).then(function (result) {
        anilistResult = result;
        handleAnilistResult(result);
    })["catch"](function (error) {
        anilistResponse = error;
        console.log("Error from Anilist");
        console.log(error.Error);
    });
}
function handleAnilistResult(anilistResult) {
    var animeYearDiv = document.getElementById("anime-year-div");
    var animeScoreDiv = document.getElementById("anime-score-div");
    var animeMembersDiv = document.getElementById("anime-members-div");
    var animeEpisodesDiv = document.getElementById("anime-episodes-div");
    var media = anilistResult.data.Media;
    animeYearDiv.textContent = media.season.toString() + " " + media.seasonYear.toString();
    animeScoreDiv.textContent = media.averageScore.toString() + "/100";
    animeMembersDiv.textContent = media.popularity.toString();
    animeEpisodesDiv.textContent = media.episodes.toString();
}
function getData(onDownload) {
    chrome.storage.local.get(null, function (items) {
        var allTimeStats = items["allTime"];
        var allTimeList = [];
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
        });
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
