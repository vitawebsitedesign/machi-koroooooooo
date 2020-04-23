import React from 'react'
import Board from '../Board/Board'
import Player from '../Player/Player'
import CardActivations from '../CardActivations/CardActivations'
import GameWonSplash from '../GameWonSplash/GameWonSplash'
import Settings from '../Settings/Settings'
import Dice from '../Dice/Dice'
import cards from '../../js/cards.json'
import computerNames from '../../js/computer-names.json'
import styles from './App.css'

// import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css'
// import '../../../node_modules/bootstrap/dist/css/bootstrap-theme.min.css'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.playerEle = this.playerEle.bind(this)
    this.getPlayers = this.getPlayers.bind(this)
    this.activateEstablishments = this.activateEstablishments.bind(this)
    this.getPlayerRefs = this.getPlayerRefs.bind(this)
    this.gotoNextPlayer = this.gotoNextPlayer.bind(this)
    this.newTurn = this.newTurn.bind(this)
    this.endTurn = this.endTurn.bind(this)
    this.buyCard = this.buyCard.bind(this)
    this.logMsg = this.logMsg.bind(this)
    this.updateDiceValue = this.updateDiceValue.bind(this)
    this.currentPlayerLower = this.currentPlayerLower.bind(this)
    this.setFunction = this.setFunction.bind(this)
    this.setMarketRef = this.setMarketRef.bind(this)
    this.setControlsRef = this.setControlsRef.bind(this)
    this.endGame = this.endGame.bind(this)
    this.getRandomBackground = this.getRandomBackground.bind(this)
    this.toggleSkipTurn = this.toggleSkipTurn.bind(this)
    this.changeBackground = this.changeBackground.bind(this)

    this.getNewPlayerStates = null
    this.tryActivateAmusementPark = null
    this.tryActivateRadioTower = null

    let stock = {}
    this.players = this.getPlayers()
    cards.forEach(card => {
      stock[card.name.toLowerCase()] = card.initialStock
    })

    this.backgrounds = this.getBackgrounds()

    this.state = {
      dice1: 6,
      dice2: 6,
      currentPlayer: 0,
      log: [],
      stock: stock,
      winner: null,
      skipTurn: false,
      background: this.getRandomBackground(this.backgrounds)
    }
  }

  componentDidMount () {
    this.gotoNextPlayer()
  }

  getPlayers () {
    const players = ['You, the brilliant']
    for (let i = 0; i < 100; i++) {
      const name = this.getRandomComputerName()
      const nameAlreadyUsed = players.indexOf(name) !== -1
      if (nameAlreadyUsed) {
        continue
      }

      players.push(name)
      if (players.length === 4) {
        break
      }
    }

    return players
  }

  getRandomComputerName () {
    const numNames = computerNames.length
    const rand = Math.floor(Math.random() * 10) % numNames
    return computerNames[rand]
  }

  activateEstablishments () {
    const playerRefs = this.getPlayerRefs()
    const diceTotal = this.state.dice1 + (this.state.dice2 ? this.state.dice2 : 0)
    const newPlayerStates = this.getNewPlayerStates(playerRefs, diceTotal)
    const currentPlayerRef = this.currentPlayerRef()
    if (!currentPlayerRef) {
      console.error('Tried to activate establishments, but couldnt determine current player')
      return false
    }

    this.tryActivateAmusementPark(this.state.dice1, this.state.dice2, currentPlayerRef, newPlayerStates)

    Object.keys(newPlayerStates).forEach(newPlayerStatesKey => {
      const state = newPlayerStates[newPlayerStatesKey]
      this.refs[newPlayerStatesKey.toLowerCase()].updateState(state)
    })
  }

  getPlayerRefs () {
    let playerRefs = []
    Object.keys(this.refs).filter(refKey => this.indexOfCaseInsensitive(refKey, this.players) !== -1).forEach(refKey => {
      playerRefs.push(this.refs[refKey])
    })
    return playerRefs
  }

  indexOfCaseInsensitive (needle, haystack) {
    const needleLower = needle.toLowerCase()
    for (let h = 0; h < haystack.length; h++) {
      if (haystack[h].toLowerCase() === needleLower) {
        return h
      }
    }
    return -1
  }

  gotoNextPlayer () {
    this.setState((prevState, props) => ({
      currentPlayer: (prevState.currentPlayer + 1) % this.players.length
    }), this.newTurn)
  }

  newTurn () {
    let currentPlayer = this.currentPlayerLower()
    this.refs[currentPlayer].newTurn()
  }

  endTurn () {
    let currentPlayer = this.currentPlayerLower()
    this.logMsg(`${currentPlayer} ended their turn`)

    if (!this.state.winner) {
      this.gotoNextPlayer()
    }
  }

  playerEle (num) {
    const name = this.players[num]
    if (!name) {
      return false
    }

    const nameLower = name.toLowerCase()
    const currentPlayerLower = this.currentPlayerLower()
    return (
      <Player ref={nameLower}
        name={name}
        logMsg={this.logMsg}
        updateDiceValue={this.updateDiceValue}
        dice1={this.state.dice1}
        dice2={this.state.dice2}
        activateEstablishments={this.activateEstablishments}
        endTurn={this.endTurn}
        currentPlayer={nameLower === currentPlayerLower}
        tryActivateRadioTower={this.tryActivateRadioTower}
        isComputer={num > 0}
        stock={this.state.stock}
        marketRef={this.marketRef}
        endGame={this.endGame}
        skipTurn={this.state.skipTurn}
        controlsRef={this.controlsRef} />
    )
  }

  buyCard (card) {
    const currentPlayerRef = this.currentPlayerRef()
    switch (currentPlayerRef.state.phase) {
      case currentPlayerRef.phases.notRolled:
        window.alert('Please roll before buying cards')
        break
      case currentPlayerRef.phases.rolled:
      case currentPlayerRef.phases.delayedBuy:
        let currentPlayer = this.currentPlayerLower()
        let boughtCard = this.refs[currentPlayer].buyCard(card)
        if (boughtCard) {
          let newStock = this.state.stock
          newStock[card.name.toLowerCase()] -= 1
          this.setState((prevState, props) => ({
            stock: newStock
          }))

          currentPlayerRef.updateState({
            phase: currentPlayerRef.phases.bought
          })
        }
        break
      case currentPlayerRef.phases.bought:
        window.alert('Hmm... the rules only allow 1 card to be bought per turn')
        break
      default:
        console.warn('Tried to buy card, but couldnt determine if player has rolled yet')
        break
    }
  }

  logMsg (msg) {
    let newLog = this.state.log
    newLog.push(msg)
    this.setState((prevState, props) => ({
      log: newLog
    }))
  }

  logs () {
    return this.state.log.map((msg, index) =>
      <li key={index}>
        {msg}
      </li>
    )
  }

  updateDiceValue (dice1, dice2, finalRoll) {
    if (finalRoll) {
      this.logMsg(`Rolled ${dice1} ${dice2 ? ' & ' + dice2 : ''}`)
    }

    this.setState((prevState, props) => ({
      dice1: dice1,
      dice2: (dice2 || 0)
    }), () => {
      if (finalRoll) {
        this.activateEstablishments()
        const currentPlayerRef = this.currentPlayerRef()
        currentPlayerRef.updateState({
          phase: currentPlayerRef.phases.rolled
        })
      }
    })
  }

  currentPlayerLower () {
    return this.players[this.state.currentPlayer].toLowerCase()
  }

  setFunction (name, fn) {
    this[name] = fn
  }

  setMarketRef (marketRef) {
    this.marketRef = marketRef
  }

  setControlsRef (controlsRef) {
    this.controlsRef = controlsRef
  }

  endGame () {
    const winner = this.players[this.state.currentPlayer]
    this.setState((prevState, props) => ({
      winner: winner
    }), this.endTurn)
  }

  getRandomBackground (backgrounds) {
    const index = Math.floor(Math.random() * 10 % this.backgrounds.length)
    return backgrounds[index]
  }

  toggleSkipTurn () {
    this.setState((prevState) => ({
      skipTurn: !prevState.skipTurn
    }))
  }

  getBackgrounds () {
    return [
      {
        name: 'Bright Forest',
        url: 'src/img/bg-forest-birds.jpg'
      },
      {
        name: 'Breathtaking Mountain',
        url: 'src/img/bg-mountain.jpg'
      },
      {
        name: 'Relaxing Ocean',
        url: 'src/img/bg-ocean.jpg'
      },
      {
        name: 'Beautiful Flowers',
        url: 'src/img/bg-red-flowers.jpg'
      },
      {
        name: 'Crushing Waves',
        url: 'src/img/bg-waves.jpg'
      }
    ]
  }

  changeBackground (e) {
    const url = e.target.value
    const bg = {
      url: url
    }
    this.setState(() => ({
      background: bg
    }))
  }

  currentPlayerRef () {
    return this.getPlayerRefs().find(playerRef => playerRef.props.currentPlayer)
  }

  render () {
    const rowClassNames = `${styles.fullHeight} row`
    const appClassNames = `${styles.app} ${styles.fullHeight} container-fluid`
    const settingsContainerClassNames = `${styles.settingsContainer} col-xs-4 col-xs-offset-4 text-center`
    const bgStyles = {
      backgroundImage: 'url(' + this.state.background.url + ')'
    }
    const thirdClassNames = 'col-xs-4'
    const midClassNames = `${thirdClassNames} ${styles.fullHeight} ${styles.verticalCenterChildren}`
    const fullClassNames = 'col-xs-12'
    const playerRefs = this.getPlayerRefs()
    const currentPlayerLower = this.currentPlayerLower()
    const logStyles = {
      display: 'none'
    }

    let gameWonSplash = null
    if (this.state.winner) {
      gameWonSplash = <GameWonSplash winner={this.state.winner} />
    }

    let numDice = null
    const currentPlayerRef = this.currentPlayerRef()
    if (currentPlayerRef) {
      numDice = currentPlayerRef.state.dice
    }

    return (
      <div className={appClassNames}>

        <div className={styles.bg} style={bgStyles} />

        <CardActivations setFunction={this.setFunction}
          logMsg={this.logMsg}
          currentPlayerName={currentPlayerLower} />

        <div className={rowClassNames}>
          <div className={thirdClassNames}>
            <div className={fullClassNames}>
              {this.playerEle(0)}
            </div>
            <div className={fullClassNames}>
              {this.playerEle(1)}
            </div>
          </div>

          <div className={midClassNames}>
            <Board buyCard={this.buyCard}
              stock={this.state.stock}
              playerRefs={playerRefs}
              setMarketRef={this.setMarketRef}
              setControlsRef={this.setControlsRef}
              endTurn={this.endTurn} />
          </div>

          <div className={thirdClassNames}>
            <div className={fullClassNames}>
              {this.playerEle(2)}
            </div>
            <div className={fullClassNames}>
              {this.playerEle(3)}
            </div>
          </div>
        </div>

        <ul className={styles.log} style={logStyles}>
          {this.logs()}
        </ul>

        <div className='row'>
          <div className={settingsContainerClassNames}>
            <Settings toggleSkipTurn={this.toggleSkipTurn}
              backgrounds={this.backgrounds}
              changeBackground={this.changeBackground}
              currentBackgroundUrl={this.state.background.url} />
          </div>
        </div>

        <Dice dice1={this.state.dice1}
          dice2={this.state.dice2}
          numDice={numDice}
          controlsRef={this.controlsRef} />

        {gameWonSplash}
      </div>
    )
  }
}

export default App
