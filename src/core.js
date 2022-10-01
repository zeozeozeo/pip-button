const BUTTON_CLASS = "pip-button";
const BUTTON_RADIUS = 40;
const BUTTON_PADDING = 15;
const PIP_ICON_CLASS = "pip-icon";
const BUTTON_TIMEOUT_MS = 3000;

// icon taken from https://heroicons.com/
const PIP_ICON = `
<svg class="${PIP_ICON_CLASS}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="white" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
</svg>
`;

var hoverElement = null;
var pipButton = null;
var isPipActive = false;
var timeoutId = null;

async function startPip() {
    try {
        if (hoverElement !== document.pictureInPictureElement) {
            await hoverElement.requestPictureInPicture();
            pipActive();
        } else {
            await document.exitPictureInPicture();
            pipNotActive();
        }
    } catch (error) {
        pipNotActive();
    }
}

function addPipButton() {
    pipButton = document.createElement("div");
    pipButton.classList.add(BUTTON_CLASS);
    pipButton.addEventListener("click", startPip);
    pipButton.innerHTML += PIP_ICON;
    updateButtonPosition();

    document.body.appendChild(pipButton);
}

function updateButtonPosition() {
    if (!pipButton || !hoverElement) return;
    var rect = hoverElement.getBoundingClientRect();

    pipButton.style.width = BUTTON_RADIUS + "px";
    pipButton.style.height = BUTTON_RADIUS + "px";
    pipButton.style.top = rect.y + rect.height / 2 + "px";
    pipButton.style.left =
        rect.x + rect.width - BUTTON_RADIUS - BUTTON_PADDING + "px";
}

// remove all elements with the BUTTON_CLASS class
function removePipButtons() {
    var buttons = document.getElementsByClassName(BUTTON_CLASS);

    while (buttons[0]) {
        buttons[0].parentNode.removeChild(buttons[0]);
    }
    pipButton = null;
}

function pipActive() {
    isPipActive = true;
    removePipButtons();
}
function pipNotActive() {
    isPipActive = false;
}

function addPipListeners() {
    hoverElement.addEventListener("leavepictureinpicture", pipNotActive);
    hoverElement.addEventListener("enterpictureinpicture", pipActive);
}

function removePipListeners() {
    hoverElement.removeEventListener("leavepictureinpicture", pipNotActive);
    hoverElement.removeEventListener("enterpictureinpicture", pipActive);
}

document.addEventListener(
    "mousemove",
    function (e) {
        if (isPipActive) return;

        let srcElement = e.srcElement;
        updateButtonPosition();

        if (srcElement.nodeName == "VIDEO") {
            // hovering a video
            if (srcElement != hoverElement) {
                hoverElement = srcElement;
                removePipButtons();
                addPipListeners();
                addPipButton();

                // remove button after BUTTON_TIMEOUT_MS ms
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(removePipButtons, BUTTON_TIMEOUT_MS);
            }
        } else if (
            hoverElement != null &&
            srcElement != pipButton &&
            !srcElement.classList.contains(PIP_ICON_CLASS)
        ) {
            // not hovering a video
            removePipButtons();
            removePipListeners();
            hoverElement = null;
        }
    },
    false
);

// update button positions on resize
window.addEventListener(
    "resize",
    function () {
        updateButtonPosition();
    },
    true
);
