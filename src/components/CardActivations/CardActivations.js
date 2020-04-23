import React from 'react'
import PropTypes from 'prop-types'

class CardActivations extends React.Component {
  constructor (props) {
    super(props)
    this.getNewPlayerStates = this.getNewPlayerStates.bind(this)
    this.applyCardEffects = this.applyCardEffects.bind(this)
    this.applyCardEffect = this.applyCardEffect.bind(this)
    this.tryActivateShoppingMall = this.tryActivateShoppingMall.bind(this)
    this.tryActivateAmusementPark = this.tryActivateAmusementPark.bind(this)
    this.tryActivateRadioTower = this.tryActivateRadioTower.bind(this)

    this.props.setFunction('getNewPlayerStates', this.getNewPlayerStates)
    this.props.setFunction('tryActivateAmusementPark', this.tryActivateAmusementPark)
    this.props.setFunction('tryActivateRadioTower', this.tryActivateRadioTower)
  }

  getNewPlayerStates (playerRefs, diceTotal) {
    let newPlayerStates = {}
    playerRefs.forEach(ref => {
      newPlayerStates[ref.props.name.toLowerCase()] = {
        coin: ref.state.coin,
        cards: ref.state.cards
      }
    })

    let cardTypes = ['restaurants', 'primaryindustry', 'secondaryindustry', 'majorestablishment']
    cardTypes.forEach(cardType => {
      playerRefs.forEach(playerRef => {
        let cardTypesToCheck = []
        if (playerRef.props.currentPlayer) {
          cardTypesToCheck = ['primaryindustry', 'secondaryindustry', 'majorestablishment']
        } else {
          cardTypesToCheck = ['primaryindustry', 'restaurants']
        }

        let playerCardsOfType = playerRef.state.cards.filter(card => card.type.toLowerCase() === cardType.toLowerCase())
        let playerCardsToCheck = playerCardsOfType.filter(card => cardTypesToCheck.indexOf(card.type.toLowerCase()) !== -1)
        playerCardsToCheck.forEach(card => {
          let activates = (card.activation.indexOf(diceTotal) !== -1)
          if (activates) {
            this.applyCardEffects(playerRefs, playerRef, newPlayerStates, card)
          }
        })
      })
    })

    return newPlayerStates
  }

  applyCardEffects (playerRefs, playerRef, newPlayerStates, card) {
    card.effects.forEach(effect => {
      this.applyCardEffect(playerRefs, playerRef, newPlayerStates, card, effect)
    })
  }

  applyCardEffect (playerRefs, playerRef, newPlayerStates, card, effect) {
    let currentState = newPlayerStates[playerRef.props.name.toLowerCase()]
    let coinBeforeEffect = (currentState.coin ? currentState.coin : playerRef.state.coin)
    let playerNameLower = playerRef.props.name.toLowerCase()

    switch (effect.aspect) {
      case 'coin':
        if (effect.operation === '+') {
          const bonus = effect.value
          newPlayerStates[playerNameLower].coin += bonus
          this.tryActivateShoppingMall(card, newPlayerStates[playerNameLower], playerRef)
        } else {
          console.warn(`Tried to activate card effect, but no code has been added yet to handle the ${effect.operation} operation`)
        }
        break
      case 'coinForEach':
        // For ea card player owns
        playerRef.state.cards.forEach(card => {
          effect.forEachCategories.forEach(cat => {
            // If is in forEach array
            var inCategory = (cat.toLowerCase() === card.category.toLowerCase())
            if (inCategory) {
              // If operation is +
              if (effect.operation === '+') {
                // Increase coin
                newPlayerStates[playerNameLower].coin += effect.value
              } else {
                console.warn(`Tried to activate card effect, but no code has been added yet to handle the ${effect.operation} operation`)
              }
            }
          })
        })
        break
      case 'takeCoinFromRoller':
        // Decrease coin for roller (current player)
        // Increase coin for card owner
        const rollerRef = playerRefs.find(ref => ref.props.name.toLowerCase() === this.props.currentPlayerName.toLowerCase())
        this.takeCoinFromRoller(rollerRef, playerRef, effect.value, newPlayerStates)
        break
      case 'takeCoinFromAllPlayers':
        // For ea player
          // If roller (current player)
            // Increase coin by (effect * (player count - 1))
          // Else
            // Decrease coin
          // Endif
        // Endfor
        this.takeCoinFromAllPlayers(playerRefs, playerRef, effect.value, newPlayerStates)
        break
      case 'takeCoinFromATargetPlayer':
        // Make current player select a target player
        // Deduct coins from target player
        // Increase coins for current player
        this.takeCoinFromATargetPlayer(playerRefs, card.name, playerRef, effect.value, newPlayerStates)
        break
      case 'swapCardWithTargetPlayer':
        // Make current player select a card to give
        // Make current player select a target player
        // Make current player select a card to take
        // Remove card from target player
        // Add card to current player
        // Remove card from current player
        // Add card to target player
        this.swapCardWithTargetPlayer(card.name, playerRefs, playerRef, newPlayerStates)
        break
      default:
        console.warn(`Tried to activate card effect, but no code has been added yet to handle the ${effect.aspect} aspect`)
        break
    }

    var earnt = newPlayerStates[playerNameLower].coin - coinBeforeEffect
    if (earnt) {
      this.props.logMsg(`${playerRef.props.name} earnt ${earnt} coin from ${card.name}!`)
    }
  }

