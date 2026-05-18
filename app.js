const defaults = {
  language: "bg",
  mode: "weekly",
  doseMg: 20,
  concentration: 200,
  weeklyDose: 100,
  weeklyConcentration: 200,
  frequency: "7",
  customInjections: 3,
  vialVolumeMl: 10,
};

let activeMode = defaults.mode;
let activeLanguage = defaults.language;
let selectedFrequency = defaults.frequency;

const copy = {
  bg: {
    title: "TRT Калкулатор",
    documentTitle: "TRT Калкулатор",
    subtitle: "Калкулатор за mL и U-100",
    singleTitle: "Единична доза",
    weeklyTitle: "Седмична доза",
    dose: "Доза",
    weeklyDose: "Седмична доза",
    concentration: "Концентрация",
    frequency: "Честота на инжектиране",
    singleMlLabel: "mL за инжекция",
    singleUnitsLabel: "U-100 единици",
    mgPerInjection: "mg на инжекция",
    mlPerInjection: "mL на инжекция",
    unitsPerInjection: "U-100 единици на инжекция",
    weeklyMl: "mL седмично",
    customInjections: "Инжекции седмично",
    vialUsageTitle: "Използване на флакон",
    vialDays: "дни запас",
    vialDoseUnit: "инжекции",
    vialWord: "флакон",
    vialLeftover: "остатък",
    syringe: "U-100 спринцовка",
    warning: "Обемът надвишава скалата на 1 mL спринцовка.",
    copy: "Копирай резултата",
    clear: "Изчисти",
    copied: "Копирано",
    incomplete: "Попълни стойности",
    units: "единици",
    everyDay: "Всеки ден",
    everyOtherDay: "През ден",
    twiceWeekly: "2 пъти седмично",
    threeWeekly: "3 пъти седмично",
    custom: "Персонално",
    disclaimer: "Това е калкулатор за конвертиране на стойности, не медицински съвет.",
    syringeEmpty: "U-100 спринцовка: непълно изчисление",
  },
  en: {
    title: "TRT Calculator",
    documentTitle: "TRT Calculator",
    subtitle: "Calculator for mL and U-100",
    singleTitle: "Single dose",
    weeklyTitle: "Weekly dose",
    dose: "Dose",
    weeklyDose: "Weekly dose",
    concentration: "Concentration",
    frequency: "Injection frequency",
    singleMlLabel: "mL per injection",
    singleUnitsLabel: "U-100 units",
    mgPerInjection: "mg per injection",
    mlPerInjection: "mL per injection",
    unitsPerInjection: "U-100 units per injection",
    weeklyMl: "Weekly mL",
    customInjections: "Injections per week",
    vialUsageTitle: "Vial usage",
    vialDays: "days of supply",
    vialDoseUnit: "doses",
    vialWord: "vial",
    vialLeftover: "leftover",
    syringe: "U-100 syringe",
    warning: "Volume exceeds the 1 mL syringe scale.",
    copy: "Copy result",
    clear: "Clear",
    copied: "Copied",
    incomplete: "Enter values",
    units: "units",
    everyDay: "Every day",
    everyOtherDay: "Every other day",
    twiceWeekly: "2x weekly",
    threeWeekly: "3x weekly",
    custom: "Custom",
    disclaimer: "This is a value conversion calculator, not medical advice.",
    syringeEmpty: "U-100 syringe: incomplete calculation",
  },
};

const fields = {
  doseMg: document.querySelector("#doseMg"),
  concentration: document.querySelector("#concentration"),
  weeklyDose: document.querySelector("#weeklyDose"),
  weeklyConcentration: document.querySelector("#weeklyConcentration"),
  customInjections: document.querySelector("#customInjections"),
};

