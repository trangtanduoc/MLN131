export function calculateScore(isCorrect: boolean, timeLeft: number) {
    if (!isCorrect) return 0;
  
    const baseScore = 100;
    const maxBonus = 50;
    const maxTime = 10;
    const speedBonus = maxBonus * (timeLeft / maxTime) ** 2; 
  
    return baseScore + Math.round(speedBonus);
  }