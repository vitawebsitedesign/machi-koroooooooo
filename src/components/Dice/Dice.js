import React from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'
import Die from '../Die/Die'
import styles from './Dice.css'

class Dice extends React.Component {
  constructor (props) {
    super(props)
    this.onStart = this.onStart.bind(this)
    this.onStop = this.onStop.bind(this)
    this.setDie1Ref = this.setDie1Ref.bind(this)
    this.setDie2Ref = this.setDie2Ref.bind(this)

    this.state = {
      die1: {
        startX: 0,
        startY: 0,
        coordsChange: {
          x: 0,
          y: 0
        }
      },
      die2: {
        startX: 0,
        startY: 0,
        coordsChange: {
          x: 0,
          y: 0
        }
      }
    }
  }

  componentDidMount () {
    this.getDraggableEle().style.transition = 'translate 2s ease-out'
  }

  onStart () {
    const coords = this.getCoords(this.die1Ref)
    let die1NewState = this.state.die1
    die1NewState.startX = coords.x
    die1NewState.startY = coords.y

    this.setState(() => ({
      die1: die1NewState
    }))
  }

  onStop () {
    // Get change in Y position
    const coords = this.getCoords(this.die1Ref)
    const movement = {
      x: coords.x - this.state.die1.startX,
      y: coords.y - this.state.die1.startY
    }

    // Get current translateY for "draggable container"
    const diceContainer = this.getDiceContainer()
    const transformStr = this.getTransformStr(diceContainer)
    const currentTranslate = this.getTranslateAsObj(transformStr)

    // Set new coordinates
    const newTranslateX = parseInt(currentTranslate.x + movement.x)
    const newTranslateY = parseInt(currentTranslate.y + movement.y)
    const newTranslate = `translate(${newTranslateX}px, ${newTranslateY}px)`

    this.getDiceContainer().style.transform = newTranslate

    if (this.props.controlsRef) {
      this.props.controlsRef.roll1Die()
    } else {
      console.warn('Tried to roll a new dice value, but Controls component was undefined')
    }
  }

  getDraggableEle () {
    const sel = 'react-draggable'
    const eles = document.getElementsByClassName(sel)
    if (eles[0]) {
      return eles[0]
    }

    console.warn(`Failed to get element with class ${sel}`)
    return null
  }

  getDiceContainer () {
    return this.refs.diceContainer
  }

  getTransformStr (ele) {
    const transform = ele.style.transform
    if (transform) {
      return transform
    }
    return 'translate(0, 0)'
  }

  getTranslateAsObj (str) {
    const start = str.indexOf('(') + 1
    // Length = where you want to end - start
    const len = str.indexOf(')') - start
    const valuesCommaSeparated = str.substr(start, len)
    const values = valuesCommaSeparated.split(',')
    const x = parseInt(values[0])
    const y = parseInt(values[1])
    return {
      x,
      y
    }
  }

  getCoords (ref) {
    return ref.getBoundingClientRect()
  }

  setDie1Ref (ref) {
    this.die1Ref = ref
  }

  setDie2Ref (ref) {
    this.die2Ref = ref
  }

  render () {
    let dice1 = null
    let dice2 = null

    if (this.props.numDice >= 1) {
      dice1 = <Die value={this.props.dice1}
        setDie1Ref={this.setDie1Ref}
        coordsChange={this.state.die1.coordsChange} />
    }
    if (this.props.numDice >= 2) {
      dice2 = <Die value={this.props.dice2} setDie2Ref={this.setDie2Ref} coordsChange={this.state.die2.coordsChange} />
    }

    return (
      <div className={styles.draggableContainer}>
        <Draggable onStart={this.onStart} onStop={this.onStop}>
          <div>
            <div ref='diceContainer' className={styles.diceContainer}>
              {dice1}
            </div>
            <div className={styles.dice2}>
              {dice2}
            </div>
          </div>
        </Draggable>
      </div>
    )
  }
}

Dice.propTypes = {
  dice1: PropTypes.number.isRequired,
  dice2: PropTypes.number.isRequired,
  controlsRef: PropTypes.object,
  numDice: PropTypes.number
}

Dice.defaultProps = {
  numDice: 0,
  controlsRef: null
}

export default Dice
