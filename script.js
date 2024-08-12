document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const randomVerseButton = document.querySelector(".get-random-verse");
  const searchVerseButton = document.querySelector(".search-verse-button");
  const searchVerseInput = document.querySelector(".search-verse");
  const arabicVerse = document.querySelector(".arabic-verse");
  const englishVerse = document.querySelector(".english-verse");
  const surahInfo = document.querySelector(".surah-info");
  const verseAudio = document.querySelector(".verse-audio");
  const loadingIndicator = document.querySelector(".loading-indicator");
  const downloadButton = document.querySelector(".download-verse-button");
  const playButton = document.querySelector(".play-button");

  // Audio variables
  let audioFileUrl;
  let ayahKey;

  // Event listeners
  randomVerseButton.addEventListener("click", getRandVerse);
  searchVerseButton.addEventListener("click", searchVerse);
  downloadButton.addEventListener("click", downloadAudio);
  playButton.addEventListener("click", togglePlay);

  // Initial function calls
  getRandVerse();

  // Fetch random verse
  function getRandVerse() {
    loadingIndicator.style.display = "block";
    const randomAyah = Math.floor(Math.random() * 6237 + 1);
    fetchVerse(randomAyah);
  }

  // Fetch verse by surah and verse number
  function searchVerse() {
    const searchQuery = searchVerseInput.value.trim().split(":");
    if (searchQuery.length === 2) {
      const surah = searchQuery[0];
      const verse = searchQuery[1];
      loadingIndicator.style.display = "block";
      fetchVerse(`${surah}:${verse}`);
      newSections = [];
      getTafsirs(`${surah}:${verse}`);
      tafsirButton.disabled = false;
    } else {
      alert("Please enter a valid Surah and Verse Number (e.g., 2:256)");
    }
  }

  // Common function to fetch verse
  function fetchVerse(verseKey) {
    const base_url = `https://api.alquran.cloud/v1/ayah/${verseKey}/editions/quran-uthmani,en.sarwar`;
    fetch(base_url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        displayVerse(data.data[0], data.data[1]);

        fetchVerseAudio(
          data.data[0].surah.number,
          data.data[0].numberInSurah,
          7
        );
        loadingIndicator.style.display = "none";
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch the verse. Please try again.");
        loadingIndicator.style.display = "none";
      });
  }

  // Display verse
  async function displayVerse(arabicData, englishData) {
    arabicVerse.textContent = arabicData.text;
    englishVerse.textContent = englishData.text;
    surahInfo.textContent = `Surah: ${arabicData.surah.name} (${arabicData.surah.number}), Verse: ${arabicData.numberInSurah}`;
    document.querySelector(
      ".english-name"
    ).textContent = `English Name: ${arabicData.surah.englishName}`;
    document.querySelector(
      ".relevation-type"
    ).textContent = `Relevation Type: ${arabicData.surah.revelationType}`;
    document.querySelector(".is-sajda").textContent = `Sajda: ${
      arabicData.sajda ? "Yes" : "No"
    }`;
    document.querySelector(".juz-info").textContent = `Juz: ${arabicData.juz}`;
    document.querySelector(
      ".manzil-info"
    ).textContent = `Manzil: ${arabicData.manzil}`;
    document.querySelector(
      ".page-info"
    ).textContent = `Page: ${arabicData.page}`;
    document.querySelector(
      ".ruku-info"
    ).textContent = `Ruku: ${arabicData.ruku}`;
    document.querySelector(
      ".hizb-info"
    ).textContent = `Hizb Quarter: ${arabicData.hizbQuarter}`;
    document.querySelector(
      ".accordion-title"
    ).textContent = `Tafsir for ${arabicData.surah.name}, Verse: ${arabicData.numberInSurah}`;
    newSections = [];
    getTafsirs(`${arabicData.surah.number}:${arabicData.numberInSurah}`);
    tafsirButton.disabled = false;
  }

  // Fetch audio for verse
  function fetchVerseAudio(chapterId, verseNumber, recitationId) {
    ayahKey = `${chapterId}:${verseNumber}`;
    const audioBaseUrl = "https://verses.quran.com/";
    const audioUrl = `https://api.quran.com/api/v4/recitations/${recitationId}/by_ayah/${ayahKey}`;
    fetch(audioUrl, { method: "GET", headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        audioFileUrl = audioBaseUrl + data.audio_files[0].url;
        console.log(data.audio_files[0].url);
        verseAudio.src = audioFileUrl;
        verseAudio.play().then(() => {
          playButton.innerHTML = "Pause Audio";
        });
      })
      .catch((error) => {
        console.error("Error fetching audio:", error);
        alert("Failed to fetch the audio. Please try again.");
      });
  }

  // Download audio
  async function downloadAudio() {
    if (!audioFileUrl) return;

    fetch(audioFileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quran_${ayahKey}.mp3`;
        link.click();
        link.remove();
      })
      .catch((error) => console.error("Error fetching the file:", error));
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
  const tafsirButton = document.getElementById("tafsirButton");
  const accordion = document.getElementById("accordion-open");
  const overlay = document.getElementById("overlay");

  tafsirButton.addEventListener("click", function () {
    accordion.classList.toggle("show");
    overlay.classList.toggle("show");
    document.getElementById("accordion-open").classList.toggle("show");
    // Toggle the 'show' class for the accordion body
    const accordionBodies = document.querySelectorAll(".accordion-body");
    accordionBodies.forEach((body) => {
      body.classList.toggle("show");
    });
  });

  async function getTafsirs(ayahKey) {
    const languages = [
      { code: "en", name: "English", url: "en-tafisr-ibn-kathir" },
      { code: "en", name: "English", url: "en-tafsir-maarif-ul-quran" },
      { code: "en", name: "English", url: "tazkirul-quran-en" },
      { code: "ur", name: "Urdu", url: "tafsir-fe-zalul-quran-syed-qatab" },
      { code: "ur", name: "Urdu", url: "tafseer-ibn-e-kaseer-urdu" },
      { code: "ur", name: "Urdu", url: "tazkiru-quran-ur" },
      { code: "ur", name: "Urdu", url: "tafsir-bayan-ul-quran" },
      { code: "ar", name: "Arabic", url: "ar-tafsir-muyassar" },
      { code: "ar", name: "Arabic", url: "ar-tafsir-al-wasit" },
      { code: "ar", name: "Arabic", url: "ar-tafsir-ibn-kathir" },
      { code: "ar", name: "Arabic", url: "ar-tafsir-al-tabari" },
      { code: "ar", name: "Arabic", url: "ar-tafseer-al-qurtubi" },
      { code: "ar", name: "Arabic", url: "ar-tafseer-al-saddi" },
      { code: "ar", name: "Arabic", url: "ar-tafsir-al-baghawi" },
      { code: "bn", name: "Bengali", url: "tafisr-fathul-majid-bn" },
      { code: "bn", name: "Bengali", url: "bn-tafsir-ahsanul-bayaan" },
      { code: "bn", name: "Bengali", url: "bn-tafsir-abu-bakr-zakaria" },
      { code: "bn", name: "Bengali", url: "bn-tafseer-ibn-e-kaseer" },
      { code: "ru", name: "Russian", url: "ru-tafseer-al-saddi" },
      { code: "kurd", name: "Kurdish", url: "kurd-tafsir-rebar" },
    ];

    const promises = languages.map((language, index) => {
      return fetch(
        `https://api.qurancdn.com/api/qdc/tafsirs/${language.url}/by_ayah/${ayahKey}`,
        {
          headers: {
            "sec-ch-ua":
              '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            "sec-ch-ua-mobile": "?0",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "sec-ch-ua-platform": '"Windows"',
            accept: "*/*",
            "sec-gpc": "1",
            "accept-language": "en-US,en;q=0.6",
            origin: "https://quran.com",
            "sec-fetch-site": "cross-site",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            referer: "https://quran.com/",
          },
        }
      ).then((response) => {
        if (!response.ok) {
          throw new Error(`Network response for ${language.name} was not ok`);
        }
        return response.json();
      });
    });

    Promise.all(promises)
      .then((dataArr) => {
        const tafsirs = dataArr.map((data, index) => {
          const tafsirText = data.tafsir.text;
          const tafsirTitle = data.tafsir.resource_name;
          return {
            language: languages[index].name,
            title: tafsirTitle,
            content: tafsirText,
          };
        });

        displayTafsirs(tafsirs);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  function displayTafsirs(tafsirs) {
    const accordionContainer = document.getElementById(
      "accordion-nested-parent"
    );
    if (!accordionContainer) {
      console.error("Accordion container not found.");
      return;
    }

    // Clear previous content
    accordionContainer.innerHTML = "";

    // Store languages and their tafsirs
    const languageMap = {};

    tafsirs.forEach((tafsir, index) => {
      // Check if the language already exists in the map
      if (!languageMap.hasOwnProperty(tafsir.language)) {
        // If not, create a new entry for the language
        languageMap[tafsir.language] = {
          title: tafsir.language,
          tafsirs: [],
        };
      }

      // Append tafsir to existing language entry
      languageMap[tafsir.language].tafsirs.push({
        title: tafsir.title,
        content: tafsir.content,
      });
    });

    // Iterate over languages and append them to the accordion container
    Object.keys(languageMap).forEach((language, index) => {
      // Inside the displayTafsirs function, where languageHeading is created
      const languageHeading = document.createElement("h2");
      languageHeading.id = `accordion-collapse-heading-${index + 1}`;
      languageHeading.classList.add("readable-title"); // Add the 'readable-title' class here
      languageHeading.innerHTML = `
          <button type="button" class="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-collapse-body-${
            index + 1
          }" aria-expanded="false" aria-controls="accordion-collapse-body-${
        index + 1
      }">
              <span>${language}</span>
              <svg data-accordion-icon class="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
              </svg>
          </button>
      `;

      const content = document.createElement("div");
      content.id = `accordion-collapse-body-${index + 1}`;
      content.classList.add("hidden");
      content.setAttribute(
        "aria-labelledby",
        `accordion-collapse-heading-${index + 1}`
      );

      // Create nested accordion for tafsirs
      const nestedAccordion = document.createElement("div");
      nestedAccordion.id = `accordion-nested-collapse-${index + 1}`;
      nestedAccordion.setAttribute("data-accordion", "collapse");

      // Append tafsir headings to nested accordion
      languageMap[language].tafsirs.forEach((tafsir, tafsirIndex) => {
        // Inside the displayTafsirs function, where tafsirHeading is created
        const tafsirHeading = document.createElement("h3");
        tafsirHeading.id = `tafsir-heading-${index + 1}-${tafsirIndex + 1}`;
        tafsirHeading.classList.add("readable-title"); // Add the 'readable-title' class here
        tafsirHeading.innerHTML = `
              <button type="button" class="flex items-center justify-between w-full p-3 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#tafsir-body-${
                index + 1
              }-${
          tafsirIndex + 1
        }" aria-expanded="false" aria-controls="tafsir-body-${index + 1}-${
          tafsirIndex + 1
        }">
                  <span>${tafsir.title}</span>
                  <svg data-accordion-icon class="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
                  </svg>
              </button>
          `;

        // Inside the displayTafsirs function, where tafsirContent is created
        const tafsirContent = document.createElement("div");
        tafsirContent.id = `tafsir-body-${index + 1}-${tafsirIndex + 1}`;
        tafsirContent.classList.add("hidden", "larger-font"); // Add the 'larger-font' class here
        tafsirContent.innerHTML = `
              <div class="p-3 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                  <p class="mb-2 text-white-700 dark:text-white-700">${
                    tafsir.content !== ""
                      ? tafsir.content
                      : `${tafsir.title} is not available for the current verse.`
                  }</p>
              </div>
          `;

        nestedAccordion.appendChild(tafsirHeading);
        nestedAccordion.appendChild(tafsirContent);
      });

      content.appendChild(nestedAccordion);

      accordionContainer.appendChild(languageHeading);
      accordionContainer.appendChild(content);
    });

    // Add click event listener to each language button for accordion behavior
    const accordionButtons = document.querySelectorAll(
      "[data-accordion-target]"
    );
    accordionButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const targetId = this.getAttribute("data-accordion-target");
        const targetElement = document.querySelector(targetId);
        const isExpanded = this.getAttribute("aria-expanded") === "true";

        targetElement.classList.toggle("hidden");
        this.setAttribute("aria-expanded", !isExpanded);
        this.querySelector("[data-accordion-icon]").classList.toggle(
          "rotate-180"
        );
      });
    });

    // Add click event listener to the tafsir button
    const tafsirButton = document.getElementById("tafsirButton");
    tafsirButton.addEventListener("click", function () {
      accordion.classList.remove("hidden");
      overlay.classList.remove("hidden");
      // Toggle the 'show' class for the accordion body
      const accordionBodies = document.querySelectorAll(".accordion-body");
      accordionBodies.forEach((body) => {
        body.classList.remove("hidden");
      });
    });

    // const tafsirButton = document.getElementById("tafsirButton");
    const accordion = document.getElementById("accordion-open");

    const emojiSpans = document.querySelectorAll(".emoji");
    emojiSpans.forEach((span) => {
      span.remove();
    });
    const closeAccordionButton = document.getElementById("closeAccordion");

    closeAccordionButton.addEventListener("click", function () {
      accordion.classList.add("hidden");
      overlay.classList.add("hidden");
    });
    overlay.addEventListener("click", function () {
      accordion.classList.add("hidden");
      overlay.classList.add("hidden");
    });
  }
});