const output = {
  singleMl: document.querySelector("#singleMl"),
  singleUnits: document.querySelector("#singleUnits"),
  syringeSvg: document.querySelector("#syringeSvg"),
  syringeUnits: document.querySelector("#syringeUnits"),
  syringeFill: document.querySelector("#syringeFill"),
  syringeStopper: document.querySelector("#syringeStopper"),
  syringeWarning: document.querySelector("#syringeWarning"),
  customInjectionsField: document.querySelector("#customInjectionsField"),
  mgPerInjection: document.querySelector("#mgPerInjection"),
  mlPerInjection: document.querySelector("#mlPerInjection"),
  unitsPerInjection: document.querySelector("#unitsPerInjection"),
  weeklyMl: document.querySelector("#weeklyMl"),
  vialUsageCard: document.querySelector("#vialUsageCard"),
  vialIllustration: document.querySelector("#vialIllustration"),
  vialLiquid: document.querySelector("#vialLiquid"),
  vialDays: document.querySelector("#vialDays"),
  vialDoses: document.querySelector("#vialDoses"),
  vialMeta: document.querySelector("#vialMeta"),
  copyStatus: document.querySelector("#copyStatus"),
};

const buttons = {
  copy: document.querySelector("#copyResult"),
  reset: document.querySelector("#resetCalculator"),
  modes: document.querySelectorAll("[data-mode]"),
  languages: document.querySelectorAll("[data-language]"),
  frequencyTrigger: document.querySelector("#frequencyTrigger"),
  frequencyOptions: document.querySelectorAll("[data-frequency-value]"),
};

const panels = document.querySelectorAll("[data-panel]");
const i18nNodes = document.querySelectorAll("[data-i18n]");
const optionNodes = document.querySelectorAll("[data-i18n-option]");
const frequencyMenu = document.querySelector("#frequencyMenu");
const frequencyValue = document.querySelector("#frequencyValue");
const titleNode = document.querySelector("#page-title");
const subtitleNode = document.querySelector("#subtitle");
const disclaimerNode = document.querySelector("#disclaimer");

const readNumber = (field) => {
  if (!field.value.trim()) return null;
  const value = Number(field.value);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, value);
};

