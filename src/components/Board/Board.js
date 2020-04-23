import React from 'react'
import PropTypes from 'prop-types'
import Market from '../Market/Market'
import Controls from '../Controls/Controls'

class Board extends React.Component {
  componentDidMount () {
    this.props.setMarketRef(this.refs.market)
    this.props.setControlsRef(this.refs.controls)
  }

  render () {
    const containerClassNames = 'col-xs-12 text-center'
    let currentPlayerRef = null
    let numDiceForRoller = null
    let updateDiceValueFunc = null
    let rollsRemaining = null
    if (this.props.playerRefs && this.props.playerRefs.length) {
      currentPlayerRef = this.props.playerRefs.find(playerRef => playerRef.props.currentPlayer)
      if (currentPlayerRef) {
        numDiceForRoller = currentPlayerRef.state.dice
        updateDiceValueFunc = currentPlayerRef.updateDiceValue
        rollsRemaining = currentPlayerRef.state.rollsRemaining
      }
    }

    return (
      <div className={containerClassNames}>
        <Controls updateDiceValue={updateDiceValueFunc}
          dice={numDiceForRoller}
          rollsRemaining={rollsRemaining}
          endTurn={this.props.endTurn}
          ref='controls' />
        <Market buyCard={this.props.buyCard}
          stock={this.props.stock}
          playerRefs={this.props.playerRefs}
          ref='market' />
      </div>
    )
  }
}

Board.propTypes = {
  buyCard: PropTypes.func.isRequired,
  stock: PropTypes.object.isRequired,
  playerRefs: PropTypes.array.isRequired,
  setMarketRef: PropTypes.func.isRequired,
  setControlsRef: PropTypes.func.isRequired,
  endTurn: PropTypes.func.isRequired
}

export default Board
