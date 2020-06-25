function getSelfName() {
    let selfUserDivs = document.getElementsByClassName("qpsPlayerName self");
    if (selfUserDivs.length < 1) {
        return "";
    }
    return selfUserDivs[0].innerText;
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

    chrome.storage.sync.get(songKey, function (result) {
        if (result[songKey]) {
            pushedData = result[songKey];
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

        pushedData[amqRound.answer] = amqRound.songType;

        chrome.storage.sync.set({ [songKey]: pushedData }, function () {
        });

        chrome.storage.sync.set({ lastRound: pushedData }, function () {

        });

        updateCurrentSession(songKey, amqRound.result);
    });
}

var lastSession = {};

function updateCurrentSession(songKey, isCorrect) {
    chrome.storage.sync.get("session", function (result) {
        console.log(result);

        let session = result.session;

        if (songKey in session) {
            if (isCorrect == "CORRECT") {
                session[songKey].correct += 1;
            }
            session[songKey].occurrences += 1;
        } else {
            session[songKey] = {
                correct: (isCorrect == "CORRECT") ? 1 : 0,
                occurrences: 1
            };
        }

        chrome.storage.sync.set({ "session": session }, function () {
            lastSession = session;
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