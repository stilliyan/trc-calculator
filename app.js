const defaults = {
  language: "bg",
  mode: "single",
  theme: "dark",
  doseMg: 20,
  concentration: 200,
  weeklyDose: "0.20",
  targetWeeklyDose: 200,
  weeklyConcentration: 250,
  frequency: "7",
  customInjections: 3,
  vialVolumeMl: 10,
  blendInjectionMl: "0.20",
  blendTargetWeeklyDose: 200,
  inputMethod: "weekly",
  compounds: [
    { name: "Test P", concentration: 50 },
    { name: "Mast P", concentration: 50 },
    { name: "Tren A", concentration: 50 },
  ],
};

let activeMode = defaults.mode;
let activeLanguage = defaults.language;
let activeCompoundMode = "single";
let activeTheme = defaults.theme;
let activeInputMethod = defaults.inputMethod;
let selectedFrequency = defaults.frequency;
let copyFeedbackTimer;
let selectedScheduleDuration = "4";
let lastScheduleEvents = [];

const eodFrequencyValue = "3.5";

const detectPreferredLanguage = () => {
  const browserLanguages = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean);

  if (browserLanguages.some((language) => language.toLowerCase().startsWith("bg"))) {
    return "bg";
  }

  if (browserLanguages.some((language) => language.toLowerCase().startsWith("en"))) {
    return "en";
  }

  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Sofia") {
      return "bg";
    }
  } catch {
    // Keep the bundled Bulgarian default if browser locale detection is unavailable.
  }

  return defaults.language;
};

const copy = {
  bg: {
    title: "TRT Калкулатор",
    documentTitle: "TRT Калкулатор",
    subtitle: "Изчислява mL, U-100 единици и седмична доза според концентрация и честота.",
    blendSubtitle: "Изчислява обща доза и разбивка по съставки за бленд препарати.",
    heroExample: "Нов тук? Виж примерна сметка",
    singleTitle: "Единична доза",
    weeklyTitle: "Въведете седмична цел и концентрация",
    compoundSingle: "TRT",
    compoundBlend: "Бленд",
    dose: "Доза",
    weeklyDose: "mL на инжекция",
    inputMethodWeekly: "Седмична доза",
    inputMethodMl: "mL на инжекция",
    targetWeeklyDose: "Желана седмична доза",
    injectionAmount: "Количество на инжекция",
    concentration: "Концентрация",
    frequency: "Честота на инжектиране",
    singleMlLabel: "mL за инжекция",
    singleUnitsLabel: "U-100 единици",
    mgPerInjection: "mg на инжекция",
    mlPerInjection: "mL на инжекция",
    unitsPerInjection: "U-100 единици на инжекция",
    weeklyMl: "mg седмично",
    averageMgWeekly: "mg седмично средно",
    totalAmount: "Общо количество",
    blendInjectionMl: "mL на инжекция",
    compound1: "Съставка 1",
    compound2: "Съставка 2",
    compound3: "Съставка 3",
    total: "Общо",
    blendCopiedTitle: "Бленд",
    eodSyringeNote: "3.5× седмично (средно)",
    customInjections: "Инжекции седмично",
    vialUsageTitle: "Използване на флакон",
    vialDays: "дни запас",
    vialDoseUnit: "инжекции",
    vialWord: "флакон",
    vialLeftover: "остатък",
    scheduleTitle: "График",
    addToCalendar: "Добави в календар",
    duration4: "4 седмици",
    duration8: "8 седмици",
    duration12: "12 седмици",
    durationVial: "До изчерпване",
    dailyStarting: "Всеки ден от",
    eodStarting: "През ден от",
    twiceStarting: "2 пъти седмично от",
    threeStarting: "3 пъти седмично от",
    customStarting: "Персонално от",
    today: "ДНЕС",
    syringe: "U-100 спринцовка",
    warning: "Обемът надвишава скалата на 1 mL спринцовка.",
    copy: "Копирай резултата",
    clear: "Изчисти",
    copied: "Копирано",
    copyFailed: "Неуспешно копиране",
    incomplete: "Попълни стойности",
    units: "единици",
    injectionsWeekly: "инжекции седмично",
    averageInjectionsWeekly: "Средно 3.5 инжекции седмично",
    roundedFrom: "Закръглено от",
    usedForSyringeScale: "Използвано за U-100 скалата",
    unitRule: "1 единица = 0.01 mL",
    basedOnFrequency: "Според избраната честота",
    everyDay: "Всеки ден",
    everyOtherDay: "През ден",
    twiceWeekly: "2 пъти седмично",
    threeWeekly: "3 пъти седмично",
    custom: "Персонално",
    disclaimer: "Само с образователна цел - не е медицински съвет. Формулите са описани, а ограниченията са документирани. Провери всяка доза с лекар.",
    supportButton: "Buy me a Monster",
    supportAria: "Buy me a Monster",
    privacyLink: "Поверителност",
    termsLink: "Условия",
    close: "Затвори",
    closeAria: "Затвори",
    privacyTitle: "Поверителност",
    privacyBody1: "Този калкулатор не изисква регистрация и не съхранява въведените стойности.",
    privacyBody2: "Изчисленията се правят локално в браузъра. Не използваме tracking cookies или analytics.",
    privacyBody3: "Ако отвориш външен линк, като support бутон, той може да се обработва от съответната външна услуга.",
    termsTitle: "Условия",
    termsBody1: "Инструментът е само за конвертиране на стойности и не дава медицински съвет или препоръки за дозиране.",
    termsBody2: "Възможни са грешки в въвеждането, закръгляването или интерпретацията. Провери резултатите преди употреба.",
    termsBody3: "Дозировки и медицински решения се обсъждат с лицензиран медицински специалист.",
    syringeEmpty: "U-100 спринцовка: непълно изчисление",
    lightTheme: "Светла тема",
    darkTheme: "Тъмна тема",
  },
  en: {
    title: "TRT Dosage Calculator",
    documentTitle: "TRT Dosage Calculator",
    subtitle: "Calculate mL, U-100 units, and weekly dose from concentration and frequency.",
    blendSubtitle: "Calculate total dose and compound breakdown for blended formulations.",
    heroExample: "New here? See a worked example",
    singleTitle: "Single dose",
    weeklyTitle: "Enter your weekly target and concentration",
    compoundSingle: "TRT",
    compoundBlend: "Blend",
    dose: "Dose",
    weeklyDose: "mL per injection",
    inputMethodWeekly: "Weekly dose",
    inputMethodMl: "mL per injection",
    targetWeeklyDose: "Target weekly dose",
    injectionAmount: "Injection amount",
    concentration: "Concentration",
    frequency: "Injection frequency",
    singleMlLabel: "mL per injection",
    singleUnitsLabel: "U-100 units",
    mgPerInjection: "mg per injection",
    mlPerInjection: "mL per injection",
    unitsPerInjection: "U-100 units per injection",
    weeklyMl: "Weekly mg",
    averageMgWeekly: "Average weekly mg",
    totalAmount: "Total amount",
    blendInjectionMl: "mL per injection",
    compound1: "Compound 1",
    compound2: "Compound 2",
    compound3: "Compound 3",
    total: "Total",
    blendCopiedTitle: "Blend",
    eodSyringeNote: "3.5× weekly (average)",
    customInjections: "Injections per week",
    vialUsageTitle: "Vial usage",
    vialDays: "days of supply",
    vialDoseUnit: "doses",
    vialWord: "vial",
    vialLeftover: "leftover",
    scheduleTitle: "Schedule",
    addToCalendar: "Add to calendar",
    duration4: "4 weeks",
    duration8: "8 weeks",
    duration12: "12 weeks",
    durationVial: "Until vial empty",
    dailyStarting: "Daily starting",
    eodStarting: "Every other day starting",
    twiceStarting: "2x weekly starting",
    threeStarting: "3x weekly starting",
    customStarting: "Custom starting",
    today: "TODAY",
    syringe: "U-100 syringe",
    warning: "Volume exceeds the 1 mL syringe scale.",
    copy: "Copy result",
    clear: "Clear",
    copied: "Copied",
    copyFailed: "Copy failed",
    incomplete: "Enter values",
    units: "units",
    injectionsWeekly: "injections weekly",
    averageInjectionsWeekly: "Average 3.5 injections weekly",
    roundedFrom: "Rounded from",
    usedForSyringeScale: "Used for U-100 scale",
    unitRule: "1 unit = 0.01 mL",
    basedOnFrequency: "Based on selected frequency",
    everyDay: "Every day",
    everyOtherDay: "Every other day",
    twiceWeekly: "2x weekly",
    threeWeekly: "3x weekly",
    custom: "Custom",
    disclaimer: "Educational only - not medical advice. Every formula is cited and every limitation is documented. Verify any dose with a licensed prescriber.",
    supportButton: "Buy me a Monster",
    supportAria: "Buy me a Monster",
    privacyLink: "Privacy",
    termsLink: "Terms",
    close: "Close",
    closeAria: "Close",
    privacyTitle: "Privacy",
    privacyBody1: "This calculator does not require an account and does not store the values you enter.",
    privacyBody2: "Calculations happen locally in your browser. We do not use tracking cookies or analytics.",
    privacyBody3: "If you open an external link, such as a support button, it may be handled by that third-party service.",
    termsTitle: "Terms",
    termsBody1: "This tool only converts values and does not provide medical advice or dosage recommendations.",
    termsBody2: "Input, rounding, or interpretation errors can happen. Verify results before using them.",
    termsBody3: "Dosages and medical decisions should be discussed with a licensed medical professional.",
    syringeEmpty: "U-100 syringe: incomplete calculation",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
  },
};

