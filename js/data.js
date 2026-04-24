// Mutants & Masterminds 3rd Edition - Game Data
// Based on the Open Game License content

const ABILITIES = [
  { id: 'str', name: 'Strength', abbr: 'STR', description: 'Physical power and muscle' },
  { id: 'sta', name: 'Stamina', abbr: 'STA', description: 'Health and endurance' },
  { id: 'agl', name: 'Agility', abbr: 'AGL', description: 'Balance and reflexes' },
  { id: 'dex', name: 'Dexterity', abbr: 'DEX', description: 'Hand-eye coordination' },
  { id: 'fgt', name: 'Fighting', abbr: 'FGT', description: 'Combat ability' },
  { id: 'int', name: 'Intellect', abbr: 'INT', description: 'Reasoning and learning' },
  { id: 'awe', name: 'Awareness', abbr: 'AWE', description: 'Common sense and intuition' },
  { id: 'pre', name: 'Presence', abbr: 'PRE', description: 'Force of personality' },
];

const ABILITY_COST = 2; // PP per rank

const SKILLS = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'agl' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'closeCombat', name: 'Close Combat', ability: 'fgt', hasSpecialty: true },
  { id: 'deception', name: 'Deception', ability: 'pre' },
  { id: 'expertise', name: 'Expertise', ability: 'int', hasSpecialty: true },
  { id: 'insight', name: 'Insight', ability: 'awe' },
  { id: 'intimidation', name: 'Intimidation', ability: 'pre' },
  { id: 'investigation', name: 'Investigation', ability: 'int' },
  { id: 'perception', name: 'Perception', ability: 'awe' },
  { id: 'persuasion', name: 'Persuasion', ability: 'pre' },
  { id: 'rangedCombat', name: 'Ranged Combat', ability: 'dex', hasSpecialty: true },
  { id: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dex' },
  { id: 'stealth', name: 'Stealth', ability: 'agl' },
  { id: 'technology', name: 'Technology', ability: 'int' },
  { id: 'treatment', name: 'Treatment', ability: 'int' },
  { id: 'vehicles', name: 'Vehicles', ability: 'dex' },
];

const SKILL_COST = 0.5; // PP per rank (2 ranks per PP)

const ADVANTAGES = [
  // Combat Advantages
  { id: 'accurateAttack', name: 'Accurate Attack', ranked: false, cost: 1, category: 'Combat', description: 'Trade effect DC for attack bonus' },
  { id: 'agileFeint', name: 'Agile Feint', ranked: false, cost: 1, category: 'Skill', description: 'Feint using Acrobatics instead of Deception' },
  { id: 'allOutAttack', name: 'All-out Attack', ranked: false, cost: 1, category: 'Combat', description: 'Trade defense for attack bonus' },
  { id: 'chokeHold', name: 'Chokehold', ranked: false, cost: 1, category: 'Combat', description: 'Suffocate with a grab' },
  { id: 'closeAttack', name: 'Close Attack', ranked: true, cost: 1, category: 'Combat', description: '+1 close attack bonus per rank' },
  { id: 'defensiveAttack', name: 'Defensive Attack', ranked: false, cost: 1, category: 'Combat', description: 'Trade attack bonus for defense' },
  { id: 'defensiveRoll', name: 'Defensive Roll', ranked: true, cost: 1, category: 'Combat', description: '+1 active Toughness per rank' },
  { id: 'evasion', name: 'Evasion', ranked: true, cost: 1, category: 'Combat', maxRanks: 2, description: '+2/+5 to area resistance checks' },
  { id: 'fastGrab', name: 'Fast Grab', ranked: false, cost: 1, category: 'Combat', description: 'Free grab after close attack' },
  { id: 'grabFinesse', name: 'Grabbing Finesse', ranked: false, cost: 1, category: 'Combat', description: 'Use Dex/Fgt for grab' },
  { id: 'improvedAim', name: 'Improved Aim', ranked: false, cost: 1, category: 'Combat', description: 'Double aim bonus' },
  { id: 'improvedCritical', name: 'Improved Critical', ranked: true, cost: 1, category: 'Combat', maxRanks: 4, hasSpecialty: true, description: '+1 threat range per rank (max 19-16)' },
  { id: 'improvedDefense', name: 'Improved Defense', ranked: false, cost: 1, category: 'Combat', description: '+2 active defense when defending' },
  { id: 'improvedDisarm', name: 'Improved Disarm', ranked: false, cost: 1, category: 'Combat', description: 'No penalty for disarm' },
  { id: 'improvedGrab', name: 'Improved Grab', ranked: false, cost: 1, category: 'Combat', description: 'One-handed grab' },
  { id: 'improvedHold', name: 'Improved Hold', ranked: false, cost: 1, category: 'Combat', description: '-5 penalty to escape' },
  { id: 'improvedInitiative', name: 'Improved Initiative', ranked: true, cost: 1, category: 'Combat', description: '+4 initiative per rank' },
  { id: 'improvedSmash', name: 'Improved Smash', ranked: false, cost: 1, category: 'Combat', description: 'No penalty for smash' },
  { id: 'improvedTrip', name: 'Improved Trip', ranked: false, cost: 1, category: 'Combat', description: 'No penalty for trip' },
  { id: 'moveByAction', name: 'Move-by Action', ranked: false, cost: 1, category: 'Combat', description: 'Move before and after standard action' },
  { id: 'powerAttack', name: 'Power Attack', ranked: false, cost: 1, category: 'Combat', description: 'Trade attack bonus for effect DC' },
  { id: 'preciseAttack', name: 'Precise Attack', ranked: true, cost: 1, category: 'Combat', maxRanks: 4, hasSpecialty: true, description: 'Ignore cover/concealment penalty (Close/Ranged × Cover/Concealment)' },
  { id: 'proneFighting', name: 'Prone Fighting', ranked: false, cost: 1, category: 'Combat', description: 'No penalties while prone' },
  { id: 'quickDraw', name: 'Quick Draw', ranked: false, cost: 1, category: 'Combat', description: 'Draw weapon as free action' },
  { id: 'rangedAttack', name: 'Ranged Attack', ranked: true, cost: 1, category: 'Combat', description: '+1 ranged attack bonus per rank' },
  { id: 'redirect', name: 'Redirect', ranked: false, cost: 1, category: 'Combat', description: 'Redirect missed attack' },
  { id: 'seizeInitiative', name: 'Seize Initiative', ranked: false, cost: 1, category: 'Combat', description: 'Spend hero point to go first' },
  { id: 'takedown', name: 'Takedown', ranked: true, cost: 1, category: 'Combat', maxRanks: 2, description: 'Free attack on minion drop' },
  { id: 'throwMastery', name: 'Throwing Mastery', ranked: true, cost: 1, category: 'Combat', description: '+1 thrown damage per rank' },
  { id: 'uncannydodge', name: 'Uncanny Dodge', ranked: false, cost: 1, category: 'Combat', description: 'Not vulnerable when surprised' },
  { id: 'weaponBind', name: 'Weapon Bind', ranked: false, cost: 1, category: 'Combat', description: 'Free disarm on critical' },
  { id: 'weaponBreak', name: 'Weapon Break', ranked: false, cost: 1, category: 'Combat', description: 'Free smash on critical' },
  // Fortune Advantages
  { id: 'beginnerLuck', name: "Beginner's Luck", ranked: false, cost: 1, category: 'Fortune', description: 'Spend HP for 5 temporary skill ranks' },
  { id: 'inspire', name: 'Inspire', ranked: true, cost: 1, category: 'Fortune', description: '+1 per rank to allies\' checks' },
  { id: 'leadership', name: 'Leadership', ranked: false, cost: 1, category: 'Fortune', description: 'Spend HP to remove condition from ally' },
  { id: 'luck', name: 'Luck', ranked: true, cost: 1, category: 'Fortune', description: 'Extra hero point per rank' },
  { id: 'ultimateEffort', name: 'Ultimate Effort', ranked: true, cost: 1, category: 'Fortune', hasSpecialty: true, description: 'Spend HP for automatic 20' },
  // General Advantages
  { id: 'animalEmpathy', name: 'Animal Empathy', ranked: false, cost: 1, category: 'General', description: 'Use interaction skills on animals' },
  { id: 'artificer', name: 'Artificer', ranked: false, cost: 1, category: 'General', description: 'Create temporary magical items' },
  { id: 'assessment', name: 'Assessment', ranked: false, cost: 1, category: 'Skill', description: 'Assess opponent with Insight' },
  { id: 'attractive', name: 'Attractive', ranked: true, cost: 1, category: 'Skill', maxRanks: 2, description: 'Circumstance bonus on interaction checks' },
  { id: 'benefit', name: 'Benefit', ranked: true, cost: 1, category: 'General', hasSpecialty: true, description: 'Wealth, status, or other benefit' },
  { id: 'connected', name: 'Connected', ranked: false, cost: 1, category: 'General', description: 'Call in favors' },
  { id: 'contacts', name: 'Contacts', ranked: false, cost: 1, category: 'General', description: 'Info-gathering network' },
  { id: 'daze', name: 'Daze', ranked: true, cost: 1, category: 'Skill', hasSpecialty: true, maxRanks: 2, description: 'Daze with Deception or Intimidation' },
  { id: 'diehard', name: 'Diehard', ranked: false, cost: 1, category: 'General', description: 'Auto-stabilize when dying' },
  { id: 'eidetic', name: 'Eidetic Memory', ranked: false, cost: 1, category: 'Skill', description: 'Perfect recall' },
  { id: 'equipment', name: 'Equipment', ranked: true, cost: 1, category: 'General', description: '5 equipment points per rank' },
  { id: 'extraordinaryEffort', name: 'Extraordinary Effort', ranked: false, cost: 1, category: 'General', description: 'Extra effort for two effects' },
  { id: 'fascinate', name: 'Fascinate', ranked: true, cost: 1, category: 'Skill', hasSpecialty: true, description: 'Entrance with a skill check' },
  { id: 'favoredEnvironment', name: 'Favored Environment', ranked: true, cost: 1, category: 'General', hasSpecialty: true, description: '+2 in chosen environment' },
  { id: 'favoredFoe', name: 'Favored Foe', ranked: true, cost: 1, category: 'General', hasSpecialty: true, description: '+2 against chosen foe type' },
  { id: 'fearless', name: 'Fearless', ranked: false, cost: 1, category: 'General', description: 'Immune to fear' },
  { id: 'greatEndurance', name: 'Great Endurance', ranked: false, cost: 1, category: 'General', description: '+5 to endurance checks' },
  { id: 'hideInPlainSight', name: 'Hide in Plain Sight', ranked: false, cost: 1, category: 'Skill', description: 'Hide without cover' },
  { id: 'improvisedTools', name: 'Improvised Tools', ranked: false, cost: 1, category: 'General', description: 'No penalty for lack of tools' },
  { id: 'instantUp', name: 'Instant Up', ranked: false, cost: 1, category: 'General', description: 'Stand as free action' },
  { id: 'interpose', name: 'Interpose', ranked: false, cost: 1, category: 'General', description: 'Take attack meant for ally' },
  { id: 'inventor', name: 'Inventor', ranked: false, cost: 1, category: 'General', description: 'Create temporary devices' },
  { id: 'jackOfAllTrades', name: 'Jack-of-all-trades', ranked: false, cost: 1, category: 'Skill', description: 'Use untrained skills' },
  { id: 'languages', name: 'Languages', ranked: true, cost: 1, category: 'General', description: '2 additional languages per rank' },
  { id: 'minion', name: 'Minion', ranked: true, cost: 1, category: 'General', description: 'Minion of 15 × rank PP' },
  { id: 'ritualist', name: 'Ritualist', ranked: false, cost: 1, category: 'General', description: 'Create magical rituals' },
  { id: 'secondChance', name: 'Second Chance', ranked: true, cost: 1, category: 'General', hasSpecialty: true, description: 'Re-roll specific check' },
  { id: 'setUp', name: 'Set-up', ranked: true, cost: 1, category: 'General', description: 'Transfer interaction bonus to ally' },
  { id: 'sidekick', name: 'Sidekick', ranked: true, cost: 1, category: 'General', description: 'Sidekick of 5 × rank PP' },
  { id: 'skillMastery', name: 'Skill Mastery', ranked: true, cost: 1, category: 'Skill', hasSpecialty: true, description: 'Routine checks with one skill' },
  { id: 'startle', name: 'Startle', ranked: false, cost: 1, category: 'Skill', description: 'Feint with Intimidation' },
  { id: 'taunt', name: 'Taunt', ranked: false, cost: 1, category: 'Skill', description: 'Demoralize with Deception' },
  { id: 'teamwork', name: 'Teamwork', ranked: false, cost: 1, category: 'General', description: '+5 team check bonus' },
  { id: 'tracking', name: 'Tracking', ranked: false, cost: 1, category: 'Skill', description: 'Track by Perception' },
  { id: 'trance', name: 'Trance', ranked: false, cost: 1, category: 'General', description: 'Self-induced trance' },
  { id: 'wellInformed', name: 'Well-informed', ranked: false, cost: 1, category: 'Skill', description: 'Immediate knowledge check' },
];

