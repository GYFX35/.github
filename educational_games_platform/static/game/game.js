document.addEventListener('DOMContentLoaded', () => {
    const conversation = document.getElementById('conversation');
    const playerInput = document.getElementById('player-input');

    playerInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            const userInput = playerInput.value;
            playerInput.value = '';

            addMessage('You', userInput);

            const response = await fetch('/get_npc_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: userInput })
            });

            const data = await response.json();
            addMessage('NPC', data.response);
        }
    });

    function addMessage(speaker, message) {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${speaker}:</strong> ${message}`;
        conversation.appendChild(messageElement);
    }
});
