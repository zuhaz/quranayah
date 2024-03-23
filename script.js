document.addEventListener('DOMContentLoaded', function () {
    const randomVerseButton = document.querySelector('.get-random-verse');
    const searchVerseButton = document.querySelector('.search-verse-button');
    const searchVerseInput = document.querySelector('.search-verse');
    const arabicVerse = document.querySelector('.arabic-verse');
    const englishVerse = document.querySelector('.english-verse');
    const surahInfo = document.querySelector('.surah-info');
    const verseAudio = document.querySelector('.verse-audio');
    const loadingIndicator = document.querySelector('.loading-indicator');

    getRandVerse();
    randomVerseButton.addEventListener('click', function () {
        loadingIndicator.style.display = 'block';
        getRandVerse();
    });

    searchVerseButton.addEventListener('click', function () {
        const searchQuery = searchVerseInput.value.trim().split(':');
        if (searchQuery.length === 2) {
            loadingIndicator.style.display = 'block';
            getVerseBySurahAndVerse(searchQuery[0], searchQuery[1]);
        } else {
            alert('Please enter a valid Surah and Verse Number (e.g., 2:256)');
        }
    });
    function getRandVerse() {
        const randomAyah = Math.floor(Math.random() * 6237 + 1);
        const base_url = `https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,en.pickthall`;

        fetch(base_url)
            .then(response => response.json())
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

    function getVerseBySurahAndVerse(surah, verse) {
        const base_url = `https://api.alquran.cloud/v1/ayah/${surah}:${verse}/editions/quran-uthmani,en.pickthall`;

        fetch(base_url)
            .then(response => response.json())
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

    function displayVerse(arabicData, englishData) {
        arabicVerse.textContent = arabicData.text;
        englishVerse.textContent = englishData.text;
        document.querySelector('.juz-info').textContent = `Juz: ${arabicData.juz}`;
        document.querySelector('.manzil-info').textContent = `Manzil: ${arabicData.manzil}`;
        document.querySelector('.page-info').textContent = `Page: ${arabicData.page}`;
        document.querySelector('.ruku-info').textContent = `Ruku: ${arabicData.ruku}`;
        document.querySelector('.hizb-info').textContent = `Hizb Quarter: ${arabicData.hizbQuarter}`;
        surahInfo.textContent = `Surah: ${arabicData.surah.name} (${arabicData.surah.number}), Verse: ${arabicData.numberInSurah}`;
    }

    function fetchVerseAudio(chapterId, verseNumber, recitationId) {
        const ayahKey = `${chapterId}:${verseNumber}`;
        const audioUrl = `https://api.quran.com/api/v4/recitations/${recitationId}/by_ayah/${ayahKey}`;

        fetch(audioUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const audioBaseUrl = "https://verses.quran.com/"
                const audioFileUrl = audioBaseUrl + data.audio_files[0].url;
                verseAudio.src = audioFileUrl;
                verseAudio.play();
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching audio:', error);
                alert('Failed to fetch the audio. Please try again.');
                loadingIndicator.style.display = 'none';
            });
    }
    const playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', function () {
        verseAudio.play();
    });

});
