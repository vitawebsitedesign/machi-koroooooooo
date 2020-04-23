import React from 'react'
import PropTypes from 'prop-types'
import styles from './Controls.css'

class Controls extends React.Component {
  constructor (props) {
    super(props)
    this.roll1Die = this.roll1Die.bind(this)
    this.roll2Dice = this.roll2Dice.bind(this)
    this.endTurn = this.endTurn.bind(this)
  }

  roll1Die () {
    this.props.updateDiceValue(this.getNewDieValue())
  }

  roll2Dice () {
    this.props.updateDiceValue(this.getNewDieValue(), this.getNewDieValue())
  }

  getNewDieValue () {
    return Math.ceil(Math.random() * 10 % 6)
  }

  endTurn () {
    this.props.endTurn()
  }

  render () {
    let dice1Btn = null
    let dice2Btn = null
    let btnClassNames = `btn btn-primary ${styles.btnFlash}`
    if (this.props.rollsRemaining) {
      dice1Btn = (
        <button onClick={this.roll1Die}
          type='button'
          className={btnClassNames}>
          roll 1 die
        </button>
      )
      if (this.props.dice >= 2) {
        dice2Btn = (
          <button onClick={this.roll2Dice}
            type='button'
            className={btnClassNames}>
            roll 2 dice
          </button>
        )
      }
    }

    let endTurnBtn = null
    if (!this.props.rollsRemaining) {
      endTurnBtn = (
        <button type='button'
          onClick={this.endTurn}
          className={btnClassNames}>
          end turn
        </button>
      )
    }

    return (
      <div>
        {dice1Btn}
        {dice2Btn}
        {endTurnBtn}
      </div>
    )
  }
}

Controls.propTypes = {
  updateDiceValue: PropTypes.func,
  dice: PropTypes.number,
  rollsRemaining: PropTypes.number,
  endTurn: PropTypes.func.isRequired
}

export default Controls
