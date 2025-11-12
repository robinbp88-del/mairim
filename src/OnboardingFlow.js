// src/OnboardingFlow.js
import React, { useState, useEffect } from 'react';
import Step1Household from './Step1Household';
import Step2Income from './Step2Income';
import Step3Expenses from './Step3Expenses';
import Step4Goals from './Step4Goals';
import Step5Summary from './Step5Summary';
import Step6Budget from './Step6Budget';
import BudgetDashboard from './BudgetDashboard';
import layout from './OnboardingFlow.module.css';
import avatarImage from './assets/ai-mairim.png';

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({});

  const next = () => setStep(prev => prev + 1);
  const back = () => setStep(prev => Math.max(0, prev - 1));

  // 🎥 Matrix-symbol-animasjon
  useEffect(() => {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const symbols = 'π ∑ √ x y z 0 1 2 3 4 5 6 7 8 9 + - / * ='.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00f0ff';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = symbols[Math.floor(Math.random() * symbols.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={layout.container}>
      <canvas id="matrixCanvas" className={layout.matrixCanvas}></canvas>

      {step === 0 && (
        <div className={layout.welcome}>
          <div className={layout.welcomeContent}>
            <div className={layout.avatarWrapper}>
              <img
                src={avatarImage}
                alt="Mairim"
                className={layout.avatarLarge}
              />
            </div>
            <h1 style={{ textShadow: '0 0 8px #00f0ff' }}>Hei! Jeg er Mairim 👋</h1>
            <p style={{ color: '#ccc', fontSize: '16px' }}>
              Trykk under for å komme i gang med ditt budsjett.
            </p>
            <button onClick={next} className={layout.startButton}>Kom i gang</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <Step1Household profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 2 && (
        <Step2Income profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 3 && (
        <Step3Expenses profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 4 && (
        <Step4Goals profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 5 && (
        <Step5Summary profile={profile} onNext={next} onBack={back} />
      )}
      {step === 6 && (
        <Step6Budget profile={profile} setProfile={setProfile} onNext={next} onBack={back} />
      )}
      {step === 7 && (
        <BudgetDashboard profile={profile} setProfile={setProfile} />
      )}
    </div>
  );
}

export default OnboardingFlow;
