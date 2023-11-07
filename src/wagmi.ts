import {createConfig, configureChains, watchAccount, connect, disconnect, getWalletClient} from '@wagmi/core'
import {publicProvider} from '@wagmi/core/providers/public'
import {MetaMaskConnector} from '@wagmi/core/connectors/metaMask'
import {WalletConnectConnector} from '@wagmi/core/connectors/walletConnect'
import {mainnet} from '@wagmi/core/chains'

const PROJECT_ID = "a42a3f724b5a471df91f3bb6cd32c2ab";

const metaMaskButton = document.getElementById('metamask')!;
const walletConnectButton = document.getElementById('walletConnect')!;
const statusElement = document.getElementById('status')!;
const statusContainerElement = document.getElementById('status-container')!;
const disconnectButton = document.getElementById('disconnect')!;
const signSection = document.getElementById('signSection')!;
const signButton = document.getElementById('sign')!;
const signatureStatusElement = document.getElementById('signatureStatus')!;

const chains = [mainnet];
const chainIdToConnect = mainnet.id

const {publicClient, webSocketPublicClient} = configureChains(
  chains,
  [publicProvider()]
)

const metaMaskConnector = new MetaMaskConnector({
  chains: chains
});

const walletConnectConnector = new WalletConnectConnector({
  options: {
    projectId: PROJECT_ID,
  },
});

const config = createConfig({
  connectors: [
    metaMaskConnector,
  ],
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})

const hideAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const addressButton = (account: any) => {
  return `<a href="https://etherscan.io/address/${account.address}" target="_blank">${hideAddress(account.address)}</a>`
}

watchAccount(async (account) => {
  if (account.status == 'connected') {
    statusElement.innerHTML = addressButton(account);
    statusContainerElement.classList.add('connected');
    metaMaskButton.classList.add('hidden');
    walletConnectButton.classList.add('hidden');
    disconnectButton.classList.remove('hidden');
    signSection.classList.remove('hidden');
    signatureStatusElement.textContent = '';
  } else if (account.status == 'connecting') {
    statusElement.textContent = `Connecting...`;
    statusContainerElement.classList.remove('connected');
    statusContainerElement.classList.add('connecting');
    metaMaskButton.classList.add('hidden');
    walletConnectButton.classList.add('hidden');
    disconnectButton.classList.add('hidden');
    signSection.classList.add('hidden');
    signatureStatusElement.textContent = '';
  } else if (account.status == 'disconnected') {
    statusElement.textContent = `Not connected`;
    statusContainerElement.classList.remove('connecting');
    statusContainerElement.classList.remove('connected');
    metaMaskButton.classList.remove('hidden');
    walletConnectButton.classList.remove('hidden');
    disconnectButton.classList.add('hidden');
    signSection.classList.add('hidden');
    signatureStatusElement.textContent = '';
  }
})

metaMaskButton.addEventListener('click', async () => {
  await connect({
    chainId: chainIdToConnect,
    connector: metaMaskConnector
  })
});

walletConnectButton.addEventListener('click', async () => {
  await connect({
    chainId: chainIdToConnect,
    connector: walletConnectConnector
  })
});

const signatureButton = (signature: any) => {
  return `<a onclick="copyURI(event, '${signature}')" target="_blank">Signed in signature: ${hideAddress(signature)}</a>`
}
signButton.addEventListener('click', async () => {
  const signer = await getWalletClient();
  signatureStatusElement.innerHTML = ``;

  if (signer) {
    signButton.classList.add('loading');
    try {
      const address = await config.connector?.getAccount()!;
      const signature = await signer.signMessage({
        // @ts-ignore
        account: address.toLowerCase(),
        message: 'Sign this message to sign in',
      });
      signButton.classList.remove('loading');
      signatureStatusElement.innerHTML = signatureButton(signature);
    } catch (e) {
      signButton.classList.remove('loading');
    }
  }
});

disconnectButton.addEventListener('click', async () => {
  await disconnect();
});
