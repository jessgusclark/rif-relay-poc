import React, { useState } from 'react'

interface Interface {
  provider: any
}

const Addresses: React.FC<Interface> = ({ provider }) => {
  const [balance, setBalance] = useState<number | undefined>()

  const getBalanced = () => provider
    .request({ method: 'eth_getBalance', params: [provider.selectedAddress] })
    .then((balance: any) => setBalance(parseInt(balance)))

  return (
    <div>
      <h2>EOA Account:</h2>
      <p><strong>Address</strong>: {provider.selectedAddress}</p>
      <p>
        <strong>Balance:</strong>
        {balance}
        <button onClick={getBalanced}>refresh</button>
      </p>
      <hr />
    </div>
  )
}

export default Addresses
