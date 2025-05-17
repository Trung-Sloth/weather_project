from django.shortcuts import render

# Create your views here.
import requests
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from datetime import datetime, timedelta
import tensorflow as tf
import pytz
import joblib
import os

API_KEY='c10735208c8617f07e9dadb5230018c5'
BASE_URL='https://api.openweathermap.org/data/2.5/' #base URL for making API request

firebaseURL="https://bme680-1-63c67-default-rtdb.asia-southeast1.firebasedatabase.app/bme680/latest.json"
locationURL="https://map-1-b0eae-default-rtdb.asia-southeast1.firebasedatabase.app/Toa-do-hien-tai.json"
model_dir = r"weather_project/forecast/Model_weather/Model_weather"


#1. Fetch Current Weather Data
def get_input_data_from_sensors():
    response=requests.get(firebaseURL)
    data = response.json()
    if response.status_code != 200:
      print(f"Error fetching weather data : {data.get('message', 'Unknown error')}")
      return None  # Or raise an exception
    humidity=float(data['humidity'])
    pressure=float(data['pressure'])
    temperature=float(data['temperature'])

    pressure=round(pressure,1)
    temperature=round(temperature,1)
    # timestamp=para.get("timestamp")
    # list_para=[humidity,pressure,temperature,timestamp]
    list_para=[temperature,humidity,pressure]
    my_para=np.array(list_para)

    return my_para.reshape(1,3)


def get_current_data_from_sensors(city):
    response=requests.get(firebaseURL)
    data = response.json()
    if response.status_code != 200:
      print(f"Error fetching weather data : {data.get('message', 'Unknown error')}")
      return None  # Or raise an exception
    humidity=float(data['humidity'])
    pressure=float(data['pressure'])
    temperature=float(data['temperature'])

    pressure=round(pressure,1)
    temperature=round(temperature,1)
    timestamp=data['timestamp']

    #Data from web

    url=f"{BASE_URL}weather?q={city}&appid={API_KEY}&units=metric" #construct the API request URL
    response=requests.get(url) #send the get request to API
    data=response.json() #parse the response to JSON format
    # Check if the API call was successful
    if response.status_code != 200:
      print(f"Error fetching weather data for {city}: {data.get('message', 'Unknown error')}")
      return None  # Or raise an exception

    # Check if the 'name' key exists in the response
    if 'name' not in data:
      print(f"City '{city}' not found in the weather database.")
      return None  # Or raise an exception

    return {
        'temp': temperature,
        'hum' :humidity,
        'pressure':pressure,
        'time':timestamp,

        # # From web
        # 'city': data['name'],
        # 'current_temp':round(data['main']['temp']),
        # 'feels_like':round(data['main']['feels_like']),
        # 'temp_min':round(data['main']['temp_min']),
        # 'temp_max':round(data['main']['temp_max']),
        # 'humidity':round(data['main']['humidity']),
        'description':data['weather'][0]['description'],
        # 'country':data['sys']['country'],
        # 'wind_gust_dir':data['wind']['deg'],
        # 'pressure':data['main']['pressure'],
        # 'Wind_Gust_Speed':data['wind']['speed'],

        # 'clouds':data['clouds']['all'],
        # 'Visibility': data['visibility'],
    }
def get_location():
    response=requests.get(locationURL)
    data = response.json()
    lat_cur=round(float(data['lat_cur']),2)
    lng_cur=round(float(data['lng_cur']),2)

    return lat_cur, lng_cur


#2. Load model 
def load_model(feature):
    match feature:
        case 'temp':
            model = []
            for i in range(5):
                model_path_temp = os.path.join(model_dir, f"model_temp_{i+1}h.pkl")
                model_temp = joblib.load(model_path_temp)
                model.append(model_temp)
        case 'hum':
            model = []
            for i in range(5):
                model_path_hum = os.path.join(model_dir, f"model_hum_{i+1}h.pkl")
                model_hum = joblib.load(model_path_hum)
                model.append(model_hum)
        case 'rain':
            model_path_rain = os.path.join(model_dir, "model_rain.pkl")
            model = joblib.load(model_path_rain)
            print(model_path_rain)
    return model
#3.Predict Future
def predict_future(model_predict,current_value):
    pred_future_list=[]
    for model in model_predict:
        pred = model.predict(current_value)
        pred_future_list.append(pred)
    pred_future_list=np.array(pred_future_list)
    return pred_future_list

#Weather Analystz Function

def weather_view(request):
    if request.method=='POST':
        city='Thu Duc'
        country='Viet Nam'
        input_para=get_input_data_from_sensors()

        # Get current data
        current_weather=get_current_data_from_sensors(city)

        # Load model
        rain_model=load_model('rain')
        temp_predict_model=load_model('temp')
        hum_predict_model=load_model('hum')

        # rain prediction
        rain_prediction=rain_model.predict_proba(input_para)[:, 1]
        percent_rain=rain_prediction[0]*100

        # predict future humidity and temperature
        future_temp=predict_future(temp_predict_model,input_para)
        future_hum= predict_future(hum_predict_model,input_para)

        #prepare time for future predictions

        # timezone=pytz.timezone('Asia/Ho_Chi_Minh')
        # now=datetime.now(timezone)
        # next_hour =now+timedelta(hours=1)
        time_now = datetime.strptime(current_weather['time'], "%d/%m/%Y  %H:%M:%S")
        next_hour =time_now+timedelta(hours=1)
        next_hour = next_hour.replace(minute=0, second=0, microsecond=0)

        future_times=[(next_hour+timedelta(hours=i)).strftime("%H:00") for i in range(5)]

         #store each value seperately

        time1, time2, time3, time4, time5 = future_times

        future_temp= [round(x[0], 1) for x in future_temp]
        temp1, temp2, temp3, temp4, temp5 = future_temp

        future_hum= [round(x[0], 1) for x in future_hum]
        hum1, hum2, hum3, hum4, hum5 = future_hum

        # longitude and latitude
        latitude, longitude=get_location()
        # Pass data to template

        context={
            'location': city,
            'country': country,
            'current_temp': current_weather['temp'],
            'humidity': current_weather['hum'],
            'pressure': current_weather['pressure'],
            'description':current_weather['description'],

            'rainfall':f"{int(round(percent_rain,0))}",

            'longitude':longitude,
            'latitude':latitude,

            # 'time': datetime.now(),
            'time': time_now,
            'date': datetime.now().strftime("%B %d, %Y"),

            

            'time1':time1,
            'time2':time2,
            'time3':time3,
            'time4':time4,
            'time5':time5,

            'temp1':temp1,
            'temp2':temp2,
            'temp3':temp3,
            'temp4':temp4,
            'temp5':temp5,

            'hum1':hum1,
            'hum2':hum2,
            'hum3':hum3,
            'hum4':hum4,
            'hum5':hum5,
            
        }

        return render(request,'weather.html',context)
    return render(request, 'weather.html') 