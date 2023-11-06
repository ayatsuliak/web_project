function getSumOfSquares(number) {
    let sum = 0;
    while (number > 0) {
      const digit = number % 10;
      sum += digit * digit;
      number = Math.floor(number / 10);
    }
    return sum;
  }
  
  function isHappyNumber(number) {
    const seen = new Set();
    while (number !== 1 && !seen.has(number)) {
      seen.add(number);
      number = getSumOfSquares(number);
    }
    return number === 1;
  }
  
  function calculateHappyNumber(number){
    if (isNaN(number) || number <= 0) {
      return res.status(400).json({ error: 'Incorrect number' });
    }
  
    const isHappy = isHappyNumber(number);
  
    return isHappy;
  };

  module.exports = calculateHappyNumber;