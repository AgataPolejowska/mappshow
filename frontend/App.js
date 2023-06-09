import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { KeyboardAvoidingView, Platform, Dimensions } from 'react-native';

import DayOfWeekSelector from './components/DaySelector';
import MonthSelector from './components/MonthSelector';
import Checkbox from './components/Checkbox';
import SMSReminderSwitch from './components/Switch';
import AgeInput from './components/AgeInput';
import AwaitTimePicker from './components/AwaitTimePicker';
import GenderSelector from './components/GenderSelector';
import AppointmentPredictionModal from './components/Modal';

import { styles } from './styles/styles';
import { selector_style } from './styles/selector';

const IP_ADDRESS = "192.168.1.52";
const API_URL = `http://${IP_ADDRESS}:8080/appointment`;

export default function App() {
  const [gender, setGender] = useState(0);
  const [age, setAge] = useState(0);
  const [hypertension, setHypertension] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [alcoholism, setAlcoholism] = useState(false);
  const [handicap, setHandicap] = useState(false);

  const [waitingDays, setWaitingDays] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [smsReceived, setSmsReceived] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [summary, setSummary] = useState(0);

  const handleSubmit = async () => {
    const appointmentData = {
      gender: parseInt(gender),
      age: parseInt(age),
      has_hypertension: hypertension,
      has_diabetes: diabetes,
      has_alcoholism: alcoholism,
      has_handicap: handicap,
      waiting_days_group: parseInt(waitingDays),
      sms_received: smsReceived,
      appointment_month: parseInt(selectedMonth),
      appointment_day_of_week: parseInt(selectedDay)
    };

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setSummary(data);
      setModalIsOpen(true);
    })
    .catch(error => {
      console.error(error);
      // handle errors
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null} // remove preventScroll prop
    >
    
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={true}>
    <Text style={styles.main_title}>Medical appointment patient show up prediction</Text>

      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
        <View>
          <Text style={{width: 100, textAlign: 'center'}}>Appointment Information</Text>
        </View>
        <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
      </View>
        <View style={styles.container}>

        <DayOfWeekSelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
        <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        <View style={styles.formGroup}>
          <Text style={selector_style.label}>Input the number of appointment awaiting days and check if the patient received a SMS reminder:</Text>
          <AwaitTimePicker value={waitingDays} onChange={setWaitingDays} />
        </View>
        <View style={styles.formGroup}>
          <SMSReminderSwitch onChange={setSmsReceived} />
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
        <View>
          <Text style={{width: 100, textAlign: 'center'}}>Patient Information</Text>
        </View>
        <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
      </View>

        <View style={styles.formGroupPatient}>
          <AgeInput age={age} setAge={setAge} />
          <GenderSelector gender={gender} setGender={setGender}/>
        </View>

        <View style={styles.formGroup}>
          <Text style={selector_style.label}>What is the patient's condition? Select multiple if necessary:</Text>
          <Checkbox label="Diabetes" value={diabetes} onChange={setDiabetes} />
          <Checkbox label="Alcoholism" value={alcoholism} onChange={setAlcoholism} />
          <Checkbox label="Hypertension" value={hypertension} onChange={setHypertension} />
          <Checkbox label="Handicap" value={handicap} onChange={setHandicap} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <AppointmentPredictionModal summary={summary} modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />

      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
