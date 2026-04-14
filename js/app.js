// M&M 3e Character Creator - Application Logic
'use strict';

// ========== STATE ==========
const state = {
  name: '',
  identity: '',
  powerLevel: 10,
  ppPerPL: 15,
  gender: '',
  age: '',
  height: '',
  weight: '',
  appearance: '',
  background: '',
  abilities: {},
  abilitiesAbsent: {},
  skills: [],
  advantages: {},      // { advId: { ranks: N, specialty: '' } }
  powers: [],          // [{ id, name, effectId, rank, extras, flaws, notes, arrayId?, arraySlot? }]
  powerArrays: [],     // [{ id, name, basePowerId, slots: [{powerId, dynamic}] }]
  defenses: { dodge: 0, parry: 0, fortitude: 0, will: 0 },
  equipment: [],       // [{ id, name, cost, type, details, custom }]
  attacks: [],         // [{ id, name, type, bonus, effect }]
  complications: [],   // [{ type, description }]
  allowNegativeSkills: false,
  minions: [],         // [{ id, name, sourceType, sourceId, ppBudget, abilities, defenses, skills, advantages, powers, attacks, notes }]
  inPlay: { heroPoints: 1, toughnessPenalty: 0, conditions: [], exhaustion: 0, activeEffects: [], notes: '' },
  nextPowerId: 1,
  nextAttackId: 1,
  nextArrayId: 1,
  nextMinionId: 1,
  nextEquipId: 1,
};

// Initialize abilities
ABILITIES.forEach(a => {
  state.abilities[a.id] = 0;
  state.abilitiesAbsent[a.id] = false;
});

// Initialize default skills (non-specialty ones start at 0)
function initSkills() {
  state.skills = [];
  SKILLS.forEach(s => {
    if (!s.hasSpecialty) {
      state.skills.push({ id: s.id, baseId: s.id, name: s.name, ability: s.ability, ranks: 0, isSpecialty: false });
    }
  });
}
initSkills();

// ========== UTILITY ==========
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => e.dataset[dk] = dv);
    else if (k === 'htmlFor') e.htmlFor = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (c == null) return;
    if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

