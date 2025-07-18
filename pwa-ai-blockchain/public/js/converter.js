const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const amount = document.getElementById('amount');
const convertButton = document.getElementById('convert-button');
const resultDiv = document.getElementById('result');

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

async function convertCurrency() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amountValue = amount.value;

    if (amountValue <= 0) {
        resultDiv.textContent = 'Please enter a valid amount.';
        return;
    }

    resultDiv.textContent = 'Converting...';

    try {
        const response = await fetch(`${API_URL}?ids=${from.toLowerCase()}&vs_currencies=${to.toLowerCase()}`);
        const data = await response.json();

        if (data[from.toLowerCase()] && data[from.toLowerCase()][to.toLowerCase()]) {
            const rate = data[from.toLowerCase()][to.toLowerCase()];
            const result = amountValue * rate;
            resultDiv.textContent = `${amountValue} ${from} = ${result.toFixed(8)} ${to}`;
        } else {
            resultDiv.textContent = 'Conversion not available.';
        }
    } catch (error) {
        console.error('Error fetching conversion data:', error);
        resultDiv.textContent = 'Error fetching conversion data.';
    }
}

convertButton.addEventListener('click', convertCurrency);