const fields = {
  doseMg: document.querySelector("#doseMg"),
  concentration: document.querySelector("#concentration"),
  weeklyDose: document.querySelector("#weeklyDose"),
  targetWeeklyDose: document.querySelector("#targetWeeklyDose"),
  weeklyConcentration: document.querySelector("#weeklyConcentration"),
  customInjections: document.querySelector("#customInjections"),
  blendInjectionMl: document.querySelector("#blendInjectionMl"),
  blendTargetWeeklyDose: document.querySelector("#blendTargetWeeklyDose"),
  compoundNames: [
    document.querySelector("#compoundName1"),
    document.querySelector("#compoundName2"),
    document.querySelector("#compoundName3"),
  ],
  compoundConcentrations: [
    document.querySelector("#compoundConcentration1"),
    document.querySelector("#compoundConcentration2"),
    document.querySelector("#compoundConcentration3"),
  ],
};

const output = {
  singleMl: document.querySelector("#singleMl"),
  singleUnits: document.querySelector("#singleUnits"),
  syringeSvg: document.querySelector("#syringeSvg"),
  syringeSummary: document.querySelector("#syringeSummary"),
  syringeFrequencySummary: document.querySelector("#syringeFrequencySummary"),
  syringeUnits: document.querySelector("#syringeUnits"),
  syringeFill: document.querySelector("#syringeFill"),
  syringeStopper: document.querySelector("#syringeStopper"),
  syringeWarning: document.querySelector("#syringeWarning"),
  modeToggle: document.querySelector(".mode-toggle"),
  weeklyDoseField: document.querySelector("#weeklyDoseField"),
  targetWeeklyDoseField: document.querySelector("#targetWeeklyDoseField"),
  weeklyConcentrationField: document.querySelector("#weeklyConcentrationField"),
  blendFields: document.querySelector("#blendFields"),
  blendInjectionMlField: document.querySelector("#blendInjectionMlField"),
  blendTargetWeeklyDoseField: document.querySelector("#blendTargetWeeklyDoseField"),
  customInjectionsField: document.querySelector("#customInjectionsField"),
  eodDoseHelper: document.querySelector("#eodDoseHelper"),
  eodSyringeNote: document.querySelector("#eodSyringeNote"),
  primaryResultLabel: document.querySelector("#primaryResultLabel"),
  mgPerInjection: document.querySelector("#mgPerInjection"),
  blendBreakdown: document.querySelector("#blendBreakdown"),
  mgResultHelper: document.querySelector("#mgResultHelper"),
  mlPerInjection: document.querySelector("#mlPerInjection"),
  mlResultHelper: document.querySelector("#mlResultHelper"),
  unitsPerInjection: document.querySelector("#unitsPerInjection"),
  unitsResultHelper: document.querySelector("#unitsResultHelper"),
  weeklyAverageLabel: document.querySelector("#weeklyAverageLabel"),
  weeklyMl: document.querySelector("#weeklyMl"),
  weeklyResultHelper: document.querySelector("#weeklyResultHelper"),
  weeklyBlendBreakdown: document.querySelector("#weeklyBlendBreakdown"),
  vialUsageCard: document.querySelector("#vialUsageCard"),
  vialIllustration: document.querySelector("#vialIllustration"),
  vialLiquid: document.querySelector("#vialLiquid"),
  vialLiquidSurface: document.querySelector("#vialLiquidSurface"),
  vialDays: document.querySelector("#vialDays"),
  vialDoses: document.querySelector("#vialDoses"),
  vialMeta: document.querySelector("#vialMeta"),
  scheduleCard: document.querySelector("#scheduleCard"),
  scheduleHeading: document.querySelector("#scheduleHeading"),
  scheduleFrequencyLabel: document.querySelector("#scheduleFrequencyLabel"),
  scheduleDays: document.querySelector("#scheduleDays"),
  copyStatus: document.querySelector("#copyStatus"),
  copyAction: document.querySelector(".copy-action"),
};

