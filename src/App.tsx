import React, { useState } from 'react'

import { ethers } from 'ethers'

import './App.scss'
import ProviderConnect from './components/ProviderConnect'
import EoaAccount from './components/EoaAccount'
import SmartWallet from './components/SmartWallet'
import RelayHub from './components/RelayHub'
import RelayTransaction, { HubDetails } from './components/RelayTransaction'

function App () {
  // Global State:
  const [ethersProvider, setEthersProvider] = useState<any | null>(null)
  const [rLoginResponse, setRloginResponse] = useState<any>()
  const [relayHubInfo, setRelayHubInfo] = useState<HubDetails | null>(null)

  const handleLogin = (rLoginresponse: any) => {
    setRloginResponse(rLoginresponse)
    const provider = new ethers.providers.Web3Provider(rLoginresponse.provider)
    setEthersProvider(provider)
  }

  return (
    <div className="App">
      {!rLoginResponse && <ProviderConnect setProvider={handleLogin} />}
      {rLoginResponse && (
        <div>
          <EoaAccount provider={rLoginResponse.provider} />
        </div>
      )}
      {ethersProvider && <SmartWallet ethersProvider={ethersProvider} />}
      <RelayHub setHubDetails={(details: HubDetails) => setRelayHubInfo(details)} />
      {rLoginResponse && relayHubInfo &&
        <RelayTransaction hubDetails={relayHubInfo} />
      }
    </div>
  )
}

export default App
