import axios, { AxiosResponse } from 'axios'
import React, { useState } from 'react'
import { HubDetails } from './RelayTransaction'

interface Interface {
  setHubDetails: (details: any) => void
}

const relayHubAddress = 'http://localhost:8090'

const RelayHub: React.FC<Interface> = ({ setHubDetails }) => {
  const [error, setError] = useState<string | undefined>()

  const getHubInfo = () => {
    setError(undefined)
    axios.get(`${relayHubAddress}/getAddr`)
      .then((resp: AxiosResponse) => resp.data)
      .then((data: HubDetails) => setHubDetails(data))
      .catch((err: Error) => setError(err.toString()))
  }

  return (
    <div>
      <h2>Relay Hub Info</h2>
      <p><strong>URL</strong> {relayHubAddress}</p>
      <button onClick={getHubInfo}>get details from hub</button>
      {error && <p><strong>{error}</strong></p>}
      <hr />
    </div>
  )
}

export default RelayHub
