import React from 'react'
import Coin from '../Coin/Coin'
import jQuery from 'jquery'
window.$ = window.jQuery = jQuery

class Bank extends React.Component {
  render () {
    let coinValues = [1, 5, 10]
    let coinEles = coinValues.map(coinValue =>
      <Coin key={coinValue} value={coinValue} />
    )

    return (
      <div>
        {coinEles}
      </div>
    )
  }
}

export default Bank
