module.exports.capitalizeString = (str) => {
    console.log(str)
    let lowerCase = str.toLowerCase();
    console.log(lowerCase)
    return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
}
