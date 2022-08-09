import { call, delay, put, takeEvery } from 'redux-saga/effects'

import {
   fetchBookingDataAction,
   fetchBookingActionSuccess,
   updateBookingAction
} from '../slices/bookingSlice';

import { API, API_URL } from '../../api/constAPI'

function getBookingDataFromAPI () {
   return API.get(`${API_URL}/bookings`).then(res => res.data)
   // return fetch(`${API_URL}/bookings`).then( res => res.json())
}

function* fetchBookingData () {
   try{
      const data = yield call(getBookingDataFromAPI)
      yield delay(500)
      yield put(fetchBookingActionSuccess(data))
   } catch (e){
      console.log("Error: ", e) 
   }
} 

function patchBookingData (change) {
   return API.patch(`${API_URL}/bookings`, change.payload.id, change.payload)
}

function* updateBookings (change) {
   try{  
      yield call(patchBookingData, change)
      yield delay(500)
      yield call(fetchBookingData)
   } catch (e) {
      console.log('Error: ', e)
   }
}

function* bookingSaga (){
   yield takeEvery(fetchBookingDataAction, fetchBookingData);
   yield takeEvery(updateBookingAction, updateBookings)
}

export { bookingSaga };