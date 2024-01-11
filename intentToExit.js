const intentToExitEvent = new CustomEvent('intentToExit', { trigger: '' });

var hasIntentToExitEventFired;
var hasUserScrolledDownToThreshold;
var hasUserScrolledUpToThreshold;
var scrollPosition;
var lastScrollPositionInDownDirection; //last scroll position in the down direction when the user satisfies the above Down threshold

window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        ) {
            check = true;
        } else if ('ontouchstart' in window) {
            check = true;
        }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

window.addEventListener('load', (event) => {
    hasIntentToExitEventFired = false;
    hasUserScrolledDownToThreshold = false;
    hasUserScrolledUpToThreshold = false;
    lastScrollPosition = 0;
    scrollPosition = 1;

    //Trigger the intent to exit sniffer after 3 seconds of page load
    setTimeout(() => {
        intentToExitSniffer();
    }, 3000);

    if (window.mobileAndTabletCheck()) {
        document.body.className += ' mobileDevice';
    }
});

function addZero(x, n) {
    while (x.toString().length < n) {
        x = '0' + x;
    }
    return x;
}

function timeNowWithMilliseconds() {
    //time related stuff
    var d = new Date();
    var h = addZero(d.getHours(), 2);
    var m = addZero(d.getMinutes(), 2);
    var s = addZero(d.getSeconds(), 2);
    var ms = addZero(d.getMilliseconds(), 3);
    var fullDate = h + ':' + m + ':' + s + ':' + ms;
    return fullDate;
}

function intentToExitSniffer() {
    console.log('Inside intentToExitSniffer()');
    var scrollingTimer;
    var scrollDirection;
    //start listening to all intent to Exit actions and fire the "intentToExit" event on such action

    /* intent to Exit is defined as:
     *   "when user moves the mouse out of the browser's viewport in desktop" - mouseleave
     *   "when the user scrolls down 65% of the document and then scrolls up 10%" - for mobile
     */

    if (window.mobileAndTabletCheck()) {
        // *   "when the user scrolls down 65% of the document and then scrolls up 10%" - for mobile
        window.addEventListener('scroll', function () {
            clearTimeout(scrollingTimer);
            var windowHeight = window.innerHeight;
            var totalDocumentHeight = document.body.offsetHeight;
            var scrollDownThresholdPosition = 0.5; // 65% of page
            var scrollUpThresholdPosition = 0.15; // 15%
            // Set a new timer to check the scroll position after a short delay
            scrollingTimer = setTimeout(function () {
                scrollPosition = window.scrollY || window.pageYOffset;
                if (scrollPosition > lastScrollPosition) {
                    scrollDirection = 'down';
                } else {
                    scrollDirection = 'up';
                }
                if (scrollDirection === 'down') {
                    if (scrollPosition + windowHeight > scrollDownThresholdPosition * totalDocumentHeight) {
                        console.log('User has scrolled down 50% or more of the page.');
                        hasUserScrolledDownToThreshold = true;
                        lastScrollPositionInDownDirection = scrollPosition;
                        console.log(
                            'scrollDirection:: ',
                            scrollDirection,
                            ' current scroll position:: ',
                            scrollPosition,
                            ' last scroll position:: ',
                            lastScrollPosition,
                            ' 65% of document:: ',
                            scrollDownThresholdPosition * totalDocumentHeight,
                            ' lastScrollPositionInDownDirection:: ',
                            lastScrollPositionInDownDirection
                        );
                    }
                } else {
                    if (
                        /* scrollPosition <
							lastScrollPositionInDownDirection -
								scrollUpThresholdPosition * totalDocumentHeight &&
						hasUserScrolledDownToThreshold */
                        scrollPosition < lastScrollPositionInDownDirection - scrollUpThresholdPosition * lastScrollPositionInDownDirection &&
                        hasUserScrolledDownToThreshold
                    ) {
                        hasUserScrolledUpToThreshold = true;
                        console.log(
                            'scrollDirection:: ',
                            scrollDirection,
                            ' current scroll position:: ',
                            scrollPosition,
                            ' last scroll position:: ',
                            lastScrollPosition,
                            ' 10% from last position:: ',
                            lastScrollPosition - scrollUpThresholdPosition * totalDocumentHeight,
                            ' lastScrollPositionInDownDirection:: ',
                            lastScrollPositionInDownDirection
                        );
                    }
                }
                lastScrollPosition = scrollPosition;
                if (hasUserScrolledDownToThreshold && hasUserScrolledUpToThreshold) {
                    if (!hasIntentToExitEventFired) {
                        hasIntentToExitEventFired = true;
                        console.log('65% scroll event fired at ', timeNowWithMilliseconds());
                        document.dispatchEvent(intentToExitEvent);
                    }
                }
            }, 325);
        });
    } else {
        // * mouseleave event - works only for desktop as mouseevents are not registered in mobile
        document.documentElement.addEventListener('mouseleave', function (e) {
            if (!hasIntentToExitEventFired) {
                hasIntentToExitEventFired = true;
                console.log('MouseLEAVE event fired at ', timeNowWithMilliseconds(), 'at clientX:', e.clientX, ' and clientY: ', e.clientY);
                document.dispatchEvent(intentToExitEvent);
            }
        });
    }
}
