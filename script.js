document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const randomVerseButton = document.querySelector('.get-random-verse');
    const searchVerseButton = document.querySelector('.search-verse-button');
    const searchVerseInput = document.querySelector('.search-verse');
    const arabicVerse = document.querySelector('.arabic-verse');
    const englishVerse = document.querySelector('.english-verse');
    const surahInfo = document.querySelector('.surah-info');
    const verseAudio = document.querySelector('.verse-audio');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const downloadButton = document.querySelector(".download-verse-button");
    const playButton = document.querySelector('.play-button');
    
    // Audio variables
    let audioFileUrl;
    let ayahKey;

    // Event listeners
    randomVerseButton.addEventListener('click', getRandVerse);
    searchVerseButton.addEventListener('click', searchVerse);
    downloadButton.addEventListener('click', downloadAudio);
    playButton.addEventListener('click', togglePlay);

    // Initial function calls
    getRandVerse();

    // Fetch random verse
    function getRandVerse() {
        loadingIndicator.style.display = 'block';
        const randomAyah = Math.floor(Math.random() * 6237 + 1);
        fetchVerse(randomAyah);
    }

    // Fetch verse by surah and verse number
    function searchVerse() {
        const searchQuery = searchVerseInput.value.trim().split(':');
        if (searchQuery.length === 2) {
            const surah = searchQuery[0];
            const verse = searchQuery[1];
            loadingIndicator.style.display = 'block';
            fetchVerse(`${surah}:${verse}`);
        } else {
            alert('Please enter a valid Surah and Verse Number (e.g., 2:256)');
        }
    }

    // Common function to fetch verse
    function fetchVerse(verseKey) {
        const base_url = `https://api.alquran.cloud/v1/ayah/${verseKey}/editions/quran-uthmani,en.pickthall`;
        fetch(base_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayVerse(data.data[0], data.data[1]);
                fetchVerseAudio(data.data[0].surah.number, data.data[0].numberInSurah, 7);
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch the verse. Please try again.');
                loadingIndicator.style.display = 'none';
            });
    }

    // Display verse
    function displayVerse(arabicData, englishData) {
        arabicVerse.textContent = arabicData.text;
        englishVerse.textContent = englishData.text;
        surahInfo.textContent = `Surah: ${arabicData.surah.name} (${arabicData.surah.number}), Verse: ${arabicData.numberInSurah}`;
        document.querySelector('.english-name').textContent = `English Name: ${arabicData.surah.englishName}`;
        document.querySelector('.relevation-type').textContent = `Relevation Type: ${arabicData.surah.revelationType}`;
        document.querySelector('.is-sajda').textContent = `Sajda: ${arabicData.sajda === true ? "Yes" : "No"}`;
        document.querySelector('.juz-info').textContent = `Juz: ${arabicData.juz}`;
        document.querySelector('.manzil-info').textContent = `Manzil: ${arabicData.manzil}`;
        document.querySelector('.page-info').textContent = `Page: ${arabicData.page}`;
        document.querySelector('.ruku-info').textContent = `Ruku: ${arabicData.ruku}`;
        document.querySelector('.hizb-info').textContent = `Hizb Quarter: ${arabicData.hizbQuarter}`;
    }

    // Fetch audio for verse
    function fetchVerseAudio(chapterId, verseNumber, recitationId) {
        ayahKey = `${chapterId}:${verseNumber}`;
        const audioBaseUrl = "https://verses.quran.com/";
        const audioUrl = `https://api.quran.com/api/v4/recitations/${recitationId}/by_ayah/${ayahKey}`;
        fetch(audioUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                audioFileUrl = audioBaseUrl + data.audio_files[0].url;
                verseAudio.src = audioFileUrl;
                verseAudio.play();
            })
            .catch(error => {
                console.error('Error fetching audio:', error);
                alert('Failed to fetch the audio. Please try again.');
            });
    }

    // Download audio
    async function downloadAudio() {
        if (!audioFileUrl) return;

        fetch(audioFileUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `Quran_${ayahKey}.mp3`;
                link.click();
                link.remove();
            })
            .catch(error => console.error('Error fetching the file:', error));
    }

    // Toggle play/pause
    function togglePlay() {
        if (verseAudio.paused) {
            verseAudio.play();
            playButton.innerHTML = "Pause Audio";
        } else {
            verseAudio.pause();
            playButton.innerHTML = "Play Audio";
        }
    }
});
