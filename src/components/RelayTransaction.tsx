import React from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { RelayClient } from '@rsksmart/rif-relay-client'
import { TypedRequestData, RelayRequest, getDomainSeparatorHash } from '@rsksmart/rif-relay-common'

// import { ethers } from 'ethers'
// import { HttpProvider } from 'web3-core'
import { relayHubUrl, rpcUrl, contracts } from '../config.json'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import Web3 from 'web3'
import log from 'loglevel'
import axios, { AxiosResponse } from 'axios'

interface Interface {
  provider: any
  hubDetails: HubDetails
  ethersProvider: any
}

const RelayTransaction: React.FC<Interface> = ({ hubDetails, provider, ethersProvider }) => {
  // REFERENCE FOR THE FOLLOWING TWO VARIABLES:
  // https://github.com/rsksmart/rif-relay/blob/master/test/relayclient/RelayClient.test.ts
  // const jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl)
  /*
  const jsonRpcProvider = new Web3.providers.HttpProvider(rpcUrl)
  const config = {
    logLevel: log.levels.DEBUG,
    relayHubAddress: hubDetails.relayHubAddress.toLowerCase(),
    chainId: parseInt(hubDetails.chainId),
    deployVerifierAddress: contracts.smartWalletDeployVerifier.toLowerCase(),
    relayVerifierAddress: contracts.smartWalletRelayVerifier.toLowerCase(),
    preferredRelays: ['http://localhost:8090']
  }

  const relayClient = new RelayClient(jsonRpcProvider, config)
  */

  // @ts-ignore // logLevel ENUM:
  // const relayProvider = new RelayProvider(jsonRpcProvider, config)

  const create = async () => {
    console.log('provider', provider)
    // console.log('relayClient', relayClient)
    // const accounts = relayClient.accountManager.getAccounts()

    const smartWallet = await SmartWalletFactory.create(
      ethersProvider.getSigner(),
      contracts.smartWalletFactory // smartWalletFactoryAddress
    )
    console.log('smartWallet', smartWallet)
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

    // reference:
    // https://github.com/rsksmart/rif-relay/blob/master/test/relayclient/RelayClient.test.ts#L340
    const eoaNonce = await provider.request({ method: 'eth_getTransactionCount', params: [provider.selectedAddress] })
      .then((response: string) => parseInt(response))

    const smartWalletNonce = await provider.request({ method: 'eth_getTransactionCount', params: [smartWallet.smartAddress] })
      .then((response: string) => parseInt(response))

    const relayWorkerNonce = await provider.request({ method: 'eth_getTransactionCount', params: [hubDetails.relayWorkerAddress] })
      .then((response: string) => parseInt(response))

    console.log('nonces:', { eoaNonce, smartWalletNonce, relayWorkerNonce })

    const relayRequest: RelayRequest = {
      request: {
        relayHub: hubDetails.relayHubAddress,
        from: provider.selectedAddress,
        to: contracts.testToken,
        tokenContract: contracts.testToken,
        value: '0',
        gas: '85000', // 0x3938700', // '163000000', // '285000',
        nonce: '0', // relayWorkerNonce.toString(), // <-- ugg, yes toString()
        tokenAmount: '1',
        tokenGas: '50000',

        // send 7 tokens to the address 0x3dd03d7d6c3137f1eb7582ba5957b8a2e26f304a:
        data: '0xa9059cbb0000000000000000000000003dd03d7d6c3137f1eb7582ba5957b8a2e26f304a0000000000000000000000000000000000000000000000006124fee993bc0000'
        // data: '0xa9059cbb000000000000000000000000b708e6d2eff26fe248df7c3f47d2ad510c94ecb800000000000000000000000000000000000000000000000053444835ec580000'
        // data: '0x'
      },
      relayData: {
        gasPrice: '1', // '1000000000', // '220350',
        domainSeparator, // calculated above
        relayWorker: hubDetails.relayWorkerAddress,
        callForwarder: smartWallet.smartAddress, // the one that owns the TOKEN for payment
        callVerifier: contracts.smartWalletRelayVerifier
      }
    }

    const unsignedTx = new TypedRequestData(
      parseInt(hubDetails.chainId),
      relayRequest.relayData.callForwarder, //
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
          relayMaxNonce: 1000000,
          signature
        }
      }

      console.log('axios post:', signedRelayRequest)

      axios.post(`${relayHubUrl}/relay`, signedRelayRequest)
        .then((response: AxiosResponse) => response.data)
        .then((data: any) => {
          console.log('response...', data)
          if (data.error) {
            console.log('ERROR!', data.error)
          }
        })
    })
  }

  const estimateGas = () => {
    // estimateDestinationContractInternalCallGas
    // estimateDestinationContractInternalCallGas()
    // relayClient.estimateMaxPossibleRelayGas()
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
      <p>
        <button onClick={estimateGas}>estimate gas</button>
      </p>
    </div>
  )
}

export default RelayTransaction
