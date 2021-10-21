"use strict";
// SPDX-License-Identifier: GPL-3.0-or-later
// myMPD (c) 2018-2021 Juergen Mang <mail@jcgames.de>
// https://github.com/jcorporation/mympd

function setStateIcon() {
    if (websocketConnected === false || settings.mpdConnected === false) {
        document.getElementById('logoBg').setAttribute('fill', '#6c757d');
    }
    else {
        document.getElementById('logoBg').setAttribute('fill', settings.webuiSettings.uiHighlightColor);
    }
}

function toggleAlert(alertBox, state, msg) {
    const alertBoxEl = document.getElementById(alertBox);
    if (state === false) {
        elHide(alertBoxEl);
        elClear(alertBoxEl);
    }
    else {
        elClear(alertBoxEl);
        addIconLine(alertBoxEl, 'error', msg);
        if (alertBox === 'alertMpdStatusError') {
            const clBtn = elCreateEmpty('button', {"class": ["btn-close"]});
            alertBoxEl.appendChild(clBtn);
            clBtn.addEventListener('click', function() {
                clearMPDerror();
            }, false);
        }
        elShow(alertBoxEl);
    }
}

const severities = {
    "info": "Info",
    "warn": "Warning",
    "error": "Error"
};

const facilities = { 
    "player": "Player",
    "queue": "Queue",
    "general": "General",
    "database": "Database",
    "playlist": "Playlist",
    "mpd": "MPD",
    "lyrics": "Lyrics",
    "jukebox": "Jukebox",
    "trigger": "Trigger",
    "script": "Script",
    "sticker": "Sticker",
    "home": "Home",
    "timer": "Timer",
    "session": "Session"
};

function showNotification(title, text, facility, severity) {
    setStateIcon();
    logMessage(title, text, facility, severity);
    
    if (settings.notificationWeb === true) {
        const notification = new Notification(title, {icon: 'assets/favicon.ico', body: text});
        setTimeout(notification.close.bind(notification), 3000);
    }
    
    if (severity === 'info') {
        //notifications with severity info can be hidden
        if (settings.notificationPage === false) { 
            return;
        }
        //disabled notification for facility in advanced setting
        let show = settings.webuiSettings['notification' + facilities[facility]];
        if (show === null ) {
            logDebug('Unknown facility: ' + facility);
            //fallback to general
            show = settings.webuiSettings['notificationGeneral'];    
        }
        if (show === false) { 
            return;
        }
    }

    const toast = elCreateEmpty('div', {"class": ["toast"]});
    const toastHeader = elCreateEmpty('div', {"class": ["toast-header"]});
    if (severity === 'info' ) {
        toastHeader.appendChild(elCreateText('span', {"class": ["mi", "text-success", "me-2"]}, 'info'));
    }
    else if (severity === 'warn' ) {
        toastHeader.appendChild(elCreateText('span', {"class": ["mi", "text-warning", "me-2"]}, 'warning'));
    }
    else {
        toastHeader.appendChild(elCreateText('span', {"class": ["mi", "text-danger", "me-2"]}, 'error'));
    }
    toastHeader.appendChild(elCreateText('strong', {"class": ["me-auto"]}, title));
    toastHeader.appendChild(elCreateEmpty('button', {"type": "button", "class": ["btn-close"], "data-bs-dismiss": "toast"}));
    toast.appendChild(toastHeader);
    if (text !== '') {
        toast.appendChild(elCreateText('div', {"class": ["toast-body"]}, text));
    }
    document.getElementById('alertBox').prepend(toast);
    const toastInit = new BSN.Toast(toast, {delay: 2500});
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    }, false);
    toastInit.show();
}

