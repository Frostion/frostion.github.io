#include <TimerOne.h>

//pin declarations
#define SW_HOLD 7
#define SW_RAND 8
#define SW_SNAP 9
#define LED_SNAP 10
#define PIN_SPKR 6
#define POT_TEMPO A4
#define POT_GATE A5
const byte POTS[4] = {A0,A1,A2,A3};
const byte LEDS[4] = {2,3,4,5};
//cutoff for silencing a note
#define POT_CUTOFF 12
#define MAX_POTVAL 1020
//maximum and minimum time amounts, all in milliseconds
#define MAX_TEMPO 1000
#define MIN_TEMPO 4
#define MIN_GATE 1
//minimum and maximum pitch, in Hz
//#define MAX_PITCH 2000
//#define MIN_PITCH 32
#define MAX_PITCH getNotePitch(MAX_NOTE)
#define MIN_PITCH getNotePitch(MIN_NOTE)
//minimum and maximum notes, in arbitrary (yay) note numbers
#define MIN_NOTE 5
#define MAX_NOTE 42
//note frequencies of C Minor scale, in Hz
const float notes[7] = {32.7,36.71,38.9,43.65,49,51.91,58.27};
//wavetable for vibrato
#define SINE_LENGTH 256
float sinewave[SINE_LENGTH];
uint32_t vib_phaseacc = 0;
uint32_t vib_increment = 0;
float vib_pitch = 5;
float vib_value = 0;
//pwm stuff
uint32_t pwm_phaseacc = 0;
uint32_t pwm_increment = 0;
float pwm_pitch = 0.5;
float pwm_value = 0;
byte pwm = 50;
//wavetable for square wave created
#define SQR_LENGTH 256
byte squarewave[SQR_LENGTH];
uint32_t sqr_phaseacc = 0;
uint32_t sqr_increment = 0;
unsigned int pitch[4] = {100,100,100,100};
byte sqr_value = 0;

unsigned int raw_timerfreq = pow(2,15);
unsigned int timerfreq_mod = 0;
unsigned int timerfreq = raw_timerfreq;
byte curstep = 0;
byte playnote;
unsigned int tempo,gatetime;
byte snap = 0;
byte setmode = 0;
byte makesound[4] = {0,0,0,0};
byte soundenabled = 1;
byte pwmenv = 0;
byte retrig = 0;
byte retrigarp = 1;
byte vibratoint = 0;
byte pwmint = 22;

void setup()
{
  //calculate sine wavetable
  for(int i = 0; i <= SINE_LENGTH - 1; i++)
  {
    //sinewave[i] = sin((2 * PI) * (float(i) / float(SINE_LENGTH)));
    //this will actually be triangle because it sounds better
    if(i < (SINE_LENGTH / 2)) { sinewave[i] = map(i,0,SINE_LENGTH / 2,-100,100) / 100.0; }
    else { sinewave[i] = map(i,SINE_LENGTH / 2,SINE_LENGTH,100,-100) / 100.0; }
  }
  
  setPulseWidth(50); //50% pulse width makes for a standard-sounding square wave
  //set pin modes for buttons and leds
  pinMode(SW_HOLD,INPUT_PULLUP);
  pinMode(SW_RAND,INPUT_PULLUP);
  pinMode(SW_SNAP,INPUT_PULLUP);
  pinMode(LED_SNAP,OUTPUT);
  pinMode(PIN_SPKR,OUTPUT);
  for(byte i = 0; i <= 3; i++) { pinMode(LEDS[i],OUTPUT); }
  //cool startup animation
  for(int i = 3; i >= 0; i--) { digitalWrite(LEDS[i],1); delay(100); }
  for(int i = 3; i >= 1; i--) { digitalWrite(LEDS[i],0); delay(100); }
  //initialize sample-rate interrupt
  Timer1.initialize(HzToPeriod(timerfreq,1));
  Timer1.attachInterrupt(updateWave);

  //this function contains all the code for getting the values of the front panel pots
  getPotValues();
}

void loop()
{
  //loop for playing the same note multiple times (retrig)
  for(byte curtrig = 0; curtrig <= retrig; curtrig++)
  {
    //start playing the note
    enableSound(makesound[curstep]);
  
    //turn on the LED for this sequence step
    if(!setmode) { setStepLED(curstep,1); }
    
    //wait for the amount of time specified by the tempo pot before advancing
    unsigned long starttime = millis();
    while(millis() - starttime < tempo)
    {
      //update pot values in realtime
      getPotValues();
      
      //find current position of square wave and adjust sound for vibrato
      sqr_increment = pow(2,32) / timerfreq * ((pitch[curstep] * pow(2,curtrig * retrigarp)) + (vib_value * vibratoint));
  
      //find current position of vibrato wave
      vib_increment = pow(2,32) / timerfreq * vib_pitch;

      //find current position of pwm wave
      pwm_increment = pow(2,32) / timerfreq * pwm_pitch;
  
      //set pulse width of tone
      if(pwm > 0) { setPulseWidth(pwm); }
      else { setPulseWidth(50 + ((pwm_value + 1.0) * pwmint)); }
      
      //turn off step LED and tone generation once the gate time has finished
      if(millis() - starttime > gatetime)
      {
        setStepLED(curstep,0);
        enableSound(0);
      }
      else
      {
        //constantly recheck if the sound should play because the pots could be turned down at any point
        enableSound(makesound[curstep]);
      }
      
      //if the snap button is pressed
      if(getButton(SW_SNAP) && !setmode)
      {
        //wait for it to be released
        while(getButton(SW_SNAP))
        {
          delay(5);
          //if the rand button is pressed, enter setup mode
          if(getButton(SW_RAND)) { setmode = 1; break; }
        }
        //upate snap state and LED
        if(!setmode) { snap = !snap; } 
      }

      //exit setup mode when all buttons are released
      if(!getButton(SW_SNAP) && !getButton(SW_RAND) && setmode) { setmode = 0; }
  
      //update snap LED
      if(setmode) { digitalWrite(LED_SNAP,millis() % 200 > 130); }
      else { digitalWrite(LED_SNAP,snap); }
  
      //if both hold and rand are pressed, advance the sequence by 1 step
      if(getButton(SW_HOLD) && getButton(SW_RAND) && !setmode)
      {
        //wait for rand button to be released
        while(getButton(SW_RAND)) { delay(5); }
        //advance the sequence
        digitalWrite(LEDS[curstep],0);
        curstep++;
        if(curstep > 3) { curstep = 0; }
        break;
      }
    }
  }
  //if the hold button is not active, advance the sequence count
  if(!getButton(SW_HOLD))
  {
    //if the RAND button is pressed, jump to a random state
    if(getButton(SW_RAND) && !setmode)
    {
      curstep = random(4);
    }
    //if no buttons are pressed, advance to the next step normally
    else
    {
      curstep++;
      if(curstep > 3) { curstep = 0; }
    }
  }
}

