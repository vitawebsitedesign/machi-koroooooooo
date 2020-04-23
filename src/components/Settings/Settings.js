import React from 'react'
import PropTypes from 'prop-types'
import styles from './Settings.css'

const Settings = (props) => {
  const containerClassNames = `${styles.container} col-xs-12`
  const thirdClassNames = 'col-xs-4'
  const backgroundListItems = props.backgrounds.map(background => {
    return <option key={background.url} value={background.url}>{background.name}</option>
  })

  return (
    <div className={containerClassNames}>
      <div className={thirdClassNames}>
        <input type='checkbox' onChange={props.toggleSkipTurn} />
        Skip my next turn
      </div>
      <div className={thirdClassNames}>
        <select className={styles.backgroundList} onChange={props.changeBackground} value={props.currentBackgroundUrl}>
          {backgroundListItems}
        </select>
      </div>
      <div className={thirdClassNames}>
        <button type='button'>:|</button>
        <button type='button'>&gt;)</button>
        <button type='button'>:O</button>
      </div>
    </div>
  )
}

Settings.propTypes = {
  toggleSkipTurn: PropTypes.func.isRequired,
  backgrounds: PropTypes.array.isRequired,
  currentBackgroundUrl: PropTypes.string.isRequired,
  changeBackground: PropTypes.func.isRequired
}

export default Settings