function logMessage(title, text, facility, severity) {
    if (severities[severity] !== undefined) {
        severity = severities[severity];
    }
    else { 
        logDebug('Unknown severity: ' + severity);
    }
    
    if (facilities[facility] !== undefined) {
        facility = facilities[facility];
    }
    else { 
        logDebug('Unknown facility: ' + facility);
    }
    
    const overview = document.getElementById('logOverview');

    let append = true;
    const lastEntry = overview.firstElementChild;
    if (lastEntry && getCustomDomProperty(lastEntry, 'data-title') === title) {
        append = false;        
    }

    const entry = document.createElement('div');
    entry.classList.add('text-light');
    setCustomDomProperty(entry, 'data-title', title);
    let occurence = 1;
    if (append === false) {
        occurence += Number(getCustomDomProperty(lastEntry, 'data-occurence'));
    }
    setCustomDomProperty(entry, 'data-occurence', occurence);
    entry.innerHTML = '<small>' + localeDate() + '&nbsp;&ndash;&nbsp;' + t(facility) +
        ':&nbsp;' + t(severity) +
        (occurence > 1 ? '&nbsp;(' + occurence + ')' : '') + '</small>' +
        '<p>' + e(title) + (text === '' ? '' : '<br/>' + e(text)) + '</p>';

    if (append === true) {
        overview.insertBefore(entry, overview.firstElementChild);
    }
    else {
        overview.replaceChild(entry, lastEntry);
    }
   
    const overviewEls = overview.getElementsByTagName('div');
    if (overviewEls.length > 10) {
        overviewEls[10].remove();
    }
}

//eslint-disable-next-line no-unused-vars
function clearLogOverview() {
    const overviewEls = document.getElementById('logOverview').getElementsByTagName('div');
    for (let i = overviewEls.length - 1; i >= 0; i--) {
        overviewEls[i].remove();
    }
    setStateIcon();
}

function notificationsSupported() {
    return "Notification" in window;
}

function setElsState(tag, state, type) {
    const els = type === 'tag' ? document.getElementsByTagName(tag) : document.getElementsByClassName(tag);
    for (const el of els) {
        if (el.classList.contains('close')) {
            continue;
        }
        if (state === 'disabled') {
            if (el.classList.contains('alwaysEnabled') === false && el.getAttribute('disabled') === null) {
                elDisable(el);
                el.classList.add('disabled');
            }
        }
        else if (el.classList.contains('disabled')) {
            elEnable(el);
            el.classList.remove('disabled');
        }
    }
}

function toggleUI() {
    let state = 'disabled';
    if (websocketConnected === true && settings.mpdConnected === true) {
        state = 'enabled';
    }
    const enabled = state === 'disabled' ? false : true;
    if (enabled !== uiEnabled) {
        logDebug('Setting ui state to ' + state);
        setElsState('a', state, 'tag');
        setElsState('input', state, 'tag');
        setElsState('select', state, 'tag');
        setElsState('button', state, 'tag');
        setElsState('textarea', state, 'tag');
        setElsState('clickable', state, 'class');
        uiEnabled = enabled;
    }

    if (settings.mpdConnected === true) {
        toggleAlert('alertMpdState', false, '');
    }
    else {
        toggleAlert('alertMpdState', true, tn('MPD disconnected'));
        logMessage(t('MPD disconnected'), '', 'mpd', 'error');
    }

    if (websocketConnected === true) {
        toggleAlert('alertMympdState', false, '');
    }
    else if (appInited === true) {
        toggleAlert('alertMympdState', true, tn('Websocket is disconnected'));
        logMessage(t('Websocket is disconnected'), '', 'general', 'error');
    }

    toggleTopAlert();
    setStateIcon();
}

function toggleTopAlert() {
    const topAlert = document.getElementById('top-alerts');
    if (uiEnabled === false || (lastState !== undefined && lastState.lastError !== '')) {
        let topPadding = 0;
        if (window.innerWidth < window.innerHeight) {
            topPadding = document.getElementById('header').offsetHeight;
        }
        topAlert.style.paddingTop = topPadding + 'px';
        elShow(topAlert);
        const mt = topAlert.offsetHeight - parseInt(topAlert.style.paddingTop);
        document.getElementsByTagName('main')[0].style.marginTop = mt + 'px';
    }
    else {
        document.getElementsByTagName('main')[0].style.marginTop = 0;
        elHide(topAlert);
    }
}

function showModalAlert(obj) {
    const aModal = getOpenModal();
    const activeAlert = aModal.getElementsByClassName('modalAlert')[0];
    const div = elCreateEmpty('div', {"class": ["alert", "alert-danger", "modalAlert"]});
    addIconLine(div, 'error_outline', tn(obj.error.message, obj.error.data));
    if (activeAlert === undefined) {
        aModal.getElementsByClassName('modal-body')[0].appendChild(div);
    }
    else {
        aModal.getElementsByClassName('modal-body')[0].replaceChild(div, activeAlert);
    }
}

function hideModalAlert() {
    const activeAlerts = document.getElementsByClassName('modalAlert');
    for (let i = activeAlerts.length - 1; i >= 0; i--) {
        activeAlerts[i].remove();
    }
}
