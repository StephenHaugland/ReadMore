module.exports.capitalizeString = (str) => {
    let lowerCase = str.toLowerCase();
    return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
}
