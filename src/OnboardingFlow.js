// src/OnboardingFlow.js
import React, { useState, useEffect, useRef } from 'react';
import Step1Economy from './Step1Economy';
import Step3Expenses from './Step3Expenses';
import Step4Goals from './Step4Goals';
import Step6Budget from './Step6Budget';
import BudgetDashboard from './BudgetDashboard';
import layout from './OnboardingFlow.module.css';
import avatarImage from './assets/ai-mairim.png';
import { clearState, loadState, saveState } from './utils/storage';
import { applyDuePeriodRollovers } from './utils/periodEngine';

const DASHBOARD_STEP = 5;

export function hasRequiredProfileData(profile) {
  if (!profile || typeof profile !== 'object') return false;
  // Saldo kan midlertidig være tom mens brukeren redigerer — 0 og '' er OK
  const hasAdults = profile.adults === 0 || !!profile.adults;
  return !!profile.nextPayoutDate && hasAdults;
}

export function isSetupComplete(profile) {
  if (!profile) return false;
  // Fullført oppsett skal ikke miste dashboard fordi saldo midlertidig er tom
  if (profile.onboardingComplete) return true;
  if (profile.budgetPlan && hasRequiredProfileData(profile)) return true;
  return false;
}

function migrateProfile(profile) {
  if (!profile || typeof profile !== 'object') return {};
  const next = { ...profile };
  if (!next.onboardingComplete && next.budgetPlan && hasRequiredProfileData(next)) {
    next.onboardingComplete = true;
  }
  return next;
}

function migrateStep(rawStep, profile) {
  if (isSetupComplete(profile)) return DASHBOARD_STEP;

  // Bare kast til start hvis oppsett aldri er fullført
  if (rawStep === DASHBOARD_STEP && !profile?.onboardingComplete && !profile?.budgetPlan) {
    return 0;
  }

  const legacyMap = {
    0: 0,
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 4,
    7: 5,
  };

  if (Object.prototype.hasOwnProperty.call(legacyMap, rawStep)) {
    return legacyMap[rawStep];
  }

  return Math.min(Math.max(rawStep ?? 0, 0), DASHBOARD_STEP);
}

function getInitialState() {
  const saved = loadState();
  if (!saved) return { step: 0, profile: {} };

  let profile = migrateProfile(saved.profile || {});
  if (isSetupComplete(profile)) {
    profile = applyDuePeriodRollovers(profile);
  }
  return {
    step: migrateStep(saved.step, profile),
    profile,
  };
}

function OnboardingFlow() {
  const [step, setStep] = useState(() => getInitialState().step);
  const [profile, setProfile] = useState(() => getInitialState().profile);
  const periodChecked = useRef(false);

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => Math.max(0, prev - 1));

  useEffect(() => {
    saveState({ profile, step });
  }, [profile, step]);

  // Ekstra sjekk ved mount (f.eks. hvis state allerede var i minnet)
  useEffect(() => {
    if (periodChecked.current) return;
    periodChecked.current = true;
    if (!isSetupComplete(profile)) return;
    setProfile((prev) => applyDuePeriodRollovers(prev));
    // Kun ved første mount
  }, []);

  // Hold brukeren på dashboard når oppsett er fullført (også etter endringer)
  useEffect(() => {
    if (isSetupComplete(profile) && step !== DASHBOARD_STEP) {
      setStep(DASHBOARD_STEP);
    }
    // Ikke kast til start ved midlertidig tom saldo — kun uten fullført oppsett
    if (
      step === DASHBOARD_STEP &&
      !profile?.onboardingComplete &&
      !profile?.budgetPlan
    ) {
      setStep(0);
    }
  }, [profile, step]);

  const handleReset = () => {
    clearState();
    setProfile({});
    setStep(0);
  };

  const totalSteps = 4;
  const wizardStep = step >= 1 && step <= 4 ? step : null;

  return (
    <div className={layout.container}>
      {wizardStep && (
        <p className={layout.stepProgress}>
          Steg {wizardStep} av {totalSteps}
        </p>
      )}

      {step === 0 && (
        <div className={layout.welcome}>
          <div className={layout.welcomeContent}>
            <div className={layout.avatarWrapper}>
              <img src={avatarImage} alt="Mairim" className={layout.avatarLarge} />
            </div>
            <h1>Hei! Jeg er Mairim</h1>
            <p className={layout.welcomeLead}>
              Sett opp budsjettet ditt på noen få steg.
            </p>
            <p className={layout.privacyNote}>
              Personvern: Opplysningene dine (saldo, inntekt, utgifter m.m.) lagres bare lokalt i
              denne nettleseren. Ingenting sendes til en sky-tjeneste i vanlig bruk. Du kan slette
              alt med «Start oppsett på nytt» på oversikten.
            </p>
            <button type="button" onClick={next} className={layout.startButton}>
              Kom i gang
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <Step1Economy profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 2 && (
        <Step3Expenses profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 3 && (
        <Step4Goals profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 4 && (
        <Step6Budget profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 5 && (
        <BudgetDashboard profile={profile} setProfile={setProfile} onReset={handleReset} />
      )}
    </div>
  );
}

export default OnboardingFlow;
