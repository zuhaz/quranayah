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
  const translationSelect = document.getElementById("translationSelect");
  const translationTitle = document.querySelector(
    ".ayah-container:nth-child(2) h3"
  );
  const copyVerseButton = document.querySelector(".copy-verse-button");

  // Audio variables
  let audioFileUrl;
  let ayahKey;

  // Event listeners
  randomVerseButton.addEventListener("click", getRandVerse);
  searchVerseButton.addEventListener("click", searchVerse);
  downloadButton.addEventListener("click", downloadAudio);
  playButton.addEventListener("click", togglePlay);
  translationSelect.addEventListener("change", updateTranslation);
  copyVerseButton.addEventListener("click", copyVerseText);

  // Initial function calls
  populateTranslationSelect().then(() => {
    getRandVerse();
  });

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
      fetchTranslation(`${surah}:${verse}`, translationSelect.value);
      newSections = [];
      getTafsirs(`${surah}:${verse}`);
      tafsirButton.disabled = false;
    } else {
      alert("Please enter a valid Surah and Verse Number (e.g., 2:256)");
    }
  }

  // Common function to fetch verse
  function fetchVerse(verseKey) {
    const base_url = `https://api.alquran.cloud/v1/ayah/${verseKey}/editions/quran-uthmani`;
    fetch(base_url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        displayVerse(data.data[0]);
        fetchTranslation(
          data.data[0].surah.number + ":" + data.data[0].numberInSurah,
          translationSelect.value
        );
        fetchVerseAudio(
          data.data[0].surah.number,
          data.data[0].numberInSurah,
          7
        );
        newSections = [];
        getTafsirs(
          `${data.data[0].surah.number}:${data.data[0].numberInSurah}`
        );
        tafsirButton.disabled = false;
        loadingIndicator.style.display = "none";
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch the verse. Please try again.");
        loadingIndicator.style.display = "none";
      });
  }

  // Display verse
  async function displayVerse(arabicData) {
    arabicVerse.textContent = arabicData.text;
    document.querySelector(
      ".surah-info"
    ).textContent = `${arabicData.surah.name} (${arabicData.surah.number}):${arabicData.numberInSurah}`;
    document.querySelector(".english-name").textContent =
      arabicData.surah.englishName;
    document.querySelector(".relevation-type").textContent =
      arabicData.surah.revelationType;
    document.querySelector(".is-sajda").textContent = arabicData.sajda
      ? "Yes"
      : "No";
    document.querySelector(".juz-info").textContent = arabicData.juz;
    document.querySelector(".manzil-info").textContent = arabicData.manzil;
    document.querySelector(".page-info").textContent = arabicData.page;
    document.querySelector(".ruku-info").textContent = arabicData.ruku;
    document.querySelector(".hizb-info").textContent = arabicData.hizbQuarter;
    document.querySelector(
      ".accordion-title"
    ).textContent = `Tafsir for ${arabicData.surah.name}, Verse: ${arabicData.numberInSurah}`;
    document.querySelector(".ayah-number").textContent = arabicData.number;
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
  const closeAccordionButton = document.getElementById("closeAccordion");

  // Ensure accordion is hidden on page load
  accordion.classList.add("hidden");
  overlay.classList.add("hidden");

  tafsirButton.addEventListener("click", function () {
    accordion.classList.remove("hidden");
    overlay.classList.remove("hidden");
    const currentVerseKey = surahInfo.textContent.match(
      /Surah: .+ \((\d+)\), Verse: (\d+)/
    );
    if (currentVerseKey) {
      const verseKey = `${currentVerseKey[1]}:${currentVerseKey[2]}`;
      getTafsirs(verseKey);
    }
  });

  closeAccordionButton.addEventListener("click", function () {
    accordion.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", function () {
    accordion.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  // Modify the getTafsirs function
  function getTafsirs(ayahKey) {
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

    tafsirs.forEach((tafsir) => {
      if (!languageMap.hasOwnProperty(tafsir.language)) {
        languageMap[tafsir.language] = {
          title: tafsir.language,
          tafsirs: [],
        };
      }
      languageMap[tafsir.language].tafsirs.push({
        title: tafsir.title,
        content: tafsir.content,
      });
    });

    // Function to parse HTML content
    function parseHTML(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    }

    // Iterate over languages and append them to the accordion container
    Object.keys(languageMap).forEach((language, index) => {
      const languageSection = document.createElement("div");
      languageSection.classList.add("mb-4");

      const languageButton = document.createElement("button");
      languageButton.classList.add("accordion-button");
      languageButton.innerHTML = `
        <span>${language}</span>
        <svg class="accordion-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      `;
      languageButton.setAttribute("aria-expanded", "false");

      const languageContent = document.createElement("div");
      languageContent.classList.add("accordion-content", "hidden");

      // Create a list for sub-books
      const subBookList = document.createElement("ul");
      subBookList.classList.add("sub-book-list");

      languageMap[language].tafsirs.forEach((tafsir, subIndex) => {
        const listItem = document.createElement("li");
        const subBookButton = document.createElement("button");
        subBookButton.classList.add("sub-book-button");
        subBookButton.textContent = tafsir.title;

        const tafsirContent = document.createElement("pre");
        tafsirContent.classList.add("tafsir-content", "hidden");

        const parsedContent = parseHTML(tafsir.content);
        tafsirContent.textContent =
          parsedContent !== ""
            ? parsedContent
            : `${tafsir.title} is not available for the current verse.`;

        subBookButton.addEventListener("click", function () {
          // Toggle visibility of tafsir content
          tafsirContent.classList.toggle("hidden");
          // Toggle active state of button
          this.classList.toggle("active");
        });

        listItem.appendChild(subBookButton);
        listItem.appendChild(tafsirContent);
        subBookList.appendChild(listItem);
      });

      languageContent.appendChild(subBookList);
      languageSection.appendChild(languageButton);
      languageSection.appendChild(languageContent);
      accordionContainer.appendChild(languageSection);

      // Add click event listener to language button
      languageButton.addEventListener("click", function () {
        const isExpanded = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", !isExpanded);
        languageContent.classList.toggle("hidden");
      });
    });

    // Add click event listener to close button
    const closeAccordionButton = document.getElementById("closeAccordion");
    closeAccordionButton.addEventListener("click", function () {
      accordion.classList.add("hidden");
      overlay.classList.add("hidden");
    });

    // Add click event listener to overlay
    overlay.addEventListener("click", function () {
      accordion.classList.add("hidden");
      overlay.classList.add("hidden");
    });
  }

  // New function to populate the translation select dropdown
  function populateTranslationSelect() {
    return fetch("https://api.quran.com/api/v4/resources/translations")
      .then((response) => response.json())
      .then((data) => {
        data.translations.forEach((translation) => {
          const option = document.createElement("option");
          option.value = translation.id;
          option.textContent =
            translation.language_name.charAt(0).toUpperCase() +
            translation.language_name.slice(1) +
            " (" +
            translation.name +
            ")";
          option.dataset.language = translation.language_name;
          translationSelect.appendChild(option);
        });

        const defaultTranslationId = "95";

        if (
          data.translations.some(
            (t) => t.id.toString() === defaultTranslationId
          )
        ) {
          translationSelect.value = defaultTranslationId;
        } else {
          console.warn(
            `Default translation ID ${defaultTranslationId} not found. Using first available translation.`
          );
          translationSelect.value = data.translations[0].id;
        }

        updateTranslationTitle();
      })
      .catch((error) => console.error("Error fetching translations:", error));
  }

  function updateTranslationTitle() {
    const selectedOption =
      translationSelect.options[translationSelect.selectedIndex];
    const language = selectedOption.dataset.language;
    translationTitle.textContent = `${
      language.charAt(0).toUpperCase() + language.slice(1)
    } Translation`;
  }

  // New function to fetch translation
  function fetchTranslation(verseKey, translationId) {
    const url = `https://api.quran.com/api/v4/quran/translations/${translationId}?verse_key=${verseKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const translation = data.translations[0];
        englishVerse.innerHTML = parseTranslationHTML(translation.text);
      })
      .catch((error) => {
        console.error("Error fetching translation:", error);
      });
  }

  function parseTranslationHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Replace <sup> elements with superscript Unicode characters
    doc.querySelectorAll("sup").forEach((sup) => {
      sup.replaceWith(toSuperscript(sup.textContent));
    });

    // Replace <sub> elements with subscript Unicode characters
    doc.querySelectorAll("sub").forEach((sub) => {
      sub.replaceWith(toSubscript(sub.textContent));
    });

    return doc.body.innerHTML;
  }

  function toSuperscript(str) {
    const superscriptMap = {
      0: "⁰",
      1: "¹",
      2: "²",
      3: "³",
      4: "⁴",
      5: "⁵",
      6: "⁶",
      7: "⁷",
      8: "⁸",
      9: "⁹",
      "+": "⁺",
      "-": "⁻",
      "=": "⁼",
      "(": "⁽",
      ")": "⁾",
      n: "ⁿ",
      i: "ⁱ",
    };
    return str
      .split("")
      .map((char) => superscriptMap[char] || char)
      .join("");
  }

  function toSubscript(str) {
    const subscriptMap = {
      0: "₀",
      1: "₁",
      2: "₂",
      3: "₃",
      4: "₄",
      5: "₅",
      6: "₆",
      7: "₇",
      8: "₈",
      9: "₉",
      "+": "₊",
      "-": "₋",
      "=": "₌",
      "(": "₍",
      ")": "₎",
      a: "ₐ",
      e: "ₑ",
      o: "ₒ",
      x: "ₓ",
      h: "ₕ",
      k: "ₖ",
      l: "ₗ",
      m: "ₘ",
      n: "ₙ",
      p: "ₚ",
      s: "ₛ",
      t: "ₜ",
    };
    return str
      .split("")
      .map((char) => subscriptMap[char] || char)
      .join("");
  }

  function updateTranslation() {
    updateTranslationTitle();
    const currentVerseKey = surahInfo.textContent.match(/\((\d+)\):(\d+)/);
    if (currentVerseKey) {
      const verseKey = `${currentVerseKey[1]}:${currentVerseKey[2]}`;
      fetchTranslation(verseKey, translationSelect.value);
    }
  }

  function copyVerseText() {
    const arabicText = arabicVerse.textContent.trim();
    const englishText = englishVerse.textContent.trim();
    const surahAyahInfo = surahInfo.textContent.match(
      /Surah: .+ \((\d+)\), Verse: (\d+)/
    );
    const surahAyah = surahAyahInfo
      ? `(${surahAyahInfo[1]}:${surahAyahInfo[2]})`
      : "";

    const textToCopy = `    ${arabicText}\n\n${englishText} ${surahAyah}`;

    navigator.clipboard.writeText(textToCopy).then(
      function () {
        alert("Verse copied to clipboard!");
      },
      function (err) {
        console.error("Could not copy text: ", err);
      }
    );
  }
  copyVerseButton.addEventListener("click", copyVerseText);
});
