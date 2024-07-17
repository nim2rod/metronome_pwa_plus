let intervalId;

const soundSetting = {
    volume: 1,
    primaryClick: "./sound/digit.wav",
    seconderyClick: "./sound/digit-up.wav",
    playIsOn: false
}

let GlobalSong = { songName: null, bpm: null }
let songsFromStorage = []

const divisionSetting = {
    division: 1,
    beatCount: 1,
    silentBitCount: 4 * this.division,
    silentBeatNum: 1,
    silentBeatMode: false
}

const arrowsVolume = {
    isArrowUpPressed: false,
    isArrowDownPressed: false
}

document.addEventListener('keydown', function (event) {
    // console.log('event.code: ', event.code)
    if (event.code === 'Space') {
        let trackName = document.getElementById("input-song").value
        if (trackName) return
        if (soundSetting.playIsOn) {
            stop();
            soundSetting.playIsOn = false;
        } else {
            start();
            soundSetting.playIsOn = true;
        }
        event.preventDefault(); // prevent default space key behavior (scrolling)
    }
    if (event.code === 'Enter') addSong()
    if (event.code === 'ArrowUp') {
        if (!arrowsVolume.isArrowUpPressed) {
            changeClass('volumeUp', 'add', 'arrowsVolume.isArrowUpPressed', true)
        }
        volumeChange('up', 'fromKeyboard')
    }
    if (event.code === 'ArrowDown') {
        if (!arrowsVolume.isArrowDownPressed) {
            changeClass('volumeDown', 'add', 'arrowsVolume.isArrowDownPressed', true)
        }
        volumeChange('down', 'fromKeyboard')
    }
    if (event.code === 'ArrowRight') bpmChange('plus')
    if (event.code === 'ArrowLeft') bpmChange('minus')
})

document.addEventListener('keyup', function (event) {
    if (event.code === 'ArrowUp') {
        changeClass('volumeUp', 'remove', 'arrowsVolume.isArrowUpPressed', false)
    } else if (event.code === 'ArrowDown') {
        changeClass('volumeDown', 'remove', 'arrowsVolume.isArrowDownPressed', false)
    }
})

function changeClass(id, action, flag, boolean) {
    document.getElementById(id).classList[action]('btn-active')
    window[flag] = boolean
}

init()
function init() {
    audio = new Audio(soundSetting.primaryClick)
    let stopIcon = document.getElementById('stop');
    stopIcon.style.display = `none`

    const data = getFromLocal()
    if (data && data.length) {
        songsFromStorage = data
        // songsFromStorage.push(...data)
        renderSongs(songsFromStorage)
    }
}

function start() {
    if (divisionSetting.silentBeatMode) {
        divisionSetting.silentBitCount = 4 * divisionSetting.division
        divisionSetting.silentBeatNum = 1
    }
    divisionSetting.beatCount = 1
    const bpmInit = document.getElementById("bpm").value
    document.querySelector('.bpm-show').innerHTML = bpmInit
    clearInterval(intervalId);
    bpm = parseInt(bpmInit);

    let beatDurationInSec = 60 / bpm

    bpm = bpm * divisionSetting.division
    intervalId = setInterval(playClick, (60 / bpm) * 1000);
    soundSetting.playIsOn = true

    changePlayPauseBtn('play')
    handleAnimation(beatDurationInSec)
}

function stop() {
    clearInterval(intervalId);
    soundSetting.playIsOn = false
    divisionSetting.beatCount = 1

    changePlayPauseBtn('stop')
}

function handleAnimation(beatDuration) {
    let stopIcon = document.getElementById('stop');
    // move animation
    stopIcon.style.animation = 'none';
    stopIcon.offsetWidth;
    stopIcon.style.animation = null;
    // add animation
    stopIcon.classList.add('metronome-play', 'pulsing');
    stopIcon.style.animationDuration = `${beatDuration}s`
}

function changePlayPauseBtn(state) { /// play / [stop] 
    let playIcon = document.getElementById('start');
    let stopIcon = document.getElementById('stop');
    stopIcon.style.display = state === 'play' ? `inline` : `none`
    playIcon.style.display = state === 'stop' ? `inline` : `none`  // 
}

