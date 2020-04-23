import React from 'react'
import CardStack from '../CardStack/CardStack'
import PropTypes from 'prop-types'
import cards from '../../js/cards.json'
import styles from './Market.css'

class Market extends React.Component {
  constructor (props) {
    super(props)
    this.cardStackEles = this.cardStackEles.bind(this)
    this.buyCard = this.buyCard.bind(this)

    this.buyCardClickHandlers = {}
    cards.forEach(card => {
      this.buyCardClickHandlers[card.name] = this.buyCard.bind(this, card)
    })
  }

  cardStackEles (cardTypes) {
    const stacks = []
    const marketCards = this.deepCopy(cards).filter(card => cardTypes.indexOf(card.type.toLowerCase()) !== -1 && card.category.toLowerCase() !== 'landmark')
    const cardsSortedByActivation = marketCards.sort((a, b) => a.activation[0] > b.activation[0])

    cardsSortedByActivation.forEach(card => {
      const cardNameLower = card.name.toLowerCase()
      let stock = this.props.stock[cardNameLower]
      if (!stock) {
        return
      }

      // Init empty array
      let cardsOfThisTypeInStock = []
      for (let i = 0; i < stock; i++) {
        cardsOfThisTypeInStock.push(card)
      }

      if (stock > 0) {
        const classNames = `${styles.cardStackContainer} col-xs-5ths`
        const tight = true
        const reversed = true
        const stack = (
          <div key={card.name} className={classNames} onClick={this.buyCardClickHandlers[card.name]}>
            <CardStack cards={cardsOfThisTypeInStock} cardName={card.name} tight={tight} reversed={reversed} />
          </div>
        )
        stacks.push(stack)
      }
    })

    return stacks
  }

  buyCard (card, e) {
    this.props.buyCard(card)
  }

  deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  render () {
    let marketClassNames = `${styles.market} col-xs-12`
    return (
      <div className={marketClassNames}>
        {this.cardStackEles(['primaryindustry', 'secondaryindustry', 'restaurants', 'majorestablishment'])}
      </div>
    )
  }
}

Market.propTypes = {
  buyCard: PropTypes.func.isRequired,
  stock: PropTypes.object.isRequired
}

export default Market
