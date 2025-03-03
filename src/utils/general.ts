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

export const generateShortCode = (codeLength: number, checkList?: string[]) => {
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
  const maxAttempts = 100;
  let attempts = 0;

  const maxNumbers = Math.floor(codeLength * 0.35);

  do {
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error("Failed to generate short code after maximum attempts");
    }

    newShortCode = "";
    let numberCount = 0;
    let currentProbability = 0.45;

    for (let x = 1; x < codeLength; x++) {
      if (numberCount < maxNumbers && Math.random() < currentProbability) {
        const randomNumber =
          numbers[Math.floor(Math.random() * numbers.length)];
        newShortCode += randomNumber;
        numberCount++;
        currentProbability *= 0.45;
      } else {
        const randomLetter =
          letters[Math.floor(Math.random() * letters.length)];
        newShortCode += randomLetter;
      }
    }

    // Shuffle the shortcode (update: use Fisher-Yates shuffle)
    const shuffledArray = newShortCode.split("");

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }

    newShortCode = shuffledArray.join("");
  } while (checkList?.includes(newShortCode));

  return newShortCode;
};