function playClick() {
    let audio = null
    if (divisionSetting.silentBeatMode && divisionSetting.silentBitCount <= divisionSetting.silentBeatNum && divisionSetting.silentBitCount !== 1) {
        divisionSetting.beatCount++
        if (divisionSetting.beatCount === divisionSetting.division + 1) divisionSetting.beatCount = 1
        divisionSetting.silentBitCount--
        return
    }
    if (divisionSetting.silentBeatMode && divisionSetting.silentBitCount === 1) {
        (divisionSetting.silentBeatNum === divisionSetting.division * 4) ? divisionSetting.silentBeatNum = 1 : divisionSetting.silentBeatNum++

        divisionSetting.silentBitCount = 4 * divisionSetting.division  // 4 * 2 = 8 
        divisionSetting.beatCount++
        if (divisionSetting.beatCount === divisionSetting.division + 1) divisionSetting.beatCount = 1
        return
    }
    if (divisionSetting.division === 1 || divisionSetting.beatCount === 1) { //primary
        audio = new Audio(soundSetting.primaryClick)
    } else {                                   // secondery
        audio = new Audio(soundSetting.seconderyClick);
    }
    audio.volume = soundSetting.volume
    audio.play();
    divisionSetting.beatCount++
    if (divisionSetting.silentBeatMode) divisionSetting.silentBitCount--
    if (divisionSetting.beatCount === divisionSetting.division + 1) divisionSetting.beatCount = 1
}

function moveBpmRange() {
    const bpmChange = document.getElementById("bpm").value
    if (GlobalSong.songName) {
        GlobalSong.bpm = bpmChange
        update()
    }
    start()
}

function bpmChange(ev) {
    let val = null
    if (ev === 'plus') val = 'plus'
    else if (ev === 'minus') val = 'minus'
    else val = ev.target.value
    if (val === 'plus') {
        document.getElementById("bpm").value++
        if (GlobalSong.songName) GlobalSong.bpm++
    }
    if (val === 'minus') {
        document.getElementById("bpm").value--
        if (GlobalSong.songName) GlobalSong.bpm--
    }
    if (GlobalSong.songName) {
        update()
    }
    start()
}

function volumeChange(ev) {
    let val = null
    if (ev === 'up') val = 'up'
    else if (ev === 'down') val = 'down'
    else val = ev.target.dataset.value
    if (val === 'up') {
        if (soundSetting.volume >= 1) return
        else soundSetting.volume += 0.1
    }
    if (val === 'down') {
        if (soundSetting.volume <= 0.3) return
        else soundSetting.volume -= 0.1
    }
}

function soundChange(ev) {
    const sound = ev.target.dataset.value;
    document.querySelectorAll('.sound').forEach((img) => img.classList.remove('active'))
    ev.target.classList.add('active')
    switch (sound) {
        case 'stick':
            soundSetting.primaryClick = './sound/stick.wav'
            soundSetting.seconderyClick = './sound/stick-up.wav'
            break
        case 'cowbell':
            soundSetting.primaryClick = './sound/bell.wav'
            soundSetting.seconderyClick = './sound/bell-up.wav'
            break
        case 'met':
            soundSetting.primaryClick = './sound/met.wav'
            soundSetting.seconderyClick = './sound/met-up.wav'
            break
        case 'pulse':
            soundSetting.primaryClick = './sound/digit.wav'
            soundSetting.seconderyClick = './sound/digit-up.wav'
            break
    }
    divisionSetting.beatCount = 1
}

function addSong() {
    let bpm = document.getElementById("bpm").value
    let trackName = document.getElementById("input-song").value
    if (!trackName) return
    const checkIfUniq = songsFromStorage.find((song) => song.songName === trackName)
    if (checkIfUniq) {
        removeClass()
        return
    }

    const newSong = { songName: trackName, bpm: bpm }
    GlobalSong = { ...newSong }
    copyGlobal = { ...newSong }
    songsFromStorage.push(copyGlobal)
    setToLocal(songsFromStorage)
    renderSongs(songsFromStorage)
    removeClass()
}

function removeClass() {
    document.querySelector('.input-song').value = ``
    let addButton = document.getElementById('add-song')
    addButton.classList.remove('active')
}

function pickNewSong(bpm, trackName) {
    GlobalSong = { songName: trackName, bpm: bpm }
    document.getElementById("bpm").value = bpm
    document.querySelector('.bpm-show').innerHTML = bpm
    stop()
    // start()
}

