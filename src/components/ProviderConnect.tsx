import React from 'react'
import RLogin from '@rsksmart/rlogin'

interface Interface {
  setProvider: (any: void) => void
}

const rLogin = new RLogin({ cacheProvider: false, supportedChains: [33] })

const ProviderConnect: React.FC<Interface> = ({ setProvider }) => {
  const handleLogin = () => {
    rLogin.connect()
      .then(response => setProvider(response))
  }

  return (
    <div>
      <h2>Connect to your Provider:</h2>
      <button onClick={handleLogin}>Connect!</button>
    </div>
  )
}

export default ProviderConnect
