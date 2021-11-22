import axios, { AxiosResponse } from 'axios'
import React, { useState } from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { relayHubUrl, contracts } from '../config.json'

interface Interface {
  setHubDetails: (details: any) => void
}

const RelayHub: React.FC<Interface> = ({ setHubDetails }) => {
  const [error, setError] = useState<string | undefined>()
  const [isHubAddressCorrect, setIsHubAddressCorrect] = useState<boolean>(false)

  const getHubInfo = () => {
    setError(undefined)
    axios.get(`${relayHubUrl}/getAddr`)
      .then((resp: AxiosResponse) => resp.data)
      .then((data: HubDetails) => {
        setHubDetails(data)
        setIsHubAddressCorrect(data.relayHubAddress.toLowerCase() === contracts.relayHub.toLowerCase())
      })
      .catch((err: Error) => setError(err.toString()))
  }

  return (
    <div>
      <h2>Relay Hub Info</h2>
      <p><strong>URL: </strong> {relayHubUrl}</p>
      <p><strong>hub address matches:</strong> {isHubAddressCorrect.toString()} </p>
      <button onClick={getHubInfo}>get details from hub</button>
      {error && <p><strong>{error}</strong></p>}
      <hr />
    </div>
  )
}

export default RelayHub
