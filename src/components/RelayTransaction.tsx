import React from 'react'

export interface HubDetails {
  'relayWorkerAddress': string,
  'relayManagerAddress': string,
  'relayHubAddress': string,
  'minGasPrice': string,
  'chainId': string,
  'networkId': string,
  'ready': boolean,
  'version': string
}

interface Interface {
  hubDetails: HubDetails
}

const RelayTransaction: React.FC<Interface> = ({ hubDetails }) => {
  return (
    <div>
      <h2>Relay Transaction</h2>
      <h3>details</h3>
      <pre style={{ width: '90%', textAlign: 'left' }}>
        {JSON.stringify(hubDetails, null, 2)}
      </pre>
    </div>
  )
}

export default RelayTransaction
