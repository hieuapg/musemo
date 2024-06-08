const APIController = (function() {
    const clientId = '';
    const clientSecret = '';

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
    };

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
    };

    const _getRecommendations = async (token, emotion) => {
        const attributes = _mapEmotionToAttributes(emotion);
    
        const result = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=pop&target_valence=${attributes.valence}&target_energy=${attributes.energy}&limit=${16}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
    
        const data = await result.json();
        return data.tracks;
    };

    const _getArtists = async (token, emotion) => {
        const tracks = await _getRecommendations(token, emotion);
        const artistId = tracks[0].artists[0].id;

        const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        return data.artists;
    };

    const _getPlaylists = async (token, emotion) => {
        const attributes = _mapEmotionToAttributes(emotion);

        const result = await fetch(`https://api.spotify.com/v1/browse/featured-playlists?limit=16`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await result.json();
        const playlists = data.playlists.items;
        return playlists;
    };

    return {
        getToken() {
            return _getToken();
        },
        getRecommendations(token, emotion) {
            return _getRecommendations(token, emotion);
        },
        getArtists(token, emotion) {
            return _getArtists(token, emotion); 
        },
        getPlaylists(token, emotion) {
            return _getPlaylists(token, emotion);
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn_submit_tracks');
    const expressionOutput = document.getElementById('expressionOutput');
    const songList = document.getElementById('song-list');
    const btnSubmit2 = document.getElementById('btn_submit_artists');
    const btnSubmit3 = document.getElementById('btn_submit_playlists')

    btnSubmit.addEventListener('click', async () => {
        
        // Extract the emotion from the HTML
        const emotion = expressionOutput.innerText.trim();

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

    btnSubmit2.addEventListener('click', async () => {
        // Extract the emotion from the HTML
        const emotion = expressionOutput.innerText.trim();

        // Get the Spotify token
        const token = await APIController.getToken();

        // Get track recommendations based on the emotion
        const artists = await APIController.getArtists(token, emotion);

        //Clear previous results
        songList.innerHTML = '';

        //Populate artist list with new results
        artists.forEach(artist => {
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.href = artist.external_urls.spotify;
            listItem.target = '_blank';
            const genres = artist.genres.slice(0, 3).join(', ');
            listItem.innerText = `${artist.name} - ${genres}`;
            songList.appendChild(listItem);
        });
    });

    btnSubmit3.addEventListener('click', async () => {
        const emotion = expressionOutput.innerText.trim();

        // Get the Spotify token
        const token = await APIController.getToken();

        // Get track recommendations based on the emotion
        const playlists = await APIController.getPlaylists(token, emotion);

        //Clear previous results
        songList.innerHTML = '';

        playlists.forEach(playlist => {
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.href = playlist.external_urls.spotify;
            listItem.target = '_blank';
            listItem.innerText = `${playlist.name} tracks`;
            songList.appendChild(listItem);
        });
    });
});

//TODO: Create buttons to switch between tracks and artists
// Make list of artists
