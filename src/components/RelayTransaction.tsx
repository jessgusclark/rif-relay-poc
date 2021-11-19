import React from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { RelayClient } from '@rsksmart/rif-relay-client'
import { TypedRequestData, RelayRequest, getDomainSeparatorHash } from '@rsksmart/rif-relay-common'

// import { ethers } from 'ethers'
// import { HttpProvider } from 'web3-core'
import { relayHubUrl, deployVerifierAddress, relayVerifierAddress, rpcUrl, tokenAddress, smartWalletFactoryAddress } from '../config.json'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import Web3 from 'web3'
import log from 'loglevel'
import axios from 'axios'

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
    logLevel: log.levels.DEBUG,
    relayHubAddress: hubDetails.relayHubAddress.toLowerCase(),
    chainId: parseInt(hubDetails.chainId),
    deployVerifierAddress,
    relayVerifierAddress,
    preferredRelays: ['http://localhost:8090']
  }

  const relayClient = new RelayClient(jsonRpcProvider, config)

  // @ts-ignore // logLevel ENUM:
  // const relayProvider = new RelayProvider(jsonRpcProvider, config)

  const create = async () => {
    console.log('provider', provider)
    console.log('relayClient', relayClient)
    // const accounts = relayClient.accountManager.getAccounts()

    const smartWallet = await SmartWalletFactory.create(
      ethersProvider.getSigner(),
      smartWalletFactoryAddress
    )
    /*
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
      isSmartWalletDeploy: true,
      tokenGas: '500000' // ??
    }

    relayClient.relayTransaction(txOptions)
      .then((result: RelayingResult) => {
        console.log('the result:', result)
      })
    */

    const domainSeparator = await getDomainSeparatorHash(
      smartWallet.smartAddress,
      parseInt(hubDetails.chainId)
    )

    const nonce = await provider.request({ method: 'eth_getTransactionCount', params: [provider.selectedAddress] })
      .then((response: string) => parseInt(response))

    const relayRequest: RelayRequest = {
      request: {
        relayHub: hubDetails.relayHubAddress.toLowerCase(),
        from: provider.selectedAddress.toLowerCase(),
        to: '0x387699a87e4f37a9708bf85ef6af822619bd8e8a', // <-- me
        tokenContract: tokenAddress,
        value: '5',
        gas: '35000',
        nonce: nonce.toString(), // <-- ugg, yes
        tokenAmount: '1',
        tokenGas: '600000',
        data: '0x'
      },
      relayData: {
        gasPrice: '65000',
        domainSeparator, // calculated above
        relayWorker: hubDetails.relayWorkerAddress,
        callForwarder: smartWallet.smartAddress, // the one that owns the TOKEN for payment
        callVerifier: relayVerifierAddress
      }
    }

    const unsignedTx = new TypedRequestData(
      parseInt(hubDetails.chainId),
      relayVerifierAddress,
      relayRequest
    )
    console.log('unsignedTx', unsignedTx)

    provider.request({
      method: 'eth_signTypedData_v4',
      params: [provider.selectedAddress, JSON.stringify(unsignedTx)]
    }).then((signature: string) => {
      console.log('signed!', signature)

      const signedRelayRequest = {
        relayRequest,
        metadata: {
          relayHubAddress: hubDetails.relayHubAddress.toLowerCase(),
          relayMaxNonce: 100000,
          signature
        }
      }

      console.log('axios post:', signedRelayRequest)

      axios.post(`${relayHubUrl}/relay`, signedRelayRequest)
        .then((response: any) => {
          console.log('response...', response)
        })
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
