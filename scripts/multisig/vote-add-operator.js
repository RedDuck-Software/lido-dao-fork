const { hash: namehash } = require('eth-ens-namehash')
const { encodeCallScript } = require('@aragon/contract-helpers-test/src/aragon-os')

const runOrWrapScript = require('../helpers/run-or-wrap-script')
const { log, logSplitter, logWideSplitter, yl, gr } = require('../helpers/log')
const { saveCallTxData } = require('../helpers/tx-data')
const { readNetworkState } = require('../helpers/persisted-network-state')

// this is needed for the following `require`s to work, some kind of typescript path magic
require('@aragon/buidler-aragon/dist/bootstrap-paths')

const { APP_NAMES } = require('./constants')

const REWARDS_ADDRESS = '0x372aB0250102C7626c5E91E57FCB75Ea74B40848'
const operatorName = 'poolsea'

const APP = 'node-operators-registry'
const DEPLOYER = process.env.DEPLOYER || ''

async function upgradeAppImpl({ web3, artifacts }) {
  const netId = await web3.eth.net.getId()

  logWideSplitter()
  log(`Network ID:`, yl(netId))

  const state = readNetworkState(network.name, netId)

  logSplitter()

  log(`Using ENS:`, yl(state.ensAddress))
  log.splitter()

  const votingAddress = state[`app:${APP_NAMES.ARAGON_VOTING}`].proxyAddress
  const tokenManagerAddress = state[`app:${APP_NAMES.ARAGON_TOKEN_MANAGER}`].proxyAddress
  const nosAddress = state[`app:${APP}`].proxyAddress

  const nos = await artifacts.require('NodeOperatorsRegistry.sol').at(nosAddress)
  const voting = await artifacts.require('Voting').at(votingAddress)
  const tokenManager = await artifacts.require('TokenManager').at(tokenManagerAddress)

  log(`Using voting address:`, yl(votingAddress))
  log(`Using nos proxy address:`, yl(nosAddress))
  log(`DEPLOYER:`, yl(DEPLOYER))
  log.splitter()

  // encode call to Repo app for newVersion
  const callData1 = encodeCallScript([
    {
      to: nosAddress,
      calldata: await nos.contract.methods.addNodeOperator(operatorName, REWARDS_ADDRESS).encodeABI()
    }
  ])
  // encode forwarding call from Voting app to app Repo (new Vote will be created under the hood)
  const callData2 = encodeCallScript([
    {
      to: votingAddress,
      calldata: await voting.contract.methods.forward(callData1).encodeABI()
    }
  ])
  // finally forwarding call from TokenManager app to Voting
  await saveCallTxData(`New voting: add operator`, tokenManager, 'forward', `tx-nos-create-vote.json`, {
    arguments: [callData2],
    from: DEPLOYER
  })

  log.splitter()
  log(gr(`Before continuing the deployment, please send all transactions listed above.`))
  log(gr(`A new voting will be created to add a new implementation to Lido APM.`))
  log(gr(`You must complete it positively and execute before continuing with the deployment!`))
  log.splitter()

  // persistNetworkState(network.name, netId, state)
}

module.exports = runOrWrapScript(upgradeAppImpl, module)
