// XP que se gana según la calidad del sueño

const XP_BY_QUALITY = {
  Excellent: 25,
  Good: 18,
  Fair: 10,
};

export function getXPFromQuality(quality) {

  return XP_BY_QUALITY[quality] ?? 5;

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