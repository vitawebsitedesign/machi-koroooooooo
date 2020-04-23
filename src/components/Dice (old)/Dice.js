import React from 'react'
import PropTypes from 'prop-types'
import styles from './Dice.css'

class Dice extends React.Component {
  render () {
    const backgroundImage = 'url(src/img/die-' + this.props.value + '.png)'
    const dieFaceStyle = {
      backgroundImage: backgroundImage
    }
    return (
      <div className={styles.dice} style={dieFaceStyle} />
    )
  }
}

Dice.propTypes = {
  value: PropTypes.node.isRequired
}

export default Dice
