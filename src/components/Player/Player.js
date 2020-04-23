import React from 'react'
import PropTypes from 'prop-types'
import Coin from '../Coin/Coin'
import ComputerAi from '../ComputerAi/ComputerAi'
import CardStack from '../CardStack/CardStack'
import cards from '../../js/cards.json'
import styles from './Player.css'

class Player extends React.Component {
  constructor (props) {
    super(props)
    this.startingCards = this.startingCards.bind(this)
    this.newTurn = this.newTurn.bind(this)
    this.getCardByName = this.getCardByName.bind(this)
    this.coinEles = this.coinEles.bind(this)
    this.cardStackEles = this.cardStackEles.bind(this)
    this.buildLandmark = this.buildLandmark.bind(this)
    this.getConstructedLandmark = this.getConstructedLandmark.bind(this)
    this.buyCard = this.buyCard.bind(this)
    this.canBuyCard = this.canBuyCard.bind(this)
    this.win = this.win.bind(this)
    this.updateDiceValue = this.updateDiceValue.bind(this)
    this.doRolls = this.doRolls.bind(this)
    this.doFinalRoll = this.doFinalRoll.bind(this)
    this.tryActivateRadioTower = this.tryActivateRadioTower.bind(this)
    this.updateState = this.updateState.bind(this)
    this.aiHook = this.aiHook.bind(this)

    this.buyCardClickHandlers = {}
    cards.forEach(card => {
      this.buyCardClickHandlers[card.name] = this.buyCard.bind(this, card)
    })

    this.dieRollDelay = 150
    this.phases = {
      notRolled: 0,
      delayedRoll: 1,
      rolled: 2,
      delayedBuy: 3,
      bought: 4,
      delayedEndTurn: 5
    }
    this.canBuyCardResults = {
      canBuy: 0,
      alreadyBuiltLandmark: 1,
      alreadyOwnsMajorEstablishment: 2,
      notInStock: 3,
      cantAfford: 4,
      unhandled: 5
    }
    this.state = {
      phase: this.phases.notRolled,
      coin: 3,
      cards: this.startingCards(),
      dice: 1,
      rolls: 1,
      rollsRemaining: 0,
      skipTurn: false
    }
  }

  startingCards () {
    let cards = []
    const names = ['station', 'shopping mall', 'amusement park', 'radio tower', 'wheat field', 'bakery']
    names.forEach(name => {
      const card = this.getCardByName(name)
      const newCard = this.deepCopy(card)
      cards.push(newCard)
    })

    return cards
  }

  newTurn () {
    this.setState((prevState, props) => ({
      phase: this.phases.notRolled,
      rollsRemaining: prevState.rolls
    }), () => {
      this.props.logMsg(`${this.props.name}'s turn`)

      const skipHumanTurn = !this.props.isComputer && this.props.skipTurn
      if (skipHumanTurn) {
        this.props.endTurn()
      } else {
        if (this.state.phase === this.phases.notRolled && this.props.isComputer) {
          this.state.phase = this.phases.delayedRoll
          // ai roll
          this.refs.computerAi.roll()
        }
      }
    })
  }

  getCardByName (name) {
    return cards.find(card => card.name.toLowerCase() === name.toLowerCase())
  }

  cardStackEles () {
    const stacks = []
    const allCards = this.deepCopy(cards)
    const cardsSortedByActivation = allCards.sort((a, b) => a.activation[0] > b.activation[0])

    cardsSortedByActivation.forEach(card => {
      const playerCardsOfThisType = this.state.cards.filter(playerCard => playerCard.name.toLowerCase() === card.name.toLowerCase())
      const classNames = `${styles.cardStackContainer} col-xs-5ths`

      if (playerCardsOfThisType.length) {
        let clickHandler = null
        const isLandmark = card.type.toLowerCase() === 'landmark'
        const constructed = playerCardsOfThisType[0].constructed
        if (isLandmark && !constructed) {
          clickHandler = this.buyCardClickHandlers[card.name]
        }

        const stack = (
          <div key={card.name} className={classNames} onClick={clickHandler}>
            <CardStack cards={this.state.cards} cardName={card.name} />
          </div>
        )
        stacks.push(stack)
      }
    })

    return stacks
  }