function signedNum(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getEffectiveRange(power, effect) {
  const rangeOrder = ['Close', 'Ranged', 'Perception'];
  let idx = rangeOrder.indexOf(effect.range);
  if (idx === -1) return effect.range; // Personal, Rank, etc.
  if ((power.extras || []).some(e => e.id === 'increasedRange2')) idx += 2;
  else if ((power.extras || []).some(e => e.id === 'increasedRange1')) idx += 1;
  const reducedRange = (power.flaws || []).find(f => f.id === 'reducedRange');
  if (reducedRange) idx -= (reducedRange.ranks || 1);
  return rangeOrder[Math.max(0, Math.min(rangeOrder.length - 1, idx))];
}

function requiresAttackRoll(power, effect) {
  if (getEffectiveRange(power, effect) === 'Perception') return false;
  const areaIds = ['areaBurst', 'areaCloud', 'areaCone', 'areaCylinder', 'areaLine', 'areaPerception', 'areaShapeable'];
  if ((power.extras || []).some(e => areaIds.includes(e.id))) return false;
  return true;
}

// ========== WIKI LINKS ==========
const WIKI_BASE = 'https://www.d20herosrd.com';

function getWikiUrl(type, item) {
  switch (type) {
    case 'ability':
      return `${WIKI_BASE}/3-abilities#TOC-${item.name.toUpperCase()}-${item.abbr}-`;
    case 'skill':
      return `${WIKI_BASE}/4-skills`;
    case 'advantage':
      return `${WIKI_BASE}/5-advantages`;
    case 'effect': {
      const slug = item.name.toLowerCase().replace(/\s+/g, '-') + '-' + item.type.toLowerCase();
      return `${WIKI_BASE}/6-powers/effects/effect-descriptions/${slug}/`;
    }
    case 'extra':
    case 'flaw':
      return `${WIKI_BASE}/6-powers/modifiers/`;
    case 'equipment':
      return `${WIKI_BASE}/7-gadgets-gear/`;
    default:
      return null;
  }
}

function wikiLink(url) {
  if (!url) return null;
  return el('a', {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'wiki-link',
    title: 'View on d20 Hero SRD',
    onClick: (e) => e.stopPropagation(),
  }, '↗');
}

function getEffectDC(effect, rank) {
  if (!effect || effect.resistance === '-' || effect.resistance === 'Power Check') return null;
  // Damage uses DC 15 + rank (Toughness); all others use DC 10 + rank
  if (effect.id === 'damage') return 15 + rank;
  return 10 + rank;
}

// ========== COST CALCULATIONS ==========
function getAbilitiesCost() {
  let cost = 0;
  ABILITIES.forEach(a => {
    if (state.abilitiesAbsent[a.id]) {
      cost += -5 * ABILITY_COST;
    } else {
      cost += state.abilities[a.id] * ABILITY_COST;
    }
  });
  return cost;
}

function getSkillsCost() {
  let totalRanks = 0;
  state.skills.forEach(s => totalRanks += s.ranks);
  return Math.ceil(totalRanks * SKILL_COST);
}

function getSkillsTotalRanks() {
  return state.skills.reduce((sum, s) => sum + s.ranks, 0);
}

function getAdvantagesCost() {
  let cost = 0;
  Object.entries(state.advantages).forEach(([id, data]) => {
    const adv = ADVANTAGES.find(a => a.id === id);
    if (adv) cost += data.ranks * adv.cost;
  });
  return cost;
}

function calculatePowerCost(power) {
  const effect = POWER_EFFECTS.find(e => e.id === power.effectId);
  if (!effect) return 0;

  let baseCost = power.costPerRankOverride != null ? power.costPerRankOverride : effect.costPerRank;
  let flatMod = 0;
  let removableDiscount = 0;

  // Apply per-rank extras
  (power.extras || []).forEach(ex => {
    const extraDef = POWER_EXTRAS.find(e => e.id === ex.id);
    if (!extraDef) return;
    if (extraDef.costType === 'perRank') {
      baseCost += extraDef.costValue * (ex.ranks || 1);
    } else if (extraDef.costType === 'flat') {
      flatMod += extraDef.costValue * (ex.ranks || 1);
    }
  });

  // Apply per-rank flaws
  (power.flaws || []).forEach(fl => {
    const flawDef = POWER_FLAWS.find(f => f.id === fl.id);
    if (!flawDef) return;
    if (flawDef.costType === 'perRank') baseCost += flawDef.costValue * (fl.ranks || 1);
    else if (flawDef.costType === 'flat') flatMod += flawDef.costValue * (fl.ranks || 1);
    else if (flawDef.costType === 'special') {
      // Removable: calculate after total
      removableDiscount = flawDef.costValue; // per 5 points
    }
  });

  // Minimum cost per rank is 1/rank; below that, per M&M rules: ranksPerPP = 2 - costPerRank
  let effectiveCostPerRank = baseCost;
  let total;
  if (effectiveCostPerRank < 1) {
    // Cost 0 = 2 ranks/PP, cost -1 = 3 ranks/PP, etc.
    const ranksPerPP = 2 - effectiveCostPerRank;
    total = Math.max(1, Math.ceil(power.rank / ranksPerPP));
  } else {
    total = power.rank * effectiveCostPerRank;
  }

  total += flatMod;

  // Removable discount
  if (removableDiscount !== 0) {
    const discount = Math.floor(Math.max(total, 0) / 5) * Math.abs(removableDiscount);
    total -= discount;
  }

  total = Math.max(1, total); // Minimum 1 PP for any power
  return total;
}

function getPowersCost() {
  let total = 0;
  const arrayPowerIds = new Set();

  // Calculate array costs
  state.powerArrays.forEach(arr => {
    const basePower = state.powers.find(p => p.id === arr.basePowerId);
    if (!basePower) return;
    total += calculatePowerCost(basePower);
    arrayPowerIds.add(basePower.id);
    (arr.slots || []).forEach(slot => {
      arrayPowerIds.add(slot.powerId);
      total += slot.dynamic ? 2 : 1;
    });
  });

  // Add standalone power costs
  state.powers.forEach(p => {
    if (!arrayPowerIds.has(p.id)) {
      total += calculatePowerCost(p);
    }
  });

  return total;
}

function getDefensesCost() {
  return Object.values(state.defenses).reduce((sum, v) => sum + v, 0);
}

function getTotalPP() {
  return state.powerLevel * state.ppPerPL;
}

function getSpentPP() {
  return getAbilitiesCost() + getSkillsCost() + getAdvantagesCost() + getPowersCost() + getDefensesCost();
}

// ========== DERIVED VALUES ==========
function getAbilityScore(id) {
  if (state.abilitiesAbsent[id]) return null;
  return state.abilities[id];
}

function getEquipmentBonuses() {
  // M&M rule: same-type bonuses don't stack — use highest per stat
  const bonuses = {};
  if (!state.equipment) return bonuses;
  state.equipment.forEach(item => {
    const template = EQUIPMENT_LIST.find(e => e.name === item.name);
    const itemBonuses = (template && template.bonuses) || item.bonuses;
    if (!itemBonuses) return;
    for (const [key, val] of Object.entries(itemBonuses)) {
      bonuses[key] = Math.max(bonuses[key] || 0, val);
    }
  });
  return bonuses;
}

function getEquipmentEffects() {
  const effects = [];
  if (!state.equipment) return effects;
  state.equipment.forEach(item => {
    const template = EQUIPMENT_LIST.find(e => e.name === item.name);
    const itemBonuses = (template && template.bonuses) || item.bonuses;
    if (!itemBonuses) return;
    const note = template && template.bonusNote;
    for (const [key, val] of Object.entries(itemBonuses)) {
      const defDef = DEFENSES.find(d => d.id === key);
      const skillDef = SKILLS.find(s => s.id === key);
      let label = key.charAt(0).toUpperCase() + key.slice(1);
      if (defDef) label = defDef.id.charAt(0).toUpperCase() + defDef.id.slice(1);
      if (skillDef) label = skillDef.name;
      effects.push({ item: item.name, stat: label, value: val, note: note || '' });
    }
  });
  return effects;
}

function getDefenseTotal(defId) {
  const def = DEFENSES.find(d => d.id === defId);
  if (!def) return 0;
  const abilityScore = getAbilityScore(def.ability);
  const base = abilityScore != null ? abilityScore : 0;
  const equipBonuses = getEquipmentBonuses();
  const equipBonus = equipBonuses[defId] || 0;

  if (defId === 'toughness') {
    // Toughness = Stamina + Protection powers + Defensive Roll + Equipment
    let protectionBonus = 0;
    state.powers.forEach(p => {
      if (p.effectId === 'protection') protectionBonus += p.rank;
    });
    const defRoll = state.advantages.defensiveRoll ? state.advantages.defensiveRoll.ranks : 0;
    return base + protectionBonus + defRoll + equipBonus;
  }

  return base + (state.defenses[defId] || 0) + equipBonus;
}

function getInitiative() {
  const agl = getAbilityScore('agl') || 0;
  const impInit = state.advantages.improvedInitiative ? state.advantages.improvedInitiative.ranks : 0;
  return agl + (impInit * 4);
}

function getCloseAttackBonus() {
  const fgt = getAbilityScore('fgt') || 0;
  const closeAtk = state.advantages.closeAttack ? state.advantages.closeAttack.ranks : 0;
  return fgt + closeAtk;
}

function getRangedAttackBonus() {
  const dex = getAbilityScore('dex') || 0;
  const rangedAtk = state.advantages.rangedAttack ? state.advantages.rangedAttack.ranks : 0;
  return dex + rangedAtk;
}

// ========== PL LIMIT CHECKS ==========
function getPLLimits() {
  const pl = state.powerLevel;
  const cap = pl * 2;
  const limits = [];
  const toughness = getDefenseTotal('toughness');
  const dodge = getDefenseTotal('dodge');
  const parry = getDefenseTotal('parry');
  const fort = getDefenseTotal('fortitude');
  const will = getDefenseTotal('will');

  // Dodge + Toughness
  const dtSum = dodge + toughness;
  limits.push({
    label: `Dodge (${dodge}) + Toughness (${toughness})`,
    value: dtSum,
    cap,
    over: dtSum > cap,
  });

  // Parry + Toughness
  const ptSum = parry + toughness;
  limits.push({
    label: `Parry (${parry}) + Toughness (${toughness})`,
    value: ptSum,
    cap,
    over: ptSum > cap,
  });

  // Fortitude + Will
  const fwSum = fort + will;
  limits.push({
    label: `Fortitude (${fort}) + Will (${will})`,
    value: fwSum,
    cap,
    over: fwSum > cap,
  });

  // Attack + Effect for power-based attacks
  state.powers.forEach(power => {
    const effect = POWER_EFFECTS.find(e => e.id === power.effectId);
    if (!effect || effect.type !== 'Attack') return;
    if (requiresAttackRoll(power, effect)) {
      const effectiveRange = getEffectiveRange(power, effect);
      const isRanged = effectiveRange === 'Ranged';
      const baseBonus = isRanged ? getRangedAttackBonus() : getCloseAttackBonus();
      const accurateExtra = power.extras.find(e => e.id === 'accurate');
      const inaccurateFlaw = power.flaws.find(f => f.id === 'inaccurate');
      const atkBonus = baseBonus + (accurateExtra ? accurateExtra.ranks * 2 : 0) - (inaccurateFlaw ? inaccurateFlaw.ranks * 2 : 0);
      const aeSum = atkBonus + power.rank;
      limits.push({
        label: `${power.name}: Attack (${signedNum(atkBonus)}) + Effect (${power.rank})`,
        value: aeSum,
        cap,
        over: aeSum > cap,
      });
    } else {
      // Perception/Area: effect rank ≤ PL
      limits.push({
        label: `${power.name}: Effect rank (no attack roll)`,
        value: power.rank,
        cap: pl,
        over: power.rank > pl,
      });
    }
  });

  // Unarmed attack + STR damage
  const unarmedBonus = getCloseAttackBonus();
  const strDmg = getAbilityScore('str') || 0;
  if (strDmg > 0 || unarmedBonus > 0) {
    const unarmedSum = unarmedBonus + strDmg;
    limits.push({
      label: `Unarmed: Attack (${signedNum(unarmedBonus)}) + Damage (${strDmg})`,
      value: unarmedSum,
      cap,
      over: unarmedSum > cap,
    });
  }

  // Throw attack + STR + Throwing Mastery
  const throwMasteryPL = state.advantages.throwMastery ? state.advantages.throwMastery.ranks : 0;
  const throwDmgPL = strDmg + throwMasteryPL;
  const throwBonusPL = getRangedAttackBonus();
  if (throwDmgPL > 0 || throwBonusPL > 0) {
    const throwSum = throwBonusPL + throwDmgPL;
    limits.push({
      label: `Throw: Attack (${signedNum(throwBonusPL)}) + Damage (${throwDmgPL})`,
      value: throwSum,
      cap,
      over: throwSum > cap,
    });
  }

  // Skill cap: individual skill bonus ≤ PL + 10
  const skillCap = pl + 10;

  // Equipment weapon attack + effect
  if (state.equipment && state.equipment.length) {
    const str = getAbilityScore('str') || 0;
    state.equipment.forEach(item => {
      const template = EQUIPMENT_LIST.find(e => e.name === item.name);
      const atk = (template && template.attack) || item.attack;
      if (!atk) return;

      if (atk.type === 'area' || atk.type === 'perception') {
        // No attack roll: effect rank ≤ PL
        limits.push({
          label: `${item.name}: Effect rank (${atk.type})`,
          value: atk.rank,
          cap: pl,
          over: atk.rank > pl,
        });
      } else {
        const isRanged = atk.type === 'ranged';
        const baseBonus = isRanged ? getRangedAttackBonus() : getCloseAttackBonus();
        const bonus = baseBonus + (atk.bonusMod || 0);
        const effectRank = atk.strBased ? atk.rank + str : atk.rank;
        const sum = bonus + effectRank;
        limits.push({
          label: `${item.name}: Attack (${signedNum(bonus)}) + Effect (${effectRank})`,
          value: sum,
          cap,
          over: sum > cap,
        });
      }
    });
  }

  state.skills.forEach(skill => {
    if (skill.ranks === 0) return;
    const abilVal = getAbilityScore(skill.ability) || 0;
    const total = skill.ranks + abilVal;
    if (total > skillCap) {
      limits.push({
        label: `Skill ${skill.name}: bonus ${signedNum(total)}`,
        value: total,
        cap: skillCap,
        over: true,
      });
    }
  });

  return limits;
}

// ========== RENDERING ==========

// -- PP Tracker --
function renderPPTracker() {
  const total = getTotalPP();
  const spent = getSpentPP();
  const remaining = total - spent;

  $('#pp-spent').textContent = spent;
  $('#pp-total').textContent = total;
  $('#pp-remaining-text').textContent = remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over budget!`;

  const pct = Math.min(100, Math.max(0, (spent / total) * 100));
  const bar = $('#pp-bar');
  bar.style.width = pct + '%';
  bar.classList.toggle('over-budget', spent > total);

  // Cost badges
  $('#cost-abilities').textContent = getAbilitiesCost();
  $('#cost-skills').textContent = getSkillsCost();
  $('#cost-advantages').textContent = getAdvantagesCost();
  $('#cost-powers').textContent = getPowersCost();
  $('#cost-defenses').textContent = getDefensesCost();

  // Panel cost displays
  const abcDisplay = $('#abilities-cost-display');
  if (abcDisplay) abcDisplay.textContent = getAbilitiesCost() + ' PP';
  const skDisplay = $('#skills-cost-display');
  if (skDisplay) skDisplay.textContent = getSkillsCost() + ' PP';
  const adDisplay = $('#advantages-cost-display');
  if (adDisplay) adDisplay.textContent = getAdvantagesCost() + ' PP';
  const pwDisplay = $('#powers-cost-display');
  if (pwDisplay) pwDisplay.textContent = getPowersCost() + ' PP';
  const dfDisplay = $('#defenses-cost-display');
  if (dfDisplay) dfDisplay.textContent = getDefensesCost() + ' PP';
}

// -- PL Warnings --
function renderPLWarnings() {
  const container = $('#pl-warnings');
  container.innerHTML = '';
  const limits = getPLLimits();
  limits.forEach(l => {
    if (l.over) {
      container.appendChild(el('div', { className: 'pl-warning' },
        `PL Limit Exceeded: ${l.label} = ${l.value} (max ${l.cap})`
      ));
    }
  });

  // Budget warning
  if (getSpentPP() > getTotalPP()) {
    container.appendChild(el('div', { className: 'pl-warning' },
      `Over Budget: ${getSpentPP()} PP spent of ${getTotalPP()} PP available`
    ));
  }

  // Equipment budget warning
  ensureEquipment();
  const eqBudget = getEquipmentBudget();
  const eqSpent = getEquipmentSpent();
  if (eqSpent > eqBudget) {
    container.appendChild(el('div', { className: 'pl-warning' },
      `Equipment Over Budget: ${eqSpent} EP spent of ${eqBudget} EP available`
    ));
  }

}

// -- Abilities Tab --
function renderAbilities() {
  const grid = $('#abilities-grid');
  grid.innerHTML = '';
  ABILITIES.forEach(a => {
    const isAbsent = state.abilitiesAbsent[a.id];
    const val = state.abilities[a.id];
    const cost = isAbsent ? -5 * ABILITY_COST : val * ABILITY_COST;

    const card = el('div', { className: 'ability-card' },
      el('div', { className: 'ability-abbr' }, a.abbr),
      el('div', { className: 'ability-name' }, a.name, wikiLink(getWikiUrl('ability', a))),
      el('div', { className: 'ability-value' },
        el('button', {
          className: 'btn-dec',
          onClick: () => { if (!isAbsent && state.abilities[a.id] > -5) { state.abilities[a.id]--; renderAll(); } }
        }, '−'),
        el('input', {
          type: 'number',
          value: isAbsent ? '—' : val,
          min: '-5',
          disabled: isAbsent ? 'true' : undefined,
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) { state.abilities[a.id] = Math.max(-5, v); renderAll(); }
          }
        }),
        el('button', {
          className: 'btn-inc',
          onClick: () => { if (!isAbsent) { state.abilities[a.id]++; renderAll(); } }
        }, '+'),
      ),
      el('div', { className: 'ability-cost' }, isAbsent ? `${cost} PP (Absent)` : `${cost} PP`),
      el('div', { className: 'ability-absent-toggle' },
        el('label', null,
          el('input', {
            type: 'checkbox',
            ...(isAbsent ? { checked: 'true' } : {}),
            onChange: (e) => {
              state.abilitiesAbsent[a.id] = e.target.checked;
              if (e.target.checked) state.abilities[a.id] = 0;
              renderAll();
            }
          }),
          'Absent'
        )
      )
    );
    grid.appendChild(card);
  });
}

// -- Skills Tab --
function renderSkills() {
  const list = $('#skills-list');
  list.innerHTML = '';

  // Header
  list.appendChild(el('div', { className: 'skill-header' },
    el('span', null, 'Skill'),
    el('span', { style: 'text-align:center' }, 'Ranks'),
    el('span', { style: 'text-align:center' }, 'Abil'),
    el('span', { style: 'text-align:center' }, 'Total'),
    el('span', null, ''),
  ));

  state.skills.forEach((skill, idx) => {
    const abilScore = getAbilityScore(skill.ability);
    const abilVal = abilScore != null ? abilScore : 0;
    const total = skill.ranks + abilVal;

    const baseSk = SKILLS.find(s => s.id === skill.baseId || s.id === skill.id);
    const row = el('div', { className: 'skill-row' },
      el('span', { className: 'skill-name' },
        skill.isSpecialty ? `${skill.name}` : skill.name,
        wikiLink(getWikiUrl('skill', baseSk || skill)),
        el('span', { className: 'skill-ability' }, `(${skill.ability.toUpperCase()})`)
      ),
      el('div', { className: 'skill-ranks' },
        el('button', {
          className: 'btn-dec',
          onClick: () => { if (state.allowNegativeSkills ? true : skill.ranks > 0) { skill.ranks--; renderAll(); } }
        }, '−'),
        el('input', {
          type: 'number',
          value: skill.ranks,
          min: state.allowNegativeSkills ? undefined : '0',
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && (state.allowNegativeSkills || v >= 0)) { skill.ranks = v; renderAll(); }
          }
        }),
        el('button', {
          className: 'btn-inc',
          onClick: () => { skill.ranks++; renderAll(); }
        }, '+'),
      ),
      el('span', { className: 'skill-total-label' }, signedNum(abilVal)),
      el('span', { className: 'skill-total' }, signedNum(total)),
      skill.isSpecialty
        ? el('button', { className: 'btn-remove', onClick: () => { state.skills.splice(idx, 1); renderAll(); } }, '×')
        : el('span', null, '')
    );
    list.appendChild(row);
  });

  $('#skills-total-ranks').textContent = getSkillsTotalRanks();
  $('#allow-negative-skills').checked = state.allowNegativeSkills;

  // Populate specialty dropdown
  const select = $('#specialty-base-skill');
  select.innerHTML = '<option value="">Add specialty skill...</option>';
  SKILLS.filter(s => s.hasSpecialty).forEach(s => {
    select.appendChild(el('option', { value: s.id }, s.name));
  });
}

function addSpecialtySkill() {
  const baseId = $('#specialty-base-skill').value;
  const name = $('#specialty-name').value.trim();
  if (!baseId || !name) return;

  const baseSk = SKILLS.find(s => s.id === baseId);
  if (!baseSk) return;

  state.skills.push({
    id: `${baseId}_${Date.now()}`,
    baseId: baseId,
    name: `${baseSk.name}: ${name}`,
    ability: baseSk.ability,
    ranks: 0,
    isSpecialty: true,
  });

  $('#specialty-name').value = '';
  $('#specialty-base-skill').value = '';
  renderAll();
}

// -- Advantages Tab --
function renderAdvantages(filter) {
  const grid = $('#advantages-grid');
  grid.innerHTML = '';

  const currentFilter = filter || 'all';

  const sortedAdvantages = currentFilter === 'all'
    ? [...ADVANTAGES].sort((a, b) => a.name.localeCompare(b.name))
    : ADVANTAGES;

  sortedAdvantages.forEach(adv => {
    const isActive = !!state.advantages[adv.id];
    const data = state.advantages[adv.id] || { ranks: 1, specialty: '' };
    const hidden = currentFilter !== 'all' && adv.category !== currentFilter;

    const item = el('div', {
      className: `advantage-item ${isActive ? 'active' : ''} ${hidden ? 'hidden' : ''}`,
    });

    const check = el('div', { className: 'advantage-check' }, '✓');
    check.addEventListener('click', () => {
      if (isActive) {
        delete state.advantages[adv.id];
        // Clean up any associated minion
        if (adv.id === 'minion' || adv.id === 'sidekick') {
          state.minions = state.minions.filter(m => !(m.sourceType === 'advantage' && m.sourceId === adv.id));
        }
      } else {
        state.advantages[adv.id] = { ranks: 1, specialty: '' };
      }
      renderAll();
    });
    item.appendChild(check);

    item.appendChild(el('div', { className: 'advantage-info' },
      el('div', { className: 'advantage-info-name' }, adv.name, wikiLink(getWikiUrl('advantage', adv))),
      el('div', { className: 'advantage-info-desc' }, adv.description),
    ));

    if (isActive && adv.ranked) {
      const ranksInput = el('div', { className: 'advantage-ranks-input' },
        el('button', {
          className: 'btn-dec',
          onClick: (e) => {
            e.stopPropagation();
            if (data.ranks > 1) {
              state.advantages[adv.id].ranks--;
              renderAll();
            }
          }
        }, '−'),
        el('input', {
          type: 'number',
          value: data.ranks,
          min: '1',
          max: adv.maxRanks || '99',
          onClick: (e) => e.stopPropagation(),
          onInput: (e) => {
            e.stopPropagation();
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1) {
              state.advantages[adv.id].ranks = adv.maxRanks ? Math.min(v, adv.maxRanks) : v;
              renderAll();
            }
          }
        }),
        el('button', {
          className: 'btn-inc',
          onClick: (e) => {
            e.stopPropagation();
            if (!adv.maxRanks || data.ranks < adv.maxRanks) {
              state.advantages[adv.id].ranks++;
              renderAll();
            }
          }
        }, '+'),
      );
      item.appendChild(ranksInput);
    }

    if (isActive && adv.hasSpecialty) {
      const specInput = el('div', { className: 'advantage-specialty' },
        el('input', {
          type: 'text',
          value: data.specialty || '',
          placeholder: 'Specify...',
          onClick: (e) => e.stopPropagation(),
          onInput: (e) => {
            state.advantages[adv.id].specialty = e.target.value;
            autoSaveRoster();
          }
        })
      );
      item.appendChild(specInput);
    }

    // Minion sheet for Minion/Sidekick advantages
    if (isActive && (adv.id === 'minion' || adv.id === 'sidekick')) {
      item.appendChild(renderMinionCard('advantage', adv.id));
    }

    grid.appendChild(item);
  });
}

// -- Powers Tab --
let editingPowerId = null;
let editingArrayPowerId = null; // when adding a power to an array

function buildPowerCard(power, options = {}) {
  const effect = POWER_EFFECTS.find(e => e.id === power.effectId);
  const cost = calculatePowerCost(power);
  const card = el('div', { className: `power-card ${options.className || ''}` });

  const headerLeft = el('div', null,
    el('div', { className: 'power-card-name' },
      (options.label ? el('span', { className: 'power-slot-label' }, options.label) : null),
      (power.name || 'Unnamed Power')
    ),
    el('div', { className: 'power-card-effect' },
      `${effect ? effect.name : 'Unknown'} ${power.rank}${power.costPerRankOverride != null ? ` (${power.costPerRankOverride}/rank)` : ''}`,
      effect ? wikiLink(getWikiUrl('effect', effect)) : null
    ),
  );

  const actions = el('div', { className: 'power-card-actions' });
  actions.appendChild(el('button', { className: 'btn-edit', onClick: () => editPower(power.id) }, '✎'));
  if (options.onToggleDynamic) {
    actions.appendChild(el('button', {
      className: `btn-dynamic ${options.isDynamic ? 'active' : ''}`,
      title: options.isDynamic ? 'Dynamic (2 PP) — click for Standard (1 PP)' : 'Standard (1 PP) — click for Dynamic (2 PP)',
      onClick: options.onToggleDynamic,
    }, 'D'));
  }
  actions.appendChild(el('button', { className: 'btn-remove', onClick: () => options.onRemove ? options.onRemove() : removePower(power.id) }, '×'));

  const costLabel = options.slotCost != null ? `${options.slotCost} PP` : `${cost} PP`;

  card.appendChild(el('div', { className: 'power-card-header' },
    headerLeft,
    el('div', { style: 'display:flex;align-items:center;gap:0.75rem' },
      el('span', { className: 'power-card-cost' }, costLabel),
      actions,
    ),
  ));

  if (effect) {
    const effectiveRange = getEffectiveRange(power, effect);
    card.appendChild(el('div', { className: 'power-card-details' },
      el('span', null, `Action: ${effect.action}`),
      el('span', null, `Range: ${effectiveRange}`),
      el('span', null, `Duration: ${effect.duration}`),
      effect.resistance !== '-' ? el('span', null, `Resistance: ${effect.resistance}`) : null,
    ));
  }

  const extras = (power.extras || []).map(ex => {
    const def = POWER_EXTRAS.find(e => e.id === ex.id);
    return def ? `${def.name}${ex.ranks > 1 ? ' ' + ex.ranks : ''}` : '';
  }).filter(Boolean);
  const flaws = (power.flaws || []).map(fl => {
    const def = POWER_FLAWS.find(f => f.id === fl.id);
    return def ? `${def.name}${fl.ranks > 1 ? ' ' + fl.ranks : ''}` : '';
  }).filter(Boolean);

  if (extras.length || flaws.length) {
    const modsDiv = el('div', { className: 'power-card-modifiers' });
    if (extras.length) modsDiv.appendChild(el('span', { className: 'extras' }, `Extras: ${extras.join(', ')} `));
    if (flaws.length) modsDiv.appendChild(el('span', { className: 'flaws' }, `Flaws: ${flaws.join(', ')}`));
    card.appendChild(modsDiv);
  }

  if (power.notes) {
    card.appendChild(el('div', { className: 'power-card-notes' }, power.notes));
  }

  return card;
}

function renderPowers() {
  const list = $('#powers-list');
  list.innerHTML = '';

  if (state.powers.length === 0 && state.powerArrays.length === 0) {
    list.appendChild(el('p', { className: 'panel-note' }, 'No powers added yet. Click the button below to add a power.'));
    return;
  }

  const arrayPowerIds = new Set();
  state.powerArrays.forEach(arr => {
    arrayPowerIds.add(arr.basePowerId);
    (arr.slots || []).forEach(s => arrayPowerIds.add(s.powerId));
  });

  // Render arrays
  [...state.powerArrays].sort((a, b) => (a.name || '').localeCompare(b.name || '')).forEach(arr => {
    const basePower = state.powers.find(p => p.id === arr.basePowerId);
    if (!basePower) return;
    const baseCost = calculatePowerCost(basePower);
    const slotsCost = (arr.slots || []).reduce((s, slot) => s + (slot.dynamic ? 2 : 1), 0);
    const totalCost = baseCost + slotsCost;

    const arrayContainer = el('div', { className: 'power-array' });

    // Array header
    const arrayHeader = el('div', { className: 'power-array-header' },
      el('div', null,
        el('div', { className: 'power-array-name' }, `⚡ ${arr.name || 'Power Array'}`),
        el('div', { className: 'power-array-cost-summary' },
          `Base: ${baseCost} PP + ${(arr.slots || []).length} slot${(arr.slots || []).length !== 1 ? 's' : ''} (${slotsCost} PP) = ${totalCost} PP`
        ),
      ),
      el('div', { className: 'power-array-actions' },
        el('button', { className: 'btn-add-slot', onClick: () => addSlotToArray(arr.id) }, '+ Slot'),
        el('button', { className: 'btn-remove', onClick: () => removeArray(arr.id) }, '×'),
      ),
    );
    arrayContainer.appendChild(arrayHeader);

    // Base power card
    arrayContainer.appendChild(buildPowerCard(basePower, {
      className: 'array-base',
      label: 'Base: ',
      onRemove: () => removeArray(arr.id),
    }));
    if (basePower.effectId === 'summon') {
      arrayContainer.appendChild(renderMinionCard('power', basePower.id));
    }

    // Slot cards
    (arr.slots || []).forEach((slot, idx) => {
      const slotPower = state.powers.find(p => p.id === slot.powerId);
      if (!slotPower) return;
      arrayContainer.appendChild(buildPowerCard(slotPower, {
        className: 'array-slot',
        label: slot.dynamic ? 'Dynamic AE: ' : 'AE: ',
        slotCost: slot.dynamic ? 2 : 1,
        isDynamic: slot.dynamic,
        onToggleDynamic: () => { slot.dynamic = !slot.dynamic; renderAll(); },
        onRemove: () => removeSlotFromArray(arr.id, slot.powerId),
      }));
      if (slotPower.effectId === 'summon') {
        arrayContainer.appendChild(renderMinionCard('power', slotPower.id));
      }
    });

    list.appendChild(arrayContainer);
  });

  // Render standalone powers
  [...state.powers].filter(p => !arrayPowerIds.has(p.id))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .forEach(power => {
      const card = buildPowerCard(power);
      // Add "Make Array" button
      const makeArrayBtn = el('button', {
        className: 'btn-make-array',
        onClick: () => createArrayFromPower(power.id),
      }, '⚡ Make Array');
      card.querySelector('.power-card-actions').insertBefore(
        makeArrayBtn,
        card.querySelector('.power-card-actions .btn-remove')
      );
      list.appendChild(card);
      // Minion sheet for Summon powers
      if (power.effectId === 'summon') {
        list.appendChild(renderMinionCard('power', power.id));
      }
    });
}

// ===== POWER ARRAY MANAGEMENT =====
function createArrayFromPower(powerId) {
  const power = state.powers.find(p => p.id === powerId);
  if (!power) return;
  const arr = {
    id: state.nextArrayId++,
    name: power.name || 'Power Array',
    basePowerId: powerId,
    slots: [],
  };
  state.powerArrays.push(arr);
  renderAll();
}

function addSlotToArray(arrayId) {
  editingArrayPowerId = arrayId;
  openPowerModal();
}

function removeArray(arrayId) {
  state.powerArrays = state.powerArrays.filter(a => a.id !== arrayId);
  renderAll();
}

function removeSlotFromArray(arrayId, powerId) {
  const arr = state.powerArrays.find(a => a.id === arrayId);
  if (arr) {
    arr.slots = arr.slots.filter(s => s.powerId !== powerId);
  }
  state.powers = state.powers.filter(p => p.id !== powerId);
  renderAll();
}

// ===== MINION MANAGEMENT =====
let editingMinionId = null;
let editingMinionSource = null; // { type, id, ppBudget }

function createDefaultMinion(sourceType, sourceId, ppBudget) {
  const abilities = {};
  const abilitiesAbsent = {};
  const defenses = { dodge: 0, parry: 0, fortitude: 0, will: 0 };
  ABILITIES.forEach(a => { abilities[a.id] = 0; abilitiesAbsent[a.id] = false; });

  const skills = [];
  SKILLS.forEach(s => {
    if (!s.hasSpecialty) {
      skills.push({ id: s.id, baseId: s.id, name: s.name, ability: s.ability, ranks: 0, isSpecialty: false });
    }
  });

  return {
    id: state.nextMinionId++,
    name: '',
    sourceType,
    sourceId,
    ppBudget,
    abilities,
    abilitiesAbsent,
    defenses,
    skills,             // [{id, baseId, name, ability, ranks, isSpecialty}]
    advantages: {},     // {advId: {ranks, specialty}}
    powers: [],         // [{id, name, effectId, rank, extras, flaws, notes, costPerRankOverride}]
    nextPowerId: 1,
    offense: '',
    notes: '',
  };
}

function getMinionPPBudget(sourceType, sourceId) {
  if (sourceType === 'advantage') {
    const data = state.advantages[sourceId];
    if (!data) return 0;
    if (sourceId === 'minion') return data.ranks * 15;
    if (sourceId === 'sidekick') return data.ranks * 5;
  } else if (sourceType === 'power') {
    const power = state.powers.find(p => p.id === sourceId);
    if (power && power.effectId === 'summon') return power.rank * 15;
  }
  return 0;
}

function getMinionSpent(minion) {
  let spent = 0;
  // Abilities
  ABILITIES.forEach(a => {
    if (minion.abilitiesAbsent[a.id]) {
      spent += -5 * ABILITY_COST;
    } else {
      spent += (minion.abilities[a.id] || 0) * ABILITY_COST;
    }
  });
  // Defenses
  spent += Object.values(minion.defenses || {}).reduce((s, v) => s + v, 0);
  // Skills
  const totalSkillRanks = (minion.skills || []).reduce((s, sk) => s + (sk.ranks || 0), 0);
  spent += Math.ceil(totalSkillRanks * SKILL_COST);
  // Advantages
  Object.entries(minion.advantages || {}).forEach(([id, data]) => {
    const adv = ADVANTAGES.find(a => a.id === id);
    if (adv) spent += (data.ranks || 1) * adv.cost;
  });
  // Powers
  (minion.powers || []).forEach(p => {
    spent += calculatePowerCost(p);
  });
  return spent;
}

function migrateMinion(minion) {
  // Backward compat: migrate string-based fields to structured data
  if (typeof minion.skills === 'string') {
    const skills = [];
    SKILLS.forEach(s => {
      if (!s.hasSpecialty) {
        skills.push({ id: s.id, baseId: s.id, name: s.name, ability: s.ability, ranks: 0, isSpecialty: false });
      }
    });
    minion.skills = skills;
  }
  if (typeof minion.advantages === 'string') minion.advantages = {};
  if (typeof minion.powers === 'string') minion.powers = [];
  if (minion.nextPowerId == null) minion.nextPowerId = 1;
}

let editingMinionRef = null; // holds reference to minion being edited in modal
let editingMinionPowerIdx = -1; // index into minion.powers when editing via power modal, -1 = new

function openMinionModal(sourceType, sourceId) {
  const ppBudget = getMinionPPBudget(sourceType, sourceId);
  let minion = state.minions.find(m => m.sourceType === sourceType && m.sourceId === sourceId);
  if (!minion) {
    minion = createDefaultMinion(sourceType, sourceId, ppBudget);
    state.minions.push(minion);
  }
  migrateMinion(minion);
  minion.ppBudget = ppBudget;
  editingMinionId = minion.id;
  editingMinionSource = { type: sourceType, id: sourceId, ppBudget };
  editingMinionRef = minion;

  $('#minion-modal').style.display = 'flex';
  $('#minion-modal-title').textContent = sourceType === 'advantage'
    ? `Edit ${sourceId === 'sidekick' ? 'Sidekick' : 'Minion'}`
    : 'Edit Summoned Creature';
  $('#minion-name').value = minion.name || '';
  $('#minion-offense').value = minion.offense || '';
  $('#minion-notes').value = minion.notes || '';

  renderMinionAbilities(minion);
  renderMinionDefenses(minion);
  renderMinionSkills(minion);
  renderMinionAdvantages(minion);
  renderMinionPowers(minion);
  updateMinionBudget(minion);
}

function renderMinionAbilities(minion) {
  const grid = $('#minion-abilities-grid');
  grid.innerHTML = '';
  ABILITIES.forEach(a => {
    const isAbsent = minion.abilitiesAbsent[a.id];
    const val = minion.abilities[a.id] || 0;
    const card = el('div', { className: 'minion-ability-card' },
      el('div', { className: 'minion-ability-label' }, a.abbr),
      el('div', { className: 'minion-ability-input' },
        el('button', { className: 'btn-dec', onClick: () => {
          if (!isAbsent) { minion.abilities[a.id]--; renderMinionAbilities(minion); updateMinionBudget(minion); }
        }}, '−'),
        el('input', {
          type: 'number', value: isAbsent ? '—' : val,
          disabled: isAbsent ? 'true' : undefined,
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) { minion.abilities[a.id] = v; updateMinionBudget(minion); }
          }
        }),
        el('button', { className: 'btn-inc', onClick: () => {
          if (!isAbsent) { minion.abilities[a.id]++; renderMinionAbilities(minion); updateMinionBudget(minion); }
        }}, '+'),
      ),
      el('label', { className: 'minion-absent-label' },
        el('input', {
          type: 'checkbox',
          ...(isAbsent ? { checked: 'true' } : {}),
          onChange: (e) => {
            minion.abilitiesAbsent[a.id] = e.target.checked;
            if (e.target.checked) minion.abilities[a.id] = 0;
            renderMinionAbilities(minion);
            updateMinionBudget(minion);
          }
        }),
        '∅'
      ),
    );
    grid.appendChild(card);
  });
}

function renderMinionDefenses(minion) {
  const grid = $('#minion-defenses-grid');
  grid.innerHTML = '';
  DEFENSES.filter(d => !d.noPurchase).forEach(d => {
    const val = minion.defenses[d.id] || 0;
    const card = el('div', { className: 'minion-defense-card' },
      el('div', { className: 'minion-defense-label' }, d.name),
      el('div', { className: 'minion-defense-input' },
        el('button', { className: 'btn-dec', onClick: () => {
          if (val > 0) { minion.defenses[d.id]--; renderMinionDefenses(minion); updateMinionBudget(minion); }
        }}, '−'),
        el('input', {
          type: 'number', value: val, min: '0',
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 0) { minion.defenses[d.id] = v; updateMinionBudget(minion); }
          }
        }),
        el('button', { className: 'btn-inc', onClick: () => {
          minion.defenses[d.id]++; renderMinionDefenses(minion); updateMinionBudget(minion);
        }}, '+'),
      ),
    );
    grid.appendChild(card);
  });
}

function renderMinionSkills(minion) {
  const list = $('#minion-skills-list');
  list.innerHTML = '';
  minion.skills.forEach((skill, idx) => {
    const abilVal = minion.abilitiesAbsent[skill.ability] ? 0 : (minion.abilities[skill.ability] || 0);
    const total = skill.ranks + abilVal;
    const baseMinionSk = SKILLS.find(s => s.id === skill.baseId || s.id === skill.id);
    const row = el('div', { className: 'minion-skill-row' },
      el('span', { className: 'minion-skill-name' },
        skill.name,
        wikiLink(getWikiUrl('skill', baseMinionSk || skill)),
        el('span', { className: 'skill-ability' }, ` (${skill.ability.toUpperCase()})`)
      ),
      el('div', { className: 'minion-skill-ranks' },
        el('button', { className: 'btn-dec', onClick: () => {
          if (skill.ranks > 0) { skill.ranks--; renderMinionSkills(minion); updateMinionBudget(minion); }
        }}, '−'),
        el('input', {
          type: 'number', value: skill.ranks, min: '0',
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 0) { skill.ranks = v; updateMinionBudget(minion); }
          }
        }),
        el('button', { className: 'btn-inc', onClick: () => {
          skill.ranks++; renderMinionSkills(minion); updateMinionBudget(minion);
        }}, '+'),
      ),
      el('span', { className: 'minion-skill-total' }, signedNum(total)),
      skill.isSpecialty
        ? el('button', { className: 'btn-remove', onClick: () => {
            minion.skills.splice(idx, 1);
            renderMinionSkills(minion);
            updateMinionBudget(minion);
          }}, '×')
        : el('span'),
    );
    list.appendChild(row);
  });

  // Populate specialty dropdown
  const select = $('#minion-specialty-base');
  select.innerHTML = '<option value="">Add specialty...</option>';
  SKILLS.filter(s => s.hasSpecialty).forEach(s => {
    select.appendChild(el('option', { value: s.id }, s.name));
  });
}

function addMinionSpecialtySkill() {
  if (!editingMinionRef) return;
  const baseId = $('#minion-specialty-base').value;
  const name = $('#minion-specialty-name').value.trim();
  if (!baseId || !name) return;
  const baseSk = SKILLS.find(s => s.id === baseId);
  if (!baseSk) return;
  editingMinionRef.skills.push({
    id: `${baseId}_m${Date.now()}`,
    baseId,
    name: `${baseSk.name}: ${name}`,
    ability: baseSk.ability,
    ranks: 0,
    isSpecialty: true,
  });
  $('#minion-specialty-name').value = '';
  $('#minion-specialty-base').value = '';
  renderMinionSkills(editingMinionRef);
}

function renderMinionAdvantages(minion) {
  const grid = $('#minion-advantages-grid');
  grid.innerHTML = '';
  [...ADVANTAGES].sort((a, b) => a.name.localeCompare(b.name)).forEach(adv => {
    // Skip minion/sidekick advantages for minions (no nested minions)
    if (adv.id === 'minion' || adv.id === 'sidekick') return;
    const advData = minion.advantages || {};
    const isActive = !!advData[adv.id];
    const data = advData[adv.id] || { ranks: 1, specialty: '' };

    const item = el('div', { className: `minion-advantage-item ${isActive ? 'active' : ''}` });

    const check = el('div', { className: 'advantage-check' }, '✓');
    check.addEventListener('click', () => {
      if (!minion.advantages) minion.advantages = {};
      if (isActive) {
        delete minion.advantages[adv.id];
      } else {
        minion.advantages[adv.id] = { ranks: 1, specialty: '' };
      }
      renderMinionAdvantages(minion);
      updateMinionBudget(minion);
    });
    item.appendChild(check);

    item.appendChild(el('div', { className: 'advantage-info' },
      el('div', { className: 'advantage-info-name' }, adv.name, wikiLink(getWikiUrl('advantage', adv))),
      el('div', { className: 'advantage-info-desc' }, adv.description),
    ));

    if (isActive && adv.ranked) {
      const ranksInput = el('div', { className: 'advantage-ranks-input' },
        el('button', {
          className: 'btn-dec',
          onClick: (e) => {
            e.stopPropagation();
            if (data.ranks > 1) { minion.advantages[adv.id].ranks--; renderMinionAdvantages(minion); updateMinionBudget(minion); }
          }
        }, '−'),
        el('input', {
          type: 'number', value: data.ranks, min: '1', max: adv.maxRanks || '99',
          onClick: (e) => e.stopPropagation(),
          onInput: (e) => {
            e.stopPropagation();
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1) {
              minion.advantages[adv.id].ranks = adv.maxRanks ? Math.min(v, adv.maxRanks) : v;
              updateMinionBudget(minion);
            }
          }
        }),
        el('button', {
          className: 'btn-inc',
          onClick: (e) => {
            e.stopPropagation();
            if (!adv.maxRanks || data.ranks < adv.maxRanks) { minion.advantages[adv.id].ranks++; renderMinionAdvantages(minion); updateMinionBudget(minion); }
          }
        }, '+'),
      );
      item.appendChild(ranksInput);
    }

    if (isActive && adv.hasSpecialty) {
      item.appendChild(el('div', { className: 'advantage-specialty' },
        el('input', {
          type: 'text', value: data.specialty || '', placeholder: 'Specify...',
          onClick: (e) => e.stopPropagation(),
          onInput: (e) => { minion.advantages[adv.id].specialty = e.target.value; }
        })
      ));
    }

    grid.appendChild(item);
  });
}

function renderMinionPowers(minion) {
  const list = $('#minion-powers-list');
  list.innerHTML = '';
  (minion.powers || []).forEach((power, idx) => {
    const effect = POWER_EFFECTS.find(e => e.id === power.effectId);
    const cost = calculatePowerCost(power);

    const extras = (power.extras || []).map(ex => {
      const def = POWER_EXTRAS.find(e => e.id === ex.id);
      return def ? `${def.name}${ex.ranks > 1 ? ' ' + ex.ranks : ''}` : '';
    }).filter(Boolean);
    const flaws = (power.flaws || []).map(fl => {
      const def = POWER_FLAWS.find(f => f.id === fl.id);
      return def ? `${def.name}${fl.ranks > 1 ? ' ' + fl.ranks : ''}` : '';
    }).filter(Boolean);

    const card = el('div', { className: 'minion-power-card' },
      el('div', { className: 'minion-power-header' },
        el('div', null,
          el('span', { className: 'minion-power-name' }, power.name || 'Power'),
          el('span', { className: 'minion-power-effect' }, ` — ${effect ? effect.name : '?'} ${power.rank}`, effect ? wikiLink(getWikiUrl('effect', effect)) : null),
        ),
        el('div', { style: 'display:flex;gap:0.3rem;align-items:center' },
          el('span', { className: 'minion-power-cost' }, `${cost} PP`),
          el('button', { className: 'btn-edit', onClick: () => editMinionPower(minion, idx) }, '✎'),
          el('button', { className: 'btn-remove', onClick: () => {
            minion.powers.splice(idx, 1);
            renderMinionPowers(minion);
            updateMinionBudget(minion);
          }}, '×'),
        ),
      ),
    );

    if (extras.length || flaws.length) {
      const parts = [];
      if (extras.length) parts.push(`Extras: ${extras.join(', ')}`);
      if (flaws.length) parts.push(`Flaws: ${flaws.join(', ')}`);
      card.appendChild(el('div', { className: 'minion-power-mods' }, parts.join(' | ')));
    }

    list.appendChild(card);
  });
}

function addMinionPower(minion) {
  editingMinionRef = minion;
  editingMinionPowerIdx = -1;
  openPowerModal();
  $('#power-modal-title').textContent = 'New Minion Power';
}

function editMinionPower(minion, idx) {
  editingMinionRef = minion;
  editingMinionPowerIdx = idx;
  const power = minion.powers[idx];
  openPowerModal(); // opens blank
  if (power) {
    $('#power-modal-title').textContent = 'Edit Minion Power';
    $('#power-name').value = power.name;
    $('#power-effect').value = power.effectId;
    $('#power-rank').value = power.rank;
    $('#power-notes').value = power.notes || '';
    modalExtras = [...(power.extras || [])].map(e => ({ ...e }));
    modalFlaws = [...(power.flaws || [])].map(f => ({ ...f }));
    updatePowerEffectInfo();
    if (power.costPerRankOverride != null) {
      $('#power-cost-override').value = power.costPerRankOverride;
    }
    populateModifierDropdowns();
    renderModalModifiers();
    updatePowerCostPreview();
  }
}

function updateMinionBudget(minion) {
  const spent = getMinionSpent(minion);
  const remaining = minion.ppBudget - spent;
  $('#minion-pp-budget').textContent = minion.ppBudget;
  $('#minion-pp-spent').textContent = spent;
  $('#minion-pp-remaining').textContent = remaining;
  $('#minion-pp-remaining').style.color = remaining < 0 ? '#ff4444' : '';
}

function saveMinionFromModal() {
  const minion = state.minions.find(m => m.id === editingMinionId);
  if (!minion) return;
  minion.name = $('#minion-name').value.trim();
  minion.offense = $('#minion-offense').value;
  minion.notes = $('#minion-notes').value;
  closeMinionModal();
  renderAll();
}

function closeMinionModal() {
  $('#minion-modal').style.display = 'none';
  editingMinionId = null;
  editingMinionSource = null;
  editingMinionRef = null;
}

function removeMinion(sourceType, sourceId) {
  state.minions = state.minions.filter(m => !(m.sourceType === sourceType && m.sourceId === sourceId));
  renderAll();
}

function renderMinionCard(sourceType, sourceId) {
  const minion = state.minions.find(m => m.sourceType === sourceType && m.sourceId === sourceId);
  const ppBudget = getMinionPPBudget(sourceType, sourceId);
  if (!minion) {
    return el('button', {
      className: 'btn-add-minion',
      onClick: () => openMinionModal(sourceType, sourceId),
    }, '+ Add Minion Sheet');
  }
  const spent = getMinionSpent(minion);

  // Build summary snippets
  const advCount = Object.keys(minion.advantages || {}).length;
  const powerCount = (minion.powers || []).length;
  const skillRanks = (minion.skills || []).reduce((s, sk) => s + (sk.ranks || 0), 0);

  const card = el('div', { className: 'minion-card' },
    el('div', { className: 'minion-card-header' },
      el('div', null,
        el('span', { className: 'minion-card-name' }, minion.name || 'Unnamed Minion'),
        el('span', { className: 'minion-card-budget' }, ` (${spent}/${ppBudget} PP)`),
      ),
      el('div', { className: 'minion-card-actions' },
        el('button', { className: 'btn-edit', onClick: () => openMinionModal(sourceType, sourceId) }, '✎'),
        el('button', { className: 'btn-remove', onClick: () => removeMinion(sourceType, sourceId) }, '×'),
      ),
    ),
    el('div', { className: 'minion-card-stats' },
      ...ABILITIES.map(a => {
        const v = minion.abilitiesAbsent[a.id] ? '—' : minion.abilities[a.id];
        return el('span', null, `${a.abbr} ${v}`);
      }),
    ),
    el('div', { className: 'minion-card-summary' },
      el('span', null, `${skillRanks} skill ranks`),
      el('span', null, `${advCount} advantages`),
      el('span', null, `${powerCount} powers`),
    ),
  );
  return card;
}

function openPowerModal(powerId) {
  editingPowerId = powerId || null;
  const modal = $('#power-modal');
  modal.style.display = 'flex';
  // Raise z-index when opened from minion modal so it stacks above
  modal.style.zIndex = editingMinionRef ? '1010' : '';

  // Populate effect dropdown
  const effectSelect = $('#power-effect');
  effectSelect.innerHTML = '<option value="">Select an effect...</option>';
  POWER_EFFECT_TYPES.forEach(type => {
    const group = el('optgroup', { label: type });
    POWER_EFFECTS.filter(e => e.type === type).forEach(eff => {
      group.appendChild(el('option', { value: eff.id }, `${eff.name} (${eff.costPerRank}/rank)`));
    });
    effectSelect.appendChild(group);
  });

  // Populate extra/flaw dropdowns (filtered by selected effect)
  populateModifierDropdowns();

  // Reset or fill if editing
  if (powerId) {
    const power = state.powers.find(p => p.id === powerId);
    if (power) {
      $('#power-modal-title').textContent = 'Edit Power';
      $('#power-name').value = power.name;
      $('#power-effect').value = power.effectId;
      $('#power-rank').value = power.rank;
      $('#power-notes').value = power.notes || '';
      modalExtras = [...(power.extras || [])].map(e => ({ ...e }));
      modalFlaws = [...(power.flaws || [])].map(f => ({ ...f }));
      // Restore cost override after updatePowerEffectInfo populates the select
      if (power.costPerRankOverride != null) {
        updatePowerEffectInfo();
        $('#power-cost-override').value = power.costPerRankOverride;
      }
    }
  } else {
    $('#power-modal-title').textContent = 'New Power';
    $('#power-name').value = '';
    $('#power-effect').value = '';
    $('#power-rank').value = 1;
    $('#power-notes').value = '';
    modalExtras = [];
    modalFlaws = [];
  }

  updatePowerEffectInfo();
  populateModifierDropdowns();
  renderModalModifiers();
  updatePowerCostPreview();
}

function populateModifierDropdowns() {
  const effectId = $('#power-effect').value;

  const extraSelect = $('#power-add-extra');
  extraSelect.innerHTML = '<option value="">Add extra...</option>';
  const specificExtras = POWER_EXTRAS.filter(ex => ex.appliesTo && effectId && ex.appliesTo.includes(effectId)).sort((a, b) => a.name.localeCompare(b.name));
  const generalExtras = POWER_EXTRAS.filter(ex => !ex.appliesTo).sort((a, b) => a.name.localeCompare(b.name));
  if (specificExtras.length) {
    const grp = el('optgroup', { label: 'Effect-Specific' });
    specificExtras.forEach(ex => {
      const costStr = ex.costType === 'perRank' ? `+${ex.costValue}/rank` : `+${ex.costValue} flat`;
      grp.appendChild(el('option', { value: ex.id, title: ex.description }, `${ex.name} (${costStr})`));
    });
    extraSelect.appendChild(grp);
  }
  const grpGen = el('optgroup', { label: 'General' });
  generalExtras.forEach(ex => {
    const costStr = ex.costType === 'perRank' ? `+${ex.costValue}/rank` : `+${ex.costValue} flat`;
    grpGen.appendChild(el('option', { value: ex.id, title: ex.description }, `${ex.name} (${costStr})`));
  });
  extraSelect.appendChild(grpGen);

  const flawSelect = $('#power-add-flaw');
  flawSelect.innerHTML = '<option value="">Add flaw...</option>';
  const specificFlaws = POWER_FLAWS.filter(fl => fl.appliesTo && effectId && fl.appliesTo.includes(effectId)).sort((a, b) => a.name.localeCompare(b.name));
  const generalFlaws = POWER_FLAWS.filter(fl => !fl.appliesTo).sort((a, b) => a.name.localeCompare(b.name));
  if (specificFlaws.length) {
    const grp = el('optgroup', { label: 'Effect-Specific' });
    specificFlaws.forEach(fl => {
      const costStr = fl.costType === 'perRank' ? `${fl.costValue}/rank` : fl.costType === 'flat' ? `${fl.costValue} flat` : 'special';
      grp.appendChild(el('option', { value: fl.id, title: fl.description }, `${fl.name} (${costStr})`));
    });
    flawSelect.appendChild(grp);
  }
  const grpGenF = el('optgroup', { label: 'General' });
  generalFlaws.forEach(fl => {
    const costStr = fl.costType === 'perRank' ? `${fl.costValue}/rank` : fl.costType === 'flat' ? `${fl.costValue} flat` : 'special';
    grpGenF.appendChild(el('option', { value: fl.id, title: fl.description }, `${fl.name} (${costStr})`));
  });
  flawSelect.appendChild(grpGenF);
}

let modalExtras = [];
let modalFlaws = [];

function renderModalModifiers() {
  const extList = $('#power-extras-list');
  extList.innerHTML = '';
  modalExtras.forEach((ex, idx) => {
    const def = POWER_EXTRAS.find(e => e.id === ex.id);
    if (!def) return;
    if (def.noRanks) ex.ranks = 1;
    extList.appendChild(el('div', { className: 'modifier-item extra' },
      el('div', { className: 'modifier-item-info' },
        el('span', null, def.name, wikiLink(getWikiUrl('extra', def))),
        el('span', { className: 'modifier-cost-label' },
          def.costType === 'perRank' ? `+${def.costValue}/rank` : `+${def.costValue} flat`
        ),
        el('div', { className: 'modifier-desc' }, def.description),
      ),
      el('div', { style: 'display:flex;align-items:center;gap:0.5rem' },
        !def.noRanks ? el('div', { className: 'modifier-ranks' },
          el('button', { className: 'btn-dec', onClick: () => { if (ex.ranks > 1) { ex.ranks--; renderModalModifiers(); updatePowerCostPreview(); } } }, '−'),
          el('input', {
            type: 'number', value: ex.ranks, min: '1',
            onInput: (e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) { ex.ranks = v; updatePowerCostPreview(); } }
          }),
          el('button', { className: 'btn-inc', onClick: () => { ex.ranks++; renderModalModifiers(); updatePowerCostPreview(); } }, '+'),
        ) : null,
        el('button', { className: 'btn-remove', onClick: () => { modalExtras.splice(idx, 1); renderModalModifiers(); updatePowerCostPreview(); } }, '×'),
      ),
    ));
  });

  const flList = $('#power-flaws-list');
  flList.innerHTML = '';
  modalFlaws.forEach((fl, idx) => {
    const def = POWER_FLAWS.find(f => f.id === fl.id);
    if (!def) return;
    const costStr = def.costType === 'perRank' ? `${def.costValue}/rank` : def.costType === 'flat' ? `${def.costValue} flat` : 'special';
    if (def.noRanks) fl.ranks = 1;
    flList.appendChild(el('div', { className: 'modifier-item flaw' },
      el('div', { className: 'modifier-item-info' },
        el('span', null, def.name, wikiLink(getWikiUrl('flaw', def))),
        el('span', { className: 'modifier-cost-label' }, costStr),
        el('div', { className: 'modifier-desc' }, def.description),
      ),
      el('div', { style: 'display:flex;align-items:center;gap:0.5rem' },
        !def.noRanks ? el('div', { className: 'modifier-ranks' },
          el('button', { className: 'btn-dec', onClick: () => { if (fl.ranks > 1) { fl.ranks--; renderModalModifiers(); updatePowerCostPreview(); } } }, '−'),
          el('input', {
            type: 'number', value: fl.ranks, min: '1',
            onInput: (e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) { fl.ranks = v; updatePowerCostPreview(); } }
          }),
          el('button', { className: 'btn-inc', onClick: () => { fl.ranks++; renderModalModifiers(); updatePowerCostPreview(); } }, '+'),
        ) : null,
        el('button', { className: 'btn-remove', onClick: () => { modalFlaws.splice(idx, 1); renderModalModifiers(); updatePowerCostPreview(); } }, '×'),
      ),
    ));
  });
}

function updatePowerEffectInfo() {
  const effectId = $('#power-effect').value;
  const infoDiv = $('#power-effect-info');
  const costGroup = $('#power-cost-override-group');
  if (!effectId) {
    infoDiv.style.display = 'none';
    costGroup.style.display = 'none';
    return;
  }
  const effect = POWER_EFFECTS.find(e => e.id === effectId);
  if (!effect) {
    infoDiv.style.display = 'none';
    costGroup.style.display = 'none';
    return;
  }
  infoDiv.style.display = 'block';
  infoDiv.innerHTML = '';
  infoDiv.appendChild(el('div', null, el('strong', null, effect.name), wikiLink(getWikiUrl('effect', effect)), ` — ${effect.description}`));
  infoDiv.appendChild(el('div', { className: 'effect-stats' },
    el('span', null, `Type: ${effect.type}`),
    el('span', null, `Cost: ${effect.variableCost ? 'Variable' : effect.costPerRank + '/rank'}`),
    el('span', null, `Action: ${effect.action}`),
    el('span', null, `Range: ${effect.range}`),
    el('span', null, `Duration: ${effect.duration}`),
    effect.resistance !== '-' ? el('span', null, `Resist: ${effect.resistance}`) : null,
  ));

  // Reference tables for specific effects
  const refMap = { immunity: IMMUNITY_EXAMPLES, movement: MOVEMENT_TYPES, senses: SENSES_TYPES, comprehend: COMPREHEND_TYPES };
  const refData = refMap[effectId];
  if (refData && refData.length) {
    const refDiv = el('div', { className: 'power-effect-ref' });
    const refTitle = el('div', { className: 'power-effect-ref-title' },
      effectId === 'immunity' ? 'Common Immunities (ranks needed):' :
      effectId === 'movement' ? 'Movement Types (2 PP/rank each):' :
      effectId === 'senses' ? 'Sense Options (ranks each):' :
      'Comprehend Types (2 PP/rank each):'
    );
    refDiv.appendChild(refTitle);
    const grid = el('div', { className: 'power-effect-ref-grid' });
    refData.forEach(item => {
      grid.appendChild(el('span', { className: 'power-effect-ref-item' },
        `${item.name}: ${item.ranks}${item.description ? ' — ' + item.description : ''}`
      ));
    });
    refDiv.appendChild(grid);
    infoDiv.appendChild(refDiv);
  }

  // Affliction conditions reference
  if (effectId === 'affliction') {
    const refDiv = el('div', { className: 'power-effect-ref' });
    refDiv.appendChild(el('div', { className: 'power-effect-ref-title' }, 'Affliction Condition Degrees:'));
    const grid = el('div', { className: 'power-effect-ref-grid' });
    grid.appendChild(el('span', { className: 'power-effect-ref-item' }, `1st Degree: ${AFFLICTION_CONDITIONS.first.join(', ')}`));
    grid.appendChild(el('span', { className: 'power-effect-ref-item' }, `2nd Degree: ${AFFLICTION_CONDITIONS.second.join(', ')}`));
    grid.appendChild(el('span', { className: 'power-effect-ref-item' }, `3rd Degree: ${AFFLICTION_CONDITIONS.third.join(', ')}`));
    refDiv.appendChild(grid);
    infoDiv.appendChild(refDiv);
  }

  // Variable cost selector
  if (effect.variableCost) {
    costGroup.style.display = '';
    const sel = $('#power-cost-override');
    const currentVal = sel.value;
    sel.innerHTML = '';
    effect.variableCost.forEach(vc => {
      sel.appendChild(el('option', { value: vc.cost }, vc.label));
    });
    // Restore previous selection if still valid, otherwise use default
    if (currentVal && [...sel.options].some(o => o.value === currentVal)) {
      sel.value = currentVal;
    } else {
      sel.value = effect.costPerRank;
    }
  } else {
    costGroup.style.display = 'none';
  }
}

function updatePowerCostPreview() {
  const effectId = $('#power-effect').value;
  const rank = parseInt($('#power-rank').value) || 1;

  if (!effectId) {
    $('#power-base-cost').textContent = '0';
    $('#power-modified-cost').textContent = '0';
    $('#power-flat-mods').textContent = '0';
    $('#power-total-cost').textContent = '0 PP';
    return;
  }

  const effect = POWER_EFFECTS.find(e => e.id === effectId);
  const costOverride = effect && effect.variableCost ? parseInt($('#power-cost-override').value) : null;
  const baseCost = costOverride != null ? costOverride : (effect ? effect.costPerRank : 0);
  const tempPower = { effectId, rank, extras: modalExtras, flaws: modalFlaws, costPerRankOverride: costOverride };

  let modifiedCost = baseCost;
  let flatMod = 0;
  modalExtras.forEach(ex => {
    const def = POWER_EXTRAS.find(e => e.id === ex.id);
    if (!def) return;
    if (def.costType === 'perRank') modifiedCost += def.costValue * (ex.ranks || 1);
    else if (def.costType === 'flat') flatMod += def.costValue * (ex.ranks || 1);
  });
  modalFlaws.forEach(fl => {
    const def = POWER_FLAWS.find(f => f.id === fl.id);
    if (!def) return;
    if (def.costType === 'perRank') modifiedCost += def.costValue * (fl.ranks || 1);
    else if (def.costType === 'flat') flatMod += def.costValue * (fl.ranks || 1);
  });

  $('#power-base-cost').textContent = baseCost;
  if (modifiedCost < 1) {
    const rpp = 2 - modifiedCost;
    $('#power-modified-cost').textContent = `${rpp} ranks/PP`;
  } else {
    $('#power-modified-cost').textContent = modifiedCost;
  }
  $('#power-flat-mods').textContent = (flatMod >= 0 ? '+' : '') + flatMod;
  $('#power-total-cost').textContent = calculatePowerCost(tempPower) + ' PP';
}

function savePowerFromModal() {
  const name = $('#power-name').value.trim();
  const effectId = $('#power-effect').value;
  const rank = parseInt($('#power-rank').value) || 1;
  const notes = $('#power-notes').value.trim();
  const effect = POWER_EFFECTS.find(e => e.id === effectId);
  const costPerRankOverride = effect && effect.variableCost ? parseInt($('#power-cost-override').value) : null;

  if (!effectId) return;

  // Minion power mode
  if (editingMinionRef) {
    const minion = editingMinionRef;
    if (editingMinionPowerIdx >= 0) {
      minion.powers[editingMinionPowerIdx] = {
        ...minion.powers[editingMinionPowerIdx],
        name: name || minion.powers[editingMinionPowerIdx].name,
        effectId, rank, costPerRankOverride,
        extras: [...modalExtras], flaws: [...modalFlaws], notes,
      };
    } else {
      minion.powers.push({
        id: minion.nextPowerId++,
        name: name || effect?.name || 'Power',
        effectId, rank, costPerRankOverride,
        extras: [...modalExtras], flaws: [...modalFlaws], notes,
      });
    }
    closePowerModal();
    renderMinionPowers(minion);
    updateMinionBudget(minion);
    return;
  }

  if (editingPowerId) {
    const idx = state.powers.findIndex(p => p.id === editingPowerId);
    if (idx !== -1) {
      state.powers[idx] = {
        ...state.powers[idx],
        name: name || state.powers[idx].name,
        effectId,
        rank,
        costPerRankOverride,
        extras: [...modalExtras],
        flaws: [...modalFlaws],
        notes,
      };
    }
  } else {
    const newPower = {
      id: state.nextPowerId++,
      name: name || POWER_EFFECTS.find(e => e.id === effectId)?.name || 'Power',
      effectId,
      rank,
      costPerRankOverride,
      extras: [...modalExtras],
      flaws: [...modalFlaws],
      notes,
    };
    state.powers.push(newPower);

    // If adding to an array, link as slot
    if (editingArrayPowerId) {
      const arr = state.powerArrays.find(a => a.id === editingArrayPowerId);
      if (arr) {
        arr.slots.push({ powerId: newPower.id, dynamic: false });
      }
    }
  }

  closePowerModal();
  renderAll();
}

function closePowerModal() {
  const modal = $('#power-modal');
  modal.style.display = 'none';
  modal.style.zIndex = '';
  editingPowerId = null;
  editingArrayPowerId = null;
  editingMinionPowerIdx = -1;
  // Don't clear editingMinionRef here — minion modal is still open underneath
  modalExtras = [];
  modalFlaws = [];
}

function editPower(id) {
  openPowerModal(id);
}

function removePower(id) {
  // Clean up any associated minion (for Summon powers)
  state.minions = state.minions.filter(m => !(m.sourceType === 'power' && m.sourceId === id));
  // Remove from any array
  state.powerArrays.forEach(arr => {
    if (arr.basePowerId === id) {
      // Dissolve the array: promote first slot to standalone, rest become standalone
      arr.slots.forEach(slot => {
        const p = state.powers.find(pp => pp.id === slot.powerId);
        if (p) delete p.arrayId;
      });
      state.powerArrays = state.powerArrays.filter(a => a.id !== arr.id);
    } else {
      arr.slots = arr.slots.filter(s => s.powerId !== id);
    }
  });
  state.powers = state.powers.filter(p => p.id !== id);
  renderAll();
}

// -- Defenses Tab --
function renderDefenses() {
  const grid = $('#defenses-grid');
  grid.innerHTML = '';

  DEFENSES.forEach(def => {
    const abilScore = getAbilityScore(def.ability);
    const abilVal = abilScore != null ? abilScore : 0;
    const purchased = state.defenses[def.id] || 0;
    const total = getDefenseTotal(def.id);

    const equipBonuses = getEquipmentBonuses();
    const eqBonus = equipBonuses[def.id] || 0;

    let breakdownText = '';
    if (def.id === 'toughness') {
      const prot = state.powers.filter(p => p.effectId === 'protection').reduce((s, p) => s + p.rank, 0);
      const defRoll = state.advantages.defensiveRoll ? state.advantages.defensiveRoll.ranks : 0;
      const parts = [`${def.ability.toUpperCase()} ${signedNum(abilVal)}`];
      if (prot > 0) parts.push(`Protection +${prot}`);
      if (defRoll > 0) parts.push(`Def. Roll +${defRoll}*`);
      if (eqBonus > 0) parts.push(`Equip +${eqBonus}`);
      breakdownText = parts.join(' | ');
      if (defRoll > 0) breakdownText += '  (* active only — lost when vulnerable/surprised)';
    } else {
      let text = `${def.ability.toUpperCase()} ${signedNum(abilVal)} | Ranks +${purchased}`;
      if (eqBonus > 0) text += ` | Equip +${eqBonus}`;
      breakdownText = text;
    }

    const card = el('div', { className: 'defense-card' },
      el('div', { className: 'defense-name' }, def.name),
      el('div', { className: 'defense-total' }, String(total)),
      el('div', { className: 'defense-breakdown' }, breakdownText),
    );

    if (!def.noPurchase) {
      card.appendChild(el('div', { className: 'defense-ranks' },
        el('button', {
          className: 'btn-dec',
          onClick: () => { if (state.defenses[def.id] > 0) { state.defenses[def.id]--; renderAll(); } }
        }, '−'),
        el('input', {
          type: 'number',
          value: purchased,
          min: '0',
          onInput: (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 0) { state.defenses[def.id] = v; renderAll(); }
          }
        }),
        el('button', {
          className: 'btn-inc',
          onClick: () => { state.defenses[def.id]++; renderAll(); }
        }, '+'),
      ));
    }

    grid.appendChild(card);
  });

  // PL limit checks
  const limitsDiv = $('#defense-limits');
  limitsDiv.innerHTML = '<h3 style="margin-bottom:0.5rem">Power Level Limits</h3>';
  const limits = getPLLimits();
  limits.forEach(l => {
    limitsDiv.appendChild(el('div', { className: `defense-limit-row ${l.over ? 'over' : 'ok'}` },
      el('span', null, l.label),
      el('span', { className: 'defense-limit-value' }, `${l.value} / ${l.cap}`),
    ));
  });
}

// -- Equipment Tab --
let currentEqFilter = 'all';

function getEquipmentBudget() {
  const advData = state.advantages.equipment;
  return advData ? advData.ranks * 5 : 0;
}

function getEquipmentSpent() {
  return (state.equipment || []).reduce((sum, item) => sum + (item.cost || 0), 0);
}

function ensureEquipment() {
  if (!state.equipment) state.equipment = [];
  if (!state.nextEquipId) state.nextEquipId = 1;
}

function renderEquipment() {
  ensureEquipment();
  const budget = getEquipmentBudget();
  const spent = getEquipmentSpent();
  const budgetEl = $('#equipment-budget-display');
  if (budgetEl) {
    budgetEl.textContent = `${spent} / ${budget} EP`;
    budgetEl.classList.toggle('over-budget-text', spent > budget);
  }
  const noteEl = $('#equipment-adv-note');
  if (noteEl) {
    const advRanks = state.advantages.equipment ? state.advantages.equipment.ranks : 0;
    noteEl.textContent = advRanks > 0
      ? `(Equipment advantage: ${advRanks} rank${advRanks > 1 ? 's' : ''} = ${budget} EP)`
      : '(You need the Equipment advantage to gain equipment points.)';
  }

  // Owned list
  const ownedList = $('#equipment-owned-list');
  if (ownedList) {
    ownedList.innerHTML = '';
    if (state.equipment.length === 0) {
      ownedList.appendChild(el('p', { className: 'empty-message' }, 'No equipment added yet.'));
    } else {
      const catOrder = ['Weapon', 'Armor', 'Vehicle', 'General', 'Headquarters', 'Custom'];
      const catLabels = { Weapon: 'Weapons', Armor: 'Armor & Shields', Vehicle: 'Vehicles', General: 'General', Headquarters: 'Headquarters', Custom: 'Custom' };
      const grouped = {};
      state.equipment.forEach((item, idx) => {
        const cat = item.type || 'Custom';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ item, idx });
      });
      catOrder.forEach(cat => {
        const entries = grouped[cat];
        if (!entries) return;
        ownedList.appendChild(el('div', { className: 'equip-owned-category-header' }, catLabels[cat] || cat));
        entries.forEach(({ item, idx }) => {
          const row = el('div', { className: 'equipment-owned-item' },
            el('span', { className: 'equip-name' }, item.name),
            el('span', { className: 'equip-cost-badge' }, `${item.cost} EP`),
            el('span', { className: 'equip-details' }, item.details || ''),
          );
          if (item.custom && item.effects) {
            row.appendChild(el('button', {
              className: 'btn-edit-equip',
              title: 'Edit',
              onClick: () => openCustomEquipModal(idx),
            }, '✎'));
          }
          row.appendChild(el('button', {
            className: 'btn-remove',
            title: 'Remove',
            onClick: () => { state.equipment.splice(idx, 1); renderAll(); },
          }, '×'));
          ownedList.appendChild(row);
        });
      });
    }
  }

  // Catalog
  renderEquipmentCatalog(currentEqFilter);
}

function renderEquipmentCatalog(filter) {
  const catalog = $('#equipment-catalog');
  if (!catalog) return;
  catalog.innerHTML = '';
  const f = filter || 'all';

  const wikiUrl = getWikiUrl('equipment', null) || `${WIKI_BASE}/7-gadgets-gear/`;

  const categoryOrder = ['Weapon', 'Armor', 'Vehicle', 'General', 'Headquarters'];
  const categoryLabels = { Weapon: 'Weapons', Armor: 'Armor & Shields', Vehicle: 'Vehicles', General: 'General Equipment', Headquarters: 'Headquarters' };

  const grouped = {};
  EQUIPMENT_LIST.forEach(item => {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  });

  categoryOrder.forEach(cat => {
    const items = grouped[cat];
    if (!items || (f !== 'all' && cat !== f)) return;

    const header = el('div', { className: 'equip-catalog-category-header' }, categoryLabels[cat] || cat);
    catalog.appendChild(header);

    const grid = el('div', { className: 'equip-catalog-grid' });
    items.forEach(item => {
      const card = el('div', { className: 'equipment-catalog-item' },
        el('div', { className: 'equip-catalog-header' },
          el('span', { className: 'equip-catalog-name' }, item.name),
          el('span', { className: 'equip-cost-badge' }, `${item.cost} EP`),
          wikiLink(wikiUrl),
        ),
        el('div', { className: 'equip-catalog-details' }, item.details),
        el('button', {
          className: 'btn-add-equip',
          onClick: () => {
            ensureEquipment();
            state.equipment.push({
              id: state.nextEquipId++,
              name: item.name,
              cost: item.cost,
              type: item.type,
              details: item.details,
              custom: false,
            });
            renderAll();
          },
        }, '+'),
      );
      grid.appendChild(card);
    });
    catalog.appendChild(grid);
  });
}

function setupEquipment() {
  // Filter buttons
  document.querySelectorAll('[data-eqfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-eqfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEqFilter = btn.dataset.eqfilter;
      renderEquipmentCatalog(currentEqFilter);
    });
  });

  // Open custom equipment builder
  const openBtn = $('#btn-open-custom-equip');
  if (openBtn) openBtn.addEventListener('click', () => openCustomEquipModal());

  setupCustomEquipModal();
}

// ====== Custom Equipment Builder ======
let ceEffects = []; // working list: [{ effectId, rank, costPerRankOverride, extras: [{id,ranks}], flaws: [{id,ranks}] }]
let editingEquipIdx = null; // null = new, number = editing

function openCustomEquipModal(editIdx) {
  editingEquipIdx = editIdx != null ? editIdx : null;
  ceEffects = [];

  if (editingEquipIdx != null) {
    const item = state.equipment[editingEquipIdx];
    $('#custom-equip-name').value = item.name || '';
    $('#custom-equip-notes').value = item.notes || '';
    if (item.effects) {
      ceEffects = JSON.parse(JSON.stringify(item.effects));
    }
    $('#custom-equip-modal-title').textContent = 'Edit Custom Equipment';
    $('#custom-equip-modal-save').textContent = 'Save Changes';
  } else {
    $('#custom-equip-name').value = '';
    $('#custom-equip-notes').value = '';
    $('#custom-equip-modal-title').textContent = 'Build Custom Equipment';
    $('#custom-equip-modal-save').textContent = 'Add Equipment';
  }

  renderCEEffects();
  updateCECostPreview();
  $('#custom-equip-modal').style.display = 'flex';
}

function closeCustomEquipModal() {
  $('#custom-equip-modal').style.display = 'none';
  editingEquipIdx = null;
  ceEffects = [];
}

function addCEEffect() {
  ceEffects.push({ effectId: '', rank: 1, costPerRankOverride: null, extras: [], flaws: [] });
  renderCEEffects();
  updateCECostPreview();
}

function removeCEEffect(idx) {
  ceEffects.splice(idx, 1);
  renderCEEffects();
  updateCECostPreview();
}

function renderCEEffects() {
  const container = $('#ce-effects-list');
  container.innerHTML = '';

  if (ceEffects.length === 0) {
    container.appendChild(el('p', { className: 'empty-message' }, 'No effects added yet. Click "+ Add Effect" to start building.'));
    return;
  }

  ceEffects.forEach((eff, idx) => {
    const effectDef = POWER_EFFECTS.find(e => e.id === eff.effectId);

    // Effect row container
    const block = el('div', { className: 'ce-effect-block' });

    // Top row: effect select + rank + remove
    const topRow = el('div', { className: 'ce-effect-top-row' });

    // Effect dropdown
    const effectSelect = el('select', { className: 'ce-effect-select' });
    effectSelect.appendChild(el('option', { value: '' }, '— Select Effect —'));
    POWER_EFFECT_TYPES.forEach(type => {
      const grp = el('optgroup', { label: type });
      POWER_EFFECTS.filter(e => e.type === type).forEach(e => {
        const opt = el('option', { value: e.id }, `${e.name} (${e.costPerRank}/rank)`);
        if (e.id === eff.effectId) opt.selected = true;
        grp.appendChild(opt);
      });
      effectSelect.appendChild(grp);
    });
    effectSelect.addEventListener('change', () => {
      eff.effectId = effectSelect.value;
      eff.costPerRankOverride = null;
      eff.extras = [];
      eff.flaws = [];
      const newDef = POWER_EFFECTS.find(e => e.id === eff.effectId);
      if (newDef && newDef.variableCost) {
        eff.costPerRankOverride = newDef.variableCost[0].cost;
      }
      renderCEEffects();
      updateCECostPreview();
    });
    topRow.appendChild(effectSelect);

    // Variable cost dropdown (if applicable)
    if (effectDef && effectDef.variableCost) {
      const vcSelect = el('select', { className: 'ce-vc-select' });
      effectDef.variableCost.forEach(vc => {
        const opt = el('option', { value: vc.cost }, `${vc.label}`);
        if (eff.costPerRankOverride === vc.cost) opt.selected = true;
        vcSelect.appendChild(opt);
      });
      vcSelect.addEventListener('change', () => {
        eff.costPerRankOverride = parseInt(vcSelect.value);
        updateCECostPreview();
      });
      topRow.appendChild(vcSelect);
    }

    // Rank
    const rankLabel = el('label', { className: 'ce-rank-label' }, 'Rank');
    const rankInput = el('input', {
      type: 'number', className: 'ce-rank-input', value: eff.rank, min: 1, max: 30,
    });
    rankInput.addEventListener('change', () => {
      eff.rank = Math.max(1, parseInt(rankInput.value) || 1);
      updateCECostPreview();
    });
    topRow.appendChild(rankLabel);
    topRow.appendChild(rankInput);

    // Per-effect cost
    const costSpan = el('span', { className: 'ce-effect-cost' }, `${calculateCEEffectCost(eff)} EP`);
    topRow.appendChild(costSpan);

    // Remove
    topRow.appendChild(el('button', {
      className: 'btn-remove', title: 'Remove effect',
      onClick: () => removeCEEffect(idx),
    }, '×'));

    block.appendChild(topRow);

    // Effect info
    if (effectDef) {
      block.appendChild(el('div', { className: 'ce-effect-info' },
        `${effectDef.type} · ${effectDef.action} · ${effectDef.range} · ${effectDef.duration}` +
        (effectDef.resistance && effectDef.resistance !== '-' ? ` · Res: ${effectDef.resistance}` : '')
      ));
    }

    // Extras/Flaws rows
    if (eff.effectId) {
      const modsContainer = el('div', { className: 'ce-mods-container' });

      // Render existing extras
      eff.extras.forEach((ex, exIdx) => {
        const exDef = POWER_EXTRAS.find(e => e.id === ex.id);
        if (!exDef) return;
        const costStr = exDef.costType === 'perRank' ? `+${exDef.costValue}/rank` : `+${exDef.costValue} flat`;
        const modRow = el('div', { className: 'ce-mod-row ce-mod-extra' },
          el('span', { className: 'ce-mod-name', title: exDef.description }, `${exDef.name} (${costStr})`),
        );
        if (!exDef.noRanks) {
          const rk = el('input', { type: 'number', className: 'ce-mod-rank', value: ex.ranks, min: 1, max: 20 });
          rk.addEventListener('change', () => {
            ex.ranks = Math.max(1, parseInt(rk.value) || 1);
            renderCEEffects();
            updateCECostPreview();
          });
          modRow.appendChild(rk);
        }
        modRow.appendChild(el('button', { className: 'btn-remove', onClick: () => {
          eff.extras.splice(exIdx, 1);
          renderCEEffects();
          updateCECostPreview();
        }}, '×'));
        modsContainer.appendChild(modRow);
      });

      // Render existing flaws
      eff.flaws.forEach((fl, flIdx) => {
        const flDef = POWER_FLAWS.find(f => f.id === fl.id);
        if (!flDef) return;
        const costStr = flDef.costType === 'perRank' ? `${flDef.costValue}/rank` : flDef.costType === 'flat' ? `${flDef.costValue} flat` : 'special';
        const modRow = el('div', { className: 'ce-mod-row ce-mod-flaw' },
          el('span', { className: 'ce-mod-name', title: flDef.description }, `${flDef.name} (${costStr})`),
        );
        if (!flDef.noRanks && flDef.costType !== 'special') {
          const rk = el('input', { type: 'number', className: 'ce-mod-rank', value: fl.ranks, min: 1, max: 20 });
          rk.addEventListener('change', () => {
            fl.ranks = Math.max(1, parseInt(rk.value) || 1);
            renderCEEffects();
            updateCECostPreview();
          });
          modRow.appendChild(rk);
        }
        modRow.appendChild(el('button', { className: 'btn-remove', onClick: () => {
          eff.flaws.splice(flIdx, 1);
          renderCEEffects();
          updateCECostPreview();
        }}, '×'));
        modsContainer.appendChild(modRow);
      });

      // Add extra/flaw dropdowns
      const addRow = el('div', { className: 'ce-mod-add-row' });

      const extraSelect = el('select', { className: 'ce-add-mod-select' });
      extraSelect.appendChild(el('option', { value: '' }, 'Add extra...'));
      const specificExtras = POWER_EXTRAS.filter(ex => ex.appliesTo && ex.appliesTo.includes(eff.effectId)).sort((a, b) => a.name.localeCompare(b.name));
      const generalExtras = POWER_EXTRAS.filter(ex => !ex.appliesTo).sort((a, b) => a.name.localeCompare(b.name));
      if (specificExtras.length) {
        const grp = el('optgroup', { label: 'Effect-Specific' });
        specificExtras.forEach(ex => {
          const cs = ex.costType === 'perRank' ? `+${ex.costValue}/rank` : `+${ex.costValue} flat`;
          grp.appendChild(el('option', { value: ex.id, title: ex.description }, `${ex.name} (${cs})`));
        });
        extraSelect.appendChild(grp);
      }
      const grpGen = el('optgroup', { label: 'General' });
      generalExtras.forEach(ex => {
        const cs = ex.costType === 'perRank' ? `+${ex.costValue}/rank` : `+${ex.costValue} flat`;
        grpGen.appendChild(el('option', { value: ex.id, title: ex.description }, `${ex.name} (${cs})`));
      });
      extraSelect.appendChild(grpGen);
      extraSelect.addEventListener('change', () => {
        if (!extraSelect.value) return;
        eff.extras.push({ id: extraSelect.value, ranks: 1 });
        renderCEEffects();
        updateCECostPreview();
      });
      addRow.appendChild(extraSelect);

      const flawSelect = el('select', { className: 'ce-add-mod-select' });
      flawSelect.appendChild(el('option', { value: '' }, 'Add flaw...'));
      const specificFlaws = POWER_FLAWS.filter(fl => fl.appliesTo && fl.appliesTo.includes(eff.effectId)).sort((a, b) => a.name.localeCompare(b.name));
      const generalFlaws = POWER_FLAWS.filter(fl => !fl.appliesTo).sort((a, b) => a.name.localeCompare(b.name));
      if (specificFlaws.length) {
        const grp = el('optgroup', { label: 'Effect-Specific' });
        specificFlaws.forEach(fl => {
          const cs = fl.costType === 'perRank' ? `${fl.costValue}/rank` : fl.costType === 'flat' ? `${fl.costValue} flat` : 'special';
          grp.appendChild(el('option', { value: fl.id, title: fl.description }, `${fl.name} (${cs})`));
        });
        flawSelect.appendChild(grp);
      }
      const grpGenF = el('optgroup', { label: 'General' });
      generalFlaws.forEach(fl => {
        const cs = fl.costType === 'perRank' ? `${fl.costValue}/rank` : fl.costType === 'flat' ? `${fl.costValue} flat` : 'special';
        grpGenF.appendChild(el('option', { value: fl.id, title: fl.description }, `${fl.name} (${cs})`));
      });
      flawSelect.appendChild(grpGenF);
      flawSelect.addEventListener('change', () => {
        if (!flawSelect.value) return;
        eff.flaws.push({ id: flawSelect.value, ranks: 1 });
        renderCEEffects();
        updateCECostPreview();
      });
      addRow.appendChild(flawSelect);

      modsContainer.appendChild(addRow);
      block.appendChild(modsContainer);
    }

    container.appendChild(block);
  });
}

function calculateCEEffectCost(eff) {
  if (!eff.effectId) return 0;
  // Reuse the power cost engine
  return calculatePowerCost({
    effectId: eff.effectId,
    rank: eff.rank,
    costPerRankOverride: eff.costPerRankOverride,
    extras: eff.extras || [],
    flaws: eff.flaws || [],
  });
}

function getCETotalCost() {
  return ceEffects.reduce((sum, eff) => sum + calculateCEEffectCost(eff), 0);
}

function updateCECostPreview() {
  const total = getCETotalCost();
  const preview = $('#ce-cost-preview');
  if (preview) {
    preview.textContent = `Total: ${total} EP`;
    preview.classList.toggle('over-budget-text', total <= 0 && ceEffects.length > 0);
  }
  // Also update per-effect cost labels
  const blocks = document.querySelectorAll('.ce-effect-block');
  ceEffects.forEach((eff, idx) => {
    const costEl = blocks[idx] && blocks[idx].querySelector('.ce-effect-cost');
    if (costEl) costEl.textContent = `${calculateCEEffectCost(eff)} EP`;
  });
}

function buildCustomEquipItem() {
  const name = $('#custom-equip-name').value.trim();
  if (!name || ceEffects.length === 0) return null;

  const totalCost = getCETotalCost();
  const notes = $('#custom-equip-notes').value.trim();

  // Build details string
  const detailParts = [];
  let attack = null;
  const bonuses = {};

  ceEffects.forEach(eff => {
    const effectDef = POWER_EFFECTS.find(e => e.id === eff.effectId);
    if (!effectDef) return;

    // Build a description for this effect
    let desc = `${effectDef.name} ${eff.rank}`;
    const extraNames = eff.extras.map(ex => {
      const exDef = POWER_EXTRAS.find(e => e.id === ex.id);
      return exDef ? (exDef.noRanks || ex.ranks <= 1 ? exDef.name : `${exDef.name} ${ex.ranks}`) : '';
    }).filter(Boolean);
    const flawNames = eff.flaws.map(fl => {
      const flDef = POWER_FLAWS.find(f => f.id === fl.id);
      return flDef ? (flDef.noRanks || fl.ranks <= 1 ? flDef.name : `${flDef.name} ${fl.ranks}`) : '';
    }).filter(Boolean);
    if (extraNames.length) desc += ` (${extraNames.join(', ')})`;
    if (flawNames.length) desc += ` [${flawNames.join(', ')}]`;
    detailParts.push(desc);

    // Determine if this effect produces an attack
    if (effectDef.type === 'Attack') {
      const hasRangeIncrease = eff.extras.some(ex =>
        ex.id === 'increasedRange1' || ex.id === 'increasedRange2'
      );
      const hasArea = eff.extras.some(ex => ex.id && ex.id.startsWith('area'));
      const hasReducedRange = eff.flaws.some(fl => fl.id === 'reducedRange');

      let baseRange = effectDef.range || 'Close';
      let atkType = 'close';
      if (baseRange === 'Ranged' || hasRangeIncrease) atkType = 'ranged';
      if (hasReducedRange && baseRange === 'Ranged') atkType = 'close';
      if (hasArea) atkType = 'area';
      if (baseRange === 'Perception' || (hasRangeIncrease && baseRange === 'Ranged')) {
        if (hasArea) atkType = 'area';
        else atkType = 'perception';
      }

      const multiattack = eff.extras.some(ex => ex.id === 'multiattack');
      const accurateExtra = eff.extras.find(ex => ex.id === 'accurate');
      const inaccurateFlaw = eff.flaws.find(fl => fl.id === 'inaccurate');
      const bonusMod = (accurateExtra ? accurateExtra.ranks * 2 : 0) - (inaccurateFlaw ? inaccurateFlaw.ranks * 2 : 0);

      const noteParts = [];
      if (multiattack) noteParts.push('Multiattack');
      const areaExtra = eff.extras.find(ex => ex.id && ex.id.startsWith('area'));
      if (areaExtra) {
        const areaDef = POWER_EXTRAS.find(e => e.id === areaExtra.id);
        if (areaDef) noteParts.push(areaDef.name.replace('Area: ', '') + ' Area');
      }
      extraNames.filter(n => !['Multiattack', 'Accurate', 'Inaccurate'].includes(n) && !n.startsWith('Area')).forEach(n => {
        if (!noteParts.includes(n)) noteParts.push(n);
      });

      // Only set attack for first Attack-type effect
      if (!attack) {
        attack = {
          type: atkType,
          effect: effectDef.name,
          rank: eff.rank,
        };
        if (bonusMod) attack.bonusMod = bonusMod;
        if (noteParts.length) attack.notes = noteParts.join(', ');
      }
    }

    // Protection → toughness bonus
    if (eff.effectId === 'protection') {
      bonuses.toughness = (bonuses.toughness || 0) + eff.rank;
    }
    // Deflect → dodge bonus (equipment-style)
    if (eff.effectId === 'deflect') {
      bonuses.dodge = (bonuses.dodge || 0) + eff.rank;
      bonuses.parry = (bonuses.parry || 0) + eff.rank;
    }
  });

  const details = detailParts.join('; ') + (notes ? ` — ${notes}` : '');
  const hasBonuses = Object.keys(bonuses).length > 0;

  const item = {
    id: editingEquipIdx != null ? state.equipment[editingEquipIdx].id : state.nextEquipId++,
    name,
    cost: Math.max(1, totalCost),
    type: 'Custom',
    details,
    custom: true,
    effects: JSON.parse(JSON.stringify(ceEffects)),
  };
  if (attack) item.attack = attack;
  if (hasBonuses) item.bonuses = bonuses;
  if (notes) item.notes = notes;

  return item;
}

function saveCustomEquipment() {
  const name = $('#custom-equip-name').value.trim();
  if (!name) {
    $('#custom-equip-name').style.borderColor = 'var(--danger)';
    $('#custom-equip-name').focus();
    setTimeout(() => { $('#custom-equip-name').style.borderColor = ''; }, 2000);
    return;
  }
  if (ceEffects.length === 0 || ceEffects.every(e => !e.effectId)) {
    const btn = $('#btn-ce-add-effect');
    btn.style.borderColor = 'var(--danger)';
    btn.style.color = 'var(--danger)';
    setTimeout(() => { btn.style.borderColor = ''; btn.style.color = ''; }, 2000);
    return;
  }
  const item = buildCustomEquipItem();
  if (!item) return;

  ensureEquipment();
  if (editingEquipIdx != null) {
    state.equipment[editingEquipIdx] = item;
  } else {
    state.equipment.push(item);
  }

  closeCustomEquipModal();
  renderAll();
}

function setupCustomEquipModal() {
  const modal = $('#custom-equip-modal');
  const closeBtn = $('#custom-equip-modal-close');
  const cancelBtn = $('#custom-equip-modal-cancel');
  const saveBtn = $('#custom-equip-modal-save');
  const addEffBtn = $('#btn-ce-add-effect');

  if (closeBtn) closeBtn.addEventListener('click', closeCustomEquipModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCustomEquipModal);
  if (saveBtn) saveBtn.addEventListener('click', saveCustomEquipment);
  if (addEffBtn) addEffBtn.addEventListener('click', addCEEffect);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeCustomEquipModal(); });
}

// -- Offense Tab --
function renderOffense() {
  $('#initiative-value').textContent = signedNum(getInitiative());

  const list = $('#attacks-list');
  list.innerHTML = '';

  // Header
  list.appendChild(el('div', { className: 'attack-header' },
    el('span', null, 'Attack'),
    el('span', { style: 'text-align:center' }, 'Type'),
    el('span', { style: 'text-align:center' }, 'Bonus'),
    el('span', null, 'Effect'),
    el('span', null, ''),
  ));

  // Default unarmed
  const unarmedBonus = getCloseAttackBonus();
  const strScore = getAbilityScore('str');
  const strDmg = strScore != null ? strScore : 0;
  const strAbsent = strScore == null;
  if (strAbsent) {
    list.appendChild(el('div', { className: 'attack-row attack-disabled' },
      el('span', { className: 'attack-name' }, 'Unarmed'),
      el('span', { className: 'attack-type' }, 'Close'),
      el('span', { className: 'attack-bonus' }, signedNum(unarmedBonus)),
      el('span', null, 'No STR — cannot deal damage'),
      el('span', null, ''),
    ));
  } else {
    const unarmedDC = 15 + strDmg;
    list.appendChild(el('div', { className: 'attack-row' },
      el('span', { className: 'attack-name' }, 'Unarmed'),
      el('span', { className: 'attack-type' }, 'Close'),
      el('span', { className: 'attack-bonus' }, signedNum(unarmedBonus)),
      el('span', null, `Damage ${strDmg} (DC ${unarmedDC})`),
      el('span', null, ''),
    ));
  }

  // Default grab
  const fgtAbsent = getAbilityScore('fgt') == null;
  if (fgtAbsent && strAbsent) {
    // Can't grab with no FGT and no STR
  } else {
    list.appendChild(el('div', { className: 'attack-row' },
      el('span', { className: 'attack-name' }, 'Grab'),
      el('span', { className: 'attack-type' }, 'Close'),
      el('span', { className: 'attack-bonus' }, signedNum(unarmedBonus)),
      el('span', null, strAbsent ? 'Grab vs. STR/Dodge (STR —)' : `Grab vs. STR/Dodge (STR ${strDmg})`),
      el('span', null, ''),
    ));
  }

  // Default throw
  const throwBonus = getRangedAttackBonus();
  const throwMasteryRks = state.advantages.throwMastery ? state.advantages.throwMastery.ranks : 0;
  const throwDamage = strDmg + throwMasteryRks;
  const throwDC = 15 + throwDamage;
  list.appendChild(el('div', { className: 'attack-row' },
    el('span', { className: 'attack-name' }, throwMasteryRks > 0 ? `Throw (Mastery ${throwMasteryRks})` : 'Throw'),
    el('span', { className: 'attack-type' }, 'Ranged'),
    el('span', { className: 'attack-bonus' }, signedNum(throwBonus)),
    el('span', null, `Damage ${throwDamage} (DC ${throwDC})`),
    el('span', null, ''),
  ));

  // Power-based attacks
  state.powers.forEach(power => {
    const effect = POWER_EFFECTS.find(e => e.id === power.effectId);
    if (!effect || effect.type !== 'Attack') return;
    const effectiveRange = getEffectiveRange(power, effect);
    const needsRoll = requiresAttackRoll(power, effect);

    let bonusText, typeText;
    if (!needsRoll) {
      bonusText = '--';
      typeText = effectiveRange === 'Perception' ? 'Perception' : 'Area';
    } else {
      const isRanged = effectiveRange === 'Ranged';
      const baseBonus = isRanged ? getRangedAttackBonus() : getCloseAttackBonus();
      const accurateExtra = power.extras.find(e => e.id === 'accurate');
      const inaccurateFlaw = power.flaws.find(f => f.id === 'inaccurate');
      const bonus = baseBonus + (accurateExtra ? accurateExtra.ranks * 2 : 0) - (inaccurateFlaw ? inaccurateFlaw.ranks * 2 : 0);
      bonusText = signedNum(bonus);
      typeText = isRanged ? 'Ranged' : 'Close';
    }

    const dc = getEffectDC(effect, power.rank);
    const dcText = dc ? ` (DC ${dc})` : '';

    list.appendChild(el('div', { className: 'attack-row' },
      el('span', { className: 'attack-name' }, power.name),
      el('span', { className: 'attack-type' }, typeText),
      el('span', { className: 'attack-bonus' }, bonusText),
      el('span', null, `${effect.name} ${power.rank}${dcText}`),
      el('span', null, ''),
    ));
  });

  // Equipment weapon attacks
  if (state.equipment && state.equipment.length) {
    state.equipment.forEach(item => {
      const template = EQUIPMENT_LIST.find(e => e.name === item.name);
      const atk = (template && template.attack) || item.attack;
      if (!atk) return;

      const str = getAbilityScore('str') || 0;
      let bonusText, typeText;
      if (atk.type === 'area') {
        bonusText = '--';
        typeText = 'Area';
      } else if (atk.type === 'perception') {
        bonusText = '--';
        typeText = 'Perception';
      } else if (atk.type === 'ranged') {
        const bonus = getRangedAttackBonus() + (atk.bonusMod || 0);
        bonusText = signedNum(bonus);
        typeText = 'Ranged';
      } else {
        const bonus = getCloseAttackBonus() + (atk.bonusMod || 0);
        bonusText = signedNum(bonus);
        typeText = 'Close';
      }

      let effectText = '';
      if (atk.effect === 'Damage') {
        const totalRank = atk.strBased ? atk.rank + str : atk.rank;
        const dc = 15 + totalRank;
        effectText = `Damage ${totalRank} (DC ${dc})`;
      } else if (atk.rank > 0) {
        const dc = 10 + atk.rank;
        effectText = `${atk.effect} ${atk.rank} (DC ${dc})`;
      } else {
        effectText = atk.effect;
      }
      if (atk.notes) effectText += ` [${atk.notes}]`;

      list.appendChild(el('div', { className: 'attack-row equip-attack' },
        el('span', { className: 'attack-name' }, item.name),
        el('span', { className: 'attack-type' }, typeText),
        el('span', { className: 'attack-bonus' }, bonusText),
        el('span', null, effectText),
        el('span', null, ''),
      ));
    });
  }

  // Custom attacks
  state.attacks.forEach((atk, idx) => {
    list.appendChild(el('div', { className: 'attack-row' },
      el('span', { className: 'attack-name' }, atk.name),
      el('span', { className: 'attack-type' }, atk.type === 'close' ? 'Close' : 'Ranged'),
      el('span', { className: 'attack-bonus' }, signedNum(atk.bonus)),
      el('span', null, atk.effect),
      el('button', { className: 'btn-remove', onClick: () => { state.attacks.splice(idx, 1); renderAll(); } }, '×'),
    ));
  });
}

function openAttackModal() {
  $('#attack-modal').style.display = 'flex';
  $('#attack-name').value = '';
  $('#attack-type').value = 'close';
  $('#attack-bonus').value = 0;
  $('#attack-effect').value = '';
}

function closeAttackModal() {
  $('#attack-modal').style.display = 'none';
}

function saveAttackFromModal() {
  const name = $('#attack-name').value.trim();
  const type = $('#attack-type').value;
  const bonus = parseInt($('#attack-bonus').value) || 0;
  const effect = $('#attack-effect').value.trim();
  if (!name) return;

  state.attacks.push({
    id: state.nextAttackId++,
    name,
    type,
    bonus,
    effect: effect || 'Damage 0',
  });

  closeAttackModal();
  renderAll();
}

// -- Complications --
function renderComplications() {
  const list = $('#complications-list');
  list.innerHTML = '';

  state.complications.forEach((comp, idx) => {
    const row = el('div', { className: 'complication-row' },
      el('select', {
        onInput: (e) => { state.complications[idx].type = e.target.value; autoSaveRoster(); }
      }),
      el('input', {
        type: 'text',
        value: comp.description,
        placeholder: 'Describe this complication...',
        onInput: (e) => { state.complications[idx].description = e.target.value; autoSaveRoster(); },
      }),
      el('button', { className: 'btn-remove', onClick: () => { state.complications.splice(idx, 1); renderComplications(); autoSaveRoster(); } }, '×'),
    );

    // Populate select
    const select = row.querySelector('select');
    COMPLICATION_TYPES.forEach(t => {
      const opt = el('option', { value: t }, t);
      if (t === comp.type) opt.selected = true;
      select.appendChild(opt);
    });

    list.appendChild(row);
  });
}

function addComplication() {
  state.complications.push({ type: 'Motivation', description: '' });
  renderComplications();
}

// -- In-Play Tab --
function ensureInPlay() {
  if (!state.inPlay) state.inPlay = {};
  const d = { heroPoints: 1, toughnessPenalty: 0, conditions: [], exhaustion: 0, activeEffects: [], notes: '' };
  Object.keys(d).forEach(k => { if (state.inPlay[k] === undefined) state.inPlay[k] = d[k]; });
}

function renderInPlay() {
  ensureInPlay();
  const ip = state.inPlay;

  // Quick-reference stats bar
  const statsBar = $('#inplay-stats-bar');
  if (statsBar) {
    const toughPenalty = ip.toughnessPenalty || 0;
    const baseTough = getDefenseTotal('toughness');
    // If vulnerable/defenseless/surprised, Defensive Roll doesn't apply
    const activeConditions = new Set(ip.conditions || []);
    const loseDefRoll = activeConditions.has('Vulnerable') || activeConditions.has('Defenseless') || activeConditions.has('Surprised') || activeConditions.has('Stunned');
    const defRoll = state.advantages.defensiveRoll ? state.advantages.defensiveRoll.ranks : 0;
    const effTough = baseTough - toughPenalty - (loseDefRoll ? defRoll : 0);
    const dodge = getDefenseTotal('dodge');
    const parry = getDefenseTotal('parry');
    const fort = getDefenseTotal('fortitude');
    const will = getDefenseTotal('will');
    statsBar.innerHTML = '';
    [
      { label: 'Dodge', value: dodge },
      { label: 'Parry', value: parry },
      { label: 'Fortitude', value: fort },
      { label: 'Toughness', value: effTough, modified: toughPenalty > 0 || (loseDefRoll && defRoll > 0) },
      { label: 'Will', value: will },
      { label: 'Initiative', value: getInitiative(), signed: true },
    ].forEach(s => {
      const cls = 'inplay-stat' + (s.modified ? ' modified' : '');
      statsBar.appendChild(el('div', { className: cls },
        el('div', { className: 'inplay-stat-val' }, s.signed ? signedNum(s.value) : String(s.value)),
        el('div', { className: 'inplay-stat-label' }, s.label),
      ));
    });
  }

  // Equipment effects
  const eqFx = $('#inplay-equip-effects');
  const eqList = $('#inplay-equip-effects-list');
  if (eqFx && eqList) {
    const effects = getEquipmentEffects();
    if (effects.length) {
      eqFx.style.display = '';
      eqList.innerHTML = '';
      effects.forEach(e => {
        const sign = e.value >= 0 ? '+' : '';
        let text = `${e.item}: ${sign}${e.value} ${e.stat}`;
        if (e.note) text += ` (${e.note})`;
        eqList.appendChild(el('div', { className: 'inplay-equip-effect-row' }, text));
      });
    } else {
      eqFx.style.display = 'none';
    }
  }

  // Hero Points counter
  const hpC = $('#inplay-hp-counter');
  if (hpC) {
    hpC.innerHTML = '';
    hpC.appendChild(el('button', { className: 'btn-dec', onClick: () => { if (ip.heroPoints > 0) { ip.heroPoints--; renderInPlay(); autoSaveRoster(); } } }, '−'));
    hpC.appendChild(el('span', { className: 'inplay-counter-val' }, String(ip.heroPoints)));
    hpC.appendChild(el('button', { className: 'btn-inc', onClick: () => { ip.heroPoints++; renderInPlay(); autoSaveRoster(); } }, '+'));
  }

  // Toughness Penalty counter
  const tC = $('#inplay-tough-counter');
  if (tC) {
    tC.innerHTML = '';
    tC.appendChild(el('button', { className: 'btn-dec', onClick: () => { if (ip.toughnessPenalty > 0) { ip.toughnessPenalty--; renderInPlay(); autoSaveRoster(); } } }, '−'));
    tC.appendChild(el('span', { className: 'inplay-counter-val penalty' }, `−${ip.toughnessPenalty}`));
    tC.appendChild(el('button', { className: 'btn-inc', onClick: () => { ip.toughnessPenalty++; renderInPlay(); autoSaveRoster(); } }, '+'));
  }

  // Exhaustion track
  const exDiv = $('#inplay-exhaustion');
  if (exDiv) {
    exDiv.innerHTML = '';
    const levels = ['Normal', 'Fatigued', 'Exhausted', 'Incapacitated'];
    levels.forEach((lbl, i) => {
      const btn = el('button', {
        className: `inplay-exhaustion-btn ${ip.exhaustion === i ? 'active' : ''} ${i > 0 ? 'level-' + i : ''}`,
        onClick: () => { ip.exhaustion = i; renderInPlay(); autoSaveRoster(); },
      }, lbl);
      exDiv.appendChild(btn);
    });
  }

  // Conditions grid
  const cGrid = $('#inplay-conditions-grid');
  if (cGrid) {
    cGrid.innerHTML = '';
    const activeSet = new Set(ip.conditions);
    CONDITIONS.filter(c => c.name !== 'Normal').forEach(c => {
      const active = activeSet.has(c.name);
      const chip = el('button', {
        className: `inplay-condition-chip ${active ? 'active' : ''}`,
        title: c.description,
        onClick: () => {
          if (active) {
            ip.conditions = ip.conditions.filter(n => n !== c.name);
          } else {
            ip.conditions.push(c.name);
          }
          renderInPlay();
          autoSaveRoster();
        },
      }, c.name);
      cGrid.appendChild(chip);
    });
  }

  // Active conditions summary
  const cSummary = $('#inplay-conditions-summary');
  if (cSummary) {
    cSummary.innerHTML = '';
    const activeConditions = ip.conditions || [];
    if (activeConditions.length) {
      activeConditions.forEach(name => {
        const c = CONDITIONS.find(x => x.name === name);
        if (!c) return;
        const row = el('div', { className: 'inplay-condition-desc' },
          el('strong', null, c.name + ': '),
          document.createTextNode(c.description),
        );
        cSummary.appendChild(row);
      });
    }
  }

  // Active effects list
  const aeList = $('#inplay-active-effects-list');
  if (aeList) {
    aeList.innerHTML = '';
    (ip.activeEffects || []).forEach((eff, idx) => {
      const row = el('div', { className: 'inplay-active-effect' },
        el('span', null, eff),
        el('button', { className: 'btn-remove', onClick: () => { ip.activeEffects.splice(idx, 1); renderInPlay(); autoSaveRoster(); } }, '×'),
      );
      aeList.appendChild(row);
    });
    // Auto-populate sustained powers hint
    if (ip.activeEffects.length === 0) {
      const sustained = state.powers.filter(p => {
        const eff = POWER_EFFECTS.find(e => e.id === p.effectId);
        return eff && (eff.duration === 'Sustained' || eff.duration === 'Concentration');
      });
      if (sustained.length) {
        aeList.appendChild(el('div', { className: 'panel-note', style: 'margin-bottom:0.5rem' },
          `Sustained/Concentration powers: ${sustained.map(p => p.name || 'Unnamed').join(', ')}`));
      }
    }
  }

  // Session notes
  const notesEl = $('#inplay-notes');
  if (notesEl && document.activeElement !== notesEl) {
    notesEl.value = ip.notes || '';
  }
}

function setupInPlay() {
  const addBtn = $('#btn-add-active-effect');
  const input = $('#inplay-new-effect');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      ensureInPlay();
      const val = input.value.trim();
      if (!val) return;
      state.inPlay.activeEffects.push(val);
      input.value = '';
      renderInPlay();
      autoSaveRoster();
    });
  }
  if (input) {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
  }
  const notesEl = $('#inplay-notes');
  if (notesEl) {
    notesEl.addEventListener('input', () => {
      ensureInPlay();
      state.inPlay.notes = notesEl.value;
      autoSaveRoster();
    });
  }
  const resetBtn = $('#btn-inplay-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset tracker for a new scene? This clears conditions, toughness penalty, exhaustion, and active effects.')) return;
      ensureInPlay();
      state.inPlay.toughnessPenalty = 0;
      state.inPlay.conditions = [];
      state.inPlay.exhaustion = 0;
      state.inPlay.activeEffects = [];
      state.inPlay.heroPoints = Math.max(1, state.inPlay.heroPoints);
      renderInPlay();
      autoSaveRoster();
    });
  }
}

// -- Summary Tab --
function renderSummary() {
  const lines = [];
  const divider = '═'.repeat(60);
  const thinDiv = '─'.repeat(60);

  lines.push(divider);
  lines.push(`  ${state.name || 'Unnamed Character'}`);
  if (state.identity) lines.push(`  Identity: ${state.identity}`);
  const infoLine = [state.gender, state.age ? `Age ${state.age}` : '', state.height, state.weight].filter(Boolean).join('  |  ');
  if (infoLine) lines.push(`  ${infoLine}`);
  lines.push(`  Power Level: ${state.powerLevel}  |  Power Points: ${getSpentPP()} / ${getTotalPP()}`);
  lines.push(divider);

  if (state.appearance) {
    lines.push('');
    lines.push(`  Appearance: ${state.appearance}`);
  }
  if (state.background) {
    lines.push(`  Background: ${state.background}`);
  }

  // Abilities
  lines.push('');
  lines.push('  ABILITIES');
  lines.push(thinDiv);
  const abilLine = ABILITIES.map(a => {
    const v = state.abilitiesAbsent[a.id] ? '—' : state.abilities[a.id];
    return `${a.abbr} ${v}`;
  }).join('  |  ');
  lines.push(`  ${abilLine}`);
  lines.push(`  Cost: ${getAbilitiesCost()} PP`);

  // Defenses
  lines.push('');
  lines.push('  DEFENSES');
  lines.push(thinDiv);
  DEFENSES.forEach(def => {
    const total = getDefenseTotal(def.id);
    const abilScore = getAbilityScore(def.ability);
    const abilVal = abilScore != null ? abilScore : 0;
    const eqB = getEquipmentBonuses()[def.id] || 0;
    let detail = '';
    if (def.id === 'toughness') {
      const prot = state.powers.filter(p => p.effectId === 'protection').reduce((s, p) => s + p.rank, 0);
      const defRoll = state.advantages.defensiveRoll ? state.advantages.defensiveRoll.ranks : 0;
      const parts = [`STA ${signedNum(abilVal)}`];
      if (prot) parts.push(`Prot +${prot}`);
      if (defRoll) parts.push(`Def.Roll +${defRoll}*`);
      if (eqB) parts.push(`Equip +${eqB}`);
      detail = ` (${parts.join(', ')})`;
      if (defRoll) detail += '  *active only';
    } else {
      const purchased = state.defenses[def.id] || 0;
      const parts = [`${def.ability.toUpperCase()} ${signedNum(abilVal)}`];
      if (purchased) parts.push(`Ranks +${purchased}`);
      if (eqB) parts.push(`Equip +${eqB}`);
      detail = ` (${parts.join(', ')})`;
    }
    lines.push(`  ${def.name.padEnd(12)} ${total}${detail}`);
  });
  lines.push(`  Cost: ${getDefensesCost()} PP`);

  // Skills
  lines.push('');
  lines.push('  SKILLS');
  lines.push(thinDiv);
  state.skills.filter(s => s.ranks > 0).forEach(s => {
    const abilVal = getAbilityScore(s.ability) || 0;
    const total = s.ranks + abilVal;
    lines.push(`  ${s.name.padEnd(30)} ${signedNum(total)} (${s.ranks} ranks)`);
  });
  lines.push(`  Total Ranks: ${getSkillsTotalRanks()}  |  Cost: ${getSkillsCost()} PP`);

  // Advantages
  lines.push('');
  lines.push('  ADVANTAGES');
  lines.push(thinDiv);
  const advList = [];
  Object.entries(state.advantages).forEach(([id, data]) => {
    const adv = ADVANTAGES.find(a => a.id === id);
    if (!adv) return;
    let name = adv.name;
    if (data.specialty) name += ` (${data.specialty})`;
    if (adv.ranked && data.ranks > 1) name += ` ${data.ranks}`;
    advList.push(name);
  });
  if (advList.length) {
    lines.push(`  ${advList.join(', ')}`);
  } else {
    lines.push('  None');
  }
  lines.push(`  Cost: ${getAdvantagesCost()} PP`);

  // Powers
  lines.push('');
  lines.push('  POWERS');
  lines.push(thinDiv);

  const arrayPowerIds = new Set();
  state.powerArrays.forEach(arr => {
    arrayPowerIds.add(arr.basePowerId);
    (arr.slots || []).forEach(s => arrayPowerIds.add(s.powerId));
  });

  function formatPowerLine(p, indent, costOverride) {
    const effect = POWER_EFFECTS.find(e => e.id === p.effectId);
    const cost = costOverride != null ? costOverride : calculatePowerCost(p);
    const extras = (p.extras || []).map(ex => {
      const def = POWER_EXTRAS.find(e => e.id === ex.id);
      return def ? `${def.name}${ex.ranks > 1 ? ' ' + ex.ranks : ''}` : '';
    }).filter(Boolean);
    const flaws = (p.flaws || []).map(fl => {
      const def = POWER_FLAWS.find(f => f.id === fl.id);
      return def ? `${def.name}${fl.ranks > 1 ? ' ' + fl.ranks : ''}` : '';
    }).filter(Boolean);
    let line = `${indent}${p.name}: ${effect ? effect.name : 'Unknown'} ${p.rank}`;
    if (extras.length) line += `, Extras: ${extras.join(', ')}`;
    if (flaws.length) line += `, Flaws: ${flaws.join(', ')}`;
    line += ` • ${cost} PP`;
    lines.push(line);
    if (p.notes) lines.push(`${indent}  ${p.notes}`);
  }

  if (state.powers.length === 0) {
    lines.push('  None');
  } else {
    // Arrays
    state.powerArrays.forEach(arr => {
      const basePower = state.powers.find(p => p.id === arr.basePowerId);
      if (!basePower) return;
      const baseCost = calculatePowerCost(basePower);
      const slotsCost = (arr.slots || []).reduce((s, slot) => s + (slot.dynamic ? 2 : 1), 0);
      lines.push(`  ${arr.name || 'Power Array'} (${baseCost + slotsCost} PP total)`);
      formatPowerLine(basePower, '    Base: ', baseCost);
      (arr.slots || []).forEach(slot => {
        const sp = state.powers.find(p => p.id === slot.powerId);
        if (!sp) return;
        const label = slot.dynamic ? 'Dynamic AE' : 'AE';
        formatPowerLine(sp, `    ${label}: `, slot.dynamic ? 2 : 1);
      });
    });

    // Standalone
    state.powers.filter(p => !arrayPowerIds.has(p.id)).forEach(p => {
      formatPowerLine(p, '  ', null);
    });
  }
  lines.push(`  Cost: ${getPowersCost()} PP`);

  // Equipment
  ensureEquipment();
  if (state.equipment.length > 0) {
    const eqBudget = getEquipmentBudget();
    const eqSpent = getEquipmentSpent();
    lines.push('');
    lines.push('  EQUIPMENT');
    lines.push(thinDiv);
    state.equipment.forEach(item => {
      lines.push(`  ${item.name} (${item.cost} EP)${item.details ? ' — ' + item.details : ''}`);
    });
    lines.push(`  Equipment Points: ${eqSpent} / ${eqBudget} EP`);
  }

  // Minions
  if (state.minions.length) {
    lines.push('');
    lines.push('  MINIONS / SIDEKICKS / SUMMONS');
    lines.push(thinDiv);
    state.minions.forEach(m => {
      migrateMinion(m);
      const spent = getMinionSpent(m);
      lines.push(`  ${m.name || 'Unnamed Minion'} (${spent}/${m.ppBudget} PP)`);
      const abilLine = ABILITIES.map(a => {
        const v = m.abilitiesAbsent[a.id] ? '—' : (m.abilities[a.id] || 0);
        return `${a.abbr} ${v}`;
      }).join('  ');
      lines.push(`    Abilities: ${abilLine}`);
      const defParts = Object.entries(m.defenses || {}).filter(([, v]) => v > 0).map(([id, v]) => {
        const d = DEFENSES.find(dd => dd.id === id);
        return `${d ? d.name : id} ${v}`;
      });
      if (defParts.length) lines.push(`    Defenses: ${defParts.join(', ')}`);
      // Skills
      const skillLines = (m.skills || []).filter(s => s.ranks > 0).map(s => {
        const abilVal = m.abilitiesAbsent[s.ability] ? 0 : (m.abilities[s.ability] || 0);
        return `${s.name} ${s.ranks} (${signedNum(s.ranks + abilVal)})`;
      });
      if (skillLines.length) lines.push(`    Skills: ${skillLines.join(', ')}`);
      // Advantages
      const advList = [];
      Object.entries(m.advantages || {}).forEach(([id, data]) => {
        const adv = ADVANTAGES.find(a => a.id === id);
        if (!adv) return;
        let name = adv.name;
        if (data.specialty) name += ` (${data.specialty})`;
        if (adv.ranked && data.ranks > 1) name += ` ${data.ranks}`;
        advList.push(name);
      });
      if (advList.length) lines.push(`    Advantages: ${advList.join(', ')}`);
      // Powers
      (m.powers || []).forEach(p => {
        const effect = POWER_EFFECTS.find(e => e.id === p.effectId);
        const cost = calculatePowerCost(p);
        const extras = (p.extras || []).map(ex => {
          const def = POWER_EXTRAS.find(e => e.id === ex.id);
          return def ? `${def.name}${ex.ranks > 1 ? ' ' + ex.ranks : ''}` : '';
        }).filter(Boolean);
        const flaws = (p.flaws || []).map(fl => {
          const def = POWER_FLAWS.find(f => f.id === fl.id);
          return def ? `${def.name}${fl.ranks > 1 ? ' ' + fl.ranks : ''}` : '';
        }).filter(Boolean);
        let pLine = `    ${p.name}: ${effect ? effect.name : '?'} ${p.rank}`;
        if (extras.length) pLine += `, Extras: ${extras.join(', ')}`;
        if (flaws.length) pLine += `, Flaws: ${flaws.join(', ')}`;
        pLine += ` • ${cost} PP`;
        lines.push(pLine);
      });
      if (m.offense) lines.push(`    Offense: ${m.offense}`);
      if (m.notes) lines.push(`    Notes: ${m.notes}`);
    });
  }

  // Offense
  lines.push('');
  lines.push('  OFFENSE');
  lines.push(thinDiv);
  lines.push(`  Initiative: ${signedNum(getInitiative())}`);
  const sumStr = getAbilityScore('str');
  const sumStrVal = sumStr != null ? sumStr : 0;
  if (sumStr == null) {
    lines.push(`  Unarmed: Close, ${signedNum(getCloseAttackBonus())}, No STR — cannot deal damage`);
  } else {
    lines.push(`  Unarmed: Close, ${signedNum(getCloseAttackBonus())}, Damage ${sumStrVal} (DC ${15 + sumStrVal})`);
  }
  lines.push(`  Grab: Close, ${signedNum(getCloseAttackBonus())}, Grab vs. STR/Dodge (STR ${sumStr == null ? '—' : sumStrVal})`);
  const tmRks = state.advantages.throwMastery ? state.advantages.throwMastery.ranks : 0;
  const throwDam = sumStrVal + tmRks;
  lines.push(`  Throw: Ranged, ${signedNum(getRangedAttackBonus())}, Damage ${throwDam} (DC ${15 + throwDam})`);
  state.powers.forEach(p => {
    const effect = POWER_EFFECTS.find(e => e.id === p.effectId);
    if (!effect || effect.type !== 'Attack') return;
    const eRange = getEffectiveRange(p, effect);
    const needsRoll = requiresAttackRoll(p, effect);
    const dc = getEffectDC(effect, p.rank);
    const dcText = dc ? ` (DC ${dc})` : '';
    if (needsRoll) {
      const isRanged = eRange === 'Ranged';
      const bonus = isRanged ? getRangedAttackBonus() : getCloseAttackBonus();
      const accurateExtra = p.extras.find(e => e.id === 'accurate');
      const inaccurateFlaw = p.flaws.find(f => f.id === 'inaccurate');
      const totalBonus = bonus + (accurateExtra ? accurateExtra.ranks * 2 : 0) - (inaccurateFlaw ? inaccurateFlaw.ranks * 2 : 0);
      lines.push(`  ${p.name}: ${isRanged ? 'Ranged' : 'Close'}, ${signedNum(totalBonus)}, ${effect.name} ${p.rank}${dcText}`);
    } else {
      lines.push(`  ${p.name}: ${eRange === 'Perception' ? 'Perception' : 'Area'}, --, ${effect.name} ${p.rank}${dcText}`);
    }
  });
  state.attacks.forEach(atk => {
    lines.push(`  ${atk.name}: ${atk.type === 'close' ? 'Close' : 'Ranged'}, ${signedNum(atk.bonus)}, ${atk.effect}`);
  });
  // Equipment weapon attacks
  if (state.equipment && state.equipment.length) {
    const eqStr = getAbilityScore('str') || 0;
    state.equipment.forEach(item => {
      const template = EQUIPMENT_LIST.find(e => e.name === item.name);
      const atk = (template && template.attack) || item.attack;
      if (!atk) return;
      let typeLabel, bonusText, effectText;
      if (atk.type === 'area') { typeLabel = 'Area'; bonusText = '--'; }
      else if (atk.type === 'perception') { typeLabel = 'Perception'; bonusText = '--'; }
      else if (atk.type === 'ranged') { typeLabel = 'Ranged'; bonusText = signedNum(getRangedAttackBonus() + (atk.bonusMod || 0)); }
      else { typeLabel = 'Close'; bonusText = signedNum(getCloseAttackBonus() + (atk.bonusMod || 0)); }
      if (atk.effect === 'Damage') {
        const totalRank = atk.strBased ? atk.rank + eqStr : atk.rank;
        effectText = `Damage ${totalRank} (DC ${15 + totalRank})`;
      } else if (atk.rank > 0) {
        effectText = `${atk.effect} ${atk.rank} (DC ${10 + atk.rank})`;
      } else {
        effectText = atk.effect;
      }
      if (atk.notes) effectText += ` [${atk.notes}]`;
      lines.push(`  ${item.name}: ${typeLabel}, ${bonusText}, ${effectText}`);
    });
  }

  // Complications
  if (state.complications.length) {
    lines.push('');
    lines.push('  COMPLICATIONS');
    lines.push(thinDiv);
    state.complications.forEach(c => {
      lines.push(`  ${c.type}: ${c.description}`);
    });
  }

  // PP Summary
  lines.push('');
  lines.push('  POWER POINTS');
  lines.push(thinDiv);
  lines.push(`  Abilities: ${getAbilitiesCost()}`);
  lines.push(`  Skills: ${getSkillsCost()}`);
  lines.push(`  Advantages: ${getAdvantagesCost()}`);
  lines.push(`  Powers: ${getPowersCost()}`);
  lines.push(`  Defenses: ${getDefensesCost()}`);
  lines.push(`  Total: ${getSpentPP()} / ${getTotalPP()} PP`);
  lines.push(divider);

  $('#summary-content').textContent = lines.join('\n');
}

// -- Master render --
function renderAll() {
  renderPPTracker();
  renderPLWarnings();
  renderAbilities();
  renderSkills();
  renderAdvantages(currentAdvFilter);
  renderPowers();
  renderEquipment();
  renderDefenses();
  renderOffense();
  renderComplications();
  renderInPlay();
  renderSummary();
  autoSaveToLocal();
}

// ========== NAVIGATION ==========
let currentAdvFilter = 'all';

function setupNavigation() {
  $$('#main-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#main-nav .nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.tab-panel').forEach(tp => tp.classList.remove('active'));
      $(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Advantage filters
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn') && e.target.closest('.advantage-filters')) {
      $$('.advantage-filters .filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentAdvFilter = e.target.dataset.filter;
      renderAdvantages(currentAdvFilter);
    }
  });
}

// ========== INC/DEC BUTTONS ==========
function setupIncDecButtons() {
  document.addEventListener('click', (e) => {
    const target = e.target.dataset?.target;
    if (!target) return;
    const input = document.getElementById(target);
    if (!input) return;
    const step = parseInt(input.step) || 1;
    const min = input.min !== '' ? parseInt(input.min) : -Infinity;
    const max = input.max !== '' ? parseInt(input.max) : Infinity;
    let val = parseInt(input.value) || 0;

    if (e.target.classList.contains('btn-inc')) {
      val = Math.min(max, val + step);
    } else if (e.target.classList.contains('btn-dec')) {
      val = Math.max(min, val - step);
    }

    input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

// ========== CHAR INFO BINDINGS ==========
function setupInfoBindings() {
  const bind = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      state[key] = el.type === 'number' ? (parseInt(el.value) || 0) : el.value;
      if (key === 'powerLevel' || key === 'ppPerPL') renderAll();
      else autoSaveRoster();
      if (key === 'name') renderCharacterBar();
    });
  };

  bind('char-name', 'name');
  bind('char-identity', 'identity');
  bind('char-pl', 'powerLevel');
  bind('char-pp-per-pl', 'ppPerPL');
  bind('char-gender', 'gender');
  bind('char-age', 'age');
  bind('char-height', 'height');
  bind('char-weight', 'weight');
  bind('char-appearance', 'appearance');
  bind('char-background', 'background');
}

// ========== POWER MODAL BINDINGS ==========
function setupPowerModal() {
  $('#btn-add-power').addEventListener('click', () => openPowerModal());
  $('#power-modal-close').addEventListener('click', closePowerModal);
  $('#power-modal-cancel').addEventListener('click', closePowerModal);
  $('#power-modal-save').addEventListener('click', savePowerFromModal);

  $('#power-modal').addEventListener('click', (e) => {
    if (e.target === $('#power-modal')) closePowerModal();
  });

  $('#power-effect').addEventListener('change', () => {
    updatePowerEffectInfo();
    populateModifierDropdowns();
    updatePowerCostPreview();
  });

  $('#power-rank').addEventListener('input', updatePowerCostPreview);

  $('#power-cost-override').addEventListener('change', updatePowerCostPreview);

  $('#power-add-extra').addEventListener('change', (e) => {
    const id = e.target.value;
    if (!id) return;
    if (!modalExtras.find(ex => ex.id === id)) {
      modalExtras.push({ id, ranks: 1 });
      renderModalModifiers();
      updatePowerCostPreview();
    }
    e.target.value = '';
  });

  $('#power-add-flaw').addEventListener('change', (e) => {
    const id = e.target.value;
    if (!id) return;
    if (!modalFlaws.find(fl => fl.id === id)) {
      modalFlaws.push({ id, ranks: 1 });
      renderModalModifiers();
      updatePowerCostPreview();
    }
    e.target.value = '';
  });
}

// ========== MINION MODAL BINDINGS ==========
function setupMinionModal() {
  $('#minion-modal-close').addEventListener('click', closeMinionModal);
  $('#minion-modal-cancel').addEventListener('click', closeMinionModal);
  $('#minion-modal-save').addEventListener('click', saveMinionFromModal);
  $('#minion-modal').addEventListener('click', (e) => {
    if (e.target === $('#minion-modal')) closeMinionModal();
  });
  $('#minion-btn-add-specialty').addEventListener('click', addMinionSpecialtySkill);
  $('#minion-btn-add-power').addEventListener('click', () => {
    if (editingMinionRef) addMinionPower(editingMinionRef);
  });
}

// ========== ATTACK MODAL BINDINGS ==========
function setupAttackModal() {
  $('#btn-add-attack').addEventListener('click', openAttackModal);
  $('#attack-modal-close').addEventListener('click', closeAttackModal);
  $('#attack-modal-cancel').addEventListener('click', closeAttackModal);
  $('#attack-modal-save').addEventListener('click', saveAttackFromModal);

  $('#attack-modal').addEventListener('click', (e) => {
    if (e.target === $('#attack-modal')) closeAttackModal();
  });
}

// ========== SPECIALTY SKILL ==========
function setupSpecialtySkill() {
  $('#btn-add-specialty').addEventListener('click', addSpecialtySkill);
  $('#allow-negative-skills').addEventListener('change', (e) => {
    state.allowNegativeSkills = e.target.checked;
    if (!e.target.checked) {
      state.skills.forEach(s => { if (s.ranks < 0) s.ranks = 0; });
    }
    renderAll();
  });
}

// ========== COMPLICATIONS ==========
function setupComplications() {
  $('#btn-add-complication').addEventListener('click', addComplication);
}

// ========== SAVE / LOAD ==========
let roster = { activeId: null, characters: {} };
let nextRosterId = 1;

function generateRosterId() {
  return 'char_' + (nextRosterId++);
}

function getStateForSave() {
  return JSON.parse(JSON.stringify(state));
}

function getDefaultState() {
  const s = {
    name: '', identity: '', powerLevel: 10, ppPerPL: 15,
    gender: '', age: '', height: '', weight: '',
    appearance: '', background: '',
    abilities: {}, abilitiesAbsent: {},
    skills: [], advantages: {}, powers: [], powerArrays: [],
    defenses: { dodge: 0, parry: 0, fortitude: 0, will: 0 },
    equipment: [],
    attacks: [], complications: [{ type: 'Motivation', description: '' }, { type: 'Identity', description: '' }],
    allowNegativeSkills: false,
    minions: [], inPlay: { heroPoints: 1, toughnessPenalty: 0, conditions: [], exhaustion: 0, activeEffects: [], notes: '' },
    nextPowerId: 1, nextAttackId: 1, nextArrayId: 1, nextMinionId: 1, nextEquipId: 1,
  };
  ABILITIES.forEach(a => { s.abilities[a.id] = 0; s.abilitiesAbsent[a.id] = false; });
  const skills = [];
  SKILLS.forEach(sk => {
    if (!sk.hasSpecialty) skills.push({ id: sk.id, baseId: sk.id, name: sk.name, ability: sk.ability, ranks: 0, isSpecialty: false });
  });
  s.skills = skills;
  return s;
}

function loadStateFromData(data) {
  const defaults = getDefaultState();
  Object.keys(defaults).forEach(key => {
    state[key] = data[key] !== undefined ? data[key] : defaults[key];
  });
  // Also copy any extra keys from data (forward compat)
  Object.keys(data).forEach(key => {
    if (key in state) state[key] = data[key];
  });

  // Restore UI fields
  const fields = {
    'char-name': 'name', 'char-identity': 'identity',
    'char-pl': 'powerLevel', 'char-pp-per-pl': 'ppPerPL',
    'char-gender': 'gender', 'char-age': 'age',
    'char-height': 'height', 'char-weight': 'weight',
    'char-appearance': 'appearance', 'char-background': 'background',
  };
  Object.entries(fields).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.value = state[key];
  });

  renderAll();
}

function saveCurrentToRoster() {
  if (!roster.activeId) return;
  roster.characters[roster.activeId] = getStateForSave();
}

function switchCharacter(id) {
  if (roster.activeId && roster.activeId !== id) {
    saveCurrentToRoster();
  }
  roster.activeId = id;
  const data = roster.characters[id];
  if (data) {
    loadStateFromData(data);
  }
  renderCharacterBar();
  autoSaveRoster();
}

function createNewCharacter() {
  saveCurrentToRoster();
  const id = generateRosterId();
  roster.characters[id] = getDefaultState();
  roster.activeId = id;
  loadStateFromData(roster.characters[id]);
  renderCharacterBar();
  autoSaveRoster();
}

function duplicateCharacter() {
  saveCurrentToRoster();
  const id = generateRosterId();
  const copy = getStateForSave();
  copy.name = (copy.name || 'Character') + ' (Copy)';
  roster.characters[id] = copy;
  roster.activeId = id;
  loadStateFromData(copy);
  renderCharacterBar();
  autoSaveRoster();
}

function deleteCharacter() {
  const ids = Object.keys(roster.characters);
  if (ids.length <= 1) {
    alert('Cannot delete the last character. Use "Reset Character" to clear it instead.');
    return;
  }
  const name = state.name || 'this character';
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  delete roster.characters[roster.activeId];
  const remaining = Object.keys(roster.characters);
  roster.activeId = remaining[0];
  loadStateFromData(roster.characters[roster.activeId]);
  renderCharacterBar();
  autoSaveRoster();
}

function renderCharacterBar() {
  const select = $('#character-select');
  select.innerHTML = '';
  Object.entries(roster.characters).forEach(([id, data]) => {
    // For the active character, use live state.name
    const name = (id === roster.activeId ? state.name : data.name) || 'Unnamed Character';
    const opt = el('option', { value: id }, name);
    if (id === roster.activeId) opt.selected = true;
    select.appendChild(opt);
  });
}

function saveToFile() {
  const data = getStateForSave();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || 'character'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadFromFile() {
  $('#file-input').click();
}

function handleFileLoad(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      // Import as a new character in the roster
      saveCurrentToRoster();
      const id = generateRosterId();
      roster.characters[id] = data;
      roster.activeId = id;
      loadStateFromData(data);
      renderCharacterBar();
      autoSaveRoster();
    } catch (err) {
      alert('Invalid character file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function exportAsText() {
  renderSummary();
  const text = $('#summary-content').textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || 'character'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearCharacter() {
  if (!confirm('Reset this character? All data will be erased.')) return;
  const defaults = getDefaultState();
  Object.keys(defaults).forEach(key => { state[key] = defaults[key]; });

  ['char-name', 'char-identity', 'char-gender', 'char-age', 'char-height', 'char-weight', 'char-appearance', 'char-background']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  $('#char-pl').value = 10;
  $('#char-pp-per-pl').value = 15;

  renderAll();
  autoSaveRoster();
}

function autoSaveRoster() {
  try {
    saveCurrentToRoster();
    localStorage.setItem('mm3e_roster', JSON.stringify({ activeId: roster.activeId, characters: roster.characters, nextRosterId }));
  } catch (e) { /* ignore */ }
}

function autoSaveToLocal() {
  autoSaveRoster();
}

function autoLoadRoster() {
  try {
    // Try new roster format first
    const rosterData = localStorage.getItem('mm3e_roster');
    if (rosterData) {
      const parsed = JSON.parse(rosterData);
      roster.characters = parsed.characters || {};
      roster.activeId = parsed.activeId || null;
      nextRosterId = parsed.nextRosterId || Object.keys(roster.characters).length + 1;
      if (roster.activeId && roster.characters[roster.activeId]) {
        loadStateFromData(roster.characters[roster.activeId]);
        renderCharacterBar();
        return true;
      }
      // activeId invalid — pick first
      const ids = Object.keys(roster.characters);
      if (ids.length) {
        roster.activeId = ids[0];
        loadStateFromData(roster.characters[roster.activeId]);
        renderCharacterBar();
        return true;
      }
    }
    // Migrate old single-character format
    const oldData = localStorage.getItem('mm3e_character');
    if (oldData) {
      const data = JSON.parse(oldData);
      const id = generateRosterId();
      roster.characters[id] = data;
      roster.activeId = id;
      loadStateFromData(data);
      renderCharacterBar();
      localStorage.removeItem('mm3e_character');
      autoSaveRoster();
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}

function setupSaveLoad() {
  $('#btn-save').addEventListener('click', saveToFile);
  $('#btn-load').addEventListener('click', loadFromFile);
  $('#file-input').addEventListener('change', handleFileLoad);
  $('#btn-export-text').addEventListener('click', exportAsText);
  $('#btn-clear').addEventListener('click', clearCharacter);
  $('#btn-copy-summary').addEventListener('click', () => {
    renderSummary();
    const text = $('#summary-content').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = $('#btn-copy-summary');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
    }).catch(() => {
      // Fallback for older browsers or file:// protocol
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const btn = $('#btn-copy-summary');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy to Clipboard', 2000);
    });
  });
}

function setupCharacterBar() {
  $('#character-select').addEventListener('change', (e) => {
    const id = e.target.value;
    if (id && id !== roster.activeId) {
      switchCharacter(id);
    }
  });
  $('#btn-char-new').addEventListener('click', createNewCharacter);
  $('#btn-char-dup').addEventListener('click', duplicateCharacter);
  $('#btn-char-del').addEventListener('click', deleteCharacter);
}

// ========== INITIALIZATION ==========
function init() {
  setupNavigation();
  setupIncDecButtons();
  setupInfoBindings();
  setupPowerModal();
  setupMinionModal();
  setupAttackModal();
  setupSpecialtySkill();
  setupComplications();
  setupEquipment();
  setupInPlay();
  setupSaveLoad();
  setupCharacterBar();

  if (!autoLoadRoster()) {
    // First time — create a default character
    const id = generateRosterId();
    roster.characters[id] = getDefaultState();
    roster.activeId = id;
    loadStateFromData(roster.characters[id]);
    renderCharacterBar();
  }
}

document.addEventListener('DOMContentLoaded', init);
