import React from 'react'
import PropTypes from 'prop-types'
import styles from './DieFace.css'

const DieFace = (props) => {
  const classNames = `${styles.dieFace} ${styles[props.face]}`
  return <div className={classNames}>{props.label}</div>
}

DieFace.propTypes = {
  face: PropTypes.string.isRequired,
  label: PropTypes.string
}

export default DieFace
