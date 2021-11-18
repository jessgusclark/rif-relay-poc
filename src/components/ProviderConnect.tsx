import React from 'react'
import RLogin from '@rsksmart/rlogin'

interface Interface {
  setProvider: (details: any) => void
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
      <hr />
    </div>
  )
}

export default ProviderConnect
