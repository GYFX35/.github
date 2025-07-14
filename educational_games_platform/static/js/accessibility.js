document.addEventListener('DOMContentLoaded', () => {
    const readAloudButton = document.getElementById('read-aloud');
    const content = document.querySelector('body');

    readAloudButton.addEventListener('click', () => {
        const text = content.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    });
});
