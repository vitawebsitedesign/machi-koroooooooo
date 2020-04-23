import React from 'react'
import PropTypes from 'prop-types'
import computerStrategies from '../../js/computer-strategies.json'
import cards from '../../js/cards.json'

class ComputerAi extends React.Component {
  constructor (props) {
    super(props)

    this.roll = this.roll.bind(this)
    this.tryBuyCard = this.tryBuyCard.bind(this)
    this.shouldBuy = this.shouldBuy.bind(this)
    this.endTurn = this.endTurn.bind(this)

    this.strategy = this.getRandomStrat()
    this.speeds = {
      tomCruise: 0,
      debug: 300,
      fast: 1000,
      brisk: 1500,
      slow: 3000
    }
    this.state = {
      speed: this.speeds.fast
    }
  }

  getRandomStrat () {
    const numStrats = Object.keys(computerStrategies).length
    const rand = Math.floor(Math.random() * 10) % numStrats
    const stratKey = Object.keys(computerStrategies)[rand]
    return computerStrategies[stratKey]
  }

  roll () {
    this.delayed(() => {
      const hasNonRestaurantCardRequiring2Dice = this.props.cards.find(card => card.type.toLowerCase() !== 'restaurants' && card.activation && card.activation.length && card.activation[0] > 6)
      if (this.props.dice === 2 && hasNonRestaurantCardRequiring2Dice) {
        this.props.controlsRef.roll2Dice()
      } else {
        this.props.controlsRef.roll1Die()
      }
    })
  }

  tryBuyCard () {
    this.delayed(() => {
      // For ea preferred card in strat
      const buyPriorities = this.strategy.buyPriorities
      for (let p = 0; p < buyPriorities.length; p++) {
        const cardNameLower = buyPriorities[p].toLowerCase()
        const cardToBuy = cards.find(card => card.name.toLowerCase() === cardNameLower)
        const shouldBuy = this.shouldBuy(cardNameLower)
        const canBuy = this.props.canBuyCard(cardToBuy) === this.props.canBuyCardResults.canBuy
        if (shouldBuy && canBuy) {
          // Buy it
          this.props.marketRef.buyCard(cardToBuy)
          // Break
          break
        }
      }

      this.endTurn()
    })
  }

  shouldBuy (cardNameLower) {
    let shouldBuy = true
    const landmarksToBuild = this.props.cards.filter(card => card.type.toLowerCase() === 'landmark' && !card.constructed)
    const onlyOneMoreLandmarkToBuild = landmarksToBuild.length === 1

    if (onlyOneMoreLandmarkToBuild) {
      const thisIsLastLandmarkToBuild = cardNameLower === landmarksToBuild[0].name.toLowerCase()
      if (!thisIsLastLandmarkToBuild) {
        shouldBuy = false
      }
    }

    return shouldBuy
  }

  choosePlayerForTvStation (playerRefs) {
    // Choose richest player
    let richestPlayer = null
    playerRefs.forEach(ref => {
      if (!richestPlayer || ref.state.coin > richestPlayer.state.coin) {
        richestPlayer = ref
      }
    })
    return richestPlayer
  }

  choosePlayerForBusinessCenter () {
    // Dont trade
    return false
  }

  chooseReRollForRadioTower () {
    // Dont reroll
    return false
  }

  endTurn () {
    this.delayed(() => {
      this.props.controlsRef.endTurn()
    })
  }

  delayed (func) {
    setTimeout(func, this.state.speed)
  }

  render () {
    return <div />
  }
}

ComputerAi.propTypes = {
  controlsRef: PropTypes.any,
  dice: PropTypes.number.isRequired,
  marketRef: PropTypes.any,
  cards: PropTypes.array.isRequired,
  canBuyCard: PropTypes.func.isRequired,
  canBuyCardResults: PropTypes.object.isRequired
}

export default ComputerAi
