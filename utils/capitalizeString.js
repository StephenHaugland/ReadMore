module.exports.capitalizeString = (str) => {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}