function renderSongs(songs) {
    document.querySelector('.list').innerHTML = ``
    songs.forEach((song) => {
        document.querySelector('.list').innerHTML += `
        <div id="song-line" class="song-line btn">
        <span id="song-name" class="song-name">${song.songName}</span>
        <span class="song-line-right"><span id="song-bpm" class="song-bpm">${song.bpm}</span> 
        <i id="delete-song" class="material-icons delete-song btn">delete</i>
        </span></div>
        `
        // <img id="delete-song" class="delete-song btn" src="./icons/x-mark.png" alt="" data-value="stick">
    })

    const songLines = document.querySelectorAll('#song-line');
    songLines.forEach(songLine => {
        const lineBpm = songLine.querySelector('.song-bpm').textContent;
        const lineTrackName = songLine.querySelector('.song-name').textContent;
        songLine.addEventListener('click', function () {
            pickNewSong(lineBpm, lineTrackName);
            songLines.forEach(line => {
                line.classList.remove('selected')
            });

            this.classList.add('selected')
        });
        if (lineTrackName === GlobalSong.songName) songLine.classList.add('selected')

        const deleteBtn = songLine.querySelector('.delete-song')
        const songToDelete = { songName: lineTrackName, bpm: lineBpm }
        deleteBtn.addEventListener('click', function () {
            remove(songToDelete)
        })
    });
}

function getFromLocal() {
    // let res
    // chrome.storage.local.get("songsList", function (result) {
    //     res = JSON.parse(result.songsList)
    // })
    // return res
    let data = localStorage.getItem('songsList')
    return JSON.parse(data)
}

function setToLocal(songs) {
    localStorage.setItem('songsList', JSON.stringify(songs))
}

function update() {
    let songToReplace = { ...GlobalSong }
    const index = songsFromStorage.findIndex((song) => {
        return song.songName === songToReplace.songName
    })
    songsFromStorage.splice(index, 1, songToReplace)

    setToLocal(songsFromStorage)
    renderSongs(songsFromStorage)
}

function remove(songToDelete) {
    const index = songsFromStorage.findIndex((song) => {
        return song.songName === songToDelete.songName
    })
    songsFromStorage.splice(index, 1)
    setToLocal(songsFromStorage)
    renderSongs(songsFromStorage)
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);
document.getElementById('bpm').addEventListener('input', moveBpmRange);
document.getElementById('minus').addEventListener('click', bpmChange);
document.getElementById('plus').addEventListener('click', bpmChange);
document.getElementById('volumeUp').addEventListener('click', volumeChange);
document.getElementById('volumeDown').addEventListener('click', volumeChange);
document.getElementById('add-song').addEventListener('click', addSong);
document.getElementById('silent-mode').addEventListener('click', () => {
    divisionSetting.silentBeatMode = !divisionSetting.silentBeatMode
    if (divisionSetting.silentBeatMode) document.querySelector('.silent-mode').classList.add('active')
    else document.querySelector('.silent-mode').classList.remove('active')
    start()
})
// input song change color of + button  
document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('input-song');
    var addButton = document.getElementById('add-song');

    input.addEventListener('input', function () {
        console.log('input event')
        if (input.value.trim() !== '') {
            addButton.classList.add('active');
        } else {
            addButton.classList.remove('active');
        }
    });
})


const sounds = document.querySelectorAll('.sound');
sounds.forEach(sound => {
    sound.addEventListener('click', soundChange);
});
document.querySelector('.bpm-show').innerHTML = document.getElementById("bpm").value

// TAP TEMPO //
const tapTempoButton = document.getElementById('tap-tempo');
let tapTempoTimes = [];
let lastTimeClicked = 0;

tapTempoButton.addEventListener('click', function () {
    let tempo
    const now = performance.now();
    if (lastTimeClicked !== 0) {
        const timeDiff = now - lastTimeClicked;
        if (lastTimeClicked !== 0 && timeDiff > 2500) tapTempoTimes = []
        else tapTempoTimes.push(timeDiff);
        if (tapTempoTimes.length > 4) {
            tapTempoTimes.shift();
        }
        const averageTime = tapTempoTimes.reduce((a, b) => a + b, 0) / tapTempoTimes.length;
        tempo = Math.round(60000 / averageTime);
    }
    lastTimeClicked = now;
    if (tapTempoTimes.length > 1) {
        document.getElementById("bpm").value = tempo
        if (GlobalSong.songName) {
            GlobalSong.bpm = tempo
            update()
        }
        start()
    }

});

const bpmDivides = document.querySelectorAll('.divide-box span');
bpmDivides.forEach((divide) => {
    divide.addEventListener('click', (ev) => {
        divisionSetting.division = +ev.target.dataset.value
        start()
        bpmDivides.forEach((divide) => divide.classList.remove('active'));
        divide.classList.add('active');
    });
    bpmDivides[0].classList.add('active');
});






