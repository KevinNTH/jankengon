import BattleManager from './BattleManager'
import Player from './Player'

class Animate {

  static attachAnimation (selector, animationName) {
    let $elem = document.querySelector(selector)

    const originalCls = $elem.className

    $elem.className = `${originalCls} ${animationName}`

    $elem.addEventListener('animationend', () => {
      console.log('oui ce fut anime !')
      // reset className
      $elem.className = originalCls
    })
  }
}

class PageManager {

  constructor () {
    this.$playButton = document.querySelector('.PlayButton')
    this.$battle = document.querySelector('.Battle')
    this.$battleResult = document.querySelector('.Battle-result')
    this.$score = document.querySelector('.Score')

    // used to have a singleton of the counter interval
    this.counterIntervalId = null

    // BattleManager instance
    this.bm = null

    this.init()
  }

  init () {
    this.attachGameSelectionEvent()
    this.attachPlayEvent()
  }

  attachGameSelectionEvent () {
    const buttonClasses = ['ChoiceButtons-watcher', 'ChoiceButtons-player']
    for (let buttonCls of buttonClasses) {
      document.querySelector(`.${buttonCls}`).onclick = () => {
        this.gameSelection(buttonCls.replace('ChoiceButtons-', ''))
      }
    }
  }

  attachPlayEvent () {
    this.$playButton.onclick = () => {
      this.startBattle()
    }
  }

  gameSelection (gameMode) {
    this.setChoiceTitle(gameMode)
  }

  setChoiceTitle (gameMode) {
    const selectorCls = 'Game-choice'
    const choiceTitleElem = document.querySelector(`.${selectorCls}`)
    choiceTitleElem.innerText = gameMode
    choiceTitleElem.className = `${selectorCls} ChoiceTitle-${gameMode}`
  }

  startBattle () {
    // display Battle block
    if (this.$playButton.disabled === false) {
      this.resetBattle()
      this.$playButton.disabled = true
      this.$battle.style.display = 'block'

      this.launchCounter()
    }
  }

  resetBattle () {
    this.$battle.style.display = 'none'
    this.$battleResult.style.display = 'none'
    this.$score.style.display = 'none'
  }

  launchCounter () {
    let counter = 3
    const elem = document.querySelector('.Battle-counter')

    elem.innerText = counter

    if (this.counterIntervalId === null) {
      this.counterIntervalId = setInterval(() => {
        counter--
        elem.innerText = counter
        if (counter === 0) {
          clearInterval(this.counterIntervalId)
          this.counterIntervalId = null

          if (this.bm === null) {
            this.$battleResult.style.display = 'block'
            this.$score.style.display = 'block'

            const p1 = new Player('Computer #1')
            const p2 = new Player('Computer #2')
            this.bm = new BattleManager(p1, p2)
          }

          this.launchMatch()

          if (!this.bm.done) {
            this.launchCounter()
          } else {
            this.endMatch()
          }
        }
      }, 1000)
    }
  }

  launchMatch () {
    const scores = this.bm.battle()

    if (scores[0].status === 'E') {
      Animate.attachAnimation('.HandGame-player1', 'animWin1')
      Animate.attachAnimation('.HandGame-player2', 'animWin2')
    } else if (scores[0].status === 'W') {
      Animate.attachAnimation('.HandGame-player1', 'animWin1')
    } else {
      Animate.attachAnimation('.HandGame-player2', 'animWin2')
    }

    this.printGameBattle(scores[0], scores[1])
    this.updateScore(scores[0], scores[1])
  }

  printGameBattle (score1, score2) {
    const mapRPSToCls = {
      'R': 'fa-hand-rock-o',
      'P': 'fa-hand-paper-o',
      'S': 'fa-hand-scissors-o'
    }
    console.log(score1.hit, score2.hit)
    document.querySelector('.HandGame-player1 i').className = `fa ${mapRPSToCls[score1.hit]}`
    document.querySelector('.HandGame-player2 i').className = `fa ${mapRPSToCls[score2.hit]}`
  }

  updateScore (score1, score2) {
    document.querySelector('.Score-counter-player1').innerText = this.bm.gameScore.playerScores[0].countWonRounds()
    document.querySelector('.Score-counter-player2').innerText = this.bm.gameScore.playerScores[1].countWonRounds()
  }

  endMatch () {
    // set up the winner
    document.querySelector('.MatchResult-winner').innerText = this.bm.winner.playerName
    document.querySelector('.MatchResult').style.display = 'block'

    // reset game state
    this.bm = null
    // enable playbutton
    this.$playButton.disabled = false
  }

}
PageManager.GAME_WATCHER = 'watcher'
PageManager.GAME_PLAYER = 'player'

export default PageManager
