console.log("Hi AMQ");
function _getSelfName() {
    var selfUserDivs = document.getElementsByClassName("qpsPlayerName self");
    if (selfUserDivs && selfUserDivs.length > 0) {
        return selfUserDivs[0].textContent;
    }
    return "";
}
function _getPlayerName(qpAvatarContainer) {
    var qpAvatarNameContainers = qpAvatarContainer.getElementsByClassName("qpAvatarNameContainer");
    if (qpAvatarNameContainers && qpAvatarNameContainers.length > 0) {
        var children = qpAvatarNameContainers[0].children;
        if (children && children.length > 0) {
            return children[0].textContent;
        }
    }
}