const buttons = {
  copy: document.querySelector("#copyResult"),
  reset: document.querySelector("#resetCalculator"),
  modes: document.querySelectorAll("[data-mode]"),
  inputMethods: document.querySelectorAll("[data-input-method]"),
  compoundModes: document.querySelectorAll("[data-compound-mode]"),
  languages: document.querySelectorAll("[data-language]"),
  frequencyTrigger: document.querySelector("#frequencyTrigger"),
  frequencyOptions: document.querySelectorAll("[data-frequency-value]"),
  scheduleDurations: document.querySelectorAll("[data-schedule-duration]"),
  addToCalendar: document.querySelector("#addToCalendar"),
  theme: document.querySelector("#themeToggle"),
  languageTrigger: document.querySelector("#languageTrigger"),
};

const panels = document.querySelectorAll("[data-panel]");
const i18nNodes = document.querySelectorAll("[data-i18n]");
const i18nAriaNodes = document.querySelectorAll("[data-i18n-aria]");
const optionNodes = document.querySelectorAll("[data-i18n-option]");
const frequencyMenu = document.querySelector("#frequencyMenu");
const frequencyValue = document.querySelector("#frequencyValue");
const titleNode = document.querySelector("#page-title");
const subtitleNode = document.querySelector("#subtitle");
const disclaimerNode = document.querySelector("#disclaimer");
const legalDialogs = {
  privacy: document.querySelector("#privacyDialog"),
  terms: document.querySelector("#termsDialog"),
};
const legalOpenButtons = document.querySelectorAll("[data-legal-open]");
const legalCloseButtons = document.querySelectorAll("[data-legal-close]");

const readNumber = (field) => {
  if (!field.value.trim()) return null;
  const value = Number(field.value);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, value);
};

const writeNumber = (field, value, digits = 4) => {
  if (!field || value === null || !Number.isFinite(value)) return;
  field.value = value
    .toFixed(digits)
    .replace(/\.?0+$/, "");
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

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;",
}[character]));

const getCompoundShortName = (name) => name
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0])
  .join("")
  .slice(0, 4)
  .toUpperCase() || name.slice(0, 4).toUpperCase();

const getBlendBreakdownText = (breakdown) => breakdown
  .map((compound) => `${compound.name} ${formatCompact(compound.doseMg, 2)} mg`)
  .join(" • ");

const getWeeklyBlendBreakdownText = (breakdown, injectionsPerWeek) => breakdown
  .map((compound) => `${compound.name} ${formatCompact(compound.doseMg * injectionsPerWeek, 2)} mg`)
  .join("\n");

const getBlendShortText = (breakdown) => breakdown
  .map((compound) => `${getCompoundShortName(compound.name)} ${formatCompact(compound.doseMg, 2)}`)
  .join(" / ");

const getFrequencySummaryText = (injectionsPerWeek, isEod = false) => {
  const strings = copy[activeLanguage];
  if (isEod) return strings.averageInjectionsWeekly;
  if (injectionsPerWeek !== null && Number.isFinite(injectionsPerWeek)) {
    return `${formatCompact(injectionsPerWeek, 1)} ${strings.injectionsWeekly}`;
  }
  return "";
};

const getFrequencySentencePart = (injectionsPerWeek, isEod = false) => {
  if (activeLanguage === "en") {
    if (isEod) return "every other day";
    if (selectedFrequency === "7") return "daily";
    if (selectedFrequency === "2") return "2x weekly";
    if (selectedFrequency === "3") return "3x weekly";
    if (selectedFrequency === "custom" && injectionsPerWeek !== null && Number.isFinite(injectionsPerWeek)) {
      return `${formatCompact(injectionsPerWeek, 1)}x weekly`;
    }
    return "";
  }

  if (isEod) return "през ден";
  if (selectedFrequency === "7") return "всеки ден";
  if (selectedFrequency === "2") return "2 пъти седмично";
  if (selectedFrequency === "3") return "3 пъти седмично";
  if (selectedFrequency === "custom" && injectionsPerWeek !== null && Number.isFinite(injectionsPerWeek)) {
    return `${formatCompact(injectionsPerWeek, 1)} пъти седмично`;
  }
  return "";
};

const getRoundedMlHelper = (ml) => {
  const strings = copy[activeLanguage];
  if (ml === null || !Number.isFinite(ml)) return "";
  const roundedMl = formatNumber(ml);
  const preciseMl = formatCompact(ml, 4);
  if (Number(roundedMl) !== Number(preciseMl)) {
    return `${strings.roundedFrom} ${preciseMl} mL`;
  }
  return strings.usedForSyringeScale;
};

