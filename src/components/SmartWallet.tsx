import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import erc20Abi from '../abi/erc20Abi.json'

interface Interface {
  ethersProvider: any
}

const smartWalletFactoryAddress = '0xA2276921Af8c20865cC0980A7e6EE8B9C46BDdC0'.toLowerCase()
const tokenAddress = '0x726ecc75d5d51356aa4d0a5b648790cc345985ed'

const SmartWallet: React.FC<Interface> = ({
  ethersProvider
}) => {
  const [smartWallet, setSmartWallet] = useState<any>(null)
  const [isDeployed, setIsDeployed] = useState<boolean>(false)
  const [tokenBalance, setTokenBalance] = useState<number | undefined>()

  useEffect(() => {
    SmartWalletFactory.create(
      ethersProvider.getSigner(),
      smartWalletFactoryAddress
    ).then((factory: SmartWalletFactory) => setSmartWallet(factory))
  }, [ethersProvider])

  const checkIfDeployed = async () => {
    console.log(smartWallet)

    // Check if Deployed:
    smartWallet.isDeployed()
      .then((response: boolean) => {
        console.log('response', response)
        setIsDeployed(response)
      })
  }

  const refreshBalance = () => {
    const token = new ethers.Contract(
      tokenAddress,
      erc20Abi,
      ethersProvider
    )

    token.balanceOf(smartWallet.smartAddress.toLowerCase()).then((balance: any) =>
      setTokenBalance(balance.toString()))
  }

  return (
    <div>
      <h2>Smart Wallet Account</h2>
      <p>
        <button onClick={checkIfDeployed} disabled={isDeployed}>
          Check deployment
        </button>
      </p>

      {smartWallet && <p><strong>Smart Wallet Address:</strong> {smartWallet.smartAddress}</p>}
      <p><strong>Is deployed:</strong> {isDeployed.toString()} </p>
      <p><strong>TKN Balance:</strong> {tokenBalance}
        <button
          disabled={!smartWallet}
          onClick={refreshBalance}>refresh</button>
      </p>
      <hr />
    </div>
  )
}

export default SmartWallet
