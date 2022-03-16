const  API_Key = "ec2a14f0c98a5bc3cd5dd460";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_Key}`

fetch(`${BASE_URL}/codes`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
    });
//get value code from API
async function getSupportedCodes(){
    try{
        const response = await fetch(`${BASE_URL}/codes`);
        if (response.ok){
            const data = await response.json();
            return data["supported_codes"];
        }
    } catch (error){
        console.log(error);
        return [];
    }
}
//scope value rate from API
async function getConversionRate(baseCode,targetCode){
    try {
        const response = await fetch(`${BASE_URL}/pair/${baseCode}/${targetCode}`);
        if (response.ok){
            const data = await response.json();
            return data["conversion_rate"];
        }
    } catch (error){
        console.log(error);
        return 0;
    }
}

const baseUnit = document.querySelector("#base-unit");
const targetRate = document.querySelector("#target-rate");

const inputBaseAmount = document.querySelector("#base-amount");
const selectBaseCode = document.querySelector("#base-code");
const inputTargetAmount = document.querySelector("#target-amount");
const selectTargetCode = document.querySelector("#target-code");

const errorMsg = document.querySelector(".error-message");

let supportedCodes = [];
let conversionRate = 0;

//data in

const updateExchangeRate = async () =>{
    const baseCode = selectBaseCode.value;
    const targetCode = selectTargetCode.value;

    errorMsg.textContent = "loading";
    conversionRate = await getConversionRate(baseCode,targetCode);
    if (conversionRate === 0){
        errorMsg.textContent = "Cannot get the conversion rate"
    }
    errorMsg.textContent = "";

    const baseName = supportedCodes.find(code => code[0] === baseCode)[1];
    const targetName = supportedCodes.find(code => code[0] === targetCode)[1];

    baseUnit.textContent = `1 ${baseName} equals`;
    targetRate.textContent = `${conversionRate} ${targetName}`;
};

const initialize = async () => {
    //get code from API
    errorMsg.textContent = "loading";
    supportedCodes = await getSupportedCodes();
    if (!supportedCodes.length){
        errorMsg.textContent = "No supported codes";
        return;
    }
    errorMsg.textContent = "";

    //put options select box
    supportedCodes.forEach((code) =>{
        const baseOption = document.createElement("option");
        baseOption.value = code[0];
        baseOption.textContent = code[1];
        selectBaseCode.appendChild(baseOption);

        const targetOption = document.createElement("option");
        targetOption.value = code[0];
        targetOption.textContent = code[1];
        selectTargetCode.appendChild(targetOption);
    });

    //set VND to USD as default
    selectBaseCode.value = "VND";
    selectTargetCode.value = "USD";

    //update exchange rate
    await updateExchangeRate();
}
selectBaseCode.addEventListener("change", updateExchangeRate);
selectTargetCode.addEventListener("change",updateExchangeRate);

inputBaseAmount.addEventListener("input", () =>{
    inputTargetAmount.value = Math.round((inputBaseAmount.value * conversionRate) * 10**6) /10**6;
});
inputTargetAmount.addEventListener("input", () =>{
    inputBaseAmount.value = Math.round((inputTargetAmount.value / conversionRate) * 10**6) /10**6;
});

initialize();