const formatSchedulePopoverDate = (date) => new Intl.DateTimeFormat(activeLanguage === "en" ? "en-US" : "bg-BG", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(date);

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isSameDay = (first, second) => (
  first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate()
);

const formatScheduleDate = (date) => new Intl.DateTimeFormat(activeLanguage === "bg" ? "bg-BG" : "en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(date);

const formatScheduleMonth = (date) => new Intl.DateTimeFormat(activeLanguage === "bg" ? "bg-BG" : "en-US", {
  month: activeLanguage === "bg" ? "long" : "short",
}).format(date);

const formatScheduleWeekday = (date) => new Intl.DateTimeFormat(activeLanguage === "bg" ? "bg-BG" : "en-US", {
  weekday: "short",
}).format(date);

const getScheduleLabel = () => {
  const strings = copy[activeLanguage];
  if (selectedFrequency === "7") return strings.everyDay;
  if (selectedFrequency === eodFrequencyValue) return strings.everyOtherDay;
  if (selectedFrequency === "2") return strings.twiceWeekly;
  if (selectedFrequency === "3") return strings.threeWeekly;
  return strings.custom;
};

const getScheduleHeadingPrefix = () => {
  const strings = copy[activeLanguage];
  if (selectedFrequency === "7") return strings.dailyStarting;
  if (selectedFrequency === eodFrequencyValue) return strings.eodStarting;
  if (selectedFrequency === "2") return strings.twiceStarting;
  if (selectedFrequency === "3") return strings.threeStarting;
  return strings.customStarting;
};

const shouldScheduleInjection = (dayOffset, injectionsPerWeek) => {
  if (selectedFrequency === "7") return true;
  if (selectedFrequency === eodFrequencyValue) return dayOffset % 2 === 0;
  if (selectedFrequency === "2") return dayOffset % 7 === 0 || dayOffset % 7 === 3;
  if (selectedFrequency === "3") return dayOffset % 7 === 0 || dayOffset % 7 === 2 || dayOffset % 7 === 4;

  const roundedFrequency = Math.round(injectionsPerWeek);
  if (Math.abs(roundedFrequency - injectionsPerWeek) < 0.001 && roundedFrequency > 0 && roundedFrequency <= 7) {
    const days = new Set();
    for (let index = 0; index < roundedFrequency; index += 1) {
      days.add(Math.round(index * (7 / roundedFrequency)) % 7);
    }
    return days.has(dayOffset % 7);
  }

  const intervalDays = 7 / injectionsPerWeek;
  if (!Number.isFinite(intervalDays) || intervalDays <= 0) return false;
  if (intervalDays <= 1) return true;
  return Math.abs(Math.round(dayOffset / intervalDays) * intervalDays - dayOffset) < 0.001;
};

const getScheduleDurationDays = (result) => {
  if (selectedScheduleDuration === "vial") {
    return result.daysOfSupply && Number.isFinite(result.daysOfSupply)
      ? Math.max(1, Math.ceil(result.daysOfSupply))
      : 28;
  }

  return Number(selectedScheduleDuration) * 7;
};

const updateScheduleDurationButtons = () => {
  if (activeCompoundMode === "blend" && selectedScheduleDuration === "vial") {
    selectedScheduleDuration = "4";
  }

  buttons.scheduleDurations.forEach((button) => {
    const isActive = button.dataset.scheduleDuration === selectedScheduleDuration;
    button.hidden = activeCompoundMode === "blend" && button.dataset.scheduleDuration === "vial";
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const updateSchedule = (result) => {
  const strings = copy[activeLanguage];
  const showSchedule = activeCompoundMode === "blend"
    ? result.valid && result.mgPerInjection !== null
    : activeMode === "weekly" && result.valid && result.mgPerInjection !== null;
  output.scheduleCard.hidden = !showSchedule;
  lastScheduleEvents = [];

  if (!showSchedule) return;

  const startDate = getStartOfToday();
  const durationDays = getScheduleDurationDays(result);
  const today = getStartOfToday();
  const events = [];

  for (let offset = 0; offset < durationDays; offset += 1) {
    if (shouldScheduleInjection(offset, result.injectionsPerWeek)) {
      const date = addDays(startDate, offset);
      events.push({
        date,
        doseMg: result.mgPerInjection,
        doseMl: result.ml,
        units: result.units,
        dayOffset: offset,
        breakdown: result.breakdown || [],
        isBlend: Boolean(result.isBlend),
        isToday: isSameDay(date, today),
      });
    }
  }

  lastScheduleEvents = events;
  output.scheduleHeading.textContent = `${getScheduleHeadingPrefix()} ${formatScheduleDate(startDate)}`;
  output.scheduleFrequencyLabel.textContent = getScheduleLabel();
  const rows = [];
  for (let index = 0; index < events.length; index += 7) {
    rows.push(events.slice(index, index + 7));
  }
  const headerDays = rows[0] || [];

  output.scheduleDays.innerHTML = `
    <div class="schedule-weekday-row" aria-hidden="true">
      <span></span>
      ${headerDays.map((event) => `<span>${formatScheduleWeekday(event.date)}</span>`).join("")}
    </div>
    ${rows.map((row, rowIndex) => {
    const previousRow = rows[rowIndex - 1];
    const monthChanged = !previousRow || previousRow[0].date.getMonth() !== row[0].date.getMonth();

    return `
      <div class="schedule-week-row">
        <span class="schedule-month-label">${monthChanged ? formatScheduleMonth(row[0].date) : ""}</span>
        <div class="schedule-week-days">
          ${row.map((event) => {
    const doseLine = `${formatCompact(event.doseMg, 2)} mg · ${formatCompact(event.doseMl, 3)} mL · ${formatCompact(event.units, 1)} ${strings.units}`;
    const blendFullLine = `${getBlendBreakdownText(event.breakdown)} · ${strings.total} ${formatCompact(event.doseMg, 2)} mg`;
    const popoverSummary = event.isBlend
      ? `${blendFullLine} · ${formatCompact(event.doseMl, 3)} mL · ${formatCompact(event.units, 1)} ${strings.units}`
      : doseLine;

    return `
            <div class="schedule-day${event.isToday ? " is-today" : ""}${event.isBlend ? " is-blend" : ""}" data-day-offset="${event.dayOffset}" data-marked="true" data-state="closed" data-slot="tooltip-trigger" tabindex="0" aria-label="${escapeHtml(`${formatSchedulePopoverDate(event.date)} - ${popoverSummary}`)}">
      <span class="schedule-day-weekday">${event.isToday ? strings.today : formatScheduleWeekday(event.date)}</span>
      ${event.isToday ? `<span class="schedule-day-check" aria-hidden="true">
        <svg viewBox="0 0 12 12" focusable="false">
          <path d="M2.5 6.2 5 8.6 9.5 3.4"></path>
        </svg>
      </span>` : ""}
      <strong>${event.date.getDate()}</strong>
      ${event.isBlend
    ? `<div class="schedule-blend-compact">
          <span>${escapeHtml(`${formatCompact(event.doseMg, 2)} mg`)}</span>
        </div>`
    : `<span class="schedule-dose-line">${formatCompact(event.doseMg, 2)} mg</span>`}
      <div class="schedule-day-popover" aria-hidden="true">
        <b>${escapeHtml(formatSchedulePopoverDate(event.date))}</b>
        <span>${escapeHtml(popoverSummary)}</span>
      </div>
    </div>
  `;
  }).join("")}
        </div>
      </div>
    `;
  }).join("")}
  `;
};

const formatIcsDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const downloadScheduleIcs = () => {
  if (!lastScheduleEvents.length) return;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TRT Calculator//Injection Schedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  lastScheduleEvents.forEach((event, index) => {
    const start = formatIcsDate(event.date);
    const end = formatIcsDate(addDays(event.date, 1));
    const uid = `${start}-${index}@trt-calculator.local`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(getStartOfToday())}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:TRT injection ${formatCompact(event.doseMg, 2)} mg`,
      event.isBlend ? `DESCRIPTION:${event.breakdown.map((compound) => `${compound.name} ${formatCompact(compound.doseMg, 2)} mg`).join("\\n")}` : "",
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trt-injection-schedule.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const clearCopyFeedback = () => {
  window.clearTimeout(copyFeedbackTimer);
  buttons.copy?.classList.remove("is-copied");
  output.copyAction?.classList.remove("is-visible");
  if (output.copyStatus) output.copyStatus.textContent = "";
};

const showCopyFeedback = (message, isSuccess = false) => {
  window.clearTimeout(copyFeedbackTimer);
  if (!buttons.copy || !output.copyAction || !output.copyStatus) return;
  output.copyStatus.textContent = message;
  output.copyAction.classList.add("is-visible");
  buttons.copy.classList.toggle("is-copied", isSuccess);
  copyFeedbackTimer = window.setTimeout(clearCopyFeedback, isSuccess ? 1700 : 2600);
};

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Some embedded browsers deny clipboard permissions even on localhost.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "-9999px";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    textArea.remove();
  }

  return copied;
};

const updateSyringe = ({ ml, units, valid, isEod = false, injectionsPerWeek = null, mode = "weekly" }) => {
  const strings = copy[activeLanguage];
  const fillWidth = valid ? Math.min(units, 100) * 4.8 : 0;
  const fillX = 588 - fillWidth;
  const stopperX = 584 - fillWidth;
  const syringeLabel = `${formatNumber(ml)} mL / ${formatCompact(units)} ${strings.units}`;
  const frequencyText = mode === "single" ? "" : getFrequencySummaryText(injectionsPerWeek, isEod);
  const frequencyPhrase = mode === "single" ? "" : getFrequencySentencePart(injectionsPerWeek, isEod);
  const summaryMl = `<strong>${formatNumber(ml)} mL</strong>`;
  const summaryUnits = `<strong>${formatCompact(units)} ${strings.units}</strong>`;

  output.syringeUnits.textContent = syringeLabel;
  output.syringeSummary.innerHTML = valid
    ? activeLanguage === "en"
      ? `Inject ~${summaryMl}${frequencyPhrase ? ` ${frequencyPhrase}` : ""} (${summaryUnits} on a U-100 syringe).`
      : `Инжектирайте ~${summaryMl}${frequencyPhrase ? ` ${frequencyPhrase}` : ""} (${summaryUnits} на U-100 спринцовка).`
    : activeLanguage === "en"
      ? "Enter values to preview syringe volume."
      : "Попълни стойности за преглед на обема.";
  output.syringeFrequencySummary.textContent = valid ? frequencyText : "";
  output.syringeFrequencySummary.hidden = !valid || !frequencyText;
  output.syringeFill.setAttribute("x", String(fillX));
  output.syringeFill.setAttribute("width", String(fillWidth));
  output.syringeStopper.setAttribute("x", String(stopperX));
  output.syringeSvg.setAttribute("aria-label", valid ? `${strings.syringe}: ${syringeLabel}` : strings.syringeEmpty);
  output.eodSyringeNote.hidden = !(valid && isEod);
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
  const inputInjectionMl = readNumber(fields.weeklyDose);
  const targetWeeklyDose = readNumber(fields.targetWeeklyDose);
  const concentration = readNumber(fields.weeklyConcentration);
  const injectionsPerWeek = selectedFrequency === "custom"
    ? readNumber(fields.customInjections)
    : Number(selectedFrequency);
  const valid = activeInputMethod === "weekly"
    ? targetWeeklyDose !== null && targetWeeklyDose > 0 && concentration !== null && concentration > 0 && injectionsPerWeek !== null && injectionsPerWeek > 0
    : inputInjectionMl !== null && inputInjectionMl > 0 && concentration !== null && concentration > 0 && injectionsPerWeek !== null && injectionsPerWeek > 0;

  const mgPerInjection = valid
    ? activeInputMethod === "weekly"
      ? targetWeeklyDose / injectionsPerWeek
      : concentration * inputInjectionMl
    : null;
  const ml = valid ? mgPerInjection / concentration : null;
  const units = valid ? ml * 100 : null;
  const weeklyMg = valid ? mgPerInjection * injectionsPerWeek : null;
  const weeklyMl = valid ? ml * injectionsPerWeek : null;
  const isEod = selectedFrequency === eodFrequencyValue;
  const eodWeekA = valid && isEod ? mgPerInjection * 4 : null;
  const eodWeekB = valid && isEod ? mgPerInjection * 3 : null;
  const intervalDays = valid ? 7 / injectionsPerWeek : null;
  const dosesPerVial = valid && ml > 0 ? Math.floor(defaults.vialVolumeMl / ml) : null;
  const daysOfSupply = valid && dosesPerVial !== null ? dosesPerVial * intervalDays : null;
  const leftoverMl = valid && dosesPerVial !== null ? defaults.vialVolumeMl - dosesPerVial * ml : null;
  const vialValid = valid && dosesPerVial !== null && daysOfSupply !== null && leftoverMl !== null;

  if (activeCompoundMode === "single") {
    output.customInjectionsField.hidden = selectedFrequency !== "custom";
    output.primaryResultLabel.textContent = strings.mgPerInjection;
    output.weeklyAverageLabel.textContent = strings.averageMgWeekly;
    output.blendBreakdown.hidden = true;
    output.weeklyBlendBreakdown.hidden = true;
    output.eodDoseHelper.hidden = !(valid && isEod);
    output.eodDoseHelper.textContent = activeLanguage === "en"
      ? `4 injections • ${formatCompact(eodWeekA, 1)} mg / 3 injections • ${formatCompact(eodWeekB, 1)} mg`
      : `4 инжекции • ${formatCompact(eodWeekA, 1)} mg / 3 инжекции • ${formatCompact(eodWeekB, 1)} mg`;
    output.mgPerInjection.textContent = `${formatCompact(mgPerInjection, 2)} mg`;
    output.mgResultHelper.textContent = valid ? getFrequencySummaryText(injectionsPerWeek, isEod) : "";
    output.mlPerInjection.textContent = `${formatNumber(ml)} mL`;
    output.mlResultHelper.textContent = valid ? getRoundedMlHelper(ml) : "";
    output.unitsPerInjection.textContent = `${formatCompact(units)} ${copy[activeLanguage].units}`;
    output.unitsResultHelper.textContent = valid ? strings.unitRule : "";
    output.weeklyMl.textContent = `${formatCompact(weeklyMg, 2)} mg`;
    output.weeklyResultHelper.textContent = valid && !isEod ? strings.basedOnFrequency : "";
  }

  output.vialDays.textContent = vialValid ? `~${Math.round(daysOfSupply)} ${strings.vialDays} / ${dosesPerVial} ${strings.vialDoseUnit}` : `~-- ${strings.vialDays}`;
  output.vialDoses.textContent = vialValid ? `${formatCompact(defaults.vialVolumeMl, 2)} mL ${strings.vialWord} · ${formatCompact(concentration, 2)} mg/mL` : `${formatCompact(defaults.vialVolumeMl, 2)} mL ${strings.vialWord} · -- mg/mL`;
  output.vialMeta.textContent = vialValid
    ? `${formatCompact(concentration, 2)} mg/mL · ${formatCompact(defaults.vialVolumeMl, 2)} mL · ${leftoverMl > 0.01 ? `${formatNumber(leftoverMl)} mL ${strings.vialLeftover}` : `0 mL ${strings.vialLeftover}`}`
    : `-- mg/mL · ${formatCompact(defaults.vialVolumeMl, 2)} mL · -- mL ${strings.vialLeftover}`;
  output.vialLiquid.setAttribute("height", "80");
  output.vialLiquid.setAttribute("y", "38");
  output.vialIllustration.setAttribute("aria-label", vialValid ? `Vial: ${dosesPerVial} doses, ${formatNumber(leftoverMl)} mL leftover.` : "Vial usage unavailable.");

  return { mode: "weekly", inputMethod: activeInputMethod, targetWeeklyDose, injectionMl: ml, concentration, injectionsPerWeek, mgPerInjection, ml, units, weeklyMg, weeklyMl, isEod, valid, dosesPerVial, daysOfSupply, leftoverMl };
};

const getBlendCompounds = (injectionMl) => fields.compoundConcentrations.map((field, index) => {
  const concentration = readNumber(field);
  const fallbackName = `${copy[activeLanguage].compoundBlend} ${index + 1}`;
  const name = fields.compoundNames[index].value.trim() || fallbackName;
  return {
    name,
    concentration,
    doseMg: concentration !== null && injectionMl !== null ? concentration * injectionMl : null,
  };
}).filter((compound) => compound.concentration !== null && compound.concentration > 0);

const calculateBlend = () => {
  const strings = copy[activeLanguage];
  const inputInjectionMl = readNumber(fields.blendInjectionMl);
  const targetWeeklyDose = readNumber(fields.blendTargetWeeklyDose);
  const injectionsPerWeek = selectedFrequency === "custom"
    ? readNumber(fields.customInjections)
    : Number(selectedFrequency);
  const concentrationCompounds = getBlendCompounds(0);
  const totalConcentration = concentrationCompounds.reduce((sum, compound) => sum + compound.concentration, 0);
  const injectionMl = activeInputMethod === "weekly" && targetWeeklyDose !== null && injectionsPerWeek !== null && totalConcentration > 0
    ? targetWeeklyDose / injectionsPerWeek / totalConcentration
    : inputInjectionMl;
  const compounds = getBlendCompounds(injectionMl);
  const valid = activeInputMethod === "weekly"
    ? targetWeeklyDose !== null && targetWeeklyDose > 0 && injectionsPerWeek !== null && injectionsPerWeek > 0 && totalConcentration > 0 && compounds.length > 0
    : injectionMl !== null && injectionMl > 0 && injectionsPerWeek !== null && injectionsPerWeek > 0 && compounds.length > 0;
  const totalMg = valid ? compounds.reduce((sum, compound) => sum + compound.doseMg, 0) : null;
  const units = valid ? injectionMl * 100 : null;
  const weeklyMg = valid ? totalMg * injectionsPerWeek : null;
  const isEod = selectedFrequency === eodFrequencyValue;
  const eodWeekA = valid && isEod ? totalMg * 4 : null;
  const eodWeekB = valid && isEod ? totalMg * 3 : null;
  const intervalDays = valid ? 7 / injectionsPerWeek : null;
  const dosesPerVial = valid ? Math.floor(defaults.vialVolumeMl / injectionMl) : null;
  const daysOfSupply = valid && dosesPerVial !== null ? dosesPerVial * intervalDays : null;
  const leftoverMl = valid && dosesPerVial !== null ? defaults.vialVolumeMl - dosesPerVial * injectionMl : null;

  if (activeCompoundMode === "blend") {
    output.customInjectionsField.hidden = selectedFrequency !== "custom";
    output.primaryResultLabel.textContent = strings.totalAmount;
    output.weeklyAverageLabel.textContent = strings.averageMgWeekly;
    output.mgPerInjection.textContent = `${formatCompact(totalMg, 2)} mg`;
    output.blendBreakdown.hidden = !valid;
    output.blendBreakdown.title = valid ? getBlendBreakdownText(compounds) : "";
    output.blendBreakdown.innerHTML = valid ? `<span>${escapeHtml(getBlendBreakdownText(compounds))}</span>` : "";
    output.weeklyBlendBreakdown.hidden = !valid;
    output.weeklyBlendBreakdown.title = valid ? getWeeklyBlendBreakdownText(compounds, injectionsPerWeek).replace(/\n/g, " • ") : "";
    output.weeklyBlendBreakdown.innerHTML = valid
      ? getWeeklyBlendBreakdownText(compounds, injectionsPerWeek)
        .split("\n")
        .map((line) => `<span>${escapeHtml(line)}</span>`)
        .join("\n")
      : "";
    output.eodDoseHelper.hidden = !(valid && isEod);
    output.eodDoseHelper.textContent = activeLanguage === "en"
      ? `4 injections • ${formatCompact(eodWeekA, 1)} mg / 3 injections • ${formatCompact(eodWeekB, 1)} mg`
      : `4 инжекции • ${formatCompact(eodWeekA, 1)} mg / 3 инжекции • ${formatCompact(eodWeekB, 1)} mg`;
    output.mlPerInjection.textContent = `${formatNumber(injectionMl)} mL`;
    output.mgResultHelper.textContent = "";
    output.mlResultHelper.textContent = valid ? getRoundedMlHelper(injectionMl) : "";
    output.unitsPerInjection.textContent = `${formatCompact(units)} ${strings.units}`;
    output.unitsResultHelper.textContent = valid ? strings.unitRule : "";
    output.weeklyMl.textContent = `${formatCompact(weeklyMg, 2)} mg`;
    output.weeklyResultHelper.textContent = valid && !isEod ? strings.basedOnFrequency : "";
  }

  return {
    mode: "blend",
    inputMethod: activeInputMethod,
    isBlend: true,
    valid,
    injectionsPerWeek,
    targetWeeklyDose,
    mgPerInjection: totalMg,
    totalMg,
    ml: injectionMl,
    units,
    weeklyMg,
    isEod,
    breakdown: compounds,
    dosesPerVial,
    daysOfSupply,
    leftoverMl,
  };
};

const updateVialUsage = (result) => {
  const strings = copy[activeLanguage];
  const ml = result?.ml;
  const injectionsPerWeek = result?.injectionsPerWeek;
  const valid = Boolean(result?.valid && ml !== null && Number.isFinite(ml) && ml > 0 && injectionsPerWeek !== null && Number.isFinite(injectionsPerWeek) && injectionsPerWeek > 0);
  const intervalDays = valid ? 7 / injectionsPerWeek : null;
  const weeklyMl = valid ? ml * injectionsPerWeek : null;
  const dosesPerVial = valid ? Math.floor(defaults.vialVolumeMl / ml) : null;
  const daysOfSupply = valid && dosesPerVial !== null ? dosesPerVial * intervalDays : null;
  const leftoverMl = valid && dosesPerVial !== null ? defaults.vialVolumeMl - dosesPerVial * ml : null;
  const usableVialMl = valid ? Math.max(0, defaults.vialVolumeMl - leftoverMl) : 0;
  const liquidHeight = valid ? Math.min(80, (usableVialMl / defaults.vialVolumeMl) * 80) : 0;
  const liquidY = 118 - liquidHeight;

  output.vialUsageCard.hidden = !valid;
  if (!valid) return;

  const leftoverText = leftoverMl > 0.01 ? formatNumber(leftoverMl) : "0";
  const totalConcentration = result?.breakdown?.length
    ? result.breakdown.reduce((sum, compound) => sum + compound.concentration, 0)
    : result?.concentration;
  const vialMeta = Number.isFinite(totalConcentration)
    ? `${formatCompact(totalConcentration, 2)} mg/mL · ${formatCompact(defaults.vialVolumeMl, 2)} mL`
    : `${formatCompact(defaults.vialVolumeMl, 2)} mL ${strings.vialWord}`;

  output.vialDays.textContent = activeLanguage === "en"
    ? `~${Math.round(daysOfSupply)} days of supply in ${dosesPerVial} doses, with ${leftoverText} mL leftover`
    : `~${Math.round(daysOfSupply)} дни запас в ${dosesPerVial} инжекции, с ${leftoverText} mL остатък`;
  output.vialDoses.textContent = `${formatNumber(ml)} mL ${activeLanguage === "en" ? "per injection" : "на инжекция"} · ${formatCompact(weeklyMl, 2)} mL/${activeLanguage === "en" ? "week" : "седмица"}`;
  output.vialMeta.textContent = vialMeta;
  output.vialLiquid.setAttribute("height", String(liquidHeight));
  output.vialLiquid.setAttribute("y", String(liquidY));
  output.vialLiquidSurface.setAttribute("y1", String(liquidY));
  output.vialLiquidSurface.setAttribute("y2", String(liquidY));
  output.vialLiquidSurface.style.opacity = usableVialMl > 0.01 ? "1" : "0";
  output.vialIllustration.setAttribute("aria-label", `Vial: ${dosesPerVial} doses, ${formatNumber(leftoverMl)} mL leftover.`);
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

const languageMenu = document.querySelector("#languageMenu");
const languageValue = document.querySelector("#languageValue");

const closeLanguageMenu = () => {
  if (!languageMenu) {
    return;
  }
  languageMenu.hidden = true;
  buttons.languageTrigger?.classList.remove("is-open");
  buttons.languageTrigger?.setAttribute("aria-expanded", "false");
};

const openLanguageMenu = () => {
  if (!languageMenu) {
    return;
  }
  languageMenu.hidden = false;
  buttons.languageTrigger?.classList.add("is-open");
  buttons.languageTrigger?.setAttribute("aria-expanded", "true");
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
  clearCopyFeedback();
  calculate();
};

const calculate = () => {
  const single = calculateSingle();
  const weekly = calculateWeekly();
  const blend = calculateBlend();
  const activeResult = activeCompoundMode === "blend" ? blend : weekly;
  updateSyringe(activeResult);
  updateVialUsage(activeResult);
  updateSchedule(activeResult);
  return activeResult;
};

const updateHeroCopy = () => {
  const strings = copy[activeLanguage];
  titleNode.textContent = strings.title;
  subtitleNode.textContent = activeCompoundMode === "blend"
    ? strings.blendSubtitle
    : strings.subtitle;
};

const setMode = (mode) => {
  const isBlend = mode === "blend";
  activeCompoundMode = isBlend ? "blend" : "single";
  activeMode = "weekly";

  buttons.modes.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === activeMode;
    panel.classList.toggle("is-active", isActive);
    panel.classList.toggle("is-hidden", !isActive);
    panel.hidden = !isActive;
    panel.setAttribute("aria-hidden", String(!isActive));
  });
  output.targetWeeklyDoseField.hidden = isBlend || activeInputMethod !== "weekly";
  output.weeklyDoseField.hidden = isBlend || activeInputMethod !== "ml";
  output.weeklyConcentrationField.hidden = isBlend;
  output.blendFields.hidden = !isBlend;
  output.blendTargetWeeklyDoseField.hidden = !isBlend || activeInputMethod !== "weekly";
  output.blendInjectionMlField.hidden = !isBlend || activeInputMethod !== "ml";
  updateScheduleDurationButtons();
  clearCopyFeedback();
  updateHeroCopy();
  calculate();
};

const setCompoundMode = (mode) => {
  setMode(mode === "blend" ? "blend" : "single");
};

const getSelectedInjectionsPerWeek = () => selectedFrequency === "custom"
  ? readNumber(fields.customInjections)
  : Number(selectedFrequency);

const getBlendTotalConcentration = () => fields.compoundConcentrations.reduce((sum, field) => {
  const concentration = readNumber(field);
  return concentration !== null && concentration > 0 ? sum + concentration : sum;
}, 0);

const syncInputMethodValue = (nextMethod) => {
  if (nextMethod === activeInputMethod) return;

  const injectionsPerWeek = getSelectedInjectionsPerWeek();
  if (injectionsPerWeek === null || !Number.isFinite(injectionsPerWeek) || injectionsPerWeek <= 0) return;

  if (activeCompoundMode === "blend") {
    const totalConcentration = getBlendTotalConcentration();
    if (totalConcentration <= 0) return;

    if (nextMethod === "ml") {
      const targetWeeklyDose = readNumber(fields.blendTargetWeeklyDose);
      if (targetWeeklyDose !== null && targetWeeklyDose > 0) {
        writeNumber(fields.blendInjectionMl, targetWeeklyDose / injectionsPerWeek / totalConcentration);
      }
      return;
    }

    const injectionMl = readNumber(fields.blendInjectionMl);
    if (injectionMl !== null && injectionMl > 0) {
      writeNumber(fields.blendTargetWeeklyDose, injectionMl * totalConcentration * injectionsPerWeek, 2);
    }
    return;
  }

  const concentration = readNumber(fields.weeklyConcentration);
  if (concentration === null || concentration <= 0) return;

  if (nextMethod === "ml") {
    const targetWeeklyDose = readNumber(fields.targetWeeklyDose);
    if (targetWeeklyDose !== null && targetWeeklyDose > 0) {
      writeNumber(fields.weeklyDose, targetWeeklyDose / injectionsPerWeek / concentration);
    }
    return;
  }

  const injectionMl = readNumber(fields.weeklyDose);
  if (injectionMl !== null && injectionMl > 0) {
    writeNumber(fields.targetWeeklyDose, injectionMl * concentration * injectionsPerWeek, 2);
  }
};

const setInputMethod = (method) => {
  const nextMethod = method === "weekly" ? "weekly" : "ml";
  activeInputMethod = nextMethod;

  buttons.inputMethods.forEach((button) => {
    const isActive = button.dataset.inputMethod === activeInputMethod;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const isBlend = activeCompoundMode === "blend";
  output.targetWeeklyDoseField.hidden = isBlend || activeInputMethod !== "weekly";
  output.weeklyDoseField.hidden = isBlend || activeInputMethod !== "ml";
  output.blendTargetWeeklyDoseField.hidden = !isBlend || activeInputMethod !== "weekly";
  output.blendInjectionMlField.hidden = !isBlend || activeInputMethod !== "ml";
  clearCopyFeedback();
  calculate();
};

const setLanguage = (language) => {
  activeLanguage = language;
  const strings = copy[language];

  document.documentElement.lang = language;
  document.title = strings.documentTitle;
  updateHeroCopy();
  disclaimerNode.textContent = strings.disclaimer;

  i18nNodes.forEach((node) => {
    node.textContent = strings[node.dataset.i18n];
  });
  i18nAriaNodes.forEach((node) => {
    node.setAttribute("aria-label", strings[node.dataset.i18nAria]);
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
    const labelKey = button.dataset.mode === "blend"
        ? "compoundBlend"
        : "compoundSingle";
    const fullLabel = button.querySelector(".label-full");
    const shortLabel = button.querySelector(".label-short");
    const label = strings[labelKey];
    if (fullLabel) {
      fullLabel.textContent = label;
    } else {
      button.textContent = label;
    }
    if (shortLabel) {
      shortLabel.textContent = button.dataset.mode === "blend"
          ? strings.compoundBlend
          : strings.compoundSingle;
    }
  });
  buttons.languages.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-selected", String(isActive));
  });
  if (languageValue) {
    languageValue.textContent = language.toUpperCase();
  }

  clearCopyFeedback();
  closeLanguageMenu();
  updateThemeButton();
  calculate();
};

const updateThemeButton = () => {
  if (!buttons.theme) return;

  const isLight = activeTheme === "light";
  buttons.theme.classList.toggle("is-active", isLight);
  buttons.theme.setAttribute("aria-pressed", String(isLight));
  buttons.theme.setAttribute("aria-label", copy[activeLanguage][isLight ? "darkTheme" : "lightTheme"]);
};

const setTheme = (theme) => {
  activeTheme = theme === "light" ? "light" : "dark";
  document.body.classList.toggle("theme-light", activeTheme === "light");
  document.body.classList.toggle("theme-dark", activeTheme !== "light");
  try {
    window.localStorage.setItem("trt-calculator-theme", activeTheme);
  } catch {
    // Local storage can be unavailable in some embedded browsers.
  }
  updateThemeButton();
};

const sanitizeInput = (event) => {
  const field = event.target;
  if (field.value && Number(field.value) < 0) {
    field.value = "0";
  }
  clearCopyFeedback();
  calculate();
};

const copyResult = async () => {
  const result = calculate();
  if (!result.valid) {
    showCopyFeedback(copy[activeLanguage].incomplete);
    return;
  }

  if (result.mode === "blend") {
    const strings = copy[activeLanguage];
    const lines = [
      `${strings.blendCopiedTitle}:`,
      ...result.breakdown.map((compound) => `${compound.name} ${formatCompact(compound.doseMg, 2)} mg`),
      "",
      `${strings.total} ${formatCompact(result.totalMg, 2)} mg`,
      `mL ${formatNumber(result.ml)}`,
      `U-100 ${formatCompact(result.units)} ${strings.units}`,
    ];
    const copied = await copyTextToClipboard(lines.join("\n"));
    showCopyFeedback(copied ? strings.copied : strings.copyFailed, copied);
    return;
  }

  const text = activeLanguage === "en"
    ? (result.mode === "weekly"
      ? `TRT calculation: ${formatNumber(result.ml)} mL per injection at ${formatCompact(result.concentration, 2)} mg/mL, ${formatCompact(result.injectionsPerWeek, 2)} injections/week = ${formatCompact(result.mgPerInjection, 2)} mg per injection / ${formatCompact(result.weeklyMg, 2)} mg weekly / ${formatCompact(result.units)} U-100 units.`
      : `TRT calculation: ${formatCompact(result.dose, 2)} mg at ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 units.`)
    : (result.mode === "weekly"
      ? `TRT изчисление: ${formatNumber(result.ml)} mL на инжекция при ${formatCompact(result.concentration, 2)} mg/mL, ${formatCompact(result.injectionsPerWeek, 2)} инжекции седмично = ${formatCompact(result.mgPerInjection, 2)} mg на инжекция / ${formatCompact(result.weeklyMg, 2)} mg седмично / ${formatCompact(result.units)} U-100 единици.`
      : `TRT изчисление: ${formatCompact(result.dose, 2)} mg при ${formatCompact(result.concentration, 2)} mg/mL = ${formatNumber(result.ml)} mL / ${formatCompact(result.units)} U-100 единици.`);

  const copied = await copyTextToClipboard(text);
  if (copied) {
    showCopyFeedback(copy[activeLanguage].copied, true);
  } else {
    showCopyFeedback(copy[activeLanguage].copyFailed);
  }
};

const resetCalculator = () => {
  fields.doseMg.value = defaults.doseMg;
  fields.concentration.value = defaults.concentration;
  fields.weeklyDose.value = defaults.weeklyDose;
  fields.targetWeeklyDose.value = defaults.targetWeeklyDose;
  fields.weeklyConcentration.value = defaults.weeklyConcentration;
  fields.customInjections.value = defaults.customInjections;
  fields.blendInjectionMl.value = defaults.blendInjectionMl;
  fields.blendTargetWeeklyDose.value = defaults.blendTargetWeeklyDose;
  fields.compoundNames.forEach((field, index) => {
    field.value = defaults.compounds[index].name;
  });
  fields.compoundConcentrations.forEach((field, index) => {
    field.value = defaults.compounds[index].concentration;
  });
  clearCopyFeedback();
  setInputMethod(defaults.inputMethod);
  setCompoundMode("single");
  setFrequency(defaults.frequency);
  setMode(defaults.mode);
};

[
  fields.doseMg,
  fields.concentration,
  fields.weeklyDose,
  fields.targetWeeklyDose,
  fields.weeklyConcentration,
  fields.customInjections,
  fields.blendInjectionMl,
  fields.blendTargetWeeklyDose,
  ...fields.compoundNames,
  ...fields.compoundConcentrations,
].forEach((field) => {
  field.addEventListener("input", sanitizeInput);
  field.addEventListener("change", sanitizeInput);
});

buttons.modes.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

buttons.inputMethods.forEach((button) => {
  button.addEventListener("click", () => setInputMethod(button.dataset.inputMethod));
});

buttons.compoundModes.forEach((button) => {
  button.addEventListener("click", () => setCompoundMode(button.dataset.compoundMode));
});

buttons.theme?.addEventListener("click", () => {
  setTheme(activeTheme === "light" ? "dark" : "light");
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

buttons.scheduleDurations.forEach((button) => {
  button.addEventListener("click", () => {
    selectedScheduleDuration = button.dataset.scheduleDuration;
    updateScheduleDurationButtons();
    clearCopyFeedback();
    calculate();
  });
});

buttons.addToCalendar.addEventListener("click", downloadScheduleIcs);

legalOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = legalDialogs[button.dataset.legalOpen];
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

legalCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("dialog")?.close();
  });
});

Object.values(legalDialogs).forEach((dialog) => {
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
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

buttons.copy?.addEventListener("click", copyResult);
buttons.reset?.addEventListener("click", resetCalculator);

try {
  activeTheme = window.localStorage.getItem("trt-calculator-theme") || defaults.theme;
} catch {
  activeTheme = defaults.theme;
}

setLanguage(detectPreferredLanguage());
setTheme(activeTheme);
resetCalculator();
