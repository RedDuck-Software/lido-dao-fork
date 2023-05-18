FROM node:12

ARG ARAGON_APP_LOCATOR=ipfs
ARG ARAGON_ETH_NETWORK_TYPE=pulsechain
ARG ARAGON_ENS_REGISTRY_ADDRESS=0x801e1d8C79504700529a68388481186412c63ECa
ARG ARAGON_IPFS_GATEWAY=http://127.0.0.1:8080/ipfs
ARG ARAGON_DEFAULT_ETH_NODE=wss://ws.v3.testnet.pulsechain.com

ENV ARAGON_APP_LOCATOR=$ARAGON_APP_LOCATOR
ENV ARAGON_ETH_NETWORK_TYPE=$ARAGON_ETH_NETWORK_TYPE
ENV ARAGON_ENS_REGISTRY_ADDRESS=$ARAGON_ENS_REGISTRY_ADDRESS
ENV ARAGON_IPFS_GATEWAY=$ARAGON_IPFS_GATEWAY
ENV ARAGON_DEFAULT_ETH_NODE=$ARAGON_DEFAULT_ETH_NODE

RUN mkdir -p /aragon
RUN wget -q https://github.com/aragon/client/archive/0.8.14.tar.gz
RUN tar -xzf 0.8.14.tar.gz -C /aragon --strip 1 client-0.8.14
WORKDIR /aragon
RUN yarn global add http-server
RUN yarn

ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npx copy-aragon-ui-assets -n aragon-ui ./public \
 && npx parcel build src/index.html --out-dir ./public --public-url ./ --no-cache --no-source-maps

ENTRYPOINT ["http-server"]