  coinEles () {
    var amt = this.state.coin
    var coins = []

    for (let c = 0; c < 1000; c++) {
      /* if (amt >= 10) {
        amt -= 10
        coins.push(10)
      } else if (amt >= 5) {
        amt -= 5
        coins.push(5)
      } else if (amt >= 1) {
        amt -= 1
        coins.push(1)
      } else {
        break
      }
      */

      if (amt >= 1) {
        amt -= 1
        coins.push(1)
      } else {
        break
      }
    }

    return coins.map((coin, index) =>
      <li key={index} className={styles.coin}>
        <Coin value={coin} />
      </li>
    )
  }

  buildLandmark (cardName, effects) {
    effects.forEach(effect => {
      switch (effect.aspect) {
        case 'dice':
          this.setState((prevState, props) => ({
            dice: 2
          }))
          this.props.logMsg(`${cardName} allows you to now roll 2 dice!`)
          break
        case 'coinForEach':
        case 'extraTurnIfMatchingDice':
          break
        case 'allowReroll':
          this.setState((prevState, props) => ({
            rolls: 2
          }))
          break
        default:
          console.warn(`Tried to activate landmark effect, but no code has been added yet to handle the ${effect.aspect} aspect`)
      }
    })
  }

  getConstructedLandmark (landmark) {
    return this.state.cards.find(card => card.name.toLowerCase() === landmark.toLowerCase() && card.constructed)
  }

  deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  buyCard (card) {
    const rolled = (this.state.phase >= this.phases.rolled)

    const cardNameLower = card.name.toLowerCase()
    const cardToBuy = cards.find(card => card.name.toLowerCase() === cardNameLower)
    const canBuyResult = this.canBuyCard(cardToBuy)

    if (rolled && canBuyResult === this.canBuyCardResults.canBuy) {
      let newCards = this.state.cards
      let landmark = (card.category.toLowerCase() === 'landmark')
      if (landmark) {
        let landmarkIndex = newCards.findIndex(currentCard => currentCard.name.toLowerCase() === cardNameLower)
        if (landmarkIndex === -1) {
          console.error(`Tried to buy the landmark: ${card.name}, but somehow, that unconstructed landmark isnt owned by the player`)
        }

        newCards[landmarkIndex].constructed = true
        newCards[landmarkIndex].img = newCards[landmarkIndex].imgConstructed
      } else {
        const newCard = this.deepCopy(card)
        newCards.push(newCard)
      }

      this.props.logMsg(`${this.props.name} bought ${card.name} for ${card.price} coins`)

      this.setState((prevState, props) => ({
        cards: newCards,
        coin: prevState.coin - card.price,
        phase: this.phases.bought
      }))

      if (landmark) {
        this.buildLandmark(card.name, card.effects)
        if (this.win()) {
          this.props.endGame()
        }
      }

      return true
    }

    this.showUnableToBuyAlert(canBuyResult, card)
    return false
  }

  showUnableToBuyAlert (canBuyResult, card) {
    switch (canBuyResult) {
      case this.canBuyCardResults.alreadyBuiltLandmark:
        break
      case this.canBuyCardResults.alreadyOwnsMajorEstablishment:
        window.alert(`You already own this "${card.name}" major establishment`)
        break
      case this.canBuyCardResults.notInStock:
        break
      case this.canBuyCardResults.cantAfford:
        window.alert(`Not enough coins (have ${this.state.coin}, need ${card.price})`)
        break
      default:
        window.alert('You cannot buy this card')
        break
    }
  }

  canBuyCard (cardToBuy) {
    const cardNameLower = cardToBuy.name.toLowerCase()
    const isLandmark = cardToBuy.type.toLowerCase() === 'landmark'
    const isEstablishment = cardToBuy.type.toLowerCase() === 'majorestablishment'

    const alreadyBuiltLandmark = isLandmark && this.state.cards.find(card => card.name.toLowerCase() === cardNameLower && card.constructed)
    const alreadyOwnsMajorEstablishment = isEstablishment && this.state.cards.find(card => card.name.toLowerCase() === cardNameLower)
    const inStock = isLandmark || this.props.stock[cardNameLower] > 0
    const canAfford = this.state.coin >= cardToBuy.price

    const canBuy = !alreadyBuiltLandmark && !alreadyOwnsMajorEstablishment && inStock && canAfford

    if (canBuy) {
      return this.canBuyCardResults.canBuy
    } else if (alreadyBuiltLandmark) {
      return this.canBuyCardResults.alreadyBuiltLandmark
    } else if (alreadyOwnsMajorEstablishment) {
      return this.canBuyCardResults.alreadyOwnsMajorEstablishment
    } else if (!inStock) {
      return this.canBuyCardResults.notInStock
    } else if (!canAfford) {
      return this.canBuyCardResults.cantAfford
    }
    return this.canBuyCardResults.unhandled
  }

