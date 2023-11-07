import { createConfig, configureChains, watchAccount, connect, disconnect, getWalletClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { mainnet } from '@wagmi/core/chains'

const PROJECT_ID = "a42a3f724b5a471df91f3bb6cd32c2ab";

const metaMaskButton = document.getElementById('metamask')!;
const walletConnectButton = document.getElementById('walletConnect')!;
const statusElement = document.getElementById('status')!;
const disconnectButton = document.getElementById('disconnect')!;
const signSection = document.getElementById('signSection')!;
const signButton = document.getElementById('sign')!;
const signatureStatusElement = document.getElementById('signatureStatus')!;

const chains = [mainnet];
const chainIdToConnect = mainnet.id

const { publicClient, webSocketPublicClient } = configureChains(
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

watchAccount(async (account) => {
  if (account.status == 'connected') {
    statusElement.textContent = `Connected to ${account.address}`;
    metaMaskButton.classList.add('hidden');
    walletConnectButton.classList.add('hidden');
    disconnectButton.classList.remove('hidden');
    signSection.classList.remove('hidden');
    signatureStatusElement.textContent = '';
  } else if (account.status == 'connecting') {
    statusElement.textContent = `Connecting...`;
    metaMaskButton.classList.add('hidden');
    walletConnectButton.classList.add('hidden');
    disconnectButton.classList.add('hidden');
    signSection.classList.add('hidden');
    signatureStatusElement.textContent = '';
  } else if (account.status == 'disconnected') {
    statusElement.textContent = `Not connected`;
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

signButton.addEventListener('click', async () => {
  const signer = await getWalletClient();

  if (signer) {
    signatureStatusElement.textContent = 'Requesting signature...';
    signButton.classList.add('hidden');
    try {
      const address = await config.connector?.getAccount()!;
      const signature = await signer.signMessage({
        // @ts-ignore
        account: address.toLowerCase(),
        message: 'Sign this message to sign in',
      });
      signatureStatusElement.textContent = `Signed in (signature: ${signature})`;
      signButton.classList.remove('hidden');
    } catch (e) {
      signatureStatusElement.textContent = 'Not signed';
      signButton.classList.remove('hidden');
    }
  }
});

disconnectButton.addEventListener('click', async () => {
  await disconnect();
});
