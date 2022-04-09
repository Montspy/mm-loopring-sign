import * as ethUtil from 'ethereumjs-util'

import { BigNumber } from 'ethers'

import { toBig, toHex } from '@loopring-web/loopring-sdk'
import { EDDSAUtil, toBuffer, bnToBuf } from '@loopring-web/loopring-sdk/dist/index.js'

import MetaMaskOnboarding from '@metamask/onboarding'

const forwarderOrigin = 'http://localhost:9010'

const message = 'Sign this message to access Loopring Exchange: 0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4 with key nonce: 0'
let address = '' // Leave empty

// We create a new MetaMask onboarding object to use in our app
const onboarding = new MetaMaskOnboarding({ forwarderOrigin })

const initialize = () => {
  // Basic Actions Section
  const onboardButton = document.getElementById('connectButton')
  const getAccountsButton = document.getElementById('getAccounts')
  const getAccountsResult = document.getElementById('getAccountsResult')
  const signLoopringButton = document.getElementById('signLoopring')
  const signLoopringResult = document.getElementById('signLoopringResult')
  const generateKeyResult = document.getElementById('generateKeyResult')


  // Created check function to see if the MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    // Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
  }

  const MetaMaskClientCheck = () => {
    // Now we check to see if MetaMask is installed
    if (isMetaMaskInstalled()) {
      // If MetaMask is installed we ask the user to connect to their wallet
      onboardButton.innerText = 'Connect'
      // When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.addEventListener('click', async () => {
        try {
          // Will open the MetaMask UI
          // You should disable this button while the request is pending!
          await ethereum.request({ method: 'eth_requestAccounts' })
          getAccountsButton.disabled = false
        } catch (error) {
          console.error(error)
        }
      })
      onboardButton.disabled = false
    } else {
      // If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!'
      // When the button is clicked we call this function
      onboardButton.addEventListener('click', () => {
        onboardButton.innerText = 'Onboarding in progress'
        onboardButton.disabled = true
        // On this object we have startOnboarding which will start the onboarding process for our end user
        onboarding.startOnboarding()
      })
      onboardButton.disabled = false
    }
  }
  MetaMaskClientCheck()

  // Eth_Accounts-getAccountsButton
  getAccountsButton.addEventListener('click', async () => {
    // we use eth_accounts because it returns a list of addresses owned by us.
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    // We take the first address in the array of addresses and display it
    getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts'
    const [from] = accounts
    address = from
    signLoopringButton.disabled = false
  })

  signLoopringButton.addEventListener('click', async () => {
    const keyseed = await ethereum.request({
      method: 'personal_sign',
      params: [message, address],
      from: address,
    })

    signLoopringResult.innerHTML = keyseed || 'Not able to sign loopring to get keyseed'

    // Generate key pair
    const seedBuff = ethUtil.sha256(toBuffer(keyseed))
    // console.log(`seedBuff.toString('hex') ${seedBuff.toString('hex')}`)
    const seed = BigNumber.from(`0x${seedBuff.toString('hex')}`)
    // console.log(`seed ${seed.toString()}`)
    const bitIntDataItems = bnToBuf(seed.toString())
    // console.log(`bigIntData ${bitIntDataItems}`)
    const keyPair = EDDSAUtil.generateKeyPair(bitIntDataItems)
    // console.log('keyPair', keyPair)

    // const formatedPx = fm.formatEddsaKey(toHex(toBig(keyPair.publicKeyX)))
    // const formatedPy = fm.formatEddsaKey(toHex(toBig(keyPair.publicKeyY)))
    const sk = toHex(toBig(keyPair.secretKey))
    generateKeyResult.innerHTML = sk
  })

}
window.addEventListener('DOMContentLoaded', initialize)