byte getButton(byte b)
{
  return !digitalRead(b); //because pullup resistors are used, the result must be inverted so that a true = pressed
  //return 0;
}


unsigned int getNotePitch(byte note)
{
  return notes[note % 7] * pow(2,note / 7);
}

void setStepLED(byte led,byte state)
{
  for(byte i = 0; i <= 3; i++)
  {
    digitalWrite(LEDS[i],i == led && state);
  }
}

void setStepLEDRaw(byte led,byte state)
{
  digitalWrite(LEDS[led],state);
}

void getPotValues()
{
  if(setmode)
  {
    //get value for pulsewidth envelope intensity
    pwm = map(constrain(analogRead(POTS[0]),0,MAX_POTVAL / 2),0,MAX_POTVAL / 2,50,0);
    pwm_pitch = map(constrain(analogRead(POTS[0]),MAX_POTVAL / 2 + 1,MAX_POTVAL),MAX_POTVAL / 2 + 1,MAX_POTVAL,1,400) / 100.0;
    setStepLEDRaw(0,pwm == 0);

    //get value for vibrato intensity
    vibratoint = map(constrain(analogRead(POTS[1]),0,MAX_POTVAL),0,MAX_POTVAL,0,10);
    vib_pitch = map(constrain(analogRead(POTS[1]),0,MAX_POTVAL),0,MAX_POTVAL,40,100) / 10.0;
    setStepLEDRaw(1,vibratoint != 0);

    //get number of times the note should retrigger (0 to 3 times)
    retrig = map(constrain(analogRead(POTS[2]),0,MAX_POTVAL),0,MAX_POTVAL,0,3);
    setStepLEDRaw(2,retrig != 0);

    //get whether the retriggered notes should shift up in pitch
    timerfreq_mod = map(constrain(analogRead(POTS[3]),0,MAX_POTVAL - 50),0,MAX_POTVAL - 50,raw_timerfreq - 100,0);
    setStepLEDRaw(3,timerfreq_mod != 0);
    timerfreq = raw_timerfreq - timerfreq_mod;
    Timer1.setPeriod(HzToPeriod(timerfreq,1));
  }
  else
  {
    //get pitch of current note
    if(snap)
    {
      //if note snap is turned on, get the pitch of the note from the list of C Minor notes
      pitch[curstep] = getNotePitch(map(constrain(analogRead(POTS[curstep]),0,MAX_POTVAL),POT_CUTOFF,MAX_POTVAL,MIN_NOTE,MAX_NOTE));
    }
    else
    {
      //if note snap is not turned on, get the pitch directly from the pot value with no snapping
      pitch[curstep] = map(constrain(analogRead(POTS[curstep]),0,MAX_POTVAL),POT_CUTOFF,MAX_POTVAL,MIN_PITCH,MAX_PITCH);
    }

    for(byte i = 0; i <= 3; i++)
    {
      //if the pot is turned below the cutoff value, the note won't sound
      makesound[i] = analogRead(POTS[i]) >= POT_CUTOFF;
    }
  }
  
  //get values of tempo and gate time pots
  tempo = map(constrain(analogRead(POT_TEMPO),0,MAX_POTVAL),0,MAX_POTVAL,MAX_TEMPO,MIN_TEMPO);
  gatetime = map(constrain(analogRead(POT_GATE),0,MAX_POTVAL),0,MAX_POTVAL,MIN_GATE,tempo);
}

void enableSound(byte enabled)
{
  soundenabled = enabled;
}

void setPulseWidth(byte percent)
{
  byte width = map(percent,0,100,0,SQR_LENGTH);
  for(int i = 0; i <= SQR_LENGTH - 1; i++)
  {
    squarewave[i] = width < i;
  }
}

unsigned int HzToPeriod(float hz,float multiply)
{
  return (unsigned int)((1.0 / (hz * multiply)) * 1000000.0);
}

void updateWave()
{
  sqr_phaseacc += sqr_increment;
  sqr_value = squarewave[sqr_phaseacc >> 24];

  vib_phaseacc += vib_increment;
  vib_value = sinewave[vib_phaseacc >> 24];

  pwm_phaseacc += pwm_increment;
  pwm_value = sinewave[pwm_phaseacc >> 24];

  speakerOut(PIN_SPKR,sqr_value * soundenabled);
}

void speakerOut(byte pin,byte value)
{
  bitWrite(PORTD,pin,value);
}

