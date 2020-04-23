import React from 'react'
import PropTypes from 'prop-types'
import styles from './Coin.css'

class Coin extends React.Component {
  coinClassName () {
    switch (this.props.value) {
      case 1:
        return styles.one
      case 5:
        return styles.five
      case 10:
        return styles.ten
      default:
        console.error('Unknown coin value: ' + this.props.value)
    }
  }

  render () {
    let coinClassNames = styles.coin + ` text-center ${this.coinClassName()}`
    return (
      <div className={coinClassNames}>
        <div className={styles.coinValue}>&#165;</div>
      </div>
    )
  }
}

Coin.propTypes = {
  value: PropTypes.node.isRequired
}

export default Coin
