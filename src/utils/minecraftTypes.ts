export type DamageCause =
  | "CONTACT"
  | "ENTITY_ATTACK"
  | "ENTITY_SWEEP_ATTACK"
  | "PROJECTILE"
  | "SUFFOCATION"
  | "FALL"
  | "FIRE"
  | "FIRE_TICK"
  | "MELTING"
  | "LAVA"
  | "DROWNING"
  | "BLOCK_EXPLOSION"
  | "ENTITY_EXPLOSION"
  | "VOID"
  | "LIGHTNING"
  | "SUICIDE"
  | "STARVATION"
  | "POISON"
  | "MAGIC"
  | "WITHER"
  | "FALLING_BLOCK"
  | "THORNS"
  | "DRAGON_BREATH"
  | "CUSTOM"
  | "FLY_INTO_WALL"
  | "HOT_FLOOR"
  | "CRAMMING"
  | "DRYOUT"
  | "FREEZE";

export type EntityType =
  | "AREA_EFFECT_CLOUD"
  | "ARMOR_STAND"
  | "ARROW"
  | "BAT"
  | "BLAZE"
  | "BOAT"
  | "CAVE_SPIDER"
  | "CHICKEN"
  | "COMPLEX_PART"
  | "COW"
  | "CREEPER"
  | "DONKEY"
  | "DRAGON_FIREBALL"
  | "DROPPED_ITEM"
  | "EGG"
  | "ELDER_GUARDIAN"
  | "ENDER_CRYSTAL"
  | "ENDER_DRAGON"
  | "ENDER_PEARL"
  | "ENDER_SIGNAL"
  | "ENDERMAN"
  | "ENDERMITE"
  | "EVOKER"
  | "EVOKER_FANGS"
  | "EXPERIENCE_ORB"
  | "FALLING_BLOCK"
  | "FIREBALL"
  | "FIREWORK"
  | "FISHING_HOOK"
  | "GHAST"
  | "GIANT"
  | "GUARDIAN"
  | "HORSE"
  | "HUSK"
  | "ILLUSIONER"
  | "IRON_GOLEM"
  | "ITEM_FRAME"
  | "LEASH_HITCH"
  | "LIGHTNING"
  | "LINGERING_POTION"
  | "LLAMA"
  | "LLAMA_SPIT"
  | "MAGMA_CUBE"
  | "MINECART"
  | "MINECART_CHEST"
  | "MINECART_COMMAND"
  | "MINECART_FURNACE"
  | "MINECART_HOPPER"
  | "MINECART_MOB_SPAWNER"
  | "MINECART_TNT"
  | "MULE"
  | "MUSHROOM_COW"
  | "OCELOT"
  | "PAINTING"
  | "PARROT"
  | "PIG"
  | "PIG_ZOMBIE"
  | "PLAYER"
  | "POLAR_BEAR"
  | "PRIMED_TNT"
  | "RABBIT"
  | "SHEEP"
  | "SHULKER"
  | "SHULKER_BULLET"
  | "SILVERFISH"
  | "SKELETON"
  | "SKELETON_HORSE"
  | "SLIME"
  | "SMALL_FIREBALL"
  | "SNOWBALL"
  | "SNOWMAN"
  | "SPECTRAL_ARROW"
  | "SPIDER"
  | "SPLASH_POTION"
  | "SQUID"
  | "STRAY"
  | "THROWN_EXP_BOTTLE"
  | "TIPPED_ARROW"
  | "UNKNOWN"
  | "VEX"
  | "VILLAGER"
  | "VINDICATOR"
  | "WEATHER"
  | "WITCH"
  | "WITHER"
  | "WITHER_SKELETON"
  | "WITHER_SKULL"
  | "WOLF"
  | "ZOMBIE"
  | "ZOMBIE_HORSE"
  | "ZOMBIE_VILLAGER";

const entityTypesTranslationsMap: Partial<Record<EntityType, string>> = {
  PLAYER: "Gracz",
  ARROW: "Strzała",
  WOLF: "Wilk",
};
const damageCauseTranslationsMap: Partial<Record<DamageCause, string>> = {
  ENTITY_ATTACK: "Atak bytu",
  SUICIDE: "Samobójstwo",
  FALL: "Upadek",
};

export const entityTypesTranslations = (type: EntityType) =>
  entityTypesTranslationsMap[type] ??
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
export const damageCauseTranslations = (cause: DamageCause) =>
  damageCauseTranslationsMap[cause] ??
  cause
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
