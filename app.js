let frases;
const tamanhoAmostra = 5;
let result = [];
let idAtual = 1;
let fileUploaderEl = document.querySelector("#uploader");
fileUploaderEl.addEventListener("change", carregarFrases);
let fileDownloaderEl = document.querySelector("#baixar-resultados");


function carregarFrases() {
  file = document.querySelector('#uploader').files[0]
  reader = new FileReader();
  reader.onload = function () {
    frases = JSON.parse(this.result);
    document.getElementById('baixar-resultados').disabled = true;
    preencheVetorResultado();
    if(localStorage.getItem("result") != null){
      result = JSON.parse(localStorage.getItem("result"));
    }
    montaPaginacao();
  }
  reader.readAsText(file);
}

function preencheVetorResultado(){
  for (let i = 0; i < frases.length; i++) {
    result[i] = {
      "id": i,
      "relevancia": [],
      "idxAlvo": frases[i].idxAlvo
    }
    for (let j = 0; j < frases[j].sentenca.length; j++) {
      result[i].relevancia[j] = false;
    }
    result[i].relevancia[frases[i].idxAlvo] = true;
    }
}

function prox5() {
  idAtual += tamanhoAmostra;

  montaPaginacao();
}

function ant5() {
  idAtual -= tamanhoAmostra;

  montaPaginacao();
}

function criaPaginacao() {
  let paginacaoEl = document.createElement("div");
  paginacaoEl.classList.add("paginacao");

  let botaoEsquerdaEl = document.createElement("button");
  let botaoDireitaEl = document.createElement("button");

  botaoEsquerdaEl.classList.add("btn");
  botaoEsquerdaEl.classList.add("btn-light");
  botaoDireitaEl.classList.add("btn");
  botaoDireitaEl.classList.add("btn-light");

  if (idAtual + 5 < frases.length) {
    botaoDireitaEl.addEventListener("click", prox5);
  }
  if (idAtual - 5 > 0) {
    botaoEsquerdaEl.addEventListener("click", ant5);
  }

  let iconeDireitaEl = document.createElement("i");
  let iconeEsquerdaEl = document.createElement("i");

  iconeDireitaEl.classList.add("gg-arrow-right");
  iconeEsquerdaEl.classList.add("gg-arrow-left");

  let indicesFrasesEl = document.createElement("span");

  if (idAtual + 4 < frases.length) {
    indicesFrasesEl.innerHTML = `Frases ${idAtual}-${idAtual + 4} de ${frases.length}`;
  }
  else {
    indicesFrasesEl.innerHTML = `Frases ${idAtual}-${frases.length} de ${frases.length}`;
  }

  botaoDireitaEl.appendChild(iconeDireitaEl);
  botaoEsquerdaEl.appendChild(iconeEsquerdaEl);

  paginacaoEl.appendChild(botaoEsquerdaEl);
  paginacaoEl.appendChild(indicesFrasesEl);
  paginacaoEl.appendChild(botaoDireitaEl);

  return paginacaoEl;
}

function montaPaginacao() {
  let containerEl = document.querySelector("#container-frases");
  containerEl.innerHTML = "";
  let paginacaoTopoEl = criaPaginacao();
  let paginacaoBottomEl = criaPaginacao();

  let frasesEl = desenhaFrases();

  containerEl.appendChild(paginacaoTopoEl);
  containerEl.appendChild(frasesEl);
  containerEl.appendChild(paginacaoBottomEl);
}

function desenhaFrases() {
  let frasesEl = document.createElement("div");
  frasesEl.classList.add("frases");
  for (let id = idAtual; id < tamanhoAmostra + idAtual && id <= frases.length; id++) {
    let fraseAtual = frases[id - 1];
    let articleEl = document.createElement("article");
    let spanIdEl = document.createElement("span");
    let divInfoEl = document.createElement("div");
    let divPalavrasEl = document.createElement("div");

    divPalavrasEl.classList.add("palavras")
    spanIdEl.classList.add("hidden");
    spanIdEl.innerText = fraseAtual.id;
    divInfoEl.innerText = `As palavras que classificam ${fraseAtual.sentenca[fraseAtual.idxAlvo]} como ${fraseAtual.classePredita} são:`;


    for (let j = 0; j < fraseAtual.sentenca.length; j++) {
      const palavra = fraseAtual.sentenca[j];
      let palavraEl = document.createElement("span");
      let palavraRaw = document.createElement("span");
      let input = document.createElement("input");

      input.addEventListener("click", () => {
        atualizaVetor(id, j);
      });

      palavraEl.classList.add("palavra");
      palavraRaw.innerText = palavra;

      input.setAttribute("type", "checkbox");
      input.setAttribute("name", "relevancia");

      input.checked = result[id-1].relevancia[j];

      if (palavra == fraseAtual.sentenca[fraseAtual.idxAlvo]) {
        palavraEl.classList.add("alvo");
        input.classList.add("hidden");
      }

      palavraEl.appendChild(palavraRaw);
      palavraEl.appendChild(input);
      divPalavrasEl.appendChild(palavraEl);
    }

    articleEl.appendChild(spanIdEl);
    articleEl.appendChild(divInfoEl);
    articleEl.appendChild(divPalavrasEl);
    frasesEl.appendChild(articleEl);
  }
  return frasesEl;

}

function atualizaVetor(id, j,) {
    result[id-1].relevancia[j] = !result[id-1].relevancia[j];
    localStorage.setItem("result", JSON.stringify(result));
    fileDownloaderEl.disabled = false;
}

fileDownloaderEl.addEventListener("click", baixarJSON);

function baixarJSON() {
    let jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result));
    let link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", "relatorio.json");
    document.body.appendChild(link);
    link.click();
}

/**
 * TODO: mudar estrutura de saida e entrada
 * labels: []
 * sentences: [{
    "id": 0,
    "validate": false,
    "relevance": [
      true,
      true,
      false,
      false,
      true
    ],
    "target": "1"
  },]
  {
    "id": "1",
    "sentence": [
      "O",
      "Jaguar",
      "atacou",
      "o",
      "transeunte"
    ],
    "target": "1",
    "predictclass": "Animal"
  },
 * 
 * 
 */