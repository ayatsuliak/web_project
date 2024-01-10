const DELAY = 3000;

function getSumOfSquares(number) {
    let sum = 0;
    while (number > 0) {
      const digit = number % 10;
      sum += digit * digit;
      number = Math.floor(number / 10);
    }
    return sum;
  }
  
  async function isHappyNumber(number) {
    const seen = new Set();
    while (number !== 1 && !seen.has(number)) {
      seen.add(number);
      number = getSumOfSquares(number);
    }
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return number === 1;
  }
  
 async function calculateHappyNumber(number) {
    if (isNaN(number) || number <= 0) {
        return false; 
    }

    const isHappy = await isHappyNumber(number)

    return isHappy; 
}

module.exports = calculateHappyNumber;