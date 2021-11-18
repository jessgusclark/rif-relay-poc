import axios, { AxiosResponse } from 'axios'
import React, { useState } from 'react'

interface Interface {

}

const relayHubAddress = 'http://localhost:8090'

const RelayHub: React.FC<Interface> = () => {
  const [error, setError] = useState<string | undefined>()
  const [details, setDetails] = useState<any>()

  const getHubInfo = () => {
    setError(undefined)
    axios.get(`${relayHubAddress}/getAddr`)
      .then((resp: AxiosResponse) => resp.data)
      .then((data: any) => setDetails(data))
      .catch((err: Error) => setError(err.toString()))
  }

  return (
    <div>
      <h2>Relay Hub</h2>
      <p><strong>URL</strong> {relayHubAddress}</p>
      <button onClick={getHubInfo} disabled={!!details}>get details from hub</button>
      {details && (JSON.stringify(details))}
      {error && <p><strong>{error}</strong></p>}
    </div>
  )
}

export default RelayHub
