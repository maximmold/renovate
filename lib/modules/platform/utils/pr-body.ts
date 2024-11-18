import { regEx } from '../../../util/regex';

const re = regEx(
  `(?<preNotes>.*### Release Notes)(?<releaseNotes>.*)### Configuration(?<postNotes>.*)`,
  's',
);

export function smartTruncate(input: string, len: number): object {
  if (input.length < len) {//if input is less, just go ahead and return
    return {
      first: input,
      rest: []
    };
  }

  const reMatch = re.exec(input); //Find the individual segments of preNotes, Release note, postNotes
  if (!reMatch?.groups) { //If there wasn't a match of these groups, just truncate and be done
    return {
      first: input.substring(0, len),
      rest: []
    }
  }

  const divider = `\n\n</details>\n\n---\n\n### Configuration`;
  const preNotes = reMatch.groups.preNotes;
  const releaseNotes = reMatch.groups.releaseNotes;
  const postNotes = reMatch.groups.postNotes;

  const availableLength = //Check the available length taking the maxim and substrating out the boilerplate length
    len - (preNotes.length + postNotes.length + divider.length);

  if (availableLength <= 0) { //If the is no available length with just taking out the boilerplate then just truncate from the end because you can't keep the rest
    //break up between pr body and pr comment
    //https://github.com/orgs/community/discussions/27190
    // return input.substring(0, len);
    return splitStringAndSeparateFirst(input, len, len);
  } else { //Otherwise, keep the boilerplate and shrink the rest.
    const parts = splitStringAndSeparateFirst(releaseNotes, availableLength, len);
    parts.first = preNotes + parts.first + divider + postNotes;
    return parts;
  }
}


function splitStringAndSeparateFirst(str: string, firstMaxLength: number, maxLength: number): object {
  // Call the splitString function to get the array of string parts
  const stringParts = splitString(str, firstMaxLength, maxLength);

  // Extract the first part and the rest of the parts
  const firstPart = stringParts[0];
  const remainingParts = stringParts.slice(1);

  // Return the first part separately and the rest as a list
  return {
    first: firstPart,
    rest: remainingParts
  };
}
function splitString(str: string, firstMaxLength: number, maxLength: number): string[] {
  let result: string[] = [];

  // Handle the first part with a custom length
  if (str.length > firstMaxLength) {
    result.push(str.slice(0, firstMaxLength));
    str = str.slice(firstMaxLength);
  } else {
    result.push(str);
    return result; // Return early if the entire string fits within firstMaxLength
  }

  // Handle the remaining parts with the standard max length
  for (let i = 0; i < str.length; i += maxLength) {
    result.push(str.slice(i, i + maxLength));
  }

  return result;
}

// Example usage:
let longString = "YourVeryLongString..."; // replace with your actual long string
let stringParts = splitString(longString);

