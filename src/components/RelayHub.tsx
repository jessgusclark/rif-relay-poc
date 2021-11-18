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
      <h2>Relay Hub Info</h2>
      <p><strong>URL</strong> {relayHubAddress}</p>
      <button onClick={getHubInfo} disabled={!!details}>get details from hub</button>
      {details && (
        <>
          <h3>details</h3>
          <pre style={{ width: '90%', textAlign: 'left' }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </>
      )}
      {error && <p><strong>{error}</strong></p>}
      <hr />
    </div>
  )
}

export default RelayHub
