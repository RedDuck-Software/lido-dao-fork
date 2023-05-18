#!/bin/bash
set -e +u
set -o pipefail

git clone https://github.com/aragon/aragon-apps.git
git checkout master
git pull

cd aragon-apps/apps/agent/app && yarn add node-gyp
cd .. && yarn add node-gyp hardhat
cd ~
#
#cd aragon-apps/apps/voting/app && yarn add node-gyp
#cd .. && yarn add node-gyp hardhat
#cd ~
#
#cd aragon-apps/apps/token-manager/app && yarn add node-gyp
#cd .. && yarn add node-gyp hardhat
#cd ~

#cd aragon-apps/apps/finance/app && yarn add node-gyp
#cd .. && yarn add node-gyp hardhat
#cd ~
#
#cd aragon-apps/apps/vault && yarn add node-gyp hardhat
#cd ~
#
#cd aragon-apps/apps/minime-factory && yarn add node-gyp hardhat
#cd ~


