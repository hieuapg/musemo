const APIController = (function() {
    const clientId = '35d56508ad454881aa8952142ae42b70';
    const clientSecret = 'b933b823e478468bbd968817256c1876';

    // Private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret) 
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        console.log('Token:', data.access_token); // Debugging statement
        return data.access_token;
    }

    const _mapEmotionToAttributes = (emotion) => {
        let attributes = { valence: 0.5, energy: 0.5 };
    
        switch (emotion) {
            case 'happy':
                attributes.valence = 0.8;
                attributes.energy = 0.8;
                break;
            case 'sad':
                attributes.valence = 0.2;
                attributes.energy = 0.2;
                break;
            case 'angry':
                attributes.valence = 0.1;
                attributes.energy = 0.9;
                break;
            case 'neutral':
                attributes.valence = 0.5;
                attributes.energy = 0.5;
                break;
            case 'disgusted':
                attributes.valence = 0.1;
                attributes.energy = 0.5;
                break;
            case 'surprised':
                attributes.valence = 0.6;
                attributes.energy = 0.9;
                break;
            default:
                break;
        }
    
        return attributes;
    }

    const _getRecommendations = async (token, emotion) => {
        const attributes = _mapEmotionToAttributes(emotion);
    
        const result = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=pop&target_valence=${attributes.valence}&target_energy=${attributes.energy}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
    
        const data = await result.json();
        console.log('Tracks:', data.tracks); // Debugging statement
        return data.tracks;
    }

    return {
        getToken() {
            return _getToken();
        },
        getRecommendations(token, emotion) {
            return _getRecommendations(token, emotion);
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn_submit');
    const expressionOutput = document.getElementById('expressionOutput');
    const songList = document.getElementById('song-list');

    btnSubmit.addEventListener('click', async () => {
        // Extract the emotion from the HTML
        const emotion = expressionOutput.innerText.trim();
        console.log('Detected Emotion:', emotion); // Debugging statement
        if (!emotion) {
            alert('No emotion detected.');
            return;
        }

        // Get the Spotify token
        const token = await APIController.getToken();

        // Get track recommendations based on the emotion
        const tracks = await APIController.getRecommendations(token, emotion);

        // Clear previous results
        songList.innerHTML = '';

        // Populate song list with new results
        tracks.forEach(track => {
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.href = track.external_urls.spotify;
            listItem.target = '_blank';
            listItem.innerText = `${track.name} - ${track.artists[0].name}`;
            songList.appendChild(listItem);
        });
    });
});
