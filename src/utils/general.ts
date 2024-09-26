export const cleanTitle = (title: string, makeLowercase = false) => {
  const cleanedUpTitle = title.replaceAll(" ", "-");

  return makeLowercase ? cleanedUpTitle.toLowerCase() : cleanedUpTitle;
};

export const isValidURL = (urlString: string): boolean => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i",
  );

  return urlPattern.test(urlString);
};

export const generateShortCode = (codeLength: number) => {
  const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "j",
    "k",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const numbers = [2, 3, 4, 5, 6, 7, 8, 9];

  let newShortCode = "";
  let numberCount = 0;

  // Ensure at least one number is used
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
  newShortCode += randomNumber;
  numberCount++;

  for (let x = 1; x < codeLength; x++) {
    let numberProbability;

    if (numberCount === 1) {
      numberProbability = 0.15; // 15% chance for second number
    } else if (numberCount === 2) {
      numberProbability = 0.1; // 10% chance for third number
    } else {
      numberProbability = 0; // No more numbers after 3
    }

    if (Math.random() < numberProbability) {
      const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
      newShortCode += randomNumber;
      numberCount++;
    } else {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      newShortCode += randomLetter;
    }
  }

  // Shuffle the shortcode
  newShortCode = newShortCode
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  console.log(newShortCode, numberCount);
  return newShortCode;
};
