export const ACHIEVEMENTS = [

  // ===========================
  // Sleep
  // ===========================

  {
    id: "first_sleep",
    title: "achievement_first_sleep_title",
    description: "achievement_first_sleep_description",
    icon: "🌙",
    type: "sessions",
    goal: 1,
    reward: 50,
  },

  {
    id: "sleep_7",
    title: "achievement_sleep_7_title",
    description: "achievement_sleep_7_description",
    icon: "😴",
    type: "sessions",
    goal: 7,
    reward: 100,
  },

  {
    id: "sleep_30",
    title: "achievement_sleep_30_title",
    description: "achievement_sleep_30_description",
    icon: "💤",
    type: "sessions",
    goal: 30,
    reward: 250,
  },

  {
    id: "sleep_100",
    title: "achievement_sleep_100_title",
    description: "achievement_sleep_100_description",
    icon: "👑",
    type: "sessions",
    goal: 100,
    reward: 500,
  },

  // ===========================
  // Streak
  // ===========================

  {
    id: "streak_3",
    title: "achievement_streak_3_title",
    description: "achievement_streak_3_description",
    icon: "🔥",
    type: "streak",
    goal: 3,
    reward: 75,
  },

  {
    id: "streak_7",
    title: "achievement_streak_7_title",
    description: "achievement_streak_7_description",
    icon: "🔥",
    type: "streak",
    goal: 7,
    reward: 150,
  },

  {
    id: "streak_30",
    title: "achievement_streak_30_title",
    description: "achievement_streak_30_description",
    icon: "🏆",
    type: "streak",
    goal: 30,
    reward: 500,
  },

  // ===========================
  // Coins
  // ===========================

  {
    id: "coins_500",
    title: "achievement_coins_500_title",
    description: "achievement_coins_500_description",
    icon: "💰",
    type: "coins",
    goal: 500,
    reward: 100,
  },

  {
    id: "coins_1000",
    title: "achievement_coins_1000_title",
    description: "achievement_coins_1000_description",
    icon: "💎",
    type: "coins",
    goal: 1000,
    reward: 200,
  },

  // ===========================
  // Levels
  // ===========================

  {
    id: "level_5",
    title: "achievement_level_5_title",
    description: "achievement_level_5_description",
    icon: "⭐",
    type: "level",
    goal: 5,
    reward: 150,
  },

  {
    id: "level_10",
    title: "achievement_level_10_title",
    description: "achievement_level_10_description",
    icon: "🌟",
    type: "level",
    goal: 10,
    reward: 300,
  },

  // ===========================
  // Pets
  // ===========================

  {
    id: "first_pet",
    title: "achievement_first_pet_title",
    description: "achievement_first_pet_description",
    icon: "🐶",
    type: "pets",
    goal: 2,
    reward: 100,
  },

  {
    id: "all_pets",
    title: "achievement_all_pets_title",
    description: "achievement_all_pets_description",
    icon: "🐉",
    type: "pets",
    goal: 8,
    reward: 1000,
  },

];
export function checkAchievements(player) {

  return ACHIEVEMENTS.map((achievement) => {

    let progress = 0;

    switch (achievement.type) {

      case "sessions":
        progress = player.sessions;
        break;

      case "streak":
        progress = player.streak;
        break;

      case "coins":
        progress = player.coins;
        break;

      case "level":
        progress = player.level;
        break;

      case "pets":
        progress = player.pets;
        break;

      default:
        progress = 0;

    }

    const unlocked = progress >= achievement.goal;

    return {

      ...achievement,

      progress: unlocked ? achievement.goal : progress,
      unlocked,

    };

  });

}

export function unlockAchievements(player, unlockedIds) {

  let rewardCoins = 0;

  const newAchievements = [];

  const achievements = checkAchievements(player);

  achievements.forEach((achievement) => {

    if (

      achievement.unlocked &&

      !unlockedIds.includes(achievement.id)

    ) {

      newAchievements.push(achievement);

      rewardCoins += achievement.reward;

    }

  });

  return {

    newAchievements,

    rewardCoins,

  };

}