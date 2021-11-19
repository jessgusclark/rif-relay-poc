import React from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { RelayClient, RelayingResult, RelayProvider } from '@rsksmart/rif-relay-client'
// import { ethers } from 'ethers'
// import { HttpProvider } from 'web3-core'
import { deployVerifierAddress, relayVerifierAddress, rpcUrl, tokenAddress, smartWalletFactoryAddress } from '../config.json'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import Web3 from 'web3'

interface Interface {
  provider: any
  hubDetails: HubDetails
  ethersProvider: any
}

const RelayTransaction: React.FC<Interface> = ({ hubDetails, provider, ethersProvider }) => {
  // REFERENCE FOR THE FOLLOWING TWO VARIABLES:
  // https://github.com/rsksmart/rif-relay/blob/master/test/relayclient/RelayClient.test.ts
  // const jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl)

  const jsonRpcProvider = new Web3.providers.HttpProvider(rpcUrl)
  const config = {
    logLevel: 0,
    relayHubAddress: hubDetails.relayHubAddress.toLowerCase(),
    chainId: parseInt(hubDetails.chainId),
    deployVerifierAddress,
    relayVerifierAddress,
    preferredRelays: ['http://localhost:8090']
  }

  // @ts-ignore
  const relayClient = new RelayClient(jsonRpcProvider, config)

  // @ts-ignore // logLevel ENUM:
  const relayProvider = new RelayProvider(jsonRpcProvider, config)

  const create = async () => {
    console.log('provider', provider)
    console.log('relayClient', relayClient)
    console.log('relayProvider', relayProvider)
    // const accounts = relayClient.accountManager.getAccounts()

    const smartWallet = await SmartWalletFactory.create(
      ethersProvider.getSigner(),
      smartWalletFactoryAddress
    )

    const txOptions = {
      from: provider.selectedAddress.toLowerCase(),
      to: '0x387699a87e4f37a9708bf85ef6af822619bd8e8a', // <-- this is me
      data: '0x',
      relayHub: hubDetails.relayHubAddress.toLowerCase(),
      callForwarder: smartWallet.smartAddress.toLowerCase(),
      callVerifier: deployVerifierAddress,
      clientId: '1',
      tokenContract: tokenAddress,
      tokenAmount: '1',
      isSmartWalletDeploy: true
    }

    relayClient.relayTransaction(txOptions)
      .then((result: RelayingResult) => {
        console.log('the result:', result)
      })
  }

  return (
    <div>
      <h2>Relay Transaction</h2>
      <h3>details</h3>
      <pre style={{ width: '90%', textAlign: 'left' }}>
        {JSON.stringify(hubDetails, null, 2)}
      </pre>

      <h3>Relay a transaction</h3>
      <p>
        <button onClick={create}>do it</button>
      </p>
    </div>
  )
}

export default RelayTransaction
