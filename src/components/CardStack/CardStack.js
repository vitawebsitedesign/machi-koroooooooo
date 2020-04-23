import React from 'react'
import PropTypes from 'prop-types'
import Card from '../Card/Card'
import styles from './CardStack.css'

const CardStack = (props) => {
  const cardsToShow = props.cards.filter(card =>
    card.name.toLowerCase() === props.cardName.toLowerCase()
  )

  const eles = []
  cardsToShow.forEach((card, index) => {
    const imgUrl = `src/img/${card.img}`

    let cardStyles = null
    if (index > 0) {
      let separation = 20
      if (props.tight) {
        separation = 2
      }

      let marginValue = separation * index
      if (props.reversed) {
        marginValue = separation * index * -1
      }

      const marginTop = marginValue + 'px'
      cardStyles = {
        marginTop: marginTop
      }
    }

    const ele = (
      <div className={styles.cardContainer} style={cardStyles} key={index}>
        <Card activation={card.activation}
          category={card.category}
          name={card.name}
          img={imgUrl}
          description={card.description}
          price={card.price} />
      </div>
    )

    eles.push(ele)
  })

  return (
    <div className={styles.cardStack}>
      {eles}
    </div>
  )
}

CardStack.propTypes = {
  cards: PropTypes.array.isRequired,
  tight: PropTypes.bool,
  reversed: PropTypes.bool
}

CardStack.defaultProps = {
  tight: false,
  reversed: false
}

export default CardStack
