// Let's run these functions first
window.addEventListener('load', (event) => {
    exitIntentListenerInit();
});

function exitIntentListenerInit() {
    document.addEventListener('intentToExit', function intentToExitEventHandler(e) {
        console.log('intentToExit event fired at ', timeNowWithMilliseconds());
        // Do stuff when the exit-intent is shown
    });
}
