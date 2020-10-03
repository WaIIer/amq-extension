function _getSelfName(): string {
    let selfUserDivs: HTMLCollection = document.getElementsByClassName("qpsPlayerName self");

    if (selfUserDivs && selfUserDivs.length > 0) {
        return selfUserDivs[0].textContent;
    }

    return "";
}

function _getPlayerName(qpAvatarContainer: HTMLDivElement) {
    let qpAvatarNameContainers: HTMLCollection = qpAvatarContainer.getElementsByClassName("qpAvatarNameContainer");
    if (qpAvatarNameContainers && qpAvatarNameContainers.length > 0) {
        let children: HTMLCollection = qpAvatarNameContainers[0].children;
        if (children && children.length > 0) {
            return children[0].textContent;
        }
    }
}