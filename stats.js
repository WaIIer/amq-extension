function getSelfName() {
    let selfUserDivs = document.getElementsByClassName("qpsPlayerName self");
    if (selfUserDivs.length < 1) {
        return "";
    }
    return selfUserDivs[0].innerHTML;
}

function getPlayerName(qpAvatarContainer) {
    let qpAvatarNameContainers = qpAvatarContainer.getElementsByClassName("qpAvatarNameContainer");
    if (!qpAvatarNameContainers || qpAvatarNameContainers.length < 1) {
        return "";
    }
    let qpAvatarNameContainerChildren = qpAvatarNameContainers[0].children;
    if (!qpAvatarNameContainerChildren || qpAvatarNameContainerChildren.length < 1) {
        return "";
    }
    return qpAvatarNameContainerChildren[0].textContent;
}

function getGuess(qpAvatarContainer) {
    let qpAvatarAnswers = qpAvatarContainer.getElementsByClassName("qpAvatarAnswer");
    if (!qpAvatarAnswers || qpAvatarAnswers.length < 1) {
        return "...";
    }
    return qpAvatarAnswers[0].innerText;
}

function getResult(qpAvatarContainer) {
    if (!qpAvatarContainer) {
        return {
            result: "N/A",
            guess: "..."
        };
    }
    let qpAvatarAnswerContainers = qpAvatarContainer.getElementsByClassName("qpAvatarAnswerContainer");
    if (!qpAvatarAnswerContainers || qpAvatarAnswerContainers.length < 1) {
        return {
            result: "not found",
            guess: "..."
        };
    }
    let result = qpAvatarAnswerContainers[0].className.includes("wrong");
    return {
        result: (result ? "WRONG" : "CORRECT"),
        guess: getGuess(qpAvatarContainer)
    };
}

function getSelfAvatarContainer() {
    let answerContainers = document.getElementsByClassName("qpAvatarContainer");
    let selfName = getSelfName();

    for (let i = 0; i < answerContainers.length; i += 1) {
        let playerName = getPlayerName(answerContainers[i]);
        if (playerName == selfName) {
            return answerContainers[i];
        }
    }
    return undefined;
}

function updateStorage(amqRound) {
    let songKey = amqRound.title + amqRound.artist;
    let pushedData = {};

    chrome.storage.local.get("allTime", function (result) {

        if (!result || !("allTime" in result)) {
            result["allTime"] = {};
        }

        var songDict = result["allTime"];

        if (songDict[songKey]) {
            pushedData = songDict[songKey];
            pushedData.timesAsked += 1;
        } else {
            pushedData = {
                animeTitle: amqRound.answer,
                songTitle: amqRound.title,
                songArtist: amqRound.artist,
                songType: amqRound.songType,
                timesCorrect: 0,
                timesWrong: 0,
                wrongGuesses: []
            };
        }
        if (amqRound.result == "CORRECT") {
            pushedData.timesCorrect += 1;
        } else {
            pushedData.timesWrong += 1;
            pushedData.wrongGuesses.push(amqRound.guess);
        }

        songDict[songKey] = pushedData;

        chrome.storage.local.set({ "allTime": songDict }, function () {
        });

        chrome.storage.local.set({ "lastRound": pushedData }, function () {
            console.log("last round");
            console.log(pushedData);
        });

        updateCurrentSession(songKey, amqRound.result);
    });
}

function updateCurrentSession(songKey, isCorrect) {
    chrome.storage.local.get("session", function (result) {
        if (result && result.session && (songKey in result.session)) {
            if (isCorrect == "CORRECT") {
                result.session[songKey].correct += 1;
            }
            if (isCorrect != "N/A") {
                result.session[songKey].occurrences += 1;
            }
        } else {
            if (!("session" in result)) {
                result = { "session": {} };
            }

            result["session"][songKey] = {
                correct: (isCorrect == "CORRECT") ? 1 : 0,
                occurrences: (isCorrect != "N/A") ? 1 : 0
            };
        }

        chrome.storage.local.set({ "session": result.session }, function () {
        });
    });
}

try {
    let selfName = getSelfName();
    let songNameDiv = document.getElementById("qpSongName");
    let artistDiv = document.getElementById("qpSongArtist");
    let answerContainer = document.getElementsByClassName("qpAvatarAnswerContainer")[0];
    let animeDiv = document.getElementById("qpAnimeName");
    let songTypeDiv = document.getElementById("qpSongType");
    let lastSongName = "";

    function onSongNameChange(mutations) {
        let songNameInnerHTML = songNameDiv.innerHTML;
        let lastSongArtist = artistDiv.innerHTML;

        if (songNameInnerHTML != lastSongName) {
            lastSongName = songNameInnerHTML;

            let result = getResult(getSelfAvatarContainer());
            let amqRound = {
                answer: animeDiv.innerText,
                title: lastSongName,
                artist: lastSongArtist,
                songType: songTypeDiv.textContent,
                result: result.result,
                guess: result.guess,
            };

            console.log(amqRound);

            updateStorage(amqRound);
        }
    }

    let config = { characterData: false, attributes: false, childList: true, subtree: false };

    let songNameObserver = new MutationObserver(onSongNameChange);
    songNameObserver.observe(songNameDiv, config);

    console.log("observer applied");
} catch (e) {
    console.log(e);
}
