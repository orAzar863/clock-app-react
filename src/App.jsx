import { useState, useRef, useEffect } from 'react';
import './App.css'

const DEFAULT_BREAK = 5;
const DEFAULT_SESSION = 25;
const MAX_LENGTH = 60;
const MIN_LENGTH = 1;

const SESSION_LABEL = "Session";
const BREAK_LABEL = "Break";

function App() {

  const [breakLength, setBreakLength] = useState(DEFAULT_BREAK);
  const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION);
  const [timerLabel, setTimerLabel] = useState(SESSION_LABEL);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SESSION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSession, setIsSession] = useState(true);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  //transform to format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  //generic handler for break/session change length
  const handleBreakOrSessionChange = (type, delta) => {
    if (isRunning) return;
    const setter = (type === BREAK_LABEL) ? setBreakLength : setSessionLength;
    setter((prev) => {
      let next = prev + delta;
      if (next < MIN_LENGTH) next = MIN_LENGTH;
      if (next > MAX_LENGTH) next = MAX_LENGTH;
      return next;
    });
  };

  // Reset
  const handleReset = () => {
    setBreakLength(DEFAULT_BREAK);
    setSessionLength(DEFAULT_SESSION);
    setTimerLabel(SESSION_LABEL);
    setTimeLeft(DEFAULT_SESSION * 60);
    setIsRunning(false);
    setIsSession(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  //Start/Stop
  const handleStartStop = () => {
    setIsRunning((prev) => !prev);
  };

  useEffect(() => {
    //reset timer when timer is not running and session/break length changes
    if (!isRunning) {
      setTimeLeft(isSession ? sessionLength * 60 : breakLength * 60);
    }
  }, [sessionLength, breakLength, isSession]);

  //timer countdown effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) //switch between session and break
            {
              if (audioRef.current) {
                audioRef.current.play();
              }
              if (isSession) {
                setTimerLabel(BREAK_LABEL);
                setIsSession(false);
                return breakLength * 60;
              } else {
                setTimerLabel(SESSION_LABEL);
                setIsSession(true);
                return sessionLength * 60;
              }
            }
          return prev - 1;//decrement time
        });
      }, 1000);
    }
    //clean up when not running or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, breakLength, sessionLength, isSession]);

  return (
    <div className="App">
      <h1>Pomodoro Clock</h1>
      <div className="length-controls">
        <div className="break-control">
          <div id="break-label">Break Length</div>
          <button id="break-decrement" onClick={() => handleBreakOrSessionChange(BREAK_LABEL, -1)}>-</button>
          <span id="break-length">{breakLength}</span>
          <button id="break-increment" onClick={() => handleBreakOrSessionChange(BREAK_LABEL, 1)}>+</button>
        </div>
        <div className="session-control">
          <div id="session-label">Session Length</div>
          <button id="session-decrement" onClick={() => handleBreakOrSessionChange(SESSION_LABEL, -1)}>-</button>
          <span id="session-length">{sessionLength}</span>
          <button id="session-increment" onClick={() => handleBreakOrSessionChange(SESSION_LABEL, 1)}>+</button>
        </div>
      </div>
      <div className="timer">
        <div id="timer-label">{timerLabel}</div>
        <div id="time-left">{formatTime(timeLeft)}</div>
      </div>
      <div className="controls">
        <button id="start_stop" onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
        <button id="reset" onClick={handleReset}>Reset</button>
      </div>
      <audio
        id="beep"
        ref={audioRef}
        src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
        preload="auto"
      />
    </div>
  )
}

export default App
