const express = require('express');
const router = express.Router();

let proposals = [];

router.post('/propose', (req, res) => {
  const { title, description, creator } = req.body;
  const proposal = { id: proposals.length+1, title, description, creator, votes: 0 };
  proposals.push(proposal);
  res.json(proposal);
});

router.post('/vote', (req, res) => {
  const { proposalId } = req.body;
  const proposal = proposals.find(p => p.id === proposalId);
  if (proposal) {
    proposal.votes += 1;
    res.json({ status: 'voted', proposal });
  } else {
    res.status(404).send('Proposal not found');
  }
});

router.get('/proposals', (req, res) => {
  res.json(proposals);
});

module';
import { ethers } from 'ethers';

export default function UniversalWallet() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await ethProvider.getSigner();
      setAddress(await signer.getAddress());
      setBalance(ethers.formatEther(await eth: {address}</div>
          <div>ETH Balance: {balance}</div>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
