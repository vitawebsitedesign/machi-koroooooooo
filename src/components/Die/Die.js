import React from 'react'
import PropTypes from 'prop-types'
import DieFace from '../DieFace/DieFace'
import styles from './Die.css'

class Die extends React.Component {
  constructor (props) {
    super(props)
    this.getDiceStyles = this.getDiceStyles.bind(this)

    this.rotationMap = {
      0: {
        x: 0,
        y: 0
      },
      1: {
        x: 0,
        y: 0
      },
      2: {
        x: 0,
        y: 180
      },
      3: {
        x: 0,
        y: 90
      },
      4: {
        x: 0,
        y: -90
      },
      5: {
        x: -90,
        y: 0
      },
      6: {
        x: 90,
        y: 0
      }
    }
  }

  componentDidMount () {
    if (this.props.setDie1Ref) {
      this.props.setDie1Ref(this.refs.die)
    } else if (this.props.setDie2Ref) {
      this.props.setDie2Ref(this.refs.die)
    } else {
      console.warn('Failed to set die reference because the function to set it, is not defined')
    }
  }

  getDiceStyles (dieValue) {
    const rotation = this.rotationMap[dieValue]
    return `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
  }

  render () {
    const transform = this.getDiceStyles(this.props.value)
    const diceStyles = {
      transform: transform
    }

    return (
      <div className={styles.dice} style={diceStyles} ref='die'>
        <DieFace face='left' label='3' />
        <DieFace face='right' label='4' />
        <DieFace face='front' label='1' />
        <DieFace face='back' label='2' />
        <DieFace face='top' label='5' />
        <DieFace face='bottom' label='6' />
      </div>
    )
  }
}

Die.propTypes = {
  value: PropTypes.node.isRequired,
  setDie1Ref: PropTypes.func,
  setDie2Ref: PropTypes.func
}

Die.defaultProps = {
  setDie1Ref: null,
  setDie2Ref: null
}

export default Die
