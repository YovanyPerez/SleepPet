// XP que se gana según la calidad del sueño

export function getXPFromQuality(quality) {

  switch (quality) {

    case "Excellent":
      return 25;

    case "Good":
      return 18;

    case "Fair":
      return 10;

    default:
      return 5;

  }

}

// Calcula la nueva XP y el nivel

export function addXP(level, currentXP, earnedXP) {

  let xp = currentXP + earnedXP;

  let newLevel = level;

  let levelUp = false;

  while (xp >= 100) {

    xp -= 100;

    newLevel++;

    levelUp = true;

  }

  return {

    xp,

    level: newLevel,

    levelUp,

  };

}