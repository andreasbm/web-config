interface ICrossword {
	cells: ICell[][];
}

interface ICell {
	x: number;
	y: number;
	letter?: number;
}

type LetterInt = number;
type WordInts = LetterInt[];
type LetterCloud = any;
type WordList = WordInts[];

enum CharCodes {
	A = charCode("A"),
	Z = charCode("Z")
}

const specialCharOffsetMap = {
	Æ: 1,
	Ø: 2,
	Å: 3,
	"#": 4
};

enum Direction {
	HORIZONTAL,
	VERTICAL
}

const wordlist: WordList = parseWordList([
	"ABE",
	"AND",
	"SPAND"
]);

const crosswordSeed: ICrossword = {
	cells: [
		[{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
		[{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
		[{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]
	]
};

function buildCrossword (crossword: ICrossword, wordlist: WordList) {

}

buildCrossword(crosswordSeed, wordlist);


/**
 * Builds a letter cloud.
 * @param crossword
 * @param wordList
 */
function buildLetterCloud (crossword: ICrossword, wordList: WordList): LetterCloud {

	function innerBuildLetterCloud (depth: number) {

	}
}

/**
 * Returns the cells from which words can start.
 */
function getRadiationCells (): { horizontal: ICell[], vertical: ICell[] } {
	return {
		horizontal: [],
		vertical: []
	}
}

/**
 * Parses the wordlist.
 * @param wordlist
 */
function parseWordList (wordlist: string[]): WordList {
	return wordlist.map(w => wordToInts(w.toUpperCase()));
}

/**
 * Turns a word into ints.
 * @param word
 */
function wordToInts (word: string): WordInts {
	return word.split("").map(letterToInt);
}

/**
 * Converts a letter to an integer.
 * @param letter
 */
function letterToInt (letter: string): LetterInt {
	const letterCharCode = charCode(letter);
	let exponent = 0;

	if (letterCharCode >= CharCodes.A && letterCharCode <= CharCodes.Z) {
		// We want A to be 1.
		exponent = letterCharCode + 1 - CharCodes.A;

	} else {
		// Convert a special character
		const specialCharOffset = specialCharOffsetMap[letter];
		exponent = (CharCodes.Z - CharCodes.A) + 1 + specialCharOffset;
	}

	// If the exponent is 0 we know something is wrong!
	if (exponent === 0) {
		throw new Error(`The letter "${letter}" could not be converted to an int`);
	}

	// 2^0	00000001  1   = A
	// 2^1  00000010  2   = B
	// 2^2  00000100  4   = C
	// ...
	// 2^28  1 0000 0000 0000 0000 0000 0000 0000  = Å
	return Math.pow(2, exponent);
}

/**
 * Converts an integer to a letter.
 * @param int
 */
function intToLetter (int: LetterInt): string {
	const exponent = Math.log(int) / Math.log(2);
	const letterCharCode = exponent + CharCodes.A - 1;

	// Go the opposite way if the char is a special character
	if (letterCharCode < CharCodes.A || letterCharCode > CharCodes.Z) {
		const specialCharOffset = letterCharCode - (CharCodes.Z - CharCodes.A) - 1;
		const specialCharInfo = Object.entries(specialCharOffsetMap).find(([key, value]) => value === specialCharOffset);

		if (specialCharInfo == null) {
			throw new Error(`The int "${int}" could not be converted to a letter`);
		}

		return specialCharInfo[0];
	}

	return String.fromCharCode(letterCharCode);
}

/**
 * Turns a character into its character code.
 * @param char
 */
function charCode (char: string): number  {
	return char.charCodeAt(0);
}

/**
 * Rates a crossword.
 * @param crossword
 */
function rateCrossword (crossword: ICrossword): number {
	// Brug scrabble score til at rate krydsorden
	return 0;
}
