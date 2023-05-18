# Protocol deploying guide (Pulsechain)

> This guide has been tested on the `arm` system.   
> Some steps may be different for `windows`   
> For example 2 step from configuration topic

## Requirements

- **Command line** - bash or zsh
- **Docker** - you can download it here: https://www.docker.com/products/docker-desktop/
- **NodeJs version 14** - you can download it here: https://nodejs.org/en/blog/release/v14.15.1   
Or use `nvm`: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/
- **Yarn**


## Configuration

1) **Create** file `accounts.json` as copy `accounts.sample.json` in root folder, change mnemonics to mnemonic of your account which will deploy protocol for all conditions `localhost/dev/mainnet/e2e` and other data from sample.   

2) **Configure aragon apps**:   
> This script was created based on the features of the arm system

- Run script:   
```shell
./predeploy-install.sh
```
- After ran you need comment lines for clone apps repo:   
From this:
```
git clone https://github.com/aragon/aragon-apps.git
git checkout master
git pull
```
To this:
```
#git clone https://github.com/aragon/aragon-apps.git
#git checkout master
#git pull
```
- Comment first app install and uncomment second and again run first script:   
Comment: 
```
#cd aragon-apps/apps/agent/app && yarn add node-gyp
#cd .. && yarn add node-gyp hardhat
#cd ~
```
Uncomment: 
```
cd aragon-apps/apps/voting/app && yarn add node-gyp
cd .. && yarn add node-gyp hardhat
cd ~
```
- Make previous step for all apps in script

3) Add `1` to apps names in `package.json` to avoid naming conflicts:   
> Paths to change:   
> `aragon-apps/apps/agent/package.json`   
> `aragon-apps/apps/finance/package.json`   
> `aragon-apps/apps/minime-factory/package.json`   
> `aragon-apps/apps/token-manager/package.json`   
> `aragon-apps/apps/vault/package.json`   
> `aragon-apps/apps/voting/package.json`

4) Make copy of `deployed-pulsechain-ex.json` without `-ex`
5) Change `<deployer-address>` in new `deployed-pulsechain.json` file to your **first account address from your mnemonic**
6) Open `dao-local-deploy.sh` file and change `DEPLOYER` address to your **first account address from your mnemonic**

## Deploying process

> Note: all deploy process is depends on ENS contract. If the target network has one, you can use it. In this case, write it directly to the `deployed-pulsechain.json` file. Otherwise, own ENS contract will be deployed.

> Note: ETH2 Deposit contract is required. If the target network has one, you must use it. In this case, write it directly to the `deployed-pulsechain.json` file. Otherwise, own Deposit contract will be deployed.

Steps for deploy:

* run environment docker containers
* set up network config
* prepare DAO config file
* deploy Aragon framework environment (including ENS)
* build and deploy standard Aragon apps (contracts and frontend files)
* deploy Deposit contract (if necessary)
* deploy Lido DAO template contract
* deploy Lido Apps contract implementations
* register Lido APM name in ENS
* build Lido Apps frontend files and upload it to IPFS
* deploy Lido APM contract (via Lido Template)
* deploy Lido Apps repo contracts (via Lido Template)
* deploy Lido DAO contract (via Lido Template)
* issue DAO tokens (via Lido Template)
* finalize DAO setup (via Lido Template)
* make final deployed DAO check via script
* open and check Lido DAO web interface (via Aragon client)

All steps are automated via shell script [`dao-local-deploy.sh`](dao-local-deploy.sh) for local deploy process. The script be modified for any other network:

So, one-click local deploy from scratch command is:

```bash
./dao-local-deploy.sh
```

> Note: some steps require manually updating some transaction hashes in the `deployed-pulsechain.json` file. The script will pause the process in this case, please follow the script tips. 