const ADVANTAGE_CATEGORIES = ['Combat', 'Fortune', 'General', 'Skill'];

const DEFENSES = [
  { id: 'dodge', name: 'Dodge', ability: 'agl', description: 'Ranged attack defense' },
  { id: 'parry', name: 'Parry', ability: 'fgt', description: 'Close attack defense' },
  { id: 'fortitude', name: 'Fortitude', ability: 'sta', description: 'Physical resistance' },
  { id: 'toughness', name: 'Toughness', ability: 'sta', description: 'Damage resistance', noPurchase: true },
  { id: 'will', name: 'Will', ability: 'awe', description: 'Mental resistance' },
];

const DEFENSE_COST = 1; // PP per rank

// Power Effects
const POWER_EFFECTS = [
  // Attack Effects
  { id: 'affliction', name: 'Affliction', type: 'Attack', costPerRank: 1, action: 'Standard', range: 'Close', duration: 'Instant', resistance: 'Fort or Will', description: 'Impose conditions on target' },
  { id: 'damage', name: 'Damage', type: 'Attack', costPerRank: 1, action: 'Standard', range: 'Close', duration: 'Instant', resistance: 'Toughness', description: 'Inflict damage on target' },
  { id: 'nullify', name: 'Nullify', type: 'Attack', costPerRank: 1, action: 'Standard', range: 'Ranged', duration: 'Instant', resistance: 'Power Check', description: 'Counter or suppress powers' },
  { id: 'weaken', name: 'Weaken', type: 'Attack', costPerRank: 1, action: 'Standard', range: 'Close', duration: 'Instant', resistance: 'Fort or Will', description: 'Reduce a trait' },
  // Control Effects
  { id: 'create', name: 'Create', type: 'Control', costPerRank: 2, action: 'Standard', range: 'Ranged', duration: 'Sustained', resistance: '-', description: 'Create solid objects' },
  { id: 'environment', name: 'Environment', type: 'Control', costPerRank: 1, action: 'Standard', range: 'Close', duration: 'Sustained', resistance: '-', description: 'Alter environmental conditions (visibility, heat/cold, wind, etc.)' },
  { id: 'moveObject', name: 'Move Object', type: 'Control', costPerRank: 2, action: 'Standard', range: 'Ranged', duration: 'Sustained', resistance: '-', description: 'Move objects at range' },
  { id: 'transform', name: 'Transform', type: 'Control', costPerRank: 2, action: 'Standard', range: 'Close', duration: 'Sustained', resistance: 'Fortitude', variableCost: [{cost: 2, label: 'One thing to one other (2/rank)'}, {cost: 3, label: 'One to broad group (3/rank)'}, {cost: 4, label: 'Broad to broad (4/rank)'}, {cost: 5, label: 'Anything to anything (5/rank)'}], description: 'Transform objects/creatures' },
  // Defense Effects
  { id: 'deflect', name: 'Deflect', type: 'Defense', costPerRank: 1, action: 'Standard', range: 'Ranged', duration: 'Instant', resistance: '-', description: 'Deflect ranged attacks' },
  { id: 'healing', name: 'Healing', type: 'General', costPerRank: 2, action: 'Standard', range: 'Close', duration: 'Instant', resistance: '-', description: 'Heal damage conditions' },
  { id: 'immunity', name: 'Immunity', type: 'Defense', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Immune to certain effects' },
  { id: 'immortality', name: 'Immortality', type: 'Defense', costPerRank: 2, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Return from death; time halved per rank' },
  { id: 'protection', name: 'Protection', type: 'Defense', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Increase Toughness' },
  { id: 'regeneration', name: 'Regeneration', type: 'Defense', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Recover from damage over time' },
  // General Effects
  { id: 'enhancedTrait', name: 'Enhanced Trait', type: 'General', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', variableCost: [{cost: 2, label: 'Ability (2/rank)'}, {cost: 1, label: 'Defense / Advantage (1/rank)'}, {cost: 0.5, label: 'Skill (1 PP per 2 ranks)'}], description: 'Enhance a trait (ability, skill, advantage, defense)' },
  { id: 'extraLimbs', name: 'Extra Limbs', type: 'General', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Additional limbs' },
  { id: 'feature', name: 'Feature', type: 'General', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Minor useful ability' },
  { id: 'growth', name: 'Growth', type: 'General', costPerRank: 2, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Increase size' },
  { id: 'insubstantial', name: 'Insubstantial', type: 'General', costPerRank: 5, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Become incorporeal or energy' },
  { id: 'luck', name: 'Luck Control', type: 'Control', costPerRank: 3, action: 'Free', range: 'Ranged', duration: 'Instant', resistance: '-', description: 'Control luck and fortune' },
  { id: 'morph', name: 'Morph', type: 'General', costPerRank: 5, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Change appearance' },
  { id: 'quickness', name: 'Quickness', type: 'General', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Perform routine tasks faster' },
  { id: 'shrinking', name: 'Shrinking', type: 'General', costPerRank: 2, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Decrease size' },
  { id: 'summon', name: 'Summon', type: 'Control', costPerRank: 2, action: 'Standard', range: 'Close', duration: 'Sustained', resistance: '-', description: 'Summon a minion' },
  { id: 'variable', name: 'Variable', type: 'General', costPerRank: 7, action: 'Standard', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Reconfigurable trait points (5 PP per rank)' },
  // Movement Effects
  { id: 'burrowing', name: 'Burrowing', type: 'Movement', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Dig through earth and ground' },
  { id: 'elongation', name: 'Elongation', type: 'General', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Stretch and extend body' },
  { id: 'flight', name: 'Flight', type: 'Movement', costPerRank: 2, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Fly through the air' },
  { id: 'leaping', name: 'Leaping', type: 'Movement', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Instant', resistance: '-', description: 'Leap great distances' },
  { id: 'movement', name: 'Movement', type: 'Movement', costPerRank: 2, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Special movement modes' },
  { id: 'speed', name: 'Speed', type: 'Movement', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Move at super speed' },
  { id: 'swimming', name: 'Swimming', type: 'Movement', costPerRank: 1, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Swim at super speed' },
  { id: 'teleport', name: 'Teleport', type: 'Movement', costPerRank: 2, action: 'Move', range: 'Rank', duration: 'Instant', resistance: '-', description: 'Instant transportation' },
  // Sensory Effects
  { id: 'communication', name: 'Communication', type: 'Sensory', costPerRank: 4, action: 'Free', range: 'Rank', duration: 'Sustained', resistance: '-', description: 'Communicate at distance' },
  { id: 'comprehend', name: 'Comprehend', type: 'Sensory', costPerRank: 2, action: 'None', range: 'Personal', duration: 'Sustained', resistance: '-', description: 'Understand languages/creatures' },
  { id: 'concealment', name: 'Concealment', type: 'Sensory', costPerRank: 2, action: 'Free', range: 'Personal', duration: 'Sustained', resistance: '-', variableCost: [{cost: 1, label: 'One sense (1/rank)'}, {cost: 2, label: 'Entire sense type (2/rank)'}], description: 'Hide from a sense or sense type' },
  { id: 'illusion', name: 'Illusion', type: 'Control', costPerRank: 1, action: 'Standard', range: 'Perception', duration: 'Sustained', resistance: 'Will', variableCost: [{cost: 1, label: 'One sense type (1/rank)'}, {cost: 2, label: 'Two sense types (2/rank)'}, {cost: 3, label: 'Three sense types (3/rank)'}, {cost: 4, label: 'Four sense types (4/rank)'}, {cost: 5, label: 'All senses (5/rank)'}], description: 'Create false sensory impressions' },
  { id: 'mindReading', name: 'Mind Reading', type: 'Sensory', costPerRank: 2, action: 'Standard', range: 'Perception', duration: 'Sustained', resistance: 'Will', description: 'Read surface thoughts' },
  { id: 'remoteSensing', name: 'Remote Sensing', type: 'Sensory', costPerRank: 1, action: 'Free', range: 'Rank', duration: 'Sustained', resistance: '-', variableCost: [{cost: 1, label: 'One sense type (1/rank)'}, {cost: 2, label: 'Two sense types (2/rank)'}, {cost: 3, label: 'Three sense types (3/rank)'}, {cost: 4, label: 'Four sense types (4/rank)'}], description: 'Perceive at a distance' },
  { id: 'senses', name: 'Senses', type: 'Sensory', costPerRank: 1, action: 'None', range: 'Personal', duration: 'Permanent', resistance: '-', description: 'Enhanced or unusual senses' },
];

const POWER_EFFECT_TYPES = ['Attack', 'Control', 'Defense', 'General', 'Movement', 'Sensory'];

// Power Modifiers (Extras and Flaws) — Complete General + Effect-Specific
const POWER_EXTRAS = [
  // General Extras
  { id: 'affectsCorporeal', name: 'Affects Corporeal', costType: 'perRank', costValue: 1, description: 'Affect corporeal beings while insubstantial' },
  { id: 'affectsInsubstantial', name: 'Affects Insubstantial', costType: 'perRank', costValue: 1, description: 'Half effect on insubstantial (1 rank) or full effect (2 ranks)' },
  { id: 'affectsObjects', name: 'Affects Objects', costType: 'perRank', costValue: 1, description: 'Effect works on objects (only or also, +1/rank)' },
  { id: 'affectsOthers', name: 'Affects Others', costType: 'perRank', costValue: 1, description: 'Personal range effect can also be used on others' },
  { id: 'alternateResistance0', name: 'Alternate Resistance (+0)', costType: 'perRank', costValue: 0, noRanks: true, description: 'Use a different but equally-effective resistance' },
  { id: 'alternateResistancePlus', name: 'Alternate Resistance (+1)', costType: 'perRank', costValue: 1, noRanks: true, description: 'Use a more-effective resistance for the effect' },
  { id: 'attackExtra', name: 'Attack', costType: 'perRank', costValue: 0, noRanks: true, description: 'Changes Personal range to Close attack (+0/rank)' },
  { id: 'contagious', name: 'Contagious', costType: 'perRank', costValue: 1, noRanks: true, description: 'Effect spreads on contact with affected target' },
  { id: 'continuous', name: 'Continuous', costType: 'perRank', costValue: 1, noRanks: true, description: 'Duration becomes Continuous (lasts until countered, no action to maintain)' },
  { id: 'impervious', name: 'Impervious', costType: 'perRank', costValue: 1, appliesTo: ['protection', 'enhancedTrait'], description: 'Ignore effects with rank ≤ half your rank (for resistance defenses)' },
  { id: 'increasedDuration', name: 'Increased Duration', costType: 'perRank', costValue: 1, description: 'Increase duration by one step (Instant\u2192Concentration\u2192Sustained\u2192Continuous)' },
  { id: 'increasedRange1', name: 'Increased Range (+1 step)', costType: 'perRank', costValue: 1, noRanks: true, description: 'Increase range one step (Close\u2192Ranged or Ranged\u2192Perception)' },
  { id: 'increasedRange2', name: 'Increased Range (+2 steps)', costType: 'perRank', costValue: 2, noRanks: true, description: 'Increase range two steps (Close\u2192Perception)' },
  { id: 'multiattack', name: 'Multiattack', costType: 'perRank', costValue: 1, noRanks: true, description: 'Attack multiple targets or rapid fire for +2/+5 effect bonus' },
  { id: 'reaction', name: 'Reaction', costType: 'perRank', costValue: 3, noRanks: true, description: 'Effect triggers as a reaction to a specified event' },
  { id: 'secondaryEffect', name: 'Secondary Effect', costType: 'perRank', costValue: 1, noRanks: true, description: 'Instant effect applies again on the next round automatically' },
  { id: 'selective', name: 'Selective', costType: 'perRank', costValue: 1, noRanks: true, description: 'Choose who is affected within an area' },
  // Area subtypes (+1/rank each except Perception which is +2)
  { id: 'areaBurst', name: 'Area: Burst', costType: 'perRank', costValue: 1, description: '30-ft radius burst centered on a point in range' },
  { id: 'areaCloud', name: 'Area: Cloud', costType: 'perRank', costValue: 1, description: 'Like Burst, but lingers and can spread with wind' },
  { id: 'areaCone', name: 'Area: Cone', costType: 'perRank', costValue: 1, description: '60-ft cone originating from you' },
  { id: 'areaCylinder', name: 'Area: Cylinder', costType: 'perRank', costValue: 1, description: '30-ft radius \u00d7 30-ft tall cylinder' },
  { id: 'areaLine', name: 'Area: Line', costType: 'perRank', costValue: 1, description: '5-ft wide \u00d7 rank distance line from you' },
  { id: 'areaPerception', name: 'Area: Perception', costType: 'perRank', costValue: 2, description: 'Affects all targets you can perceive (+2/rank)' },
  { id: 'areaShapeable', name: 'Area: Shapeable', costType: 'perRank', costValue: 1, description: 'Rank cubes (30-ft each) you arrange contiguously' },
  // Affliction-specific
  { id: 'cumulative', name: 'Cumulative', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['affliction', 'weaken'], description: '(Affliction/Weaken) Repeated hits accumulate degree of effect' },
  { id: 'extraCondition', name: 'Extra Condition', costType: 'perRank', costValue: 1, appliesTo: ['affliction'], description: '(Affliction) Impose an additional condition at each degree' },
  { id: 'progressive', name: 'Progressive', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['affliction', 'weaken'], description: '(Affliction/Weaken) Effect worsens each round without new attack' },
  // Create-specific
  { id: 'movable', name: 'Movable', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['create'], description: '(Create) Created objects can be physically moved' },
  // Damage / Move Object
  { id: 'damaging', name: 'Damaging', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['moveObject', 'create'], description: '(Move Object/Create) Effect also inflicts damage equal to rank' },
  // Healing-specific
  { id: 'energizing', name: 'Energizing', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['healing'], description: '(Healing) Also removes Fatigue/Exhaustion conditions' },
  { id: 'persistent', name: 'Persistent', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['healing', 'regeneration'], description: '(Healing/Regeneration) Overcomes Incurable effects' },
  { id: 'restorative', name: 'Restorative', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['healing'], description: '(Healing) Removes one condition beyond damage per rank' },
  { id: 'resurrection', name: 'Resurrection', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['healing'], description: '(Healing) Can bring back the recently dead' },
  { id: 'stabilize', name: 'Stabilize', costType: 'perRank', costValue: 0, noRanks: true, appliesTo: ['healing'], description: '(Healing) Automatically stabilize dying characters (+0)' },
  // Illusion-specific
  { id: 'independent', name: 'Independent', costType: 'perRank', costValue: 0, noRanks: true, appliesTo: ['illusion'], description: '(Illusion) Illusion acts on its own once created (+0)' },
  // Mind Reading-specific
  { id: 'effortlessMR', name: 'Effortless', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['mindReading'], description: '(Mind Reading) No resistance increase on sustained reading' },
  { id: 'sensoryLink', name: 'Sensory Link', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['mindReading'], description: '(Mind Reading) Share target\'s senses through the link' },
  // Nullify-specific
  { id: 'broad', name: 'Broad', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['nullify', 'weaken'], description: '(Nullify/Weaken) Affects a broad group of related effects' },
  { id: 'effortlessNull', name: 'Effortless', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['nullify'], description: '(Nullify) Countering is a free action instead of standard' },
  { id: 'simultaneousNull', name: 'Simultaneous', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['nullify'], description: '(Nullify) Counter all active effects on a target at once' },
  { id: 'sustainedNull', name: 'Sustained Nullify', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['nullify'], description: '(Nullify) Nullified effect is suppressed while you sustain' },
  // Protection-specific
  { id: 'sustainedProt', name: 'Sustained', costType: 'perRank', costValue: 0, noRanks: true, appliesTo: ['protection'], description: '(Protection) Sustained duration; can be Nullified, but can be Impervious (+0)' },
  // Shrinking-specific
  { id: 'normalStrength', name: 'Normal Strength', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['shrinking'], description: '(Shrinking) STR does not decrease when shrunk' },
  { id: 'normalToughness', name: 'Normal Toughness', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['shrinking'], description: '(Shrinking) Toughness does not decrease when shrunk' },
  // Summon-specific
  { id: 'active', name: 'Active', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['summon'], description: '(Summon) Summoned creature can act independently' },
  { id: 'controlled', name: 'Controlled', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['summon'], description: '(Summon) You mentally command the summoned creature' },
  { id: 'heroicSummon', name: 'Heroic', costType: 'perRank', costValue: 2, noRanks: true, appliesTo: ['summon'], description: '(Summon) Summoned creature gets Hero Points' },
  { id: 'mentalLink', name: 'Mental Link', costType: 'perRank', costValue: 1, noRanks: true, appliesTo: ['summon'], description: '(Summon) Telepathic link with summoned creature' },
  { id: 'multipleMinions', name: 'Multiple Minions', costType: 'perRank', costValue: 1, appliesTo: ['summon'], description: '(Summon) Summon 2^rank additional minions per rank' },
  { id: 'sacrifice', name: 'Sacrifice', costType: 'perRank', costValue: 0, noRanks: true, appliesTo: ['summon'], description: '(Summon) Transfer damage you take to your summoned creature (+0)' },
  { id: 'variableTypeSummon', name: 'Variable Type', costType: 'perRank', costValue: 1, appliesTo: ['summon'], description: '(Summon) Choose from narrow (1) or broad (2) creature types' },
  // Concealment-specific
  { id: 'passive', name: 'Passive', costType: 'perRank', costValue: 0, noRanks: true, appliesTo: ['concealment'], description: '(Concealment) Always on; no action to maintain (+0)' },
  // ===== FLAT EXTRAS (+N flat PP) =====
  { id: 'accurate', name: 'Accurate', costType: 'flat', costValue: 1, description: '+2 attack bonus per rank of this extra' },
  { id: 'extendedRange', name: 'Extended Range', costType: 'flat', costValue: 1, description: 'Double range per rank of this extra' },
  { id: 'homing', name: 'Homing', costType: 'flat', costValue: 1, description: 'Attack retries on miss (1 retry per rank)' },
  { id: 'incurable', name: 'Incurable', costType: 'flat', costValue: 1, noRanks: true, description: 'Damage cannot be healed by Healing or Regeneration' },
  { id: 'indirect', name: 'Indirect', costType: 'flat', costValue: 1, description: 'Attack from another point (1=fixed, 2=any, 3=any+dir, 4=any+any)' },
  { id: 'innate', name: 'Innate', costType: 'flat', costValue: 1, noRanks: true, description: 'Effect is natural\u2014cannot be Nullified' },
  { id: 'insidious', name: 'Insidious', costType: 'flat', costValue: 1, noRanks: true, description: 'Effect is especially hard to detect or identify source' },
  { id: 'linked', name: 'Linked', costType: 'flat', costValue: 0, noRanks: true, description: 'Two effects linked\u2014applied together as one action (0 PP)' },
  { id: 'penetrating', name: 'Penetrating', costType: 'flat', costValue: 1, description: 'Overcome Impervious resistance (per rank of this extra)' },
  { id: 'precise', name: 'Precise', costType: 'flat', costValue: 1, noRanks: true, description: 'Fine control over effect for precise tasks' },
  { id: 'reach', name: 'Reach', costType: 'flat', costValue: 1, description: '+5 feet reach per rank of this extra' },
  { id: 'reversible', name: 'Reversible', costType: 'flat', costValue: 1, noRanks: true, description: 'Undo the effect at will as a free action' },
  { id: 'ricochet', name: 'Ricochet', costType: 'flat', costValue: 1, description: 'Bounce attack around cover to negate cover bonus' },
  { id: 'sleep', name: 'Sleep', costType: 'flat', costValue: 0, noRanks: true, appliesTo: ['affliction'], description: '(Affliction) Third degree becomes Asleep (+0)' },
  { id: 'split', name: 'Split', costType: 'flat', costValue: 1, description: 'Split effect between 2 targets per rank of this extra' },
  { id: 'subtle', name: 'Subtle', costType: 'flat', costValue: 1, description: 'Harder to detect (1 rank=DC 20, 2 ranks=undetectable)' },
  { id: 'triggered', name: 'Triggered', costType: 'flat', costValue: 1, description: 'Pre-set activation conditions (1 prepared use per rank)' },
  { id: 'variableDescriptor2', name: 'Variable Descriptor (broad)', costType: 'flat', costValue: 2, noRanks: true, description: 'Change power descriptor within a broad group' },
  { id: 'variableDescriptor1', name: 'Variable Descriptor (narrow)', costType: 'flat', costValue: 1, noRanks: true, description: 'Change power descriptor within a narrow group' },
  // Teleport-specific
  { id: 'changeDirection', name: 'Change Direction', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['teleport'], description: '(Teleport) Choose facing after teleporting' },
  { id: 'changeVelocity', name: 'Change Velocity', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['teleport'], description: '(Teleport) Arrive at any speed from 0 to your max' },
  { id: 'easy', name: 'Easy', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['teleport'], description: '(Teleport) Teleport as a free action instead of move' },
  { id: 'extendedTeleport', name: 'Extended Teleport', costType: 'flat', costValue: 1, appliesTo: ['teleport'], description: '(Teleport) Doubles distance per rank of this extra' },
  { id: 'increasedMass', name: 'Increased Mass', costType: 'flat', costValue: 1, description: 'Carry additional mass per rank' },
  { id: 'portal', name: 'Portal', costType: 'perRank', costValue: 2, noRanks: true, appliesTo: ['teleport'], description: '(Teleport) Open a portal others can pass through (+2/rank)' },
  { id: 'turnabout', name: 'Turnabout', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['teleport'], description: '(Teleport) Teleport, take a standard action, then teleport back' },
  // Remote Sensing / Communication
  { id: 'dimensional', name: 'Dimensional', costType: 'flat', costValue: 1, appliesTo: ['remoteSensing', 'communication', 'teleport', 'movement'], description: '(Remote Sensing/Communication) Works across dimensions (1=one, 2=related, 3=any)' },
  { id: 'noConduit', name: 'No Conduit', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['remoteSensing'], description: '(Remote Sensing) Attacks on your remote senses don\'t affect you' },
  { id: 'rapidComm', name: 'Rapid', costType: 'flat', costValue: 1, appliesTo: ['communication'], description: '(Communication) Communicate faster (x10 speed per rank)' },
  { id: 'selectiveComm', name: 'Selective', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['communication'], description: '(Communication) Choose who can hear your broadcast' },
  { id: 'simultaneousRS', name: 'Simultaneous', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['remoteSensing'], description: '(Remote Sensing) Use remote senses and your own at the same time' },
  // Morph-specific
  { id: 'metamorph', name: 'Metamorph', costType: 'flat', costValue: 1, noRanks: true, appliesTo: ['morph'], description: '(Morph) Completely different character sheet per form' },
];

const POWER_FLAWS = [
  // General Flaws
  { id: 'concentration', name: 'Concentration', costType: 'perRank', costValue: -1, noRanks: true, description: 'Requires concentration to maintain (Sustained\u2192Concentration)' },
  { id: 'distracting', name: 'Distracting', costType: 'perRank', costValue: -1, noRanks: true, description: 'You are Vulnerable while using this effect' },
  { id: 'fades', name: 'Fades', costType: 'perRank', costValue: -1, noRanks: true, description: 'Effect rank decreases by 1 each round' },
  { id: 'feedback', name: 'Feedback', costType: 'perRank', costValue: -1, noRanks: true, description: 'You suffer damage when your effect is damaged/countered' },
  { id: 'grabBased', name: 'Grab-Based', costType: 'perRank', costValue: -1, noRanks: true, description: 'Must successfully grab target first' },
  { id: 'increasedAction', name: 'Increased Action', costType: 'perRank', costValue: -1, description: 'Action to use increases by one step (Free\u2192Move\u2192Standard\u2192Full)' },
  { id: 'limited', name: 'Limited', costType: 'perRank', costValue: -1, noRanks: true, description: 'Effect works in roughly half of normal circumstances' },
  { id: 'permanent', name: 'Permanent', costType: 'perRank', costValue: -1, noRanks: true, description: 'Cannot turn off or adjust (Sustained becomes Permanent)' },
  { id: 'reducedRange', name: 'Reduced Range', costType: 'perRank', costValue: -1, description: 'Decrease range by one step per rank (Perception→Ranged→Close)' },
  { id: 'resistible', name: 'Resistible', costType: 'perRank', costValue: -1, noRanks: true, description: 'Additional resistance check to avoid the effect' },
  { id: 'senseDependent', name: 'Sense-Dependent', costType: 'perRank', costValue: -1, noRanks: true, description: 'Target must perceive you/effect via a specific sense type' },
  { id: 'sideEffect', name: 'Side Effect', costType: 'perRank', costValue: -1, description: 'Suffer an effect on failure (-1); or always (-2)' },
  { id: 'sourceDependent', name: 'Source-Dependent', costType: 'perRank', costValue: -1, noRanks: true, description: 'Requires an external source/substance to function' },
  { id: 'tiring', name: 'Tiring', costType: 'perRank', costValue: -1, noRanks: true, description: 'Gain one Fatigue level per use' },
  { id: 'uncontrolled', name: 'Uncontrolled', costType: 'perRank', costValue: -1, noRanks: true, description: 'GM controls activation and targeting' },
  { id: 'unreliableLimited', name: 'Unreliable (5 uses)', costType: 'perRank', costValue: -1, noRanks: true, description: 'Limited to 5 uses per encounter/scene' },
  { id: 'unreliable', name: 'Unreliable (50%)', costType: 'perRank', costValue: -1, noRanks: true, description: '50% chance of not working on each use (roll 11+ on d20)' },
  // Affliction
  { id: 'limitedDegree', name: 'Limited Degree', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['affliction'], description: '(Affliction) Conditions limited to two degrees maximum' },
  // Create
  { id: 'proportional', name: 'Proportional', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['create'], description: '(Create) Volume proportional to rank (can\'t exceed)' },
  { id: 'stationary', name: 'Stationary', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['create'], description: '(Create) Created objects are anchored in place' },
  { id: 'tethered', name: 'Tethered', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['create'], description: '(Create) Objects must remain within range or vanish' },
  // Enhanced Trait
  { id: 'reducedTrait', name: 'Reduced Trait', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['enhancedTrait'], description: '(Enhanced Trait) Reduces a trait instead of enhancing it' },
  // Flight
  { id: 'glidingFlaw', name: 'Gliding', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['flight'], description: '(Flight) Can only descend, 1 rank distance per round' },
  { id: 'platformFlaw', name: 'Platform', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['flight'], description: '(Flight) Must stand on a visible platform object' },
  { id: 'wingsFlaw', name: 'Wings', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['flight'], description: '(Flight) Requires wings\u2014can be bound/entangled' },
  // Healing
  { id: 'limitedHealingOthers', name: 'Limited: Others Only', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['healing'], description: '(Healing) Can only heal others, not yourself' },
  // Insubstantial
  { id: 'permanentInsub', name: 'Permanent', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['insubstantial'], description: '(Insubstantial) Always insubstantial; cannot turn off' },
  // Morph
  { id: 'singleForm', name: 'Limited: Single Form', costType: 'perRank', costValue: -1, noRanks: true, appliesTo: ['morph'], description: '(Morph) Can only take one specific other form' },
  // ===== FLAT FLAWS (reduce total by flat PP) =====
  { id: 'activation', name: 'Activation', costType: 'flat', costValue: -1, description: 'Move action (-1) or Standard action (-2) to activate' },
  { id: 'checkRequired', name: 'Check Required', costType: 'flat', costValue: -1, description: 'Skill check needed (DC 10 + rank of flaw per use)' },
  { id: 'diminishedRange', name: 'Diminished Range', costType: 'flat', costValue: -1, description: 'Reduce short/medium/long range by 1 factor per rank' },
  { id: 'inaccurate', name: 'Inaccurate', costType: 'flat', costValue: -1, description: '-2 attack bonus per rank of this flaw' },
  { id: 'noticeable', name: 'Noticeable', costType: 'flat', costValue: -1, noRanks: true, description: 'Power is obvious when active (for normally subtle effects)' },
  { id: 'quirk', name: 'Quirk', costType: 'flat', costValue: -1, description: 'A minor limitation worth -1 point each (describe)' },
  // ===== SPECIAL FLAWS =====
  { id: 'easilyRemovable', name: 'Easily Removable (-2/5 pts)', costType: 'special', costValue: -2, description: 'Device dropped or taken easily. Reduce total by 2 per 5.' },
  { id: 'removable', name: 'Removable (-1/5 pts)', costType: 'special', costValue: -1, description: 'Device can be taken with Disarm/Grab. Reduce total by 1 per 5.' },
];

// Immunity options with group/includes relationships
const IMMUNITY_OPTIONS = [
  // Individual options (1 rank each)
  { id: 'aging', name: 'Aging', ranks: 1, group: 'individual' },
  { id: 'disease', name: 'Disease', ranks: 1, group: 'lifeSupport' },
  { id: 'poison', name: 'Poison', ranks: 1, group: 'lifeSupport' },
  { id: 'envCold', name: 'Environmental Cold', ranks: 1, group: 'environmental' },
  { id: 'envHeat', name: 'Environmental Heat', ranks: 1, group: 'environmental' },
  { id: 'envPressure', name: 'Environmental Pressure', ranks: 1, group: 'environmental' },
  { id: 'envRadiation', name: 'Environmental Radiation', ranks: 1, group: 'environmental' },
  { id: 'starvationThirst', name: 'Starvation & Thirst', ranks: 1, group: 'lifeSupport' },
  { id: 'suffocation', name: 'Suffocation', ranks: 1, group: 'lifeSupport' },
  { id: 'sleep', name: 'Sleep', ranks: 1, group: 'individual' },
  // 2-rank options
  { id: 'criticalHits', name: 'Critical Hits', ranks: 2, group: 'individual' },
  // 5-rank grouped options
  { id: 'sensoryAffliction', name: 'Sensory Affliction Effects', ranks: 5, group: 'individual' },
  { id: 'interactionSkills', name: 'Interaction Skills', ranks: 5, group: 'individual' },
  { id: 'entrapment', name: 'Entrapment (grab/snare)', ranks: 5, group: 'individual' },
  { id: 'fatigueEffects', name: 'Fatigue Effects', ranks: 5, group: 'individual' },
  // Composite: All Environmental (includes the 4 env options)
  { id: 'allEnvironmental', name: 'All Environmental', ranks: 5, group: 'composite', includes: ['envCold', 'envHeat', 'envPressure', 'envRadiation'] },
  // Composite: Life Support (includes disease, poison, env×4, starvation, suffocation)
  { id: 'lifeSupport', name: 'Life Support', ranks: 10, group: 'composite', includes: ['disease', 'poison', 'envCold', 'envHeat', 'envPressure', 'envRadiation', 'starvationThirst', 'suffocation'] },
  // 10-rank options
  { id: 'commonDamage', name: 'Common Damage Type', ranks: 10, group: 'individual' },
  // Half/full effect immunities
  { id: 'fortHalf', name: 'Fortitude Effects (half)', ranks: 15, group: 'individual' },
  { id: 'willHalf', name: 'Will Effects (half)', ranks: 15, group: 'individual' },
  { id: 'toughHalf', name: 'Toughness Effects (half)', ranks: 20, group: 'individual' },
  { id: 'fortFull', name: 'Fortitude Effects (full)', ranks: 30, group: 'individual' },
  { id: 'willFull', name: 'Will Effects (full)', ranks: 30, group: 'individual' },
  { id: 'toughFull', name: 'Toughness Effects (full)', ranks: 40, group: 'individual' },
  { id: 'allDamage', name: 'All Damage', ranks: 80, group: 'individual' },
];

// Legacy alias for reference display
const IMMUNITY_EXAMPLES = IMMUNITY_OPTIONS;

// Insubstantial types — each rank is a specific form
const INSUBSTANTIAL_TYPES = [
  { id: 'fluid', name: 'Fluid', rank: 1, description: 'Liquid form; flow through any opening that is not watertight, escape non-watertight restraints, retain normal Strength' },
  { id: 'gaseous', name: 'Gaseous', rank: 2, description: 'Gaseous form; no effective Strength, Immunity to Physical Damage, energy and area attacks affect normally, flow through non-airtight openings' },
  { id: 'energy', name: 'Energy', rank: 3, description: 'Coherent energy form; no effective Strength, Immunity to Physical Damage, energy attacks damage normally (except own type), pass through energy-permeable barriers' },
  { id: 'incorporeal', name: 'Incorporeal', rank: 4, description: 'Incorporeal phantom; no effective Strength, Immunity to Physical and Energy Damage, pass through solid matter, one chosen effect/descriptor still affects you' },
];

// Complication types
const COMPLICATION_TYPES = [
  'Motivation',
  'Accident',
  'Addiction',
  'Disability',
  'Enemy',
  'Fame',
  'Hatred',
  'Honor',
  'Identity',
  'Obsession',
  'Phobia',
  'Power Loss',
  'Prejudice',
  'Quirk',
  'Relationship',
  'Reputation',
  'Responsibility',
  'Rivalry',
  'Secret',
  'Temper',
  'Weakness',
  'Other',
];

// Measurement table (for speed, distance, etc.)
const MEASUREMENT_TABLE = {
  '-5': { distance: '6 inches', mass: '1.5 lbs', time: 'One-eighth second' },
  '-4': { distance: '1 foot', mass: '3 lbs', time: 'One-quarter second' },
  '-3': { distance: '3 feet', mass: '6 lbs', time: 'One-half second' },
  '-2': { distance: '6 feet', mass: '12 lbs', time: '1 second' },
  '-1': { distance: '15 feet', mass: '25 lbs', time: '3 seconds' },
  '0': { distance: '30 feet', mass: '50 lbs', time: '6 seconds' },
  '1': { distance: '60 feet', mass: '100 lbs', time: '12 seconds' },
  '2': { distance: '120 feet', mass: '200 lbs', time: '30 seconds' },
  '3': { distance: '250 feet', mass: '400 lbs', time: '1 minute' },
  '4': { distance: '500 feet', mass: '800 lbs', time: '2 minutes' },
  '5': { distance: '900 feet', mass: '1,600 lbs', time: '4 minutes' },
  '6': { distance: '1,800 feet', mass: '3,200 lbs', time: '8 minutes' },
  '7': { distance: '0.5 mile', mass: '3 tons', time: '15 minutes' },
  '8': { distance: '1 mile', mass: '6 tons', time: '30 minutes' },
  '9': { distance: '2 miles', mass: '12 tons', time: '1 hour' },
  '10': { distance: '4 miles', mass: '25 tons', time: '2 hours' },
  '11': { distance: '8 miles', mass: '50 tons', time: '4 hours' },
  '12': { distance: '16 miles', mass: '100 tons', time: '8 hours' },
  '13': { distance: '30 miles', mass: '200 tons', time: '16 hours' },
  '14': { distance: '60 miles', mass: '400 tons', time: '1 day' },
  '15': { distance: '120 miles', mass: '800 tons', time: '2 days' },
  '16': { distance: '250 miles', mass: '1,600 tons', time: '4 days' },
  '17': { distance: '500 miles', mass: '3.2K tons', time: '1 week' },
  '18': { distance: '1,000 miles', mass: '6.4K tons', time: '2 weeks' },
  '19': { distance: '2,000 miles', mass: '12.5K tons', time: '1 month' },
  '20': { distance: '4,000 miles', mass: '25K tons', time: '2 months' },
};

// Condition tracks for Affliction
const AFFLICTION_CONDITIONS = {
  first: ['Dazed', 'Fatigued', 'Hindered', 'Impaired', 'Vulnerable'],
  second: ['Compelled', 'Defenseless', 'Disabled', 'Exhausted', 'Immobile', 'Prone', 'Stunned'],
  third: ['Asleep', 'Controlled', 'Incapacitated', 'Paralyzed', 'Transformed', 'Unaware'],
};

// Full conditions reference
const CONDITIONS = [
  { name: 'Asleep', description: 'Defenseless, Stunned, and Unaware. Wakes from sudden movement or damage.' },
  { name: 'Blind', description: 'Hindered, visually Unaware. All targets have total concealment from you.' },
  { name: 'Bound', description: 'Defenseless and Immobile.' },
  { name: 'Compelled', description: 'Directed by outside force. Free actions and Dodge/Parry OK.' },
  { name: 'Controlled', description: 'Directed by outside force. No free will (3rd degree Compelled).' },
  { name: 'Dazed', description: 'Limited to free actions and one standard action per turn.' },
  { name: 'Deaf', description: 'Cannot hear. –5 Perception. –4 initiative.' },
  { name: 'Debilitated', description: 'One or more abilities at –5 (3rd degree Impaired).' },
  { name: 'Defenseless', description: 'Defense is 0. Attackers can make finishing attacks (2nd degree Vulnerable).' },
  { name: 'Disabled', description: 'One or more abilities at –2 (2nd degree Impaired).' },
  { name: 'Dying', description: 'Incapacitated and near death. Fortitude DC 15 each round or die.' },
  { name: 'Entranced', description: 'Fascination. Takes no action. Any threat or attack ends it.' },
  { name: 'Exhausted', description: 'Hindered and Impaired (2nd degree Fatigued).' },
  { name: 'Fatigued', description: 'Hindered. –1 to all checks.' },
  { name: 'Hindered', description: 'Speed rank –1 (half speed if already 0).' },
  { name: 'Immobile', description: 'Speed 0, cannot move (2nd degree Hindered).' },
  { name: 'Impaired', description: '–2 penalty to checks with one or more abilities.' },
  { name: 'Incapacitated', description: 'Defenseless, Stunned, Unaware. No actions at all.' },
  { name: 'Normal', description: 'No conditions applied.' },
  { name: 'Paralyzed', description: 'Defenseless, Immobile, physically Stunned.' },
  { name: 'Prone', description: 'Hindered. –5 penalty on close attack checks. Close attacks against you get +2. Ranged attacks against you suffer –2.' },
  { name: 'Restrained', description: 'Hindered and Vulnerable.' },
  { name: 'Staggered', description: 'Dazed and Hindered.' },
  { name: 'Stunned', description: 'Cannot take any actions (2nd degree Dazed).' },
  { name: 'Surprised', description: 'Stunned and Vulnerable for 1 round.' },
  { name: 'Transformed', description: 'Physically altered into another form.' },
  { name: 'Unaware', description: 'Cannot perceive self or surroundings. Defenseless to attacks.' },
  { name: 'Vulnerable', description: 'Defense is halved (round up).' },
  { name: 'Weakened', description: 'One or more traits reduced by effect rank.' },
];

// Power Descriptors (common)
const POWER_DESCRIPTORS = [
  'Alien', 'Biological', 'Chemical', 'Chi', 'Cold', 'Cosmic',
  'Darkness', 'Dimensional', 'Divine', 'Earth', 'Electricity',
  'Emotion', 'Energy', 'Entropy', 'Fire', 'Force', 'Gravity',
  'Ice', 'Impact', 'Kinetic', 'Light', 'Magic', 'Magnetism',
  'Mental', 'Morphic', 'Mutation', 'Nature', 'Necromantic',
  'Physical', 'Plant', 'Plasma', 'Psionic', 'Radiation',
  'Skill', 'Sonic', 'Spatial', 'Speed Force', 'Temporal',
  'Technology', 'Training', 'Water', 'Weather', 'Wind',
];

// Movement subtypes (for the Movement power effect)
const MOVEMENT_TYPES = [
  { name: 'Dimensional Travel', ranks: '1-3', cost: 2, description: '1=single dimension, 2=related group, 3=any dimension' },
  { name: 'Environmental Adaptation', ranks: 1, cost: 2, description: 'No penalties in a particular environment' },
  { name: 'Permeate', ranks: '1-3', cost: 2, description: '1=half speed through solid, 2=full speed, 3=full through any solid' },
  { name: 'Safe Fall', ranks: 1, cost: 2, description: 'Fall any distance without harm' },
  { name: 'Slithering', ranks: 1, cost: 2, description: 'Move while prone at full speed, no penalty' },
  { name: 'Space Travel', ranks: '1-3', cost: 2, description: '1=within solar system, 2=within galaxy, 3=intergalactic' },
  { name: 'Sure-footed', ranks: '1+', cost: 2, description: 'Ignore movement penalties from terrain per rank' },
  { name: 'Swinging', ranks: 1, cost: 2, description: 'Swing on lines at full speed' },
  { name: 'Time Travel', ranks: '1-2', cost: 2, description: '1=past or future, 2=both' },
  { name: 'Trackless', ranks: '1-2', cost: 2, description: '1=half Perception DC to track, 2=no tracks' },
  { name: 'Wall-crawling', ranks: '1-2', cost: 2, description: '1=cling at half speed, 2=full speed' },
  { name: 'Water-walking', ranks: 1, cost: 2, description: 'Walk on liquid surfaces' },
];

// Senses subtypes (for the Senses power effect)
const SENSES_TYPES = [
  { name: 'Accurate', ranks: 2, description: 'Sense can pinpoint source (2 ranks per sense type)' },
  { name: 'Acute', ranks: 1, description: 'Sense can perceive fine detail (1 rank per sense type)' },
  { name: 'Analytical', ranks: 1, description: 'Sense can analyze composition (1 rank per sense type)' },
  { name: 'Awareness', ranks: 1, description: 'Detect a specific descriptor (magic, mental, etc.)' },
  { name: 'Communication Link', ranks: 1, description: 'Communicate with a specific individual' },
  { name: 'Counters Concealment', ranks: 2, description: 'Ignore concealment for one sense type' },
  { name: 'Counters Illusion', ranks: 2, description: 'Ignore illusions for one sense type' },
  { name: 'Danger Sense', ranks: 1, description: 'Perception check to avoid surprise' },
  { name: 'Darkvision', ranks: 2, description: 'See in total darkness' },
  { name: 'Detect', ranks: '1-2', description: '1=vague, 2=pointed. New sense for specific thing.' },
  { name: 'Direction Sense', ranks: 1, description: 'Always know which direction is north' },
  { name: 'Distance Sense', ranks: 1, description: 'Always know exact distances' },
  { name: 'Extended', ranks: 1, description: 'x10 range increment per rank for one sense' },
  { name: 'Infravision', ranks: 1, description: 'See in infrared (see heat)' },
  { name: 'Low-light Vision', ranks: 1, description: 'See in dim light as if bright' },
  { name: 'Microscopic Vision', ranks: '1-4', description: '1=dust, 2=cells, 3=DNA, 4=atomic' },
  { name: 'Penetrates Concealment', ranks: 4, description: 'Sense ignores all concealment' },
  { name: 'Postcognition', ranks: 4, description: 'Perceive past events at current location' },
  { name: 'Precognition', ranks: 4, description: 'Perceive possible future events' },
  { name: 'Radio', ranks: 1, description: 'Hear radio frequencies' },
  { name: 'Radius', ranks: 1, description: 'Sense works in all directions' },
  { name: 'Ranged', ranks: 1, description: 'Use a normally close sense at range' },
  { name: 'Rapid', ranks: 1, description: 'Process sensory information at x10 speed per rank' },
  { name: 'Time Sense', ranks: 1, description: 'Always know exactly what time it is' },
  { name: 'Tracking', ranks: '1-2', description: '1=half speed, 2=full speed tracking' },
  { name: 'Ultra-hearing', ranks: 1, description: 'Hear ultrasonic and subsonic frequencies' },
  { name: 'Ultravision', ranks: 1, description: 'See ultraviolet light' },
];

// Comprehend subtypes (for the Comprehend power effect)
const COMPREHEND_TYPES = [
  { name: 'Languages (understand)', ranks: 1, cost: 2, description: 'Understand any spoken language' },
  { name: 'Languages (speak)', ranks: 1, cost: 2, description: 'Speak any language you understand' },
  { name: 'Languages (read)', ranks: 1, cost: 2, description: 'Read any language' },
  { name: 'Languages (understood)', ranks: 1, cost: 2, description: 'Others understand you regardless of language' },
  { name: 'Animals (understand)', ranks: 1, cost: 2, description: 'Understand animals' },
  { name: 'Animals (speak)', ranks: 1, cost: 2, description: 'Speak to animals' },
  { name: 'Plants', ranks: 1, cost: 2, description: 'Communicate with plants' },
  { name: 'Machines', ranks: 1, cost: 2, description: 'Communicate with machines' },
  { name: 'Spirits', ranks: 1, cost: 2, description: 'Communicate with spirits' },
  { name: 'Objects', ranks: 1, cost: 2, description: 'Communicate with objects (psychometry)' },
];

// Common equipment (for Equipment advantage, 5 EP per rank)
// Costs and stats from d20herosrd.com/7-gadgets-gear/
const EQUIPMENT_LIST = [
  // Melee Weapons — Simple
  { name: 'Brass Knuckles', cost: 1, type: 'Weapon', details: 'Str-based Damage 1, bludgeoning, Close', attack: { type: 'close', effect: 'Damage', rank: 1, strBased: true } },
  { name: 'Club', cost: 2, type: 'Weapon', details: 'Str-based Damage 2, bludgeoning, Close', attack: { type: 'close', effect: 'Damage', rank: 2, strBased: true } },
  { name: 'Knife', cost: 2, type: 'Weapon', details: 'Str-based Damage 1, piercing, Close, Critical 19-20', attack: { type: 'close', effect: 'Damage', rank: 1, strBased: true, notes: 'Crit 19-20' } },
  { name: 'Pepper Spray', cost: 2, type: 'Weapon', details: 'Close Visual Dazzle 4, chemical', attack: { type: 'close', effect: 'Dazzle', rank: 4 } },
  { name: 'Stun Gun', cost: 5, type: 'Weapon', details: 'Close Affliction 5 (Dazed/Stunned/Incapacitated), electrical', attack: { type: 'close', effect: 'Affliction', rank: 5 } },
  // Melee Weapons — Archaic
  { name: 'Battleaxe', cost: 3, type: 'Weapon', details: 'Str-based Damage 3, slashing, Close', attack: { type: 'close', effect: 'Damage', rank: 3, strBased: true } },
  { name: 'Sword', cost: 4, type: 'Weapon', details: 'Str-based Damage 3, slashing, Close, Critical 19-20', attack: { type: 'close', effect: 'Damage', rank: 3, strBased: true, notes: 'Crit 19-20' } },
  { name: 'Spear', cost: 4, type: 'Weapon', details: 'Str-based Damage 3, piercing, Close, Critical 19-20, Thrown', attack: { type: 'close', effect: 'Damage', rank: 3, strBased: true, notes: 'Crit 19-20, Thrown' } },
  { name: 'Warhammer', cost: 3, type: 'Weapon', details: 'Str-based Damage 3, bludgeoning, Close', attack: { type: 'close', effect: 'Damage', rank: 3, strBased: true } },
  // Melee Weapons — Exotic
  { name: 'Chain', cost: 6, type: 'Weapon', details: 'Str-based Damage 2, Close, Improved Grab, Improved Trip, Reach 2', attack: { type: 'close', effect: 'Damage', rank: 2, strBased: true, notes: 'Grab, Trip, Reach 2' } },
  { name: 'Chainsaw', cost: 6, type: 'Weapon', details: 'Damage 6, slashing, Close (not Str-based)', attack: { type: 'close', effect: 'Damage', rank: 6 } },
  { name: 'Nunchaku', cost: 3, type: 'Weapon', details: 'Str-based Damage 2, bludgeoning, Close, Critical 19-20', attack: { type: 'close', effect: 'Damage', rank: 2, strBased: true, notes: 'Crit 19-20' } },
  { name: 'Whip', cost: 5, type: 'Weapon', details: 'Close, Improved Grab, Improved Trip, Reach 3', attack: { type: 'close', effect: 'Grab/Trip', rank: 0, notes: 'Reach 3' } },
  // Ranged Weapons — Projectile
  { name: 'Holdout Pistol', cost: 4, type: 'Weapon', details: 'Ranged Damage 2', attack: { type: 'ranged', effect: 'Damage', rank: 2 } },
  { name: 'Light Pistol', cost: 6, type: 'Weapon', details: 'Ranged Damage 3', attack: { type: 'ranged', effect: 'Damage', rank: 3 } },
  { name: 'Heavy Pistol', cost: 8, type: 'Weapon', details: 'Ranged Damage 4', attack: { type: 'ranged', effect: 'Damage', rank: 4 } },
  { name: 'Machine Pistol', cost: 9, type: 'Weapon', details: 'Ranged Multiattack Damage 3', attack: { type: 'ranged', effect: 'Damage', rank: 3, notes: 'Multiattack' } },
  { name: 'Submachine Gun', cost: 12, type: 'Weapon', details: 'Ranged Multiattack Damage 4', attack: { type: 'ranged', effect: 'Damage', rank: 4, notes: 'Multiattack' } },
  { name: 'Shotgun', cost: 10, type: 'Weapon', details: 'Ranged Damage 5 (Accurate 1 w/ shot, Limited vs Protection)', attack: { type: 'ranged', effect: 'Damage', rank: 5, bonusMod: 2, notes: 'Accurate 1' } },
  { name: 'Assault Rifle', cost: 15, type: 'Weapon', details: 'Ranged Multiattack Damage 5', attack: { type: 'ranged', effect: 'Damage', rank: 5, notes: 'Multiattack' } },
  { name: 'Sniper Rifle', cost: 11, type: 'Weapon', details: 'Ranged Damage 5, Critical 19-20', attack: { type: 'ranged', effect: 'Damage', rank: 5, notes: 'Crit 19-20' } },
  { name: 'Bow', cost: 6, type: 'Weapon', details: 'Ranged Str-based Damage 3', attack: { type: 'ranged', effect: 'Damage', rank: 3, strBased: true } },
  { name: 'Crossbow', cost: 7, type: 'Weapon', details: 'Ranged Damage 3, Critical 19-20', attack: { type: 'ranged', effect: 'Damage', rank: 3, notes: 'Crit 19-20' } },
  // Ranged Weapons — Energy
  { name: 'Blaster Pistol', cost: 10, type: 'Weapon', details: 'Ranged Damage 5', attack: { type: 'ranged', effect: 'Damage', rank: 5 } },
  { name: 'Blaster Rifle', cost: 16, type: 'Weapon', details: 'Ranged Damage 8', attack: { type: 'ranged', effect: 'Damage', rank: 8 } },
  { name: 'Taser', cost: 10, type: 'Weapon', details: 'Ranged Affliction 5 (Dazed/Stunned/Incapacitated; Fort DC 15)', attack: { type: 'ranged', effect: 'Affliction', rank: 5 } },
  // Ranged Weapons — Heavy
  { name: 'Flamethrower', cost: 13, type: 'Weapon', details: 'Cone or Line Area Damage 6, fire', attack: { type: 'area', effect: 'Damage', rank: 6, notes: 'Cone/Line Area' } },
  { name: 'Grenade Launcher', cost: 15, type: 'Weapon', details: 'Burst Area Ranged Damage 5', attack: { type: 'area', effect: 'Damage', rank: 5, notes: 'Burst Area' } },
  { name: 'Rocket Launcher', cost: 27, type: 'Weapon', details: 'Ranged Damage 10 (primary), Burst Area Damage 7 (secondary)', attack: { type: 'ranged', effect: 'Damage', rank: 10, notes: 'Burst Area 7 secondary' } },
  // Ranged Weapons — Thrown
  { name: 'Bolos', cost: 6, type: 'Weapon', details: 'Ranged Snare 3 (Hindered+Vulnerable, Defenseless+Immobile)', attack: { type: 'ranged', effect: 'Snare', rank: 3 } },
  { name: 'Boomerang', cost: 2, type: 'Weapon', details: 'Ranged Str-based Damage 1, returns', attack: { type: 'ranged', effect: 'Damage', rank: 1, strBased: true } },
  { name: 'Javelin', cost: 4, type: 'Weapon', details: 'Ranged Str-based Damage 2, also usable in melee', attack: { type: 'ranged', effect: 'Damage', rank: 2, strBased: true } },
  { name: 'Shuriken', cost: 3, type: 'Weapon', details: 'Ranged Multiattack Damage 1', attack: { type: 'ranged', effect: 'Damage', rank: 1, notes: 'Multiattack' } },
  // Weapon Accessories (1 EP each)
  { name: 'Laser Sight', cost: 1, type: 'Weapon', details: 'Accurate 1 (+2 attack bonus), attach to weapon' },
  { name: 'Stun Ammo', cost: 1, type: 'Weapon', details: 'Non-lethal damage, move action to switch' },
  { name: 'Suppressor', cost: 1, type: 'Weapon', details: 'Subtle 1, DC 20 hearing to detect' },
  { name: 'Targeting Scope', cost: 1, type: 'Weapon', details: 'Improved Aim benefit (double aim bonus)' },
  // Grenades & Explosives
  { name: 'Grenade (Fragmentation)', cost: 15, type: 'Weapon', details: 'Ranged Burst Area Damage 5, DC 15', attack: { type: 'area', effect: 'Damage', rank: 5, notes: 'Burst Area' } },
  { name: 'Grenade (Smoke)', cost: 12, type: 'Weapon', details: 'Ranged Cloud Area Concealment Attack 4 (Visual), DC 14', attack: { type: 'area', effect: 'Concealment Attack', rank: 4, notes: 'Cloud Area' } },
  { name: 'Grenade (Flash-bang)', cost: 16, type: 'Weapon', details: 'Ranged Burst Area Dazzle 4, DC 14', attack: { type: 'area', effect: 'Dazzle', rank: 4, notes: 'Burst Area' } },
  { name: 'Grenade (Sleep Gas)', cost: 12, type: 'Weapon', details: 'Ranged Cloud Area Affliction 4 (Fatigued/Exhausted/Asleep; Fort), DC 14', attack: { type: 'area', effect: 'Affliction', rank: 4, notes: 'Cloud Area' } },
  { name: 'Grenade (Tear Gas)', cost: 16, type: 'Weapon', details: 'Ranged Cloud Area Affliction 4 (Dazed+Impaired/Stunned+Disabled/Incapacitated; Fort), DC 14', attack: { type: 'area', effect: 'Affliction', rank: 4, notes: 'Cloud Area' } },
  { name: 'Dynamite', cost: 15, type: 'Weapon', details: 'Ranged Burst Area Damage 5, DC 15', attack: { type: 'area', effect: 'Damage', rank: 5, notes: 'Burst Area' } },
  { name: 'Plastic Explosive', cost: 30, type: 'Weapon', details: 'Ranged Burst Area Damage 10, DC 20', attack: { type: 'area', effect: 'Damage', rank: 10, notes: 'Burst Area' } },
  // Armor — Archaic
  { name: 'Leather Armor', cost: 1, type: 'Armor', details: 'Protection 1', bonuses: { toughness: 1 } },
  { name: 'Chain-mail', cost: 3, type: 'Armor', details: 'Protection 3', bonuses: { toughness: 3 } },
  { name: 'Plate-mail', cost: 5, type: 'Armor', details: 'Protection 5', bonuses: { toughness: 5 } },
  { name: 'Full-plate', cost: 6, type: 'Armor', details: 'Protection 6', bonuses: { toughness: 6 } },
  // Armor — Modern
  { name: 'Undercover Shirt', cost: 2, type: 'Armor', details: 'Protection 2, Limited to Ballistic, Subtle', bonuses: { toughness: 2 }, bonusNote: 'Limited to Ballistic' },
  { name: 'Bulletproof Vest', cost: 3, type: 'Armor', details: 'Protection 4, Limited to Ballistic, Subtle', bonuses: { toughness: 4 }, bonusNote: 'Limited to Ballistic' },
  // Shields
  { name: 'Small Shield', cost: 2, type: 'Armor', details: '+1 Active Defenses (Dodge & Parry)', bonuses: { dodge: 1, parry: 1 } },
  { name: 'Medium Shield', cost: 4, type: 'Armor', details: '+2 Active Defenses (Dodge & Parry)', bonuses: { dodge: 2, parry: 2 } },
  { name: 'Large Shield', cost: 6, type: 'Armor', details: '+3 Active Defenses (Dodge & Parry)', bonuses: { dodge: 3, parry: 3 } },
  // Vehicles
  { name: 'Car (Sedan)', cost: 10, type: 'Vehicle', details: 'Size Large, Speed 5, Toughness 8, Defense 8' },
  { name: 'Sports Car', cost: 12, type: 'Vehicle', details: 'Size Large, Speed 6, Toughness 8, Defense 8' },
  { name: 'Motorcycle', cost: 8, type: 'Vehicle', details: 'Size Medium, Speed 6, Toughness 8, Defense 10' },
  { name: 'SUV/Truck', cost: 12, type: 'Vehicle', details: 'Size Huge, Speed 5, Toughness 9, Defense 6' },
  { name: 'Van', cost: 10, type: 'Vehicle', details: 'Size Huge, Speed 5, Toughness 9, Defense 6' },
  { name: 'Helicopter', cost: 24, type: 'Vehicle', details: 'Size Huge, Speed 7 (Flight), Toughness 8, Defense 6' },
  { name: 'Jet Fighter', cost: 38, type: 'Vehicle', details: 'Size Gargantuan, Speed 13 (Flight), Toughness 11, Defense 4' },
  { name: 'Speedboat', cost: 14, type: 'Vehicle', details: 'Size Huge, Speed 6 (Swimming), Toughness 9, Defense 6' },
  // General Equipment — Electronics
  { name: 'Audio Recorder', cost: 1, type: 'General', details: 'Digital recorder, 8 hours capacity' },
  { name: 'Camera', cost: 1, type: 'General', details: 'Digital/film, still images' },
  { name: 'Cell Phone', cost: 1, type: 'General', details: 'Communication 1 (wireless)' },
  { name: 'Commlink', cost: 1, type: 'General', details: 'Radio Communication 1 (~1 mile range)' },
  { name: 'Computer', cost: 1, type: 'General', details: 'Standard computer with peripherals' },
  { name: 'Video Camera', cost: 2, type: 'General', details: 'Video + audio recording, ~6 hours' },
  // General Equipment — Criminal Gear
  { name: 'Handcuffs', cost: 1, type: 'General', details: 'Toughness 9 restraint, DC 20 Sleight of Hand to escape' },
  { name: 'Lock Release Gun', cost: 1, type: 'General', details: 'Opens cheap/average locks as routine check' },
  { name: 'Restraints (Plastic)', cost: 1, type: 'General', details: 'Toughness 5, DC 20 Sleight of Hand, single-use' },
  // General Equipment — Surveillance
  { name: 'Binoculars', cost: 1, type: 'General', details: '+5 visual Perception at distance', bonuses: { perception: 5 }, bonusNote: 'visual, at distance' },
  { name: 'Concealable Microphone', cost: 1, type: 'General', details: 'Audio surveillance, ~1 mile broadcast range' },
  { name: 'Mini-Tracer', cost: 1, type: 'General', details: 'Adhesive radio transmitter, ~2 mile range' },
  { name: 'Night Vision Goggles', cost: 2, type: 'General', details: 'Darkvision, –2 Perception penalty' },
  { name: 'Parabolic Microphone', cost: 1, type: 'General', details: '+5 listening Perception at distance', bonuses: { perception: 5 }, bonusNote: 'listening, at distance' },
  // General Equipment — Survival
  { name: 'Camo Clothing', cost: 1, type: 'General', details: '+5 Stealth in matching environment', bonuses: { stealth: 5 }, bonusNote: 'matching environment' },
  { name: 'Fire Extinguisher', cost: 1, type: 'General', details: 'Nullify Fire 3, 10×10 ft area' },
  { name: 'Flash Goggles', cost: 1, type: 'General', details: '+5 resist visual Dazzle' },
  { name: 'Flashlight', cost: 1, type: 'General', details: 'Illumination (30 ft beam)' },
  { name: 'Gas Mask', cost: 1, type: 'General', details: 'Immunity to inhaled toxins, 12 hours' },
  { name: 'GPS Receiver', cost: 1, type: 'General', details: '+5 navigation checks, outdoor only' },
  { name: 'Multi-tool', cost: 1, type: 'General', details: 'Reduces no-tools penalty to –2' },
  { name: 'Rebreather', cost: 1, type: 'General', details: '2 minutes oxygen (20 rounds)' },
  { name: 'SCUBA Gear', cost: 2, type: 'General', details: '2 hours oxygen, full diving apparatus' },
  // General Equipment — Other Useful Items
  { name: 'Caltrops', cost: 1, type: 'General', details: 'Hindered/Immobile area (DC 12 Acrobatics)' },
  { name: 'Disguise Kit', cost: 1, type: 'General', details: '+5 Deception for disguise checks', bonuses: { deception: 5 }, bonusNote: 'disguise only' },
  { name: 'First Aid Kit', cost: 1, type: 'General', details: '+2 Treatment checks', bonuses: { treatment: 2 } },
  { name: 'Grapple Gun', cost: 1, type: 'General', details: 'Movement 1 (Swinging)' },
  { name: 'Lock Picks', cost: 1, type: 'General', details: 'Allows Technology checks to pick locks' },
  { name: 'Parachute', cost: 1, type: 'General', details: 'Movement 1 (Safe Fall)' },
  { name: 'Toolkit (Basic)', cost: 1, type: 'General', details: 'Standard tools for Technology checks' },
  { name: 'Toolkit (Forensic)', cost: 2, type: 'General', details: '+2 Investigation for forensic analysis', bonuses: { investigation: 2 }, bonusNote: 'forensic analysis' },
  // Headquarters (as Equipment)
  { name: 'HQ: Size – Small (house)', cost: 1, type: 'Headquarters', details: 'Toughness 6' },
  { name: 'HQ: Size – Medium (warehouse)', cost: 2, type: 'Headquarters', details: 'Toughness 8' },
  { name: 'HQ: Size – Large (mansion)', cost: 3, type: 'Headquarters', details: 'Toughness 10' },
  { name: 'HQ: Size – Huge (skyscraper)', cost: 4, type: 'Headquarters', details: 'Toughness 12' },
  { name: 'HQ Feature: Combat Simulator', cost: 1, type: 'Headquarters', details: 'Training room for combat' },
  { name: 'HQ Feature: Communications', cost: 1, type: 'Headquarters', details: 'Communication systems' },
  { name: 'HQ Feature: Computer', cost: 1, type: 'Headquarters', details: 'Computer system' },
  { name: 'HQ Feature: Concealed', cost: 1, type: 'Headquarters', details: 'DC 20 to find entrance' },
  { name: 'HQ Feature: Defense System', cost: 2, type: 'Headquarters', details: 'Ranged Damage attack' },
  { name: 'HQ Feature: Fire Prevention', cost: 1, type: 'Headquarters', details: 'Fire suppression system' },
  { name: 'HQ Feature: Garage', cost: 1, type: 'Headquarters', details: 'Vehicle storage' },
  { name: 'HQ Feature: Gym', cost: 1, type: 'Headquarters', details: 'Exercise area' },
  { name: 'HQ Feature: Hangar', cost: 1, type: 'Headquarters', details: 'Aircraft storage' },
  { name: 'HQ Feature: Holding Cells', cost: 1, type: 'Headquarters', details: 'Toughness 10 cells' },
  { name: 'HQ Feature: Infirmary', cost: 1, type: 'Headquarters', details: '+2 Treatment' },
  { name: 'HQ Feature: Laboratory', cost: 1, type: 'Headquarters', details: '+2 to Technology/Investigation' },
  { name: 'HQ Feature: Library', cost: 1, type: 'Headquarters', details: '+2 to Expertise checks' },
  { name: 'HQ Feature: Living Space', cost: 1, type: 'Headquarters', details: 'Living quarters' },
  { name: 'HQ Feature: Power System', cost: 1, type: 'Headquarters', details: 'Independent power' },
  { name: 'HQ Feature: Security System', cost: 2, type: 'Headquarters', details: 'DC 20+ Technology to bypass' },
  { name: 'HQ Feature: Workshop', cost: 1, type: 'Headquarters', details: 'Crafting/repair workspace' },
];