  takeCoinFromRoller (rollerRef, stealerRef, amount, newPlayerStates) {
    // Decrease coin for roller (current player)
    // Increase coin for card owner
    this.transferCoinBetweenPlayers({
      from: [rollerRef],
      to: [stealerRef],
      amount: amount,
      newPlayerStates: newPlayerStates
    })
  }

  takeCoinFromAllPlayers (playerRefs, stealerRef, amount, newPlayerStates) {
    // For ea player
      // If roller (current player)
        // Increase coin by (effect * (player count - 1))
      // Else
        // Decrease coin
      // Endif
    // Endfor
    const rollerNameLower = this.props.currentPlayerName.toLowerCase()
    const from = playerRefs.filter(ref => ref.props.name.toLowerCase() !== rollerNameLower)
    this.transferCoinBetweenPlayers({
      from: from,
      to: [stealerRef],
      amount: amount,
      newPlayerStates: newPlayerStates
    })
  }

  takeCoinFromATargetPlayer (playerRefs, cardName, stealerRef, amount, newPlayerStates) {
    // Make current player select a target player
    // Deduct coins from target player
    // Increase coins for current player
    let from = null
    if (stealerRef.props.isComputer) {
      from = stealerRef.refs.computerAi.choosePlayerForTvStation(playerRefs)
    } else {
      const title = `Your ${cardName} activates! Choose a player to steal from:`
      const playerNames = playerRefs.map(ref => ref.props.name)
      const excludePlayer = stealerRef.props.name.toLowerCase()
      const fromPlayerName = this.showChooseItemPopup(title, playerNames, excludePlayer)
      from = playerRefs.find(ref => ref.props.name.toLowerCase() === fromPlayerName.toLowerCase())
    }

    if (from) {
      this.transferCoinBetweenPlayers({
        from: [from],
        to: [stealerRef],
        amount: amount,
        newPlayerStates: newPlayerStates
      })
    }
  }

  showChooseItemPopup (title, items, excludeItem) {
    let list = items
    if (excludeItem) {
      list = list.filter(item => item.toLowerCase() !== excludeItem.toLowerCase())
    }

    let msg = title + `\r\n`
    list.forEach((item, index) => {
      msg += `${index}: ${item}\r\n`
    })

    const chosenIndex = window.prompt(msg)
    const chosen = items[chosenIndex]
    return chosen
  }

  transferCoinBetweenPlayers (details) {
    let taken = 0

    details.from.forEach(playerRef => {
      const nameLower = playerRef.props.name.toLowerCase()
      const coin = details.newPlayerStates[nameLower].coin
      let willTake = Math.min(coin, details.amount)

      taken += willTake
      details.newPlayerStates[nameLower].coin -= willTake
    })

    details.to.forEach(playerRef => {
      const nameLower = playerRef.props.name.toLowerCase()
      details.newPlayerStates[nameLower].coin += taken
    })

    let stealers = []
    let targets = []
    details.to.forEach(playerRef => {
      stealers.push(playerRef.props.name)
    })
    details.from.forEach(playerRef => {
      targets.push(playerRef.props.name)
    })
    let stealersAsStr = stealers.join(', ')
    let targetsAsStr = targets.join(', ')
    this.props.logMsg(`${stealersAsStr} is able to take ${taken} coin from ${targetsAsStr}!`)
  }

  swapCardWithTargetPlayer (cardName, playerRefs, stealerRef, newPlayerStates) {
    // Make current player select a target player
    let targetRef = null
    if (stealerRef.props.isComputer) {
      targetRef = stealerRef.refs.computerAi.choosePlayerForBusinessCenter()
    } else {
      targetRef = this.getTargetPlayerRef(cardName, playerRefs, stealerRef)
    }

    if (!targetRef) {
      console.warn(`Tried to activate ${cardName}, but user did not select a valid player to trade with`)
      return false
    }

    // Make current player select a card to take
    const cardToTakeRef = this.getCardToTake(targetRef)
    if (!cardToTakeRef) {
      console.warn(`Tried to activate ${cardName}, but user did not select a valid card to take`)
      return false
    }

    // Make current player select a card to give
    const cardToGiveRef = this.getCardToGive(stealerRef)

    // Give card to target, remove card from target
    const targetNameLower = targetRef.props.name.toLowerCase()
    let targetCards = newPlayerStates[targetNameLower].cards
    targetCards.push(cardToGiveRef)
    const indexToTake = targetCards.findIndex(card => card.name.toLowerCase() === cardToTakeRef.name.toLowerCase())
    if (indexToTake !== -1) {
      targetCards.splice(indexToTake, 1)
    } else {
      console.warn(`Tried to activate ${cardName}, but the card to take wasnt found to be with ${targetRef.props.name}`)
      return false
    }

    // Give card to stealer, remove card from stealer
    const stealerNameLower = stealerRef.props.name.toLowerCase()
    let stealerCards = newPlayerStates[stealerNameLower].cards
    stealerCards.push(cardToTakeRef)
    const indexToGive = stealerCards.findIndex(card => card.name.toLowerCase() === cardToGiveRef.name.toLowerCase())
    if (indexToGive !== -1) {
      stealerCards.splice(indexToGive, 1)
    } else {
      console.warn(`Tried to activate ${cardName}, but the card to give wasnt found to be with ${stealerRef.props.name}`)
      return false
    }

    this.props.logMsg(`${stealerRef.props.name} swapped ${cardToGiveRef.name} for ${cardToTakeRef.name} with ${targetRef.props.name}`)
    return true
  }

