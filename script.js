let pages = {
    mainPage: true,
    enterNamePage: false,
    countDownPage: false,
    gamePage: false,
    scorePage: false,
};
let angle = 0;
let countDown = 0;
let frame = 0;
let start = false;
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US'; // Set language to English
recognition.interimResults = false; // Set to true if you want to see partial results
recognition.maxAlternatives = 1; // Number of alternatives to get

let pauseTime = 0;
let line = 0;
let time = 0;
let lineOpacity = 0;
let lyricsStart = false;
let name = "";
let songWithoutSinger = null;
let showScore = false;
let score = 0;
let orignal = "PepperoniRoniPepperoniRoniOhDomino'sGiveMeMorePepperoniRoni150%MorePepperoniRoniWithAMozzarellaTwistyCrust";
let result = "";
let readData = false;
let leaderBoardData = [];
const baseWidth = 1100;
const baseHeight = 600;
let screenScale = 1;
let gameOver = false;
let pause = false;

const lyrics = {
    0: [
        {
            word: "PEPPERONI",
            activeTime: 7,
        }
    ],
    1: [
        {
            word: "RONI",
            activeTime: 8,
        }
    ],
    2: [
        {
            word: "PEPPERONI",
            activeTime: 10,
        }
    ],
    3: [
        {
            word: "RONI",
            activeTime: 11,
        }
    ],
    4: [
        {
            word: "OH DOMINO'S",
            activeTime: 13,
        }
    ],
    5: [
        {
            word: "GIVE ME MORE",
            activeTime: 14,
        }
    ],
    6: [
        {
            word: "PEPPERONI",
            activeTime: 15,
        }
    ],
    7: [
        {
            word: "RONI",
            activeTime: 18,
        }
    ],
    8: [
        {
            word: "ONE HUNDRED",
            activeTime: 22,
        }
    ],
    9: [
        {
            word: "FIFTY PERCENT",
            activeTime: 23,
        }
    ],
    10: [
        {
            word: "MORE PEPPERONI RONI",
            activeTime: 25,
        }
    ],
    11: [
        {
            word: "WITH A MOZZARELLA",
            activeTime: 28,
        }
    ],
    12: [
        {
            word: "TWISTY",
            activeTime: 29,
        }
    ],
    13: [
        {
            word: "CRUST",
            activeTime: 30,
        }
    ],
};


function getInactiveLine() {
    let temp = "";

    for (let index = 0; index < line; index++) {

        const element = lyrics[index];

        if (index == 8) {
            temp += "150";
        }
        else if (index == 9) {
            temp += "%";
        }
        else {
            temp += element[0]["word"];
        }
    }

    return temp;
}