  win () {
    let constructedLandmarks = this.state.cards.filter(card => card.category.toLowerCase() === 'landmark' && card.constructed)
    let allLandmarks = cards.filter(card => card.category.toLowerCase() === 'landmark')
    return constructedLandmarks.length === allLandmarks.length
  }

  updateDiceValue (dice1, dice2) {
    this.doRolls(5)
  }

  doRolls (rolls) {
    const rollSequence = [1, 2, 5, 6]
    for (let r = 0; r < rolls; r++) {
      const delay = this.dieRollDelay * r
      setTimeout(() => {
        const getNewDiceValue = this.props.controlsRef.getNewDieValue
        const lastRoll = r === rolls - 1

        let die1 = rollSequence[r % rollSequence.length]
        let die2 = rollSequence[r % rollSequence.length]
        if (lastRoll) {
          die1 = getNewDiceValue()
          die2 = getNewDiceValue()
        }

        this.props.updateDiceValue(die1, die2, lastRoll)
      }, delay)
    }
  }

  doFinalRoll (dice1, dice2) {
    this.setState((prevState, props) => ({
      rollsRemaining: prevState.rollsRemaining - 1
    }), () => {
      if (!this.tryActivateRadioTower(dice1, dice2)) {
        this.props.updateDiceValue(dice1, dice2, true)
      }
    })
  }

  tryActivateRadioTower (dice1, dice2) {
    let radioTower = this.getConstructedLandmark('radio tower')
    let wantToReroll = this.props.tryActivateRadioTower(radioTower, this.state, dice1, dice2, this.props.isComputer, this.refs.computerAi)
    if (wantToReroll === false) {
      this.setState((prevState, props) => ({
        rollsRemaining: 0
      }))
    } else if (wantToReroll === true) {
      this.props.logMsg(`${this.props.name} has chosen to re-roll (since they have a radio tower). Awaiting roll...`)
    }
    return wantToReroll
  }

  updateState (newState) {
    this.setState((prevState, props) => (newState), () => {
      if (this.state.phase === this.phases.rolled && this.props.isComputer) {
        this.state.phase = this.phases.delayedBuy
        this.refs.computerAi.tryBuyCard()
      }
    })
  }

  aiHook () {
    switch (this.state.phase) {
      default:
        break
    }
  }

  render () {
    let fullWidthClassNames = 'col-xs-12'
    const nameContainerClassNames = 'col-xs-5'
    const coinContainerClassNames = 'col-xs-7 text-right'
    let nameClassNames = `${styles.name}`
    const strategyContainerClassNames = `${styles.strategy} text-left`
    let playerMatClassNames = `${styles.playerMat} ${fullWidthClassNames} ${this.props.currentPlayer ? styles.currentPlayer : ''}`

    let computerAi = null
    let strategy = null
    if (this.props.isComputer) {
      computerAi = (
        <ComputerAi ref='computerAi'
          controlsRef={this.props.controlsRef}
          dice={this.state.dice}
          marketRef={this.props.marketRef}
          cards={this.state.cards}
          canBuyCard={this.canBuyCard}
          canBuyCardResults={this.canBuyCardResults} />
      )

      if (this.refs.computerAi) {
        strategy = `Personality: ${this.refs.computerAi.strategy.description}`
      }
    }

    return (
      <div className={playerMatClassNames}>
        <div className={fullWidthClassNames}>
          <div className={nameContainerClassNames}>
            <h4 className={nameClassNames}>{this.props.name}</h4>
            <div className={strategyContainerClassNames}>
              {strategy}
            </div>
          </div>
          <div className={coinContainerClassNames}>
            {this.coinEles()}
          </div>
        </div>

        {this.cardStackEles()}

        {computerAi}
      </div>
    )
  }
}

Player.propTypes = {
  name: PropTypes.node.isRequired,
  logMsg: PropTypes.func.isRequired,
  updateDiceValue: PropTypes.func.isRequired,
  endTurn: PropTypes.func.isRequired,
  currentPlayer: PropTypes.bool.isRequired,
  tryActivateRadioTower: PropTypes.func,
  isComputer: PropTypes.bool.isRequired,
  stock: PropTypes.any.isRequired,
  marketRef: PropTypes.any,
  endGame: PropTypes.func.isRequired,
  skipTurn: PropTypes.bool,
  controlsRef: PropTypes.object
}

export default Player
