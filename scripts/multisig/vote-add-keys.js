const { hash: namehash } = require('eth-ens-namehash')
const { encodeCallScript } = require('@aragon/contract-helpers-test/src/aragon-os')

const runOrWrapScript = require('../helpers/run-or-wrap-script')
const { log, logSplitter, logWideSplitter, yl, gr } = require('../helpers/log')
const { saveCallTxData } = require('../helpers/tx-data')
const { readNetworkState, assertRequiredNetworkState } = require('../helpers/persisted-network-state')

const { APP_NAMES } = require('./constants')

const DEPLOYER = process.env.DEPLOYER || ''
const REQUIRED_NET_STATE = [
  'lidoApmEnsName',
  'ensAddress',
  'daoAddress',
  `app:${APP_NAMES.ARAGON_VOTING}`,
  `app:${APP_NAMES.ARAGON_TOKEN_MANAGER}`
]

const pad = (hex, bytesLength) => {
  const absentZeroes = bytesLength * 2 + 2 - hex.length
  if (absentZeroes > 0) hex = '0x' + '0'.repeat(absentZeroes) + hex.substr(2)
  return hex
}

const keys = {
  keys: [pad('0xaa0101', 48), pad('0xaa0202', 48), pad('0xaa0303', 48)],
  sigs: [pad('0xa1', 96), pad('0xa2', 96), pad('0xa3', 96)]
}

async function createVoting({ web3, artifacts }) {
  const netId = await web3.eth.net.getId()

  logWideSplitter()
  log(`Network ID:`, yl(netId))

  const state = readNetworkState(network.name, netId)
  assertRequiredNetworkState(
    state,
    REQUIRED_NET_STATE.concat(['app:lido', 'app:node-operators-registry', 'app:oracle', 'executionLayerRewardsVaultAddress'])
  )

  logSplitter()

  const votingAddress = state[`app:${APP_NAMES.ARAGON_VOTING}`].proxyAddress
  const tokenManagerAddress = state[`app:${APP_NAMES.ARAGON_TOKEN_MANAGER}`].proxyAddress
  const voting = await artifacts.require('Voting').at(votingAddress)
  const tokenManager = await artifacts.require('TokenManager').at(tokenManagerAddress)
  const kernel = await artifacts.require('Kernel').at(state.daoAddress)
  const aclAddress = await kernel.acl()
  const acl = await artifacts.require('ACL').at(aclAddress)
  const nosAddress = state[`app:node-operators-registry`].proxyAddress
  const nos = await artifacts.require('NodeOperatorsRegistry.sol').at(nosAddress)

  log(`Using ENS:`, yl(state.ensAddress))
  log(`TokenManager address:`, yl(tokenManagerAddress))
  log(`Voting address:`, yl(votingAddress))
  log(`Kernel:`, yl(kernel.address))
  log(`ACL:`, yl(acl.address))

  log.splitter()

  const hexConcat = (first, ...rest) => {
    let result = first.startsWith('0x') ? first : '0x' + first
    rest.forEach((item) => {
      result += item.startsWith('0x') ? item.substr(2) : item
    })
    return result
  }

  const addKeysCallData = {
    to: nosAddress,
    calldata: await nos.contract.methods.addSigningKeys(0, 3, hexConcat(...keys.keys), hexConcat(...keys.sigs)).encodeABI()
  }

  const encodedUpgradeCallData = encodeCallScript([addKeysCallData])

  log(`encodedUpgradeCallData:`, yl(encodedUpgradeCallData))
  const votingCallData = encodeCallScript([
    {
      to: votingAddress,
      calldata: await voting.contract.methods.forward(encodedUpgradeCallData).encodeABI()
    }
  ])

  const txName = `tx-vote-add-keys.json`
  const votingDesc = `add keys`
  await saveCallTxData(votingDesc, tokenManager, 'forward', txName, {
    arguments: [votingCallData],
    from: DEPLOYER || state.multisigAddress
  })

  log.splitter()
  log(gr(`Before continuing the deployment, please send all transactions listed above.`))
  log(gr(`You must complete it positively and execute before continuing with the deployment!`))
  log.splitter()
}

module.exports = runOrWrapScript(createVoting, module)
