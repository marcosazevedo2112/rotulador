let sentences;
let labels;
const sampleSize = 5;
let result = [];
let currentId = 1;
let fileUploaderEl = document.querySelector("#uploader");
fileUploaderEl.addEventListener("change", loadSentences);
let fileDownloaderEl = document.querySelector("#download-results");


function loadSentences() {
  file = document.querySelector('#uploader').files[0]
  reader = new FileReader();
  reader.onload = function () {
    let input = JSON.parse(this.result);
    sentences = input.sentences;
    labels = input.labels;
    loadInstructions();
    fileDownloaderEl.disabled = true;
    fillResultsArray();
    if (localStorage.getItem("result") != null) {
      result = JSON.parse(localStorage.getItem("result"));
    }
    buildPage();
  }
  reader.readAsText(file);
}

function fillResultsArray() {
  for (let i = 0; i < sentences.length; i++) {
    result[i] = {
      "id": i,
      "idxAlvo": sentences[i].idxAlvo,
      "verified": false,
      "relevance": []
    }

    for (let j = 0; j < sentences[i].sentence.length; j++) {
      result[i].relevance[j] = false;
    }
    result[i].relevance[sentences[i].idxAlvo] = true;
  }
}

function next5() {
  currentId += sampleSize;

  buildPage();
}

function prev5() {
  currentId -= sampleSize;

  buildPage();
}

function createNavigator() {
  let pageEl = document.createElement("div");
  pageEl.classList.add("paginacao");

  let leftBtnEl = document.createElement("button");
  let rightBtnEl = document.createElement("button");

  leftBtnEl.classList.add("btn");
  leftBtnEl.classList.add("btn-light");
  rightBtnEl.classList.add("btn");
  rightBtnEl.classList.add("btn-light");

  if (currentId + 5 < sentences.length) {
    rightBtnEl.addEventListener("click", next5);
  }
  if (currentId - 5 > 0) {
    leftBtnEl.addEventListener("click", prev5);
  }

  let rightIconEl = document.createElement("i");
  let leftIconEl = document.createElement("i");

  rightIconEl.classList.add("gg-arrow-right");
  leftIconEl.classList.add("gg-arrow-left");

  let idSentenceEl = document.createElement("span");

  if (currentId + 4 < sentences.length) {
    idSentenceEl.innerHTML = `Sentences ${currentId}-${currentId + 4} of ${sentences.length}`;
  }
  else {
    idSentenceEl.innerHTML = `Sentences ${currentId}-${sentences.length} of ${sentences.length}`;
  }

  rightBtnEl.appendChild(rightIconEl);
  leftBtnEl.appendChild(leftIconEl);

  pageEl.appendChild(leftBtnEl);
  pageEl.appendChild(idSentenceEl);
  pageEl.appendChild(rightBtnEl);

  return pageEl;
}

function buildPage() {
  let containerEl = document.querySelector("#container-sentences");
  containerEl.innerHTML = "";
  let navTopEl = createNavigator();
  let navBottomEl = createNavigator();

  let sentencesEl = drawSentences();

  containerEl.appendChild(navTopEl);
  containerEl.appendChild(sentencesEl);
  containerEl.appendChild(navBottomEl);
}

function drawSentences() {
  let sentencesEl = document.createElement("div");
  sentencesEl.classList.add("sentences");
  for (let id = currentId; id < sampleSize + currentId && id <= sentences.length; id++) {
    let currentSentence = sentences[id - 1];
    let articleEl = document.createElement("article");
    let divInfoEl = document.createElement("div");
    let divTargetsEl = document.createElement("div");
    let divWordsEl = document.createElement("div");

    divWordsEl.classList.add("palavras")
    divInfoEl.innerHTML = `<b>${currentSentence.id}</b>.`
    if (id < 5) {
      divInfoEl.innerHTML += ` The words that somehow contribute to classify
                            <b>${currentSentence.sentence[currentSentence.idxAlvo]}</b> as
                            <b>${currentSentence.predictClass}</b> are:`;
    }

    divTargetsEl.innerHTML = `<b>Target word: </b>${currentSentence.sentence[currentSentence.idxAlvo]}<br>
                              <b>PredictedClass: </b>${currentSentence.predictClass}`;
    divTargetsEl.setAttribute("title", currentSentence.predictClass + " | " + labels.find(element => element.name == currentSentence.predictClass).description);

    for (let j = 0; j < currentSentence.sentence.length; j++) {
      const word = currentSentence.sentence[j];
      let skipable = ["(", ")", ":", ";", "_", "/", "\\", "[", "]", "{", "}", "+", "=", "*", "&", "^", "%", "$", "#", "~", "`", "|", "<", ">"];
      if (word.trim() == "") {
        continue;
      }
      let wordEl = document.createElement("span");
      let wordRaw = document.createElement("span");
      let input = document.createElement("input");


      input.addEventListener("click", () => {
        updateArray(id, j);
      });

      wordEl.classList.add("palavra");
      wordRaw.innerText = word;

      input.setAttribute("type", "checkbox");

      input.checked = result[id - 1].relevance[j];

      if (word == currentSentence.sentence[currentSentence.idxAlvo]) {
        wordEl.classList.add("alvo");
        wordEl.setAttribute("title", currentSentence.predictClass + " | " + labels.find(element => element.name == currentSentence.predictClass).description);
        input.classList.add("hidden");
      }

      wordEl.appendChild(wordRaw);
      if (!skipable.includes(word)) {
        wordEl.appendChild(input);
      }
      divWordsEl.appendChild(wordEl);
    }

    let verifiedEl = document.createElement("span");
    let verifiedRaw = document.createElement("span");
    let verifiedInput = document.createElement("input");
    
    verifiedEl.classList.add("none");
    verifiedRaw.innerText = "NONE";
    verifiedInput.setAttribute("type", "checkbox");
    verifiedInput.checked = result[id - 1].verified;
    
    verifiedInput.addEventListener("click", () => {
      result[id - 1].verified = verifiedInput.checked;
      for (let l = 0; l < result[id - 1].relevance.length; l++) {
        result[id - 1].relevance[l] = false;
      }

      localStorage.setItem("result", JSON.stringify(result));
    });
    verifiedEl.appendChild(verifiedRaw);
    verifiedEl.appendChild(verifiedInput);
    divWordsEl.appendChild(verifiedEl);
    
    articleEl.appendChild(divInfoEl);
    articleEl.appendChild(divTargetsEl)
    articleEl.appendChild(divWordsEl);
    sentencesEl.appendChild(articleEl);
  }
  return sentencesEl;

}

function updateArray(id, j,) {
  result[id - 1].relevance[j] = !result[id - 1].relevance[j];
  result[id - 1].verified = true;
  localStorage.setItem("result", JSON.stringify(result));
  fileDownloaderEl.disabled = false;
}

fileDownloaderEl.addEventListener("click", downloadJSON);

function downloadJSON() {
  let jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result));
  let link = document.createElement("a");
  link.setAttribute("href", jsonContent);
  link.setAttribute("download", "relatorio.json");
  document.body.appendChild(link);
  link.click();
}

function loadInstructions() {
  let instructionsEl = document.querySelector(".modal-body");
  instructionsEl.innerHTML = "";
  let pInfo = document.createElement("p");
  pInfo.innerText = `You must mark the words that contribute to 
    labeling the target word. Possible classifications 
    are listed below along with their description.`;
  instructionsEl.appendChild(pInfo);
  labels.forEach(element => {
    let pLabels = document.createElement("p");
    pLabels.innerText = `${element.name}: ${element.description}`;
    instructionsEl.appendChild(pLabels);
  });
}