const firebaseConfig = {
    apiKey: "AIzaSyDy-6N_Da0nBsV82c1oQ9ymnuSkxge_hJI",
    authDomain: "pepronigame.firebaseapp.com",
    projectId: "pepronigame",
    storageBucket: "pepronigame.appspot.com",
    messagingSenderId: "475301276091",
    appId: "1:475301276091:web:83456cbff36f4f7fbbfc9e"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const peproniGameCollection = db.collection("peproniGame");

var stop = false;
var frameCount = 0;
var fpsInterval, startTime, now, then, elapsed;


function drawLine(activeLine, futureLine) {


    let lineToDraw = activeLine[0];
    const fontSize = getScaleValue(30);
    const fontFamily = "Futura";
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = "center";
    const textWidth = context.measureText(lineToDraw).width;
    const startX = canvas.width / 2;
    const y = getScaleValue(450);
    const color = "orange";
    context.fillStyle = color;
    context.fillText(lineToDraw['word'], startX, y);


    if (futureLine != undefined) {
        let lineToDraw = futureLine[0];
        const fontSize = getScaleValue(30);
        const fontFamily = "Futura";
        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = "center";
        const textWidth = context.measureText(lineToDraw).width;
        const startX = canvas.width / 2;
        const y = getScaleValue(490);
        const color = "gray";
        context.fillStyle = color;
        context.fillText(lineToDraw['word'], startX, y);

    }


    context.globalAlpha = lineOpacity;
}

function getScaleValue(value) {
    return value * 1;
}

function getScaleClickValue(value) {
    return value * screenScale;
}

function getWindowScaleValue() {

    const windowWidth = window.innerWidth;
    screenScale = (windowWidth / baseWidth) * 0.9;
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    canvas.style.transform = `scale(${screenScale})`;
    canvas.style.transformOrigin = 'center center';
    context.textBaseline = "middle";

}

async function readDatFromFireBase() {
    try {
        const snapshot = await peproniGameCollection.get();
        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });

        data.sort((a, b) => b.score - a.score);

        leaderBoardData = data;

        // Call the function to process the fetched data
        // processFetchedData(data);

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

function writeDataInFireBase(gameBackVideo) {
    db.collection("peproniGame").add({
        name: name,
        score: score
    })
        .then(docRef => {

            gameBackVideo.pause();
            gameBackVideo.style.display = 'none';
            showScore = true;
            pages.gamePage = false;
            pages.scorePage = true;


            console.log("Document written with ID: ", docRef.id);
            // Optionally, clear the form after submission
        })
        .catch(error => {
            console.error("Error adding document: ", error);
        });

}

function restart() {

    pauseTime = 0;
    recognition.stop();
    pause = false
    result = ""
    songWithoutSinger.pause();
    songWithoutSinger.currentTime = 0;
    readData = false;

    score = 0;
    showScore = false;

    pages = {
        mainPage: false,
        enterNamePage: false,
        countDownPage: true,
        gamePage: false,
        scorePage: false,
    };
    angle = 0;
    countDown = 0;
    frame = 0;
    start = false;
    line = 0;
    time = 0;
    lineOpacity = 0;
    lyricsStart = false;
    gameOver = false;

}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (
        (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
    );
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function mainPage(
    context,
    discImg,
    handleImg,
    volumeImg,
    listenToSongImg,
    listenToSongImgBtn,
    readyImg,
    readyBtnImg
) {
    const scale = 0.57;
    let scaledWidth = 0;
    let scaledHeight = 0;

    // Drawing Disc Start
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    scaledWidth = discImg.width * scale;
    scaledHeight = discImg.height * scale;
    context.drawImage(
        discImg,
        getScaleValue(-scaledWidth / 2),
        getScaleValue(-scaledHeight / 2),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    context.restore();
    angle += 0.01;
    // Drawing Disc End

    // Drawing Handle Start
    scaledWidth = getScaleValue(handleImg.width * scale);
    scaledHeight = getScaleValue(handleImg.width * scale);
    context.drawImage(handleImg, getScaleValue(510), getScaleValue(-50), scaledWidth, scaledHeight);
    // Drawing Handle End


    volumeImg.style.display = "flex";

    // // Drawing Volume Start
    // scaledWidth = getScaleValue(volumeImg.width * 0.8);
    // scaledHeight = getScaleValue(volumeImg.height * 0.8);
    // context.drawImage(volumeImg, getScaleValue(-243), getScaleValue(-380), scaledWidth, scaledHeight);
    // // Drawing Volume End


    // Drawing listen To Song Start
    scaledWidth = getScaleValue(listenToSongImg.width * 0.6);
    scaledHeight = getScaleValue(listenToSongImg.height * 0.6);
    context.drawImage(listenToSongImg, getScaleValue(-160), getScaleValue(-5), scaledWidth, scaledHeight);
    // Drawing listen To Song End

    // Drawing listen To Song Btn Start
    scaledWidth = getScaleValue(listenToSongImgBtn.width * 0.6);
    scaledHeight = getScaleValue(listenToSongImgBtn.height * 0.6);
    context.drawImage(listenToSongImgBtn, getScaleValue(-168), getScaleValue(110), scaledWidth, scaledHeight);
    // Drawing listen To Song Btn End

    let value = getScaleValue(20);
    context.strokeStyle = "black"; // You can change this to any color you want
    context.lineWidth = 0.5; // Adjust the thickness of the stroke

    context.font = `${value}px Futura`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.strokeText("LISTEN TO SONG", getScaleValue(168), getScaleValue(437));
    context.fillText("LISTEN TO SONG", getScaleValue(168), getScaleValue(437));
    //

    // Drawing Ready Start
    scaledWidth = getScaleValue(readyImg.width * 0.6);
    scaledHeight = getScaleValue(readyImg.height * 0.6);
    context.drawImage(readyImg, getScaleValue(625), getScaleValue(0), scaledWidth, scaledHeight);
    // Drawing Ready End

    // Drawing Ready Btn Start
    scaledWidth = getScaleValue(readyBtnImg.width * 0.6);
    scaledHeight = getScaleValue(readyBtnImg.height * 0.6);
    context.drawImage(readyBtnImg, getScaleValue(625), getScaleValue(110), scaledWidth, scaledHeight);
    // Drawing Ready Btn End
}

function namePage(
    context,
    discImg,
    handleImg,
    enterNameTextImg,
    enterNameRectangleImg,
    doneBtnImg
) {
    const scale = 0.5;
    let scaledWidth = 0;
    let scaledHeight = 0;

    // Drawing Disc Start
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    scaledWidth = discImg.width * scale;
    scaledHeight = discImg.height * scale;
    context.drawImage(
        discImg,
        getScaleValue(-scaledWidth / getScaleValue(2)),
        getScaleValue(-scaledHeight / getScaleValue(2)),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    context.restore();
    angle += 0.01;
    // Drawing Disc End

    let value = getScaleValue(35);
    context.strokeStyle = "black";
    context.lineWidth = 0.8;
    context.font = `${value}px Futura`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.strokeText("ENTER YOUR NAME", getScaleValue(550), getScaleValue(260));
    context.fillText("ENTER YOUR NAME", getScaleValue(550), getScaleValue(260));
    //


    // Drawing Enter Name Rect Start
    scaledWidth = enterNameRectangleImg.width * 0.6;
    scaledHeight = enterNameRectangleImg.height * 0.6;
    context.drawImage(enterNameRectangleImg, getScaleValue(225), getScaleValue(-5), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Drawing Enter Name Rect End

    // Drawing Handle Start
    scaledWidth = handleImg.width * scale;
    scaledHeight = handleImg.width * scale;
    context.drawImage(handleImg, getScaleValue(570), getScaleValue(-50), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Drawing Handle End

    // Drawing Done Btn Start
    scaledWidth = doneBtnImg.width * 0.6;
    scaledHeight = doneBtnImg.height * 0.6;
    context.drawImage(doneBtnImg, getScaleValue(225), getScaleValue(60), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Drawing  Done Btn  End

    value = getScaleValue(20) + 5;
    context.font = `${value}px Futura`;
    context.fillStyle = "black";
    context.textAlign = "left";
    context.fillText(name, getScaleValue(425), getScaleValue(320));

}

function countDownPage(
    context,
    frame,
    discImg,
    handleImg,
    goodLuckImg,
    instructionImg,
    instruction_2Img,
    threeImg,
    twoImg,
    oneImg
) {
    const scale = 0.5;
    let scaledWidth = 0;
    let scaledHeight = 0;

    // Drawing Disc Start
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle);
    scaledWidth = discImg.width * scale;
    scaledHeight = discImg.height * scale;
    context.drawImage(
        discImg,
        getScaleValue(-scaledWidth / 2),
        getScaleValue(-scaledHeight / 2),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    context.restore();
    angle += 0.01;
    // Drawing Disc End

    if (countDown<4) {
        // Drawing Instruction Text Start
        scaledWidth = getScaleValue(instructionImg.width * 0.6);
        scaledHeight = getScaleValue(instructionImg.height * 0.6);
        context.drawImage(instructionImg, getScaleValue(225), getScaleValue(-60), scaledWidth, scaledHeight);
        // Drawing Instruction Text Text End

        // Drawing Instruction Text Start
        scaledWidth = goodLuckImg.width * 0.6;
        scaledHeight = goodLuckImg.height * 0.6;
        context.drawImage(goodLuckImg, getScaleValue(225), getScaleValue(45), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
        // Drawing Instruction Text Text End
    }else if(countDown<7)
    {

        scaledWidth = getScaleValue(instruction_2Img.width * 0.6);
        scaledHeight = getScaleValue(instruction_2Img.height * 0.6);
        context.drawImage(instruction_2Img, getScaleValue(430), getScaleValue(220), scaledWidth, scaledHeight);
        
    } 
    
    else {
        if (countDown == 7) {
            let value = getScaleValue(250);
            context.font = `bold ${value}px Futura`;
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText("3", getScaleValue(545), getScaleValue(310));
        } else if (countDown == 8) {
            let value = getScaleValue(250);
            context.font = `bold ${value}px Futura`;
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText("2", getScaleValue(545), getScaleValue(310));
        } else if (countDown == 9) {
            let value = getScaleValue(250);
            context.font = `bold ${value}px Futura`;
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText("1", getScaleValue(545), getScaleValue(310));
        } else {
            pages.countDownPage = false;
            pages.gamePage = true;
        }
    }

    // Drawing Handle Start
    scaledWidth = handleImg.width * scale;
    scaledHeight = handleImg.width * scale;
    context.drawImage(handleImg, getScaleValue(570), getScaleValue(-50), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Drawing Handle End

    if (frame % 60 == 0) {
        countDown++;
    }
}

function drawLyricsLine(gameBackVideo) {

    let lineArray = lyrics[line];

    if (time == lyrics["0"][0]["activeTime"]) {
        lyricsStart = true;
    }

    if (lineArray != undefined && lyricsStart == true) {
        drawLine(lyrics[line], lyrics[line + 1]);
    }

    if (
        line < 14 &&
        time >= lineArray[0]["activeTime"] && lyrics[line + 1] != undefined && time == lyrics[line + 1][0]["activeTime"]
    ) {
        line++;
        console.log(line);
        lineOpacity = 0;
    } else if (line >= 13) {
        // Connection to send data to firebase
        setTimeout(() => {
            if (gameOver == false) {

                recognition.stop();
                writeDataInFireBase(gameBackVideo);
                gameOver = true;
            }
        }, 5000)

    }

    lineOpacity += 0.005;

    context.globalAlpha = 1;
}

function gamePage(
    context,
    frame,
    gameBackVideo,
    peproniSliceImg,
    peproniTaglineImg,
    guitarImg,
    listenToSongBtnGamePageImg,
    restartBtnImg,
    quitBtnImg
) {


    if (start == false) {
        gameBackVideo.play();
        gameBackVideo.style.display = 'flex';
        songWithoutSinger.play();
        recognition.start();
        start = true;

        let testingScore = 0;
        let testingResult = 0;


        recognition.onresult = (event) => {

            if (event.results[event.results.length - 1].isFinal && pause == false) {
                let temp = event.results[event.results.length - 1][0].transcript;
                result += temp;
                testingResult = result;
                let spaceFreeLine = testingResult.replace(/ /g, '');

                if (line == 13) {
                    spaceFreeLine = result.replace(/ /g, '');
                    line=14;
                }

                let temp2 = getInactiveLine().replace(/ /g, '');
                console.log("Orignal ", temp2);
                console.log("Spoken ", spaceFreeLine);
                let percentage = similarity(temp2, spaceFreeLine);
                let tempScore = Math.ceil(percentage * ((line+1) * 10));
                tempScore = Math.ceil(tempScore / 10) * 10;

                if(tempScore>score)
                {
                    score=tempScore;
                }

                console.log(tempScore);
                console.log("Score " + score);

            }
        };
    }

    if (frame % 60 == 0) {
        if (pause == false) {
            time++;
        }
    }

    // Drawing peproniSliceImg Disc Start
    let scale = 0.25;
    context.save();
    context.translate(canvas.width / 2 + getScaleValue(100), getScaleValue(250));
    context.rotate(angle);
    scaledWidth = getScaleValue(peproniSliceImg.width * scale);
    scaledHeight = getScaleValue(peproniSliceImg.height * scale);
    context.drawImage(
        peproniSliceImg,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
    );

    context.restore();
    angle += 0.01;
    // Drawing peproniSliceImg Disc End

    // Guitar Start
    scaledWidth = getScaleValue(guitarImg.width * 0.5);
    scaledHeight = getScaleValue(guitarImg.height * 0.5);
    let x = (canvas.width - scaledWidth) / 2;
    let y = (canvas.height - scaledHeight) / 2 - getScaleValue(50);

    // Save the current context state
    context.save();

    // Begin a new path for the rounded rectangle
    context.beginPath();
    context.moveTo(x + 20, y); // Adjust 20 to your desired radius
    context.lineTo(x + scaledWidth - 20, y);
    context.arc(x + scaledWidth - 20, y + 20, 20, 1.5 * Math.PI, 2 * Math.PI);
    context.lineTo(x + scaledWidth, y + scaledHeight - 20);
    context.arc(x + scaledWidth - 20, y + scaledHeight - 20, 20, 0, 0.5 * Math.PI);
    context.lineTo(x + 20, y + scaledHeight);
    context.arc(x + 20, y + scaledHeight - 20, 20, 0.5 * Math.PI, Math.PI);
    context.lineTo(x, y + 20);
    context.arc(x + 20, y + 20, 20, Math.PI, 1.5 * Math.PI);
    context.closePath();

    // Clip to the rounded rectangle path
    context.clip();

    // Draw the image
    context.drawImage(guitarImg, x, y, scaledWidth, scaledHeight);

    // Restore the context state
    context.restore();


    // Guitar Start
    scaledWidth = listenToSongBtnGamePageImg.width * 0.5;
    scaledHeight = listenToSongBtnGamePageImg.height * 0.5;
    context.drawImage(
        listenToSongBtnGamePageImg,
        getScaleValue(140),
        getScaleValue(280),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    // Guitar End


    // Guitar Start
    scaledWidth = restartBtnImg.width * 0.5;
    scaledHeight = restartBtnImg.height * 0.5;
    context.drawImage(restartBtnImg, getScaleValue(340), getScaleValue(280), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Guitar End



    // Guitar Start
    scaledWidth = peproniSliceImg.width * 0.13;
    scaledHeight = peproniSliceImg.height * 0.13;
    context.drawImage(peproniSliceImg, getScaleValue(968), getScaleValue(25), getScaleValue(scaledWidth), getScaleValue(scaledHeight));



    value = getScaleValue(15);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.font = `${value}px Futura`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.strokeText("YOUR SCORE", getScaleValue(1038), getScaleValue(78));
    context.fillText("YOUR SCORE", getScaleValue(1038), getScaleValue(78));
    //


    value = getScaleValue(33);
    context.strokeStyle = "black";
    context.lineWidth = 0.8;
    context.font = `${value}px Futura`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.strokeText(score, getScaleValue(1038), getScaleValue(110));
    context.fillText(score, getScaleValue(1038), getScaleValue(110));


    // Guitar End

    // Guitar Start
    scaledWidth = quitBtnImg.width * 0.5;
    scaledHeight = quitBtnImg.height * 0.5;
    context.drawImage(quitBtnImg, getScaleValue(487), getScaleValue(280), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Guitar End


    value = getScaleValue(25);
    context.strokeStyle = "black";
    context.lineWidth = 0.8;
    context.font = `${value}px Futura`;
    context.fillStyle = "white";
    context.textAlign = "center";
    context.strokeText("PEPPER   NI-R   NI", getScaleValue(550), getScaleValue(93));
    context.fillText("PEPPER   NI-R   NI", getScaleValue(550), getScaleValue(93));
    //


    value = getScaleValue(12.5);
    context.strokeStyle = "black";
    context.lineWidth = 0.8;
    context.font = `${value}px Futura`;
    context.fillStyle = "#FFC40C";
    context.textAlign = "center";
    context.strokeText("A C O U S T I C  R E M IX", getScaleValue(548), getScaleValue(68));
    context.fillText("A C O U S T I C  R E M I X", getScaleValue(548), getScaleValue(68));


    // Guitar Start
    scaledWidth = peproniSliceImg.width * 0.025;
    scaledHeight = peproniSliceImg.height * 0.025;
    context.drawImage(
        peproniSliceImg,
        getScaleValue(532),
        getScaleValue(77),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    // Guitar End

    scaledWidth = peproniSliceImg.width * 0.025;
    scaledHeight = peproniSliceImg.height * 0.025;
    context.drawImage(
        peproniSliceImg,
        getScaleValue(602),
        getScaleValue(77),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );


    drawLyricsLine(gameBackVideo)
}

function scorePage(
    context,
    scoreBack,
    discImg,
    leaderboardBtnImg,
    playAgainBtnImg,
    leaderboardTextImg,
    topBackImg,
    runnerUpBack2Img,
    runnerUpBack3Img,
    runnerUpBack4Img,
    runnerUpBack5Img,
    closeBtn
) {

    scoreBack.play();
    scoreBack.style.display = 'flex';

    const scale = 0.45;
    let scaledWidth = 0;
    let scaledHeight = 0;

    // Drawing Disc Start
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    scaledWidth = discImg.width * scale;
    scaledHeight = discImg.height * scale;
    context.drawImage(
        discImg,
        getScaleValue(-scaledWidth / 2),
        getScaleValue(-scaledHeight / 2),
        getScaleValue(scaledWidth),
        getScaleValue(scaledHeight)
    );
    context.restore();


    if (showScore == true) {

        //
        let value = getScaleValue(40);
        context.font = `bold ${value}px Futura`;
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("YOUR SCORE", getScaleValue(545), getScaleValue(220));
        //

        //
        value = getScaleValue(120);
        context.font = `bold ${value}px Futura`;
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(score, getScaleValue(545), getScaleValue(350));
        //



    }
    else {


        if (readData == true) {
            readDatFromFireBase();
            readData = false;
        }


        let x = getScaleValue((canvas.width - getScaleValue(230)) / getScaleValue(2));
        let y = getScaleValue((canvas.height - getScaleValue(250)) / getScaleValue(2));
        let width = getScaleValue(230);
        let height = getScaleValue(250);
        let radius = getScaleValue(20);


        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.lineTo(x + width, y + height - radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.lineTo(x + radius, y + height);
        context.arcTo(x, y + height, x, y, radius);
        context.lineTo(x, y + radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
        context.stroke();
        context.fillStyle = 'white';
        context.fill();

        context.beginPath();
        context.arc((x + width) - getScaleValue(17), getScaleValue(194), getScaleValue(10), getScaleValue(0), getScaleValue(Math.PI * 2), false); // Create a circle
        context.fillStyle = 'white';
        context.fill();
        context.strokeStyle = 'white';
        context.stroke();

        console.log((x + width) - getScaleValue(17));

        // Leaderboard Text
        let scaledWidth = leaderboardTextImg.width * 0.5;
        let scaledHeight = leaderboardTextImg.height * 0.5;
        context.drawImage(leaderboardTextImg, getScaleValue(280), getScaleValue(-70), getScaleValue(scaledWidth), getScaleValue(scaledHeight));


        scaledWidth = closeBtn.width * 0.5;
        scaledHeight = closeBtn.height * 0.5;
        context.drawImage(closeBtn, getScaleValue(375), getScaleValue(-75), getScaleValue(scaledWidth), getScaleValue(scaledHeight));



        // Leaderboard Text
        scaledWidth = topBackImg.width * 0.5;
        scaledHeight = topBackImg.height * 0.5;
        context.drawImage(topBackImg, getScaleValue(280), getScaleValue(-30), getScaleValue(scaledWidth), getScaleValue(scaledHeight));

        if (leaderBoardData[0] != undefined) {
            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "left";
            context.fillText(leaderBoardData[0]['name'], getScaleValue(480), getScaleValue(241));

            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "right";
            context.fillText(leaderBoardData[0]['score'] + " POINTS", getScaleValue(640), getScaleValue(241));

        }


        // Leaderboard Text
        scaledWidth = runnerUpBack2Img.width * 0.5;
        scaledHeight = runnerUpBack2Img.height * 0.5;
        context.drawImage(runnerUpBack2Img, getScaleValue(280), getScaleValue(0), getScaleValue(scaledWidth), getScaleValue(scaledHeight));

        if (leaderBoardData[1] != undefined) {
            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "left";
            context.fillText(leaderBoardData[1]['name'], getScaleValue(480), getScaleValue(271));

            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "right";
            context.fillText(leaderBoardData[1]['score'] + " POINTS", getScaleValue(640), getScaleValue(271));

        }



        // Leaderboard Text
        scaledWidth = runnerUpBack3Img.width * 0.5;
        scaledHeight = runnerUpBack3Img.height * 0.5;
        context.drawImage(runnerUpBack3Img, getScaleValue(280), getScaleValue(30), getScaleValue(scaledWidth), getScaleValue(scaledHeight));

        if (leaderBoardData[2] != undefined) {
            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "left";
            context.fillText(leaderBoardData[2]['name'], getScaleValue(480), getScaleValue(301));

            context.font = "12px Futura";
            context.fillStyle = "white";
            context.textAlign = "right";
            context.fillText(leaderBoardData[2]['score'] + " POINTS", getScaleValue(640), getScaleValue(301));

        }


        // Leaderboard Text
        scaledWidth = runnerUpBack4Img.width * 0.5;
        scaledHeight = runnerUpBack4Img.height * 0.5;
        context.textAlign = "center";
        context.drawImage(runnerUpBack4Img, getScaleValue(280), getScaleValue(60), getScaleValue(scaledWidth), getScaleValue(scaledHeight));

        if (leaderBoardData[3] != undefined) {
            context.font = "12px Futura";
            context.fillStyle = "black";
            context.textAlign = "left";
            context.fillText(leaderBoardData[3]['name'], getScaleValue(480), getScaleValue(331));

            context.font = "12px Futura";
            context.fillStyle = "black";
            context.textAlign = "right";
            context.fillText(leaderBoardData[3]['score'] + " POINTS", getScaleValue(640), getScaleValue(331));

        }


        // Leaderboard Text
        scaledWidth = runnerUpBack5Img.width * 0.5;
        scaledHeight = runnerUpBack5Img.height * 0.5;
        context.drawImage(runnerUpBack5Img, getScaleValue(280), getScaleValue(90), getScaleValue(scaledWidth), getScaleValue(scaledHeight));



        if (leaderBoardData[4] != undefined) {
            context.font = "12px Futura";
            context.fillStyle = "black";
            context.textAlign = "left";
            context.fillText(leaderBoardData[4]['name'], getScaleValue(480), getScaleValue(361));

            context.font = "12px Futura";
            context.fillStyle = "black";
            context.textAlign = "right";
            context.fillText(leaderBoardData[4]['score'] + " POINTS", getScaleValue(640), getScaleValue(361));

        }


    }



    // Guitar Start
    scaledWidth = leaderboardBtnImg.width * 0.5;
    scaledHeight = leaderboardBtnImg.height * 0.5;
    context.drawImage(leaderboardBtnImg, getScaleValue(200), getScaleValue(280), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Guitar End




    // Guitar Start
    scaledWidth = playAgainBtnImg.width * 0.5;
    scaledHeight = playAgainBtnImg.height * 0.5;

    context.drawImage(playAgainBtnImg, getScaleValue(370), getScaleValue(280), getScaleValue(scaledWidth), getScaleValue(scaledHeight));
    // Guitar End


}

function checkClick(recontext, rectY, rectWidth, rectHeight) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (
        mouseX >= recontext &&
        mouseX <= recontext + rectWidth &&
        mouseY >= rectY &&
        mouseY <= rectY + rectHeight
    ) {
        return true;
    } else {
        return false;
    }
}

function checkMainPageClick() {
    // For Listen To Song Main Page
    if (checkClick(getScaleClickValue(60), getScaleClickValue(405), getScaleClickValue(210), getScaleClickValue(50))) {
        songWithoutSinger.play();
    }

    // For I am Ready Main Page
    if (checkClick(getScaleClickValue(870), getScaleClickValue(405), getScaleClickValue(160), getScaleClickValue(50))) {
        songWithoutSinger.pause(); // Pause the audio
        songWithoutSinger.currentTime = 0;
        document.getElementById("vol-image-cont").style.display = "none";
        pages.mainPage = false;
        pages.enterNamePage = true;
    }
}

function checkNamePageClick() {

    const hiddenInput = document.getElementById('hiddenInput');

    // Position the hidden input off-screen or make it invisible
    hiddenInput.style.left = '-1000px';
    hiddenInput.focus();

    // For Done Button
    if (checkClick(getScaleClickValue(506), getScaleClickValue(365), getScaleClickValue(85), getScaleClickValue(40)) && name != "") {
        pages.enterNamePage = false;
        pages.countDownPage = true;
        hiddenInput.blur();
    }
}

function refer() {
    songWithoutSinger.removeEventListener('ended', refer);
    pause = false;
    songWithoutSinger.currentTime = pauseTime;
    songWithoutSinger.play();
}


function checkGamePageClick() {
    // Listen to song button
    if (checkClick(getScaleClickValue(300), getScaleClickValue(535), getScaleClickValue(220), getScaleClickValue(30))) {
        pause = true;
        songWithoutSinger.pause();
        pauseTime = songWithoutSinger.currentTime;
        songWithoutSinger.currentTime = 0;
        songWithoutSinger.addEventListener('ended', refer);
        songWithoutSinger.play();

    }

    // Restart button
    if (checkClick(getScaleClickValue(560), getScaleClickValue(535), getScaleClickValue(100), getScaleClickValue(30))) {

        let gameBackVideo = document.getElementById("gameBack");
        gameBackVideo.pause();
        gameBackVideo.style.display = 'none';
        gameBackVideo.currentTime = 0;

        songWithoutSinger.pause(); // Pause the audio
        songWithoutSinger.currentTime = 0;

        restart();

    }

    // Quit button
    if (checkClick(getScaleClickValue(700), getScaleClickValue(535), getScaleClickValue(120), getScaleClickValue(30))) {

        let gameBackVideo = document.getElementById("gameBack");
        gameBackVideo.pause();
        gameBackVideo.style.display = 'none';
        gameBackVideo.currentTime = 0;

        songWithoutSinger.pause(); // Pause the audio
        songWithoutSinger.currentTime = 0;

        name = "";
        restart();
        songWithoutSinger.pause(); // Pause the audio
        songWithoutSinger.currentTime = 0;
        pages.gamePage = false;
        pages.mainPage = true;

    }
}

function checkScorePageClick() {

    if (checkClick(getScaleClickValue(390), getScaleClickValue(530), getScaleClickValue(155), getScaleClickValue(35))) {
        showScore = false;
        readData = true;
    }

    if (checkClick(getScaleClickValue(570), getScaleClickValue(530), getScaleClickValue(140), getScaleClickValue(35))) {
        restart();

        let temp = document.getElementById("scoreBack");
        temp.pause();
        temp.style.display = 'none';
        temp.currentTime = 0;
    }

    if (checkClick(getScaleClickValue(630), getScaleClickValue(180), getScaleClickValue(30), getScaleClickValue(30))) {
        showScore = true;
        readData = false;
    }

}

canvas.addEventListener("click", function (event) {
    if (pages.mainPage == true) {
        checkMainPageClick();
    } else if (pages.enterNamePage == true) {
        checkNamePageClick();
    } else if (pages.gamePage == true) {
        checkGamePageClick();
    } else if (pages.scorePage) {
        checkScorePageClick();
    }
});

window.addEventListener('resize', getWindowScaleValue);

document.getElementById('hiddenInput').addEventListener('input', (event) => {

    const value = event.target.value;
    console.log(`Current input value: ${value}`);

    if (value.length <= 13 && /^[a-zA-Z]*$/.test(value)) {
        name = value;
        console.log(`Updated name: ${name}`);
    } else {
        // If value is not valid, revert input field
        hiddenInput.value = name;
    }

});

document.addEventListener("DOMContentLoaded", () => {

    getWindowScaleValue();

    const firstBackground = document.getElementById("firstBackground");
    const discImg = document.getElementById("disc");
    const handleImg = document.getElementById("handle");
    const volumeImg = document.getElementById("vol-image-cont");
    const listenToSongImg = document.getElementById("listenToSong");
    const listenToSongBtnImg = document.getElementById("listenToSongBtn");
    const readyImg = document.getElementById("ready");
    const readyBtnImg = document.getElementById("readyBtn");

    const doneBtnImg = document.getElementById("doneBtn");
    const enterYourNameImg = document.getElementById("enterYourName");
    const nameRectImg = document.getElementById("nameRect");
    const peproniSliceImg = document.getElementById("peproniSlice");

    const goodLuckImg = document.getElementById("goodLuck");
    const instructionImg = document.getElementById("instruction");
    const instruction_2Img = document.getElementById("instruction-2");

    const threeImg = document.getElementById("three");
    const twoImg = document.getElementById("two");
    const oneImg = document.getElementById("one");

    const gameBack = document.getElementById("gameBack");
    const guitarImg = document.getElementById("guitar");
    const peproniTaglineImg = document.getElementById("peproniTagline");
    const listenToSongBtnGamePageImg = document.getElementById(
        "listenToSongBtnGamePage"
    );
    const restartBtnImg = document.getElementById("restartBtn");
    const quitBtnImg = document.getElementById("quitBtn");
    const leaderboardBtnImg = document.getElementById("leaderboardBtn");
    const playAgainBtnImg = document.getElementById("playAgainBtn");
    const scoreBack = document.getElementById("scoreBack");
    songWithoutSinger = document.getElementById("songWithSinger");
    const leaderboardTextImg = document.getElementById("leaderboardText");
    const topBackImg = document.getElementById("topBack");
    const runnerUpBack2Img = document.getElementById("runnerUpBack2");
    const runnerUpBack3Img = document.getElementById("runnerUpBack3");
    const runnerUpBack4Img = document.getElementById("runnerUpBack4");
    const runnerUpBack5Img = document.getElementById("runnerUpBack5");
    const closeBtn = document.getElementById("closeBtn");


    function animate() {

        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {

            then = now - (elapsed % fpsInterval);

            context.clearRect(0, 0, canvas.width, canvas.height);
            if (pages.mainPage == true) {
                // context.drawImage(firstBackground, 0, 0, canvas.width, canvas.height);
                mainPage(
                    context,
                    discImg,
                    handleImg,
                    volumeImg,
                    listenToSongImg,
                    listenToSongBtnImg,
                    readyImg,
                    readyBtnImg
                );
            } else if (pages.enterNamePage) {
                // context.drawImage(firstBackground, 0, 0, canvas.width, canvas.height);
                namePage(
                    context,
                    peproniSliceImg,
                    handleImg,
                    enterYourNameImg,
                    nameRectImg,
                    doneBtnImg
                );
            } else if (pages.countDownPage) {
                // context.drawImage(firstBackground, 0, 0, canvas.width, canvas.height);
                countDownPage(
                    context,
                    frame,
                    peproniSliceImg,
                    handleImg,
                    goodLuckImg,
                    instructionImg,
                    instruction_2Img,
                    threeImg,
                    twoImg,
                    oneImg
                );
            } else if (pages.gamePage) {
                gamePage(
                    context,
                    frame,
                    gameBack,
                    peproniSliceImg,
                    peproniTaglineImg,
                    guitarImg,
                    listenToSongBtnGamePageImg,
                    restartBtnImg,
                    quitBtnImg
                );
            } else if (pages.scorePage) {
                scorePage(
                    context,
                    scoreBack,
                    peproniSliceImg,
                    leaderboardBtnImg,
                    playAgainBtnImg,
                    leaderboardTextImg,
                    topBackImg,
                    runnerUpBack2Img,
                    runnerUpBack3Img,
                    runnerUpBack4Img,
                    runnerUpBack5Img,
                    closeBtn
                );
            }
            if (frame > 60) {
                frame = 0;
            }
            frame++;

        }

        requestAnimationFrame(animate);

    }

    function getLocalStream() {
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((stream) => {

                animate();


            })
            .catch((err) => {
                console.error(`you got an error: ${err}`);
            });
    }

    function startAnimating() {
        fpsInterval = 1000 / 60;
        then = Date.now();
        startTime = then;
        getLocalStream(animate);
    }

    startAnimating();

});