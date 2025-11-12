// src/StepFlow.js
import React, { useState } from 'react';
import Step1Intro from './Step1Intro';
import Step2Profile from './Step2Profile';
import Step3Expenses from './Step3Expenses';
import Step4Goals from './Step4Goals';
import Step5Summary from './Step5Summary';
import Step6Budget from './Step6Budget';

function StepFlow() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({});

  return (
    <>
      {step === 1 && (
        <Step1Intro
          profile={profile}
          setProfile={setProfile}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Profile
          profile={profile}
          setProfile={setProfile}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3Expenses
          profile={profile}
          setProfile={setProfile}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Goals
          profile={profile}
          setProfile={setProfile}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <Step5Summary
          profile={profile}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
        />
      )}
      {step === 6 && (
        <Step6Budget
          profile={profile}
          setProfile={setProfile}
          onBack={() => setStep(5)}
          onNext={() => alert('🎉 Ferdig! Budsjettet er klart.')}
        />
      )}
    </>
  );
}

export default StepFlow;
