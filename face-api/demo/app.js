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
    
        const result = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=pop&target_valence=${attributes.valence}&target_energy=${attributes.energy}&limit=${24}`, {
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
        const result = await fetch(`https://api.spotify.com/v1/search?q=${emotion}&type=playlist&limit=24`, {
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
            const card = document.createElement('div');
            card.className = 'card';
        
            const cardImage = document.createElement('img');
            cardImage.src = track.album.images[0] ? track.album.images[0].url : 'default_image_url.jpg'; // Use a default image if no image is available
            cardImage.alt = track.name;
            card.appendChild(cardImage);
        
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            card.appendChild(cardBody);
        
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.innerText = track.name;
            cardBody.appendChild(cardTitle);
        
            const cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.innerText = track.artists[0].name;
            cardBody.appendChild(cardText);
        
            const cardLink = document.createElement('a');
            cardLink.className = 'btn btn-primary';
            cardLink.href = track.external_urls.spotify;
            cardLink.target = '_blank';
            cardLink.innerText = 'Listen on Spotify';
            cardBody.appendChild(cardLink);
        
            songList.appendChild(card);
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
        artists.slice(0, 18).forEach(artist => {
            const card = document.createElement('div');
            card.className = 'card';
        
            const cardImage = document.createElement('img');
            cardImage.src = artist.images[0] ? artist.images[0].url : 'default_image_url.jpg'; // Use a default image if no image is available
            cardImage.alt = artist.name;
            card.appendChild(cardImage);
        
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            card.appendChild(cardBody);
        
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.innerText = artist.name;
            cardBody.appendChild(cardTitle);
        
            const cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.innerText = `${artist.genres[0]}`;
            cardBody.appendChild(cardText);
        
            const cardLink = document.createElement('a');
            cardLink.className = 'btn btn-primary';
            cardLink.href = artist.external_urls.spotify;
            cardLink.target = '_blank';
            cardLink.innerText = 'Listen on Spotify';
            cardBody.appendChild(cardLink);
        
            songList.appendChild(card);
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
            const card = document.createElement('div');
            card.className = 'card';
        
            const cardImage = document.createElement('img');
            cardImage.src = playlist.images[0] ? playlist.images[0].url : 'default_image_url.jpg'; // Use a default image if no image is available
            cardImage.alt = playlist.name;
            card.appendChild(cardImage);
        
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            card.appendChild(cardBody);
        
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.innerText = playlist.name;
            cardBody.appendChild(cardTitle);
        
            const cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.innerText = `${playlist.tracks.total} tracks`;
            cardBody.appendChild(cardText);
        
            const cardLink = document.createElement('a');
            cardLink.className = 'btn btn-primary';
            cardLink.href = playlist.external_urls.spotify;
            cardLink.target = '_blank';
            cardLink.innerText = 'Listen on Spotify';
            cardBody.appendChild(cardLink);
        
            songList.appendChild(card);
        });
    });
});
