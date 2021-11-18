import React, { useState } from 'react'

interface Interface {
  provider: any
  eoaAddress: string
}

const Addresses: React.FC<Interface> = ({ provider, eoaAddress }) => {
  const [balance, setBalance] = useState<number | undefined>()

  const getBalanced = () => provider
    .request({ method: 'eth_getBalance', params: [eoaAddress] })
    .then((balance: any) => setBalance(parseInt(balance)))

  return (
    <div>
      <h2>EOA Account:</h2>
      <p><strong>Address</strong>: {eoaAddress}</p>
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
