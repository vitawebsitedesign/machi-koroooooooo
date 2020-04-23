import React from 'react'
import PropTypes from 'prop-types'
import styles from './GameWonSplash.css'

class GameWonSplash extends React.Component {
  constructor (props) {
    super(props)

    this.hidePopup = this.hidePopup.bind(this)
    this.allowButtonClicking = this.allowButtonClicking.bind(this)
    setTimeout(this.allowButtonClicking, 5000)

    this.state = {
      canClickButtons: false,
      show: true
    }
  }

  allowButtonClicking () {
    this.setState((prevState, props) => ({
      canClickButtons: true
    }))
  }

  restartGame () {
    window.location.reload()
  }

  hidePopup () {
    this.setState((prevState, props) => ({
      show: false
    }))
  }

  render () {
    const rowClassNames = `row ${styles.container}`
    const contentContainerClassNames = `col-xs-8 col-xs-offset-2 text-center ${styles.splash}`
    const fullWidthClassNames = 'col-xs-12'
    const halfWidthClassNames = 'col-xs-6 col-xs-offset-3'
    const btnClassNames = `${fullWidthClassNames} ${styles.button} btn btn-primary btn-success`
    const firstFeedbackButtonClassNames = `${btnClassNames} ${styles.firstFeedbackButton}`
    const disabled = (this.state.canClickButtons ? null : 'disabled')

    let splash = null
    if (this.state.show) {
      splash = (
        <div className={rowClassNames}>
          <div className={contentContainerClassNames}>
            <h1 className={fullWidthClassNames}>
              <span className={styles.emoticon}>
                ヽ(´ー｀)ノ
              </span>
              <span>
                &quot;{this.props.winner}&quot; wins!
              </span>
              <span className={styles.emoticon}>
                ಥ_ಥ
              </span>
            </h1>
            <div className={fullWidthClassNames}>
              <span>&quot;{this.props.winner}&quot; has won by building all 4 landmarks!</span>
            </div>
            <p className={fullWidthClassNames}>Thank you for sharing the Machi Koro spirit &amp; thank you for playing :)</p>
            <div className={halfWidthClassNames}>
              <button type='button' className={btnClassNames} disabled={disabled} onClick={this.restartGame}>New game （ ^_^）o自自o（^_^ ） </button>
              <button type='button' className={btnClassNames} disabled={disabled} onClick={this.hidePopup}>Hide this popup to review board</button>
              <button type='button' className={firstFeedbackButtonClassNames} disabled={disabled} onClick={this.hidePopup}>Feedback: thanks for the free machi koro :)</button>
              <button type='button' className={btnClassNames} disabled={disabled} onClick={this.hidePopup}>Feedback: these computers were a piece of cake! >:P</button>
              <button type='button' className={btnClassNames} disabled={disabled} onClick={this.hidePopup}>Feedback: these computers were quite difficult! :(</button>
            </div>
          </div>
        </div>
      )
    }

    return splash
  }
}

GameWonSplash.propTypes = {
  winner: PropTypes.string
}

export default GameWonSplash
