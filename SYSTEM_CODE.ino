#include <EEPROM.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C LCD

// Moisture sensors
#define SOIL1 A0
#define SOIL2 A1
#define SOIL3 10
#define SOIL4 11

// Pump motor control
#define PUMP1_IN1 9
#define PUMP1_IN2 8
#define PUMP2_IN3 7
#define PUMP2_IN4 6
#define ENA 5
#define ENB 4

// Flow sensors
#define FLOW1 2
#define FLOW2 3

// EEPROM
#define DRY_ADDR 0
#define WET_ADDR 2

// Variables
volatile int flow1Count = 0;
volatile int flow2Count = 0;
int dryThreshold = 500;
int wetThreshold = 700;
bool spraying = false;
bool irrigating = false;
String currentStatus = "Idle";

// LCD switching
unsigned long lastDisplaySwitch = 0;
bool showMoisture = true;

void flow1ISR() { flow1Count++; }
void flow2ISR() { flow2Count++; }

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.backlight();

  pinMode(SOIL1, INPUT);
  pinMode(SOIL2, INPUT);
  pinMode(SOIL3, INPUT);
  pinMode(SOIL4, INPUT);

  pinMode(PUMP1_IN1, OUTPUT);
  pinMode(PUMP1_IN2, OUTPUT);
  pinMode(PUMP2_IN3, OUTPUT);
  pinMode(PUMP2_IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);

  pinMode(FLOW1, INPUT_PULLUP);
  pinMode(FLOW2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW1), flow1ISR, RISING);
  attachInterrupt(digitalPinToInterrupt(FLOW2), flow2ISR, RISING);

  dryThreshold = EEPROM.read(DRY_ADDR);
  wetThreshold = EEPROM.read(WET_ADDR);

  if (dryThreshold < 200 || dryThreshold > 1023) dryThreshold = 500;
  if (wetThreshold < 200 || wetThreshold > 1023) wetThreshold = 800;

  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  Serial.println("System Ready");
}

void loop() {
  handleBluetooth();

  if (!spraying) {
    int m1 = analogRead(SOIL1);
    int m2 = analogRead(SOIL2);
    int m3 = digitalRead(SOIL3) ? 1023 : 0;
    int m4 = digitalRead(SOIL4) ? 1023 : 0;
    int avg = (m1 + m2 + m3 + m4) / 4;

    if (avg < dryThreshold && !irrigating) {
      irrigating = true;
      startPump1();
      currentStatus = "Irrigating";
      Serial.println("Irrigation Started");
    } else if (avg > wetThreshold && irrigating) {
      stopPump1();
      irrigating = false;
      currentStatus = "Stopped";
      Serial.println("Irrigation Stopped");
    }

    updateLCD(avg);
  }

  delay(100);
}

void updateLCD(int moistureVal) {
  if (millis() - lastDisplaySwitch > 2000) {
    lcd.clear();
    if (showMoisture) {
      lcd.setCursor(0, 0);
      lcd.print("Moisture: ");
      lcd.print(moistureVal);
      lcd.setCursor(0, 1);
      if (moistureVal > wetThreshold) lcd.print("Wet");
      else if (moistureVal < dryThreshold) lcd.print("Dry");
      else lcd.print("Normal");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Status:");
      lcd.setCursor(0, 1);
      lcd.print(currentStatus);
    }
    showMoisture = !showMoisture;
    lastDisplaySwitch = millis();
  }
}

void handleBluetooth() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "pest") {
      spraying = true;
      irrigating = false;
      stopPump1();
      currentStatus = "Pesticide";
      Serial.println("Pesticide Motor Running");
      startPump2();
      delay(5000);
      stopPump2();
      spraying = false;
      currentStatus = "Idle";
      Serial.println("Pesticide Complete");
    }

    else if (cmd == "F") {
      spraying = true;
      irrigating = false;
      stopPump1();
      currentStatus = "Spraying";
      Serial.println("Spraying Started");
      flow1Count = 0;
      flow2Count = 0;
      startPump1();
      startPump2();
      while (flow1Count < 1000 && flow2Count < 200) {
        lcd.setCursor(0, 0);
        lcd.print("Spraying");
        lcd.setCursor(0, 1);
        lcd.print("W:");
        lcd.print(flow1Count);
        lcd.print(" C:");
        lcd.print(flow2Count);
        delay(500);
      }
      stopPump1();
      stopPump2();
      spraying = false;
      currentStatus = "Idle";
      Serial.println("Spraying Complete");
    }

    else if (cmd == "S") {
      spraying = false;
      irrigating = false;
      stopPump1();
      stopPump2();
      currentStatus = "Stopped";
      Serial.println("System Stopped");
    }

    else if (cmd == "I") {
      startPump1();
      currentStatus = "Manual Irrigate";
      Serial.println("Manual Pump1 On");
    }

    else if (cmd == "X") {
      stopPump1();
      currentStatus = "Pump1 Off";
      Serial.println("Manual Pump1 Off");
    }

    else if (cmd == "Y") {
      startPump2();
      currentStatus = "Fert ON";
      Serial.println("Fertilizer Pump ON");
    }

    else if (cmd == "Z") {
      stopPump2();
      currentStatus = "Fert OFF";
      Serial.println("Fertilizer Pump OFF");
    }

    else if (cmd.startsWith("D")) {
      dryThreshold = cmd.substring(1).toInt();
      EEPROM.write(DRY_ADDR, dryThreshold);
      Serial.print("Dry set to ");
      Serial.println(dryThreshold);
    }

    else if (cmd.startsWith("W")) {
      wetThreshold = cmd.substring(1).toInt();
      EEPROM.write(WET_ADDR, wetThreshold);
      Serial.print("Wet set to ");
      Serial.println(wetThreshold);
    }
  }
}

void startPump1() {
  digitalWrite(PUMP1_IN1, HIGH);
  digitalWrite(PUMP1_IN2, LOW);
  analogWrite(ENA, 200);
}

void stopPump1() {
  digitalWrite(PUMP1_IN1, LOW);
  digitalWrite(PUMP1_IN2, LOW);
}

void startPump2() {
  digitalWrite(PUMP2_IN3, HIGH);
  digitalWrite(PUMP2_IN4, LOW);
  analogWrite(ENB, 200);
}

void stopPump2() {
  digitalWrite(PUMP2_IN3, LOW);
  digitalWrite(PUMP2_IN4, LOW);
}
