const contractAddress = "0x07f2dda4f4ce04e56308f1165e30c53430bdbe62";
const redirectUrl = "https://saiudja.space/plants-activation-25.html";

// ABI для виклику balanceOfBatch (ERC-1155)
const abi = [
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
];

// Функція для спроби підключення до мережі Base Mainnet
async function switchToBaseMainnet(provider) {
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x2105" }]);
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Мережа не додана, додаємо Base Mainnet
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: "0x2105", // 8453 у шістнадцятковому форматі
          chainName: "Base Mainnet",
          rpcUrls: ["https://mainnet.base.org"],
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://basescan.org"],
        },
      ]);
    } else {
      throw switchError;
    }
  }
}

document.getElementById("connectWallet").addEventListener("click", async () => {
  try {
    // Перевірка наявності Web3-провайдера
    if (!window.ethereum) {
      document.getElementById("status").innerText =
        "⚠️ Гаманець не виявлено. Відкрийте цю сторінку у браузері MetaMask, Trust Wallet або іншому Web3-гаманці.";
      return;
    }

    // Ініціалізація провайдера
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    document.getElementById("status").innerText =
      "🔗 Підключення до гаманця...";

    // Запит на підключення гаманця
    await provider.send("eth_requestAccounts", []);

    // Перевірка та перемикання на Base Mainnet
    const network = await provider.getNetwork();
    if (network.chainId !== 8453) {
      await switchToBaseMainnet(provider);
    }

    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();
    document.getElementById(
      "status"
    ).innerText = `🔍 Перевіряємо NFT для адреси ${walletAddress}...`;

    // Створення екземпляра контракту
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Перевірка балансу для кількох tokenId
    const tokenIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Список можливих tokenId
    const accounts = Array(tokenIds.length).fill(walletAddress);
    const balances = await contract.balanceOfBatch(accounts, tokenIds);

    // Логування для діагностики
    console.log("Token IDs:", tokenIds);
    console.log(
      "Balances:",
      balances.map((b) => b.toNumber())
    );

    // Перевірка, чи є хоча б один токен із ненульовим балансом
    const hasNFT = balances.some((balance) => balance.toNumber() > 0);

    if (hasNFT) {
      document.getElementById("status").innerText =
        "✅ Доступ надано! Перенаправляємо...";
      setTimeout(() => (window.location.href = redirectUrl), 2000);
    } else {
      document.getElementById("status").innerText =
        "⛔ У вас немає потрібного NFT. Перевірте свій гаманець.";
    }
  } catch (err) {
    console.error("Помилка:", err);
    document.getElementById("status").innerText = `⚠️ Помилка: ${
      err.message || "Невідома помилка при з’єднанні з гаманцем."
    }`;
  }
});

// Додаємо підтримку сенсорних подій для мобільних пристроїв
document
  .getElementById("connectWallet")
  .addEventListener("touchstart", async () => {
    document.getElementById("connectWallet").click();
  });
async function checkActivationCode(code) {
  try {
    const response = await fetch("/.netlify/functions/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const result = await response.json();
    codeStatus.textContent = result.valid ? "Код дійсний!" : "Код недійсний.";
  } catch (error) {
    codeStatus.textContent = "Помилка перевірки: " + error.message;
  }
}

connectWalletButton.addEventListener("click", checkWallet);
activationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = document.getElementById("activationCode").value.trim();
  checkActivationCode(code);
});