const formatNumber = (value, digits = 2) => {
  if (value === null || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const formatCompact = (value, digits = 1) => {
  if (value === null || !Number.isFinite(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
};

const updateSyringe = ({ ml, units, valid }) => {
  const strings = copy[activeLanguage];
  const fillWidth = valid ? Math.min(units, 100) * 4.8 : 0;
  const fillX = 588 - fillWidth;
  const stopperX = 584 - fillWidth;
  const syringeLabel = `${formatNumber(ml)} mL / ${formatCompact(units)} ${strings.units}`;

  output.syringeUnits.textContent = syringeLabel;
  output.syringeFill.setAttribute("x", String(fillX));
  output.syringeFill.setAttribute("width", String(fillWidth));
  output.syringeStopper.setAttribute("x", String(stopperX));
  output.syringeSvg.setAttribute("aria-label", valid ? `${strings.syringe}: ${syringeLabel}` : strings.syringeEmpty);
  output.syringeWarning.hidden = !(valid && units > 100);
};

const calculateSingle = () => {
  const dose = readNumber(fields.doseMg);
  const concentration = readNumber(fields.concentration);
  const valid = dose !== null && concentration !== null && concentration > 0;
  const ml = valid ? dose / concentration : null;
  const units = valid ? ml * 100 : null;

  output.singleMl.textContent = `${formatNumber(ml)} mL`;
  output.singleUnits.textContent = `${formatCompact(units)} ${copy[activeLanguage].units}`;

  return { mode: "single", dose, concentration, ml, units, valid };
};

const calculateWeekly = () => {
  const strings = copy[activeLanguage];
  const weeklyDose = readNumber(fields.weeklyDose);
  const concentration = readNumber(fields.weeklyConcentration);
  const injectionsPerWeek = selectedFrequency === "custom"
    ? readNumber(fields.customInjections)
    : Number(selectedFrequency);
  const valid = weeklyDose !== null && concentration !== null && concentration > 0 && injectionsPerWeek !== null && injectionsPerWeek > 0;

  const mgPerInjection = valid ? weeklyDose / injectionsPerWeek : null;
  const ml = valid ? mgPerInjection / concentration : null;
  const units = valid ? ml * 100 : null;
  const weeklyMl = valid ? weeklyDose / concentration : null;
  const intervalDays = valid ? 7 / injectionsPerWeek : null;
  const dosesPerVial = valid && ml > 0 ? Math.floor(defaults.vialVolumeMl / ml) : null;
  const daysOfSupply = valid && dosesPerVial !== null ? dosesPerVial * intervalDays : null;
  const leftoverMl = valid && dosesPerVial !== null ? defaults.vialVolumeMl - dosesPerVial * ml : null;
  const vialValid = valid && dosesPerVial !== null && daysOfSupply !== null && leftoverMl !== null;

  output.customInjectionsField.hidden = selectedFrequency !== "custom";
  output.mgPerInjection.textContent = `${formatNumber(mgPerInjection)} mg`;
  output.mlPerInjection.textContent = `${formatNumber(ml)} mL`;
  output.unitsPerInjection.textContent = `${formatCompact(units)} ${copy[activeLanguage].units}`;
  output.weeklyMl.textContent = `${formatNumber(weeklyMl)} mL`;
  output.vialDays.textContent = vialValid ? `~${Math.round(daysOfSupply)} ${strings.vialDays} / ${dosesPerVial} ${strings.vialDoseUnit}` : `~-- ${strings.vialDays}`;
  output.vialDoses.textContent = vialValid ? `${formatCompact(defaults.vialVolumeMl, 2)} mL ${strings.vialWord} · ${formatCompact(concentration, 2)} mg/mL` : `${formatCompact(defaults.vialVolumeMl, 2)} mL ${strings.vialWord} · -- mg/mL`;
  output.vialMeta.textContent = vialValid
    ? `${formatCompact(concentration, 2)} mg/mL · ${formatCompact(defaults.vialVolumeMl, 2)} mL · ${leftoverMl > 0.01 ? `${formatNumber(leftoverMl)} mL ${strings.vialLeftover}` : `0 mL ${strings.vialLeftover}`}`
    : `-- mg/mL · ${formatCompact(defaults.vialVolumeMl, 2)} mL · -- mL ${strings.vialLeftover}`;
  output.vialLiquid.setAttribute("height", "80");
  output.vialLiquid.setAttribute("y", "38");
  output.vialIllustration.setAttribute("aria-label", vialValid ? `Vial: ${dosesPerVial} doses, ${formatNumber(leftoverMl)} mL leftover.` : "Vial usage unavailable.");

  return { mode: "weekly", weeklyDose, concentration, injectionsPerWeek, mgPerInjection, ml, units, weeklyMl, valid, dosesPerVial, daysOfSupply, leftoverMl };
};

const closeFrequencyMenu = () => {
  frequencyMenu.hidden = true;
  buttons.frequencyTrigger.classList.remove("is-open");
  buttons.frequencyTrigger.setAttribute("aria-expanded", "false");
};

const openFrequencyMenu = () => {
  frequencyMenu.hidden = false;
  buttons.frequencyTrigger.classList.add("is-open");
  buttons.frequencyTrigger.setAttribute("aria-expanded", "true");
};

const setFrequency = (value) => {
  selectedFrequency = value;
  buttons.frequencyOptions.forEach((option) => {
    const isSelected = option.dataset.frequencyValue === value;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
    if (isSelected) {
      frequencyValue.textContent = option.textContent;
    }
  });
  closeFrequencyMenu();
  output.copyStatus.textContent = "";
  calculate();
};

const calculate = () => {
  const single = calculateSingle();
  const weekly = calculateWeekly();
  const activeResult = activeMode === "weekly" ? weekly : single;
  updateSyringe(activeResult);
  return activeResult;
};

const setMode = (mode) => {
  activeMode = mode;
  buttons.modes.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === mode;
    panel.classList.toggle("is-active", isActive);
    panel.classList.toggle("is-hidden", !isActive);
    panel.hidden = !isActive;
    panel.setAttribute("aria-hidden", String(!isActive));
  });
  output.vialUsageCard.hidden = true;
  output.copyStatus.textContent = "";
  calculate();
};

const setLanguage = (language) => {
  activeLanguage = language;
  const strings = copy[language];

  document.documentElement.lang = language;
  document.title = strings.documentTitle;
  titleNode.textContent = strings.title;
  subtitleNode.textContent = strings.subtitle;
  disclaimerNode.textContent = strings.disclaimer;

  i18nNodes.forEach((node) => {
    node.textContent = strings[node.dataset.i18n];
  });
  optionNodes.forEach((node) => {
    node.textContent = strings[node.dataset.i18nOption];
  });
  buttons.frequencyOptions.forEach((option) => {
    if (option.dataset.frequencyValue === selectedFrequency) {
      frequencyValue.textContent = option.textContent;
    }
  });
  buttons.modes.forEach((button) => {
    button.textContent = strings[button.dataset.mode === "weekly" ? "weeklyTitle" : "singleTitle"];
  });
  buttons.languages.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  output.copyStatus.textContent = "";
  calculate();
};

const sanitizeInput = (event) => {
  const field = event.target;
  if (field.value && Number(field.value) < 0) {
    field.value = "0";
  }
  output.copyStatus.textContent = "";
  calculate();
};

const copyResult = async () => {
  const result = calculate();
  if (!result.valid) {
    output.copyStatus.textContent = copy[activeLanguage].incomplete;
    return;
  }

  const text = activeLanguage === "en"
    ? (result.mode === "weekly"
      ? `TRT calculation: ${formatCompact(result.weeklyDose, 2)} mg/week, ${formatCompact(result.injectionsPerWeek, 2)} injections/week at ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 units per injection.`
      : `TRT calculation: ${formatCompact(result.dose, 2)} mg at ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 units.`)
    : (result.mode === "weekly"
      ? `TRT изчисление: ${formatCompact(result.weeklyDose, 2)} mg/седмица, ${formatCompact(result.injectionsPerWeek, 2)} инжекции седмично при ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 единици на инжекция.`
      : `TRT изчисление: ${formatCompact(result.dose, 2)} mg при ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 единици.`);

  try {
    await navigator.clipboard.writeText(text);
    output.copyStatus.textContent = copy[activeLanguage].copied;
  } catch {
    output.copyStatus.textContent = text;
  }
};

const resetCalculator = () => {
  fields.doseMg.value = defaults.doseMg;
  fields.concentration.value = defaults.concentration;
  fields.weeklyDose.value = defaults.weeklyDose;
  fields.weeklyConcentration.value = defaults.weeklyConcentration;
  fields.customInjections.value = defaults.customInjections;
  output.copyStatus.textContent = "";
  setFrequency(defaults.frequency);
  setMode(defaults.mode);
};

Object.values(fields).forEach((field) => {
  field.addEventListener("input", sanitizeInput);
  field.addEventListener("change", sanitizeInput);
});

buttons.modes.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

buttons.languages.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

buttons.frequencyTrigger.addEventListener("click", () => {
  if (frequencyMenu.hidden) {
    openFrequencyMenu();
  } else {
    closeFrequencyMenu();
  }
});

buttons.frequencyOptions.forEach((option) => {
  option.addEventListener("click", () => setFrequency(option.dataset.frequencyValue));
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#frequencySelect")) {
    closeFrequencyMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFrequencyMenu();
    buttons.frequencyTrigger.focus();
  }
});

buttons.copy.addEventListener("click", copyResult);
buttons.reset.addEventListener("click", resetCalculator);

setLanguage(defaults.language);
setFrequency(defaults.frequency);
setMode(defaults.mode);
