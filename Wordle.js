const tileDisplay=document.querySelector('.tile-container')
const keyboard=document.querySelector('.key-container')
const messageDisplay=document.querySelector('.message-container')
let isGameOver=false
let resultDisplayed=false

let wordle

const getWordle = () => {
    fetch('http://localhost:8000/word').then(response => response.json()).then(json => {
        console.log(json)
        wordle=json.toUpperCase()
    })
    .catch(err => console.log(err))
}

getWordle()

const keys=[ 'Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','B','N','M','ENTER','DELETE']
const guessRows=[
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','','']
]

guessRows.forEach((guessRow,guessRowIndex) => {
    const rowElement=document.createElement('div')
    rowElement.setAttribute('id','guessRow-'+guessRowIndex)

    guessRow.forEach((guess,guessIndex) => {
        const tileElement=document.createElement('div')
        tileElement.setAttribute('id','guessRow-'+guessRowIndex+'-tile-'+guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })

    tileDisplay.append(rowElement)
})

let currentRow=0
let currentTile=0

document.addEventListener('keydown',checkKey)

function checkKey(e) {
    e=e||window.event

    if(e.code.includes('Key')||e.code=='Enter'||e.code=='Delete'||e.code=='Backspace') {
        let key=e.code.toUpperCase()
        if(key.includes('KEY'))
            handleClick(key[3])
        else
        {
            if(key=='BACKSPACE')
                handleClick('DELETE')
            else
                handleClick(key)
        }
    }
}

const handleClick = (key) => {
    if(key=='DELETE')
        deleteLetter()
    else if(key=='ENTER')
        checkRow()
    else
        addLetter(key)
}

keys.forEach(key => {
    const buttonElement=document.createElement('button')
    buttonElement.textContent=key
    buttonElement.setAttribute('id',key)
    buttonElement.addEventListener('click',() => handleClick(key))
    keyboard.append(buttonElement)
})

const deleteLetter = () => {
    if(currentRow<6&&currentTile>0)
        currentTile--;
    let tile=document.getElementById('guessRow-'+currentRow+'-tile-'+currentTile)
    tile.textContent=''
    guessRows[currentRow][currentTile]=''
    tile.setAttribute('data','')
}

const checkRow = () => {
    if(currentTile>4) {
        const guess=guessRows[currentRow].join('')
        flipTile()
        if(guess==wordle) {
            showMessage('Nice!')
        } else {
            if(currentRow>=5) {
                isGameOver=false
                showMessage('Game Over!')
                return
            } else {
                currentRow++
                currentTile=0
            }
        }
    }
}

const addLetter = (letter) => {
    let tile=document.getElementById('guessRow-'+currentRow+'-tile-'+currentTile)
    tile.textContent=letter
    guessRows[currentRow][currentTile]=letter
    tile.setAttribute('data',letter)
    if(currentRow<6&&currentTile<5) {
        currentTile++;
    }
}

const showMessage = (message) => {
    if(!resultDisplayed) {
        resultDisplayed=true
        const messageElement=document.createElement('p')
        messageElement.textContent=message
        messageDisplay.append(messageElement)

        setTimeout(() => {
            messageDisplay.removeChild(messageElement)
            resultDisplayed=false
        },2000)
    }
}

const colorKey = (keyLetter,color) => {
    const key=document.getElementById(keyLetter)
    key.classList.add(color)
    if(color=='green-overlay')
    key.style.backgroundColor='#538d4e'
    else if(color=='yellow-overlay')
    key.style.backgroundColor='#d1d11d'
    else if(color=='red-overlay')
    key.style.backgroundColor='#c01010'
}

const flipTile = () => {
    const rowTiles=document.querySelector('#guessRow-'+currentRow).childNodes
    const guess=[]
    let checkWordle=wordle
    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'),color: 'grey-overlay'})
    });
    guess.forEach((guess,index) => {
        if(guess.letter==wordle[index]) {
            guess.color='green-overlay'
            checkWordle=checkWordle.replace(guess.letter,'')
        }
        else if(!wordle.includes(guess.letter))
            guess.color='red-overlay'
    })
    guess.forEach((guess,index) => {
        if(checkWordle.includes(guess.letter)) {
            guess.color='yellow-overlay'
            checkWordle=checkWordle.replace(guess.letter,'')
        }
    })
    rowTiles.forEach((tile,index) => {
        const dataLetter=tile.getAttribute('data')
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            colorKey(guess[index].letter,guess[index].color)
        },500*index)
    })
}