import React from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { RelayClient, RelayingResult, RelayProvider } from '@rsksmart/rif-relay-client'
import { TypedRequestData, RelayRequest, getDomainSeparatorHash } from '@rsksmart/rif-relay-common'

// import { ethers } from 'ethers'
// import { HttpProvider } from 'web3-core'
import { deployVerifierAddress, relayVerifierAddress, rpcUrl, tokenAddress, smartWalletFactoryAddress } from '../config.json'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import Web3 from 'web3'
import log from 'loglevel'

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

    const relayRequest: RelayRequest = {
      request: {
        relayHub: hubDetails.relayHubAddress.toLowerCase(),
        from: provider.selectedAddress.toLowerCase(),
        to: '0x387699a87e4f37a9708bf85ef6af822619bd8e8a', // <-- me
        tokenContract: tokenAddress,
        value: '5',
        gas: '35000',
        nonce: '1',
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
    }).then((signedTx: string) => {
      console.log('signed!', signedTx)
    })
  }

  const signTypedData = () => {
    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: 33,
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Ether Mail',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1'
      },

      // Defining the message signing data content.
      message: {
        /*
         - Anything you want. Just a JSON Blob that encodes the data you want to send
         - No required fields
         - This is DApp Specific
         - Be as explicit as possible when building out the message schema.
        */
        contents: 'Hello, Bob!',
        attachedMoneyInEth: 4.2,
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
          ]
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000'
            ]
          }
        ]
      },
      // Refers to the keys of the *types* object below.
      primaryType: 'Mail',
      types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        // Not an EIP712Domain definition
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' }
        ],
        // Refer to PrimaryType
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' }
        ],
        // Not an EIP712Domain definition
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' }
        ]
      }
    })

    // var params = [provider.selectedAddress, msgParams]
    provider.request({
      method: 'eth_signTypedData_v4',
      params: [provider.selectedAddress, msgParams]
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

        <button onClick={signTypedData}>sign</button>
      </p>
    </div>
  )
}

export default RelayTransaction
