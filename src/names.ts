import { getValueInRange, getIntegerInRange, getRandomValueOf } from "./utils";

export function generateName() {
  const numberOfSyllabes = getIntegerInRange(2, 4);
  // TODO refactor this into a function
  let name = "";
  for (let i = 0; i < numberOfSyllabes; i++) {
    name += `${generateSyllable()}`;
  }
  return name;
}

const vocals = ["a", "e", "i", "o", "u", "ä", "ö", "å"];
const minCharCode = 97;
const maxCharCode = 122;

function generateSyllable() {
  const syllableSize = getIntegerInRange(1, 3);
  if (syllableSize === 1) return getVocal();
  else if (syllableSize === 2) return `${getConsonant()}${getVocal()}`;
  else return `${getConsonant()}${getVocal()}${getConsonant()}`;
}

function getVocal() {
  return getRandomValueOf(vocals);
}
function getConsonant() {
  let consonant = "";
  while (!consonant) {
    let code = getIntegerInRange(minCharCode, maxCharCode);
    let letter = String.fromCharCode(code);
    if (!vocals.includes(letter)) consonant = letter;
  }
  return consonant;
}