  getTargetPlayerRef (cardName, playerRefs, stealerRef) {
    const title = `Your ${cardName} activates! Choose a player to swap cards with:`
    const playerNames = playerRefs.map(ref => ref.props.name)
    const excludePlayer = stealerRef.props.name.toLowerCase()
    const targetPlayerName = this.showChooseItemPopup(title, playerNames, excludePlayer)
    const targetRef = playerRefs.find(ref => ref.props.name.toLowerCase() === targetPlayerName.toLowerCase())
    return targetRef
  }

  getCardToTake (targetRef) {
    const title = 'Select a card to take:'
    const cards = targetRef.state.cards.filter(card => card.category.toLowerCase() !== 'landmark' && card.type.toLowerCase() !== 'majorestablishment').map(card => card.name)
    const targetCardName = this.showChooseItemPopup(title, cards)
    const cardRef = targetRef.state.cards.find(card => card.name.toLowerCase() === targetCardName.toLowerCase())
    return cardRef
  }

  getCardToGive (takerRef) {
    const title = 'Select a card to give:'
    const cards = takerRef.state.cards.filter(card => card.category.toLowerCase() !== 'landmark' && card.type.toLowerCase() !== 'majorestablishment').map(card => card.name)
    const targetCardName = this.showChooseItemPopup(title, cards)
    const cardRef = takerRef.state.cards.find(card => card.name.toLowerCase() === targetCardName.toLowerCase())
    return cardRef
  }

  /* activateEstablishments (dice) {
    let newState = {
      cards: this.deepCopy(this.state.cards),
      coin: this.state.coin
    }

    let cardTypesToCheck = []
    if (this.props.currentPlayer) {
      cardTypesToCheck = ['primaryindustry', 'secondaryindustry', 'majorestablishment']
    } else {
      cardTypesToCheck = ['primaryindustry', 'restaurants']
    }

    let cardsToCheck = this.state.cards.filter(card => cardTypesToCheck.indexOf(card.type.toLowerCase()) !== -1)

    cardsToCheck.forEach(card => {
      let activates = (card.activation.indexOf(dice) !== -1)
      if (activates) {
        card.effects.forEach(effect => {
          this.activateEstablishment(newState, card, effect)
        })
      }
    })

    this.setState((prevState, props) => newState)
  }
  */

  tryActivateShoppingMall (activatedCard, newState, currentPlayerRef) {
    let shoppingMall = currentPlayerRef.getConstructedLandmark('shopping mall')
    if (shoppingMall) {
      let shoppingMallEffect = shoppingMall.effects.find(e => e.aspect.toLowerCase() === 'coinforeach')
      if (!shoppingMallEffect) {
        console.warn('Tried to apply shopping mall bonus, but the shopping mall card doesnt have a "coinForEach" effect')
        return false
      }

      let affectedByShoppingMall = shoppingMallEffect.forEachCategories.indexOf(activatedCard.category.toLowerCase()) !== -1
      if (affectedByShoppingMall) {
        const bonus = shoppingMallEffect.value
        newState.coin += bonus
        this.props.logMsg(`Shopping mall boosted ${activatedCard.name} reward by ${bonus}`)
      }
    }
  }

  tryActivateAmusementPark (dice1, dice2, currentPlayerRef, newPlayerStates) {
    if (dice1 === dice2) {
      const currentPlayerLower = currentPlayerRef.props.name.toLowerCase()
      newPlayerStates[currentPlayerLower].rollsRemaining = currentPlayerRef.state.rollsRemaining + 1
      this.props.logMsg(`Extra turn given by Amusement Park`)
    }
  }

  tryActivateRadioTower (radioTower, playerState, dice1, dice2, isComputer, computerAiRef) {
    if (isComputer) {
      return computerAiRef.chooseReRollForRadioTower()
    } else {
      if (radioTower && playerState.rollsRemaining > 0) {
        return window.confirm(`Rolled ${dice1} ${dice2 ? '& ' + dice2 : ''}. Reroll?`)
      }
    }
    return null
  }

  render () {
    return <div />
  }
}

CardActivations.propTypes = {
  setFunction: PropTypes.func.isRequired,
  logMsg: PropTypes.func.isRequired,
  currentPlayerName: PropTypes.string.isRequired
}

export default CardActivations
