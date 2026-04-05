const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const dropdowns = document.querySelectorAll(".dropdown select");
const form = document.querySelector("#converterForm");
const msg = document.querySelector("#mainMessage");
const updatedTime = document.querySelector("#updatedTime");
const amountInput = document.querySelector("#amountInput");
const swapBtn = document.querySelector("#swapBtn");
const multiResults = document.querySelector("#multiResults");

const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

function loadDropdowns() {
  for (let select of dropdowns) {
    select.innerHTML = "";

    for (let currCode in countryList) {
      let newOption = document.createElement("option");
      newOption.innerText = currCode;
      newOption.value = currCode;

      if (select.name === "from" && currCode === "USD") {
        newOption.selected = true;
      } else if (select.name === "to" && currCode === "INR") {
        newOption.selected = true;
      }

      select.appendChild(newOption);
    }

    select.addEventListener("change", (evt) => {
      updateFlag(evt.target);
    });
  }
}

function updateFlag(element) {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let img = element.parentElement.querySelector("img");

  if (countryCode) {
    img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
}

swapBtn.addEventListener("click", () => {
  let temp = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = temp;

  updateFlag(fromCurr);
  updateFlag(toCurr);
  getExchangeRate();
});

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  getExchangeRate();
});

async function getExchangeRate() {
  let amtVal = amountInput.value;

  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amountInput.value = "1";
  }

  msg.innerText = "Fetching latest exchange rate...";
  updatedTime.innerText = "Last updated: --";

  try {
    let URL = `https://v6.exchangerate-api.com/v6/b71ba5a6f69833fe3ac900ec/latest/${fromCurr.value}`;
    let response = await fetch(URL);
    let data = await response.json();

    if (data.result !== "success") {
      throw new Error("API error");
    }

    let rate = data.conversion_rates[toCurr.value];
    let finalAmount = (amtVal * rate).toFixed(2);

    msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
    updatedTime.innerText = `Last updated: ${data.time_last_update_utc}`;

    showPopularResults(data.conversion_rates, Number(amtVal));
  } catch (error) {
    msg.innerText = "Unable to fetch exchange rates. Please try again later.";
    updatedTime.innerText = "Last updated: unavailable";
    multiResults.innerHTML = "";
  }
}

function showPopularResults(rates, amount) {
  multiResults.innerHTML = "";

  popularCurrencies.forEach((currency) => {
    if (rates[currency] !== undefined) {
      let convertedValue = (amount * rates[currency]).toFixed(2);

      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `${currency}<br>${convertedValue}`;

      multiResults.appendChild(card);
    }
  });
}

window.addEventListener("load", () => {
  if (typeof countryList === "undefined") {
    msg.innerText = "Currency list could not be loaded.";
    return;
  }

  loadDropdowns();
  updateFlag(fromCurr);
  updateFlag(toCurr);
  getExchangeRate();
});