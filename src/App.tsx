import React, { useState } from 'react'

import { ethers } from 'ethers'

import './App.scss'
import ProviderConnect from './components/ProviderConnect'
import EoaAccount from './components/EoaAccount'
import SmartWallet from './components/SmartWallet'

function App () {
  // Global State:
  const [ethersProvider, setEthersProvider] = useState<any | null>(null)
  const [rLoginResponse, setRloginResponse] = useState<any>()

  // Accounts:
  const [eoaAddress, setEoaAddress] = useState<string>('')

  const handleLogin = (rLoginresponse: any) => {
    setRloginResponse(rLoginresponse)
    const provider = new ethers.providers.Web3Provider(rLoginresponse.provider)
    setEthersProvider(provider)
    setEoaAddress(rLoginresponse.provider.selectedAddress)
  }

  return (
    <div className="App">
      {!rLoginResponse && <ProviderConnect setProvider={handleLogin} />}
      {rLoginResponse && (
        <div>
          <EoaAccount eoaAddress={eoaAddress} provider={rLoginResponse.provider} />
        </div>
      )}
      {ethersProvider && <SmartWallet ethersProvider={ethersProvider} />}
    </div>
  )
}

export default App
