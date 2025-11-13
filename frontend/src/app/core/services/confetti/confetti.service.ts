import {Injectable} from '@angular/core';
import confetti from "canvas-confetti";

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  triggerConfetti() {
    const duration = 1500;
    const endTime = Date.now() + duration;
    const colors = ['#04A188', '#00C957', '#7FFFD4', '#FFFFFF', '#FFD700'];

    const confettiAnimationFrame = () => {
      const timeLeft = endTime - Date.now();

      void confetti({
        angle: 60,
        spread: 70,
        origin: {x: 0},
        colors: colors,
        particleCount: (timeLeft / duration) * 10,
      });

      void confetti({
        angle: 120,
        spread: 70,
        origin: {x: 1},
        colors: colors,
        particleCount: (timeLeft / duration) * 10,
      });

      if (Date.now() < endTime) {
        requestAnimationFrame(confettiAnimationFrame);
      }
    };

    confettiAnimationFrame();
  }
}
