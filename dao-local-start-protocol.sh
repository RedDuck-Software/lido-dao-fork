#!/bin/bash
set -e +u
set -o pipefail

# first local account by default
DEPLOYER=${DEPLOYER:=0x372aB0250102C7626c5E91E57FCB75Ea74B40848}
# NETWORK=kintsugi
NETWORK=${NETWORK:=pulsechain}


function msg() {
  MSG=$1
  if [ ! -z "$MSG" ]; then
    echo ">>> ============================="
    echo ">>> $MSG"
    echo ">>> ============================="
  fi
}

function pause() {
  MSG=$1
  msg "$1"
  read -s -n 1 -p "Press any key to continue . . ."
  echo ""
}

# Start the protocol
yarn hardhat --network $NETWORK run ./scripts/multisig/31-start-protocol.js
yarn hardhat --network $NETWORK tx --from $DEPLOYER --file tx-31-start-protocol.json
yarn hardhat --network $NETWORK run ./scripts/multisig/vote-and-enact.js
msg "Vote executed and the protocol is started (including staking)"

rm tx-31-start-protocol.json
msg "Protocol started!"