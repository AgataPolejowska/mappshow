import logging
import pickle

import pandas as pd

from .constants import MONTH_NAMES, WAITING_DAYS_GROUPS, WEEKDAY_NAMES
from .data_models import AppointmentData


def map_age_group(age):
    logging.debug(f"Mapping age: {age}")
    age_group_map = {
        "0-1": 1,
        "2-5": 2,
        "6-10": 3,
        "11-15": 4,
        "16-25": 5,
        "26-32": 7,
        "33-42": 8,
        "43-52": 9,
        "53-115": 10,
    }
    for age_range, age_group in age_group_map.items():
        age_min, age_max = age_range.split("-")
        if age >= int(age_min) and age <= int(age_max):
            return age_group
    raise ValueError("Age out of range")


def create_df_instance(appointment_data, features_columns) -> pd.DataFrame:
    df_instance = pd.DataFrame(columns=features_columns)

    df_instance.loc[0] = [
        appointment_data.gender,
        appointment_data.has_hypertension,
        appointment_data.has_diabetes,
        appointment_data.has_alcoholism,
        appointment_data.has_handicap,
        appointment_data.sms_received,
        appointment_data.appointment_month,
        appointment_data.appointment_day_of_week,
        map_age_group(appointment_data.age),
        appointment_data.waiting_days_group,
    ]

    logging.debug(f"Created df instance:\n{df_instance}")

    return df_instance


def load_model(model_name: str) -> object:
    logging.debug(f"Loading model: {model_name}")
    return pickle.load(open(f"models/{model_name}.pkl", "rb"))


def get_result(model, df_instance) -> tuple:
    prediction = model.predict(df_instance)
    proba_show = round(model.predict_proba(df_instance)[0][1] * 100, 2)
    proba_not_show = round(model.predict_proba(df_instance)[0][0] * 100, 2)

    if prediction[0] == 1:
        prediction = "Yes"
    else:
        prediction = "No"

    return prediction, proba_show, proba_not_show


def create_patient_description(appointment_data: AppointmentData) -> str:
    """
    Given an instance of the AppointmentData model, returns a natural language
    description of the patient.
    """
    gender_str = "male" if appointment_data.gender == 0 else "female"
    age_str = f"{appointment_data.age} years old"
    hypertension_str = (
        "has hypertension"
        if appointment_data.has_hypertension
        else "does not have hypertension"
    )
    diabetes_str = (
        "has diabetes" if appointment_data.has_diabetes else "does not have diabetes"
    )
    alcoholism_str = (
        "has alcoholism"
        if appointment_data.has_alcoholism
        else "does not have alcoholism"
    )
    handicap_str = (
        "has a disability"
        if appointment_data.has_handicap
        else "does not have a disability"
    )
    waiting_days_group_str = f"has waited \
        {WAITING_DAYS_GROUPS[appointment_data.waiting_days_group]} for the appointment"
    sms_received_str = (
        "has received a reminder SMS"
        if appointment_data.sms_received
        else "has not received a reminder SMS"
    )
    appointment_month_str = MONTH_NAMES[appointment_data.appointment_month]
    appointment_day_of_week_str = WEEKDAY_NAMES[
        appointment_data.appointment_day_of_week
    ]

    description = (
        f"A {gender_str} patient who is {age_str} and {hypertension_str}. "
        f"The patient {diabetes_str}, {alcoholism_str}, and {handicap_str}. "
        f"The patient {waiting_days_group_str} and {sms_received_str}. "
        f"The appointment is scheduled for \
            {appointment_day_of_week_str}, {appointment_month_str}."
    )

    return description
