window.requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const pad = (num, size) => {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
};

window.onload = () => {
  // eslint-disable-next-line
  new Vue({
    el: '#app',
    data: {
      seconds: 0,
      minutes: 0,

      counterStarted: false,
      followMouseSeconds: false,
      followMouseMinutes: false,

    },
    computed: {
      getSeconds() {
        const time = this.seconds + this.minutes;
        return Math.floor(time % 60);
      },
      getMinutes() {
        const time = this.seconds + this.minutes;
        return Math.floor(time / 60);
      },
    },
    mounted() {
      this.drawCounter(this.$refs.secondsCircle, this.secondsColor);
      this.drawCounter(this.$refs.minutesCircle, this.minutesColor);
    },
    methods: {
      startCounter() {
        this.counterStarted = true;
        this.followMouseSeconds = false;
        this.followMouseMinutes = false;

        this.savedSeconds = this.seconds;
        this.savedMinutes = this.minutes;

        let time = this.seconds + this.minutes;

        const sub = () => {
          if (this.minutes > 0) {
            this.minutes -= 1;
          } else {
            this.seconds -= 1;
          }
          this.update(this.$refs.secondsCircle, this.getSeconds);
          this.update(this.$refs.minutesCircle, this.getMinutes);
          time = this.seconds + this.minutes;
          if (time <= 0) {
            this.playAlarm();
            clearInterval(this.intervalCounter);
            clearInterval(this.intervalText);
            this.infoMessage = 'Gotcha!';
          }
        };
        this.intervalCounter = setInterval(sub, 1000);
        sub();
      },
      pauseCounter() {
        this.counterStarted = false;
        clearInterval(this.intervalCounter);
      },
      stopCounter() {
        this.seconds = 0;
        this.minutes = 0;
        this.counterStarted = false;
        clearInterval(this.intervalCounter);
        this.update(this.$refs.secondsCircle, this.getSeconds);
        this.update(this.$refs.minutesCircle, this.getMinutes);
      },
      resetCounter() {
        this.seconds = this.savedSeconds;
        this.minutes = this.savedMinutes;
        this.counterStarted = false;
        clearInterval(this.intervalCounter);
        this.startCounter();
      },
      updateSecondsPosition(event) {
        const {
          time,
          seconds,
        } = this.getTime(event);

        this.drawCounter(event.target, this.secondsColor);
        this.setSeconds(time);

        requestAnimationFrame(() => {
          this.update(event.target, Math.floor(seconds));
        });
      },
      updateMinutesPosition(event) {
        const {
          time,
          seconds,
        } = this.getTime(event);

        this.drawCounter(event.target, this.minutesCircle);
        this.setMinutes(time);

        requestAnimationFrame(() => {
          this.update(event.target, Math.floor(seconds));
        });
      },
      getTime(event) {
        const canvas = event.target;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const mousePositionX = event.pageX - canvas.offsetLeft - (canvasWidth / 2);
        const mousePositionY = event.pageY - canvas.offsetTop - (canvasHeight / 2);


        let mAngle = Math.atan2(mousePositionY, mousePositionX);
        if (mAngle > -1 * Math.PI && mAngle < -0.5 * Math.PI) {
          mAngle = (2 * Math.PI) + mAngle;
        }

        const seconds = ((mAngle + (Math.PI / 2)) / 2) * Math.PI * 6.1;
        const time = Math.floor(seconds);

        return {
          time,
          seconds,
        };
      },
      drawCounter(canvas) {
        const ctx = canvas.getContext('2d');

        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgb(119, 131, 131)';
        ctx.font = '40px Lato';
        ctx.textBaseline = 'top';

        this.radiusCircle = 120;
        this.circumCircle = Math.PI * 2;
        this.startPosition = Math.PI / -2;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;

        requestAnimationFrame(() => {
          this.update(canvas, 0);
        });
      },
      update(canvas, currentPosition) {
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(119, 131, 131)';

        const endPosition = ((this.circumCircle * currentPosition) / 60) + this.startPosition;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgb(208, 218, 240)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radiusCircle, 0, this.circumCircle);
        ctx.stroke();

        ctx.strokeStyle = 'rgb(119, 131, 131)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radiusCircle, this.startPosition, endPosition, false);
        ctx.stroke();
        ctx.fillText(pad(currentPosition, 2), 125, 125);

        ctx.strokeStyle = 'rgb(119, 131, 131)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radiusCircle, endPosition, endPosition + 0.02, false);
        ctx.stroke();

        ctx.fillText(pad(currentPosition, 2), 125, 125);
      },
      changeInfoMessage() {
        let counterText = 0;
        this.intervalText = setInterval(() => {
          let counterDot = 0;
          const intervalDot = setInterval(() => {
            this.infoMessage += '.';
            counterDot += 1;
            if (counterDot >= 3) {
              clearInterval(intervalDot);
            }
          }, 1000);
          this.infoMessage = this.infoMessages[counterText];
          counterText += 1;
          if (counterText >= this.infoMessages.length) {
            counterText = 0;
          }
        }, 5000);
      },
      sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      },
      playAlarm() {
        const audio = new Audio('./assets/sound/alarm.mp3');
        audio.play();
      },
      setSeconds(seconds) {
        this.seconds = seconds;
      },
      setMinutes(minutes) {
        this.minutes = minutes * 60;
      },
    },
  });
};
