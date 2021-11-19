import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { SmartWalletFactory } from '../lib/SmartWalletFactory'
import erc20Abi from '../abi/erc20Abi.json'
import { smartWalletFactoryAddress, tokenAddress } from '../config.json'

interface Interface {
  ethersProvider: any
}

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
    ).then((factory: SmartWalletFactory) => {
      setSmartWallet(factory)
      checkIfDeployed(factory)
    })
  }, [ethersProvider])

  const checkIfDeployed = (wallet: SmartWalletFactory) =>
    wallet.isDeployed()
      .then((response: boolean) => setIsDeployed(response))

  const deploy = () =>
    smartWallet.deploy()
      .then((deployResult: any) => console.log('isDeployed??', deployResult))

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
      {smartWallet && <p><strong>Smart Wallet Address:</strong> {smartWallet.smartAddress}</p>}
      <p><strong>Is deployed:</strong>
        {isDeployed.toString()}
        <button onClick={deploy} disabled={isDeployed}>deploy</button>
      </p>
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
