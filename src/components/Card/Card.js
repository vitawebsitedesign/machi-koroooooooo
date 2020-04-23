import React from 'react'
import PropTypes from 'prop-types'
import styles from './Card.css'

class Card extends React.Component {
  render () {
    const cardStyle = {
      backgroundImage: 'url(' + this.props.img + ')'
    }
    return (
      <div className={styles.card}
        style={cardStyle}
        title={this.props.description} />
    )
  }
}

Card.propTypes = {
  img: PropTypes.node.isRequired,
  description: PropTypes.string.isRequired
}

export default Card
