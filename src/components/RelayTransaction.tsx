import React from 'react'
import { HubDetails } from '../types/HubRelayGetAddr'
import { TypedRequestData, RelayRequest, getDomainSeparatorHash } from '@rsksmart/rif-relay-common'

import { relayHubUrl, contracts } from '../config.json'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import axios, { AxiosResponse } from 'axios'

interface Interface {
  provider: any
  hubDetails: HubDetails
  ethersProvider: any
}

const RelayTransaction: React.FC<Interface> = ({ hubDetails, provider, ethersProvider }) => {
  const create = async () => {
    console.log('provider', provider)

    const smartWallet = await SmartWalletFactory.create(
      ethersProvider.getSigner(),
      contracts.smartWalletFactory // smartWalletFactoryAddress
    )
    console.log('smartWallet', smartWallet)

    // smartWalletAddress and chainId
    const domainSeparator = await getDomainSeparatorHash(
      smartWallet.smartAddress,
      parseInt(hubDetails.chainId)
    )

    const smartWalletNonce = await smartWallet.nonce()

    const relayRequest: RelayRequest = {
      request: {
        relayHub: hubDetails.relayHubAddress,
        from: provider.selectedAddress,
        to: '0x0000000000000000000000000000000000000000', // contracts.testToken,
        tokenContract: contracts.testToken,
        value: '0',
        gas: '85000', // 0x3938700', // '163000000', // '285000',
        nonce: smartWalletNonce.toString(), // <-- ugg, yes toString()
        tokenAmount: '1',
        tokenGas: '50000',
        data: '0x'
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
